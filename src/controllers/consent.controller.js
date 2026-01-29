import {
    requestConsent,
    resolveConsent
} from "../services/consent.service.js";
import { sendPushNotification } from "../services/push.service.js";

/**
 * Staff requests patient consent
 */
export const createConsentRequest = async (req, res) => {
    try {
        const { patientId, purpose } = req.body;
        const { staffId } = req.user;

        if (!patientId || !purpose) {
            return res.status(400).json({
                error: "patientId and purpose required"
            });
        }

        const consent = await requestConsent({
            patientId,
            staffId,
            purpose
        });

        // B-3: Trigger push notification (Async, but immediate)
        // B-6: Failure handling - do not block main flow.
        sendPushNotification(patientId, "CONSENT_REQUEST")
            .catch(err => console.error("Push firing error:", err));

        res.json({
            message: "Consent requested",
            consentId: consent.id,
            expiresAt: consent.expiresAt
        });
    } catch (err) {
        res.status(500).json({
            error: "Failed to request consent"
        });
    }
};

/**
 * Patient approves or denies consent
 */
export const actOnConsent = async (req, res) => {
    try {
        const { consentId, decision } = req.body;

        if (!["APPROVED", "DENIED"].includes(decision)) {
            return res.status(400).json({
                error: "Invalid decision"
            });
        }

        await resolveConsent(consentId, decision);

        res.json({
            message: `Consent ${decision.toLowerCase()}`
        });
    } catch (err) {
        res.status(500).json({
            error: "Failed to update consent"
        });
    }
};
