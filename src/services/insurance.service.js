import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Mock eligibility check
 * Simulates government / insurance API
 */
export const checkInsuranceEligibility = async (patientId, schemeCode) => {
    const record = await prisma.patientInsurance.findFirst({
        where: {
            patientId,
            schemeCode,
            isActive: true,
            validTill: {
                gt: new Date()
            }
        }
    });

    if (!record) {
        return {
            eligible: false,
            reason: "No active policy found"
        };
    }

    // Mock approval logic
    return {
        eligible: true,
        approvalId: `MOCK-${Math.floor(Math.random() * 100000)}`,
        schemeCode,
        policyNo: record.policyNo
    };
};
