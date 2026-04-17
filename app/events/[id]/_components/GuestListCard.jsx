"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import GuestListModal from "./GuestListModal";

export default function GuestListCard({
  guestList,
  guestInput,
  setGuestInput,
  addGuest,
  removeGuest,
  updateGuestName,
  saving,
  guestError,
}) {
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [editingGuestIndex, setEditingGuestIndex] = useState(null);
  const [editingGuestName, setEditingGuestName] = useState("");

  const visibleGuests = guestList.slice(0, 7);

  function startEditingGuest(index, currentName) {
    setEditingGuestIndex(index);
    setEditingGuestName(currentName);
  }

  async function saveEditedGuest(index) {
    const trimmed = editingGuestName.trim();
    if (!trimmed) {
      setEditingGuestIndex(null);
      setEditingGuestName("");
      return;
    }

    await updateGuestName(index, trimmed);
    setEditingGuestIndex(null);
    setEditingGuestName("");
  }

  return (
    <>
      <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] overflow-hidden h-136 flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-[#171717]">
            Guest List
          </h2>

          <div className="flex items-center gap-2">
            {guestList.length > 0 && (
              <button
                type="button"
                onClick={() => setShowGuestModal(true)}
                className="rounded-full border border-[#E8DCC8] bg-[#FFFDF8] px-3 py-1 text-xs font-semibold text-[#8C8791] hover:bg-[#FFF8EF] transition"
              >
                See all
              </button>
            )}

            <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full font-semibold">
              {guestList.length}
            </span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 mb-2 w-full max-w-100 mx-auto">
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
            disabled={saving}
            className="shrink-0 rounded-full bg-[#F4B942] px-3 py-2 text-xs font-bold text-white shadow-sm hover:scale-105 hover:bg-[#e5a932] transition disabled:opacity-70"
          >
            +
          </button>
        </div>

        {guestError ? (
          <p className="mb-4 text-sm text-red-500 shrink-0">{guestError}</p>
        ) : null}

        <div className="space-y-3 flex-1 overflow-y-auto pr-1 min-h-0">
          {guestList.length === 0 ? (
            <p className="text-sm text-[#8C8791]">No guests added yet.</p>
          ) : (
            visibleGuests.map((guest, index) => (
              <div
                key={`${guest.name}-${index}`}
                className="rounded-2xl bg-[#FFF8EF] border border-[#F3E6CB] px-4 py-3 flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  {editingGuestIndex === index ? (
                    <input
                      type="text"
                      value={editingGuestName}
                      onChange={(e) => setEditingGuestName(e.target.value)}
                      onBlur={() => saveEditedGuest(index)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEditedGuest(index);
                        if (e.key === "Escape") {
                          setEditingGuestIndex(null);
                          setEditingGuestName("");
                        }
                      }}
                      autoFocus
                      className="w-full rounded-lg border border-[#E8DCC8] bg-white px-2 py-1 text-sm text-[#171717] outline-none focus:border-[#F4B942]"
                    />
                  ) : (
                    <p
                      title={guest.name}
                      className="text-[#171717] truncate"
                    >
                      {guest.name}
                    </p>
                  )}

                  <p
                    title={guest.status || "invited"}
                    className="text-sm text-[#8C8791] capitalize truncate"
                  >
                    {guest.status || "invited"}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEditingGuest(index, guest.name)}
                    className="rounded-full p-2 text-[#8C8791] hover:bg-[#F7F2E8] hover:text-[#5f5a63] transition"
                    title="Edit guest"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeGuest(index)}
                    className="rounded-full p-2 text-[#D47D69] hover:bg-[#FFF1ED] hover:text-[#bb5f49] transition"
                    title="Remove guest"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <GuestListModal
        open={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        guestList={guestList}
        removeGuest={removeGuest}
        updateGuestName={updateGuestName}
      />
    </>
  );
}