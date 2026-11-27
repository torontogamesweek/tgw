#!/usr/bin/env python3
"""Convert a TGW schedule CSV (like 2026/schedule-data.csv) to an ICS calendar.

Usage: python csv_to_ics.py schedule-data.csv [-o output.ics] [--tz America/Toronto]

Events with Status "cancelled" are skipped. Date comes from "Column 4"
(YYYY-MM-DD); times from "Event Start Time"/"Event End Time" (HH:MM[:SS]),
interpreted as local time in the given timezone.
"""
import argparse
import csv
import hashlib
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Columns that must exist in the CSV header; other columns are optional.
REQUIRED = ["Event Name", "Column 4", "Event Start Time", "Event End Time"]
# VTIMEZONE definitions so calendar apps know the DST rules for the TZID used in events.
# Timezones not listed here are still written as TZID and most apps resolve them by name.
TZ_BLOCK = {
    "America/Toronto": [
        "BEGIN:VTIMEZONE",
        "TZID:America/Toronto",
        "BEGIN:DAYLIGHT",
        "TZOFFSETFROM:-0500",
        "TZOFFSETTO:-0400",
        "TZNAME:EDT",
        "DTSTART:19700308T020000",
        "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
        "END:DAYLIGHT",
        "BEGIN:STANDARD",
        "TZOFFSETFROM:-0400",
        "TZOFFSETTO:-0500",
        "TZNAME:EST",
        "DTSTART:19701101T020000",
        "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
        "END:STANDARD",
        "END:VTIMEZONE",
    ]
}


def escape(text):
    # ICS text values must escape backslash, semicolon and comma; newlines become literal "\n".
    return (
        text.replace("\\", "\\\\")
        .replace(";", "\\;")
        .replace(",", "\\,")
        .replace("\r\n", "\n")
        .replace("\r", "\n")
        .replace("\n", "\\n")
    )


def fold(line):
    """Fold to 75 octets per RFC 5545 without splitting UTF-8 characters."""
    out, cur, size = [], "", 0
    for ch in line:
        n = len(ch.encode("utf-8"))
        if size + n > 75:
            out.append(cur)
            cur, size = " ", 1
        cur += ch
        size += n
    out.append(cur)
    return "\r\n".join(out)


def parse_time(value):
    # Accepts "20:00:00" or "20:00".
    value = value.strip()
    for fmt in ("%H:%M:%S", "%H:%M"):
        try:
            return datetime.strptime(value, fmt).time()
        except ValueError:
            pass
    raise ValueError(f"bad time {value!r}")


def build_event(row, tz, stamp):
    """Turn one CSV row into a list of VEVENT lines. Raises ValueError on bad dates/times."""
    name = row["Event Name"].strip()
    day = datetime.strptime(row["Column 4"].strip(), "%Y-%m-%d").date()
    start = datetime.combine(day, parse_time(row["Event Start Time"]))
    end = datetime.combine(day, parse_time(row["Event End Time"]))
    if end <= start:  # event runs past midnight
        end += timedelta(days=1)

    venue = (row.get("Venue Name") or "").strip()
    address = (row.get("Address") or "").strip()
    location = ", ".join(p for p in (venue, address) if p)

    # Build the description from whichever optional fields are filled in.
    desc = []
    for label, key in (
        ("", "Short Event Description"),
        ("Dates/times", "Complicated dates/times?"),
        ("Price", "Price"),
        ("Registration", "Registration"),
        ("Link", "Event link"),
        ("Map", "Address Link"),
    ):
        val = (row.get(key) or "").strip()
        if val:
            desc.append(f"{label}: {val}" if label else val)

    # Deterministic UID: re-importing an updated file updates events instead of duplicating them.
    uid_src = f"{name}|{start.isoformat()}|{venue}"
    uid = hashlib.sha1(uid_src.encode("utf-8")).hexdigest() + "@torontogamesweek.com"
    fmt = "%Y%m%dT%H%M%S"
    lines = [
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{stamp}",
        f"DTSTART;TZID={tz}:{start.strftime(fmt)}",
        f"DTEND;TZID={tz}:{end.strftime(fmt)}",
        f"SUMMARY:{escape(name)}",
    ]
    if location:
        lines.append(f"LOCATION:{escape(location)}")
    if desc:
        lines.append(f"DESCRIPTION:{escape(chr(10).join(desc))}")
    url = (row.get("Event link") or "").strip()
    if url.startswith("http"):
        lines.append(f"URL:{url}")
    lines.append("END:VEVENT")
    return lines


def convert(csv_path, ics_path, tz="America/Toronto"):
    """Convert csv_path to ics_path. Returns (events_written, skipped_messages)."""
    # utf-8-sig strips a BOM if the CSV was exported from Excel/Sheets.
    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        missing = [c for c in REQUIRED if c not in (reader.fieldnames or [])]
        if missing:
            raise ValueError(f"CSV is missing required columns: {', '.join(missing)}")
        rows = list(reader)

    # Calendar header, then one VEVENT per usable row, then the footer.
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Toronto Games Week//Schedule//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:Toronto Games Week",
        f"X-WR-TIMEZONE:{tz}",
    ]
    lines += TZ_BLOCK.get(tz, [])
    count, skipped = 0, []
    for i, row in enumerate(rows, start=2):  # start=2: row 1 is the header
        if (row.get("Status") or "").strip().lower() == "cancelled":
            skipped.append(f"row {i}: cancelled ({row.get('Event Name', '').strip()})")
            continue
        try:
            lines += build_event(row, tz, stamp)
            count += 1
        except (ValueError, KeyError) as e:
            skipped.append(f"row {i}: {e}")
    lines.append("END:VCALENDAR")

    # ICS requires CRLF line endings, so newline="" stops Python translating them.
    with open(ics_path, "w", newline="", encoding="utf-8") as f:
        f.write("".join(fold(l) + "\r\n" for l in lines))
    return count, skipped


def main(argv=None):
    """Command-line entry point; returns a process exit code (0 ok, 1 error)."""
    p = argparse.ArgumentParser(description="Convert a schedule CSV to an ICS file.")
    p.add_argument("csv_file", help="input CSV formatted like 2026/schedule-data.csv")
    p.add_argument("-o", "--output", help="output .ics path (default: this script's folder)")
    p.add_argument("--tz", default="America/Toronto", help="IANA timezone of event times")
    args = p.parse_args(argv)

    src = Path(args.csv_file)
    if not src.is_file():
        print(f"Error: file not found: {src}", file=sys.stderr)
        return 1
    out = Path(args.output) if args.output else Path(__file__).resolve().parent / (src.stem + ".ics")
    try:
        count, skipped = convert(src, out, args.tz)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    for s in skipped:
        print(f"Skipped {s}", file=sys.stderr)
    print(f"Wrote {count} events to {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
