import express from "express";
import {
    bindDevice,
    issueDeviceChallenge,
    verifyDeviceChallenge,
    registerPushToken
} from "../controllers/device.controller.js";
import { authenticateDevice } from "../middleware/deviceAuth.middleware.js";

const router = express.Router();

/**
 * Device binding
 */
router.post("/bind", bindDevice);

/**
 * Issue cryptographic challenge
 */
router.post("/challenge", issueDeviceChallenge);

/**
 * Verify signed challenge
 */
router.post("/challenge/verify", verifyDeviceChallenge);

/**
 * Register push token (Patient App)
 */
router.post("/push/register", authenticateDevice, registerPushToken);

export default router;
