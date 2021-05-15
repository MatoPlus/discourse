import argon2 from "argon2";
import { Request, Response } from "express";
import Status from "../entities/Status";
import FieldError from "../entities/FieldError";
import Room from "../models/room";
import User from "../models/user";
import { createRoomSchema } from "../schemas/schema";
import AuthRequest from "../types/AuthRequest";
import RoomDocument from "../types/RoomDocument";

/**
 * Get all rooms in database with pagination and filter, returning all
 * public room fields and whether or not there is more rooms to be paginated
 *
 * @param req request containing filter and pagination options
 * @param res
 */
export const getRooms = async (req: Request, res: Response) => {
  const filter = req.query.filter as string;
  const page = parseInt(req.query.page as string) || 0;
  const recordsPerPage = parseInt(req.query.recordsPerPage as string);
  const recordsPerPageWithNextCheck = recordsPerPage + 1;

  // Get rooms paginated, filtered, and sorted by last created
  try {
    let rooms = await Room.find({
      name: { $regex: filter || "", $options: "i" },
    })
      .select({ hashedPassword: 0, content: 0 })
      .sort("-createdAt")
      .skip(page * recordsPerPage)
      .limit(recordsPerPageWithNextCheck);
    res.json({
      rooms: recordsPerPage ? rooms.slice(0, recordsPerPage) : rooms,
      hasMore: rooms.length === recordsPerPageWithNextCheck,
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * Get room in database by id and return needed room fields
 *
 * @param req request containing room id as query param
 * @param res
 */
export const getRoom = async (req: Request, res: Response) => {
  try {
    const room = await Room.findOne({ _id: req.params.id }).select({
      hashedPassword: 0,
    });

    if (!room) {
      return res
        .status(404)
        .json({ errors: [new FieldError("_id", "Room not found")] });
    }

    return res.json(room);
  } catch (err) {
    return res
      .status(404)
      .json({ errors: [new FieldError("_id", "Room not found")] });
  }
};

/**
 * Enter room in database by id and return needed room fields
 *
 * @param req request containing room id as query param and user to enter
 * @param res
 */
export const enterRoom = async (req: AuthRequest, res: Response) => {
  try {
    const room = await Room.findOne({ _id: req.params.id });

    if (!room) {
      return res.status(404).json({ errors: [new Status("Room not found")] });
    }

    // If user already in room, return room
    if (
      room.currentUsers.some((user) => user.userId === (req.user as any)._id)
    ) {
      return res.json(room);
    }

    // Validate password if room has password
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
    return res.status(404).json({ errors: [new Status("Invalid room id")] });
  }
};

/**
 * Leave room in database by id and return user id
 *
 * @param req request containing room id as query param and user to leave
 * @param res
 */
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

/**
 * Create room in database and return room id
 *
 * @param req request containing createRoomSchema body and current user in access token
 * @param res
 */
export const createRoom = async (req: AuthRequest, res: Response) => {
  // Use Joi to validate request input
  const { error } = createRoomSchema.validate(req.body);
  if (error) {
    return res.status(409).json({
      errors: error.details.map(
        (detail) => new FieldError(detail.path[0] as string, detail.message)
      ),
    });
  }

  // Find current user by access token and use as host of room
  const user = await User.findOne({ _id: (req.user as any)._id });

  if (!user) {
    return res.status(401).json({ message: "Current user not found" });
  }

  // Create and save room
  try {
    const room: RoomDocument = new Room({
      host: user.username,
      name: req.body.name,
      description: req.body.description,
      maxUsers: req.body.maxUsers,
      hashedPassword: req.body.password
        ? await argon2.hash(req.body.password)
        : undefined,
      hasPassword: !!req.body.password,
    });
    await room.save();
    return res.status(201).json({ _id: room.id });
  } catch (err) {
    return res.status(409).json({ message: err.message });
  }
};

/**
 * Edit room in database and return room id
 *
 * @param req request containing createRoomSchema body (also used for edits) and current user in access token
 * @param res
 */
export const editRoom = async (req: AuthRequest, res: Response) => {
  // Use Joi to validate input
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

  const room = await Room.findOne({ _id: req.params.id });

  if (!room) {
    return res.status(401).json({ message: "Room not found" });
  }

  if (user.username !== room.host) {
    return res
      .status(401)
      .json({ errors: [new Status("Cannot edit other user's room")] });
  }

  // Update room using request
  try {
    room.name = req.body.name;

    // Pop users until maxUsers matches currentUsers
    const maxUsers = room.maxUsers;
    const newMaxUsers = req.body.maxUsers;

    if (newMaxUsers < maxUsers) {
      for (let i = 0; i < maxUsers - newMaxUsers; ++i) {
        room.currentUsers.pop();
      }
    }
    room.maxUsers = req.body.maxUsers;

    room.description = req.body.description;
    room.hashedPassword = req.body.password
      ? await argon2.hash(req.body.password)
      : undefined;
    room.hasPassword = !!req.body.password;
    await room.save();
    return res.status(200).json({ _id: room.id });
  } catch (err) {
    return res.status(409).json({ message: err.message });
  }
};

/**
 * Delete room in database and return room id
 *
 * @param req request containing query param of room id and current user (access token)
 * @param res
 */
export const deleteRoom = async (req: AuthRequest, res: Response) => {
  const user = await User.findOne({ _id: (req.user as any)._id });

  if (!user) {
    return res.status(401).json({ message: "Current user not found" });
  }

  const room = await Room.findOne({ _id: req.params.id });

  if (!room) {
    return res.status(401).json({ message: "Room not found" });
  }

  if (user.username !== room.host) {
    return res
      .status(401)
      .json({ message: "User cannot delete other user's room" });
  }

  // Delete room
  try {
    await Room.deleteOne({ _id: room.id });
    return res.status(200).json({ _id: room.id });
  } catch (err) {
    return res.status(409).json({ message: err.message });
  }
};

/**
 * Verify user has access to room
 *
 * @param req request containing query param of room id and current user (access token)
 * @param res
 */
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
