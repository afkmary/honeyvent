"use client";

import { Camera, Pencil } from "lucide-react";

export default function BannerActions({
  bannerUploading,
  handleBannerUpload,
  openEditMode,
}) {
  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      <label className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#F3E6CB] bg-[#FFF8EF] shadow-md transition hover:bg-[#FFECCB]">
        <Camera
          size={16}
          className={`text-[#C98C00] transition group-hover:scale-110 ${bannerUploading ? "opacity-50" : ""
            }`}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleBannerUpload}
          className="hidden"
          disabled={bannerUploading}
        />
      </label>

      <button
        type="button"
        onClick={openEditMode}
        className="inline-flex items-center gap-2 rounded-full border border-[#E8DCC8] bg-white/95 px-4 py-2 text-sm font-semibold text-[#5A4A1F] shadow-md transition hover:bg-[#FFF8EF]"
      >
        <Pencil size={16} />
        Edit Event
      </button>
    </div>
  );
}