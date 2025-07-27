require("dotenv").config();
const resquest = require("supertest");
const app = require("../app");
const agent = resquest.agent(app);
const mongoose = require("mongoose");
const nodemailerMock = require("nodemailer-mock");


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

describe("Testing Register Controller", () => {
	test("Missing User Input", async () => {
		const res = await agent.post("/api/auth/register")
		.send({
			"firstName": "john",
			"lastName": "doe",
		});

		expect(res.statusCode).toBe(400);
		expect(res.body.Error).toBe("Please enter valid data");
	});

	test("Password invalid length", async () => {
		const res = await agent.post("/api/auth/register")
		.send({
			"firstName": "john",
			"lastName": "doe",
			"email": "johndoe@gmail.com",
			"username": "johndoe",
			"password": "1234",
			"repeatPassword": "1234",
			"dateOfBirth": "1-1-2000"
		});

		expect(res.statusCode).toBe(400);
		expect(res.body.Error).toBe("Password must be at least 8 characters long");		
	});

	test("Password does not match", async () => {
		const res = await agent.post("/api/auth/register")
		.send({
			"firstName": "john",
			"lastName": "doe",
			"email": "johndoe@gmail.com",
			"username": "johndoe",
			"password": "12345678",
			"repeatPassword": "123456789",
			"dateOfBirth": "1-1-2000"
		});

		expect(res.statusCode).toBe(400);
		expect(res.body.Error).toBe("Please Repeat password correctly");		
	});

	test("Registered successfully, and verifying email", async () => {
		const res = await agent.post("/api/auth/register")
		.send({
			"firstName": "john",
			"lastName": "doe",
			"email": "johndoe@gmail.com",
			"username": "johndoe",
			"password": "12345678",
			"repeatPassword": "12345678",
			"dateOfBirth": "1-1-2000"
		});

		expect(res.statusCode).toBe(201);
		expect(res.body.Message).toBe("Registered successfully, Please Verify your email");

		// using nodemailer-mock to recieve the email
		const sentEmails = nodemailerMock.mock.getSentMail();
		const token = extractTokenFromText(sentEmails[0].text);

		const verifyRes = await agent.get(`/api/auth/verify-email/${token}`);

		expect(verifyRes.statusCode).toBe(200);
		expect(verifyRes.body.Message).toBe("User has been verified successfully");
	});

	test("User already exists", async () => {
		const res = await agent.post("/api/auth/register")
		.send({
			"firstName": "john",
			"lastName": "doe",
			"email": "johndoe@gmail.com",
			"username": "johndoe",
			"password": "12345678",
			"repeatPassword": "12345678",
			"dateOfBirth": "1-1-2000"
		});

		expect(res.statusCode).toBe(409);
		expect(res.body.Error).toBe("Invalid Credentials");		
	});
});

describe("Testing Email Verification Error status code", () => {
	test("Invalid or expired token", async () => {
		const res = await agent.get("/api/auth/verify-email/abc123");

		expect(res.statusCode).toBe(400);
		expect(res.body.Error).toBe("Invalid or Expired token");
	});
});

describe("Testing Login", () => {
	test("Missing Fields", async () => {
		const res = await agent.post("/api/auth/login")
		.send({
			"username": "johndoe"
		});

		expect(res.statusCode).toBe(400);
		expect(res.body.Error).toBe("Username and password are required")
	});

	test("User Not Found", async () => {
		const res = await agent.post("/api/auth/login")
		.send({
			"username": "janedoe",
			"password": "12345678"
		});

		expect(res.statusCode).toBe(404);
		expect(res.body.Error).toBe("User Not Found");
	});

	test("Wrong Password", async () => {
		const res = await agent.post("/api/auth/login")
		.send({
			"username": "johndoe",
			"password": "123456789"
		});

		expect(res.statusCode).toBe(400);
		expect(res.body.Error).toBe("Invalid Credentials");
	});

	test("Logged in successfully", async () => {
		const res = await agent.post("/api/auth/login")
		.send({
			"username": "johndoe",
			"password": "12345678"
		});

		expect(res.statusCode).toBe(200);
		expect(res.body.Message).toBe("Logged in successfully")
	});
});

describe("Testing Refresh API", () => {
	test("No cookies", async () => {
		const user = await agent.post("/api/auth/logout");

		const res = await agent.get("/api/auth/refresh");

		expect(res.statusCode).toBe(401);
		expect(res.body.Error).toBe("Unauthorized");
	});

	test("User Not Found in the cookies", async () => {
		const user = await agent.post("/api/auth/login")
		.send({
			"username": "johndoe",
			"password": "12345678"
		});

		const userLogout = await agent.post("/api/auth/logout");

		const userCookies = user.header['set-cookie'];;

		const res = await agent.get("/api/auth/refresh")
		.set("cookie", userCookies);

		expect(res.statusCode).toBe(404);
		expect(res.body.Error).toBe("User Not Found");
	});

	test("Seccessfully created a refresh token", async () => {
		const user = await agent.post("/api/auth/login")
		.send({
			"username": "johndoe",
			"password": "12345678"
		});

		const userCookies = user.header['set-cookie'];
		const refreshCookie = userCookies.find(cookie => cookie.startsWith("refreshToken="));

		const res = await agent.get("/api/auth/refresh")
		.set("cookie", refreshCookie);

		expect(res.statusCode).toBe(201);
		expect(res.body.Message).toBe("Refresh Token has been created successfully");
	});
});

describe("Testing logout", () => {
	test("No cookie", async () => {
		const userLogout = await agent.post("/api/auth/logout");

		const res = await agent.post("/api/auth/logout");

		expect(res.statusCode).toBe(401);
		expect(res.body.Error).toBe("Unauthorized");
	});

	test("Logged out successfully", async () => {
		const user = await agent.post("/api/auth/login")
		.send({
			"username": "johndoe",
			"password": "12345678"
		});

		const userCookies = user.header['set-cookie'];
		const refreshCookie = userCookies.find(cookie => cookie.startsWith("refreshToken="));

		const res = await agent.post("/api/auth/logout")
		.set("cookie", refreshCookie);

		expect(res.statusCode).toBe(204);
	});
});

describe("Testing Forget Password API", () => {
	test("Missing Fields", async () => {
		const res = await agent.post("/api/auth/forget-password")
		.send({
			"username": "johndoe"
		});

		expect(res.statusCode).toBe(400);
		expect(res.body.Error).toBe("Email is required");
	});

	test("User Not Found", async () => {
		const res = await agent.post("/api/auth/forget-password")
		.send({
			"email": "janedoe@gmail.com"
		});

		expect(res.statusCode).toBe(404);
		expect(res.body.Error).toBe("User Not Found");
	});

	test("Testing forget and reset password API", async () => {
		const res = await agent.post("/api/auth/forget-password")
		.send({
			"email": "johndoe@gmail.com"
		});

		expect(res.statusCode).toBe(200);
		expect(res.body.Message).toBe("Password reset link sent to your email");

		// Using nodemailer-mock to recieve the email
		const sentEmails = nodemailerMock.mock.getSentMail();
		const token = extractTokenFromText(sentEmails[0].text);

		const resetPassword = await agent.post(`/api/auth/reset-password/${token}`)
		.send({
			"newPassword": "123456789",
			"repeatPassword": "123456789"
		});

		expect(resetPassword.statusCode).toBe(201);
		expect(resetPassword.body.Message).toBe("Password has been set successfully");
	});
});

describe("Testing Reset Password API", () => {
	test("Missing Fields", async () => {
		const res = await agent.post("/api/auth/reset-password/abc123")
		.send({
			"newPassword": "123456789"
		});

		expect(res.statusCode).toBe(400);
		expect(res.body.Error).toBe("Password fields are required");
	});

	test("Password does not match", async () => {
		const res = await agent.post("/api/auth/reset-password/abc123")
		.send({
			"newPassword": "123456789",
			"repeatPassword": "12345678"
		});

		expect(res.statusCode).toBe(400);
		expect(res.body.Error).toBe("Please Enter a valid password");
	});

	test("Invalid Password length", async () => {
		const res = await agent.post("/api/auth/reset-password/abc123")
		.send({
			"newPassword": "1234",
			"repeatPassword": "1234"
		});

		expect(res.statusCode).toBe(400);
		expect(res.body.Error).toBe("Password must be at least 8 characters long");
	});

	test("Invalid Token", async () => {
		const res = await agent.post("/api/auth/reset-password/abc123")
		.send({
			"newPassword": "12345678",
			"repeatPassword": "12345678"
		});

		expect(res.statusCode).toBe(400);
		expect(res.body.Error).toBe("Invalid Token");
	})

	test("Invalid Password", async () => {
		const res = await agent.post("/api/auth/forget-password")
		.send({
			"email": "johndoe@gmail.com"
		});

		const sentEmails = nodemailerMock.mock.getSentMail();
		const token = extractTokenFromText(sentEmails[0].text);

		const resetRes = await agent.post(`/api/auth/reset-password/${token}`)
		.send({
			"newPassword": "123456789",
			"repeatPassword": "123456789"
		});

		expect(resetRes.statusCode).toBe(400);
		expect(resetRes.body.Error).toBe("Invalid Password");
	});

	test("Testing Reset Password API", async () => {
		const res = await agent.post("/api/auth/forget-password")
		.send({
			"email": "johndoe@gmail.com"
		});

		const sentEmails = nodemailerMock.mock.getSentMail();
		const token = extractTokenFromText(sentEmails[0].text);

		const resetRes = await agent.post(`/api/auth/reset-password/${token}`)
		.send({
			"newPassword": "12345678",
			"repeatPassword": "12345678"
		});

		expect(resetRes.statusCode).toBe(201);
		expect(resetRes.body.Message).toBe("Password has been set successfully");
	});
});