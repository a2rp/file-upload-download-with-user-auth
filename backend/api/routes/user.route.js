const express = require("express");
const router = express.Router();

const { register, login, getUser } = require("../controllers/user.controller");
const authenticateToken = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/user", authenticateToken, getUser);

module.exports = router;
