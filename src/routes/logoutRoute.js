import express from "express";
import logout from "../controllers/logoutController.js";
const router = express.Router();

router.post("/logout", logout);

export default router;