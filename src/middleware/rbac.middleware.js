export const rbac = (allowedRoles = []) => {
    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!userRole) {
            return res.status(403).json({ error: "Role not found in token" });
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: "Access denied",
                yourRole: userRole,
                allowedRoles
            });
        }

        next();
    };
};
