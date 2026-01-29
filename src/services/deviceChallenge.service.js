import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CHALLENGE_EXPIRY_SECONDS = 120;

/**
 * Create a one-time challenge
 */
export const createChallenge = async (deviceId) => {
    const challenge = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(
        Date.now() + CHALLENGE_EXPIRY_SECONDS * 1000
    );

    await prisma.deviceChallenge.create({
        data: {
            deviceId,
            challenge,
            expiresAt
        }
    });

    return challenge;
};

/**
 * Verify and consume challenge
 */
export const verifyChallenge = async ({
    deviceId,
    challenge
}) => {
    const record = await prisma.deviceChallenge.findFirst({
        where: {
            deviceId,
            challenge,
            used: false,
            expiresAt: {
                gt: new Date()
            }
        }
    });

    if (!record) {
        throw new Error("Invalid or expired challenge");
    }

    await prisma.deviceChallenge.update({
        where: { id: record.id },
        data: { used: true }
    });

    return true;
};
