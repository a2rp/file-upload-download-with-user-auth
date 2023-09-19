const upload = require("../middlewares/multer.middleware");
const express = require("express");

const {
    uploadFile,
    getFiles,
    downloadFile,
    deleteFile,
    getAllFiles,
    urlDownload
} = require("../controllers/file.controller");

const filesRouter = express.Router();

filesRouter.post("/upload", upload.single("file"), uploadFile);
filesRouter.post("/files", getFiles);
filesRouter.post("/delete/:id", deleteFile);
filesRouter.get("/all-files", getAllFiles);
filesRouter.get("/url-download/:id/:code", urlDownload);

module.exports = filesRouter;

