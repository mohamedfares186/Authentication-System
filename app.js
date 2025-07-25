const express = require("express");
const app = express();

// Dependencies
const cookieParser = require("cookie-parser");
const logger = require("./src/middleware/logger");
const rateLimit = require("./src/middleware/rateLimit");
const errorHandling = require("./src/middleware/errorHandling");

// middleware
app.use(cookieParser());
app.use(express.json());
app.use(logger);

// Routes
const registration = require("./src/routes/registerRoute");
const emailVerification = require("./src/routes/emailVerificationRoute");
const login = require("./src/routes/loginRoute");
const refresh = require("./src/routes/refreshRoute");
const logout = require("./src/routes/logoutRoute");
const forgetPassword = require("./src/routes/forgetPasswordRoute");
const resetPassword = require("./src/routes/resetPasswordRoute");

app.use("/api/auth", rateLimit, registration);
app.use("/api/auth", rateLimit, emailVerification);
app.use("/api/auth", rateLimit, login);
app.use("/api/auth", rateLimit, refresh);
app.use("/api/auth", rateLimit, logout);
app.use("/api/auth", rateLimit, forgetPassword);
app.use("/api/auth", rateLimit, resetPassword);

app.use(errorHandling);

module.exports = app;