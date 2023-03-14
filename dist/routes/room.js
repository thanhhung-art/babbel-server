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
exports.roomRouter = void 0;
const express_1 = require("express");
const Room_1 = __importDefault(require("../models/Room"));
const verifyToken_1 = require("./verifyToken");
const router = (0, express_1.Router)();
exports.roomRouter = router;
router.get("/", verifyToken_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rooms = yield Room_1.default.find();
    return res.status(200).json({ msg: "get rooms success", data: rooms });
}));
router.get("/:id", verifyToken_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const allPages = ((_a = (yield Room_1.default.findById(req.params.id))) === null || _a === void 0 ? void 0 : _a.content.length) || 0;
    let page = Number(req.query.page);
    const queryArrFilter = (page) => {
        if (page === 0)
            return -10;
        const allPagesCeil = Math.ceil(allPages / 10);
        if (page + 1 < allPagesCeil) {
            const pageSkip = allPages - page * 10 - 10;
            return [pageSkip, 10];
        }
        return allPages - page * 10;
    };
    const conversation = yield Room_1.default.findById(req.params.id, {
        content: { $slice: queryArrFilter(page) },
    });
    return res.status(200).json({
        msg: "get conversation success",
        data: conversation === null || conversation === void 0 ? void 0 : conversation.content,
        conversationId: conversation === null || conversation === void 0 ? void 0 : conversation._id,
        allPages,
        nextPage: page + 1,
    });
}));
router.post("/create/:id", verifyToken_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const room = new Room_1.default({
        roomMasterId: req.params.id,
        name: req.body.name,
        content: [],
    });
    const roomSaved = yield room.save();
    //await User.findByIdAndUpdate(req.params.id, { $addToSet: { roomJoined: roomSaved._id }})
    yield Room_1.default.findByIdAndUpdate(roomSaved._id, {
        $addToSet: { members: req.params.id },
    });
    return res.status(200).json({ msg: "created room success", data: roomSaved });
}));
