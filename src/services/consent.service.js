import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CONSENT_DURATION_MINUTES = 15;

/**
 * Create consent request
 */
export const requestConsent = async ({ patientId, staffId, purpose }) => {
    const expiresAt = new Date(
        Date.now() + CONSENT_DURATION_MINUTES * 60 * 1000
    );

    return prisma.consentRequest.create({
        data: {
            patientId,
            staffId,
            purpose,
            expiresAt
        }
    });
};

/**
 * Resolve consent
 */
export const resolveConsent = async (id, status) => {
    return prisma.consentRequest.update({
        where: { id },
        data: { status }
    });
};

/**
 * Check active consent
 */
export const hasValidConsent = async ({ patientId, staffId }) => {
    const consent = await prisma.consentRequest.findFirst({
        where: {
            patientId,
            staffId,
            status: "APPROVED",
            expiresAt: {
                gt: new Date()
            }
        }
    });

    return !!consent;
};
