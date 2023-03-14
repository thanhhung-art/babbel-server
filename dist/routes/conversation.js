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
exports.conversationRouter = void 0;
const express_1 = require("express");
const Conversation_1 = __importDefault(require("../models/Conversation"));
const verifyToken_1 = require("./verifyToken");
const router = (0, express_1.Router)();
exports.conversationRouter = router;
router.post("/create/:id", verifyToken_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const person1 = req.params.id, person2 = req.body.guestId;
    const conversation = new Conversation_1.default({
        users: [person1, person2],
        content: [],
    });
    const savedConversation = yield conversation.save();
    return res
        .status(200)
        .json({ msg: "create conversation success", data: savedConversation });
}));
router.get("/:id/:guestId", verifyToken_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id, guestId = req.params.guestId, page = Number(req.query.page);
    let allPages = 0;
    const allConversation = yield Conversation_1.default.findOne({
        users: { $all: [userId, guestId] },
    });
    if (allConversation === null || allConversation === void 0 ? void 0 : allConversation.content.length) {
        allPages = allConversation.content.length;
    }
    const queryArrFilter = (page) => {
        if (page === 0)
            return -10;
        const allPagesCeil = Math.ceil(allPages / 10);
        if (page + 1 < allPagesCeil) {
            const pageSkip = allPages - ((page) * 10) - 10;
            return [pageSkip, 10];
        }
        return allPages - page * 10;
    };
    const conversation = yield Conversation_1.default.findOne({
        users: { $all: [userId, guestId] },
    }, {
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
