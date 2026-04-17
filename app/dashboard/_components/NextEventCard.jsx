"use client";

import {
  formatEventDate,
  formatEventTime,
  getEventDateValue,
} from "../_utils/dashboardHelpers";

export default function NextEventCard({ event, loading, onView, onCreate }) {
  if (loading) {
    return (
      <div className="rounded-3xl bg-[#FFF8EF] border border-[#F3E6CB] p-5 h-full">
        <p className="text-[#6B7280]">Loading events...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="rounded-3xl bg-[#FFF8EF] border border-[#F3E6CB] p-6 h-full flex flex-col items-center justify-center text-center">
        <h4 className="text-xl font-semibold text-[#171717] mb-2">
          No events yet
        </h4>

        <p className="text-[#6B7280] mb-6">
          Your next event will show up here.
        </p>

        <button
          onClick={onCreate}
          className="rounded-full bg-[#E3C56A] px-6 py-3 text-sm font-semibold text-[#5A4A1F] hover:bg-[#d9b954] transition"
        >
          Create your next event 🐝
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-[#FFF8EF] border border-[#F3E6CB] p-5 flex flex-col h-full justify-between overflow-hidden">
      <div>
        <p className="text-sm text-[#C98C00] font-medium mb-2">
          {formatEventDate(getEventDateValue(event))}
          {formatEventTime(event) ? ` • ${formatEventTime(event)}` : ""}
        </p>

        <h4 className="text-2xl font-semibold text-[#171717] mb-2">
          {event.eventName || "Untitled Event"}
        </h4>

        <p className="text-[#6B7280] mb-4">
          Theme: {event.theme || "No theme set"}
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full">
            Guests: {Array.isArray(event.guestList) ? event.guestList.length : 0}
          </span>

          <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full">
            Tasks: {Array.isArray(event.checklist) ? event.checklist.length : 0}
          </span>

          <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full">
            Notes: {Array.isArray(event.notes) ? event.notes.length : 0}
          </span>
        </div>
      </div>

      <button
        onClick={onView}
        className="mt-6 self-start rounded-full bg-[#E3C56A] px-5 py-3 text-sm font-semibold text-[#5A4A1F] hover:bg-[#d9b954] transition"
      >
        View Event
      </button>
    </div>
  );
}