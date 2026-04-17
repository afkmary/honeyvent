export function formatEventDateRange(startDate, endDate, fallbackDate) {
  const effectiveStart = startDate || fallbackDate || "";
  const effectiveEnd = endDate || effectiveStart;

  if (!effectiveStart) return "No date set";

  const start = new Date(`${effectiveStart}T00:00:00`);
  const end = new Date(`${effectiveEnd}T00:00:00`);

  const startFormatted = start.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const endFormatted = end.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (effectiveStart === effectiveEnd) {
    return startFormatted;
  }

  return `${startFormatted} — ${endFormatted}`;
}

export function formatTimeRange(start, end) {
  if (!start && !end) return "No time set";
  if (start && end) return `${start} - ${end}`;
  return start || end;
}

export function getSafeGuestList(eventData) {
  return Array.isArray(eventData?.guestList) ? eventData.guestList : [];
}

export function getSafeChecklist(eventData) {
  return Array.isArray(eventData?.checklist) ? eventData.checklist : [];
}

export function getSafeNotes(eventData) {
  return Array.isArray(eventData?.notes) ? eventData.notes : [];
}

export function getSelectedTask(checklist, selectedTaskIndex) {
  if (selectedTaskIndex === null) return null;
  return checklist[selectedTaskIndex] || null;
}