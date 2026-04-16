"use client";

import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  LogOut,
  Pencil,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useUserAuth } from "@/contexts/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logOut } = useUserAuth();

  async function handleLogout() {
    try {
      await logOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const userName = user?.displayName || "Busy Bee";
  const userPhoto = user?.photoURL || "";
  const initialLetter = userName.charAt(0).toUpperCase();

  const navItemClass = (path) =>
    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${pathname === path
      ? "bg-[#F7E4C3] text-[#171717] font-medium"
      : "text-[#7A7480] hover:bg-[#F9F4EA]"
    }`;

  return (
    <aside className="w-[320px] min-h-screen bg-white border-r border-[#EEE7DA] flex flex-col justify-between px-7 py-6">
      <div>
        <div className="flex justify-center mb-3">
          <div className="relative w-35 h-15">
            <Image
              src="/honeyventlogo.png"
              alt="HoneyVent logo"
              fill
              sizes="180px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative w-25 h-25 rounded-full overflow-hidden mb-3 border-4 border-[#F7E4C3] bg-[#F9F4EA] flex items-center justify-center">
            {userPhoto ? (
              <Image
                src={userPhoto}
                alt="Profile"
                fill
                sizes="90px"
                className="object-cover"
              />
            ) : (
              <span className="text-3xl font-semibold text-[#A07F28]">
                {initialLetter}
              </span>
            )}
          </div>

          <h2 className="text-[30px] leading-none font-semibold text-[#171717] mb-3 text-center">
            {userName}
          </h2>

          <button
            onClick={() => router.push("/profile")}
            className="inline-flex items-center gap-2 rounded-full bg-[#F5F5F5] px-4 py-2 text-sm text-[#5E5963] hover:bg-[#ECECEC] transition"
          >
            <Pencil size={14} />
            Edit Profile
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs tracking-wide text-[#8C8791] font-medium">
              GENERAL
            </span>
            <div className="h-px flex-1 bg-[#D9D2C6]" />
          </div>

          <nav className="space-y-1">
            <Link href="/dashboard" className={navItemClass("/dashboard")}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>

            <Link href="/calendar" className={navItemClass("/calendar")}>
              <CalendarDays size={18} />
              <span>Calendar</span>
            </Link>
          </nav>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs tracking-wide text-[#8C8791] font-medium">
              UPCOMING EVENTS
            </span>
            <div className="h-px flex-1 bg-[#D9D2C6]" />
          </div>

          <button
            onClick={() => router.push("/events/create")}
            className="w-full rounded-full bg-[#E3C56A] px-4 py-3 text-sm font-semibold text-[#5A4A1F] hover:bg-[#d9b954] transition"
          >
            + Create Event
          </button>
        </div>
      </div>

      <div className="flex items-center pt-6">

        {/* LEFT */}
        <div className="flex-1 flex justify-end">
          <Link
            href="/settings"
            className="flex items-center gap-2 text-sm text-[#4B474F] hover:text-[#171717] transition"
          >
            <Settings size={16} />
            Settings
          </Link>
        </div>

        {/* DIVIDER */}
        <div className="mx-8 h-7 w-px bg-[#CFC8BC]" />

        {/* RIGHT */}
        <div className="flex-1 flex justify-start">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-[#eb6363] hover:text-[#ff1f1f] transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}