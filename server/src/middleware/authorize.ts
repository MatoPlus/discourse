import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import ErrorStatus from "../entities/ErrorStatus";
import AuthRequest from "../types/AuthRequest";

export default function authorize(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authorization = req.header("authorization");
  if (!authorization)
    res.status(401).send({ errors: [new ErrorStatus("User not logged in")] });
  else {
    try {
      // Following the bearer scheme
      const token = authorization.split(" ")[1] as string;
      const verified = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
      req.user = verified;
      next();
    } catch (err) {
      res.status(401).send({ errors: [new ErrorStatus("Invalid Token")] });
    }
  }
}
