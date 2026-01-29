import { PrismaClient } from "@prisma/client";
import { checkInsuranceEligibility } from "../services/insurance.service.js";

const prisma = new PrismaClient();

/**
 * Get patient insurance details
 */
export const getPatientInsurance = async (req, res) => {
    try {
        const { patientId } = req.params;

        const insurance = await prisma.patientInsurance.findMany({
            where: { patientId }
        });

        res.json({
            patientId,
            insurance
        });
    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch insurance details",
            code: "INSURANCE_FETCH_FAILED"
        });
    }
};

/**
 * Verify insurance eligibility (mock)
 */
export const verifyInsurance = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { schemeCode } = req.body;

        if (!schemeCode) {
            return res.status(400).json({
                error: "schemeCode is required"
            });
        }

        const result = await checkInsuranceEligibility(patientId, schemeCode);

        res.json({
            patientId,
            schemeCode,
            result
        });
    } catch (err) {
        res.status(500).json({
            error: "Insurance verification failed",
            code: "INSURANCE_VERIFY_FAILED"
        });
    }
};
