import { Response, Request, Router } from "express";
import Room from "../models/Room";
import User from "../models/User";
import { verifyToken } from "./verifyToken";

const router = Router();

router.get("/", verifyToken, async (req: Request, res: Response) => {
  const rooms = await Room.find();

  return res.status(200).json({ msg: "get rooms success", data: rooms });
});

router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  const allPages = (await Room.findById(req.params.id))?.content.length || 0;
  let page = Number(req.query.page);

  const queryArrFilter = (page: number) => {
    if (page === 0) return -10;

    const allPagesCeil = Math.ceil(allPages / 10);
    if (page + 1 < allPagesCeil) {
      const pageSkip = allPages - page * 10 - 10;
      return [pageSkip, 10];
    }
    return allPages - page * 10;
  };

  const conversation = await Room.findById(req.params.id, {
    content: { $slice: queryArrFilter(page) },
  });

  return res.status(200).json({
    msg: "get conversation success",
    data: conversation?.content,
    conversationId: conversation?._id,
    allPages,
    nextPage: page + 1,
  });
});

router.post("/create/:id", verifyToken, async (req: Request, res: Response) => {
  const room = new Room({
    roomMasterId: req.params.id,
    name: req.body.name,
    content: [],
  });

  const roomSaved = await room.save();

  //await User.findByIdAndUpdate(req.params.id, { $addToSet: { roomJoined: roomSaved._id }})
  await Room.findByIdAndUpdate(roomSaved._id, {
    $addToSet: { members: req.params.id },
  });

  return res.status(200).json({ msg: "created room success", data: roomSaved });
});

export { router as roomRouter };
