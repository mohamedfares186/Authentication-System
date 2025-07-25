const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { accessTokenSecret, refreshTokenSecret } = require("../config/jwt");

const generateRefreshToken = (user) => {
	const token = jwt.sign(
		{ username: user.username, role: user.role },
		refreshTokenSecret,
		{ expiresIn: "7d" }
	);
	return token;
};

const generateAccessToken = (user) => {
	const token = jwt.sign(
		{ _id: user._id, username: user.username, role: user.role },
		accessTokenSecret,
		{expiresIn: "15m"}
	);
	return token;
};

const generateToken = () => {
	const token = crypto.randomBytes(32).toString("hex");
	const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
	return { token, hashedToken };
};

module.exports = {
	generateRefreshToken,
	generateAccessToken,
	generateToken,
};