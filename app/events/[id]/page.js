"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Users, CheckSquare, StickyNote } from "lucide-react";
import { db } from "@/lib/firebase";
import { useUserAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar";
import EventHeaderCard from "./_components/EventHeaderCard";
import GuestListCard from "./_components/GuestListCard";
import ChecklistCard from "./_components/ChecklistCard";
import NotesCard from "./_components/NotesCard";

export default function EventDetailsPage() {
  const { user } = useUserAuth();
  const router = useRouter();
  const params = useParams();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState("");

  const [guestInput, setGuestInput] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  const eventId = params?.id;

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!eventId) return;

    async function fetchEvent() {
      try {
        const eventRef = doc(db, "users", user.uid, "events", eventId);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
          setEventData({
            id: eventSnap.id,
            ...eventSnap.data(),
          });
        } else {
          setEventData(null);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setEventData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [user, router, eventId]);

  const guestList = useMemo(
    () => (Array.isArray(eventData?.guestList) ? eventData.guestList : []),
    [eventData]
  );

  const checklist = useMemo(
    () => (Array.isArray(eventData?.checklist) ? eventData.checklist : []),
    [eventData]
  );

  const notes = useMemo(
    () => (Array.isArray(eventData?.notes) ? eventData.notes : []),
    [eventData]
  );

  async function saveField(fieldName, newValue, sectionName) {
    if (!user || !eventId) return;

    setSavingSection(sectionName);

    try {
      const eventRef = doc(db, "users", user.uid, "events", eventId);
      await updateDoc(eventRef, {
        [fieldName]: newValue,
      });

      setEventData((prev) => ({
        ...prev,
        [fieldName]: newValue,
      }));
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
    } finally {
      setSavingSection("");
    }
  }

  async function addGuest() {
    const trimmed = guestInput.trim();
    if (!trimmed) return;

    const updatedGuests = [
      ...guestList,
      {
        name: trimmed,
        status: "invited",
      },
    ];

    await saveField("guestList", updatedGuests, "guest");
    setGuestInput("");
  }

  async function removeGuest(indexToRemove) {
    const updatedGuests = guestList.filter((_, index) => index !== indexToRemove);
    await saveField("guestList", updatedGuests, "guest");
  }

  async function addChecklistItem() {
    const trimmed = checklistInput.trim();
    if (!trimmed) return;

    const updatedChecklist = [
      ...checklist,
      {
        text: trimmed,
        completed: false,
      },
    ];

    await saveField("checklist", updatedChecklist, "checklist");
    setChecklistInput("");
  }

  async function removeChecklistItem(indexToRemove) {
    const updatedChecklist = checklist.filter(
      (_, index) => index !== indexToRemove
    );
    await saveField("checklist", updatedChecklist, "checklist");
  }

  async function toggleChecklistItem(indexToToggle) {
    const updatedChecklist = checklist.map((item, index) =>
      index === indexToToggle
        ? { ...item, completed: !item.completed }
        : item
    );

    await saveField("checklist", updatedChecklist, "checklist");
  }

  async function addNote() {
    const trimmed = notesInput.trim();
    if (!trimmed) return;

    const updatedNotes = [
      ...notes,
      {
        text: trimmed,
      },
    ];

    await saveField("notes", updatedNotes, "note");
    setNotesInput("");
  }

  async function removeNote(indexToRemove) {
    const updatedNotes = notes.filter((_, index) => index !== indexToRemove);
    await saveField("notes", updatedNotes, "note");
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#FFF8EF] flex">
      <Sidebar />

      <section className="flex-1 p-8">
        {loading ? (
          <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8]">
            <p className="text-[#6B7280]">Loading event...</p>
          </div>
        ) : !eventData ? (
          <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8]">
            <h1 className="text-2xl font-semibold text-[#171717] mb-2">
              Event not found
            </h1>
            <p className="text-[#6B7280] mb-4">
              We couldn’t find that event in your hive.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-full bg-[#E3C56A] px-5 py-3 text-sm font-semibold text-[#5A4A1F] hover:bg-[#d9b954] transition"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <EventHeaderCard
              user={user}
              eventId={eventId}
              eventData={eventData}
              setEventData={setEventData}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <GuestListCard
                guestList={guestList}
                guestInput={guestInput}
                setGuestInput={setGuestInput}
                addGuest={addGuest}
                removeGuest={removeGuest}
                saving={savingSection === "guest"}
                icon={Users}
              />

              <ChecklistCard
                checklist={checklist}
                checklistInput={checklistInput}
                setChecklistInput={setChecklistInput}
                addChecklistItem={addChecklistItem}
                removeChecklistItem={removeChecklistItem}
                toggleChecklistItem={toggleChecklistItem}
                saving={savingSection === "checklist"}
                icon={CheckSquare}
              />

              <NotesCard
                notes={notes}
                notesInput={notesInput}
                setNotesInput={setNotesInput}
                addNote={addNote}
                removeNote={removeNote}
                saving={savingSection === "note"}
                icon={StickyNote}
              />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}