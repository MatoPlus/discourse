import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  currentUser,
} from "../controllers/users";
import authorize from "../middleware/authorize";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/current", authorize, currentUser);
router.post("/logout", logoutUser);
// router.post("/changePassword", changeUserPassword);
// router.post("/recoverPassword", recoverUserPassword);

export default router;
