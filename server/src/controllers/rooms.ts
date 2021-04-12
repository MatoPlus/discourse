import { Request, Response } from "express";
import Room from "../models/room";
import RoomDocument from "../types/RoomDocument";

export const getRooms = async (_: Request, res: Response) => {
  try {
    const rooms = await Room.find();
    res.json({ rooms: rooms });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getRoom = async (req: Request, res: Response) => {
  try {
    const room = await Room.findOne({ _id: req.params.id });
    res.json(room || {});
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const createRoom = async (req: Request, res: Response) => {
  // TODO: use Joi for good errors
  try {
    const room: RoomDocument = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};
