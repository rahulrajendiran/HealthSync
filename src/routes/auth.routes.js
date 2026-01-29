import express from "express";
import { staffLogin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/staff/login", staffLogin);

export default router;
