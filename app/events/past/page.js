"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function PastEventsPage() {
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
      try {
        const eventsRef = collection(db, "users", user.uid, "events");
        const q = query(eventsRef, orderBy("date", "desc"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEvents(data);
      } catch (error) {
        console.error("Error fetching past events:", error);
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

  const pastEvents = useMemo(() => {
    return events.filter((event) => {
      if (!event.date) return false;

      const eventDate = new Date(`${event.date}T00:00:00`);
      eventDate.setHours(0, 0, 0, 0);

      return eventDate < today;
    });
  }, [events, today]);

  function formatEventDate(dateString) {
    if (!dateString) return "No date set";

    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString("en-CA", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  async function confirmDelete() {
    if (!user || !selectedEvent) return;

    setDeleting(true);

    try {
      await deleteDoc(doc(db, "users", user.uid, "events", selectedEvent.id));
      setEvents((prev) => prev.filter((event) => event.id !== selectedEvent.id));
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
      <main className="min-h-screen bg-[#FFF8EF] flex">
        <Sidebar />

        <section className="flex-1 p-8">
          <div className="max-w-5xl">
            <h1 className="text-3xl font-semibold text-[#171717] mb-2">
              Past Events
            </h1>
            <p className="text-[#6B7280] mb-8">
              A look back at your past plans.
            </p>

            {loadingEvents ? (
              <div className="rounded-3xl bg-white p-8 border border-[#F0E7D8]">
                <p className="text-[#6B7280]">Loading...</p>
              </div>
            ) : pastEvents.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-center border border-[#F0E7D8]">
                <p className="text-[#8C8791]">No past events yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl bg-white border border-[#F0E7D8] p-5 flex justify-between items-center gap-4 opacity-80"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-[#8C8791] font-medium">
                        {formatEventDate(event.date)}
                        {event.startTime ? ` • ${event.startTime}` : ""}
                      </p>

                      <h2 className="text-xl font-semibold text-[#5C5C5C] truncate">
                        {event.eventName || "Untitled Event"}
                      </h2>

                      <p className="text-[#8C8791] text-sm truncate">
                        {event.theme || "No theme"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => router.push(`/events/${event.id}`)}
                        className="rounded-full bg-[#E9E2D4] px-5 py-3 text-sm font-semibold text-[#6F675D] hover:bg-[#ddd3c1] transition"
                      >
                        View
                      </button>

                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="rounded-full bg-[#F9E1DC] px-5 py-3 text-sm font-semibold text-[#B85C47] hover:bg-[#f3d1ca] transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={!!selectedEvent}
        title="Delete event?"
        description={`Are you sure you want to delete "${selectedEvent?.eventName || "this event"}"? This action cannot be undone.`}
        confirmText="Delete"
        onClose={() => {
          if (!deleting) setSelectedEvent(null);
        }}
        onConfirm={confirmDelete}
        loading={deleting}
        confirmButtonClassName="bg-[#F9E1DC] text-[#B85C47] hover:bg-[#f3d1ca]"
      />
    </>
  );
}