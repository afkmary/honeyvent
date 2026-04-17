"use client";

import { useMemo, useState } from "react";
import ChecklistModal from "./ChecklistModal";

export default function ChecklistCard({
  checklist,
  checklistInput,
  setChecklistInput,
  addChecklistItem,
  removeChecklistItem,
  toggleChecklistItem,
  saving,
  selectedTaskIndex,
  onSelectTask,
}) {
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  const { visibleItems, hasCompletedInVisible } = useMemo(() => {
    const mapped = checklist.map((item, index) => ({
      ...item,
      originalIndex: index,
    }));

    const pendingTasks = mapped.filter((item) => !item.completed);
    const completedTasks = mapped.filter((item) => !!item.completed);

    const combined = [...pendingTasks, ...completedTasks];
    const firstSeven = combined.slice(0, 7);

    const hasCompleted = firstSeven.some((item) => item.completed);

    return {
      visibleItems: firstSeven,
      hasCompletedInVisible: hasCompleted,
    };
  }, [checklist]);

  return (
    <>
      <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] overflow-hidden h-136 flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-[#171717]">
            Checklist
          </h2>

          <div className="flex items-center gap-2">
            {checklist.length > 0 && (
              <button
                type="button"
                onClick={() => setShowChecklistModal(true)}
                className="rounded-full border border-[#E8DCC8] bg-[#FFFDF8] px-3 py-1 text-xs font-semibold text-[#8C8791] hover:bg-[#FFF8EF] transition"
              >
                See all
              </button>
            )}

            <span className="text-xs bg-[#FFF3D6] text-[#C98C00] px-3 py-1 rounded-full font-semibold">
              {checklist.length}
            </span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 mb-4 w-full max-w-100 mx-auto">
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

        <div className="space-y-3 flex-1 overflow-y-auto pr-1 min-h-0">
          {checklist.length === 0 ? (
            <p className="text-sm text-[#8C8791]">No tasks added yet.</p>
          ) : (
            <>
              {visibleItems.map((item, visibleIndex) => {
                const index = item.originalIndex;
                const isSelected = selectedTaskIndex === index;

                const showCompletedLabel =
                  item.completed &&
                  (visibleIndex === 0 || !visibleItems[visibleIndex - 1].completed);

                return (
                  <div key={`${item.text}-${index}`} className="space-y-3">
                    {showCompletedLabel && (
                      <div className="flex items-center gap-3 pt-1">
                        <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.18em] text-[#B08A2E]">
                          Completed Tasks
                        </span>
                        <div className="h-px flex-1 bg-[#E8DCC8]" />
                      </div>
                    )}

                    <div
                      onClick={() => onSelectTask?.(index)}
                      className={`rounded-2xl border px-4 py-3 flex items-start justify-between gap-3 cursor-pointer transition ${isSelected
                        ? "bg-[#FFF3D6] border-[#E3C56A]"
                        : "bg-[#FFF8EF] border-[#F3E6CB]"
                        }`}
                    >
                      <div className="min-w-0 flex flex-1 items-start gap-3">
                        <input
                          type="checkbox"
                          checked={!!item.completed}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleChecklistItem(index);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 h-5 w-5 shrink-0 accent-[#F4B942] cursor-pointer"
                        />

                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-medium wrap-break-word ${item.completed
                              ? "text-[#8C8791] line-through"
                              : "text-[#171717]"
                              }`}
                          >
                            {item.text}
                          </p>

                          <p className="text-sm text-[#8C8791] wrap-break-word">
                            {item.completed ? "Completed" : "Pending"}
                            {item.note?.trim() ? " • Has note" : ""}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeChecklistItem(index);
                        }}
                        className="shrink-0 self-start text-sm text-[#D47D69] hover:text-[#bb5f49] transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      <ChecklistModal
        open={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        checklist={checklist}
        removeChecklistItem={removeChecklistItem}
        toggleChecklistItem={toggleChecklistItem}
        selectedTaskIndex={selectedTaskIndex}
        onSelectTask={onSelectTask}
      />
    </>
  );
}