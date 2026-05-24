import express from 'express';
import validate from '../middlewares/validate.middleware.js';
import { loginSchema, registerSchema } from '../validations/auth.validation.js';
import { login, register } from '../controllers/auth.controller.js'; 

const router = express.Router();


router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);

export default router;