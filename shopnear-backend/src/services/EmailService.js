const nodemailer = require("nodemailer");

/**
 * Email bhejne ka service — SMTP creds .env se aate hain.
 *
 * .env:
 *   EMAIL_CONFIG_HOST=smtp.gmail.com
 *   EMAIL_CONFIG_PORT=587
 *   EMAIL_CONFIG_USERNAME=...       → SMTP user (from address bhi yahi)
 *   EMAIL_CONFIG_PASSWORD=...       → gmail ho to app password
 *
 * SmsService jaisa pattern: kabhi throw nahi karta, true/false return karta hai
 * taaki calling flow kabhi na toote.
 */
module.exports = () => {
  const cfg = () => ({
    host: process.env.EMAIL_CONFIG_HOST || "",
    port: Number(process.env.EMAIL_CONFIG_PORT || 587),
    username: process.env.EMAIL_CONFIG_USERNAME || "",
    password: process.env.EMAIL_CONFIG_PASSWORD || "",
  });

  const isConfigured = () => {
    const c = cfg();
    return !!(c.host && c.username && c.password);
  };

  const getTransport = () => {
    const c = cfg();
    return nodemailer.createTransport({
      host: c.host,
      port: c.port,
      secure: c.port === 465, // 587 = STARTTLS, 465 = SSL
      auth: { user: c.username, pass: c.password },
    });
  };

  const sendMail = async ({ to, subject, html, text }) => {
    if (!isConfigured()) {
      console.log(`[EMAIL] not configured — mail to ${to} not sent`);
      return false;
    }
    try {
      const c = cfg();
      await getTransport().sendMail({
        from: `"ShopNear" <${c.username}>`,
        to,
        subject,
        html,
        text,
      });
      console.log(`[EMAIL] sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error(`[EMAIL] send failed to ${to}:`, error.message);
      return false;
    }
  };

  /**
   * Forgot-password OTP email
   */
  const sendOtpEmail = async (to, otp, name = "") => {
    return sendMail({
      to,
      subject: "ShopNear — Password Reset OTP",
      text: `Your ShopNear password reset OTP is ${otp}. It is valid for 10 minutes. Do not share it with anyone.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#f2545b">ShopNear</h2>
          <p>Hi${name ? " " + name : ""},</p>
          <p>Your password reset OTP is:</p>
          <p style="font-size:28px;font-weight:bold;letter-spacing:6px">${otp}</p>
          <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
          <p style="color:#888;font-size:12px">If you did not request this, you can ignore this email.</p>
        </div>`,
    });
  };

  return { isConfigured, sendMail, sendOtpEmail };
};
