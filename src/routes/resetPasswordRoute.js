const express = require("express");
const router = express.Router();
const resetPasswordController = require("../controllers/resetPasswordController");

router.post("/reset-password/:token", resetPasswordController.resetPassword);

module.exports = router;