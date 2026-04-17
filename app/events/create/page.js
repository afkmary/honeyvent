"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useUserAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar";
import CreateEventMainForm from "./_components/CreateEventMainForm";
import CreateGuestListCard from "./_components/CreateGuestListCard";
import CreateChecklistCard from "./_components/CreateChecklistCard";
import CreateNotesCard from "./_components/CreateNotesCard";

export default function CreateEventPage() {
  const { user } = useUserAuth();
  const router = useRouter();

  const [eventName, setEventName] = useState("");
  const [theme, setTheme] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [startHour, setStartHour] = useState("12");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState("AM");

  const [endHour, setEndHour] = useState("12");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState("AM");

  const [guestInput, setGuestInput] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  const [guestList, setGuestList] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [notes, setNotes] = useState([]);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

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

    if (!eventName.trim() || !startDate) {
      setError("Please enter an event name and start date.");
      return;
    }

    setSaving(true);

    try {
      let coverImage = "";

      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        const imageRef = ref(
          storage,
          `users/${user.uid}/event-banners/${fileName}`
        );

        await uploadBytes(imageRef, imageFile);
        coverImage = await getDownloadURL(imageRef);
      }

      const startTime = `${startHour}:${startMinute} ${startPeriod}`;
      const endTime = `${endHour}:${endMinute} ${endPeriod}`;
      const finalEndDate = endDate || startDate;

      const eventsRef = collection(db, "users", user.uid, "events");

      const docRef = await addDoc(eventsRef, {
        eventName: eventName.trim(),
        theme: theme.trim(),
        startDate,
        endDate: finalEndDate,
        startTime,
        endTime,
        coverImage,
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
            <CreateEventMainForm
              eventName={eventName}
              setEventName={setEventName}
              theme={theme}
              setTheme={setTheme}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              startHour={startHour}
              setStartHour={setStartHour}
              startMinute={startMinute}
              setStartMinute={setStartMinute}
              startPeriod={startPeriod}
              setStartPeriod={setStartPeriod}
              endHour={endHour}
              setEndHour={setEndHour}
              endMinute={endMinute}
              setEndMinute={setEndMinute}
              endPeriod={endPeriod}
              setEndPeriod={setEndPeriod}
              imageFile={imageFile}
              setImageFile={setImageFile}
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
              setError={setError}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <CreateGuestListCard
                guestList={guestList}
                guestInput={guestInput}
                setGuestInput={setGuestInput}
                addGuest={addGuest}
                removeGuest={removeGuest}
              />

              <CreateChecklistCard
                checklist={checklist}
                checklistInput={checklistInput}
                setChecklistInput={setChecklistInput}
                addChecklistItem={addChecklistItem}
                removeChecklistItem={removeChecklistItem}
              />

              <CreateNotesCard
                notes={notes}
                notesInput={notesInput}
                setNotesInput={setNotesInput}
                addNote={addNote}
                removeNote={removeNote}
              />
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