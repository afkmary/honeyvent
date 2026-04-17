"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getSafeChecklist,
  getSafeGuestList,
  getSafeNotes,
  getSelectedTask,
} from "../utils";

export default function useEventDetails({ user, router, eventId }) {
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

  const guestList = useMemo(() => getSafeGuestList(eventData), [eventData]);
  const checklist = useMemo(() => getSafeChecklist(eventData), [eventData]);
  const notes = useMemo(() => getSafeNotes(eventData), [eventData]);

  const selectedTask = useMemo(() => {
    return getSelectedTask(checklist, selectedTaskIndex);
  }, [checklist, selectedTaskIndex]);

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

  async function updateGuestName(indexToUpdate, newName) {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const normalizedInput = trimmed.toLowerCase();

    const alreadyExists = guestList.some(
      (guest, index) =>
        index !== indexToUpdate &&
        guest.name?.trim().toLowerCase() === normalizedInput
    );

    if (alreadyExists) {
      setGuestError("That guest is already on the list.");
      return;
    }

    const updatedGuests = guestList.map((guest, index) =>
      index === indexToUpdate ? { ...guest, name: trimmed } : guest
    );

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
      index === indexToToggle ? { ...item, completed: !item.completed } : item
    );

    await saveField("checklist", updatedChecklist, "checklist");
  }

  async function updateChecklistItemText(indexToUpdate, newText) {
    const trimmed = newText.trim();
    if (!trimmed) return;

    const updatedChecklist = checklist.map((item, index) =>
      index === indexToUpdate ? { ...item, text: trimmed } : item
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
      index === selectedTaskIndex ? { ...item, note: "" } : item
    );

    await saveField("checklist", updatedChecklist, "checklist");
    setSelectedTaskNoteInput("");
  }

  async function saveTaskDetails(indexToUpdate, newText, newNote) {
    const trimmedText = newText.trim();
    if (!trimmedText) return;

    const updatedChecklist = checklist.map((item, index) =>
      index === indexToUpdate
        ? {
          ...item,
          text: trimmedText,
          note: newNote.trim(),
        }
        : item
    );

    await saveField("checklist", updatedChecklist, "checklist");
    setShowTaskNoteModal(false);
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

  async function updateNoteText(indexToUpdate, newText) {
    const trimmed = newText.trim();
    if (!trimmed) return;

    const updatedNotes = notes.map((note, index) =>
      index === indexToUpdate ? { ...note, text: trimmed } : note
    );

    await saveField("notes", updatedNotes, "note");
  }

  return {
    eventData,
    setEventData,
    loading,
    savingSection,

    guestList,
    checklist,
    notes,

    guestInput,
    setGuestInput,
    checklistInput,
    setChecklistInput,
    notesInput,
    setNotesInput,

    guestError,

    selectedTask,
    selectedTaskIndex,
    showTaskNoteModal,
    selectedTaskNoteInput,
    setSelectedTaskNoteInput,

    addGuest,
    removeGuest,
    updateGuestName,

    addChecklistItem,
    removeChecklistItem,
    toggleChecklistItem,
    updateChecklistItemText,

    addNote,
    removeNote,
    updateNoteText,

    selectTask,
    closeTaskNoteModal,
    saveSelectedTaskNote,
    clearSelectedTaskNote,
    saveTaskDetails,
  };
}