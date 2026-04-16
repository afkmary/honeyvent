"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/lib/firebase";
import { useUserAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar";

function splitName(displayName = "") {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(" ");
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
}

function capitalizeWords(value) {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function cleanNameInput(value) {
  return value.replace(/[^a-zA-Z\s'-]/g, "");
}

export default function ProfilePage() {
  const { user } = useUserAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const { firstName, lastName } = splitName(user.displayName || "");
    setFirstName(firstName);
    setLastName(lastName);
    setEmail(user.email || "");
    setPreviewUrl(user.photoURL || "");
  }, [user, router]);

  useEffect(() => {
    if (!selectedFile) return;

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const initialLetter = useMemo(() => {
    const source =
      firstName?.trim() ||
      user?.displayName ||
      user?.email ||
      "B";

    return source.charAt(0).toUpperCase();
  }, [firstName, user]);

  function handleFirstNameChange(e) {
    const cleaned = cleanNameInput(e.target.value);
    setFirstName(capitalizeWords(cleaned));
  }

  function handleLastNameChange(e) {
    const cleaned = cleanNameInput(e.target.value);
    setLastName(capitalizeWords(cleaned));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Please choose an image smaller than 5 MB.");
      return;
    }

    setError("");
    setSelectedFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || !auth.currentUser) return;

    setSaving(true);
    setError("");
    setMessage("");

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();
    const fullName = `${trimmedFirst} ${trimmedLast}`.trim();

    if (!trimmedFirst || !trimmedLast) {
      setError("Please enter both first and last name.");
      setSaving(false);
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email.");
      setSaving(false);
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      setSaving(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      setSaving(false);
      return;
    }

    try {
      let photoURL = user.photoURL || "";

      if (selectedFile) {
        const fileExtension = selectedFile.name.split(".").pop() || "png";
        const storageRef = ref(
          storage,
          `profilePictures/${user.uid}/avatar.${fileExtension}`
        );

        await uploadBytes(storageRef, selectedFile, {
          contentType: selectedFile.type,
        });

        photoURL = await getDownloadURL(storageRef);
      }

      await updateProfile(auth.currentUser, {
        displayName: fullName,
        photoURL,
      });

      if (trimmedEmail !== user.email) {
        await updateEmail(auth.currentUser, trimmedEmail);
      }

      if (newPassword) {
        await updatePassword(auth.currentUser, newPassword);
      }

      setMessage("Profile updated successfully.");
      setSelectedFile(null);
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    } catch (err) {
      console.error(err);

      if (err?.code === "auth/requires-recent-login") {
        setError("For security, please log out and log back in before changing your email or password.");
      } else if (err?.code === "auth/email-already-in-use") {
        setError("That email is already being used by another account.");
      } else if (err?.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err?.code === "auth/weak-password") {
        setError("Please choose a stronger password.");
      } else {
        setError("Failed to update profile.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#FFF8EF] flex">
      <Sidebar />

      <section className="flex-1 p-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold text-[#171717] mb-2">
            Edit Profile
          </h1>
          <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#F7E4C3] bg-[#F9F4EA] flex items-center justify-center">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Profile preview"
                      fill
                      sizes="96px"
                      className="object-cover"
                      unoptimized={previewUrl.startsWith("blob:")}
                    />
                  ) : (
                    <span className="text-3xl font-semibold text-[#A07F28]">
                      {initialLetter}
                    </span>
                  )}
                </div>

                {/* PROFILE PIC */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#171717]">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block text-sm text-[#6B7280] file:mr-4 file:rounded-full file:border-0 file:bg-[#F4B942] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#e5a932]"
                  />
                  <p className="text-xs text-[#8C8791]">
                    PNG or JPG, up to 5 MB.
                  </p>
                </div>
              </div>

              {/* NAME */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#171717] mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={handleFirstNameChange}
                    className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#171717] placeholder:text-[#B6B6B6] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                    placeholder="Enter your first name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#171717] mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={handleLastNameChange}
                    className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#171717] placeholder:text-[#B6B6B6] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-[#171717] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#171717] placeholder:text-[#B6B6B6] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* PASSWORD */}
              <div>
                {!showPasswordFields ? (
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(true)}
                    className="text-sm font-semibold text-[#C98C00] hover:underline"
                  >
                    Change Password
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-[#171717]">
                        Change Password
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordFields(false);
                          setNewPassword("");
                          setConfirmPassword("");
                          setShowNewPassword(false);
                          setShowConfirmPassword(false);
                        }}
                        className="text-sm font-medium text-[#8C8791] hover:underline"
                      >
                        Cancel
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#171717] mb-2">
                        New Password
                      </label>

                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 pr-20 text-[#171717] placeholder:text-[#B6B6B6] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                          placeholder="Enter your new password"
                        />

                        <button
                          type="button"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#8C8791] hover:text-[#171717] transition"
                        >
                          {showNewPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#171717] mb-2">
                        Confirm New Password
                      </label>

                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full rounded-2xl border border-[#E8DCC8] bg-white px-4 py-3 pr-20 text-[#171717] placeholder:text-[#B6B6B6] outline-none focus:border-[#F4B942] focus:ring-2 focus:ring-[#F4B942]/20"
                          placeholder="Re-enter your new password"
                        />

                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#8C8791] hover:text-[#171717] transition"
                        >
                          {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {message ? (
                <p className="text-sm text-green-600">{message}</p>
              ) : null}

              {error ? <p className="text-sm text-red-500">{error}</p> : null}

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[#E3C56A] px-5 py-3 text-sm font-semibold text-[#5A4A1F] hover:bg-[#d9b954] transition disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}