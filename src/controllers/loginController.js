import User from "../models/users.js";
import { generateRefreshToken, generateAccessToken } from "../utilities/generateTokens.js";
import bcrypt from "bcryptjs";


const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		if (!username || !password) return res.status(400).json({ Error: "Username and password are required" });

		const user = await User.findOne({ username: username });
		if (!user) return res.status(404).json({ Error: "User Not Found" });

		const match = await bcrypt.compare(password, user.password);
		if (!match) return res.status(400).json({ Error: "Invalid Credentials" });

		const refreshToken = generateRefreshToken(user);
		const accessToken = generateAccessToken(user);

		await User.updateOne(
			{ username: user.username },
			{ $set: { token: refreshToken } }
		)

		res.cookie(
			"refreshToken",
			refreshToken,
			{
				httpOnly: true,
				secure: false, // Set to true in production
				sameSite: "strict",
				maxAge: 7 * 60 * 60 * 1000,
			},
		);

		res.cookie(
			"accessToken",
			accessToken,
			{
				httpOnly: true,
				secure: false, // Set to true in production
				sameSite: "strict",
				maxAge: 15 * 60 * 1000,
			},
		);

		res.status(200).json({ Message: "Logged in successfully" });
	} catch (error) {
		res.sendStatus(500);
		console.error(error);
	}
};

export default login;