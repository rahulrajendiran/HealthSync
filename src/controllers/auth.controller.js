import { PrismaClient } from "@prisma/client";
import { generateToken } from "../utils/jwt.js";

const prisma = new PrismaClient();

export const staffLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password required" });
        }

        const staff = await prisma.staff.findUnique({
            where: { username }
        });

        if (!staff || staff.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken({
            staffId: staff.id,
            role: staff.role
        });

        res.json({
            message: "Login successful",
            token,
            role: staff.role
        });
    } catch (err) {
        res.status(500).json({
            error: "Internal server error",
            code: "SERVER_ERROR"
        });
    }
};
