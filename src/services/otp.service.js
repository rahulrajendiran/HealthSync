import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const OTP_TTL_MINUTES = 5;

const hashOtp = (otp) =>
    crypto.createHash("sha256").update(otp).digest("hex");

export const generateAndStoreOtp = async (phoneNumber) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashOtp(otp);

    const expiresAt = new Date(
        Date.now() + OTP_TTL_MINUTES * 60 * 1000
    );

    await prisma.phoneOTP.create({
        data: {
            phoneNumber,
            otpHash,
            expiresAt
        }
    });

    // 🛠️ DEV ONLY: log OTP instead of sending via SMS provider
    console.log(`[DEV ONLY] OTP for ${phoneNumber}: ${otp}`);

    return true;
};

export const verifyOtp = async (phoneNumber, otp) => {
    const record = await prisma.phoneOTP.findFirst({
        where: {
            phoneNumber,
            used: false,
            expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: "desc" }
    });

    if (!record) return false;

    const match = record.otpHash === hashOtp(otp);

    if (!match) return false;

    await prisma.phoneOTP.update({
        where: { id: record.id },
        data: { used: true }
    });

    return true;
};
