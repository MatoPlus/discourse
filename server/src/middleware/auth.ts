import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import AuthRequest from "../types/AuthRequest";

export default function auth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.header("auth-token");
  if (!token)
    return res.status(401).send({ message: "Access Denied, Please Login" });

  try {
    const verified = jwt.verify(token as string, process.env.JWT_SECRET);
    req.user = verified;
    return next();
  } catch (err) {
    return res.status(400).send({ message: "Invalid Token" });
  }
}
