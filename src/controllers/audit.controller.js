import { PrismaClient } from "@prisma/client";
import { formatAuditLogs } from "../services/audit.service.js";

const prisma = new PrismaClient();

/**
 * Get audit logs (formatted timestamps)
 */
export const getAuditLogs = async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { timestamp: "desc" }
        });

        const formattedLogs = formatAuditLogs(logs);

        res.json({
            count: formattedLogs.length,
            logs: formattedLogs
        });
    } catch (err) {
        res.status(500).json({
            error: "Internal server error",
            code: "AUDIT_FETCH_FAILED"
        });
    }
};
