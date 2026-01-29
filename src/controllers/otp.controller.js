import supabase from "../services/supabase.service.js";
import { PrismaClient } from "@prisma/client";
import { logAudit } from "../services/audit.service.js";

const prisma = new PrismaClient();

export const requestOtp = async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number required" });
    }

    await generateAndStoreOtp(phoneNumber);

    res.json({ message: "OTP sent" });
};

export const verifyOtpAndClaim = async (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
        return res.status(400).json({ error: "Invalid request" });
    }

    const valid = await verifyOtp(phoneNumber, otp);

    if (!valid) {
        return res.status(401).json({ error: "Invalid or expired OTP" });
    }

    const patient = await prisma.patient.findFirst({
        where: { phoneNumber }
    });

    if (!patient) {
        return res.status(404).json({
            error: "No Unified ID linked to this number"
        });
    }

    res.json({
        unifiedId: patient.unifiedId,
        claimStatus: "CLAIMED"
    });
};

export const verifyOtpForIntent = async (req, res) => {
    try {
        const { intentId, accessToken } = req.body;

        if (!intentId || !accessToken) {
            return res.status(400).json({
                error: "intentId and accessToken required"
            });
        }

        // 🔐 Verify token with Supabase
        const { data, error } = await supabase.auth.getUser(accessToken);

        if (error || !data?.user) {
            return res.status(401).json({
                error: "Invalid or expired OTP token"
            });
        }

        const verifiedPhone = data.user.phone;

        // 🔍 Fetch intent + patient
        const intent = await prisma.editIntent.findUnique({
            where: { id: intentId },
            include: { patient: true }
        });

        if (!intent) {
            return res.status(404).json({ error: "Edit intent not found" });
        }

        if (intent.used || intent.expiresAt < new Date()) {
            return res.status(403).json({ error: "Edit intent expired or used" });
        }

        // 🔗 Match phone number (Handle potential formatting differences)
        // Supabase usually returns phone with '+' prefix
        const patientPhone = intent.patient.phoneNumber.startsWith("+")
            ? intent.patient.phoneNumber
            : `+${intent.patient.phoneNumber}`;

        if (patientPhone !== verifiedPhone) {
            return res.status(403).json({
                error: "OTP phone does not match patient phone"
            });
        }

        // ✅ Mark intent as OTP-verified
        await prisma.editIntent.update({
            where: { id: intentId },
            data: {
                otpVerified: true,
                otpProvider: "supabase",
                otpVerifiedAt: new Date()
            }
        });

        // 🧾 STEP 9 — Mandatory audit log entry
        await logAudit({
            staffId: intent.staffId,
            patientId: intent.patientId,
            action: "OTP_VERIFIED",
            intentId,
            otpProvider: "supabase"
        });

        res.json({
            message: "OTP verified and bound to edit intent",
            intentId
        });

    } catch (err) {
        res.status(500).json({
            error: "OTP verification failed",
            details: err.message
        });
    }
};
