import express from "express";
import {
    initiateRecovery,
    verifyRecovery,
    completeRecovery
} from "../controllers/recovery.controller.js";

const router = express.Router();

router.post("/initiate", initiateRecovery);
router.post("/verify", verifyRecovery);
router.post("/complete", completeRecovery);

export default router;
