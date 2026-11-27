"""Run with: python test_csv_to_ics.py"""
import tempfile
import unittest
from pathlib import Path

import csv_to_ics

# A trimmed version of the real schedule-data.csv header (only the columns the script reads).
HEADER = ('"Status","Timestamp","Event Name","Column 4","Event Date(s)","Venue Name",'
          '"Address","Event Start Time","Event End Time","Complicated dates/times?",'
          '"Target Audience","Short Event Description","Long event description",'
          '"The hook!","Price","Registration","Event link"')
# Row 1: valid event with a comma and semicolon/newline to test escaping.
# Row 2: cancelled (should be skipped). Row 3: invalid date (should be skipped).
ROWS = [
    '"complete","2026-04-16 12:19:20","Kickoff, Party","2026-06-11","Thursday June 11",'
    '"Canada Malting Silos","9 Eireann Quay","20:00:00","23:00:00","","Community",'
    '"Line one;\nline two","","","Free","","https://example.com/a"',
    '"cancelled","x","Cancelled Thing","2026-06-12","Fri","V","A","10:00:00","11:00:00",'
    '"","","d","","","","",""',
    '"complete","x","Bad Date","not-a-date","Fri","V","A","10:00:00","11:00:00",'
    '"","","d","","","","",""',
]


class CsvToIcsTest(unittest.TestCase):
    def convert(self, rows):
        # Helper: write rows to a temp CSV, convert, and return (count, skipped, ics_text).
        tmp = Path(tempfile.mkdtemp())
        src, out = tmp / "s.csv", tmp / "s.ics"
        src.write_text("\n".join([HEADER] + rows), encoding="utf-8")
        count, skipped = csv_to_ics.convert(src, out)
        return count, skipped, out.read_bytes().decode("utf-8")

    def test_converts_valid_event_and_skips_others(self):
        count, skipped, ics = self.convert(ROWS)
        self.assertEqual(count, 1)
        self.assertEqual(len(skipped), 2)
        self.assertTrue(ics.startswith("BEGIN:VCALENDAR\r\n"))
        self.assertTrue(ics.endswith("END:VCALENDAR\r\n"))
        self.assertEqual(ics.count("BEGIN:VEVENT"), 1)
        self.assertIn("DTSTART;TZID=America/Toronto:20260611T200000", ics)
        self.assertIn("DTEND;TZID=America/Toronto:20260611T230000", ics)
        self.assertIn("SUMMARY:Kickoff\\, Party", ics)
        self.assertIn("LOCATION:Canada Malting Silos\\, 9 Eireann Quay", ics)
        self.assertIn("Line one\\;\\nline two", ics)
        self.assertNotIn("Cancelled Thing", ics)

    def test_lines_are_folded(self):
        # RFC 5545 limits lines to 75 octets; longer ones must be folded.
        long_row = ROWS[0].replace("Line one;", "x" * 200)
        _, _, ics = self.convert([long_row])
        self.assertTrue(all(len(l.encode()) <= 75 for l in ics.split("\r\n")))

    def test_missing_columns_raises(self):
        tmp = Path(tempfile.mkdtemp())
        src = tmp / "bad.csv"
        src.write_text("a,b\n1,2\n")
        with self.assertRaises(ValueError):
            csv_to_ics.convert(src, tmp / "o.ics")

    def test_real_schedule_file(self):
        # Sanity check against the actual 2026 data (64 rows, 1 cancelled).
        src = Path(__file__).resolve().parent.parent / "2026" / "schedule-data.csv"
        if not src.exists():
            self.skipTest("2026/schedule-data.csv not found")
        out = Path(tempfile.mkdtemp()) / "real.ics"
        count, _ = csv_to_ics.convert(src, out)
        self.assertEqual(count, 63)

    def test_cli_requires_existing_file(self):
        self.assertEqual(csv_to_ics.main(["does-not-exist.csv"]), 1)


if __name__ == "__main__":
    unittest.main()
