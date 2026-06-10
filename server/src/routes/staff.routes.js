import express from "express";
import {
  getAllStaffs,
  getStaffByCode,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffAttendance,
} from "../controllers/staff.controller.js";

const router = express.Router();

router.get("/", getAllStaffs);
router.get("/:code", getStaffByCode);
router.get("/:code/attendance", getStaffAttendance);
router.post("/", createStaff);
router.put("/:code", updateStaff);
router.delete("/:code", deleteStaff);

export default router;
