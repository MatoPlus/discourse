import express from "express";
import { loginUser, registerUser, currentUser } from "../controllers/users";
import auth from "../middleware/auth";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/current", auth, currentUser);
// router.post("/logout", logoutUser);
// router.post("/changePassword", changeUserPassword);
// router.post("/recoverPassword", recoverUserPassword);

export default router;
