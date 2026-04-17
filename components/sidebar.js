"use client";

import { useEffect, useState } from "react";
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
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logOut } = useUserAuth();

  const [upcomingEvents, setUpcomingEvents] = useState([]);

  async function handleLogout() {
    try {
      await logOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const userName = user?.displayName || "";
  const userPhoto = user?.photoURL || "";
  const initialLetter = userName.charAt(0).toUpperCase();

  const navItemClass = (path) =>
    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${pathname === path
      ? "bg-[#F7E4C3] text-[#171717] font-medium"
      : "text-[#7A7480] hover:bg-[#F9F4EA]"
    }`;

  function convertTo24Hour(timeString = "") {
    const value = String(timeString).trim().toUpperCase();

    if (!value) return "00:00";

    const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
    if (!match) return "00:00";

    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const period = match[3];

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  function parseEventDate(event) {
    if (!event?.startDate) return null;

    const [year, month, day] = event.startDate.split("-");

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      0,
      0,
      0
    );
  }

  function formatSidebarDate(date) {
    return new Intl.DateTimeFormat("en-CA", {
      month: "short",
      day: "numeric",
    }).format(date);
  }

  useEffect(() => {
    async function loadUpcomingEvents() {
      if (!user?.uid) {
        setUpcomingEvents([]);
        return;
      }

      try {
        const snapshot = await getDocs(
          collection(db, "users", user.uid, "events")
        );

        const now = new Date();

        const events = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .map((event) => ({
            ...event,
            parsedDate: parseEventDate(event),
          }))
          .filter((event) => {
            if (!event.parsedDate) return false;

            const today = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate()
            );

            return event.parsedDate >= today;
          })
          .sort((a, b) => a.parsedDate - b.parsedDate)
          .slice(0, 2);

        setUpcomingEvents(events);

        console.log("sidebar events:", events);
      } catch (error) {
        console.error("Failed to load upcoming events:", error);
        setUpcomingEvents([]);
      }
    }

    loadUpcomingEvents();
  }, [user?.uid, pathname]);

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

          {upcomingEvents.length > 0 && (
            <div className="space-y-3 mb-5">
              {upcomingEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => router.push(`/events/${event.id}`)}
                  className="group w-full cursor-pointer rounded-2xl border border-[#EEE7DA] bg-[#FAF8F3] px-4 py-3 text-left transition-all duration-200 hover:bg-[#F7F1E7] hover:border-[#E3C56A] hover:shadow-sm active:scale-[0.98]"
                >
                  <p className="truncate text-sm font-semibold text-[#171717] transition group-hover:text-[#A07F28]">
                    {event.eventName || "Untitled Event"}
                  </p>
                  <p className="mt-1 text-xs text-[#8C8791]">
                    {formatSidebarDate(event.parsedDate)}
                  </p>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => router.push("/events/create")}
            className="w-full rounded-full bg-[#E3C56A] px-4 py-3 text-sm font-semibold text-[#5A4A1F] hover:bg-[#d9b954] transition"
          >
            + Create Event
          </button>
        </div>
      </div>

      <div className="flex items-center pt-6">
        <div className="flex-1 flex justify-end">
          <Link
            href="/settings"
            className="flex items-center gap-2 text-sm text-[#4B474F] hover:text-[#171717] transition"
          >
            <Settings size={16} />
            Settings
          </Link>
        </div>

        <div className="mx-8 h-7 w-px bg-[#CFC8BC]" />

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