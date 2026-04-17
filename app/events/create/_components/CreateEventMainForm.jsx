"use client";

import { useEffect } from "react";
import {
  CalendarDays,
  Clock3,
  Palette,
  Type,
  Image as ImageIcon,
} from "lucide-react";

const hours = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

const minutes = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0")
);

const periods = ["AM", "PM"];

export default function CreateEventMainForm({
  eventName,
  setEventName,
  theme,
  setTheme,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
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
  imageFile,
  setImageFile,
  imagePreview,
  setImagePreview,
  setError,
}) {
  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile, setImagePreview]);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setError("");
  }

  return (
    <>
      <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#171717] mb-2">
              <Type size={16} />
              Event Name
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Ex. Garden Tea Birthday"
              className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#171717] placeholder:text-[#B6B6B6] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#171717] mb-2">
              <Palette size={16} />
              Theme
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex. Yellow & Brown"
              className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#171717] placeholder:text-[#B6B6B6] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#171717] mb-2">
              <ImageIcon size={16} />
              Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 text-sm text-[#171717] file:mr-4 file:rounded-full file:border-0 file:bg-[#F4B942] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#e5a932]"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#171717] mb-2">
              <CalendarDays size={16} />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#171717] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#171717] mb-2">
              <CalendarDays size={16} />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#171717] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#171717] mb-2">
              <Clock3 size={16} />
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
            <label className="flex items-center gap-2 text-sm font-medium text-[#171717] mb-2">
              <Clock3 size={16} />
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
        </div>
      </div>

      {imagePreview ? (
        <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8]">
          <div className="flex items-center gap-2 text-lg font-semibold text-[#171717] mb-4">
            <ImageIcon size={18} />
            Image Preview
          </div>

          <img
            src={imagePreview}
            alt="Selected event cover preview"
            className="w-full h-64 object-cover rounded-3xl border border-[#F3E6CB]"
          />
        </div>
      ) : null}
    </>
  );
}