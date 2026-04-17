"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";

export default function ChecklistModal({
  open,
  onClose,
  checklist,
  removeChecklistItem,
  toggleChecklistItem,
  updateChecklistItemText,
  selectedTaskIndex,
  onSelectTask,
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");

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

  const { pendingTasks, completedTasks } = useMemo(() => {
    const mapped = checklist.map((item, index) => ({
      ...item,
      originalIndex: index,
    }));

    return {
      pendingTasks: mapped.filter((item) => !item.completed),
      completedTasks: mapped.filter((item) => !!item.completed),
    };
  }, [checklist]);

  if (!open) return null;

  function startEditing(index, currentText) {
    setEditingIndex(index);
    setEditingText(currentText);
  }

  async function saveEdit(index) {
    const trimmed = editingText.trim();
    if (!trimmed) {
      setEditingIndex(null);
      setEditingText("");
      return;
    }

    await updateChecklistItemText(index, trimmed);
    setEditingIndex(null);
    setEditingText("");
  }

  const renderTask = (item) => {
    const index = item.originalIndex;
    const isSelected = selectedTaskIndex === index;

    return (
      <div
        key={`${item.text}-${index}`}
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
            {editingIndex === index ? (
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onBlur={() => saveEdit(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit(index);
                  if (e.key === "Escape") {
                    setEditingIndex(null);
                    setEditingText("");
                  }
                }}
                autoFocus
                className="w-full rounded-lg border border-[#E8DCC8] bg-white px-2 py-1 text-sm text-[#171717] outline-none focus:border-[#F4B942]"
              />
            ) : (
              <p
                title={item.text}
                className={`font-sans overflow-hidden ${item.completed
                  ? "text-[#8C8791] line-through"
                  : "text-[#171717]"
                  }`}
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.text}
              </p>
            )}

            <p className="text-sm text-[#8C8791] truncate">
              {item.completed ? "Completed" : "Pending"}
              {item.note?.trim() ? " • Has note" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              startEditing(index, item.text);
            }}
            className="rounded-full p-2 text-[#8C8791] hover:bg-[#F7F2E8] hover:text-[#5f5a63] transition"
            title="Edit task"
          >
            <Pencil size={15} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeChecklistItem(index);
            }}
            className="rounded-full p-2 text-[#D47D69] hover:bg-[#FFF1ED] hover:text-[#bb5f49] transition"
            title="Remove task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    );
  };

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
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[#171717]">
                All Tasks
              </h3>
              <p className="text-sm text-[#8C8791]">
                {checklist.length} total tasks
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
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          {checklist.length === 0 ? (
            <p className="text-sm text-[#8C8791]">No tasks added yet.</p>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map(renderTask)}

              {completedTasks.length > 0 && (
                <>
                  <div className="pt-3">
                    <div className="flex items-center gap-3">
                      <span className="shrink-0 text-xs font-bold uppercase tracking-[0.18em] text-[#B08A2E]">
                        Completed Tasks
                      </span>
                      <div className="h-px flex-1 bg-[#E8DCC8]" />
                    </div>
                  </div>

                  {completedTasks.map(renderTask)}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}