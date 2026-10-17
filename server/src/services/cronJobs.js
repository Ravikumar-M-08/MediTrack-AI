import cron from "node-cron";
import Appointment from "../models/Appointment.js";
import PatientProfile from "../models/PatientProfile.js";
import { sendReminderSMS } from "./smsService.js";

export const sendAllReminders = async () => {
  const tomorrowStart = new Date();
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    status: { $in: ["Scheduled", "Confirmed"] }, // skip cancelled/completed
    appointmentDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
  }).populate("patient", "name");

  console.log(`📋 Reminder sweep: ${appointments.length} appointment(s) tomorrow`);

  for (const appt of appointments) {
    if (!appt.patient) continue;

    const profile = await PatientProfile.findOne({ user: appt.patient._id });
    if (!profile?.contactNumber) {
      console.log(`No contact number for ${appt.patient.name}`);
      continue;
    }

    const time = new Date(appt.appointmentDate)
      .toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", " at");

    await sendReminderSMS(profile.contactNumber, appt.patient.name, time);
  }
};

const initCronJobs = () => {
  // Daily at 9:00 AM IST
  cron.schedule(
    "0 9 * * *",
    () => {
      console.log("⏰ 9AM reminder run started");
      sendAllReminders().catch((e) => console.error("Reminder run failed:", e));
    },
    { timezone: "Asia/Kolkata" }
  );

  // Optional: run once at startup for testing (set SEND_REMINDERS_ON_START=true in .env)
  if (process.env.SEND_REMINDERS_ON_START === "true") {
    console.log("🚀 Startup reminder sweep...");
    sendAllReminders().catch((e) => console.error("Startup sweep failed:", e));
  }
};

export default initCronJobs;