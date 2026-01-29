import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * NFC Scan - Patient Identification
 * Input: card_uuid (patient ID)
 * Output: basic patient profile
 */
export const scanNfcCard = async (req, res) => {
    try {
        const { card_uuid } = req.body;

        if (!card_uuid) {
            return res.status(400).json({ error: "card_uuid is required" });
        }

        const patient = await prisma.patient.findUnique({
            where: { id: card_uuid }
        });

        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        res.json({
            message: "Patient identified",
            patient: {
                id: patient.id,
                name: patient.name,
                age: patient.age,
                gender: patient.gender
            }
        });
    } catch (err) {
        res.status(500).json({
            error: "Internal server error",
            code: "SERVER_ERROR"
        });
    }
};
