import { Response, Router, Request } from "express";
import User from "../models/User";
import * as CryptoJS from "crypto-js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "./verifyToken";

const router = Router();

function createCookieAndSendToClient(res: Response, token: string, data: any) {
  res.cookie("authtoken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });

  return res.status(201).json({ msg: "query success", data: data });
}

router.post("/login", async (req: Request, res: Response) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    if (req.body.ggId) {
      const newUser = new User({
        email: req.body.email,
        name: req.body.name,
        avatar: req.body.picture,
        ggId: req.body.ggId,
      });
      const savedUser = await newUser.save();
      if (process.env.JWT_SECRET) {
        const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        return createCookieAndSendToClient(res, token, savedUser);
      }
      return res.status(500).json({ msg: "server error! " });
    }

    return res.status(400).json({ msg: "user not found" });
  }

  if (process.env.PASS_SECRET && process.env.JWT_SECRET && user.password) {
    const decryptPass = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SECRET
    ).toString(CryptoJS.enc.Utf8);

    if (decryptPass !== req.body.password)
      return res.status(400).json({ msg: "invalid password" });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return createCookieAndSendToClient(res, token, user);
  } else if (
    user.ggId === req.body.ggId &&
    user.email === req.body.email &&
    !user.password &&
    process.env.JWT_SECRET
  ) {
    if (user.avatar !== req.body.picture) {
      await User.findByIdAndUpdate(user._id, { avatar: req.body.picture });
      user.avatar = req.body.picture;
    }

    if (user.name !== req.body.name) {
      await User.findByIdAndUpdate(user._id, { name: req.body.name });
      user.name = req.body.name;
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return createCookieAndSendToClient(res, token, user);
  }
  return res.status(500).json({ msg: "something went wrong" });
});

router.delete("/logout", async (req: Request, res: Response) => {
  res.clearCookie("authtoken");
  res.status(200).json({ msg: "logout success" });
});

router.post("/register", async (req: Request, res: Response) => {
  const userExisted = await User.findOne({ email: req.body.email });
  if (userExisted) return res.status(400).json("user already exists");

  if (process.env.PASS_SECRET && process.env.JWT_SECRET) {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.PASS_SECRET
      ).toString(),
    });

    const savedUser = await user.save();

    const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return createCookieAndSendToClient(res, token, savedUser);
  }
  return res.status(500).json({ msg: "something went wrong!" });
});

router.get("/checkauth", verifyToken, async (req: Request, res: Response) => {
  const token = req.cookies["authtoken"];
  const jwt_secret: any = process.env.JWT_SECRET;
  const jwt_payload: JwtPayload<{ _id: string }> = jwt.verify(
    token,
    jwt_secret
  );

  const user = await User.findById(jwt_payload._id);

  return res.status(200).json({ msg: "authentication success", data: user });
});

export { router as authRouter };
