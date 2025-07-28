import express from "express";
const app = express();

// Dependencies
import cookieParser from "cookie-parser";
import logger from "./src/middleware/logger.js";
import limiter from "./src/middleware/rateLimit.js";
import errorHandling from "./src/middleware/errorHandling.js";

// middleware
app.use(cookieParser());
app.use(express.json());
app.use(logger);

// Routes
import registration from "./src/routes/registerRoute.js";
import emailVerification from "./src/routes/emailVerificationRoute.js";
import login from "./src/routes/loginRoute.js";
import refresh from "./src/routes/refreshRoute.js";
import logout from "./src/routes/logoutRoute.js";
import forgetPassword from "./src/routes/forgetPasswordRoute.js";
import resetPassword from "./src/routes/resetPasswordRoute.js";

app.use("/api/auth", limiter, registration);
app.use("/api/auth", limiter, emailVerification);
app.use("/api/auth", limiter, login);
app.use("/api/auth", limiter, refresh);
app.use("/api/auth", limiter, logout);
app.use("/api/auth", limiter, forgetPassword);
app.use("/api/auth", limiter, resetPassword);

app.use(errorHandling);

export default app;