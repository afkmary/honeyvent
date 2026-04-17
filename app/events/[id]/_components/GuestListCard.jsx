"use client";

export default function GuestListCard({
  guestList,
  guestInput,
  setGuestInput,
  addGuest,
  removeGuest,
  saving,
}) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-[#171717]">
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
          disabled={saving}
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
  );
}