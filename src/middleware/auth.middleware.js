import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Token missing" });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded; // { staffId, role }
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

export const rbac = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied: insufficient permissions" });
        }
        next();
    };
};

