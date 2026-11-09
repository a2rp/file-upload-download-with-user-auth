const multer = require("multer");

const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    let statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
    let message = error.message;

    if (error instanceof multer.MulterError) {
        statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        message = error.code === "LIMIT_FILE_SIZE"
            ? "File exceeds the 5 MB upload limit."
            : "The file upload request is invalid.";
    }

    if (statusCode < 400 || statusCode >= 600) {
        statusCode = 500;
    }

    if (statusCode >= 500) {
        console.error(error);
        message = "Internal server error.";
    }

    return res.status(statusCode).json({
        success: false,
        message: message || "Request failed.",
    });
};

module.exports = errorHandler;
