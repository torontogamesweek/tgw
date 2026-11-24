import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const SHARE_URL = "https://cloud.torontogamesweek.com/files/s/B2KKwbNHcQTDQTa/download";
const ODS_MIME = "application/vnd.oasis.opendocument.spreadsheet";
const OUTPUT = join(dirname(fileURLToPath(import.meta.url)), "..", "schedule-data.json");
const TIME_EPOCH_PREFIX = /^1899-12-30[ T]/;

function fail(message) {
  console.error(`build-schedule: ${message}`);
  process.exit(1);
}

async function download() {
  const response = await fetch(SHARE_URL, { redirect: "follow" });
  if (!response.ok) fail(`download failed with HTTP ${response.status}`);

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes(ODS_MIME)) fail(`unexpected content type: ${contentType}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.subarray(0, 2).toString("latin1") !== "PK") fail("payload is not a zip container");

  return buffer;
}

function cellText(value) {
  return String(value ?? "").replace(TIME_EPOCH_PREFIX, "");
}

function toGrid(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, cellText: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "", blankrows: false });
  return grid.map((row) => row.map(cellText));
}

function build(grid) {
  const nonEmpty = grid.filter((row) => row.some((cell) => cell !== ""));
  if (nonEmpty.length < 2) fail("sheet has no data rows");

  const headers = nonEmpty[0].map((header) => header.trim());
  const rows = nonEmpty.slice(1);

  const width = Math.max(...rows.map((row) => row.length));
  if (width !== headers.length) {
    fail(`ragged grid: ${headers.length} headers but ${width} columns of data`);
  }

  return { headers, rows };
}

function matchesExisting(headers, rows) {
  try {
    const previous = JSON.parse(readFileSync(OUTPUT, "utf8"));
    return JSON.stringify(previous.headers) === JSON.stringify(headers) &&
      JSON.stringify(previous.rows) === JSON.stringify(rows);
  } catch (_) {
    return false;
  }
}

const grid = toGrid(await download());
const { headers, rows } = build(grid);

if (matchesExisting(headers, rows)) {
  console.log(`rows: ${rows.length} (unchanged, not rewritten)`);
  console.log(`columns: ${headers.length}`);
  process.exit(0);
}

writeFileSync(
  OUTPUT,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), source: SHARE_URL, headers, rows }, null, 2)}\n`
);

console.log(`rows: ${rows.length}`);
console.log(`columns: ${headers.length}`);
console.log(`headers: ${headers.join(" | ")}`);
