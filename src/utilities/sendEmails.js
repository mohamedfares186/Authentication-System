const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to:email,
		subject,
		text,
	};

	await transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log("Email Interrupted", error);
			throw new Error("Email sending failed");
		};
		console.log("Email has been sent successfully", info.response);
	});
};

module.exports = { sendEmail };