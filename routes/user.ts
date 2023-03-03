import { Response, Request, Router } from "express";
import User from "../models/User";
import { verifyToken } from "./verifyToken";

const router = Router();

router.get("/", verifyToken, async (req: Request, res: Response) => {
  const users = await User.find();
  return res.status(200).json({ msg: "get users success", data: users });
});

router.get("/:id",verifyToken , async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  return res.status(200).json({ msg: "get user success", data: user });
});

router.put("/friendreq/:id",verifyToken , async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.body.receiverId, {
    '$addToSet': {
      friendreq: req.params.id,
    },
  });
  return res.status(200).json({ msg: "send request success" });
});

router.put("/accep_or_decline_friend_request/:id", verifyToken, async (req: Request, res: Response) => {
  if (req.body.msg === "decline friend request") {
    await User.updateMany(
      { _id: req.params.id },
      { '$set': { "notification.$[element].unread": false } },
      { arrayFilters: [{ "element.unread": true }] }
    );
    return res.status(200).json({ msg: "update notification success" });
  } else {
    await User.findByIdAndUpdate(req.body.senderId, {
      '$addToSet': { friends: req.params.id },
    });
    await User.findByIdAndUpdate(req.params.id, {
      '$addToSet': { friends: req.body.senderId },
    });
    await User.updateMany(
      { _id: req.params.id },
      { '$set': { "notification.$[element].unread": false } },
      { arrayFilters: [{ "element.unread": true }] }
    );
    return res.status(200).json({ msg: "update notification success" });
  }
});

router.get("/get_friend_req/:id", verifyToken, async (req: Request, res: Response) => {
  const data = await User.findById(req.params.id)
  const friendReq = await data?.friendreq
  if (friendReq) {
    return res.status(200).json({ msg: 'success', data: friendReq })
  }
  return res.status(400).json({ msg: 'unsuccess '})
})



export { router as userRouter };
