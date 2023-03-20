"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies["authtoken"];
        const jwt_secret = process.env.JWT_SECRET;
        let jwt_payload;
        if (token && jwt_secret) {
            jwt_payload = jsonwebtoken_1.default.verify(token, jwt_secret);
            if (jwt_payload) {
                if (jwt_payload._id === req.headers["authid"]) {
                    next();
                    return;
                }
                else {
                    return res.status(401).json({ msg: "you are not authorized!" });
                }
            }
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "An error occurred" });
    }
};
exports.verifyToken = verifyToken;
