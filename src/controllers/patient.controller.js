import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

export const issuePatient = async (req, res) => {
    try {
        const {
            name,
            age,
            gender,
            phoneNumber,
            emergencyContact
        } = req.body;

        // Basic validation
        if (!name || !age || !gender || !phoneNumber || !emergencyContact) {
            return res.status(400).json({
                error: "Missing required patient fields"
            });
        }

        // 🔐 STEP THAT ADDS CRYPTOGRAPHIC RANDOMNESS
        const unifiedId = randomUUID();   // UUID v4 generated HERE

        const patient = await prisma.patient.create({
            data: {
                unifiedId,
                name,
                age,
                gender,
                phoneNumber,
                phoneVerified: false,
                emergencyContact
            }
        });

        return res.status(201).json({
            message: "Patient issued successfully",
            unifiedId,
            patient
        });

    } catch (err) {
        return res.status(500).json({
            error: "Patient issuance failed"
        });
    }
};
