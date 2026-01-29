import express from "express";
import { getAuditLogs } from "../controllers/audit.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { rbac } from "../middleware/rbac.middleware.js";

const router = express.Router();

/**
 * Only MANAGEMENT can view audit logs
 */
router.get(
    "/",
    authenticate,
    rbac(["MANAGEMENT"]),
    getAuditLogs
);

export default router;
