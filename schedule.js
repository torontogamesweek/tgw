const events = [];
const filters = [];
// filter struct = { type: "day", value "Monday" } or { type: "eventType", value: "Workshop" }
const SHEET_ID = "1pKPSoBWaRSHKII06bB49AuX-XStVC4kVU9ZiwyV7ND8";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

// Parse CSV with proper handling of newlines in quoted fields
const parseCSV = (csvText) => {
    const result = [];
    let row = [];
    let currentValue = "";
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (char === '"' && (!insideQuotes || nextChar !== '"')) {
            // Toggle quote state (but not for escaped quotes)
            insideQuotes = !insideQuotes;
            continue;
        }

        if (char === '"' && nextChar === '"') {
            // Handle escaped quotes (double quotes)
            currentValue += '"';
            i++; // Skip the next quote
            continue;
        }

        if (char === ";" && !insideQuotes) {
            // End of field
            row.push(currentValue);
            currentValue = "";
            continue;
        }

        if (
            (char === "\n" || (char === "\r" && nextChar === "\n")) &&
            !insideQuotes
        ) {
            // End of row
            row.push(currentValue);
            result.push(row);
            row = [];
            currentValue = "";
            if (char === "\r") i++; // Skip \n if we encountered \r\n
            continue;
        }

        // Regular character, add to current value
        currentValue += char;
    }

    // Don't forget the last row/value if file doesn't end with newline
    if (currentValue !== "" || row.length > 0) {
        row.push(currentValue);
        result.push(row);
    }

    return result;
};

class Event {
    constructor(
        name,
        hook,
        description,
        date,
        location,
        linkInfo,
        link,
        startTime,
        endTime,
        icon,
        iconAlt,
        categories,
        gcalLink,
        dateForSorting,
        eventTypes
    ) {
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
    }
}


// Helper function to convert row to object
function rowToObject(headers, row) {
    const obj = {};
    headers.forEach((header, index) => {
        obj[header.trim()] = row[index] || "";
    });
    return obj;
}

async function fetchSheetData() {
    try {
        console.log("fetching sheet data ...");
        const response = await fetch(SHEET_URL);
        console.log("sheet data fetched");

        const csvText = await response.text();
        let semicolonCsv = csvText.replace(
            /,(?=(?:(?:[^"]*"){2})*[^"]*$)/g,
            ";",
        );

        const rows = parseCSV(semicolonCsv);
        if (rows.length === 0) return [];

        const headers = rows[0].map((header) => header.trim());

        // Process data rows
        for (let i = 1; i < rows.length; i++) {
            const rowData = rowToObject(headers, rows[i]);

            const name = rowData["Event Name"] || "";
            const hook = rowData["The hook!"] || "";
            const description = rowData["Short Event Description"] || "";
            const date = rowData["Event Date(s)"] || "";
            const location = rowData["Venue Name"] || "";
            let linkInfo = rowData["Registration"] || "";
            let link = rowData["Event link"] || "";
            const incomplete = rowData["Status"];
            const startTime = rowData["Event Start Time"].slice(0, -3) || "";
            const endTime = rowData["Event End Time"].slice(0, -3) || "";
            let icon = rowData["Icon"] || "";
            const iconAlt = rowData["Alttext"] || "";
            const categories = rowData["Target Audience"]
                ? rowData["Target Audience"].split(",")
                : [];
            const gcalLink = rowData["Gcal"] || "";
            const dateForSorting = rowData["Date for sorting"] || "";
            const eventType1 = rowData["Primary type of event"] || "";
            const eventType2 = rowData["Additional type of event"] || "";

            const eventTypes = [eventType1, eventType2].filter((type) => type !== "");

            if (!link.startsWith("http") || link.startsWith("www")) {
                link = "";
            }

            if (icon == "") {
                const iconFolder = ["balls", "ppl"];
                const range = 29;

                const randomIconFolder =
                    iconFolder[Math.floor(Math.random() * iconFolder.length)];

                const randomIconPrefix =
                    randomIconFolder === "balls" ? "ball" : "ppl";

                let randomNumber = Math.floor(Math.random() * range) + 1;
                if (randomNumber == 6) randomNumber = 7;

                icon = `${randomIconFolder}/${randomIconPrefix}_${randomNumber}.png`;
            }

            if (incomplete !== "complete") continue;
            if (events.some((event) => event.name === name)) {
                const existingEvent = events.find((event) => event.name === name);
                existingEvent.date += `, ${date}`;
                continue;
            }
            if (!name || name === "Incomplete") continue;

            events.push(
                new Event(
                    name,
                    hook,
                    description,
                    date,
                    location,
                    linkInfo,
                    link,
                    startTime,
                    endTime,
                    icon,
                    iconAlt,
                    categories,
                    gcalLink,
                    dateForSorting,
                    eventTypes
                ),
            );
        }

        return events;
    } catch (error) {
        console.error("Error fetching sheet data:", error);
        return [];
    }
}

let currentDisplayingEvents = events;
function displayEvents(events) {
    if (!events) {
        events = currentDisplayingEvents;
    } else {
        currentDisplayingEvents = events; // Update the current displaying events
    }

    // Sort by date
    events.sort((a, b) => {
        const dateA = new Date(a.dateForSorting);
        const dateB = new Date(b.dateForSorting);
        return dateA - dateB;
    });

    const container = document.getElementById("schedule-container");
    container.innerHTML = ""; // Clear previous content

    events.forEach((event) => {
        const eventDiv = document.createElement("div");
        eventDiv.className = "event";

        eventDiv.innerHTML = `
                  <section class="textBox2025">

                    <img id="img2025" src="/images/2026/single-images/${event.icon}" alt="${event.icon}" class="eventIcon" />
                    <h3 class="date" id="date2025">${event.date}, ${event.startTime}-${event.endTime}</h3>
                    ${event.gcalLink
                ? `<a href="${event.gcalLink}" target="_blank" class="gcal-icon" title="Add to Google Calendar" aria-label="Add to Google Calendar">📅</a>`
                : ""
            }
                    <div class="DescAndImg">
                      <div class="desc">
                        <h2 class="title" id="title2025">${event.name}</h2>
                        <p class="details" id="description2025">
                          ${event.description}

                          <span id="linkBold2025"> ${event.link ? `<a href="${event.link}" target="_blank">${event.linkInfo}</a>` : `${event.linkInfo}`}
                          </span>

                          </span>
                        </p>
                      </div>
                    </div>

                    <p class="location"><span aria-hidden="true">📍</span>
                      <a href="https://www.google.com/maps/search/${encodeURIComponent(event.location)}"
                        target="_blank"
                        title="View on Google Maps">
                        ${event.location}
                      </a>
                    </p>

                    <p class="categoryContainer2025">
                      ${event.eventTypes
                ?.map((category) => {
                    return `<span class="category2025">${category}</span>`;
                })
                .join("")}

                    </p>

                  </section>
                `;
        container.appendChild(eventDiv);
    });
}

function registerFilterSelectors() {
    // Add event listeners to buttons
    const buttons = document.querySelectorAll("[role='button']");
    buttons.forEach((button) => {
        button.addEventListener("click", (event) => {
            // Prevent default link behavior
            event.preventDefault();

            // 1. Get the data from the button, either day or type
            const day = event.currentTarget.getAttribute("data-day");
            const type = event.currentTarget.getAttribute("data-type");

            const highlightButton = () => {
                event.currentTarget.style.border = "5px solid white";
                event.currentTarget.style.outline = "5px solid #21507f";
            }

            const unhighlightButton = () => {
                event.currentTarget.style.border = "none";
                event.currentTarget.style.outline = "none";
            }

            // 2. Check if it is selected, either add or remove from the filters
            if (day === "All") {
                // If the All Days button is clicked, clear all day filters
                filters.forEach((filter, index) => {
                    if (filter.type === "day") {
                        filters.splice(index, 1);
                    }
                });
                // Unhighlight all day buttons
                buttons.forEach((btn) => {
                    if (btn.getAttribute("data-day")) {
                        btn.style.border = "none";
                        btn.style.outline = "none";
                    }
                });
            }
            else if (filters.some((filter) => filter.type === "day" && filter.value === day)) {
                // If the day filter is already selected, remove it
                filters.splice(filters.findIndex((filter) => filter.type === "day" && filter.value === day), 1);
                unhighlightButton();
            } else if (day) {
                // If the day filter is not selected, add it
                filters.push({ type: "day", value: day });
                highlightButton();
            }

            if (filters.some((filter) => filter.type === "eventType" && filter.value === type)) {
                // If the event type filter is already selected, remove it
                filters.splice(filters.findIndex((filter) => filter.type === "eventType" && filter.value === type), 1);
                unhighlightButton();
            } else if (type) {
                // If the event type filter is not selected, add it
                filters.push({ type: "eventType", value: type });
                highlightButton();
            }

            // 2a. Unselect all if a day filter exists
            if (filters.some((filter) => filter.type === "day")) {
                const allDaysButton = document.querySelector("[data-day='All']");
                if (allDaysButton) {
                    allDaysButton.style.border = "none";
                    allDaysButton.style.outline = "none";
                }
            }

            // 3. Filter the events based on the current filters, re-render
            const filteredEvents = events.filter((event) => {
                // Check day filters
                const dayFilters = filters.filter((filter) => filter.type === "day");

                const eventDays = event.date.split(",").map((date) => date.trim().split(" ")[0]); // Get short day from event date
                if (eventDays.length > 0 && dayFilters.length > 0) {
                    if (!dayFilters.some((filter) => eventDays.some((eventDay) => eventDay.includes(filter.value)))) {
                        return false; // If event doesn't match any selected day, filter it out
                    }
                };

                // Check event type filters
                const typeFilters = filters.filter((filter) => filter.type === "eventType");
                if (typeFilters.length > 0) {
                    if (!typeFilters.some((filter) => event.eventTypes.includes(filter.value))) {
                        return false; // If event doesn't match any selected type, filter it out
                    }
                }

                return true; // If event matches all filters, include it
            });

            // // Otherwise, filter by the selected day
            // const dayShort = day.split(" ")[0];
            // const targetId = `#day${dayShort}`;
            // const targetElement = document.querySelector(targetId);
            // if (targetElement) {
            //     targetElement.scrollIntoView({ behavior: "smooth" });
            // }

            // Rerender events for the selected day
            // const filteredEvents = events.filter((event) =>
            //     event.date.includes(dayShort),
            // );

            displayEvents(filteredEvents);
        });
    });

    // Set All Days button as selected by default
    const allDaysButton = document.querySelector("[data-day='All']");
    if (allDaysButton) {
        allDaysButton.style.border = "3px solid white";
        allDaysButton.style.outline = "6px solid #5f32f3";
    }
}

function handleLoaded() {
    fetchSheetData()
        .then((events) => {
            displayEvents(events);
            registerFilterSelectors();
        })
        .catch((error) => {
            console.error("Error displaying events:", error);
        });
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", handleLoaded);