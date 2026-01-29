import express from "express";
import {
    requestOtp,
    verifyOtpAndClaim
} from "../controllers/otp.controller.js";

const router = express.Router();

router.post("/request", requestOtp);
router.post("/verify", verifyOtpAndClaim);

export default router;
