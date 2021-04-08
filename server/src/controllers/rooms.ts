import { Request, Response } from "express";
import Room from "../models/room";
import RoomDocument from "../types/RoomDocument";

export const getRooms = async (_: Request, res: Response) => {
  try {
    const room = await Room.find();
    res.status(200).json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getRoom = async (req: Request, res: Response) => {
  console.log(req.params);
  try {
    const room = await Room.findOne({ _id: req.params.id });
    res.status(200).json(room || {});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const createRoom = async (req: Request, res: Response) => {
  console.log(req);
  try {
    const room: RoomDocument = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};
