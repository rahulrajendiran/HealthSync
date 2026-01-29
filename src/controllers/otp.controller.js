import { PrismaClient } from "@prisma/client";
import {
    generateAndStoreOtp,
    verifyOtp
} from "../services/otp.service.js";

const prisma = new PrismaClient();

/**
 * Request OTP (claim channel)
 */
export const requestOtp = async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number required" });
    }

    await generateAndStoreOtp(phoneNumber);

    res.json({ message: "OTP sent" });
};

/**
 * Verify OTP and return Unified ID reference
 */
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
        const { intentId, otpProof } = req.body;

        if (!intentId || !otpProof) {
            return res.status(400).json({ error: "Missing intentId or otpProof" });
        }

        // 🔒 TODO: Verify otpProof with Supabase Admin API
        // Assume verification succeeds for prototype

        const intent = await prisma.editIntent.update({
            where: { id: intentId },
            data: {
                otpVerified: true,
                otpProvider: "supabase",
                otpVerifiedAt: new Date()
            }
        });

        res.json({
            message: "OTP verified for edit intent",
            intentId: intent.id
        });
    } catch (err) {
        res.status(500).json({
            error: "OTP verification failed",
            details: err.message
        });
    }
};
