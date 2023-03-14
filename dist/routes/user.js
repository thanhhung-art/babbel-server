"use strict";
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
exports.userRouter = void 0;
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const verifyToken_1 = require("./verifyToken");
const router = (0, express_1.Router)();
exports.userRouter = router;
router.get("/", verifyToken_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User_1.default.find();
    return res.status(200).json({ msg: "get users success", data: users });
}));
router.get("/:id", verifyToken_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findById(req.params.id);
    return res.status(200).json({ msg: "get user success", data: user });
}));
router.put("/friendreq/:id", verifyToken_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield User_1.default.findByIdAndUpdate(req.body.receiverId, {
        '$addToSet': {
            friendreq: req.params.id,
        },
    });
    return res.status(200).json({ msg: "send request success" });
}));
router.put("/accep_or_decline_friend_request/:id", verifyToken_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.msg === "decline friend request") {
        yield User_1.default.updateMany({ _id: req.params.id }, { '$set': { "notification.$[element].unread": false } }, { arrayFilters: [{ "element.unread": true }] });
        return res.status(200).json({ msg: "update notification success" });
    }
    else {
        yield User_1.default.findByIdAndUpdate(req.body.senderId, {
            '$addToSet': { friends: req.params.id },
        });
        yield User_1.default.findByIdAndUpdate(req.params.id, {
            '$addToSet': { friends: req.body.senderId },
        });
        yield User_1.default.updateMany({ _id: req.params.id }, { '$set': { "notification.$[element].unread": false } }, { arrayFilters: [{ "element.unread": true }] });
        return res.status(200).json({ msg: "update notification success" });
    }
}));
router.get("/get_friend_req/:id", verifyToken_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield User_1.default.findById(req.params.id);
    const friendReq = yield (data === null || data === void 0 ? void 0 : data.friendreq);
    if (friendReq) {
        return res.status(200).json({ msg: 'success', data: friendReq });
    }
    return res.status(400).json({ msg: 'unsuccess ' });
}));
