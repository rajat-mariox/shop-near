const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWTSECRET = process.env.JWTSECRET;
const messages = require("./messages");

module.exports = function () {
  const resp = (response, lang, m = "success", data = {}, code = 1) => {
    return response.send({
      message: messages(lang)[m],
      data,
      code,
    });
  };

  const getErrorMessage = (errors) => {
    console.log("Helpers => getErrorMessage");

    try {
      console.log(errors);
      for (var key in errors) {
        let rule = errors[key]["rule"];

        let exists = messages()[rule];
        if (exists) return messages()[rule](key)["en"];

        return errors[key]["message"];
      }
    } catch (ex) {
      return "Something is wrong, Please try again later !!" + ex.message;
    }
  };

  const createJWT = (payload) => {
    return jwt.sign(payload, JWTSECRET, {
      // expiresIn: "30d", // expires in 30 days
    });
  };

  const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    return hash;
  };

  const randomOTP = (length = 6) => {
    const min = 10 ** (length - 1);
    return String(min + Math.floor(Math.random() * 9 * min));
  };

  /**
   * Login OTP:
   *  - SMS configured (SMS_ENABLED + creds)  → random OTP, SMS se jata hai
   *  - SMS off + MASTER_OTP_LOGIN set        → master OTP hi generate hota hai
   *  - dono nahi                              → random (console me log, dev ke liye)
   * Master OTP verify par hamesha accept hota hai jab tak env me set hai (isMasterOtp).
   */
  const generateOTP = (length = 6) => {
    const SmsService = require("../services/SmsService");
    if (SmsService().isConfigured()) return randomOTP(length);
    const master = String(process.env.MASTER_OTP_LOGIN || "").trim();
    if (master) return master;
    const otp = randomOTP(length);
    console.log("[OTP] SMS off & no MASTER_OTP_LOGIN — generated OTP:", otp);
    return otp;
  };

  const isMasterOtp = (otp) => {
    const master = String(process.env.MASTER_OTP_LOGIN || "").trim();
    return !!master && String(otp || "").trim() === master;
  };

  // Delivery OTP — hamesha random (login wale master OTP se alag),
  // sirf customer app par dikhta hai, SMS nahi jata
  const generateDeliveryOTP = (length = 4) => {
    const min = 10 ** (length - 1);
    return String(min + Math.floor(Math.random() * 9 * min));
  };

  const checkPassword = async (password, hash) => {
    console.log("Helpers => checkPassword");

    let result = await bcrypt.compare(password, hash);
    return result;
  };

  return {
    resp,
    getErrorMessage,
    createJWT,
    hashPassword,
    checkPassword,
    generateOTP,
    isMasterOtp,
    generateDeliveryOTP,
  };
};
