const User = require("../models/users");
const crypto = require("crypto");


const emailVerification = async (req, res) => {
	try {
		const { token } = req.params;

		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

		const user = await User.findOne({
			emailVerifiedToken: hashedToken,
			emailVerifyExpires: { $gt: Date.now() },
		});
		if (!user) return res.status(400).json({ Error: "Invalid or Expired token" });

		user.emailVerified = true;
		user.emailVerifiedToken = undefined;
		user.emailVerifyExpires = undefined;
		user.save();

		res.status(200).json({ Message: "User has been verified successfully" });
	} catch (error) {
		res.sendStatus(500);
		console.log(error);
	}
}

module.exports = { emailVerification };