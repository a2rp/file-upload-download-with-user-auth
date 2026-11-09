const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please enter a username"],
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 15
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        select: false,
    },
    profileImg: {
        type: String
    }
}, { timestamps: true });

const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;
