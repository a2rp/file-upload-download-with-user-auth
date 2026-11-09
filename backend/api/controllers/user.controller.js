const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

const isValidPassword = (password) =>
    typeof password === "string" &&
    password.length >= 6 &&
    Buffer.byteLength(password, "utf8") <= 72;

const register = async (req, res, next) => {
    const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
    const password = req.body?.password;
    const confirmPassword = req.body?.confirmPassword;

    if (username.length < 3 || username.length > 15) {
        return res.status(400).json({ success: false, message: "Username must be 3 to 15 characters." });
    }

    if (!isValidPassword(password)) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters and no more than 72 UTF-8 bytes." });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    try {
        const existingUser = await UserModel.findOne({ username }).select("_id");
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Username is already in use." });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await UserModel.create({ username, password: hashedPassword });

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user: { id: user._id, username: user.username },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "Username is already in use." });
        }

        return next(error);
    }
};

const login = async (req, res, next) => {
    const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
    const password = req.body?.password;

    if (!username || typeof password !== "string") {
        return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    try {
        const user = await UserModel.findOne({ username }).select("+password");
        const validPassword = user && await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ success: false, message: "Invalid username or password." });
        }

        const token = jwt.sign(
            { id: user._id.toString() },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" },
        );

        return res.status(200).json({ success: true, message: "Logged in successfully.", token });
    } catch (error) {
        return next(error);
    }
};

const getUser = (req, res) => res.status(200).json({
    success: true,
    user: { id: req.user._id, username: req.user.username },
});

module.exports = { register, login, getUser };
