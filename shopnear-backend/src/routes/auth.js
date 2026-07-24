const express = require("express");
const authRouter = express.Router();
const AuthValidator = require("../validators/AuthValidator");
const AuthController = require("../controllers/AuthController");
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const { authRateLimiter } = require("../middlewares/RateLimitMiddleware");
// const UserController = require("../controllers/UserController");

authRouter.post(
  "/login",
  authRateLimiter,
  AuthValidator().validateLogin,
  ErrorHandlerMiddleware(AuthController().login),
  ResponseMiddleware
);

authRouter.post(
  "/verifyOtp",
  authRateLimiter,
  AuthValidator().validateOtp,
  ErrorHandlerMiddleware(AuthController().verifyOtp),
  ResponseMiddleware
);

authRouter.put(
  "/resendOtp",
  authRateLimiter,
  AuthValidator().validateLogin,
  ErrorHandlerMiddleware(AuthController().resendOtp),
  ResponseMiddleware
);

// authRouter.put(
//   "/updateDeviceToken",
//   AuthMiddleware().verifyUserToken,
//   ErrorHandlerMiddleware(UserController().updateDeviceToken),
//   ResponseMiddleware
// );

// authRouter.get(
//   "/logout",
//   AuthMiddleware().verifyUserToken,
//   ErrorHandlerMiddleware(AuthController().logout),
//   ResponseMiddleware
// );

module.exports = authRouter;
