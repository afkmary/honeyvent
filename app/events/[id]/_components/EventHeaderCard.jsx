"use client";

import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import BannerActions from "./BannerActions";
import EventHeaderDisplay from "./EventHeaderDisplay";
import EventHeaderEditForm from "./EventHeaderEditForm";

function splitTimeString(timeString = "") {
  if (!timeString || !timeString.includes(":")) {
    return { hour: "12", minute: "00", period: "AM" };
  }

  const [timePart, periodPart] = timeString.split(" ");
  const [hour = "12", minute = "00"] = (timePart || "").split(":");

  return {
    hour: hour || "12",
    minute: minute || "00",
    period: periodPart || "AM",
  };
}

function getEventFormValues(eventData) {
  const startParts = splitTimeString(eventData?.startTime || "");
  const endParts = splitTimeString(eventData?.endTime || "");

  return {
    eventName: eventData?.eventName || "",
    theme: eventData?.theme || "",
    startDate: eventData?.startDate || eventData?.date || "",
    endDate: eventData?.endDate || eventData?.startDate || eventData?.date || "",
    startHour: startParts.hour,
    startMinute: startParts.minute,
    startPeriod: startParts.period,
    endHour: endParts.hour,
    endMinute: endParts.minute,
    endPeriod: endParts.period,
    allDay: Boolean(eventData?.allDay),
  };
}

export default function EventHeaderCard({ user, eventId, eventData, setEventData }) {
  const [isEditingEvent, setIsEditingEvent] = useState(false);

  const [eventNameInput, setEventNameInput] = useState("");
  const [themeInput, setThemeInput] = useState("");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [startHour, setStartHour] = useState("12");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState("AM");
  const [endHour, setEndHour] = useState("12");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState("AM");
  const [allDayInput, setAllDayInput] = useState(false);

  const [savingEvent, setSavingEvent] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [headerError, setHeaderError] = useState("");

  function loadFormValues() {
    const values = getEventFormValues(eventData);

    setEventNameInput(values.eventName);
    setThemeInput(values.theme);
    setStartDateInput(values.startDate);
    setEndDateInput(values.endDate);
    setStartHour(values.startHour);
    setStartMinute(values.startMinute);
    setStartPeriod(values.startPeriod);
    setEndHour(values.endHour);
    setEndMinute(values.endMinute);
    setEndPeriod(values.endPeriod);
    setAllDayInput(values.allDay);
  }

  useEffect(() => {
    loadFormValues();
  }, [eventData]);

  function openEditMode() {
    loadFormValues();
    setHeaderError("");
    setIsEditingEvent(true);
  }

  function cancelEditEvent() {
    loadFormValues();
    setHeaderError("");
    setIsEditingEvent(false);
  }

  async function saveEventDetails() {
    if (!user || !eventId) return;

    const trimmedEventName = eventNameInput.trim();
    const trimmedTheme = themeInput.trim();

    if (!trimmedEventName || !startDateInput) {
      setHeaderError("Please enter an event name and start date.");
      return;
    }

    setSavingEvent(true);
    setHeaderError("");

    try {
      const finalEndDate = endDateInput || startDateInput;

      const updatedFields = {
        eventName: trimmedEventName,
        theme: trimmedTheme,
        startDate: startDateInput,
        endDate: finalEndDate,
        allDay: allDayInput,
        startTime: allDayInput
          ? ""
          : `${startHour}:${startMinute} ${startPeriod}`,
        endTime: allDayInput
          ? ""
          : `${endHour}:${endMinute} ${endPeriod}`,
      };

      const eventRef = doc(db, "users", user.uid, "events", eventId);
      await updateDoc(eventRef, updatedFields);

      setEventData((prev) => ({
        ...prev,
        ...updatedFields,
      }));

      setIsEditingEvent(false);
    } catch (error) {
      console.error("Error updating event details:", error);
      setHeaderError("Failed to update event details.");
    } finally {
      setSavingEvent(false);
    }
  }

  async function handleBannerUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !user || !eventId) return;

    setHeaderError("");
    setBannerUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const imageRef = ref(
        storage,
        `users/${user.uid}/event-banners/${fileName}`
      );

      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      const eventRef = doc(db, "users", user.uid, "events", eventId);
      await updateDoc(eventRef, {
        coverImage: downloadURL,
      });

      setEventData((prev) => ({
        ...prev,
        coverImage: downloadURL,
      }));
    } catch (error) {
      console.error("Error uploading banner:", error);
      setHeaderError("Failed to upload banner.");
    } finally {
      setBannerUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="rounded-4xl bg-white shadow-sm border border-[#F0E7D8] overflow-hidden">
      <div className="relative h-55">
        {eventData?.coverImage ? (
          <img
            src={eventData.coverImage}
            alt={eventData.eventName || "Event banner"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-r from-[#F6D37A] via-[#F4B942] to-[#E8C867]" />
        )}

        <BannerActions
          bannerUploading={bannerUploading}
          handleBannerUpload={handleBannerUpload}
          openEditMode={openEditMode}
        />
      </div>

      <div className="p-8">
        {isEditingEvent ? (
          <EventHeaderEditForm
            eventNameInput={eventNameInput}
            setEventNameInput={setEventNameInput}
            themeInput={themeInput}
            setThemeInput={setThemeInput}
            startDateInput={startDateInput}
            setStartDateInput={setStartDateInput}
            endDateInput={endDateInput}
            setEndDateInput={setEndDateInput}
            startHour={startHour}
            setStartHour={setStartHour}
            startMinute={startMinute}
            setStartMinute={setStartMinute}
            startPeriod={startPeriod}
            setStartPeriod={setStartPeriod}
            endHour={endHour}
            setEndHour={setEndHour}
            endMinute={endMinute}
            setEndMinute={setEndMinute}
            endPeriod={endPeriod}
            setEndPeriod={setEndPeriod}
            allDayInput={allDayInput}
            setAllDayInput={setAllDayInput}
            headerError={headerError}
            cancelEditEvent={cancelEditEvent}
            saveEventDetails={saveEventDetails}
            savingEvent={savingEvent}
          />
        ) : (
          <EventHeaderDisplay
            eventData={eventData}
            headerError={headerError}
          />
        )}
      </div>
    </div>
  );
}