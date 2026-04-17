"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";

export default function TaskNoteModal({
  open,
  selectedTask,
  selectedTaskIndex,
  selectedTaskNoteInput,
  setSelectedTaskNoteInput,
  closeTaskNoteModal,
  clearSelectedTaskNote,
  saveTaskDetails,
  isSaving,
}) {
  const [taskTextInput, setTaskTextInput] = useState("");

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeTaskNoteModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, closeTaskNoteModal]);

  useEffect(() => {
    if (selectedTask) {
      setTaskTextInput(selectedTask.text || "");
    }
  }, [selectedTask]);

  if (!open || !selectedTask) return null;

  async function handleSaveTaskDetails() {
    if (selectedTaskIndex === null) return;

    await saveTaskDetails(selectedTaskIndex, taskTextInput, selectedTaskNoteInput);
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/25 px-4"
      onClick={closeTaskNoteModal}
    >
      <div
        className="relative w-full max-w-lg rounded-[28px] border border-[#F0E7D8] bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeTaskNoteModal}
          className="absolute right-4 top-4 rounded-full p-2 text-[#8C8791] hover:bg-[#F5F5F5] transition"
        >
          <X size={18} />
        </button>

        <div className="mb-4 inline-flex items-center rounded-full bg-[#FFF3D6] px-3 py-1 text-xs font-semibold text-[#C98C00]">
          Task Details
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#171717]">
              <Pencil size={15} />
              Task name
            </label>
            <input
              type="text"
              value={taskTextInput}
              onChange={(e) => setTaskTextInput(e.target.value)}
              className="w-full rounded-2xl border border-[#E8DCC8] bg-[#FFFDF8] px-4 py-3 text-sm text-[#171717] outline-none placeholder:text-[#C4B8A5] focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#171717]">
              Note for this task
            </label>

            <textarea
              value={selectedTaskNoteInput}
              onChange={(e) => setSelectedTaskNoteInput(e.target.value)}
              rows={6}
              placeholder="Add details, reminders, links, or anything helpful for this task..."
              className="w-full resize-none rounded-2xl border border-[#E8DCC8] bg-[#FFFDF8] px-4 py-3 text-sm text-[#171717] outline-none placeholder:text-[#C4B8A5] focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={clearSelectedTaskNote}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full border border-[#E8DCC8] bg-white px-5 py-3 text-sm font-semibold text-[#6B7280] transition hover:bg-[#FFF8EF] disabled:opacity-70"
            >
              <Trash2 size={15} />
              Clear Note
            </button>

            <button
              type="button"
              onClick={handleSaveTaskDetails}
              disabled={isSaving}
              className="rounded-full bg-[#E3C56A] px-5 py-3 text-sm font-semibold text-[#5A4A1F] transition hover:bg-[#d9b954] disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}