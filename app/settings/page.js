"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useUserAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function SettingsPage() {
  const { user, logOut } = useUserAuth();
  const router = useRouter();

  const [showClearEventsModal, setShowClearEventsModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const [clearingEvents, setClearingEvents] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  if (!user) return null;

  async function handleClearEvents() {
    setClearingEvents(true);

    try {
      const eventsRef = collection(db, "users", user.uid, "events");
      const snapshot = await getDocs(eventsRef);

      const deletes = snapshot.docs.map((eventDoc) =>
        deleteDoc(doc(db, "users", user.uid, "events", eventDoc.id))
      );

      await Promise.all(deletes);
      setShowClearEventsModal(false);
    } catch (error) {
      console.error("Error clearing events:", error);
    } finally {
      setClearingEvents(false);
    }
  }

  async function handleDeleteAccount() {
    if (!auth.currentUser) return;

    setDeletingAccount(true);

    try {
      const eventsRef = collection(db, "users", user.uid, "events");
      const snapshot = await getDocs(eventsRef);

      const deletes = snapshot.docs.map((eventDoc) =>
        deleteDoc(doc(db, "users", user.uid, "events", eventDoc.id))
      );

      await Promise.all(deletes);

      await deleteUser(auth.currentUser);
      await logOut();
      router.push("/signup");
    } catch (error) {
      console.error("Error deleting account:", error);

      if (error.code === "auth/requires-recent-login") {
        alert("Please log out and log back in before deleting your account.");
      }
    } finally {
      setDeletingAccount(false);
    }
  }

  return (
    <>
      <main className="min-h-screen bg-[#FFF8EF] flex">
        <Sidebar />

        <section className="flex-1 p-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold text-[#171717] mb-2">
              Settings
            </h1>
            <p className="text-[#6B7280] mb-8">
              Manage your account and data.
            </p>

            <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8]">
              <h2 className="text-xl font-semibold text-[#B85C47] mb-4">
                Danger Zone
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-[#171717]">
                      Clear all events
                    </p>
                    <p className="text-sm text-[#8C8791]">
                      Permanently delete all your events.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowClearEventsModal(true)}
                    className="rounded-full bg-[#F9E1DC] px-5 py-3 text-sm font-semibold text-[#B85C47] hover:bg-[#f3d1ca] transition shrink-0"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-[#171717]">
                      Delete account
                    </p>
                    <p className="text-sm text-[#8C8791]">
                      Permanently delete your account and all HoneyVent data.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowDeleteAccountModal(true)}
                    className="rounded-full bg-[#F5C2B8] px-5 py-3 text-sm font-semibold text-[#8A2E1F] hover:bg-[#efb0a4] transition shrink-0"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ConfirmationModal
        isOpen={showClearEventsModal}
        title="Clear all events?"
        description="This will permanently delete all of your events. This action cannot be undone."
        confirmText="Clear Events"
        onClose={() => {
          if (!clearingEvents) setShowClearEventsModal(false);
        }}
        onConfirm={handleClearEvents}
        loading={clearingEvents}
        confirmButtonClassName="bg-[#F9E1DC] text-[#B85C47] hover:bg-[#f3d1ca]"
      />

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={showDeleteAccountModal}
        title="Delete account?"
        description="This will permanently delete your HoneyVent account and all associated data. This action cannot be undone."
        confirmText="Delete Account"
        onClose={() => {
          if (!deletingAccount) setShowDeleteAccountModal(false);
        }}
        onConfirm={handleDeleteAccount}
        loading={deletingAccount}
        confirmButtonClassName="bg-[#F5C2B8] text-[#8A2E1F] hover:bg-[#efb0a4]"
      />
    </>
  );
}