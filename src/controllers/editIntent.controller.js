import { createEditIntent } from "../services/editIntent.service.js";

export const requestEditIntent = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { staffId, role } = req.user;
        const { allowedFields } = req.body;

        if (!Array.isArray(allowedFields) || allowedFields.length === 0) {
            return res.status(400).json({
                error: "allowedFields must be a non-empty array"
            });
        }

        const intent = await createEditIntent({
            patientId,
            staffId,
            staffRole: role,
            allowedFields
        });

        res.status(201).json({
            intentId: intent.id,
            expiresAt: intent.expiresAt
        });
    } catch (err) {
        res.status(500).json({
            error: "Failed to create edit intent",
            details: err.message
        });
    }
};
