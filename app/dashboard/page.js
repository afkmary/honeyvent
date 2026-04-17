"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  Sparkles,
} from "lucide-react";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar";

function getEventDateValue(event) {
  return event?.startDate || event?.date || "";
}

function getEventComparisonDateValue(event) {
  return event?.endDate || event?.startDate || event?.date || "";
}

function getNormalizedDate(dateString) {
  if (!dateString || typeof dateString !== "string") return null;

  const parts = dateString.split("-");
  if (parts.length !== 3) return null;

  const [year, month, day] = parts.map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  return isNaN(date.getTime()) ? null : date;
}

function formatEventTime(event) {
  if (event?.allDay) return "All Day";
  if (event?.startTime) return event.startTime;
  return "";
}

function formatEventDate(dateString) {
  if (!dateString) return "No date set";

  const date = getNormalizedDate(dateString);
  if (!date) return "No date set";

  return date.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const { user } = useUserAuth();
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    async function fetchEvents() {
      try {
        const eventsRef = collection(db, "users", user.uid, "events");
        const snapshot = await getDocs(eventsRef);

        const fetchedEvents = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => {
            const aDate = getNormalizedDate(getEventComparisonDateValue(a));
            const bDate = getNormalizedDate(getEventComparisonDateValue(b));

            if (!aDate && !bDate) return 0;
            if (!aDate) return 1;
            if (!bDate) return -1;

            return aDate - bDate;
          });

        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoadingEvents(false);
      }
    }

    fetchEvents();
  }, [user, router]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const upcomingEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = getNormalizedDate(getEventComparisonDateValue(event));
      if (!eventDate) return false;

      return eventDate >= today;
    });
  }, [events, today]);

  const pastEvents = useMemo(() => {
    return events
      .filter((event) => {
        const eventDate = getNormalizedDate(getEventComparisonDateValue(event));
        if (!eventDate) return false;

        return eventDate < today;
      })
      .sort((a, b) => {
        const aDate = getNormalizedDate(getEventComparisonDateValue(a));
        const bDate = getNormalizedDate(getEventComparisonDateValue(b));

        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;

        return bDate - aDate;
      });
  }, [events, today]);

  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  const upcomingWithoutNext = upcomingEvents.slice(1);

  const visibleUpcomingPreview = upcomingWithoutNext.slice(0, 2);
  const visiblePastPreview = pastEvents.slice(0, 2);

  const pendingTasksCount = useMemo(() => {
    return events.reduce((total, event) => {
      const eventDate = getNormalizedDate(getEventComparisonDateValue(event));
      if (!eventDate || eventDate < today) return total;

      const checklist = Array.isArray(event.checklist) ? event.checklist : [];
      const pending = checklist.filter((item) => !item.completed).length;

      return total + pending;
    }, 0);
  }, [events, today]);

  const upcomingTasks = useMemo(() => {
    const tasks = [];

    upcomingEvents.forEach((event) => {
      const checklist = Array.isArray(event.checklist)
        ? event.checklist
        : [];

      checklist.forEach((item) => {
        if (!item.completed) {
          tasks.push({
            text: item.text,
            eventName: event.eventName,
            eventId: event.id,
            eventDate: getNormalizedDate(getEventComparisonDateValue(event)),
          });
        }
      });
    });

    // sort by closest event date
    tasks.sort((a, b) => {
      if (!a.eventDate && !b.eventDate) return 0;
      if (!a.eventDate) return 1;
      if (!b.eventDate) return -1;
      return a.eventDate - b.eventDate;
    });

    return tasks.slice(0, 3);
  }, [upcomingEvents]);

  const stats = [
    {
      title: "Total Events",
      value: String(events.length),
      icon: <Sparkles size={18} />,
    },
    {
      title: "Upcoming Events",
      value: String(upcomingEvents.length),
      icon: <CalendarDays size={18} />,
    },
    {
      title: "Pending Tasks",
      value: String(pendingTasksCount),
      icon: <CheckSquare size={18} />,
    },
  ];

  const firstName =
    user?.displayName?.trim()?.split(" ")[0] || "there";

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#FFF8EF] flex">
      <Sidebar />

      <section className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#171717] mb-2">
            What’s the plan today, {firstName}?
          </h1>
          <p className="text-[#6B7280]">
            Here’s a quick look at the hive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-3xl bg-white p-5 shadow-sm border border-[#F0E7D8]"
            >
              <div className="flex items-center justify-between mb-4 text-[#C98C00]">
                {stat.icon}
              </div>

              <p className="text-sm text-[#7A7480] mb-1">{stat.title}</p>

              <h2 className="text-3xl font-semibold text-[#171717]">
                {loadingEvents ? "..." : stat.value}
              </h2>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 flex flex-col gap-6">
            <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] flex-1 flex flex-col">
              <h3 className="text-xl font-semibold text-[#171717] mb-2">
                Your next event
              </h3>

              {loadingEvents ? (
                <div className="rounded-3xl bg-[#FFF8EF] border border-[#F3E6CB] p-5">
                  <p className="text-[#6B7280]">Loading events...</p>
                </div>
              ) : nextEvent ? (
                <div className="rounded-3xl bg-[#FFF8EF] border border-[#F3E6CB] p-5 flex flex-col">
                  <div>
                    <p className="text-sm text-[#C98C00] font-medium mb-2">
                      {formatEventDate(getEventDateValue(nextEvent))}
                      {formatEventTime(nextEvent)
                        ? ` • ${formatEventTime(nextEvent)}`
                        : ""}
                    </p>

                    <h4 className="text-2xl font-semibold text-[#171717] mb-2">
                      {nextEvent.eventName || "Untitled Event"}
                    </h4>

                    <p className="text-[#6B7280] mb-4">
                      Theme: {nextEvent.theme || "No theme set"}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full">
                        Guests: {Array.isArray(nextEvent.guestList) ? nextEvent.guestList.length : 0}
                      </span>

                      <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full">
                        Tasks: {Array.isArray(nextEvent.checklist) ? nextEvent.checklist.length : 0}
                      </span>

                      <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full">
                        Notes: {Array.isArray(nextEvent.notes) ? nextEvent.notes.length : 0}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/events/${nextEvent.id}`)}
                    className="mt-6 self-start rounded-full bg-[#E3C56A] px-5 py-3 text-sm font-semibold text-[#5A4A1F] hover:bg-[#d9b954] transition"
                  >
                    View Event
                  </button>
                </div>
              ) : (
                <div className="rounded-3xl bg-[#FFF8EF] border border-[#F3E6CB] p-6 flex flex-col items-center justify-center text-center">
                  <h4 className="text-xl font-semibold text-[#171717] mb-2">
                    No events yet
                  </h4>

                  <p className="text-[#6B7280] mb-6">
                    Your next event will show up here.
                  </p>

                  <button
                    onClick={() => router.push("/events/create")}
                    className="rounded-full bg-[#E3C56A] px-6 py-3 text-sm font-semibold text-[#5A4A1F] hover:bg-[#d9b954] transition"
                  >
                    Create your next event 🐝
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#171717]">
                  Upcoming Tasks
                </h3>

                <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full">
                  {pendingTasksCount}
                </span>
              </div>

              {upcomingTasks.length === 0 ? (
                <p className="text-[#8C8791]">No pending tasks 🎉</p>
              ) : (
                <div className="space-y-3 flex-1">
                  {upcomingTasks.map((task, index) => (
                    <div
                      key={index}
                      className="rounded-2xl bg-[#FFF8EF] border border-[#F3E6CB] px-4 py-3 flex justify-between items-center gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[#171717] font-medium truncate">
                          {task.text}
                        </p>

                        <p className="text-sm text-[#8C8791] truncate">
                          {task.eventName || "Untitled Event"}
                        </p>
                      </div>

                      <button
                        onClick={() => router.push(`/events/${task.eventId}`)}
                        className="text-sm font-semibold text-[#C98C00] hover:underline shrink-0"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#171717]">
                  Upcoming Events
                </h3>

                <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full">
                  {upcomingWithoutNext.length}
                </span>
              </div>

              {upcomingWithoutNext.length === 0 ? (
                <p className="text-[#8C8791] flex-1">No upcoming events.</p>
              ) : (
                <div className="space-y-3 flex-1">
                  {visibleUpcomingPreview.map((event) => (
                    <div
                      key={event.id}
                      className="h-27 rounded-2xl bg-[#FFF8EF] border border-[#F3E6CB] px-4 py-3 flex justify-between items-center gap-4 overflow-hidden"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#C98C00] font-medium truncate">
                          {formatEventDate(getEventDateValue(event))}
                          {formatEventTime(event)
                            ? ` • ${formatEventTime(event)}`
                            : ""}
                        </p>

                        <h4 className="text-lg font-semibold text-[#171717] truncate mt-1">
                          {event.eventName || "Untitled Event"}
                        </h4>

                        <p className="text-sm text-[#6B7280] truncate mt-1">
                          {event.theme || "No theme"}
                        </p>
                      </div>

                      <button
                        onClick={() => router.push(`/events/${event.id}`)}
                        className="ml-2 text-sm font-semibold text-[#C98C00] hover:underline shrink-0"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {upcomingWithoutNext.length > 2 && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => router.push("/events/upcoming")}
                    className="text-sm font-semibold text-[#C98C00] hover:underline"
                  >
                    See all
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#171717]">
                  Past Events
                </h3>

                <span className="text-xs bg-[#F3EEE3] text-[#8C8791] px-3 py-1 rounded-full">
                  {pastEvents.length}
                </span>
              </div>

              {pastEvents.length === 0 ? (
                <p className="text-[#8C8791] flex-1">No past events.</p>
              ) : (
                <div className="space-y-3 flex-1">
                  {visiblePastPreview.map((event) => (
                    <div
                      key={event.id}
                      className="h-27 rounded-2xl bg-[#F9F5EC] border border-[#EADFCB] px-4 py-3 flex justify-between items-center gap-4 overflow-hidden opacity-85"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#A89F91] truncate">
                          {formatEventDate(getEventDateValue(event))}
                          {formatEventTime(event)
                            ? ` • ${formatEventTime(event)}`
                            : ""}
                        </p>

                        <h4 className="text-lg font-semibold text-[#5C5C5C] truncate mt-1">
                          {event.eventName || "Untitled Event"}
                        </h4>

                        <p className="text-sm text-[#8C8791] truncate mt-1">
                          {event.theme || "No theme"}
                        </p>
                      </div>

                      <button
                        onClick={() => router.push(`/events/${event.id}`)}
                        className="ml-2 text-sm font-semibold text-[#A89F91] hover:underline shrink-0"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {pastEvents.length > 2 && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => router.push("/events/past")}
                    className="text-sm font-semibold text-[#8C8791] hover:underline"
                  >
                    See all
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}