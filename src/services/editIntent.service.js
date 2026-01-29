import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createEditIntent = async ({
    patientId,
    staffId,
    staffRole,
    allowedFields,
    ttlMinutes = 5
}) => {
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    return prisma.editIntent.create({
        data: {
            patientId,
            staffId,
            staffRole,
            allowedFields: JSON.stringify(allowedFields),
            expiresAt
        }
    });
};

export const consumeEditIntent = async ({ intentId }) => {
    const intent = await prisma.editIntent.findUnique({
        where: { id: intentId }
    });

    if (!intent) throw new Error("Invalid edit intent");
    if (intent.used) throw new Error("Edit intent already used");
    if (intent.expiresAt < new Date()) throw new Error("Edit intent expired");
    if (!intent.otpVerified) throw new Error("OTP not verified");

    await prisma.editIntent.update({
        where: { id: intentId },
        data: { used: true }
    });

    return intent;
};
