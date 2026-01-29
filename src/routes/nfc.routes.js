import express from "express";
import { scanNfcCard } from "../controllers/nfc.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * NFC Scan Route
 * Protected: requires valid staff token
 */
router.post("/scan", authenticate, scanNfcCard);

export default router;
