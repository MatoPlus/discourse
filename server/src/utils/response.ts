import { Response } from "express";

export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie("rtkn", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/auth/refresh",
  });
};
