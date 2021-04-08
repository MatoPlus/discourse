import express from "express";
import { createRoom, getRooms, getRoom } from "../controllers/rooms";

const router = express.Router();

router.get("/", getRooms);

router.get("/:id", getRoom);

router.post("/", createRoom);

export default router;
