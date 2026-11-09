const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

const authenticateToken = async (req, res, next) => {
    const authorization = req.get("authorization") || "";
    const [scheme, token, extra] = authorization.split(" ");

    if (scheme !== "Bearer" || !token || extra !== undefined) {
        return res.status(401).json({ success: false, message: "Authentication required." });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!payload.id || typeof payload.exp !== "number") {
            return res.status(401).json({ success: false, message: "Invalid or expired token." });
        }

        const user = await UserModel.findById(payload.id).select("_id username");
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid or expired token." });
        }

        req.user = user;
        return next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError" || error.name === "CastError") {
            return res.status(401).json({ success: false, message: "Invalid or expired token." });
        }

        return next(error);
    }
};

module.exports = authenticateToken;
