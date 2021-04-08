import { Request, Response } from "express";
import User from "../models/user";
import UserDocument from "../types/UserDocument";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import FieldError from "../entities/FieldError";
import AuthRequest from "../types/AuthRequest";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const user: UserDocument = new User({
      username: req.body.username,
      email: req.body.email,
      hashedPassword: await argon2.hash(req.body.password),
    });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  console.log(req.body);

  const user = await User.findOne({
    $or: [
      { email: req.body.usernameOrEmail },
      { username: req.body.usernameOrEmail },
    ],
  });
  if (!user)
    return res
      .status(400)
      .send(new FieldError("usernameOrEmail", "Username or email not found"));

  const validPass = await argon2.verify(user.hashedPassword, req.body.password);
  if (!validPass)
    return res.status(400).send(new FieldError("password", "Invalid password"));

  // token assigning
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  return res.header("auth-token", token).send({ token: token });
};

export const currentUser = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Not logged in" });
  } else {
    res.status(201).json(req.user);
  }
};
