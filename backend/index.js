require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.disable("x-powered-by");

const PORT = Number(process.env.PORT ?? 1198);
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
}

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI must be set in the backend environment.");
}

if (!JWT_SECRET_KEY || Buffer.byteLength(JWT_SECRET_KEY, "utf8") < 32) {
    throw new Error("JWT_SECRET_KEY must contain at least 32 bytes of random data.");
}

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false, limit: "20kb" }));
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    exposedHeaders: ["Content-Disposition"],
}));
app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
});

const userRoutes = require("./api/routes/user.route");
app.use("/api", userRoutes);

const fileRoutes = require("./api/routes/file.route");
app.use("/api/file", fileRoutes);

const errorHandler = require("./api/middlewares/error.middleware");

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found." });
});

app.use(errorHandler);

const startServer = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const server = app.listen(PORT, () => {
            console.log(`File Gallery API listening on port ${PORT}.`);
        });

        const shutdown = (signal) => {
            console.log(`${signal} received; closing the API.`);
            server.close(async () => {
                await mongoose.disconnect();
                process.exit(0);
            });
        };

        process.once("SIGINT", () => shutdown("SIGINT"));
        process.once("SIGTERM", () => shutdown("SIGTERM"));
    } catch (error) {
        console.error("Could not start the File Gallery API:", error.message);
        process.exitCode = 1;
    }
};

startServer();

