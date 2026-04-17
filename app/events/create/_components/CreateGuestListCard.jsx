"use client";

import { Users } from "lucide-react";

export default function CreateGuestListCard({
  guestList,
  guestInput,
  setGuestInput,
  addGuest,
  removeGuest,
  guestError,
}) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] overflow-hidden h-136 flex flex-col">
      <label className="flex items-center justify-between text-lg font-semibold text-[#171717] mb-4 shrink-0">
        <span className="flex items-center gap-2">
          <Users size={18} />
          Guest List
        </span>

        <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full">
          {guestList.length}
        </span>
      </label>

      <div className="shrink-0 flex items-center gap-2 mb-2 w-full max-w-80 mx-auto">
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

      {guestError ? (
        <p className="mb-4 text-sm text-red-500 shrink-0">{guestError}</p>
      ) : null}

      <div className="space-y-2 flex-1 overflow-y-auto pr-1 min-h-0">
        {guestList.length === 0 ? (
          <p className="text-sm text-[#8C8791]">No guests added yet.</p>
        ) : (
          guestList.map((guest, index) => (
            <div
              key={`${guest.name}-${index}`}
              className="flex items-start justify-between gap-3 rounded-2xl bg-[#FFF8EF] border border-[#F3E6CB] px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[#171717] wrap-break-word">
                  {guest.name}
                </p>
                <p className="text-sm text-[#8C8791] capitalize wrap-break-word">
                  {guest.status || "invited"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeGuest(index)}
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