// controllers/reportController.js
import Report from "../models/Report.js";
import asyncHandler from "express-async-handler";

// @desc    Get logged in patient's reports
// @route   GET /api/reports/my-reports
// @access  Private/Patient
export const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ patient: req.user._id })
    .populate("doctor", "name email")
    .populate("appointment", "appointmentDate status")
    .sort({ createdAt: -1 });

  if (reports) {
    res.json(reports);
  } else {
    res.status(404);
    throw new Error("No reports found");
  }
});

// @desc    Get reports uploaded by the logged-in doctor
// @route   GET /api/reports/doctor-reports
// @access  Private/Doctor
export const getDoctorReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ doctor: req.user._id })
    .populate("patient", "name email")
    .populate("appointment", "appointmentDate status")
    .sort({ createdAt: -1 });

  res.json(reports);
});