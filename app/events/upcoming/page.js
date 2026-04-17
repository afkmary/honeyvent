"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar";
import ConfirmationModal from "@/components/ConfirmationModal";

function parseLocalDate(dateString) {
  if (!dateString || typeof dateString !== "string") return null;

  const parts = dateString.split("-");
  if (parts.length !== 3) return null;

  const [year, month, day] = parts.map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  return isNaN(date.getTime()) ? null : date;
}

function getEventDisplayDate(event) {
  return event?.startDate || event?.date || "";
}

function getEventUpcomingComparisonDate(event) {
  return event?.endDate || event?.startDate || event?.date || "";
}

function formatEventDate(dateString) {
  const date = parseLocalDate(dateString);
  if (!date) return "No date set";

  return date.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function PageState({ children, centered = false }) {
  return (
    <div
      className={`rounded-3xl border border-[#F0E7D8] bg-white p-8 ${centered ? "text-center" : ""
        }`}
    >
      {children}
    </div>
  );
}

function UpcomingEventCard({ event, onView, onDelete }) {
  const displayDate = getEventDisplayDate(event);

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#F0E7D8] bg-white p-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#C98C00]">
          {formatEventDate(displayDate)}
          {event.startTime ? ` • ${event.startTime}` : ""}
        </p>

        <h2 className="truncate text-xl font-semibold text-[#171717]">
          {event.eventName || "Untitled Event"}
        </h2>

        <p className="truncate text-sm text-[#6B7280]">
          {event.theme || "No theme"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onView}
          className="rounded-full bg-[#E3C56A] px-5 py-3 text-sm font-semibold text-[#5A4A1F] transition hover:bg-[#d9b954]"
        >
          View
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="rounded-full bg-[#F9E1DC] px-5 py-3 text-sm font-semibold text-[#B85C47] transition hover:bg-[#f3d1ca]"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function UpcomingEventsPage() {
  const { user } = useUserAuth();
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    async function fetchEvents() {
      setLoadingEvents(true);

      try {
        const eventsRef = collection(db, "users", user.uid, "events");
        const snapshot = await getDocs(eventsRef);

        const fetchedEvents = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));

        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
      } finally {
        setLoadingEvents(false);
      }
    }

    fetchEvents();
  }, [user, router]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .filter((event) => {
        const comparisonDate = getEventUpcomingComparisonDate(event);
        const eventDate = parseLocalDate(comparisonDate);

        if (!eventDate) return false;

        return eventDate >= today;
      })
      .sort((a, b) => {
        const dateA = parseLocalDate(getEventUpcomingComparisonDate(a));
        const dateB = parseLocalDate(getEventUpcomingComparisonDate(b));

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        return dateA - dateB;
      });
  }, [events]);

  async function handleDeleteConfirm() {
    if (!user || !selectedEvent) return;

    setDeleting(true);

    try {
      await deleteDoc(doc(db, "users", user.uid, "events", selectedEvent.id));

      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== selectedEvent.id)
      );

      setSelectedEvent(null);
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setDeleting(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <main className="flex min-h-screen bg-[#FFF8EF]">
        <Sidebar />

        <section className="flex-1 p-8">
          <div className="max-w-5xl">
            <h1 className="mb-2 text-3xl font-semibold text-[#171717]">
              Upcoming Events
            </h1>
            <p className="mb-8 text-[#6B7280]">
              All your upcoming plans in one place.
            </p>

            {loadingEvents ? (
              <PageState>
                <p className="text-[#6B7280]">Loading...</p>
              </PageState>
            ) : upcomingEvents.length === 0 ? (
              <PageState centered>
                <p className="text-[#8C8791]">No upcoming events yet.</p>
              </PageState>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <UpcomingEventCard
                    key={event.id}
                    event={event}
                    onView={() => router.push(`/events/${event.id}`)}
                    onDelete={() => setSelectedEvent(event)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <ConfirmationModal
        isOpen={!!selectedEvent}
        title="Delete event?"
        description={`Are you sure you want to delete "${selectedEvent?.eventName || "this event"
          }"? This action cannot be undone.`}
        confirmText="Delete"
        onClose={() => {
          if (!deleting) setSelectedEvent(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        confirmButtonClassName="bg-[#F9E1DC] text-[#B85C47] hover:bg-[#f3d1ca]"
      />
    </>
  );
}