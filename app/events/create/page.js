"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
  CalendarDays,
  Clock3,
  Palette,
  Type,
  Users,
  CheckSquare,
  StickyNote,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { useUserAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar";

export default function CreateEventPage() {
  const { user } = useUserAuth();
  const router = useRouter();

  const [eventName, setEventName] = useState("");
  const [theme, setTheme] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [guestInput, setGuestInput] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  const [guestList, setGuestList] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [notes, setNotes] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  function addGuest() {
    const trimmed = guestInput.trim();
    if (!trimmed) return;

    setGuestList((prev) => [
      ...prev,
      {
        name: trimmed,
        status: "invited",
      },
    ]);
    setGuestInput("");
  }

  function addChecklistItem() {
    const trimmed = checklistInput.trim();
    if (!trimmed) return;

    setChecklist((prev) => [
      ...prev,
      {
        text: trimmed,
        completed: false,
      },
    ]);
    setChecklistInput("");
  }

  function addNote() {
    const trimmed = notesInput.trim();
    if (!trimmed) return;

    setNotes((prev) => [
      ...prev,
      {
        text: trimmed,
      },
    ]);
    setNotesInput("");
  }

  function removeGuest(index) {
    setGuestList((prev) => prev.filter((_, i) => i !== index));
  }

  function removeChecklistItem(index) {
    setChecklist((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNote(index) {
    setNotes((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!eventName.trim() || !date) {
      setError("Please enter an event name and date.");
      return;
    }

    setSaving(true);

    try {
      const eventsRef = collection(db, "users", user.uid, "events");

      const docRef = await addDoc(eventsRef, {
        eventName: eventName.trim(),
        theme: theme.trim(),
        date,
        startTime,
        endTime,
        coverImage: "",
        guestList,
        checklist,
        notes,
        createdAt: serverTimestamp(),
      });

      router.push(`/events/${docRef.id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create event.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF8EF] flex">
      <Sidebar />

      <section className="flex-1 p-8">
        <div className="max-w-5xl">
          <h1 className="text-3xl font-semibold text-[#171717] mb-2">
            Create Event
          </h1>
          <p className="text-[#6B7280] mb-8">
            Build a new plan in the hive.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
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

                <div>
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

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[#171717] mb-2">
                    <CalendarDays size={16} />
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#171717] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[#171717] mb-2">
                    <Clock3 size={16} />
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#171717] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[#171717] mb-2">
                    <Clock3 size={16} />
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#171717] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* GUEST LIST CARD */}
              <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] overflow-hidden">
                <label className="flex items-center justify-between text-lg font-semibold text-[#171717] mb-4">
                  <span className="flex items-center gap-2">
                    <Users size={18} />
                    Guest List
                  </span>

                  <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full">
                    {guestList.length}
                  </span>
                </label>

                <div className="flex items-center gap-2 mb-4 w-full max-w-80 mx-auto">
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
                    className="shrink-0 rounded-full bg-[#F4B942] px-3 py-2 text-xs font-bold text-white shadow-sm hover:scale-105 hover:bg-[#e5a932] transition"
                  >
                    +
                  </button>
                </div>

                <div className="space-y-2">
                  {guestList.length === 0 ? (
                    <p className="text-sm text-[#8C8791]">No guests added yet.</p>
                  ) : (
                    guestList.map((guest, index) => (
                      <div
                        key={`${guest.name}-${index}`}
                        className="flex items-center justify-between rounded-2xl bg-[#FFF8EF] border border-[#F3E6CB] px-4 py-3"
                      >
                        <span className="text-[#171717]">{guest.name}</span>
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

              {/* CHECKLIST CARD */}
              <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] overflow-hidden">
                <label className="flex items-center justify-between text-lg font-semibold text-[#171717] mb-4">
                  <span className="flex items-center gap-2">
                    <CheckSquare size={18} />
                    Checklist
                  </span>

                  <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full">
                    {checklist.length}
                  </span>
                </label>

                <div className="flex items-center gap-2 mb-4 w-full max-w-80 mx-auto">
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
                    className="shrink-0 rounded-full bg-[#F4B942] px-3 py-2 text-xs font-bold text-white shadow-sm hover:scale-105 hover:bg-[#e5a932] transition"
                  >
                    +
                  </button>
                </div>

                <div className="space-y-2">
                  {checklist.length === 0 ? (
                    <p className="text-sm text-[#8C8791]">No tasks added yet.</p>
                  ) : (
                    checklist.map((item, index) => (
                      <div
                        key={`${item.text}-${index}`}
                        className="flex items-center justify-between rounded-2xl bg-[#FFF8EF] border border-[#F3E6CB] px-4 py-3"
                      >
                        <span className="text-[#171717]">{item.text}</span>
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

              {/* NOTES CARD */}
              <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] overflow-hidden">
                <label className="flex items-center justify-between text-lg font-semibold text-[#171717] mb-4">
                  <span className="flex items-center gap-2">
                    <StickyNote size={18} />
                    Notes
                  </span>

                  <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full">
                    {notes.length}
                  </span>
                </label>

                <div className="flex items-center gap-2 mb-4 w-full max-w-80 mx-auto">
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
                    className="shrink-0 rounded-full bg-[#F4B942] px-3 py-2 text-xs font-bold text-white shadow-sm hover:scale-105 hover:bg-[#e5a932] transition"
                  >
                    +
                  </button>
                </div>

                <div className="space-y-2">
                  {notes.length === 0 ? (
                    <p className="text-sm text-[#8C8791]">No notes added yet.</p>
                  ) : (
                    notes.map((note, index) => (
                      <div
                        key={`${note.text}-${index}`}
                        className="flex items-center justify-between rounded-2xl bg-[#FFF8EF] border border-[#F3E6CB] px-4 py-3"
                      >
                        <span className="text-[#171717]">{note.text}</span>
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

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[#E3C56A] px-6 py-3 text-sm font-semibold text-[#5A4A1F] hover:bg-[#d9b954] transition disabled:opacity-70"
              >
                {saving ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}