import express from "express";
import {
    getPatientInsurance,
    verifyInsurance
} from "../controllers/insurance.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { rbac } from "../middleware/rbac.middleware.js";

const router = express.Router();

/**
 * View insurance — Doctor & Management
 */
router.get(
    "/:patientId",
    authenticate,
    rbac(["DOCTOR", "MANAGEMENT"]),
    getPatientInsurance
);

/**
 * Verify eligibility — Management only
 */
router.post(
    "/:patientId/verify",
    authenticate,
    rbac(["MANAGEMENT"]),
    verifyInsurance
);

export default router;
