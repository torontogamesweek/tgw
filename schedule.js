/* ===================================================================
   Toronto Games Week — Schedule
   Rewritten for:
     • time-aware "now" band (countdown → brief "we've begun" → hidden)
     • DAY = single-select filter (prominent timeline)
     • TYPE = multi-select chips (secondary refinement)
     • redesigned event cards (left avatar, footer actions, live state)
   This file owns ALL rendering; no post-render patching needed.
   =================================================================== */

const events = [];

/* ---------- festival constants ---------- */

const FESTIVAL_YEAR = 2026;
const FESTIVAL_MONTH = 5; // June (0-indexed)

const DAYS = [
  { abbr: "Thu", weekday: "Thursday", mon: "Jun", num: 11, full: "June 11, 2026" },
  { abbr: "Fri", weekday: "Friday", mon: "Jun", num: 12, full: "June 12, 2026" },
  { abbr: "Sat", weekday: "Saturday", mon: "Jun", num: 13, full: "June 13, 2026" },
  { abbr: "Sun", weekday: "Sunday", mon: "Jun", num: 14, full: "June 14, 2026" },
  { abbr: "Mon", weekday: "Monday", mon: "Jun", num: 15, full: "June 15, 2026" },
  { abbr: "Tue", weekday: "Tuesday", mon: "Jun", num: 16, full: "June 16, 2026" },
  { abbr: "Wed", weekday: "Wednesday", mon: "Jun", num: 17, full: "June 17, 2026" },
];

const TYPES = ["Showcase", "Social", "Workshop", "Game", "Talk", "Performance"];

/* ---------- date / time helpers ---------- */

const to12Hour = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const suffix = h < 12 ? "am" : "pm";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")}${suffix}`;
};

// "20:00","23:00" -> "8:00–11:00PM"  (drops the first meridiem when it matches)
function formatTimeRange(start, end) {
  if (!start) return "";
  const s = to12Hour(start);
  const e = to12Hour(end);
  if (!e) return s.toUpperCase();
  const sClean = s.slice(-2) === e.slice(-2) ? s.slice(0, -2) : s;
  return `${sClean}–${e}`.toUpperCase();
}

// "Thursday June 11" -> { abbr:"Thu", label:"Thu Jun 11", multi:false }
function dayMetaFromDate(dateStr) {
  const parts = dateStr.split(",").map((s) => s.trim()).filter(Boolean);
  const first = parts[0] ? parts[0].split(/\s+/) : [];
  const abbr = first[0] ? first[0].slice(0, 3) : "";
  const mon = first[1] ? first[1].slice(0, 3) : "";
  const num = first[2] || "";
  let label = [abbr, mon, num].filter(Boolean).join(" ");
  if (parts.length > 1) label += " +";
  return { abbr, label, multi: parts.length > 1 };
}

function eventDayAbbrs(event) {
  return event.date
    .split(",")
    .map((s) => s.trim().split(/\s+/)[0].slice(0, 3))
    .filter(Boolean);
}

// Current wall-clock time in Toronto, expressed as a browser-local Date so the
// fields (date/hour) match Toronto. Event Dates are built the same way, so
// getTime() comparisons between the two are consistent.
function nowInToronto() {
  try {
    const s = new Date().toLocaleString("en-US", { timeZone: "America/Toronto" });
    const d = new Date(s);
    return isNaN(d) ? new Date() : d;
  } catch (e) {
    return new Date();
  }
}

function buildDate(event, time) {
  const meta = dayMetaFromDate(event.date);
  let day = parseInt(meta.num, 10);
  let month = FESTIVAL_MONTH;
  let year = FESTIVAL_YEAR;
  if (isNaN(day)) {
    const ds = new Date(event.dateForSorting);
    if (!isNaN(ds)) {
      day = ds.getDate();
      month = ds.getMonth();
      year = ds.getFullYear();
    }
  }
  const [h, m] = (time || "00:00").split(":").map(Number);
  return new Date(year, month, day, h || 0, m || 0);
}

const eventStart = (e) => buildDate(e, e.startTime);
const eventEnd = (e) => buildDate(e, e.endTime || e.startTime);

function festivalPhase(now) {
  const start = new Date(FESTIVAL_YEAR, FESTIVAL_MONTH, 11, 0, 0);
  const end = new Date(FESTIVAL_YEAR, FESTIVAL_MONTH, 17, 23, 59);
  if (now < start) return "before";
  if (now > end) return "after";
  return "during";
}

// Days / hours / minutes / seconds until the festival opens.
function countdownParts(now) {
  const start = new Date(FESTIVAL_YEAR, FESTIVAL_MONTH, 11, 0, 0, 0);
  let diff = Math.max(0, start - now);
  const d = Math.floor(diff / 86400000); diff -= d * 86400000;
  const h = Math.floor(diff / 3600000); diff -= h * 3600000;
  const m = Math.floor(diff / 60000); diff -= m * 60000;
  const s = Math.floor(diff / 1000);
  return { d, h, m, s };
}

// How long the celebratory "we've begun" banner stays up (ms).
const BEGUN_WINDOW_MS = 60000;

// True for the first minute after the festival opens.
function justBegun(now) {
  const start = new Date(FESTIVAL_YEAR, FESTIVAL_MONTH, 11, 0, 0, 0);
  const since = now - start;
  return since >= 0 && since < BEGUN_WINDOW_MS;
}

function todayAbbr(now) {
  if (now.getMonth() !== FESTIVAL_MONTH || now.getFullYear() !== FESTIVAL_YEAR) return null;
  const found = DAYS.find((x) => x.num === now.getDate());
  return found ? found.abbr : null;
}

function isLive(e, now) {
  try {
    return eventStart(e) <= now && now <= eventEnd(e);
  } catch (_) {
    return false;
  }
}

/* ---------- CSV parsing (unchanged) ---------- */

const SHEET_ID = "1pKPSoBWaRSHKII06bB49AuX-XStVC4kVU9ZiwyV7ND8";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

const parseCSV = (csvText) => {
  const result = [];
  let row = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"' && (!insideQuotes || nextChar !== '"')) {
      insideQuotes = !insideQuotes;
      continue;
    }
    if (char === '"' && nextChar === '"') {
      currentValue += '"';
      i++;
      continue;
    }
    if (char === ";" && !insideQuotes) {
      row.push(currentValue);
      currentValue = "";
      continue;
    }
    if ((char === "\n" || (char === "\r" && nextChar === "\n")) && !insideQuotes) {
      row.push(currentValue);
      result.push(row);
      row = [];
      currentValue = "";
      if (char === "\r") i++;
      continue;
    }
    currentValue += char;
  }
  if (currentValue !== "" || row.length > 0) {
    row.push(currentValue);
    result.push(row);
  }
  return result;
};

class Event {
  constructor(name, hook, description, date, location, linkInfo, link, startTime, endTime,
    icon, iconAlt, categories, gcalLink, dateForSorting, eventTypes, addressLink, price, address) {
    this.name = name;
    this.hook = hook;
    this.description = description;
    this.date = date;
    this.location = location;
    this.linkInfo = linkInfo;
    this.link = link;
    this.startTime = startTime;
    this.endTime = endTime;
    this.icon = icon;
    this.iconAlt = iconAlt;
    this.categories = categories;
    this.gcalLink = gcalLink;
    this.dateForSorting = dateForSorting;
    this.eventTypes = eventTypes;
    this.addressLink = addressLink;
    this.price = price;
    this.address = address;
  }
}

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header.trim()] = row[index] || "";
  });
  return obj;
}

async function fetchSheetData() {
  try {
    const response = await fetch(SHEET_URL);
    const csvText = await response.text();
    const semicolonCsv = csvText.replace(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/g, ";");
    const rows = parseCSV(semicolonCsv);
    if (rows.length === 0) return [];

    const headers = rows[0].map((header) => header.trim());

    for (let i = 1; i < rows.length; i++) {
      const rowData = rowToObject(headers, rows[i]);

      const name = rowData["Event Name"] || "";
      const hook = rowData["The hook!"] || "";
      const description = rowData["Short Event Description"] || "";
      const date = rowData["Event Date(s)"] || "";
      const location = rowData["Venue Name"] || "";
      const address = rowData["Address"] || "";
      const linkInfo = rowData["Registration"] || "";
      let link = rowData["Event link"] || "";
      const incomplete = rowData["Status"];
      const startTime = rowData["Event Start Time"].slice(0, -3) || "";
      const endTime = rowData["Event End Time"].slice(0, -3) || "";
      let icon = rowData["Icon"] || "";
      const iconAlt = rowData["Alttext"] || "";
      const categories = rowData["Target Audience"] ? rowData["Target Audience"].split(",") : [];
      let gcalLink = rowData["Gcal"] || "";
      const dateForSorting = rowData["Date for sorting"] || "";
      const eventType1 = rowData["Primary type of event"] || "";
      const eventType2 = rowData["Additional type of event"] || "";
      const addressLink = rowData["Address Link"] || "";
      const price = rowData["Price"] || "";

      const eventTypes = [eventType1, eventType2].filter((t) => t !== "");

      if (!link.startsWith("http") || link.startsWith("www")) link = "";

      if (icon === "") {
        const iconFolder = ["balls", "ppl"];
        const range = 29;
        const randomIconFolder = iconFolder[Math.floor(Math.random() * iconFolder.length)];
        const randomIconPrefix = randomIconFolder === "balls" ? "ball" : "ppl";
        let randomNumber = Math.floor(Math.random() * range) + 1;
        if (randomNumber === 6) randomNumber = 7;
        icon = `${randomIconFolder}/${randomIconPrefix}_${randomNumber}.png`;
      }

      if (incomplete !== "complete") continue;
      if (!name || name === "Incomplete") continue;

      if (!gcalLink) {
        const dateStart = new Date(
          2026, 5, date.split(" ")[2],
          startTime.split(":")[0], startTime.split(":")[1]
        );
        const pad = (n) => String(n).padStart(2, "0");
        const toGcalTime = (t) => t.replace(":", "") + "00";
        const ymd = `${dateStart.getFullYear()}${pad(dateStart.getMonth() + 1)}${pad(dateStart.getDate())}`;
        const startDt = `${ymd}T${toGcalTime(startTime)}`;
        const endDt = `${ymd}T${toGcalTime(endTime)}`;
        const details = [description, price, link ? `${linkInfo}: ${link}` : ""].filter(Boolean).join("\n\n");
        const locationStr = [location, address].filter(Boolean).join(", ");
        const params = new URLSearchParams({
          action: "TEMPLATE",
          text: name,
          dates: `${startDt}/${endDt}`,
          details: details,
          location: locationStr,
        });
        gcalLink = `https://www.google.com/calendar/render?${params.toString()}`;
      }

      events.push(new Event(
        name, hook, description, date, location, linkInfo, link, startTime, endTime,
        icon, iconAlt, categories, gcalLink, dateForSorting, eventTypes, addressLink, price, address
      ));
    }
    return events;
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return [];
  }
}

/* ===================================================================
   APP STATE + RENDERING
   =================================================================== */

/* ---------- starred events (saved locally) ---------- */

const STARS_KEY = "tgw-stars-2026";

function loadStars() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STARS_KEY) || "[]"));
  } catch (_) {
    return new Set();
  }
}
function saveStars() {
  try {
    localStorage.setItem(STARS_KEY, JSON.stringify([...state.stars]));
  } catch (_) {}
}

/* ---------- per-event id (for stars + shareable links) ---------- */

function eventId(e) {
  const base = (e.name || "event")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  const day = (eventDayAbbrs(e)[0] || "").toLowerCase();
  return `event-${base}${day ? "-" + day : ""}`;
}

function findEventById(id) {
  return events.find((e) => eventId(e) === id);
}

function isFree(e) {
  return /free/i.test(e.price || "");
}

const state = {
  day: null, // null = all days, else a day abbr ("Thu")
  types: new Set(), // multi-select; empty = all types
  freeOnly: false, // show only free events
  starredOnly: false, // show only starred events
  stars: loadStars(), // Set of starred event ids (persisted)
  sharedId: null, // event id arrived at via a shared link (yellow highlight)
  now: nowInToronto(),
  phase: "before",
};

function sortByStart(list) {
  return list.slice().sort((a, b) => {
    const da = new Date(a.dateForSorting);
    const db = new Date(b.dateForSorting);
    if (da - db !== 0) return da - db;
    return (a.startTime || "").localeCompare(b.startTime || "");
  });
}

function matchesType(e) {
  return state.types.size === 0 || e.eventTypes.some((t) => state.types.has(t));
}

function matchesDay(e) {
  return !state.day || eventDayAbbrs(e).includes(state.day);
}

function matchesFree(e) {
  return !state.freeOnly || isFree(e);
}

function matchesStar(e) {
  return !state.starredOnly || state.stars.has(eventId(e));
}

function tagFiltersActive() {
  return state.types.size > 0 || state.freeOnly || state.starredOnly;
}

function filteredEvents() {
  return sortByStart(
    events.filter((e) => matchesDay(e) && matchesType(e) && matchesFree(e) && matchesStar(e))
  );
}

// Per-day counts respect the active TYPE / FREE / STAR filters (but ignore the
// day filter), so the timeline reflects "how many matching events on each day".
function dayCounts() {
  const base = events.filter((e) => matchesType(e) && matchesFree(e) && matchesStar(e));
  const counts = { __all: base.length };
  base.forEach((e) => eventDayAbbrs(e).forEach((a) => (counts[a] = (counts[a] || 0) + 1)));
  return counts;
}

/* ---------- one event card ---------- */

function priceBadge(e) {
  const p = (e.price || "").trim();
  if (!p) return "";
  const free = isFree(e);
  return `<span class="tgw-price ${free ? "is-free" : ""}">${p}</span>`;
}

function locationLine(e) {
  if (!e.location && !e.address) return "";
  const addr = e.address
    ? `<a class="tgw-addr-link" href="https://www.google.com/maps/search/${encodeURIComponent(e.addressLink || e.address)}" target="_blank" rel="noopener" title="View on Google Maps"><span class="tgw-addr">${e.address}</span></a>`
    : "";
  return `<p class="tgw-loc"><span class="tgw-pin" aria-hidden="true">📍</span><span class="tgw-venue">${e.location}</span>${addr}</p>`;
}

// Build the shareable URL for an event (deep link via hash).
function eventUrl(e) {
  return location.origin + location.pathname + "#" + eventId(e);
}

// Copy a URL to the clipboard, with the "Link copied!" feedback on the button.
function copyEventLink(url, btn) {
  const done = () => {
    if (!btn) return;
    const label = btn.querySelector(".tgw-share-label");
    if (!label) return;
    const prev = label.textContent;
    label.textContent = "Link copied!";
    btn.classList.add("is-copied");
    setTimeout(() => {
      label.textContent = prev;
      btn.classList.remove("is-copied");
    }, 1600);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(done).catch(() => window.prompt("Copy this link:", url));
  } else {
    window.prompt("Copy this link:", url);
  }
}

// Remove any share menu that's currently open.
function closeShareMenu() {
  const open = document.querySelector(".tgw-share-menu");
  if (open) open.remove();
}

// Share handler — opens a small menu. "Share…" (the native share sheet with
// all your social apps, messages, etc.) shows where the device supports it,
// and "Copy link" is always there so you can just grab the URL.
function shareEvent(e, btn) {
  // A second click on the same Share button closes the menu.
  if (document.querySelector(".tgw-share-menu")) {
    closeShareMenu();
    return;
  }

  const url = eventUrl(e);
  const data = { title: e.name, text: `${e.name} — Toronto Games Week`, url };

  const menu = document.createElement("div");
  menu.className = "tgw-share-menu";
  menu.style.cssText =
    "position:fixed;z-index:9999;min-width:170px;padding:0.3rem;background:#fff;" +
    "border:1.5px solid var(--tgw-purple-line);border-radius:12px;" +
    "box-shadow:0 8px 28px rgba(14,8,42,0.18);display:flex;flex-direction:column;" +
    "gap:0.15rem;font-family:'Alegreya',sans-serif;";

  let cleanup = () => {};

  const addItem = (labelHtml, onClick) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "tgw-share-menu-item";
    item.innerHTML = labelHtml;
    item.style.cssText =
      "display:flex;align-items:center;gap:0.5rem;width:100%;text-align:left;" +
      "font:inherit;font-weight:bold;font-size:0.9rem;color:var(--tgw-purple);" +
      "background:transparent;border:none;border-radius:8px;padding:0.5rem 0.7rem;cursor:pointer;";
    item.addEventListener("mouseenter", () => { item.style.background = "var(--tgw-purple-soft)"; });
    item.addEventListener("mouseleave", () => { item.style.background = "transparent"; });
    item.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      cleanup();
      onClick();
    });
    menu.appendChild(item);
  };

  // Native share ("share to socials") — only where the device supports it.
  if (navigator.share) {
    addItem(`<span aria-hidden="true">📤</span> Share…`, () => navigator.share(data).catch(() => {}));
  }
  // Copy link — always available.
  addItem(`<span aria-hidden="true">🔗</span> Copy link`, () => copyEventLink(url, btn));

  document.body.appendChild(menu);

  // Position the menu just under the Share button, right-aligned, and nudge it
  // back on-screen if it would spill off either edge.
  const r = btn.getBoundingClientRect();
  const mw = menu.offsetWidth;
  let left = r.right - mw;
  if (left < 8) left = 8;
  if (left + mw > window.innerWidth - 8) left = window.innerWidth - 8 - mw;
  menu.style.top = `${r.bottom + 6}px`;
  menu.style.left = `${left}px`;

  // Close on outside click, Escape, scroll, or resize.
  const onDocClick = (ev) => {
    if (menu.contains(ev.target)) return;              // clicks inside the menu = handled by its items
    if (btn.contains(ev.target)) ev.stopPropagation(); // re-click on Share just closes (no reopen)
    cleanup();
  };
  const onKey = (ev) => { if (ev.key === "Escape") cleanup(); };
  const onMove = () => cleanup();
  cleanup = () => {
    closeShareMenu();
    document.removeEventListener("click", onDocClick, true);
    document.removeEventListener("keydown", onKey, true);
    window.removeEventListener("scroll", onMove, true);
    window.removeEventListener("resize", onMove, true);
  };
  setTimeout(() => {
    document.addEventListener("click", onDocClick, true);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove, true);
  }, 0);
}

// Star handler — toggles, persists, and updates the UI in place.
function toggleStar(e, btn) {
  const id = eventId(e);
  const starred = state.stars.has(id);
  if (starred) state.stars.delete(id);
  else state.stars.add(id);
  saveStars();

  // If we're viewing "starred only" and just removed one, the card must vanish.
  if (state.starredOnly && starred) {
    renderAll();
    return;
  }

  // Otherwise update in place so the page doesn't jump.
  const now = !starred;
  if (btn) {
    btn.classList.toggle("is-starred", now);
    btn.setAttribute("aria-pressed", String(now));
    btn.setAttribute("title", now ? "Starred — saved on this device" : "Save this event");
    btn.querySelector(".tgw-star-glyph").textContent = now ? "★" : "☆";
  }
  renderControls(); // refresh the "Starred (n)" filter count
}

/* ---------- "Add to calendar" menu (Google + iCalendar .ics) ---------- */

function pad2(n) { return String(n).padStart(2, "0"); }

// Local wall-clock stamp (floating time), e.g. 20260611T200000 — matches the
// Google Calendar link, which also uses Toronto local time without a zone.
function icsStampLocal(d) {
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}` +
         `T${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
}
// UTC stamp with trailing Z (used for DTSTAMP).
function icsStampUTC(d) {
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}` +
         `T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}
function icsEscape(s) {
  return String(s || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

// Build a .ics file for one event and trigger a download.
function downloadICS(e) {
  // Derive the day number by splitting the date string on spaces — this mirrors
  // the Google Calendar link builder and is robust to a comma after the weekday
  // (e.g. "Thursday, June 11"), which the other date parser chokes on.
  let dayNum = parseInt(String(e.date || "").split(" ")[2], 10);
  let month = FESTIVAL_MONTH;
  let year = FESTIVAL_YEAR;
  if (isNaN(dayNum)) {
    const ds = new Date(e.dateForSorting);
    if (!isNaN(ds)) { dayNum = ds.getDate(); month = ds.getMonth(); year = ds.getFullYear(); }
  }
  const [sh, sm] = String(e.startTime || "00:00").split(":").map(Number);
  const [eh, em] = String(e.endTime || e.startTime || "00:00").split(":").map(Number);
  const start = new Date(year, month, dayNum, sh || 0, sm || 0);
  const end = new Date(year, month, dayNum, eh || 0, em || 0);

  const details = [e.description, e.price, e.link ? `${e.linkInfo}: ${e.link}` : ""]
    .filter(Boolean).join("\n\n");
  const locationStr = [e.location, e.address].filter(Boolean).join(", ");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Toronto Games Week//Schedule//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:" + eventId(e) + "@torontogamesweek.com",
    "DTSTAMP:" + icsStampUTC(new Date()),
    "DTSTART:" + icsStampLocal(start),
    "DTEND:" + icsStampLocal(end),
    "SUMMARY:" + icsEscape(e.name),
    "DESCRIPTION:" + icsEscape(details),
    "LOCATION:" + icsEscape(locationStr),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (eventId(e) || "event") + ".ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Generic pop-up menu anchored under a button (same look + behaviour as the
// share menu). `items` is an array of { label (HTML), onClick }.
function closeActionMenu() {
  const open = document.querySelector(".tgw-action-menu");
  if (open) open.remove();
}

function openActionMenu(btn, items) {
  if (document.querySelector(".tgw-action-menu")) { closeActionMenu(); return; }

  const menu = document.createElement("div");
  menu.className = "tgw-action-menu";
  menu.style.cssText =
    "position:fixed;z-index:9999;min-width:190px;padding:0.3rem;background:#fff;" +
    "border:1.5px solid var(--tgw-purple-line);border-radius:12px;" +
    "box-shadow:0 8px 28px rgba(14,8,42,0.18);display:flex;flex-direction:column;" +
    "gap:0.15rem;font-family:'Alegreya',sans-serif;";

  let cleanup = () => {};

  items.forEach((it) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "tgw-action-menu-item";
    item.innerHTML = it.label;
    item.style.cssText =
      "display:flex;align-items:center;gap:0.5rem;width:100%;text-align:left;" +
      "font:inherit;font-weight:bold;font-size:0.9rem;color:var(--tgw-purple);" +
      "background:transparent;border:none;border-radius:8px;padding:0.5rem 0.7rem;cursor:pointer;";
    item.addEventListener("mouseenter", () => { item.style.background = "var(--tgw-purple-soft)"; });
    item.addEventListener("mouseleave", () => { item.style.background = "transparent"; });
    item.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      cleanup();
      it.onClick();
    });
    menu.appendChild(item);
  });

  document.body.appendChild(menu);

  const r = btn.getBoundingClientRect();
  const mw = menu.offsetWidth;
  let left = r.right - mw;
  if (left < 8) left = 8;
  if (left + mw > window.innerWidth - 8) left = window.innerWidth - 8 - mw;
  menu.style.top = `${r.bottom + 6}px`;
  menu.style.left = `${left}px`;

  const onDocClick = (ev) => {
    if (menu.contains(ev.target)) return;
    if (btn.contains(ev.target)) ev.stopPropagation();
    cleanup();
  };
  const onKey = (ev) => { if (ev.key === "Escape") cleanup(); };
  const onMove = () => cleanup();
  cleanup = () => {
    closeActionMenu();
    document.removeEventListener("click", onDocClick, true);
    document.removeEventListener("keydown", onKey, true);
    window.removeEventListener("scroll", onMove, true);
    window.removeEventListener("resize", onMove, true);
  };
  setTimeout(() => {
    document.addEventListener("click", onDocClick, true);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove, true);
  }, 0);
}

// "Add to calendar" — offers Google Calendar or an iCalendar (.ics) download.
function openCalendarMenu(e, btn) {
  openActionMenu(btn, [
    { label: `<span aria-hidden="true">📆</span> Google Calendar`,
      onClick: () => window.open(e.gcalLink, "_blank", "noopener") },
    { label: `<span aria-hidden="true">📥</span> iCalendar (.ics)`,
      onClick: () => downloadICS(e) },
  ]);
}

function buildCard(e, now) {
  const live = isLive(e, now);
  const id = eventId(e);
  const starred = state.stars.has(id);
  const shared = state.sharedId === id;
  const meta = dayMetaFromDate(e.date);

  const card = document.createElement("article");
  card.className = "tgw-event";
  card.id = id;

  const chips = (e.eventTypes || [])
    .map((t) => `<span class="tgw-chip-tag">${t}</span>`)
    .join("");

  // LEFT cluster: price / registration info.
  const leftActions = [
    priceBadge(e),
    e.link
      ? `<a class="tgw-action tgw-register" href="${e.link}" target="_blank" rel="noopener">${e.linkInfo || "Register"} <span aria-hidden="true">↗</span></a>`
      : (e.linkInfo ? `<span class="tgw-action-note">${e.linkInfo}</span>` : ""),
  ].filter(Boolean).join("");

  // RIGHT cluster: utility actions (share + add to calendar).
  const rightActions = [
    `<button type="button" class="tgw-action tgw-share" title="Share this event"><span aria-hidden="true">🔗</span> <span class="tgw-share-label">Share</span></button>`,
    e.gcalLink
      ? `<button type="button" class="tgw-action tgw-cal" title="Add to calendar"><span aria-hidden="true">📅</span> Add to calendar</button>`
      : "",
  ].filter(Boolean).join("");

  const actions = `
    <div class="tgw-actions">
      <div class="tgw-actions-left">${leftActions}</div>
      <div class="tgw-actions-right">${rightActions}</div>
    </div>`;

  card.innerHTML = `
    <div class="tgw-card ${live ? "tgw-card--live" : ""} ${shared ? "tgw-card--shared" : ""}">
      <button type="button" class="tgw-star ${starred ? "is-starred" : ""}"
              aria-pressed="${starred}"
              aria-label="Save this event"
              title="${starred ? "Starred — saved on this device" : "Save this event"}">
        <span class="tgw-star-glyph" aria-hidden="true">${starred ? "★" : "☆"}</span>
      </button>

      <div class="tgw-card-head">
        <img class="tgw-avatar" src="/images/2026/single-images/${e.icon}" alt="${e.iconAlt || ""}" loading="lazy" />
        <div class="tgw-head-text">
          <div class="tgw-eyebrow">
            ${live ? `<span class="tgw-live"><span class="tgw-live-dot"></span>Live now</span>` : ""}
            <span class="tgw-daytag">${meta.label}</span>
            <span class="tgw-sep" aria-hidden="true">·</span>
            <span class="tgw-clock">${formatTimeRange(e.startTime, e.endTime)}</span>
          </div>
          <h3 class="tgw-title">${e.name}</h3>
        </div>
      </div>

      <div class="tgw-card-body">
        ${chips ? `<div class="tgw-chips">${chips}</div>` : ""}
        <div class="tgw-desc">${e.description || ""}</div>
        ${locationLine(e)}
        ${actions}
      </div>
    </div>`;

  // wire up the interactive buttons
  card.querySelector(".tgw-star").addEventListener("click", (ev) => {
    ev.preventDefault();
    toggleStar(e, ev.currentTarget);
  });
  const shareBtn = card.querySelector(".tgw-share");
  if (shareBtn) shareBtn.addEventListener("click", (ev) => {
    ev.preventDefault();
    shareEvent(e, ev.currentTarget);
  });
  const calBtn = card.querySelector(".tgw-cal");
  if (calBtn) calBtn.addEventListener("click", (ev) => {
    ev.preventDefault();
    openCalendarMenu(e, ev.currentTarget);
  });

  return card;
}

function dayHeader(meta, count) {
  const el = document.createElement("div");
  el.className = "tgw-day-sep";
  el.id = "day-" + meta.abbr.toLowerCase();
  el.innerHTML = `
    <span class="tgw-day-num">${meta.weekday} June ${meta.num}</span>
    <span class="tgw-day-text">
    </span>
    <span class="tgw-day-count">${count} event${count === 1 ? "" : "s"}</span>`;
  return el;
}

/* ---------- schedule body ---------- */

function renderSchedule() {
  const container = document.getElementById("schedule-container");
  if (!container) return;
  container.innerHTML = "";

  const list = filteredEvents();

  if (list.length === 0) {
    container.innerHTML = `
      <div class="tgw-empty">
        <p>No events match your filters.</p>
        <button type="button" class="tgw-clear-all" id="tgw-clear-all">Clear filters</button>
      </div>`;
    const clr = document.getElementById("tgw-clear-all");
    if (clr) clr.addEventListener("click", () => {
      state.day = null;
      state.types.clear();
      state.freeOnly = false;
      state.starredOnly = false;
      renderAll();
    });
    return;
  }

  // Group by day. When a single day is selected we still show its header.
  let lastDay = null;
  const grouped = {};
  list.forEach((e) => {
    const a = eventDayAbbrs(e)[0] || "??";
    (grouped[a] = grouped[a] || []).push(e);
  });

  DAYS.forEach((meta) => {
    const dayEvents = grouped[meta.abbr];
    if (!dayEvents || dayEvents.length === 0) return;
    container.appendChild(dayHeader(meta, dayEvents.length));
    dayEvents.forEach((e) => container.appendChild(buildCard(e, state.now)));
    lastDay = meta.abbr;
  });

  // any events whose day didn't match the festival list (defensive)
  Object.keys(grouped).forEach((a) => {
    if (DAYS.some((d) => d.abbr === a)) return;
    grouped[a].forEach((e) => container.appendChild(buildCard(e, state.now)));
  });

  // if tag filters are on (easy to forget), offer a reset
  if (tagFiltersActive()) {
    const footer = document.createElement("div");
    footer.className = "tgw-tag-reset";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tgw-tag-reset-link";
    btn.innerHTML = `<span aria-hidden="true">↺</span>Show ALL events on this day?`;
    btn.addEventListener("click", () => {
      state.types.clear();
      state.freeOnly = false;
      state.starredOnly = false;
      renderAll();
    });
    footer.appendChild(btn);
    container.appendChild(footer);
  }

  if (state.day) {
    const d = DAYS.find((x) => x.abbr === state.day);
    const isToday = state.phase === "during" && todayAbbr(state.now) === state.day;
    const dayLabel = isToday ? "today's" : (d ? d.weekday + "'s" : "this day's");

    const endNote = document.createElement("div");
    endNote.className = "tgw-day-end";
    endNote.style.cssText =
      "text-align:center;margin-top:2.5rem;padding-top:1.75rem;" +
      "border-top:2px solid var(--tgw-purple-line);";
    endNote.innerHTML =
      `<p style="font-family:'Merriweather',serif;font-size:0.95rem;` +
      `color:var(--tgw-ink-soft);margin:0 0 0.9rem;">` +
      `You've reached the end of ${dayLabel} events.</p>` +
      `<button type="button" class="tgw-clear-all tgw-day-end-btn">` +
      `See all upcoming events <span aria-hidden="true">↗</span></button>`;
    endNote.querySelector(".tgw-day-end-btn").addEventListener("click", () => {
      const prevDay = state.day;          // remember the day they were viewing
      state.day = null;
      state.types.clear();
      state.freeOnly = false;
      state.starredOnly = false;
      renderAll();


      requestAnimationFrame(() => {
        const idx = DAYS.findIndex((x) => x.abbr === prevDay);
        let target = null;
        for (let i = idx + 1; i < DAYS.length; i++) {
          const el = document.getElementById("day-" + DAYS[i].abbr.toLowerCase());
          if (el) { target = el; break; }
        }
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // They were on the last day with events — just go to the foot.
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }
      });
    });
    container.appendChild(endNote);
  }
}

/* ---------- controls: day timeline + type chips ---------- */

function renderControls() {
  const counts = dayCounts();

  // Day row (single-select)
  const dayRow = document.getElementById("tgw-day-row");
  dayRow.innerHTML = "";
  const allPill = document.createElement("button");
  allPill.type = "button";
  allPill.className = "tgw-day-pill tgw-day-pill--all" + (state.day === null ? " is-active" : "");
  allPill.innerHTML = `<span class="tgw-pill-top"><span class="tgw-all-full">All days</span><span class="tgw-all-short">All</span></span><span class="tgw-pill-count">${counts.__all || 0} events</span>`;
  allPill.addEventListener("click", () => { state.day = null; renderAll(); });
  dayRow.appendChild(allPill);

  DAYS.forEach((d) => {
    const n = counts[d.abbr] || 0;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tgw-day-pill" + (state.day === d.abbr ? " is-active" : "") + (n === 0 ? " is-empty" : "");
    b.disabled = n === 0;
    b.innerHTML =
      `<span class="tgw-pill-top"><span class="tgw-pill-abbr">${d.abbr}</span> <span class="tgw-pill-date">${d.num}</span></span>` +
      `<span class="tgw-pill-count">${n} events</span>`;
    b.addEventListener("click", () => {
      state.day = state.day === d.abbr ? null : d.abbr; // click active day -> back to All
      renderAll();
    });
    dayRow.appendChild(b);
  });

  // Type row (multi-select)
  const typeRow = document.getElementById("tgw-type-row");
  typeRow.innerHTML = "";
  const allTypes = document.createElement("button");
  allTypes.type = "button";
  allTypes.className = "tgw-type-chip tgw-type-chip--all" + (state.types.size === 0 ? " is-active" : "");
  allTypes.textContent = "All";
  allTypes.addEventListener("click", () => {
    state.types.clear();
    state.freeOnly = false;
    state.starredOnly = false;
    renderAll();
  });
  typeRow.appendChild(allTypes);

  TYPES.forEach((t) => {
    const c = document.createElement("button");
    c.type = "button";
    c.className = "tgw-type-chip" + (state.types.has(t) ? " is-active" : "");
    c.textContent = t;
    c.addEventListener("click", () => {
      if (state.types.has(t)) state.types.delete(t);
      else state.types.add(t);
      renderAll();
    });
    typeRow.appendChild(c);
  });

  // Quick filters: Free + Starred (live alongside the type chips)
const quickRow = document.getElementById("tgw-type-row");
  if (quickRow) {

    const freeChip = document.createElement("button");
    freeChip.type = "button";
    freeChip.className = "tgw-type-chip tgw-type-chip--free" + (state.freeOnly ? " is-active" : "");
    freeChip.innerHTML = `<span aria-hidden="true">✦</span> free`;
    freeChip.addEventListener("click", () => {
      state.freeOnly = !state.freeOnly;
      renderAll();
    });
    quickRow.appendChild(freeChip);

    const starCount = state.stars.size;
    const starChip = document.createElement("button");
    starChip.type = "button";
    starChip.className = "tgw-type-chip tgw-type-chip--star" + (state.starredOnly ? " is-active" : "");
    starChip.innerHTML = `<span aria-hidden="true">★</span> Starred${starCount ? ` (${starCount})` : ""}`;
    starChip.addEventListener("click", () => {
      state.starredOnly = !state.starredOnly;
      renderAll();
    });
    quickRow.appendChild(starChip);
  }
}

/* ---------- the time-aware "now" band ---------- */

// Schedule a single re-render for the moment the "begun" banner should vanish,
// so the band disappears right on cue rather than waiting for the minute tick.
let begunHideScheduled = false;
function scheduleBegunHide(now) {
  if (begunHideScheduled) return;
  begunHideScheduled = true;
  const start = new Date(FESTIVAL_YEAR, FESTIVAL_MONTH, 11, 0, 0, 0);
  const remaining = BEGUN_WINDOW_MS - (now - start);
  setTimeout(() => {
    state.now = nowInToronto();
    state.phase = festivalPhase(state.now);
    renderNowBand();
  }, Math.max(500, remaining));
}

function renderNowBand() {
  const band = document.getElementById("tgw-now");
  if (!band) return;
  const now = state.now;
  const phase = state.phase;
  band.className = "tgw-now tgw-now--" + phase;

  try {
    if (phase === "before") {
      const { d, h, m, s } = countdownParts(now);
      const pad = (n) => String(n).padStart(2, "0");
      band.innerHTML = `
        <div class="tgw-now-inner tgw-countdown">
          <span class="tgw-cd-kicker">the games begin in…</span>
          <div class="tgw-cd-grid" id="tgw-cd-grid" aria-live="off">
            <div class="tgw-cd-unit"><span class="tgw-cd-num" id="tgw-cd-d">${d}</span><span class="tgw-cd-lab">${d === 1 ? "day" : "days"}</span></div>
            <span class="tgw-cd-colon" aria-hidden="true">:</span>
            <div class="tgw-cd-unit"><span class="tgw-cd-num" id="tgw-cd-h">${pad(h)}</span><span class="tgw-cd-lab">hrs</span></div>
            <span class="tgw-cd-colon" aria-hidden="true">:</span>
            <div class="tgw-cd-unit"><span class="tgw-cd-num" id="tgw-cd-m">${pad(m)}</span><span class="tgw-cd-lab">min</span></div>
            <span class="tgw-cd-colon" aria-hidden="true">:</span>
            <div class="tgw-cd-unit"><span class="tgw-cd-num" id="tgw-cd-s">${pad(s)}</span><span class="tgw-cd-lab">sec</span></div>
          </div>
        </div>`;
      return;
    }

    // The festival just opened — show a brief, celebratory banner, then the
    // whole band removes itself (see the hide timer below). For the rest of the
    // festival, and after it ends, there's no band at all: the schedule below
    // (with its live badges) carries the "what's on" job.
    if (justBegun(now)) {
      band.className = "tgw-now tgw-now--begun";
      band.innerHTML = `
        <div class="tgw-now-inner tgw-begun">
          <span class="tgw-begun-spark tgw-begun-spark--l" aria-hidden="true">✦</span>
          <span class="tgw-begun-spark tgw-begun-spark--r" aria-hidden="true">✦</span>
          <span class="tgw-begun-kicker">It's on</span>
          <h2 class="tgw-begun-title">Toronto Games Week has begun!</h2>
          <p class="tgw-begun-sub">Doors are open June 11–17 — dive into the schedule below.</p>
        </div>`;
      scheduleBegunHide(now);
      return;
    }

    // During (past the opening minute) and after: collapse the band entirely.
    band.className = "tgw-now tgw-now--empty";
    band.innerHTML = "";
    return;
  } catch (err) {
    console.error("now-band error", err);
    band.innerHTML = ""; // never block the schedule
  }
}

/* ---------- live countdown ticker (before phase only) ---------- */

function tickCountdown() {
  if (state.phase !== "before") return;
  const grid = document.getElementById("tgw-cd-grid");
  if (!grid) return;
  const { d, h, m, s } = countdownParts(nowInToronto());
  // Reached zero → the festival just opened. Flip phase and re-render now
  // instead of waiting for the next minute-interval tick.
  if (d === 0 && h === 0 && m === 0 && s === 0) {
    state.now = nowInToronto();
    state.phase = festivalPhase(state.now);
    if (state.phase !== "before") { renderAll(); return; }
  }
  const pad = (n) => String(n).padStart(2, "0");
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el && el.textContent !== val) el.textContent = val;
  };
  set("tgw-cd-d", String(d));
  set("tgw-cd-h", pad(h));
  set("tgw-cd-m", pad(m));
  set("tgw-cd-s", pad(s));
}

/* ---------- result count ---------- */

function renderCount() {
  const el = document.getElementById("tgw-resultcount");
  if (!el) return;
  const n = filteredEvents().length;
  const bits = [];
  if (state.day) {
    const d = DAYS.find((x) => x.abbr === state.day);
    bits.push(d ? d.weekday + " June " + d.num : state.day);
  } else {
    bits.push("All week");
  }
  if (state.types.size) bits.push([...state.types].join(", "));
  el.textContent = `${n} event${n === 1 ? "" : "s"} · ${bits.join(" · ")}`;
}

/* ---------- master render ---------- */

function renderAll() {
  renderControls();
  renderNowBand();
  renderCount();
  renderSchedule();
}

/* ---------- mobile type disclosure + boot ---------- */

/* ---------- shared-link deep linking ---------- */

// When the page is opened with #event-… (a shared link), make that event
// visible (clear filters / jump to its day), highlight it, and scroll to it.
function applyDeepLink() {
  const id = (location.hash || "").replace(/^#/, "");
  if (!id || !id.startsWith("event-")) return;
  const e = findEventById(id);
  if (!e) return;

  state.types.clear();
  state.freeOnly = false;
  state.starredOnly = false;
  state.day = eventDayAbbrs(e)[0] || null;
  state.sharedId = id;
  renderAll();

  requestAnimationFrame(() => {
    const card = document.getElementById(id);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

let bootTimers = [];
function boot() {
  // boot() is safe to re-run; clear prior timers + flags so intervals don't
  // stack and the "begun" banner can replay.
  bootTimers.forEach(clearInterval);
  bootTimers = [];
  begunHideScheduled = false;

  state.now = nowInToronto();
  state.phase = festivalPhase(state.now);
  // Time-aware default: open on TODAY during the festival, full week otherwise.
  if (state.phase === "during") {
    const t = todayAbbr(state.now);
    if (t) state.day = t;
  }
  renderAll();

  // If arriving via a shared link, surface + highlight that event.
  applyDeepLink();
  window.addEventListener("hashchange", applyDeepLink);

  // Live countdown: tick every second while we're in the "before" phase.
  tickCountdown();
  bootTimers.push(setInterval(tickCountdown, 1000));

  // refresh "now" awareness every minute while the page is open
  bootTimers.push(setInterval(() => {
    state.now = nowInToronto();
    const newPhase = festivalPhase(state.now);
    const phaseChanged = newPhase !== state.phase;
    state.phase = newPhase;
    renderNowBand();
    if (phaseChanged) renderAll();
    else renderSchedule(); // refresh live badges
  }, 60000));
}

document.addEventListener("DOMContentLoaded", () => {
  fetchSheetData()
    .then(() => boot())
    .catch((error) => console.error("Error displaying events:", error));
});


// const logo = document.getElementById('logo');
// const main = document.getElementById('main-schedule');
// const sync = () => main.style.marginTop = (logo.offsetHeight + 16) + 'px';
// logo.complete ? sync() : logo.addEventListener('load', sync);
// addEventListener('resize', sync);