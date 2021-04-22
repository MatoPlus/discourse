import express from "express";
import {
  currentUser,
  registerUser,
  loginUser,
  logoutUser,
  recoverPassword,
  changePassword,
} from "../controllers/users";
import authorize from "../middleware/authorize";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/current", authorize, currentUser);
router.post("/logout", logoutUser);
router.post("/recover", recoverPassword);
router.put("/password/:token", changePassword);

export default router;
