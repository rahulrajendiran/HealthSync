import express from "express";
import { issueDeviceToken } from "../controllers/deviceToken.controller.js";

const router = express.Router();

/**
 * Issue app device token (after verification)
 */
router.post("/token", issueDeviceToken);

export default router;
