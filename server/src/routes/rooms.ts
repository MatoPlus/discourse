import express from "express";
import authorize from "../middleware/authorize";
import {
  createRoom,
  getRooms,
  getRoom,
  enterRoom,
  leaveRoom,
} from "../controllers/rooms";

const router = express.Router();

router.get("/", getRooms);

router.get("/:id", getRoom);

router.post("/", authorize, createRoom);

// A potential consideration is to allow anonymous users
router.patch("/enter/:id", authorize, enterRoom);

router.patch("/leave/:id", authorize, leaveRoom);

export default router;
