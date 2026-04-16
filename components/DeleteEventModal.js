"use client";

export default function DeleteEventModal({
  isOpen,
  eventName,
  onClose,
  onConfirm,
  deleting = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-xl border border-[#F0E7D8]">
        <h2 className="text-2xl font-semibold text-[#171717] mb-2">
          Delete event?
        </h2>

        <p className="text-[#6B7280] mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#171717]">
            {eventName || "this event"}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-full bg-[#F5F5F5] px-5 py-3 text-sm font-semibold text-[#5E5963] hover:bg-[#ECECEC] transition disabled:opacity-70"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-full bg-[#F9E1DC] px-5 py-3 text-sm font-semibold text-[#B85C47] hover:bg-[#f3d1ca] transition disabled:opacity-70"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}