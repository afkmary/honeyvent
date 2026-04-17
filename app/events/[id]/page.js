"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { CheckSquare, StickyNote, X } from "lucide-react";
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

  const [guestError, setGuestError] = useState("");

  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  const [selectedTaskNoteInput, setSelectedTaskNoteInput] = useState("");
  const [showTaskNoteModal, setShowTaskNoteModal] = useState(false);

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

  const selectedTask =
    selectedTaskIndex !== null && checklist[selectedTaskIndex]
      ? checklist[selectedTaskIndex]
      : null;

  useEffect(() => {
    if (selectedTaskIndex === null) return;

    if (!checklist[selectedTaskIndex]) {
      setSelectedTaskIndex(null);
      setSelectedTaskNoteInput("");
      setShowTaskNoteModal(false);
      return;
    }

    setSelectedTaskNoteInput(checklist[selectedTaskIndex].note || "");
  }, [checklist, selectedTaskIndex]);

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

    const normalizedInput = trimmed.toLowerCase();

    const alreadyExists = guestList.some(
      (guest) => guest.name?.trim().toLowerCase() === normalizedInput
    );

    if (alreadyExists) {
      setGuestError("That guest is already on the list.");
      return;
    }

    const updatedGuests = [
      ...guestList,
      {
        name: trimmed,
        status: "invited",
      },
    ];

    await saveField("guestList", updatedGuests, "guest");
    setGuestInput("");
    setGuestError("");
  }

  async function removeGuest(indexToRemove) {
    const updatedGuests = guestList.filter((_, index) => index !== indexToRemove);
    await saveField("guestList", updatedGuests, "guest");
    setGuestError("");
  }

  async function addChecklistItem() {
    const trimmed = checklistInput.trim();
    if (!trimmed) return;

    const updatedChecklist = [
      ...checklist,
      {
        text: trimmed,
        completed: false,
        note: "",
      },
    ];

    await saveField("checklist", updatedChecklist, "checklist");
    setChecklistInput("");
  }

  async function removeChecklistItem(indexToRemove) {
    const updatedChecklist = checklist.filter((_, index) => index !== indexToRemove);

    await saveField("checklist", updatedChecklist, "checklist");

    if (selectedTaskIndex === indexToRemove) {
      setSelectedTaskIndex(null);
      setSelectedTaskNoteInput("");
      setShowTaskNoteModal(false);
    } else if (selectedTaskIndex !== null && selectedTaskIndex > indexToRemove) {
      setSelectedTaskIndex((prev) => prev - 1);
    }
  }

  async function toggleChecklistItem(indexToToggle) {
    const updatedChecklist = checklist.map((item, index) =>
      index === indexToToggle
        ? { ...item, completed: !item.completed }
        : item
    );

    await saveField("checklist", updatedChecklist, "checklist");
  }

  function selectTask(indexToSelect) {
    const task = checklist[indexToSelect];
    if (!task) return;

    setSelectedTaskIndex(indexToSelect);
    setSelectedTaskNoteInput(task.note || "");
    setShowTaskNoteModal(true);
  }

  function closeTaskNoteModal() {
    setShowTaskNoteModal(false);
  }

  async function saveSelectedTaskNote() {
    if (selectedTaskIndex === null || !checklist[selectedTaskIndex]) return;

    const updatedChecklist = checklist.map((item, index) =>
      index === selectedTaskIndex
        ? { ...item, note: selectedTaskNoteInput.trim() }
        : item
    );

    await saveField("checklist", updatedChecklist, "checklist");
    setShowTaskNoteModal(false);
  }

  async function clearSelectedTaskNote() {
    if (selectedTaskIndex === null || !checklist[selectedTaskIndex]) return;

    const updatedChecklist = checklist.map((item, index) =>
      index === selectedTaskIndex
        ? { ...item, note: "" }
        : item
    );

    await saveField("checklist", updatedChecklist, "checklist");
    setSelectedTaskNoteInput("");
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
    <>
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
                  guestError={guestError}
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
                  selectedTaskIndex={selectedTaskIndex}
                  onSelectTask={selectTask}
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

      {showTaskNoteModal && selectedTask ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="relative w-full max-w-lg rounded-[28px] bg-white p-6 shadow-xl border border-[#F0E7D8]">
            <button
              type="button"
              onClick={closeTaskNoteModal}
              className="absolute right-4 top-4 rounded-full p-2 text-[#8C8791] hover:bg-[#F5F5F5] transition"
            >
              <X size={18} />
            </button>

            <div className="mb-4">
              <div className="inline-flex items-center rounded-full bg-[#FFF3D6] px-3 py-1 text-xs font-semibold text-[#C98C00] mb-3">
                Task Note
              </div>

              <div className="rounded-2xl bg-[#FFF8EF] border border-[#F3E6CB] px-4 py-3">
                <p className="text-sm text-[#8C8791] mb-1">Task</p>
                <p className="font-medium text-[#171717] break-words [overflow-wrap:anywhere]">
                  {selectedTask.text}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#171717] mb-2">
                  Note for this task
                </label>
                <textarea
                  value={selectedTaskNoteInput}
                  onChange={(e) => setSelectedTaskNoteInput(e.target.value)}
                  rows={6}
                  placeholder="Add details, reminders, links, or anything helpful for this task..."
                  className="w-full rounded-2xl border border-[#E8DCC8] bg-[#FFFDF8] px-4 py-3 text-sm text-[#171717] placeholder:text-[#C4B8A5] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20 resize-none"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={clearSelectedTaskNote}
                  disabled={savingSection === "checklist"}
                  className="rounded-full border border-[#E8DCC8] bg-white px-5 py-3 text-sm font-semibold text-[#6B7280] hover:bg-[#FFF8EF] transition disabled:opacity-70"
                >
                  Clear Note
                </button>

                <button
                  type="button"
                  onClick={saveSelectedTaskNote}
                  disabled={savingSection === "checklist"}
                  className="rounded-full bg-[#E3C56A] px-5 py-3 text-sm font-semibold text-[#5A4A1F] hover:bg-[#d9b954] transition disabled:opacity-70"
                >
                  {savingSection === "checklist" ? "Saving..." : "Save Note"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}