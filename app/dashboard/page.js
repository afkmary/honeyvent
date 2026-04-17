"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckSquare, Sparkles } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar";

import StatCard from "./_components/StatCard";
import SectionCard from "./_components/SectionCard";
import EventPreviewCard from "./_components/EventPreviewCard";
import NextEventCard from "./_components/NextEventCard";
import TasksCard from "./_components/TasksCard";

import {
  getNormalizedDate,
  getEventComparisonDateValue,
  sortEventsByDateAsc,
  sortEventsByDateDesc,
} from "./_utils/dashboardHelpers";

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

        const fetchedEvents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEvents(sortEventsByDateAsc(fetchedEvents));
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
      return eventDate && eventDate >= today;
    });
  }, [events, today]);

  const pastEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      const eventDate = getNormalizedDate(getEventComparisonDateValue(event));
      return eventDate && eventDate < today;
    });

    return sortEventsByDateDesc(filtered);
  }, [events, today]);

  const nextEvent = upcomingEvents[0] || null;
  const upcomingWithoutNext = upcomingEvents.slice(1);

  const visibleUpcomingPreview = upcomingWithoutNext.slice(0, 2);
  const visiblePastPreview = pastEvents.slice(0, 2);

  const pendingTasksCount = useMemo(() => {
    return events.reduce((total, event) => {
      const eventDate = getNormalizedDate(getEventComparisonDateValue(event));
      if (!eventDate || eventDate < today) return total;

      const checklist = Array.isArray(event.checklist) ? event.checklist : [];
      return total + checklist.filter((item) => !item.completed).length;
    }, 0);
  }, [events, today]);

  const upcomingTasks = useMemo(() => {
    const tasks = [];

    upcomingEvents.forEach((event) => {
      const checklist = Array.isArray(event.checklist) ? event.checklist : [];

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

  const firstName = user?.displayName?.trim()?.split(" ")[0] || "there";

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#FFF8EF] flex">
      <Sidebar />

      <section className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#171717] mb-2">
            What’s the plan today, {firstName}?
          </h1>
          <p className="text-[#6B7280]">Here’s a quick look at the hive.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              loading={loadingEvents}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 auto-rows-fr">
          <div className="xl:col-span-2">
            <SectionCard title="Your next event" className="h-full">
              <NextEventCard
                event={nextEvent}
                loading={loadingEvents}
                onView={() => router.push(`/events/${nextEvent.id}`)}
                onCreate={() => router.push("/events/create")}
              />
            </SectionCard>
          </div>

          <div className="xl:col-span-1">
            <SectionCard
              title="Upcoming Events"
              count={upcomingWithoutNext.length}
              countClassName="bg-[#FFF3D6] text-[#C98C00]"
              className="h-full"
              footer={
                upcomingWithoutNext.length > 2 ? (
                  <div className="flex justify-end">
                    <button
                      onClick={() => router.push("/events/upcoming")}
                      className="text-sm font-semibold text-[#C98C00] hover:underline"
                    >
                      See all
                    </button>
                  </div>
                ) : null
              }
            >
              {upcomingWithoutNext.length === 0 ? (
                <p className="text-[#8C8791]">No upcoming events.</p>
              ) : (
                <div className="space-y-3">
                  {visibleUpcomingPreview.map((event) => (
                    <EventPreviewCard
                      key={event.id}
                      event={event}
                      onView={() => router.push(`/events/${event.id}`)}
                    />
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="xl:col-span-2">
            <SectionCard
              title="Upcoming Tasks"
              count={pendingTasksCount}
              countClassName="bg-[#FFF3D6] text-[#C98C00]"
              className="h-full"
            >
              <TasksCard
                tasks={upcomingTasks}
                onViewTask={(eventId) => router.push(`/events/${eventId}`)}
              />
            </SectionCard>
          </div>

          <div className="xl:col-span-1">
            <SectionCard
              title="Past Events"
              count={pastEvents.length}
              countClassName="bg-[#F3EEE3] text-[#8C8791]"
              className="h-full"
              footer={
                pastEvents.length > 2 ? (
                  <div className="flex justify-end">
                    <button
                      onClick={() => router.push("/events/past")}
                      className="text-sm font-semibold text-[#8C8791] hover:underline"
                    >
                      See all
                    </button>
                  </div>
                ) : null
              }
            >
              {pastEvents.length === 0 ? (
                <p className="text-[#8C8791]">No past events.</p>
              ) : (
                <div className="space-y-3">
                  {visiblePastPreview.map((event) => (
                    <EventPreviewCard
                      key={event.id}
                      event={event}
                      muted
                      onView={() => router.push(`/events/${event.id}`)}
                    />
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </section>
    </main>
  );
}