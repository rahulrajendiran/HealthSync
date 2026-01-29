import { hasValidConsent } from "../services/consent.service.js";

export const requireConsent = async (req, res, next) => {
    const { staffId } = req.user;
    const { patientId } = req.params;

    const allowed = await hasValidConsent({
        patientId,
        staffId
    });

    if (!allowed) {
        return res.status(403).json({
            error: "Patient consent required"
        });
    }

    next();
};
