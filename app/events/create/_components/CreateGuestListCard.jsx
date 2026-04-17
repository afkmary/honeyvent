"use client";

import { Users } from "lucide-react";

export default function CreateGuestListCard({
  guestList,
  guestInput,
  setGuestInput,
  addGuest,
  removeGuest,
}) {
  return (
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
  );
}