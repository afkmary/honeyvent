"use client";

import { CalendarDays, Clock3, Palette } from "lucide-react";
import { formatEventDateRange, formatTimeRange } from "../utils";

export default function EventHeaderDisplay({ eventData, headerError }) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
      <div>
        <h1 className="text-4xl font-semibold text-[#171717] mb-3">
          {eventData?.eventName || "Untitled Event"}
        </h1>

        <div className="flex items-center gap-2 text-[#6B7280] mb-2">
          <Palette size={16} />
          <span>Theme: {eventData?.theme?.trim() || "No theme set"}</span>
        </div>

        {headerError ? (
          <p className="mt-3 text-sm text-red-500">{headerError}</p>
        ) : null}
      </div>

      <div className="rounded-3xl bg-[#FFF8EF] border border-[#F3E6CB] px-5 py-4 min-w-65">
        <div className="flex items-center gap-2 text-[#C98C00] mb-2">
          <CalendarDays size={16} />
          <span className="font-medium">
            {formatEventDateRange(
              eventData?.startDate,
              eventData?.endDate,
              eventData?.date
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#6B7280]">
          <Clock3 size={16} />
          <span>{formatTimeRange(eventData?.startTime, eventData?.endTime)}</span>
        </div>
      </div>
    </div>
  );
}