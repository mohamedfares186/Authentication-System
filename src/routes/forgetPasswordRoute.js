import express from "express";
import forgetPassword from "../controllers/forgetPasswordController.js";
const router = express.Router();

router.post("/forget-password", forgetPassword);

export default router;