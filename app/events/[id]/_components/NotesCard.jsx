"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

function truncateText(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export default function NotesCard({
  notes,
  notesInput,
  setNotesInput,
  addNote,
  removeNote,
  updateNoteText,
  saving,
}) {
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  function startEditingNote(index, currentText) {
    setEditingNoteIndex(index);
    setEditingNoteText(currentText);
  }

  async function saveEditedNote(index) {
    const trimmed = editingNoteText.trim();
    if (!trimmed) {
      setEditingNoteIndex(null);
      setEditingNoteText("");
      return;
    }

    await updateNoteText(index, trimmed);
    setEditingNoteIndex(null);
    setEditingNoteText("");
  }

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] overflow-hidden h-136 flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-[#171717]">
          Additional Notes
        </h2>

        <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full font-semibold">
          {notes.length}
        </span>
      </div>

      <div className="shrink-0 flex items-center gap-2 mb-4 w-full max-w-100 mx-auto">
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
          disabled={saving}
          className="shrink-0 rounded-full bg-[#F4B942] px-3 py-2 text-xs font-bold text-white shadow-sm hover:scale-105 hover:bg-[#e5a932] transition disabled:opacity-70"
        >
          +
        </button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1 min-h-0">
        {notes.length === 0 ? (
          <p className="text-sm text-[#8C8791]">No notes added yet.</p>
        ) : (
          notes.map((note, index) => (
            <div
              key={`${note.text}-${index}`}
              className="rounded-2xl bg-[#FFF8EF] border border-[#F3E6CB] px-4 py-3 flex items-start justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                {editingNoteIndex === index ? (
                  <textarea
                    value={editingNoteText}
                    onChange={(e) => setEditingNoteText(e.target.value)}
                    onBlur={() => saveEditedNote(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        saveEditedNote(index);
                      }

                      if (e.key === "Escape") {
                        setEditingNoteIndex(null);
                        setEditingNoteText("");
                      }
                    }}
                    rows={3}
                    autoFocus
                    className="w-full resize-none rounded-xl border border-[#E8DCC8] bg-white px-3 py-2 text-sm text-[#171717] outline-none focus:border-[#F4B942]"
                  />
                ) : (
                  <p
                    title={note.text}
                    className="truncate text-[#171717] text-sm"
                  >
                    {note.text}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => startEditingNote(index, note.text)}
                  className="rounded-full p-2 text-[#8C8791] hover:bg-[#F7F2E8] hover:text-[#5f5a63] transition"
                  title="Edit note"
                >
                  <Pencil size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => removeNote(index)}
                  className="rounded-full p-2 text-[#D47D69] hover:bg-[#FFF1ED] hover:text-[#bb5f49] transition"
                  title="Remove note"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}