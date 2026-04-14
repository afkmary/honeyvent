"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useUserAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { logIn } = useUserAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await logIn(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to log in. Check your credentials.");
      console.error(err);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-6 font-sans bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="w-full max-w-md rounded-4xl bg-white/88 shadow-xl px-6 pt-4 pb-5 backdrop-blur-sm">
        <div className="relative w-full h-30 -mt-3 mb-1">
          <Image
            src="/honeyventlogo.png"
            alt="HoneyVent Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <p className="text-[#6B7280] text-base font-medium">
            Welcome back, busy bee
          </p>

          <img
            src="/beetrail.png"
            alt="bee trail"
            className="w-8 h-8 object-contain bee-float"
          />
        </div>

        {error && (
          <p className="mb-3 text-sm text-center text-red-500">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-2.5 text-[#171717] placeholder:text-[#B6B6B6] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-2.5 pr-12 text-[#171717] placeholder:text-[#B6B6B6] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F4B942] transition duration-200"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="w-full rounded-2xl bg-[#F4B942] py-3 font-semibold text-white transition hover:bg-[#e5a932]"
          >
            Log In
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#B6B6B6]">
          Don’t have an account?{" "}
          <Link href="/signup" className="font-semibold text-[#C98C00]">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}