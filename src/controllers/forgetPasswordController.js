const User = require("../models/users");
const generateTokens = require("../utilities/generateTokens");
const emails = require("../utilities/sendEmails");

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ Error: "Email is required" });

    const user = await User.findOne({ email: email });
    if (!user) return res.status(404).json({ Error: "User Not Found" });

    const { token, hashedToken } = generateTokens.generateToken();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.save();
    const resetLink = `http://localhost:${process.env.PORT || 8080}/api/auth/reset-password/${token}`;
    await emails.sendEmail(
      email,
      "Password Reset",
      `Click the link to reset your password ${resetLink}`
    );

    res.status(200).json({ Message: "Password reset link sent to your email" });
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
};

module.exports = { forgetPassword };