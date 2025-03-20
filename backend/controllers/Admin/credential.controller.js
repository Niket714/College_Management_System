const adminCredential = require("../../models/Admin/credential.model.js");
const bcrypt = require("bcrypt");
require("dotenv").config();

const loginHandler = async (req, res) => {
    let { loginid, password } = req.body;
    try {
        let user = await adminCredential.findOne({ loginid });
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Wrong Credentials" });
        }

        const staticSalt = process.env.STATIC_SALT || "mySecretStaticSalt";
        const isMatch = await bcrypt.compare(user.dynamic_salt + password + staticSalt, user.password);

        if (!isMatch) {
            return res
                .status(400)
                .json({ success: false, message: "Wrong Credentials" });
        }


        const data = {
            success: true,
            message: "Login Successfull!",
            loginid: user.loginid,
            id: user.id,
        };
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const registerHandler = async (req, res) => {
    let { loginid, password } = req.body;
    try {
        let user = await adminCredential.findOne({ loginid });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Admin With This LoginId Already Exists",
            });
        }
        const staticSalt = process.env.STATIC_SALT || "mySecretStaticSalt"; 
        const dynamicSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(dynamicSalt + password + staticSalt, 10);
        
        user = await adminCredential.create({
            loginid,
            password: hashedPassword,
            dynamic_salt: dynamicSalt,
        });
        
        const data = {
            success: true,
            message: "Register Successfull!",
            loginid: user.loginid,
            id: user.id,
        };
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const updateHandler = async (req, res) => {
    try {
        let user = await adminCredential.findById(req.params.id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Admin Exists!",
            });
        }
        // If updating password, hash the new password
        if (req.body.password) {
            const staticSalt = process.env.STATIC_SALT || "mySecretStaticSalt";
            const dynamicSalt = await bcrypt.genSalt(10);
            req.body.dynamic_salt = dynamicSalt;
            req.body.password = await bcrypt.hash(dynamicSalt + req.body.password + staticSalt, 10);
        }

        await adminCredential.findByIdAndUpdate(req.params.id, req.body);

        const data = {
            success: true,
            message: "Updated Successfull!",
        };
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const deleteHandler = async (req, res) => {
    try {
        let user = await adminCredential.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Admin Exists!",
            });
        }
        const data = {
            success: true,
            message: "Deleted Successfull!",
        };
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = { loginHandler, registerHandler, updateHandler, deleteHandler }