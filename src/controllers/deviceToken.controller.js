import { PrismaClient } from "@prisma/client";
import { generateDeviceToken } from "../utils/jwt.js";

const prisma = new PrismaClient();

export const issueDeviceToken = async (req, res) => {
    try {
        const { deviceId } = req.body;

        if (!deviceId) {
            return res.status(400).json({ error: "deviceId required" });
        }

        const binding = await prisma.deviceBinding.findFirst({
            where: {
                deviceId,
                isActive: true
            }
        });

        if (!binding) {
            return res.status(403).json({
                error: "Device not bound or revoked"
            });
        }

        const token = generateDeviceToken({
            deviceId,
            unifiedId: binding.unifiedId
        });

        res.json({
            token,
            expiresIn: "1h"
        });
    } catch (err) {
        res.status(500).json({
            error: "Failed to issue device token"
        });
    }
};
