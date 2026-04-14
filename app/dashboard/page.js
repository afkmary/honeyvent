"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user, logOut } = useUserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  async function handleLogout() {
    try {
      await logOut();
      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  }

  if (!user) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <main className="min-h-screen bg-[#fff8ef] p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Logged in as: {user.email}</p>

      <button
        onClick={handleLogout}
        className="bg-[#f4b942] text-white px-5 py-3 rounded-2xl"
      >
        Log Out
      </button>
    </main>
  );
}