import { PrismaClient } from "@prisma/client";
import { generateAndStoreOtp, verifyOtp } from "../services/otp.service.js";
import { revokeAllBindings } from "../services/device.service.js";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

const prisma = new PrismaClient();

export const initiateRecovery = async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile) return res.status(400).json({ error: "Mobile number required" });

        const patient = await prisma.patient.findFirst({ where: { phoneNumber: mobile } });
        if (!patient) return res.status(404).json({ error: "Patient not found" });

        await generateAndStoreOtp(mobile);
        res.json({ message: "Recovery OTP sent" });
    } catch (err) {
        res.status(500).json({ error: "Initiate recovery failed" });
    }
};

export const verifyRecovery = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        const valid = await verifyOtp(mobile, otp);

        if (!valid) return res.status(401).json({ error: "Invalid OTP" });

        const patient = await prisma.patient.findFirst({ where: { phoneNumber: mobile } });

        // Generate a recovery token (short lived)
        const recoveryToken = jwt.sign(
            { unifiedId: patient.unifiedId, type: "RECOVERY" },
            config.jwtSecret,
            { expiresIn: "10m" }
        );

        res.json({ recoveryToken });
    } catch (err) {
        res.status(500).json({ error: "Verify recovery failed" });
    }
};

export const completeRecovery = async (req, res) => {
    try {
        const { recoveryToken, newPublicKey } = req.body;

        const decoded = jwt.verify(recoveryToken, config.jwtSecret);
        if (decoded.type !== "RECOVERY") throw new Error("Invalid token type");

        const { unifiedId } = decoded;

        // 🔐 SECURITY: Revoke all old device tokens/bindings
        await revokeAllBindings(unifiedId);

        // Note: The app will typically follow up with a fresh /device/bind
        // using its new keypair. We just ensure the path is cleared.

        res.json({ message: "Recovery complete. All previous sessions revoked." });
    } catch (err) {
        res.status(401).json({ error: "Recovery completion failed", details: err.message });
    }
};
