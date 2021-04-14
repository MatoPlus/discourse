import express from "express";
import authorize from "../middleware/authorize";
import { createRoom, getRooms, getRoom } from "../controllers/rooms";

const router = express.Router();

router.get("/", getRooms);

router.get("/:id", getRoom);

router.post("/", authorize, createRoom);

export default router;
