import mongoose, { Schema } from "mongoose";
import RoomDocument from "../types/RoomDocument";

// TODO: Try to replace constraints with Joi validation
// Missing text and language setting
const roomSchema: Schema = new mongoose.Schema(
  {
    host: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 32,
    },
    maxUsers: { type: Number, required: true, min: 1, max: 32 },
    hashedPassword: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<RoomDocument>("Room", roomSchema);
