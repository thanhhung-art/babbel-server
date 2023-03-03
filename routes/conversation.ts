import { Response, Request, Router } from "express";
import Conversation from "../models/Conversation";
import { verifyToken } from "./verifyToken";

const router = Router();

router.post("/create/:id", verifyToken, async (req: Request, res: Response) => {
  const person1 = req.params.id,
    person2 = req.body.guestId;
  const conversation = new Conversation({
    users: [person1, person2],
    content: [],
  });

  const savedConversation = await conversation.save();

  return res
    .status(200)
    .json({ msg: "create conversation success", data: savedConversation });
});

router.get(
  "/:id/:guestId",
  verifyToken,
  async (req: Request, res: Response) => {
    const userId = req.params.id,
      guestId = req.params.guestId,
      page: number = Number(req.query.page);
    let allPages = 0;

    const allConversation = await Conversation.findOne({
      users: { $all: [userId, guestId] },
    });
    if (allConversation?.content.length) {
      allPages = allConversation.content.length;
    }

    const queryArrFilter = (page: number) => {
      if (page === 0) return -10;

      const allPagesCeil = Math.ceil(allPages / 10)
      if (page + 1 < allPagesCeil ) {
        const pageSkip = allPages - ( (page) * 10) - 10
        return [pageSkip, 10];
      } 
      return allPages - page * 10
    };

    const conversation = await Conversation.findOne(
      {
        users: { $all: [userId, guestId] },
      },
      {
        content: { $slice: queryArrFilter(page)},
      }
    );

    return res.status(200).json({
      msg: "get conversation success",
      data: conversation?.content,
      conversationId: conversation?._id,
      allPages,
      nextPage: page + 1,
    });
  }
);

export { router as conversationRouter };
