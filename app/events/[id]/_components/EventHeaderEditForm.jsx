"use client";

import { hours, minutes, periods } from "./timeOptions";

export default function EventHeaderEditForm({
  eventNameInput,
  setEventNameInput,
  themeInput,
  setThemeInput,
  startDateInput,
  setStartDateInput,
  endDateInput,
  setEndDateInput,
  startHour,
  setStartHour,
  startMinute,
  setStartMinute,
  startPeriod,
  setStartPeriod,
  endHour,
  setEndHour,
  endMinute,
  setEndMinute,
  endPeriod,
  setEndPeriod,
  allDayInput,
  setAllDayInput,
  headerError,
  cancelEditEvent,
  saveEventDetails,
  savingEvent,
}) {
  function handleStartDateChange(value) {
    setStartDateInput(value);

    if (!endDateInput) {
      setEndDateInput(value);
    }
  }

  function handleEndDateChange(value) {
    setEndDateInput(value);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#171717] mb-2">
            Event Name
          </label>
          <input
            type="text"
            value={eventNameInput}
            onChange={(e) => setEventNameInput(e.target.value)}
            className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#171717] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
            placeholder="Enter event name"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#171717] mb-2">
            Theme
          </label>
          <input
            type="text"
            value={themeInput}
            onChange={(e) => setThemeInput(e.target.value)}
            className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#171717] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
            placeholder="Enter theme"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#171717] mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDateInput}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#171717] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#171717] mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDateInput}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#171717] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-3 text-sm font-medium text-[#171717]">
            <input
              type="checkbox"
              checked={allDayInput}
              onChange={(e) => setAllDayInput(e.target.checked)}
              className="h-4 w-4 rounded border border-[#E8DCC8] accent-[#F4B942]"
            />
            All Day
          </label>

          <p className="mt-2 text-sm text-[#8C8791]">
            If checked, time fields will be skipped.
          </p>
        </div>

        {!allDayInput ? (
          <>
            <div>
              <label className="block text-sm font-medium text-[#171717] mb-2">
                Start Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="rounded-2xl border border-[#E8DCC8] bg-white px-3 py-3 text-[#171717] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                >
                  {hours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>

                <select
                  value={startMinute}
                  onChange={(e) => setStartMinute(e.target.value)}
                  className="rounded-2xl border border-[#E8DCC8] bg-white px-3 py-3 text-[#171717] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                >
                  {minutes.map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>

                <select
                  value={startPeriod}
                  onChange={(e) => setStartPeriod(e.target.value)}
                  className="rounded-2xl border border-[#E8DCC8] bg-white px-3 py-3 text-[#171717] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                >
                  {periods.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#171717] mb-2">
                End Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="rounded-2xl border border-[#E8DCC8] bg-white px-3 py-3 text-[#171717] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                >
                  {hours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>

                <select
                  value={endMinute}
                  onChange={(e) => setEndMinute(e.target.value)}
                  className="rounded-2xl border border-[#E8DCC8] bg-white px-3 py-3 text-[#171717] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                >
                  {minutes.map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>

                <select
                  value={endPeriod}
                  onChange={(e) => setEndPeriod(e.target.value)}
                  className="rounded-2xl border border-[#E8DCC8] bg-white px-3 py-3 text-[#171717] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                >
                  {periods.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        ) : (
          <div className="md:col-span-2 rounded-2xl border border-[#F3E6CB] bg-[#FFF8EF] px-4 py-3 text-sm text-[#8C8791]">
            This event will be saved as an all-day event.
          </div>
        )}
      </div>

      {headerError ? <p className="text-sm text-red-500">{headerError}</p> : null}

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={cancelEditEvent}
          className="rounded-full border border-[#E8DCC8] bg-white px-5 py-3 text-sm font-semibold text-[#6B7280] hover:bg-[#FFF8EF] transition"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={saveEventDetails}
          disabled={savingEvent}
          className="rounded-full bg-[#E3C56A] px-5 py-3 text-sm font-semibold text-[#5A4A1F] hover:bg-[#d9b954] transition disabled:opacity-70"
        >
          {savingEvent ? "Saving..." : "Save Event"}
        </button>
      </div>
    </div>
  );
}