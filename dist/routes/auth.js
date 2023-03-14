"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const CryptoJS = __importStar(require("crypto-js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken_1 = require("./verifyToken");
const router = (0, express_1.Router)();
exports.authRouter = router;
function createCookieAndSendToClient(res, token, data) {
    res.cookie("authtoken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });
    return res.status(201).json({ msg: "query success", data: data });
}
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findOne({ email: req.body.email });
    if (!user) {
        if (req.body.ggId) {
            const newUser = new User_1.default({
                email: req.body.email,
                name: req.body.name,
                avatar: req.body.picture,
                ggId: req.body.ggId,
            });
            const savedUser = yield newUser.save();
            if (process.env.JWT_SECRET) {
                const token = jsonwebtoken_1.default.sign({ _id: savedUser._id }, process.env.JWT_SECRET, {
                    expiresIn: "7d",
                });
                return createCookieAndSendToClient(res, token, savedUser);
            }
            return res.status(500).json({ msg: "server error! " });
        }
        return res.status(400).json({ msg: "user not found" });
    }
    if (process.env.PASS_SECRET && process.env.JWT_SECRET && user.password) {
        const decryptPass = CryptoJS.AES.decrypt(user.password, process.env.PASS_SECRET).toString(CryptoJS.enc.Utf8);
        if (decryptPass !== req.body.password)
            return res.status(400).json({ msg: "invalid password" });
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        return createCookieAndSendToClient(res, token, user);
    }
    else if (user.ggId === req.body.ggId &&
        user.email === req.body.email &&
        !user.password &&
        process.env.JWT_SECRET) {
        if (user.avatar !== req.body.picture) {
            yield User_1.default.findByIdAndUpdate(user._id, { avatar: req.body.picture });
            user.avatar = req.body.picture;
        }
        if (user.name !== req.body.name) {
            yield User_1.default.findByIdAndUpdate(user._id, { name: req.body.name });
            user.name = req.body.name;
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        return createCookieAndSendToClient(res, token, user);
    }
    return res.status(500).json({ msg: "something went wrong" });
}));
router.delete("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("authtoken");
    res.status(200).json({ msg: "logout success" });
}));
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userExisted = yield User_1.default.findOne({ email: req.body.email });
    if (userExisted)
        return res.status(400).json("user already exists");
    if (process.env.PASS_SECRET && process.env.JWT_SECRET) {
        const user = new User_1.default({
            name: req.body.name,
            email: req.body.email,
            password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SECRET).toString(),
        });
        const savedUser = yield user.save();
        const token = jsonwebtoken_1.default.sign({ _id: savedUser._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        return createCookieAndSendToClient(res, token, savedUser);
    }
    return res.status(500).json({ msg: "something went wrong!" });
}));
router.get("/checkauth", verifyToken_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies["authtoken"];
    const jwt_secret = process.env.JWT_SECRET;
    const jwt_payload = jsonwebtoken_1.default.verify(token, jwt_secret);
    const user = yield User_1.default.findById(jwt_payload._id);
    return res.status(200).json({ msg: "authentication success", data: user });
}));
