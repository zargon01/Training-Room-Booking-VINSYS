import { sendOtp, verifyOtp } from '../controllers/mail.controllers.js';
import express from 'express';


const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router;
