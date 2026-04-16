"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar";

export default function CalendarPage() {
  const { user } = useUserAuth();
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return formatDateKey(today);
  });

  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [jumpDate, setJumpDate] = useState(() => formatDateKey(new Date()));

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    async function fetchEvents() {
      try {
        const eventsRef = collection(db, "users", user.uid, "events");
        const q = query(eventsRef, orderBy("date", "asc"));
        const snapshot = await getDocs(q);

        const fetchedEvents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching calendar events:", error);
      } finally {
        setLoadingEvents(false);
      }
    }

    fetchEvents();
  }, [user, router]);

  const monthLabel = currentMonth.toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });

  const todayKey = formatDateKey(new Date());

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayIndex = firstDayOfMonth.getDay();

    const firstCalendarDate = new Date(year, month, 1 - startDayIndex);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(firstCalendarDate);
      date.setDate(firstCalendarDate.getDate() + index);
      return date;
    });
  }, [currentMonth]);

  const eventsByDate = useMemo(() => {
    const grouped = {};

    for (const event of events) {
      if (!event.date) continue;

      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }

      grouped[event.date].push(event);
    }

    return grouped;
  }, [events]);

  const selectedDateEvents = eventsByDate[selectedDate] || [];

  function goToPreviousMonth() {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  function handleJumpToDate() {
    if (!jumpDate) return;

    const chosenDate = new Date(`${jumpDate}T00:00:00`);
    setCurrentMonth(new Date(chosenDate.getFullYear(), chosenDate.getMonth(), 1));
    setSelectedDate(jumpDate);
    setShowDatePickerModal(false);
  }

  function formatReadableDate(dateKey) {
    const date = new Date(`${dateKey}T00:00:00`);
    return date.toLocaleDateString("en-CA", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function isSameMonth(date) {
    return (
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  }

  function getDayDotInfo(dateKey) {
    const dayEvents = eventsByDate[dateKey] || [];
    if (dayEvents.length === 0) return [];

    const hasPast = dayEvents.some((event) => event.date < todayKey);
    const hasToday = dayEvents.some((event) => event.date === todayKey);
    const hasUpcoming = dayEvents.some((event) => event.date > todayKey);

    const dots = [];
    if (hasPast) dots.push("past");
    if (hasToday) dots.push("today");
    if (hasUpcoming) dots.push("upcoming");

    return dots;
  }

  if (!user) return null;

  return (
    <>
      <main className="min-h-screen bg-[#FFF8EF] flex">
        <Sidebar />

        <section className="flex-1 p-8">
          <div className="max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-[#171717] mb-2">
                Calendar
              </h1>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.9fr] gap-8">
              {/* LEFT: CALENDAR */}
              <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={goToPreviousMonth}
                      className="rounded-full border border-[#E8DCC8] bg-[#FFF8EF] p-2 text-[#5A4A1F] hover:bg-[#F9F4EA] transition"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <h2 className="text-2xl font-semibold text-[#171717] min-w-45 text-center">
                      {monthLabel}
                    </h2>

                    <button
                      type="button"
                      onClick={goToNextMonth}
                      className="rounded-full border border-[#E8DCC8] bg-[#FFF8EF] p-2 text-[#5A4A1F] hover:bg-[#F9F4EA] transition"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setJumpDate(selectedDate || formatDateKey(new Date()));
                      setShowDatePickerModal(true);
                    }}
                    className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-[#F5F5F5] px-4 py-2 text-sm text-[#5E5963] hover:bg-[#ECECEC] transition"
                  >
                    <CalendarDays size={16} />
                    Go to date
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 mb-5 text-xs">
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E3C56A]" />
                    Today
                  </div>
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D8A48F]" />
                    Past
                  </div>
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A7C7A3]" />
                    Upcoming
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-3 mb-3">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-[#8C8791] py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-3">
                  {calendarDays.map((date) => {
                    const dateKey = formatDateKey(date);
                    const dayEvents = eventsByDate[dateKey] || [];
                    const selected = selectedDate === dateKey;
                    const currentMonthDay = isSameMonth(date);
                    const isTodayDate = dateKey === todayKey;
                    const dotTypes = getDayDotInfo(dateKey);

                    return (
                      <button
                        key={dateKey}
                        type="button"
                        onClick={() => setSelectedDate(dateKey)}
                        className={`min-h-25 rounded-3xl border p-3 text-left transition ${selected
                          ? "bg-[#FFF3D6] border-[#E3C56A]"
                          : "bg-[#FFFCF7] border-[#F0E7D8] hover:bg-[#FFF8EF]"
                          } ${currentMonthDay ? "text-[#171717]" : "text-[#B3ABA0]"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-sm font-semibold ${isTodayDate
                              ? "rounded-full bg-[#E3C56A] px-2 py-0.5 text-[#5A4A1F]"
                              : ""
                              }`}
                          >
                            {date.getDate()}
                          </span>

                          {dayEvents.length > 0 && (
                            <span className="text-[11px] rounded-full bg-[#F7E4C3] px-2 py-0.5 text-[#A07F28] font-medium">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mb-2 min-h-3">
                          {dotTypes.includes("today") && (
                            <span className="w-2 h-2 rounded-full bg-[#E3C56A]" />
                          )}
                          {dotTypes.includes("past") && (
                            <span className="w-2 h-2 rounded-full bg-[#D8A48F]" />
                          )}
                          {dotTypes.includes("upcoming") && (
                            <span className="w-2 h-2 rounded-full bg-[#A7C7A3]" />
                          )}
                        </div>

                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className="truncate rounded-full bg-white/90 px-2 py-1 text-[11px] text-[#6B7280] border border-[#F3E6CB]"
                            >
                              {event.eventName || "Untitled Event"}
                            </div>
                          ))}

                          {dayEvents.length > 2 && (
                            <div className="text-[11px] text-[#A07F28] font-medium px-1">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: SELECTED DAY EVENTS */}
              <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] self-start">
                <h3 className="text-xl font-semibold text-[#171717] mb-2">
                  {formatReadableDate(selectedDate)}
                </h3>
                <p className="text-[#7A7480] mb-6">
                  {selectedDateEvents.length} event{selectedDateEvents.length === 1 ? "" : "s"} planned
                </p>

                {loadingEvents ? (
                  <p className="text-[#6B7280]">Loading events...</p>
                ) : selectedDateEvents.length === 0 ? (
                  <div className="rounded-3xl bg-[#FFF8EF] border border-[#F3E6CB] p-6 text-center">
                    <p className="text-[#8C8791] mb-4">
                      Nothing planned for this day yet.
                    </p>

                    <button
                      onClick={() => router.push("/events/create")}
                      className="rounded-full bg-[#E3C56A] px-5 py-3 text-sm font-semibold text-[#5A4A1F] hover:bg-[#d9b954] transition"
                    >
                      Create Event
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className="rounded-3xl bg-[#FFF8EF] border border-[#F3E6CB] p-4"
                      >
                        <p className="text-sm text-[#C98C00] font-medium mb-2">
                          {event.startTime
                            ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}`
                            : "No time set"}
                        </p>

                        <h4 className="text-lg font-semibold text-[#171717] mb-1">
                          {event.eventName || "Untitled Event"}
                        </h4>

                        <p className="text-sm text-[#6B7280] mb-4">
                          Theme: {event.theme || "No theme set"}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
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

                        <button
                          onClick={() => router.push(`/events/${event.id}`)}
                          className="rounded-full bg-[#E3C56A] px-4 py-2 text-sm font-semibold text-[#5A4A1F] hover:bg-[#d9b954] transition"
                        >
                          View Event
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* DATE PICKER MODAL */}
      {showDatePickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-xl border border-[#F0E7D8]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-[#171717]">
                Go to date
              </h2>

              <button
                type="button"
                onClick={() => setShowDatePickerModal(false)}
                className="rounded-full p-2 text-[#8C8791] hover:bg-[#F5F5F5] transition"
              >
                <X size={18} />
              </button>
            </div>

            <input
              type="date"
              value={jumpDate}
              onChange={(e) => setJumpDate(e.target.value)}
              className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#171717] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDatePickerModal(false)}
                className="rounded-full bg-[#F5F5F5] px-5 py-3 text-sm font-semibold text-[#5E5963] hover:bg-[#ECECEC] transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleJumpToDate}
                className="rounded-full bg-[#E3C56A] px-5 py-3 text-sm font-semibold text-[#5A4A1F] hover:bg-[#d9b954] transition"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}