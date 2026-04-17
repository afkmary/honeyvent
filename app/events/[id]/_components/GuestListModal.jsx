"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";

export default function GuestListModal({
  open,
  onClose,
  guestList,
  removeGuest,
  updateGuestName,
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("oldest");

  const filteredGuests = useMemo(() => {
    let results = guestList.map((guest, index) => ({
      ...guest,
      originalIndex: index,
    }));

    const query = searchTerm.trim().toLowerCase();
    if (query) {
      results = results.filter((guest) =>
        `${guest.name || ""} ${guest.status || ""}`.toLowerCase().includes(query)
      );
    }

    if (sortBy === "a-z") {
      results.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "newest") {
      results.sort((a, b) => b.originalIndex - a.originalIndex);
    } else {
      results.sort((a, b) => a.originalIndex - b.originalIndex);
    }

    return results;
  }, [guestList, searchTerm, sortBy]);

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

  if (!open) return null;

  function startEditing(index, currentName) {
    setEditingIndex(index);
    setEditingName(currentName);
  }

  async function saveEdit(index) {
    const trimmed = editingName.trim();
    if (!trimmed) {
      setEditingIndex(null);
      setEditingName("");
      return;
    }

    await updateGuestName(index, trimmed);
    setEditingIndex(null);
    setEditingName("");
  }

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
                All Guests
              </h3>
              <p className="text-sm text-[#8C8791]">
                {filteredGuests.length} shown • {guestList.length} total guests
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

          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search guests"
              className="min-w-0 w-full rounded-full border border-[#E8DCC8] bg-[#FFFDF8] px-4 py-2 text-sm text-[#171717] outline-none placeholder:text-[#C4B8A5] focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
            />

            <div className="flex flex-wrap gap-2 font-sans">
              <button
                type="button"
                onClick={() => setSortBy("a-z")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${sortBy === "a-z"
                  ? "bg-[#F4B942] text-white"
                  : "border border-[#E8DCC8] bg-[#FFFDF8] text-[#8C8791] hover:bg-[#FFF8EF]"
                  }`}
              >
                A–Z
              </button>

              <button
                type="button"
                onClick={() => setSortBy("oldest")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${sortBy === "oldest"
                  ? "bg-[#F4B942] text-white"
                  : "border border-[#E8DCC8] bg-[#FFFDF8] text-[#8C8791] hover:bg-[#FFF8EF]"
                  }`}
              >
                Oldest
              </button>

              <button
                type="button"
                onClick={() => setSortBy("newest")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${sortBy === "newest"
                  ? "bg-[#F4B942] text-white"
                  : "border border-[#E8DCC8] bg-[#FFFDF8] text-[#8C8791] hover:bg-[#FFF8EF]"
                  }`}
              >
                Newest
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          {filteredGuests.length === 0 ? (
            <p className="text-sm text-[#8C8791]">No guests found.</p>
          ) : (
            <div className="space-y-3">
              {filteredGuests.map((guest, index) => {
                const originalIndex = guest.originalIndex;

                return (
                  <div
                    key={`${guest.name}-${originalIndex}`}
                    className="rounded-2xl border border-[#F3E6CB] bg-[#FFF8EF] px-4 py-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      {editingIndex === originalIndex ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => saveEdit(originalIndex)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(originalIndex);
                            if (e.key === "Escape") {
                              setEditingIndex(null);
                              setEditingName("");
                            }
                          }}
                          autoFocus
                          className="w-full rounded-lg border border-[#E8DCC8] bg-white px-2 py-1 text-sm text-[#171717] outline-none focus:border-[#F4B942]"
                        />
                      ) : (
                        <p
                          title={guest.name}
                          className="font-sans text-[#171717] truncate"
                        >
                          {guest.name}
                        </p>
                      )}

                      <p className="text-sm text-[#8C8791] capitalize truncate">
                        {guest.status || "invited"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditing(originalIndex, guest.name)}
                        className="rounded-full p-2 text-[#8C8791] hover:bg-[#F7F2E8] hover:text-[#5f5a63] transition"
                        title="Edit guest"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeGuest(originalIndex)}
                        className="rounded-full p-2 text-[#D47D69] hover:bg-[#FFF1ED] hover:text-[#bb5f49] transition"
                        title="Remove guest"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}