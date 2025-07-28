import "dotenv/config";
import { describe, test, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import nodemailerMock from "nodemailer-mock";

vi.mock('nodemailer', () => {
  return {
    default: nodemailerMock,
    ...nodemailerMock,
  }
});

import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";

const agent = request.agent(app);

afterEach(() => {
  nodemailerMock.mock.reset();
});

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URL);
});

afterAll(async () => {
  await mongoose.disconnect();
});

function extractTokenFromText(text) {
  const match = text.match(/\/api\/auth\/[^/]+\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

const unique = Math.floor(Math.random() * 1000) * Math.floor(Math.random() * 1000);

// Utility functions for common auth operations
const authUtils = {
  async register(userData) {
    return await agent.post("/api/auth/register").send(userData);
  },

  async login(credentials) {
    return await agent.post("/api/auth/login").send(credentials);
  },

  async logout(cookies = null) {
    const request = agent.post("/api/auth/logout");
    if (cookies) {
      request.set("cookie", cookies);
    }
    return await request;
  },

  async verifyEmail(token) {
    return await agent.get(`/api/auth/verify-email/${token}`);
  },

  async forgetPassword(email) {
    return await agent.post("/api/auth/forget-password").send({ email });
  },

  async resetPassword(token, passwords) {
    return await agent.post(`/api/auth/reset-password/${token}`).send(passwords);
  },

  async refresh(cookies = null) {
    const request = agent.get("/api/auth/refresh");
    if (cookies) {
      request.set("cookie", cookies);
    }
    return await request;
  },

  // Helper to get refresh cookie from login response
  getRefreshCookie(loginResponse) {
    const userCookies = loginResponse.header['set-cookie'];
    return userCookies?.find(cookie => cookie.startsWith("refreshToken="));
  },

  

  // Default user data for testing
  defaultUser: {
    firstName: "john",
    lastName: "doe",
    email: `johndoe_${unique}@example.com`,
    username: `johndoe_${unique}`,
    password: "12345678",
    repeatPassword: "12345678",
    dateOfBirth: "1-1-2000"
  },

  defaultCredentials: {
    username: `johndoe_${unique}`,
    password: "12345678"
  }
};

describe("Testing Register Controller", () => {
  test("Missing User Input", async () => {
    const res = await authUtils.register({
      firstName: "john",
      lastName: "doe",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.Error).toBe("Please enter valid data");
  });

  test("Password invalid length", async () => {
    const res = await authUtils.register({
      ...authUtils.defaultUser,
      password: "1234",
      repeatPassword: "1234"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.Error).toBe("Password must be at least 8 characters long");
  });

  test("Password does not match", async () => {
    const res = await authUtils.register({
      ...authUtils.defaultUser,
      password: "12345678",
      repeatPassword: "123456789"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.Error).toBe("Please Repeat password correctly");
  });

  test("Registered successfully, and verifying email", async () => {
    const res = await authUtils.register(authUtils.defaultUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.Message).toBe("Registered successfully, Please Verify your email");

    // using nodemailer-mock to receive the email
    const sentEmails = nodemailerMock.mock.getSentMail();
    const token = extractTokenFromText(sentEmails[0].text);

    console.log(sentEmails);
    console.log(token);

    const verifyRes = await authUtils.verifyEmail(token);

    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.body.Message).toBe("User has been verified successfully");
  });

  test("User already exists", async () => {
    const res = await authUtils.register(authUtils.defaultUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.Error).toBe("Invalid Credentials");
  });
});

describe("Testing Email Verification Error status code", () => {
  test("Invalid or expired token", async () => {
    const res = await authUtils.verifyEmail("abc123");

    expect(res.statusCode).toBe(400);
    expect(res.body.Error).toBe("Invalid or Expired token");
  });
});

describe("Testing Login", () => {
  test("Missing Fields", async () => {
    const res = await authUtils.login({ username: "johndoe" });

    expect(res.statusCode).toBe(400);
    expect(res.body.Error).toBe("Username and password are required");
  });

  test("User Not Found", async () => {
    const res = await authUtils.login({
      username: "janedoe",
      password: "12345678"
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.Error).toBe("User Not Found");
  });

  test("Wrong Password", async () => {
    const res = await authUtils.login({
      username: `johndoe_${unique}`,
      password: "123456789"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.Error).toBe("Invalid Credentials");
  });

  test("Logged in successfully", async () => {
    const res = await authUtils.login(authUtils.defaultCredentials);

    expect(res.statusCode).toBe(200);
    expect(res.body.Message).toBe("Logged in successfully");
  });
});

describe("Testing Refresh API", () => {
  test("No cookies", async () => {
    await authUtils.logout();

    const res = await authUtils.refresh();

    expect(res.statusCode).toBe(401);
    expect(res.body.Error).toBe("Unauthorized");
  });

  test("User Not Found in the cookies", async () => {
    const user = await authUtils.login(authUtils.defaultCredentials);
    await authUtils.logout();

    const userCookies = user.header['set-cookie'];

    const res = await authUtils.refresh(userCookies);

    expect(res.statusCode).toBe(404);
    expect(res.body.Error).toBe("User Not Found");
  });

  test("Successfully created a refresh token", async () => {
    const user = await authUtils.login(authUtils.defaultCredentials);
    const refreshCookie = authUtils.getRefreshCookie(user);

    const res = await authUtils.refresh(refreshCookie);

    expect(res.statusCode).toBe(201);
    expect(res.body.Message).toBe("Refresh Token has been created successfully");
  });
});

describe("Testing logout", () => {
  test("No cookie", async () => {
    await authUtils.logout();

    const res = await authUtils.logout();

    expect(res.statusCode).toBe(401);
    expect(res.body.Error).toBe("Unauthorized");
  });

  test("Logged out successfully", async () => {
    const user = await authUtils.login(authUtils.defaultCredentials);
    const refreshCookie = authUtils.getRefreshCookie(user);

    const res = await authUtils.logout(refreshCookie);

    expect(res.statusCode).toBe(204);
  });
});

describe("Testing Forget Password API", () => {
  test("Missing Fields", async () => {
    const res = await agent.post("/api/auth/forget-password").send({
      username: "johndoe"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.Error).toBe("Email is required");
  });

  test("User Not Found", async () => {
    const res = await authUtils.forgetPassword("janedoe@gmail.com");

    expect(res.statusCode).toBe(404);
    expect(res.body.Error).toBe("User Not Found");
  });

  test("Testing forget and reset password API", async () => {
    const res = await authUtils.forgetPassword(`johndoe_${unique}@example.com`);

    expect(res.statusCode).toBe(200);
    expect(res.body.Message).toBe("Password reset link sent to your email");

    // Using nodemailer-mock to receive the email
    const sentEmails = nodemailerMock.mock.getSentMail();
    const token = extractTokenFromText(sentEmails[0].text);

    const resetPassword = await authUtils.resetPassword(token, {
      newPassword: "123456789",
      repeatPassword: "123456789"
    });

    expect(resetPassword.statusCode).toBe(201);
    expect(resetPassword.body.Message).toBe("Password has been set successfully");
  });
});

describe("Testing Reset Password API", () => {
  test("Missing Fields", async () => {
    const res = await authUtils.resetPassword("abc123", {
      newPassword: "123456789"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.Error).toBe("Password fields are required");
  });

  test("Password does not match", async () => {
    const res = await authUtils.resetPassword("abc123", {
      newPassword: "123456789",
      repeatPassword: "12345678"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.Error).toBe("Please Enter a valid password");
  });

  test("Invalid Password length", async () => {
    const res = await authUtils.resetPassword("abc123", {
      newPassword: "1234",
      repeatPassword: "1234"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.Error).toBe("Password must be at least 8 characters long");
  });

  test("Invalid Token", async () => {
    const res = await authUtils.resetPassword("abc123", {
      newPassword: "12345678",
      repeatPassword: "12345678"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.Error).toBe("Invalid Token");
  });

  test("Invalid Password", async () => {
    const res = await authUtils.forgetPassword(`johndoe_${unique}@example.com`);

    const sentEmails = nodemailerMock.mock.getSentMail();
    const token = extractTokenFromText(sentEmails[0].text);

    const resetRes = await authUtils.resetPassword(token, {
      newPassword: "123456789",
      repeatPassword: "123456789"
    });

    expect(resetRes.statusCode).toBe(400);
    expect(resetRes.body.Error).toBe("Invalid Password");
  });

  test("Testing Reset Password API", async () => {
    const res = await authUtils.forgetPassword(`johndoe_${unique}@example.com`);

    const sentEmails = nodemailerMock.mock.getSentMail();
    const token = extractTokenFromText(sentEmails[0].text);

    const resetRes = await authUtils.resetPassword(token, {
      newPassword: "12345678",
      repeatPassword: "12345678"
    });

    expect(resetRes.statusCode).toBe(201);
    expect(resetRes.body.Message).toBe("Password has been set successfully");
  });
});