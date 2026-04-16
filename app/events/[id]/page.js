"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  CalendarDays,
  Clock3,
  Palette,
  Users,
  CheckSquare,
  StickyNote,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { useUserAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar";

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

  function formatEventDate(dateString) {
    if (!dateString) return "No date set";

    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString("en-CA", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTimeRange(start, end) {
    if (!start && !end) return "No time set";
    if (start && end) return `${start} - ${end}`;
    return start || end;
  }

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
            <div className="rounded-4xl bg-white shadow-sm border border-[#F0E7D8] overflow-hidden">
              <div className="h-55 bg-linear-to-r from-[#F6D37A] via-[#F4B942] to-[#E8C867]" />

              <div className="p-8">
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                  <div>
                    <h1 className="text-4xl font-semibold text-[#171717] mb-3">
                      {eventData.eventName || "Untitled Event"}
                    </h1>

                    <div className="flex items-center gap-2 text-[#6B7280] mb-2">
                      <Palette size={16} />
                      <span>
                        Theme: {eventData.theme?.trim() || "No theme set"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-[#FFF8EF] border border-[#F3E6CB] px-5 py-4 min-w-65">
                    <div className="flex items-center gap-2 text-[#C98C00] mb-2">
                      <CalendarDays size={16} />
                      <span className="font-medium">
                        {formatEventDate(eventData.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <Clock3 size={16} />
                      <span>{formatTimeRange(eventData.startTime, eventData.endTime)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* GUESTLIST */}
              <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-[#171717]">
                    <Users size={18} />
                    Guest List
                  </h2>

                  <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full font-semibold">
                    {guestList.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4 w-full max-w-100 mx-auto">
                  <input
                    type="text"
                    value={guestInput}
                    onChange={(e) => setGuestInput(e.target.value)}
                    placeholder="Add guest"
                    className="min-w-0 flex-1 rounded-full border border-[#E8DCC8] bg-[#FFFDF8] px-3 py-2 text-sm text-[#171717] placeholder:text-[#C4B8A5] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                  />
                  <button
                    type="button"
                    onClick={addGuest}
                    disabled={savingSection === "guest"}
                    className="shrink-0 rounded-full bg-[#F4B942] px-3 py-2 text-xs font-bold text-white shadow-sm hover:scale-105 hover:bg-[#e5a932] transition disabled:opacity-70"
                  >
                    +
                  </button>
                </div>

                <div className="space-y-3">
                  {guestList.length === 0 ? (
                    <p className="text-sm text-[#8C8791]">No guests added yet.</p>
                  ) : (
                    guestList.map((guest, index) => (
                      <div
                        key={`${guest.name}-${index}`}
                        className="rounded-2xl bg-[#FFF8EF] border border-[#F3E6CB] px-4 py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-[#171717] font-medium">{guest.name}</p>
                          <p className="text-sm text-[#8C8791] capitalize">
                            {guest.status || "invited"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeGuest(index)}
                          className="text-sm text-[#D47D69] hover:text-[#bb5f49] transition"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* CHECKLIST*/}
              <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-[#171717]">
                    <CheckSquare size={18} />
                    Checklist
                  </h2>

                  <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full font-semibold">
                    {checklist.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4 w-full max-w-100 mx-auto">
                  <input
                    type="text"
                    value={checklistInput}
                    onChange={(e) => setChecklistInput(e.target.value)}
                    placeholder="Add task"
                    className="min-w-0 flex-1 rounded-full border border-[#E8DCC8] bg-[#FFFDF8] px-3 py-2 text-sm text-[#171717] placeholder:text-[#C4B8A5] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                  />
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    disabled={savingSection === "checklist"}
                    className="shrink-0 rounded-full bg-[#F4B942] px-3 py-2 text-xs font-bold text-white shadow-sm hover:scale-105 hover:bg-[#e5a932] transition disabled:opacity-70"
                  >
                    +
                  </button>
                </div>

                <div className="space-y-3">
                  {checklist.length === 0 ? (
                    <p className="text-sm text-[#8C8791]">No tasks added yet.</p>
                  ) : (
                    checklist.map((item, index) => (
                      <div
                        key={`${item.text}-${index}`}
                        className="rounded-2xl bg-[#FFF8EF] border border-[#F3E6CB] px-4 py-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={!!item.completed}
                            onChange={() => toggleChecklistItem(index)}
                            className="mt-1 accent-[#F4B942]"
                          />
                          <div>
                            <p
                              className={`font-medium ${item.completed
                                ? "text-[#8C8791] line-through"
                                : "text-[#171717]"
                                }`}
                            >
                              {item.text}
                            </p>
                            <p className="text-sm text-[#8C8791]">
                              {item.completed ? "Completed" : "Pending"}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeChecklistItem(index)}
                          className="text-sm text-[#D47D69] hover:text-[#bb5f49] transition"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* NOTES */}
              <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-[#171717]">
                    <StickyNote size={18} />
                    Notes
                  </h2>

                  <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full font-semibold">
                    {notes.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4 w-full max-w-100 mx-auto">
                  <input
                    type="text"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Add note"
                    className="min-w-0 flex-1 rounded-full border border-[#E8DCC8] bg-[#FFFDF8] px-3 py-2 text-sm text-[#171717] placeholder:text-[#C4B8A5] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                  />
                  <button
                    type="button"
                    onClick={addNote}
                    disabled={savingSection === "note"}
                    className="shrink-0 rounded-full bg-[#F4B942] px-3 py-2 text-xs font-bold text-white shadow-sm hover:scale-105 hover:bg-[#e5a932] transition disabled:opacity-70"
                  >
                    +
                  </button>
                </div>

                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <p className="text-sm text-[#8C8791]">No notes added yet.</p>
                  ) : (
                    notes.map((note, index) => (
                      <div
                        key={`${note.text}-${index}`}
                        className="rounded-2xl bg-[#FFF8EF] border border-[#F3E6CB] px-4 py-3 flex items-center justify-between"
                      >
                        <p className="text-[#171717]">{note.text}</p>

                        <button
                          type="button"
                          onClick={() => removeNote(index)}
                          className="text-sm text-[#D47D69] hover:text-[#bb5f49] transition"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}