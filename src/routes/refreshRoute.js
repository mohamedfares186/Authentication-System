import express from "express";
import refresh from "../controllers/refreshController.js";
const router = express.Router();

router.get("/refresh", refresh);

export default router;