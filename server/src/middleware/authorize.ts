import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import FieldError from "../entities/FieldError";
import AuthRequest from "../types/AuthRequest";

export default function authorize(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authorization = req.header("authorization");
  if (!authorization)
    res
      .status(200)
      .send({ errors: [new FieldError("user", "User not logged int")] });
  else {
    try {
      // Following the bearer scheme
      const token = authorization.split(" ")[1] as string;
      const verified = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
      req.user = verified;
      next();
    } catch (err) {
      res.status(401).send({ message: "Invalid Token" });
    }
  }
}
