import User from "../models/users.js";

const logout = async (req, res) => {
	try {
		const cookies = req.cookies;
		if (!cookies?.refreshToken) return res.status(401).json({ Error: "Unauthorized" });

		const token = cookies.refreshToken;
		await User.updateOne(
			{ token: token }, 
			{ $set: { token: "" }},
		);

		res.clearCookie("accessToken", {
			httpOnly: true,
			secure: false, // Set to true in production
			sameSite: "strict",
	    });

	    res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: false, // Set to true in production
			sameSite: "strict",
	    });

    	res.status(204).json({ Message: "Logged out successfully" });
	} catch (error) {
		res.sendStatus(500);
		console.error(error);
	}
};

export default logout;