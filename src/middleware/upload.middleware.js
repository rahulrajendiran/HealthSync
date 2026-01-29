import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: "uploads/prescriptions",
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
        cb(null, true);
    } else {
        cb(new Error("Only JPG images allowed"));
    }
};

export const uploadPrescriptionImage = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
});
