import express from "express";
import { refreshAccessToken } from "../controllers/auth";

const router = express.Router();

router.post("/refresh", refreshAccessToken);

// ! Testing Purpose only
// router.post("/refresh/revoke", revokeAllRefreshTokens);

export default router;
