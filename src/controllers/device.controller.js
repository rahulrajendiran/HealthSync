import {
    ensureNoActiveBinding,
    createDeviceBinding
} from "../services/device.service.js";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import {
    createChallenge,
    verifyChallenge
} from "../services/deviceChallenge.service.js";
const prisma = new PrismaClient();

/**
 * Bind a device to an issued Unified ID
 */
export const bindDevice = async (req, res) => {
    try {
        const {
            unifiedId,
            deviceId,
            publicKey,
            deviceName,
            platform
        } = req.body;

        if (!unifiedId || !deviceId || !publicKey) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }

        await ensureNoActiveBinding(unifiedId);

        await createDeviceBinding({
            unifiedId,
            deviceId,
            publicKey,
            deviceName,
            platform
        });

        res.json({
            message: "Device successfully bound",
            unifiedId
        });
    } catch (err) {
        res.status(409).json({
            error: err.message
        });
    }
};
/**
 * Issue device challenge
 */
export const issueDeviceChallenge = async (req, res) => {
    try {
        const { deviceId } = req.body;

        if (!deviceId) {
            return res.status(400).json({
                error: "deviceId required"
            });
        }

        const challenge = await createChallenge(deviceId);

        res.json({
            challenge
        });
    } catch (err) {
        res.status(500).json({
            error: "Failed to issue challenge"
        });
    }
};
/**
 * Verify signed challenge (proof of possession)
 */
export const verifyDeviceChallenge = async (req, res) => {
    try {
        const {
            deviceId,
            challenge,
            signature
        } = req.body;

        if (!deviceId || !challenge || !signature) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }

        const binding = await prisma.deviceBinding.findFirst({
            where: {
                deviceId,
                isActive: true
            }
        });

        if (!binding) {
            return res.status(404).json({
                error: "Device not bound"
            });
        }

        await verifyChallenge({ deviceId, challenge });

        const verifier = crypto.createVerify("SHA256");
        verifier.update(challenge);
        verifier.end();

        const isValid = verifier.verify(
            binding.publicKey,
            Buffer.from(signature, "base64")
        );

        if (!isValid) {
            return res.status(401).json({
                error: "Invalid signature"
            });
        }

        res.json({
            message: "Device verified successfully"
        });
    } catch (err) {
        res.status(401).json({
            error: err.message
        });
    }
};

/**
 * Register FCM push token for a device
 * B-2: One device -> one push token
 */
export const registerPushToken = async (req, res) => {
    try {
        const { pushToken } = req.body;
        const deviceId = req.device.sub;
        const unifiedId = req.device.uid;

        if (!pushToken) {
            return res.status(400).json({
                error: "pushToken required"
            });
        }

        // B-2: Rejected if device not ACTIVE
        const binding = await prisma.deviceBinding.findFirst({
            where: {
                deviceId,
                unifiedId,
                isActive: true
            }
        });

        if (!binding) {
            return res.status(403).json({
                error: "Device not active or not bound"
            });
        }

        // B-2: Overwrite previous pushToken for same device
        await prisma.deviceBinding.update({
            where: { id: binding.id },
            data: { pushToken }
        });

        res.json({
            message: "Push token registered successfully"
        });
    } catch (err) {
        console.error("Push registration error:", err);
        res.status(500).json({
            error: "Failed to register push token"
        });
    }
};
