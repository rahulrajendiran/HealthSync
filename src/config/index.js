export const config = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET,
    emergencyDuration:
        parseInt(process.env.EMERGENCY_DURATION_MINUTES) || 30
};
