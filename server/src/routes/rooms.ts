import express from "express";
import authorize from "../middleware/authorize";
import {
  createRoom,
  getRooms,
  getRoom,
  enterRoom,
  leaveRoom,
  verifyUser,
  deleteRoom,
  editRoom,
} from "../controllers/rooms";

const router = express.Router();

router.get("/", getRooms);

router.get("/:id", getRoom);

router.delete("/:id", authorize, deleteRoom);

router.patch("/:id", authorize, editRoom);

router.post("/", authorize, createRoom);

// A potential consideration is to allow anonymous users
router.patch("/enter/:id", authorize, enterRoom);

router.patch("/leave/:id", authorize, leaveRoom);

router.get("/verify/:id", authorize, verifyUser);

export default router;
