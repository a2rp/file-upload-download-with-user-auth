const upload = require("../middlewares/multer.middleware");
const express = require("express");

const {
    uploadFile,
    getFiles,
    deleteFile,
    urlDownload
} = require("../controllers/file.controller");

const filesRouter = express.Router();

// A share code grants access to one file; all management routes require a user token.
filesRouter.post("/url-download/:id", urlDownload);
filesRouter.use(require("../middlewares/auth.middleware"));

filesRouter.post("/upload", upload.single("file"), uploadFile);
filesRouter.get("/files", getFiles);
filesRouter.delete("/files/:id", deleteFile);

module.exports = filesRouter;

