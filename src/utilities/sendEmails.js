import "dotenv/config";
import nodemailer from "nodemailer";

const sendEmail = async (email, subject, text) => {
	const transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
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

export default sendEmail;