import express from "express";
import {
    createConsentRequest,
    actOnConsent
} from "../controllers/consent.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * Staff requests consent
 */
router.post("/request", authenticate, createConsentRequest);

/**
 * Patient approves / denies consent
 * (app-side auth assumed later)
 */
router.post("/act", actOnConsent);

export default router;
