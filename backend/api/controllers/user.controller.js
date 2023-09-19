const UserModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res, next) => {
    const { username, password, confirmPassword } = req.body;
    // console.log(username, password);

    if (username.trim().length < 3 || username.trim().length > 15) {
        return res.json({ success: false, message: "Username length must be in range 3-15" });
    }

    if (password.trim().length < 6) {
        return res.json({ success: false, message: "Password length must be at least 6 characters" });
    }

    if (password !== confirmPassword) {
        return res.json({ success: false, message: "Passwords do not match" });
    }

    try {
        const user = await UserModel.findOne({ username: username });
        if (user) {
            return res.json({ success: false, message: "User already exists" });
        }
        const hashedPassword = bcrypt.hashSync(password);
        const newUser = new UserModel({ username, password: hashedPassword });
        const result = await newUser.save();
        // console.log(result);
        return res.json({ success: true, message: "User registered successfully", result });
    } catch (error) {
        // console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const login = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const user = await UserModel.findOne({ username: username });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.json({ success: false, message: "Invalid Password" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
            // expiresIn: "1 day"
        });

        return res.json({ success: true, message: "User logged in successfully", token });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }

};

const getUser = async (req, res, next) => {
    const { idToken } = req.body;
    // console.log(idToken);

    if (!idToken || idToken.length === 0) {
        return res.json({ success: false, message: "token not found" });
    }
    let token = idToken.split("Bearer ")[1];
    // console.log(token);

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.json({ success: false, message: "Invalid token" });
        } else {
            // console.log(user);
            req.id = user.id;
        }
    });

    try {
        const user = await UserModel.findById(req.id, "-password");
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        } else {
            return res.json({ success: true, message: "User found", user });
        }
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

module.exports = { register, login, getUser };

