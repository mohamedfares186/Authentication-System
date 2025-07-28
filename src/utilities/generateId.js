import { customAlphabet } from "nanoid";

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const generateId = () => {
	const id = customAlphabet(alphabet, 21);
	return id();
};


export default generateId;