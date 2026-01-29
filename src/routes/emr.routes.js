import express from "express";
import {
    getEMR,
    updateEMR,
    triggerEmergencyAccess,
    uploadPrescription,
    getPrescriptions
} from "../controllers/emr.controller.js";
import { authenticate, rbac } from "../middleware/auth.middleware.js";
import { uploadPrescriptionImage } from "../middleware/upload.middleware.js";

const router = express.Router();

/**
 * Fetch EMR
 */
import { requireConsent } from "../middleware/consent.middleware.js";

router.get(
    "/:patientId",
    authenticate,
    requireConsent,
    getEMR
);

/**
 * Update full EMR — MANAGEMENT ONLY
 */
router.put(
    "/:patientId",
    authenticate,
    rbac(["MANAGEMENT"]),
    updateEMR
);

/**
 * View prescriptions — DOCTOR, CLINIC, MANAGEMENT
 */
router.get(
    "/:patientId/prescriptions",
    authenticate,
    rbac(["DOCTOR", "CLINIC", "MANAGEMENT"]),
    getPrescriptions
);

/**
 * Add prescription (with Image) — MANAGEMENT ONLY
 */
router.post(
    "/:patientId/prescriptions",
    authenticate,
    rbac(["MANAGEMENT"]),
    uploadPrescriptionImage.single("image"),
    uploadPrescription
);
/**
 * Trigger emergency access (BREAK-GLASS)
 */
router.post("/:patientId/emergency", authenticate, triggerEmergencyAccess);

export default router;
