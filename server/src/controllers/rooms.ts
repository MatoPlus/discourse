import argon2 from "argon2";
import { Request, Response } from "express";
import Status from "../entities/Status";
import FieldError from "../entities/FieldError";
import Room from "../models/room";
import User from "../models/user";
import { createRoomSchema } from "../schemas/schema";
import AuthRequest from "../types/AuthRequest";
import RoomDocument from "../types/RoomDocument";

export const getRooms = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 0;
  const recordsPerPage = parseInt(req.query.recordsPerPage as string);
  const recordsPerPageWithNextCheck = recordsPerPage + 1;
  try {
    let rooms = await Room.find()
      .select({ hashedPassword: 0, content: 0 })
      .sort("-createdAt")
      .skip(page * recordsPerPage)
      .limit(recordsPerPageWithNextCheck);
    res.json({
      rooms: recordsPerPage
        ? rooms.slice(0, recordsPerPageWithNextCheck)
        : rooms,
      hasMore: rooms.length === recordsPerPageWithNextCheck,
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
      return res.status(404).json({ errors: [new Status("Room not found")] });
    }

    if (
      room.currentUsers.some((user) => user.userId === (req.user as any)._id)
    ) {
      return res.json(room);
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

    if (room.currentUsers.length >= room.maxUsers) {
      return res.status(400).json({ errors: [new Status("Room is full")] });
    }

    // join room if not already in room
    room.currentUsers.push({ userId: (req.user as any)._id });
    room.save();

    return res.json(room);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ errors: [new Status("Invalid room id")] });
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
  try {
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
  } catch (err) {
    return res.status(400).json({ errors: [new Status("Invalid room id")] });
  }
};
