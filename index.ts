import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import mongoose from "mongoose";
import { errorHandler } from "./utils/errorHandler";
import { authRouter } from "./routes/auth";
import { userRouter } from "./routes/user";
import { conversationRouter } from "./routes/conversation";
import { socketHandler } from "./routes/socket";
import { roomRouter } from "./routes/room";
import cookieParser from "cookie-parser";
import { verifyToken } from "./routes/verifyToken";

mongoose.set("strictQuery", true);
dotenv.config();

if (process.env.MONGO_URL) {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("mongodb is ready");
    })
    .catch((err) => console.log(err));
}

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://babbel-frontend.vercel.app",
    "https://vercel.com",
    "https://babbel-frontend-git-main-thanhhung-art.vercel.app/",
    "https://babbel-frontend-thanhhung-art.vercel.app/",
    "1337729",
  ],
  credentials: true,
};

const app: Express = express();
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

const port = process.env.PORT;
const httpServer = createServer(app);
const io = new Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  User
>(httpServer, {
  cors: corsOptions,
  maxHttpBufferSize: 1e8,
});


app.get("/", async (req: Request, res: Response) => {
  res.status(200).json("hello");
});
app.use("/api/auth", authRouter);

app.use("/api/conversation", conversationRouter);
app.use("/api/user", userRouter);
app.use("/api/room", roomRouter);
app.use(errorHandler);

io.use((socket, next) => {
  socket.data = socket.handshake.auth.user;
  next();
});

io.on("connection", (socket: Socket) => {
  socketHandler(io, socket);
});

httpServer.listen(port, () => {
  console.log("server is running at port " + port);
});



module.exports = app
