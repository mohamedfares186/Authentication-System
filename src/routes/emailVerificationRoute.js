import express from "express";
import emailVerification from "../controllers/emailVerificationController.js";
const router = express.Router();

router.get("/verify-email/:token", emailVerification);

export default router;