const nanoid = require("nanoid");

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const generateId = () => {
	const id = nanoid.customAlphabet(alphabet, 21);
	return id();
};

module.exports = { generateId };