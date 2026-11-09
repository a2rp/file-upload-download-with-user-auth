const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        index: true,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        index: true,
    },
    originalName: {
        type: String,
        trim: true,
        maxlength: 255,
    },
    code: {
        type: String,
        required: true,
    },
    file: {
        type: String,
        required: true
    }
}, { timestamps: true });

const FileModel = mongoose.model("files", fileSchema);
module.exports = FileModel;
