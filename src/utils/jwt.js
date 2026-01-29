import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const generateToken = (payload) => {
    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: "2h"
    });
};

export const verifyToken = (token) => {
    return jwt.verify(token, config.jwtSecret);
};

export const generateDeviceToken = ({ deviceId, unifiedId }) => {
    return jwt.sign(
        {
            sub: deviceId,
            uid: unifiedId,
            scope: "device"
        },
        config.jwtSecret,
        { expiresIn: "1h" }
    );
};
