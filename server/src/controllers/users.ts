import { Request, Response } from "express";
import User from "../models/user";
import UserDocument from "../types/UserDocument";
import argon2 from "argon2";
import FieldError from "../entities/FieldError";
import AuthRequest from "../types/AuthRequest";
import jwt from "jsonwebtoken";
import { sendRefreshToken } from "../utils/response";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  registerUserSchema,
} from "../schemas/schema";
import {
  createAccessToken,
  createRecoverToken,
  createRefreshToken,
} from "../utils/tokens";
import { sendEmail } from "../utils/sendEmail";

export const currentUser = async (req: AuthRequest, res: Response) => {
  const user = await User.findOne({ _id: (req.user as any)._id });
  if (!user) {
    return res.status(404).json(new FieldError("_id", "User not found"));
  }
  return res
    .status(200)
    .json({ _id: user._id, username: user.username, email: user.email });
};

export const registerUser = async (req: Request, res: Response) => {
  const { error } = registerUserSchema.validate(req.body);
  if (error) {
    return res.status(409).json({
      errors: error.details.map(
        (detail) => new FieldError(detail.path[0] as string, detail.message)
      ),
    });
  }

  try {
    const user: UserDocument = new User({
      username: req.body.username,
      email: req.body.email,
      hashedPassword: await argon2.hash(req.body.password),
    });
    await user.save();
    return res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) {
      // duplicate error
      const field = Object.keys(err.keyPattern)[0] as string;
      return res.status(409).json({
        errors: [new FieldError(field, `${field} is already taken`)],
      });
    } else {
      return res.status(400).json({ message: "Cannot register invalid user" });
    }
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const user = await User.findOne({
    $or: [
      { email: req.body.usernameOrEmail },
      { username: req.body.usernameOrEmail },
    ],
  });

  if (!user) {
    return res.status(400).json({
      errors: [
        new FieldError("usernameOrEmail", "Username or email not found"),
      ],
    });
  }

  const validPass = await argon2.verify(user.hashedPassword, req.body.password);
  if (!validPass)
    return res
      .status(400)
      .json({ errors: [new FieldError("password", "Invalid password")] });

  // token assigning
  const accessToken = createAccessToken(user);

  sendRefreshToken(res, createRefreshToken(user));

  return res.send({ token: accessToken });
};

export const logoutUser = async (_: Request, res: Response) => {
  sendRefreshToken(res, "");
  res.json({ ok: true });
};

export const recoverPassword = async (req: Request, res: Response) => {
  const { error, value } = forgotPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      errors: error.details.map(
        (detail) => new FieldError(detail.path[0] as string, detail.message)
      ),
    });
  }
  const email = value.email;
  const user = await User.findOne({ email: email });

  if (user) {
    const recoverToken = createRecoverToken(user);
    // send email
    await sendEmail(
      email,
      `<a href="${process.env.CORS_ORIGIN}/recover/${recoverToken}">reset password</a>`
    );
  }

  return res.json({ ok: true });
};

export const changePassword = async (req: Request, res: Response) => {
  const { error, value } = changePasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      errors: error.details.map(
        (detail) => new FieldError(detail.path[0] as string, detail.message)
      ),
    });
  }
  const password = value.password;
  const recoverToken = req.params.token;

  let userId = -1;
  try {
    const verified = jwt.verify(recoverToken, process.env.RECOVER_JWT_SECRET);
    userId = (verified as any)._id;
  } catch (err) {
    return res.status(400).json({
      errors: [new FieldError("token", "token expired")],
    });
  }
  const user = await User.findByIdAndUpdate(userId, {
    hashedPassword: await argon2.hash(password),
  });

  if (!user) {
    return res.status(400).json({
      errors: new FieldError("token", "user does not exist"),
    });
  }

  return res.json({ _id: userId });
};
