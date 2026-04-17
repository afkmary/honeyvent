export function getEventDateValue(event) {
  return event?.startDate || event?.date || "";
}

export function getEventComparisonDateValue(event) {
  return event?.endDate || event?.startDate || event?.date || "";
}

export function getNormalizedDate(dateString) {
  if (!dateString || typeof dateString !== "string") return null;

  const parts = dateString.split("-");
  if (parts.length !== 3) return null;

  const [year, month, day] = parts.map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatEventTime(event) {
  if (event?.allDay) return "All Day";
  if (event?.startTime) return event.startTime;
  return "";
}

export function formatEventDate(dateString) {
  if (!dateString) return "No date set";

  const date = getNormalizedDate(dateString);
  if (!date) return "No date set";

  return date.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function sortEventsByDateAsc(events) {
  return [...events].sort((a, b) => {
    const aDate = getNormalizedDate(getEventComparisonDateValue(a));
    const bDate = getNormalizedDate(getEventComparisonDateValue(b));

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;

    return aDate - bDate;
  });
}

export function sortEventsByDateDesc(events) {
  return [...events].sort((a, b) => {
    const aDate = getNormalizedDate(getEventComparisonDateValue(a));
    const bDate = getNormalizedDate(getEventComparisonDateValue(b));

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;

    return bDate - aDate;
  });
}