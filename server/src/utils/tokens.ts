import { sign } from "jsonwebtoken";
import UserDocument from "../types/UserDocument";

export const createAccessToken = (user: UserDocument) => {
  return sign({ _id: user.id }, process.env.ACCESS_JWT_SECRET, {
    expiresIn: "30min",
  });
};

export const createRefreshToken = (user: UserDocument) => {
  return sign(
    { _id: user.id, tokenWatermark: user.refreshTokenWatermark },
    process.env.REFRESH_JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};
