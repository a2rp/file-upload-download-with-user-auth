const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const FileModel = require("../models/file.model");

const ownerFilter = (user) => ({
    $or: [
        { ownerId: user._id },
        { ownerId: { $exists: false }, user: user.username },
    ],
});

const resolveStoredPath = (storedPath) => {
    if (path.isAbsolute(storedPath)) {
        return storedPath;
    }

    return path.resolve(__dirname, "../../", storedPath.replace(/[\\/]/g, path.sep));
};

const fileResponse = (file) => ({
    id: file._id,
    originalName: file.originalName || path.basename(String(file.file).replace(/\\/g, "/")),
    code: file.code,
    createdAt: file.createdAt,
});

const hasValidFileSignature = async (file) => {
    const handle = await fs.promises.open(file.path, "r");
    try {
        const buffer = Buffer.alloc(1024);
        const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
        const content = buffer.subarray(0, bytesRead);

        if (file.mimetype === "image/jpeg") {
            return content.length >= 3 && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff;
        }
        if (file.mimetype === "image/png") {
            return content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
        }
        if (file.mimetype === "application/pdf") {
            return content.includes(Buffer.from("%PDF-"));
        }

        return false;
    } finally {
        await handle.close();
    }
};

const uploadFile = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Choose a supported file to upload." });
    }

    try {
        if (!await hasValidFileSignature(req.file)) {
            await fs.promises.unlink(req.file.path);
            return res.status(400).json({ success: false, message: "The file content does not match its declared type." });
        }

        const file = await FileModel.create({
            user: req.user.username,
            ownerId: req.user._id,
            originalName: req.file.originalname,
            code: crypto.randomBytes(24).toString("hex"),
            file: req.file.path,
        });

        return res.status(201).json({
            success: true,
            message: "File uploaded successfully.",
            file: fileResponse(file),
        });
    } catch (error) {
        try {
            await fs.promises.unlink(req.file.path);
        } catch (cleanupError) {
            if (cleanupError.code !== "ENOENT") {
                console.error("Could not remove an upload after its database write failed:", cleanupError);
            }
        }

        return next(error);
    }
};

const getFiles = async (req, res, next) => {
    try {
        const files = await FileModel.find(ownerFilter(req.user)).sort({ createdAt: -1 });

        for (const file of files) {
            const hasSecureShareCode = /^[a-f0-9]{48}$/.test(file.code);
            if (!file.ownerId || !hasSecureShareCode) {
                file.ownerId = req.user._id;
                file.user = req.user.username;
                if (!hasSecureShareCode) {
                    file.code = crypto.randomBytes(24).toString("hex");
                }
                await file.save();
            }
        }

        return res.status(200).json({ success: true, files: files.map(fileResponse) });
    } catch (error) {
        return next(error);
    }
};

const deleteFile = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ success: false, message: "File not found." });
        }

        const file = await FileModel.findOne({ _id: req.params.id, ...ownerFilter(req.user) });
        if (!file) {
            return res.status(404).json({ success: false, message: "File not found." });
        }

        const filePath = resolveStoredPath(file.file);
        try {
            await fs.promises.unlink(filePath);
        } catch (error) {
            if (error.code !== "ENOENT") {
                return next(error);
            }
        }

        await FileModel.deleteOne({ _id: file._id });
        return res.status(200).json({ success: true, message: "File deleted successfully." });
    } catch (error) {
        return next(error);
    }
};

const urlDownload = async (req, res, next) => {
    const { id } = req.params;
    const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";

    if (!mongoose.Types.ObjectId.isValid(id) || !/^[a-f0-9]{48}$/.test(code)) {
        return res.status(404).json({ success: false, message: "File not found." });
    }

    try {
        const file = await FileModel.findOne({ _id: id, code });
        if (!file) {
            return res.status(404).json({ success: false, message: "File not found." });
        }

        const filePath = resolveStoredPath(file.file);
        try {
            await fs.promises.access(filePath);
        } catch (error) {
            if (error.code === "ENOENT") {
                return res.status(404).json({ success: false, message: "File not found." });
            }
            return next(error);
        }

        return res.download(filePath, file.originalName || path.basename(filePath), (error) => {
            if (error) {
                next(error);
            }
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = { uploadFile, getFiles, deleteFile, urlDownload };
