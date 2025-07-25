require("dotenv").config();
const User = require("../models/users");
const bcrypt = require("bcryptjs");
const generateTokens = require("../utilities/generateTokens");
const emails = require("../utilities/sendEmails");


// Controller
const register = async (req, res) => {
	try {
		const {
			firstName,
			lastName,
			email,
			username,
			password,
			repeatPassword,
			dateOfBirth,
			} = req.body;

	    if (
	      !firstName ||
	      !lastName ||
	      !email ||
	      !username ||
	      !password ||
	      !repeatPassword ||
	      !dateOfBirth
	    ) return res.status(400).json({ Error: "Please enter valid data" });

	    if (password.length < 8) return res.status(400).json({ Error: "Password must be at least 8 characters long" });
		if (password !== repeatPassword) return res.status(400).json({ Error: "Please Repeat password correctly" });

		const exists = await User.findOne({ username: username });
		if (exists) return res.status(409).json({ Error: "Invalid Credentials" });

		const passwordHash = await bcrypt.hash(repeatPassword, 10);

		const { token, hashedToken } = generateTokens.generateToken();

		const user = new User({
			firstName: firstName,
			lastName: lastName,
			email: email,
			username: username,
			password: passwordHash,
			emailVerifiedToken: hashedToken,
			emailVerifyExpires: Date.now() + 24 * 60 * 60 * 1000,
			dateOfBirth: dateOfBirth,
		});

		await user.save();

		const verifyLink = `http://localhost:${process.env.PORT || 8080}/api/auth/verify-email/${token}`;

		await emails.sendEmail(
			user.email,
			"Verify your Email",
			`${verifyLink}`
		);

		res
		.status(201)
		.json({ Message: "Registered successfully, Please Verify your email" });

	} catch (error) {
		res.sendStatus(500);
		console.error(error);
	}
};

module.exports = { register };