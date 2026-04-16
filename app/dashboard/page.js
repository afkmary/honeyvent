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
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar";

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
        const q = query(eventsRef, orderBy("date", "asc"));
        const snapshot = await getDocs(q);

        const fetchedEvents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

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
      if (!event.date) return false;

      const eventDate = new Date(`${event.date}T00:00:00`);
      eventDate.setHours(0, 0, 0, 0);

      return eventDate >= today;
    });
  }, [events, today]);

  const pastEvents = useMemo(() => {
    return events.filter((event) => {
      if (!event.date) return false;

      const eventDate = new Date(`${event.date}T00:00:00`);
      eventDate.setHours(0, 0, 0, 0);

      return eventDate < today;
    });
  }, [events, today]);

  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  const upcomingWithoutNext = upcomingEvents.slice(1);

  const pendingTasksCount = useMemo(() => {
    return events.reduce((total, event) => {
      const checklist = Array.isArray(event.checklist) ? event.checklist : [];
      const pending = checklist.filter((item) => !item.completed).length;
      return total + pending;
    }, 0);
  }, [events]);

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

  function formatEventDate(dateString) {
    if (!dateString) return "No date set";

    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString("en-CA", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

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

          {/* LEFT COLUMN - NEXT EVENT */}
          <div className="xl:col-span-2 self-start">
            <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8]">
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
                      {formatEventDate(nextEvent.date)}
                      {nextEvent.startTime ? ` • ${nextEvent.startTime}` : ""}
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
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">

            {/* UPCOMING EVENTS */}
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
                <div className="max-h-70 overflow-y-auto pr-2 space-y-3 flex-1">
                  {upcomingWithoutNext.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl bg-[#FFF8EF] border border-[#F3E6CB] p-4 flex justify-between items-center"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-[#C98C00] font-medium">
                          {formatEventDate(event.date)}
                          {event.startTime ? ` • ${event.startTime}` : ""}
                        </p>

                        <h4 className="text-lg font-semibold text-[#171717] truncate">
                          {event.eventName || "Untitled Event"}
                        </h4>
                      </div>

                      <button
                        onClick={() => router.push(`/events/${event.id}`)}
                        className="ml-4 text-sm font-semibold text-[#C98C00] hover:underline shrink-0"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {upcomingWithoutNext.length > 0 && (
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

            {/* PAST EVENTS */}
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
                <div className="max-h-70 overflow-y-auto pr-2 space-y-3 flex-1">
                  {pastEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl bg-[#F9F5EC] border border-[#EADFCB] p-4 flex justify-between items-center opacity-85"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-[#A89F91]">
                          {formatEventDate(event.date)}
                          {event.startTime ? ` • ${event.startTime}` : ""}
                        </p>

                        <h4 className="text-lg font-semibold text-[#5C5C5C] truncate">
                          {event.eventName || "Untitled Event"}
                        </h4>
                      </div>

                      <button
                        onClick={() => router.push(`/events/${event.id}`)}
                        className="ml-4 text-sm font-semibold text-[#A89F91] hover:underline shrink-0"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {pastEvents.length > 0 && (
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