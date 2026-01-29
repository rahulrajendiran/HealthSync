import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";

const prisma = new PrismaClient();

/**
 * Grant emergency access with expiry
 */
export const grantEmergencyAccess = async (staffId, patientId) => {
    const expiresAt = new Date(
        Date.now() + config.emergencyDuration * 60 * 1000
    );

    return prisma.emergencyAccess.create({
        data: {
            staffId,
            patientId,
            expiresAt
        }
    });
};

/**
 * Check if valid emergency access exists
 */
export const hasValidEmergencyAccess = async (staffId, patientId) => {
    const record = await prisma.emergencyAccess.findFirst({
        where: {
            staffId,
            patientId,
            expiresAt: {
                gt: new Date()
            }
        }
    });

    return Boolean(record);
};
