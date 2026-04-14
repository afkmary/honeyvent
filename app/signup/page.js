"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useUserAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const { signUp } = useUserAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signUp(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to create account");
      console.error(err);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-6 font-sans bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="w-full max-w-md rounded-4xl bg-white/88 shadow-xl px-6 pt-4 pb-5 backdrop-blur-sm">

        {/* LOGO */}
        <div className="relative w-full h-30 -mt-3 mb-1">
          <Image
            src="/honeyventlogo.png"
            alt="HoneyVent Logo"
            fill
            sizes="(max-width: 768px) 100vw, 450px"
            className="object-contain"
            priority
          />
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">

          <img
            src="/smallbees.png"
            alt="bee"
            className="w-7 h-7 object-contain bee-float translate-y-px"
          />

          <p className="text-[#6B7280] text-base font-medium">
            Start planning in the hive
          </p>

          <img
            src="/smallbees.png"
            alt="bee"
            className="w-7 h-7 object-contain bee-float translate-y-px"
          />
        </div>

        {error && (
          <p className="mb-3 text-sm text-red-500 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* NAME */}
          <input
            type="text"
            placeholder="Full Name"
            className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-2.5 text-[#171717] placeholder:text-[#B6B6B6] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F4B942] transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-2.5 pr-12 text-[#171717] placeholder:text-[#B6B6B6] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F4B942] transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* SIGNUP BUTTON */}
          <button
            type="submit"
            className="w-full rounded-2xl bg-[#F4B942] py-3 text-white font-semibold transition hover:bg-[#e5a932]"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-[#B6B6B6] mt-5">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#C98C00]">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}