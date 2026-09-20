import Appointment from "../models/Appointment.js";
import DoctorProfile from "../models/DoctorProfile.js";
import Leave from "../models/Leave.js";
import MedicationLog from "../models/MedicationLog.js";
import PatientProfile from "../models/PatientProfile.js";
import Prescription from "../models/Prescription.js";
import Report from "../models/Report.js";
import User from "../models/User.js";

const models = [
  User,
  PatientProfile,
  DoctorProfile,
  Appointment,
  Prescription,
  MedicationLog,
  Report,
  Leave,
];

const initializeDatabase = async () => {
  for (const model of models) {
    try {
      await model.createCollection();
    } catch (error) {
      if (error.codeName !== "NamespaceExists") throw error;
    }
  }

  await Promise.all(models.map((model) => model.createIndexes()));
  console.log("✅ MongoDB collections and indexes are ready");
};

export default initializeDatabase;
