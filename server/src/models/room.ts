import mongoose, { Schema } from "mongoose";
import RoomDocument from "../types/RoomDocument";

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
    description: {
      type: String,
      trim: true,
    },
    hasPassword: {
      type: Boolean,
      required: true,
    },
    hashedPassword: {
      type: String,
      trim: true,
    },
    maxUsers: { type: Number, required: true, min: 1, max: 32 },
    currentUsers: {
      type: [{ userId: { type: String } }],
      required: true,
      default: [],
    },
    content: {
      type: String,
      default: "",
    },
    mode: {
      type: String,
      default: "javascript",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<RoomDocument>("Room", roomSchema);
