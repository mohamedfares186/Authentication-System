// eslint-disable-next-line no-unused-vars
const errorHandling = (err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const message = err.message;
	const stack = err.stack;

	console.error(`${statusCode} - ${message}`);
	console.error(`${stack}`);

	res.sendStatus(statusCode);
}

export default errorHandling;