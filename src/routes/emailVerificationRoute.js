const express = require("express");
const router = express.Router();
const emailVerification = require("../controllers/emailVerificationController");


router.get("/verify-email/:token", emailVerification.emailVerification);

module.exports = router;