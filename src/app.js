import express from "express";
import cors from "cors";
import path from "path";
import auditRoutes from "./routes/audit.routes.js";
import authRoutes from "./routes/auth.routes.js";
import nfcRoutes from "./routes/nfc.routes.js";
import emrRoutes from "./routes/emr.routes.js";
import insuranceRoutes from "./routes/insurance.routes.js";
import deviceRoutes from "./routes/device.routes.js";
import consentRoutes from "./routes/consent.routes.js";
import deviceTokenRoutes from "./routes/deviceToken.routes.js";
import helmet from "helmet";
import otpRoutes from "./routes/otp.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import recoveryRoutes from "./routes/recovery.routes.js";


const app = express();

// STEP 3 — SECURITY HEADERS & HTTPS (MANDATORY)
// helmet() sets HSTS, X-Content-Type-Options, etc.
app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:5173", "http://localhost:3000"];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS policy violation"));
        }
    },
    credentials: true
}));

app.use(express.json({ strict: true }));

// Force HTTPS if behind proxy (X-Forwarded-Proto)
app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] !== "https") {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/nfc", nfcRoutes);
app.use("/api/emr", emrRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/insurance", insuranceRoutes);
app.use("/api/consent", consentRoutes);
app.use("/api/device", deviceTokenRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/recovery", recoveryRoutes);

export default app;
