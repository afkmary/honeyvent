"use client";

export default function ChecklistCard({
  checklist,
  checklistInput,
  setChecklistInput,
  addChecklistItem,
  removeChecklistItem,
  toggleChecklistItem,
  saving,
}) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-[#171717]">
          Checklist
        </h2>

        <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full font-semibold">
          {checklist.length}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-4 w-full max-w-100 mx-auto">
        <input
          type="text"
          value={checklistInput}
          onChange={(e) => setChecklistInput(e.target.value)}
          placeholder="Add task"
          className="min-w-0 flex-1 rounded-full border border-[#E8DCC8] bg-[#FFFDF8] px-3 py-2 text-sm text-[#171717] placeholder:text-[#C4B8A5] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
        />
        <button
          type="button"
          onClick={addChecklistItem}
          disabled={saving}
          className="shrink-0 rounded-full bg-[#F4B942] px-3 py-2 text-xs font-bold text-white shadow-sm hover:scale-105 hover:bg-[#e5a932] transition disabled:opacity-70"
        >
          +
        </button>
      </div>

      <div className="space-y-3">
        {checklist.length === 0 ? (
          <p className="text-sm text-[#8C8791]">No tasks added yet.</p>
        ) : (
          checklist.map((item, index) => (
            <div
              key={`${item.text}-${index}`}
              className="rounded-2xl bg-[#FFF8EF] border border-[#F3E6CB] px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={!!item.completed}
                  onChange={() => toggleChecklistItem(index)}
                  className="mt-1 accent-[#F4B942]"
                />
                <div>
                  <p
                    className={`font-medium ${item.completed
                        ? "text-[#8C8791] line-through"
                        : "text-[#171717]"
                      }`}
                  >
                    {item.text}
                  </p>
                  <p className="text-sm text-[#8C8791]">
                    {item.completed ? "Completed" : "Pending"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeChecklistItem(index)}
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