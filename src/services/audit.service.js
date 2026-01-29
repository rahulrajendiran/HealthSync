import { PrismaClient } from "@prisma/client";
import { formatDateTime } from "../utils/dateFormatter.js";


const prisma = new PrismaClient();

export const logAudit = async ({
    staffId,
    patientId,
    action,
    emergency = false
}) => {
    try {
        await prisma.auditLog.create({
            data: {
                staffId,
                patientId,
                action,
                emergency
            }
        });
    } catch (err) {
        console.error("[AUDIT LOG FAILED]", err.message);
    }
};
/**
 * Format audit log records for API responses
 */
export const formatAuditLogs = (logs) => {
    return logs.map((log) => ({
        id: log.id,
        staffId: log.staffId,
        patientId: log.patientId,
        action: log.action,
        emergency: log.emergency,
        timestamp: formatDateTime(log.timestamp)
    }));
};
