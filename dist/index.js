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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler_1 = require("./utils/errorHandler");
const auth_1 = require("./routes/auth");
const user_1 = require("./routes/user");
const conversation_1 = require("./routes/conversation");
const socket_1 = require("./routes/socket");
const room_1 = require("./routes/room");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
if (process.env.MONGO_URL) {
    mongoose_1.default
        .connect(process.env.MONGO_URL)
        .then(() => {
        console.log("mongodb is ready");
    })
        .catch((err) => console.log(err));
}
const whiteList = [
    "http://localhost:3000",
    "https://babbel-frontend.vercel.app",
];
const corsOptions = {
    origin: whiteList,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
};
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
const port = process.env.PORT;
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: Object.assign(Object.assign({}, corsOptions), { origin: true }),
    maxHttpBufferSize: 1e8,
});
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json("hello");
}));
app.use("/api/conversation", conversation_1.conversationRouter);
app.use("/api/user", user_1.userRouter);
app.use("/api/auth", auth_1.authRouter);
app.use("/api/room", room_1.roomRouter);
app.use(errorHandler_1.errorHandler);
io.use((socket, next) => {
    socket.data = socket.handshake.auth.user;
    next();
});
io.on("connection", (socket) => {
    (0, socket_1.socketHandler)(io, socket);
});
httpServer.listen(port, () => {
    console.log("server is running at port " + port);
});
module.exports = app;
