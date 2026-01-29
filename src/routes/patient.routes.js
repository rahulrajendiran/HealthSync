import express from "express";
import { issuePatient } from "../controllers/patient.controller.js";

const router = express.Router();

// Issuance endpoint (admin / hospital use)
router.post("/issue", issuePatient);

export default router;
