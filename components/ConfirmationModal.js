"use client";

export default function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onClose,
  onConfirm,
  loading = false,
  confirmButtonClassName = "bg-[#F9E1DC] text-[#B85C47] hover:bg-[#f3d1ca]",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-xl border border-[#F0E7D8]">
        <h2 className="text-2xl font-semibold text-[#171717] mb-2">
          {title}
        </h2>

        <p className="text-[#6B7280] mb-6">
          {description}
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full bg-[#F5F5F5] px-5 py-3 text-sm font-semibold text-[#5E5963] hover:bg-[#ECECEC] transition disabled:opacity-70"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-70 ${confirmButtonClassName}`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}