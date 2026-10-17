import express from "express";
import { protect, doctor, patient } from "../middleware/authMiddleware.js";
import { getMyReports, getDoctorReports } from "../controllers/reportController.js";

const router = express.Router();
router.get("/my-reports", protect, patient, getMyReports);
router.get("/doctor-reports", protect, doctor, getDoctorReports);

export default router;