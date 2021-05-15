import mongoose, { Schema } from "mongoose";
import UserDocument from "../types/UserDocument";

const userSchema: Schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 32,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 50,
      unique: true,
    },
    hashedPassword: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
    },
    // Watermark is used to keep track of JWT versions and revoking tokens
    refreshTokenWatermark: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<UserDocument>("User", userSchema);
