import admin from "firebase-admin";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        // In a real environment, this would use a service account or application default credentials
        // For this task, we assume the environment is configured or we handle failure gracefully.
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
    } catch (err) {
        console.warn("Firebase Admin failed to initialize. Push notifications will be logged but not sent.");
    }
}

/**
 * Sends a push notification to a patient's active device.
 * @param {string} patientId - The Unified ID of the patient.
 * @param {string} type - The push event type (CONSENT_REQUEST or EMERGENCY_ACCESS).
 */
export const sendPushNotification = async (patientId, type) => {
    try {
        // Resolve active device and fetch push token
        const binding = await prisma.deviceBinding.findFirst({
            where: {
                unifiedId: patientId,
                isActive: true,
                pushToken: { not: null }
            }
        });

        if (!binding || !binding.pushToken) {
            console.warn(`[PUSH] No active device/token for patient ${patientId}. Skipping push.`);
            return;
        }

        const pushToken = binding.pushToken;

        try {
            // Firebase Admin SDK: send data-only payload
            if (admin.apps.length) {
                await admin.messaging().send({
                    token: pushToken,
                    data: {
                        type: type
                    },
                });
            } else {
                console.log(`[MOCK PUSH] Sent ${type} to token ${pushToken.substring(0, 8)}...`);
            }

            // Audit SUCCESS
            await prisma.pushLog.create({
                data: {
                    patientId,
                    eventType: type,
                    status: "SUCCESS"
                }
            });

            console.log(`[PUSH] PUSH_SENT -> ${type} for patient ${patientId}`);

        } catch (pushErr) {
            console.error(`[PUSH] Firebase Push Error: ${pushErr.message}`);

            // Audit FAILURE
            await prisma.pushLog.create({
                data: {
                    patientId,
                    eventType: type,
                    status: "FAILURE",
                    errorMessage: pushErr.message
                }
            });
            // B-6: Failure handling - do not block main flow.
        }

    } catch (err) {
        console.error("[PUSH] General Push Dispatch Error:", err);
        // B-6: Failure handling - do not block main flow.
    }
};
