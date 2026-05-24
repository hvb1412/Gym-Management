import express from "express";
import validate from "../middlewares/validate.middleware.js";
import { verifyToken, restrictTo } from "../middlewares/auth.middleware.js";
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
} from "../validations/auth.validation.js";
import {
  login,
  register,
  changePassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post("/register", validate(registerSchema), register);

router.put(
  "/change-password",
  verifyToken, // Phải có token hợp lệ
  validate(changePasswordSchema), // Body phải chuẩn
  changePassword, // Logic đổi pass
);

// Ví dụ về việc sử dụng restrictTo (Bạn có thể áp dụng cho các module sau này)
// router.delete('/delete-account', verifyToken, restrictTo('owner', 'manager'), deleteLogic);

export default router;
