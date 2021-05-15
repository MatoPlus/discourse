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

/**
 * Get the current user from access token if exists
 *
 * @param req request containing accesstoken
 * @param res
 */
export const currentUser = async (req: AuthRequest, res: Response) => {
  const user = await User.findOne({ _id: (req.user as any)._id });
  if (!user) {
    return res.status(404).json(new FieldError("_id", "User not found"));
  }
  return res
    .status(200)
    .json({ _id: user._id, username: user.username, email: user.email });
};

/**
 * Register/create user in database if body is valid
 *
 * @param req request containing body of registerUserSchema
 * @param res
 */
export const registerUser = async (req: Request, res: Response) => {
  // Use Joi to validate body and return errors if any
  const { error } = registerUserSchema.validate(req.body);
  if (error) {
    return res.status(409).json({
      errors: error.details.map(
        (detail) => new FieldError(detail.path[0] as string, detail.message)
      ),
    });
  }

  // Try to create and save user
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

/**
 * Login as user by returning new refresh and access tokens for session
 *
 * @param req request containing login info containing user/email and password
 * @param res
 */
export const loginUser = async (req: Request, res: Response) => {
  // Try to find user by either user/email (same field in form)
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

  // Verify password using argon
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

/**
 * Logout by returning empty refresh token
 *
 * @param _
 * @param res
 */
export const logoutUser = async (_: Request, res: Response) => {
  sendRefreshToken(res, "");
  res.json({ ok: true });
};

/**
 * Recover user password by sending email to user with change password link
 *
 * @param req contains body for forgotPasswordSchema
 * @param res
 */
export const recoverPassword = async (req: Request, res: Response) => {
  // Use Joi to validate input for request
  const { error, value } = forgotPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      errors: error.details.map(
        (detail) => new FieldError(detail.path[0] as string, detail.message)
      ),
    });
  }

  // Get user and email and send email containing change password link if exists
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

  // Return ok regardless to prevent brute force data mining
  return res.json({ ok: true });
};

/**
 * Change password for user
 *
 * @param req contains body for changePasswordSchema
 * @param res
 */
export const changePassword = async (req: Request, res: Response) => {
  // Use Joi to validate input
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

  // Validate that recover token is valid and use userId in token to change password
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
