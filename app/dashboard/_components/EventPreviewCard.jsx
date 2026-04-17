"use client";

import {
  formatEventDate,
  formatEventTime,
  getEventDateValue,
} from "../_utils/dashboardHelpers";

export default function EventPreviewCard({
  event,
  onView,
  muted = false,
}) {
  return (
    <div
      className={`h-27 rounded-2xl px-4 py-3 flex justify-between items-center gap-4 overflow-hidden border ${muted
          ? "bg-[#F9F5EC] border-[#EADFCB] opacity-85"
          : "bg-[#FFF8EF] border-[#F3E6CB]"
        }`}
    >
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm truncate ${muted ? "text-[#A89F91]" : "text-[#C98C00] font-medium"
            }`}
        >
          {formatEventDate(getEventDateValue(event))}
          {formatEventTime(event) ? ` • ${formatEventTime(event)}` : ""}
        </p>

        <h4
          className={`text-lg font-semibold truncate mt-1 ${muted ? "text-[#5C5C5C]" : "text-[#171717]"
            }`}
        >
          {event.eventName || "Untitled Event"}
        </h4>

        <p className="text-sm text-[#8C8791] truncate mt-1">
          {event.theme || "No theme"}
        </p>
      </div>

      <button
        onClick={onView}
        className={`ml-2 text-sm font-semibold hover:underline shrink-0 ${muted ? "text-[#A89F91]" : "text-[#C98C00]"
          }`}
      >
        View
      </button>
    </div>
  );
}