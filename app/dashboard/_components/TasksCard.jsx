"use client";

export default function TasksCard({ tasks, onViewTask }) {
  if (tasks.length === 0) {
    return <p className="text-[#8C8791]">No pending tasks 🎉</p>;
  }

  return (
    <div className="space-y-3 h-full overflow-y-auto pr-1">
      {tasks.map((task, index) => (
        <div
          key={`${task.eventId}-${index}`}
          className="rounded-2xl bg-[#FFF8EF] border border-[#F3E6CB] px-4 py-3 flex justify-between items-center gap-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[#171717] font-medium truncate">{task.text}</p>
            <p className="text-sm text-[#8C8791] truncate">
              {task.eventName || "Untitled Event"}
            </p>
          </div>

          <button
            onClick={() => onViewTask(task.eventId)}
            className="text-sm font-semibold text-[#C98C00] hover:underline shrink-0"
          >
            View
          </button>
        </div>
      ))}
    </div>
  );
}