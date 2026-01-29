import { PrismaClient } from "@prisma/client";
import { logAudit } from "../services/audit.service.js";
import { grantEmergencyAccess, hasValidEmergencyAccess } from "../services/emergency.service.js";
import { sendPushNotification } from "../services/push.service.js";
import { consumeEditIntent } from "../services/editIntent.service.js";

const prisma = new PrismaClient();

export const getEMR = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { role, staffId } = req.user;

        const emr = await prisma.eMR.findFirst({
            where: { patientId }
        });
        const emergencyAllowed = await hasValidEmergencyAccess(staffId, patientId);

        if (emergencyAllowed) {
            await logAudit({
                staffId,
                patientId,
                action: "EMERGENCY_VIEW",
                emergency: true
            });

            return res.json({
                patientId,
                allergies: emr?.allergies || null,
                medications: emr?.medications || null,
                diagnosis: emr?.diagnosis || null,
                surgeries: emr?.surgeries || null,
                emergency: true
            });
        }


        if (!emr) {
            return res.status(404).json({ error: "EMR not found" });
        }

        // NORMAL MODE — RBAC
        if (!["DOCTOR", "MANAGEMENT", "CLINIC"].includes(role)) {
            return res.status(403).json({ error: "Access denied" });
        }

        await logAudit({
            staffId,
            patientId,
            action: "VIEW_EMR",
            emergency: false
        });

        res.json({
            patientId,
            allergies: emr.allergies,
            medications: emr.medications,
            diagnosis: emr.diagnosis,
            surgeries: emr.surgeries
        });
    } catch (err) {
        console.error("EMR FETCH ERROR:", err);
        res.status(500).json({
            error: "Server error fetching EMR",
            details: err.message
        });
    }
};


const allowedEmrFields = [
    "diagnosis",
    "allergies",
    "medications",
    "surgeries"
];

export const updateEMR = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { intentId, ...updates } = req.body;
        const { staffId, role } = req.user;

        if (!intentId) {
            return res.status(403).json({
                error: "Edit intent required"
            });
        }

        const intent = await consumeEditIntent({ intentId });

        if (intent.staffId !== staffId || intent.patientId !== patientId) {
            return res.status(403).json({
                error: "Intent does not match staff or patient"
            });
        }

        const intentFields = JSON.parse(intent.allowedFields);

        for (const field of Object.keys(updates)) {
            if (
                !allowedEmrFields.includes(field) ||
                !intentFields.includes(field)
            ) {
                return res.status(403).json({
                    error: `Field not allowed by intent: ${field}`
                });
            }
        }

        const existingEmr = await prisma.eMR.findFirst({ where: { patientId } });

        let updated;
        if (existingEmr) {
            updated = await prisma.eMR.update({
                where: { id: existingEmr.id },
                data: {
                    ...updates,
                    updatedByStaffId: staffId,
                    updatedByRole: role
                }
            });
        } else {
            updated = await prisma.eMR.create({
                data: {
                    patientId,
                    ...updates,
                    createdByStaffId: staffId,
                    updatedByStaffId: staffId,
                    updatedByRole: role
                }
            });
        }

        // STEP 7 — Audit Logging (MANDATORY)
        await logAudit({
            staffId,
            patientId,
            action: "UPDATE_EMR",
            intentId,
            otpVerified: true,
            otpProvider: "supabase"
        });

        res.json({
            message: "EMR updated via intent",
            updated
        });
    } catch (err) {
        res.status(500).json({
            error: "EMR update failed",
            details: err.message
        });
    }
};

/**
 * Add daily prescription — CLINIC only
 */
export const addDailyPrescription = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { role, staffId } = req.user;
        const { date, medicine, notes } = req.body;

        if (role !== "CLINIC") {
            return res.status(403).json({ error: "Only clinic staff can add prescriptions" });
        }

        if (!date || !medicine) {
            return res.status(400).json({ error: "Date and medicine are required" });
        }

        const prescription = await prisma.prescription.create({
            data: {
                patientId,
                date,
                medicine,
                notes
            }
        });

        await logAudit({
            staffId,
            patientId,
            action: "ADD_PRESCRIPTION",
            emergency: false
        });

        res.json({
            message: "Prescription added successfully",
            prescription
        });
    } catch (err) {
        res.status(500).json({
            error: "Error adding prescription",
            details: err.message
        });
    }
};

/**
 * Trigger emergency access (Break-glass)
 */
export const triggerEmergencyAccess = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { staffId, role } = req.user;

        if (!["DOCTOR", "MANAGEMENT"].includes(role)) {
            return res.status(403).json({
                error: "Only doctor or management can trigger emergency access"
            });
        }

        const record = await grantEmergencyAccess(staffId, patientId);

        // B-3: Trigger push notification immediately
        // B-6: Failure handling - do not block main flow.
        sendPushNotification(patientId, "EMERGENCY_ACCESS")
            .catch(err => console.error("Push firing error:", err));

        res.json({
            message: "Emergency access granted",
            expiresAt: record.expiresAt
        });
    } catch (err) {
        res.status(500).json({
            error: "Failed to grant emergency access",
            details: err.message
        });
    }
};
export const uploadPrescription = async (req, res) => {
    try {
        // ✅ STEP 2 GOES HERE (URL PARAM)
        const { patientId } = req.params;

        // ✅ text comes from form-data
        const { text } = req.body;
        const { staffId, role } = req.user;

        if (!patientId || !text) {
            return res.status(400).json({
                error: "patientId and text are required"
            });
        }

        const imageUrl = req.file
            ? `/uploads/prescriptions/${req.file.filename}`
            : null;

        const prescription = await prisma.prescription.create({
            data: {
                patientId,                 // ✅ NOW PRESENT
                text,
                imageUrl,
                createdByStaffId: staffId,
                updatedByStaffId: staffId,
                updatedByRole: role
            }
        });

        res.status(201).json({
            message: "Prescription added",
            prescription
        });

    } catch (err) {
        console.error("UPLOAD PRESCRIPTION ERROR:", err);
        res.status(500).json({
            error: "Failed to add prescription",
            details: err.message
        });
    }
};

/**
 * Get prescriptions for a patient — Doctor, Clinic, Management
 */
export const getPrescriptions = async (req, res) => {
    try {
        const { patientId } = req.params;

        if (!patientId) {
            return res.status(400).json({
                error: "patientId is required"
            });
        }

        const prescriptions = await prisma.prescription.findMany({
            where: { patientId },
            orderBy: { createdAt: "desc" }
        });

        res.json(prescriptions);
    } catch (err) {
        console.error("GET PRESCRIPTIONS ERROR:", err);
        res.status(500).json({
            error: "Failed to fetch prescriptions",
            details: err.message
        });
    }
};
