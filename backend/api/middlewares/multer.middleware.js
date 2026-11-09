const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const UPLOAD_DIRECTORY = path.resolve(__dirname, "../uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024;

fs.mkdirSync(UPLOAD_DIRECTORY, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, UPLOAD_DIRECTORY),
    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const safeExtension = /^\.[a-z0-9]{1,10}$/.test(extension) ? extension : "";
        callback(null, `${crypto.randomBytes(16).toString("hex")}${safeExtension}`);
    },
});

const allowedExtensions = {
    "image/jpeg": new Set([".jpg", ".jpeg"]),
    "image/png": new Set([".png"]),
    "application/pdf": new Set([".pdf"]),
};

const fileFilter = (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions[file.mimetype]?.has(extension)) {
        const error = new Error("Upload a JPEG, PNG, or PDF file with a matching extension.");
        error.statusCode = 400;
        return callback(error);
    }

    return callback(null, true);
};

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
        fields: 0,
        parts: 1,
    },
});
