require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    exposedHeaders: ['Content-Disposition']
}));

const userRoutes = require("./api/routes/user.route");
app.use("/api", userRoutes);

const fileRoutes = require("./api/routes/file.route");
app.use("/api/file", fileRoutes);

const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI).then(() => {
    console.log("connected to db");
    const PORT = process.env.PORT || 1198;
    app.listen(PORT, () => {
        console.log(`running on port ${PORT}`);
    });
}).catch(error => {
    console.error(error.message);
});

