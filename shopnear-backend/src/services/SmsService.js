const axios = require("axios");

/**
 * Login OTP SMS — provider env se choose hota hai. Koi extra package nahi,
 * sab axios se REST call.
 *
 * .env:
 *   SMS_ENABLED=true            → SMS bhejo (false/blank = sirf master OTP)
 *   SMS_PROVIDER=msg91          → msg91 | fast2sms | twilio
 *   SMS_API_KEY=...             → msg91 authkey / fast2sms api key / twilio Account SID
 *   SMS_AUTH_TOKEN=...          → sirf twilio (Auth Token)
 *   SMS_SENDER_ID=AASPAS        → msg91/fast2sms DLT sender id; twilio me "from" number (+1...)
 *   SMS_TEMPLATE_ID=...         → msg91 flow/template id; fast2sms DLT message id
 *
 * Master OTP (MASTER_OTP_LOGIN) SMS on/off dono me chalta hai — env se hata do
 * to band ho jata hai.
 */
module.exports = () => {
  const cfg = () => ({
    enabled: String(process.env.SMS_ENABLED || "").toLowerCase() === "true",
    provider: (process.env.SMS_PROVIDER || "msg91").toLowerCase(),
    apiKey: process.env.SMS_API_KEY || "",
    authToken: process.env.SMS_AUTH_TOKEN || "",
    senderId: process.env.SMS_SENDER_ID || "",
    templateId: process.env.SMS_TEMPLATE_ID || "",
  });

  /**
   * SMS tabhi jayega jab enabled ho aur creds maujood hon.
   */
  const isConfigured = () => {
    const c = cfg();
    if (!c.enabled || !c.apiKey) return false;
    if (c.provider === "twilio") return !!(c.authToken && c.senderId);
    if (c.provider === "msg91") return !!c.templateId;
    if (c.provider === "fast2sms") return true;
    return false;
  };

  // "+91" + "9876543210" → "919876543210"; pehle se country code laga ho to waise hi
  const normalize = (mobile, countryCode = "+91") => {
    const digits = String(mobile || "").replace(/\D/g, "");
    const cc = String(countryCode || "+91").replace(/\D/g, "") || "91";
    if (digits.length > 10) return digits;
    return cc + digits;
  };

  const sendViaMsg91 = async (to, otp, c) => {
    // https://docs.msg91.com/reference/send-sms — Flow API, DLT-verified SMS
    // template ke saath chalta hai jisme ##var1## = OTP hai (OTP-type template zaroori nahi)
    const res = await axios.post(
      "https://control.msg91.com/api/v5/flow",
      {
        template_id: c.templateId,
        sender: c.senderId || undefined,
        recipients: [{ mobiles: to, var1: String(otp) }],
      },
      { headers: { authkey: c.apiKey, "Content-Type": "application/json" }, timeout: 10000 }
    );
    if (res.data && res.data.type === "error") {
      throw new Error(res.data.message || "MSG91 error");
    }
    return res.data;
  };

  const sendViaFast2Sms = async (to, otp, c) => {
    // https://docs.fast2sms.com — OTP route (DLT approved) ya plain "otp" route
    const params = c.templateId
      ? {
          route: "dlt",
          sender_id: c.senderId,
          message: c.templateId,
          variables_values: otp,
          numbers: to.slice(-10),
        }
      : { route: "otp", variables_values: otp, numbers: to.slice(-10) };
    const res = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
      params,
      headers: { authorization: c.apiKey },
      timeout: 10000,
    });
    if (!res.data || res.data.return !== true) {
      throw new Error((res.data && res.data.message) || "Fast2SMS error");
    }
    return res.data;
  };

  const sendViaTwilio = async (to, otp, c) => {
    const body = new URLSearchParams({
      To: "+" + to,
      From: c.senderId,
      Body: `${otp} is your Aas Pass login OTP. Do not share it with anyone.`,
    });
    const res = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${c.apiKey}/Messages.json`,
      body.toString(),
      {
        auth: { username: c.apiKey, password: c.authToken },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 10000,
      }
    );
    return res.data;
  };

  /**
   * OTP SMS bhejo. Kabhi throw nahi karta — login flow nahi tootna chahiye
   * (master OTP fallback hamesha available hai). Return: true/false.
   */
  const sendOtp = async (mobile, otp, countryCode = "+91") => {
    const c = cfg();
    if (!isConfigured()) {
      console.log(`[SMS] disabled/not configured — OTP for ${mobile} not sent (use MASTER_OTP_LOGIN)`);
      return false;
    }
    const to = normalize(mobile, countryCode);
    try {
      if (c.provider === "msg91") await sendViaMsg91(to, otp, c);
      else if (c.provider === "fast2sms") await sendViaFast2Sms(to, otp, c);
      else if (c.provider === "twilio") await sendViaTwilio(to, otp, c);
      else throw new Error(`Unknown SMS_PROVIDER "${c.provider}"`);
      console.log(`[SMS] OTP sent to ${to} via ${c.provider}`);
      return true;
    } catch (error) {
      const detail =
        (error.response && JSON.stringify(error.response.data).slice(0, 300)) || error.message;
      console.error(`[SMS] send failed (${c.provider}) to ${to}:`, detail);
      return false;
    }
  };

  return { isConfigured, sendOtp };
};
