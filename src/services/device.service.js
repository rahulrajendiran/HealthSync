import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Ensure one active device per Unified ID
 */
export const ensureNoActiveBinding = async (unifiedId) => {
    const existing = await prisma.deviceBinding.findFirst({
        where: {
            unifiedId,
            isActive: true
        }
    });

    if (existing) {
        throw new Error("Unified ID already bound to a device");
    }
};

/**
 * Create device binding
 */
export const createDeviceBinding = async ({
    unifiedId,
    deviceId,
    publicKey,
    deviceName,
    platform
}) => {
    return prisma.deviceBinding.create({
        data: {
            unifiedId,
            deviceId,
            publicKey,
            deviceName,
            platform
        }
    });
};
/**
 * Revoke all active bindings for a Unified ID (used during recovery)
 */
export const revokeAllBindings = async (unifiedId) => {
    return prisma.deviceBinding.updateMany({
        where: {
            unifiedId,
            isActive: true
        },
        data: {
            isActive: false,
            revokedAt: new Date()
        }
    });
};
