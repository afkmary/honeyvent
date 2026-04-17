"use client";

export default function NotesCard({
  notes,
  notesInput,
  setNotesInput,
  addNote,
  removeNote,
  saving,
}) {
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
                <p
                  title={note.text}
                  className="text-[#171717] text-sm leading-6 line-clamp-3 break-words"
                >
                  {note.text}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeNote(index)}
                className="shrink-0 self-start text-sm text-[#D47D69] hover:text-[#bb5f49] transition"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}