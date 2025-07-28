import User from "../models/users.js";
import jsonwebtoken from "jsonwebtoken";
import { refreshTokenSecret } from "../config/jwt.js";
import { generateAccessToken } from "../utilities/generateTokens.js";

const refresh = async (req, res) => {
	try {
		const cookies = req.cookies;
		if (!cookies?.refreshToken) return res.status(401).json({ Error: "Unauthorized" });

		const token = cookies.refreshToken;
		const user = await User.findOne({ token: token });
		if (!user) return res.status(404).json({ Error: "User Not Found" });

		jsonwebtoken.verify(token, refreshTokenSecret, (err, decoded) => {
			if (err) return res.status(403).json({ Error: "Access Denied" });
			const accessToken = generateAccessToken(decoded);
				res.cookie("accessToken", accessToken, {
		        httpOnly: true,
		        secure: false, // Set to true in Production
		        sameSite: "strict",
		        maxAge: 15 * 60 * 1000,
      		});
		});
		res.status(201).json({ Message: "Refresh Token has been created successfully" });
	} catch (error) {
		res.sendStatus(500);
		console.error(error);
	}
};

export default refresh;