const expressRateLimit = require("express-rate-limit");

const limitAccess = expressRateLimit({
  windowMs: 60 * 1000,
  limit: 150,
});

module.exports = limitAccess;