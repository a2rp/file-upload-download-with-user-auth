const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
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
