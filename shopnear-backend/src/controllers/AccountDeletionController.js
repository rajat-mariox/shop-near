const { v4: uuidv4 } = require("uuid");
const UserService = require("../services/UserService");
const AccountDeletionService = require("../services/AccountDeletionService");
const SmsService = require("../services/SmsService");
const helpers = require("../util/helpers.js");
const redis = require("../util/redis.js");

/**
 * Public (bina login) account deletion flow - Play Store "Delete account" URL
 * ke liye. Web page (/delete-account) se call hota hai:
 *   1. requestOtp  -> mobile par OTP, txnId wapas
 *   2. confirm     -> OTP verify, account par 7-din grace period schedule
 * Grace period / purge logic wahi hai jo app ke in-app delete me hai.
 */
module.exports = () => {
  const REDIS_TTL_SEC = 5 * 60;
  const txnKey = (txnId) => `USER_DELETE|txnId:${txnId}`;

  const requestOtp = async (req, res, next) => {
    console.log("AccountDeletionController => requestOtp");
    let { countryCode, mobileNumber } = req.body;
    countryCode = String(countryCode || "+91").trim();
    mobileNumber = String(mobileNumber || "").trim();

    const user = await UserService().fetchByQuery({
      countryCode,
      mobileNumber,
      isDeleted: { $ne: true },
    });

    if (!user) {
      req.rCode = 0;
      req.msg = "user_not_found";
      return next();
    }

    const otp = helpers().generateOTP();
    const txnId = uuidv4();
    await redis().SetRedis(
      txnKey(txnId),
      { txnId, userId: String(user._id), countryCode, mobileNumber, otp },
      REDIS_TTL_SEC
    );
    await SmsService().sendOtp(mobileNumber, otp, countryCode);

    req.rData = { txnId, alreadyRequested: !!user.deletionRequestedAt };
    req.msg = "otp_sent";
    next();
  };

  const confirm = async (req, res, next) => {
    console.log("AccountDeletionController => confirm");
    const { txnId, otp, reason } = req.body;

    const raw = await redis().GetKeyRedis(txnKey(txnId));
    if (!raw) {
      req.rCode = 0;
      req.msg = "incorrect_otp";
      return next();
    }

    const otpData = JSON.parse(raw);
    const verified =
      String(otp).trim() === String(otpData.otp) || helpers().isMasterOtp(otp);
    if (!verified) {
      req.rCode = 0;
      req.msg = "incorrect_otp";
      return next();
    }

    const user = await UserService().fetch(otpData.userId);
    if (!user || user.isDeleted) {
      req.rCode = 0;
      req.msg = "user_not_found";
      return next();
    }

    // In-app deleteAccount jaisa hi: grace period start, sessions/push invalidate
    await UserService().updateUsers(user._id, {
      deletionRequestedAt: user.deletionRequestedAt || new Date(),
      deletionReason:
        String(reason || "").slice(0, 500) || "Requested via website",
      token: null,
      deviceToken: null,
    });

    req.rData = {
      deletionScheduledAfterDays: AccountDeletionService().GRACE_PERIOD_DAYS,
    };
    req.msg = "account_deletion_scheduled";
    next();
  };

  return { requestOtp, confirm };
};
