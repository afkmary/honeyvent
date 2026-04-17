"use client";

import { useParams, useRouter } from "next/navigation";
import { useUserAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar";
import EventHeaderCard from "./_components/EventHeaderCard";
import GuestListCard from "./_components/GuestListCard";
import ChecklistCard from "./_components/ChecklistCard";
import NotesCard from "./_components/NotesCard";
import TaskNoteModal from "./_components/TaskNoteModal";
import useEventDetails from "./_hooks/useEventDetails";

export default function EventDetailsPage() {
  const { user } = useUserAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id;

  const {
    eventData,
    setEventData,
    loading,
    savingSection,
    guestList,
    checklist,
    notes,
    guestInput,
    setGuestInput,
    checklistInput,
    setChecklistInput,
    notesInput,
    setNotesInput,
    guestError,
    selectedTask,
    selectedTaskIndex,
    showTaskNoteModal,
    selectedTaskNoteInput,
    setSelectedTaskNoteInput,
    addGuest,
    removeGuest,
    updateGuestName,
    addChecklistItem,
    removeChecklistItem,
    toggleChecklistItem,
    updateChecklistItemText,
    addNote,
    removeNote,
    updateNoteText,
    selectTask,
    closeTaskNoteModal,
    clearSelectedTaskNote,
    saveTaskDetails,
  } = useEventDetails({
    user,
    router,
    eventId,
  });

  if (!user) return null;

  return (
    <>
      <main className="min-h-screen bg-[#FFF8EF] flex">
        <Sidebar />

        <section className="flex-1 p-8">
          {loading ? (
            <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8]">
              <p className="text-[#6B7280]">Loading event...</p>
            </div>
          ) : !eventData ? (
            <div className="rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8]">
              <h1 className="text-2xl font-semibold text-[#171717] mb-2">
                Event not found
              </h1>

              <p className="text-[#6B7280] mb-4">
                We couldn’t find that event in your hive.
              </p>

              <button
                onClick={() => router.push("/dashboard")}
                className="rounded-full bg-[#E3C56A] px-5 py-3 text-sm font-semibold text-[#5A4A1F] hover:bg-[#d9b954] transition"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <EventHeaderCard
                user={user}
                eventId={eventId}
                eventData={eventData}
                setEventData={setEventData}
              />

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <GuestListCard
                  guestList={guestList}
                  guestInput={guestInput}
                  setGuestInput={setGuestInput}
                  addGuest={addGuest}
                  removeGuest={removeGuest}
                  updateGuestName={updateGuestName}
                  saving={savingSection === "guest"}
                  guestError={guestError}
                />

                <ChecklistCard
                  checklist={checklist}
                  checklistInput={checklistInput}
                  setChecklistInput={setChecklistInput}
                  addChecklistItem={addChecklistItem}
                  removeChecklistItem={removeChecklistItem}
                  toggleChecklistItem={toggleChecklistItem}
                  updateChecklistItemText={updateChecklistItemText}
                  saving={savingSection === "checklist"}
                  selectedTaskIndex={selectedTaskIndex}
                  onSelectTask={selectTask}
                />

                <NotesCard
                  notes={notes}
                  notesInput={notesInput}
                  setNotesInput={setNotesInput}
                  addNote={addNote}
                  removeNote={removeNote}
                  updateNoteText={updateNoteText}
                  saving={savingSection === "note"}
                />
              </div>
            </div>
          )}
        </section>
      </main>

      <TaskNoteModal
        open={showTaskNoteModal}
        selectedTask={selectedTask}
        selectedTaskIndex={selectedTaskIndex}
        selectedTaskNoteInput={selectedTaskNoteInput}
        setSelectedTaskNoteInput={setSelectedTaskNoteInput}
        closeTaskNoteModal={closeTaskNoteModal}
        clearSelectedTaskNote={clearSelectedTaskNote}
        saveTaskDetails={saveTaskDetails}
        isSaving={savingSection === "checklist"}
      />
    </>
  );
}