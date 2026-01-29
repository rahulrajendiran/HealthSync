import { verifyToken } from "../utils/jwt.js";

export const authenticateDevice = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ error: "Authorization missing" });
    }

    try {
        const token = header.split(" ")[1];
        const decoded = verifyToken(token);

        if (decoded.scope !== "device") {
            return res.status(403).json({
                error: "Invalid token scope"
            });
        }

        req.device = decoded;
        next();
    } catch {
        res.status(401).json({ error: "Invalid device token" });
    }
};
