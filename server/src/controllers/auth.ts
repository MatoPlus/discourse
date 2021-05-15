import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "../utils/tokens";
import { sendRefreshToken } from "../utils/response";
import User from "../models/user";

/**
 * Refresh the access token using the refresh token in cookies
 *
 * @param req contains refresh token cookie
 * @param res
 */
export const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.rtkn;

  if (!refreshToken) {
    return res.send({ ok: false, accessToken: "" });
  }

  let payload: any = null;
  try {
    payload = verify(refreshToken, process.env.REFRESH_JWT_SECRET);
  } catch (err) {
    return res.send({ ok: false, accessToken: "" });
  }

  // Try to get user with expected token watermark/versions
  const user = await User.findOne({
    _id: payload._id,
    refreshTokenWatermark: payload.tokenWatermark,
  });
  if (!user) {
    return res.send({ ok: false, accessToken: "" });
  }

  // Update expiry of refresh token
  sendRefreshToken(res, createRefreshToken(user));

  // Return refreshed access token in response
  return res.send({ ok: true, accessToken: createAccessToken(user) });
};

// ! For testing purposes only
export const revokeAllRefreshTokens = (req: Request, res: Response) => {
  const userId = req.body._id;

  if (userId) {
    User.updateOne(
      { _id: userId },
      { $set: { refreshTokenWatermark: new Date() } }
    )
      .then(() => res.send({ ok: true, _id: userId }))
      .catch(() => res.status(404).send({ ok: false, _id: -1 }));
  } else {
    res.status(400).send({ ok: false, _id: -1 });
  }
};
