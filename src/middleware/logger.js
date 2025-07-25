const logger = (req, res, next) => {
	const { method, hostname, originalUrl } = req;
	const time = new Date().toISOString();
	const startTime = Date.now();

	res.on("finish", () => {
		const endTime = Date.now();
		const duration = endTime - startTime;
		const { statusCode } = res;
		console.log(`[${time}] ${method} ${hostname}:${process.env.PORT}${originalUrl} - ${statusCode} | ${duration}ms`);
	});

	next();
}

module.exports = logger;