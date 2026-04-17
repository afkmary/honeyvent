"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

export default function GuestListModal({
  open,
  onClose,
  guestList,
  removeGuest,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("az");

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const filteredGuests = useMemo(() => {
    let updatedGuests = guestList.map((guest, index) => ({
      ...guest,
      originalIndex: index,
    }));

    if (searchTerm.trim()) {
      updatedGuests = updatedGuests.filter((guest) =>
        guest.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortOption === "az") {
      updatedGuests.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortOption === "newest") {
      updatedGuests.sort((a, b) => b.originalIndex - a.originalIndex);
    }

    if (sortOption === "oldest") {
      updatedGuests.sort((a, b) => a.originalIndex - b.originalIndex);
    }

    return updatedGuests;
  }, [guestList, searchTerm, sortOption]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
      onClick={onClose}
    >
      <div
        className="relative flex h-168 w-full max-w-2xl flex-col overflow-hidden rounded-[30px] border border-[#F0E7D8] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-[#F3E6CB] px-6 py-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[#171717]">
                All Attendees
              </h3>
              <p className="text-sm text-[#8C8791]">
                {filteredGuests.length} shown • {guestList.length} total
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[#8C8791] transition hover:bg-[#FFF8EF]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C4B8A5]"
              />
              <input
                type="text"
                placeholder="Search attendees"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-[#E8DCC8] bg-[#FFFDF8] py-3 pl-11 pr-4 text-sm text-[#171717] placeholder:text-[#C4B8A5] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
              />
            </div>

            <div className="flex flex-wrap gap-2 font-sans">
              <button
                type="button"
                onClick={() => setSortOption("az")}
                className={`rounded-full px-4 py-3 text-sm transition ${sortOption === "az"
                    ? "bg-[#F4B942] text-white"
                    : "border border-[#E8DCC8] bg-[#FFFDF8] text-[#171717]"
                  }`}
              >
                A → Z
              </button>

              <button
                type="button"
                onClick={() => setSortOption("newest")}
                className={`rounded-full px-4 py-3 text-sm transition ${sortOption === "newest"
                    ? "bg-[#F4B942] text-white"
                    : "border border-[#E8DCC8] bg-[#FFFDF8] text-[#171717]"
                  }`}
              >
                Newest to oldest
              </button>

              <button
                type="button"
                onClick={() => setSortOption("oldest")}
                className={`rounded-full px-4 py-3 text-sm transition ${sortOption === "oldest"
                    ? "bg-[#F4B942] text-white"
                    : "border border-[#E8DCC8] bg-[#FFFDF8] text-[#171717]"
                  }`}
              >
                Oldest to newest
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
          {filteredGuests.length === 0 ? (
            <p className="text-sm text-[#8C8791]">No matching guests found.</p>
          ) : (
            <div className="space-y-3">
              {filteredGuests.map((guest) => (
                <div
                  key={`${guest.name}-${guest.originalIndex}`}
                  className="rounded-2xl bg-[#FFF8EF] border border-[#F3E6CB] px-4 py-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[#171717] font-medium wrap-break-word">
                      {guest.name}
                    </p>
                    <p className="text-sm text-[#8C8791] capitalize wrap-break-word">
                      {guest.status || "invited"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeGuest(guest.originalIndex)}
                    className="shrink-0 self-start text-sm text-[#D47D69] hover:text-[#bb5f49] transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        aria-label="Close modal overlay"
        onClick={onClose}
        className="absolute inset-0 -z-10 cursor-default"
      />
    </div>
  );
}