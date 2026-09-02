const rateLimit = require("express-rate-limit");

// Applies to login/OTP-send/OTP-verify endpoints across user, seller and admin auth
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  // Successful logins count nahi hote — sirf failed/blocked attempts par
  // limit lagti hai, taaki normal users kabhi na atken
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 0, message: "too_many_attempts", data: {} },
});

module.exports = { authRateLimiter };
