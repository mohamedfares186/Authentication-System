const express = require("express");
const router = express.Router();
const forgetPasswordController = require("../controllers/forgetPasswordController");

router.post("/forget-password", forgetPasswordController.forgetPassword);

module.exports = router;