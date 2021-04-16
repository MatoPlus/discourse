import { Request, Response } from "express";
import { createRoomSchema } from "../schemas/schema";
import argon2 from "argon2";
import Room from "../models/room";
import RoomDocument from "../types/RoomDocument";
import FieldError from "../entities/FieldError";
import User from "../models/user";
import AuthRequest from "../types/AuthRequest";

export const getRooms = async (_: Request, res: Response) => {
  try {
    const rooms = await Room.find();
    res.json({ rooms: rooms });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getRoom = async (req: Request, res: Response) => {
  const room = await Room.findOne({ _id: req.params.id });

  // TODO: Handle passwords
  if (!room) {
    return res
      .status(404)
      .json({ errors: [new FieldError("_id", "Room not found")] });
  }

  return res.json(room || {});
};

export const enterRoom = async (req: AuthRequest, res: Response) => {
  try {
    await Room.findOneAndUpdate(
      { _id: req.body.id },
      { $push: { currentUsers: { userId: (req.user as any)._id } } }
    );
    return res.json(req.user);
  } catch (err) {
    return res.status(404).json({ message: "Invalid room id" });
  }
};

export const leaveRoom = async (req: AuthRequest, res: Response) => {
  try {
    await Room.findOneAndUpdate(
      { _id: req.body.id },
      { $pull: { currentUsers: { userId: (req.user as any)._id } } }
    );
    return res.json(req.user);
  } catch (err) {
    return res.status(404).json({ message: "Invalid room id" });
  }
};

export const createRoom = async (req: AuthRequest, res: Response) => {
  const { error } = createRoomSchema.validate(req.body);
  if (error) {
    return res.status(409).json({
      errors: error.details.map(
        (detail) => new FieldError(detail.path[0] as string, detail.message)
      ),
    });
  }

  const user = await User.findOne({ _id: (req.user as any)._id });

  if (!user) {
    return res.status(401).json({ message: "Current user not found" });
  }

  try {
    const room: RoomDocument = new Room({
      host: user.username,
      name: req.body.name,
      maxUsers: req.body.maxUsers,
      hashedPassword: req.body.password
        ? await argon2.hash(req.body.password)
        : undefined,
    });
    await room.save();
    return res.status(201).json(room);
  } catch (err) {
    return res.status(409).json({ message: err.message });
  }
};
