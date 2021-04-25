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
    let rooms = await Room.find().select({ hashedPassword: 0, content: 0 });
    res.json({
      rooms: rooms,
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getRoom = async (req: Request, res: Response) => {
  try {
    const room = await Room.findOne({ _id: req.params.id }).select({
      hashedPassword: 0,
    });
    return res.json(room || {});
  } catch (err) {
    return res
      .status(404)
      .json({ errors: [new FieldError("_id", "Room not found")] });
  }
};

export const enterRoom = async (req: AuthRequest, res: Response) => {
  // Validate password here :)
  try {
    const room = await Room.findOne({ _id: req.params.id });

    if (!room) {
      return res
        .status(404)
        .json({ errors: [new FieldError("_id", "Room not found")] });
    }

    if (room.hashedPassword) {
      const validPass = await argon2.verify(
        room.hashedPassword,
        req.body.password
      );
      if (!validPass)
        return res
          .status(400)
          .json({ errors: [new FieldError("password", "Invalid password")] });
    }

    room.currentUsers.push({ userId: (req.user as any)._id });
    room.save();

    // await Room.findOneAndUpdate({ _id: req.body.id });
    return res.json(room);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "Invalid room id" });
  }
};

export const leaveRoom = async (req: AuthRequest, res: Response) => {
  try {
    await Room.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { currentUsers: { userId: (req.user as any)._id } } }
    );
    return res.json({ _id: (req.user as any)._id });
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
      hasPassword: !!req.body.password,
    });
    await room.save();
    return res.status(201).json(room);
  } catch (err) {
    return res.status(409).json({ message: err.message });
  }
};

export const verifyUser = async (req: AuthRequest, res: Response) => {
  const room = await Room.findOne({ _id: req.params.id });

  if (!room) {
    return res
      .status(404)
      .json({ errors: [new FieldError("_id", "Room not found")] });
  }

  // return true or false based on whether current user is in currentUsers
  let isVerified = false;
  room.currentUsers.forEach((user) => {
    if (user.userId === (req.user as any)._id) {
      isVerified = true;
    }
  });
  return res.json({ _id: (req.user as any)._id, verified: isVerified });
};
