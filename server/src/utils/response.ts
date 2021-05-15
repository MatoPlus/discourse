import { Response } from "express";

export const sendRefreshToken = (res: Response, token: string) => {
  // Respond with lax cookie with secure path
  res.cookie("rtkn", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/auth/refresh",
  });
};
