import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  sellerLogin,
  sellerVerifyOtp,
  getSellerProfile,
} from "../../api/sellerApi";
import useAuthStore from "../../store/authStore";
import AuthLayout from "../Onboarding/AuthLayout";

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // login | signup
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [txnId, setTxnId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setInfo("");
  };

  const handleSendOtp = async () => {
    if (!mobile || mobile.length < 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setSending(true);
    try {
      const res = await sellerLogin(mobile);
      const data = res.data?.data || res.data;
      setTxnId(data.txnId || data.transactionId || "");
      setOtpSent(true);
      setInfo(`OTP sent to +91 ${mobile}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      setError("Please request an OTP first");
      return;
    }
    if (!otp || otp.length < 4) {
      setError("Enter a valid OTP");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await sellerVerifyOtp(mobile, otp, txnId);
      const code = res.data?.code;
      const data = res.data?.data || {};

      if (code === 2) {
        // Seller exists but is not approved yet — continue onboarding flow
        localStorage.setItem("sellerToken", data.token);
        if (data.status === "pending_profile") {
          navigate("/onboarding", { state: { email } });
        } else {
          // pending_approval / rejected → waiting screen
          navigate("/verification");
        }
        return;
      }

      // Approved seller → normal login
      const token = data.token || data.accessToken;
      localStorage.setItem("sellerToken", token);
      let sellerData = data.seller || data.user || data;
      try {
        const profileRes = await getSellerProfile();
        sellerData = profileRes.data?.data || profileRes.data;
      } catch {
        // use data from verify-otp response
      }
      login(token, sellerData);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const actions = (
    <>
      <button
        className="ob-btn-outline"
        onClick={() => switchMode(mode === "login" ? "signup" : "login")}
      >
        {mode === "login" ? "Not a User?" : "Already a User?"}
      </button>
      <button className="ob-btn-fill" onClick={() => switchMode("signup")}>
        Create Account
      </button>
    </>
  );

  return (
    <AuthLayout actions={actions}>
      <form className="ob-login-card" onSubmit={handleSubmit}>
        <h2 className="ob-card-title">Welcome to ShopNear</h2>
        <p className="ob-card-sub">Create your account to start selling</p>

        {error && <div className="ob-error">{error}</div>}
        {!error && info && <div className="ob-info">{info}</div>}

        <div className="ob-field">
          <label>Phone Number</label>
          <div className="ob-otp-row">
            <input
              className="ob-input"
              type="tel"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              placeholder="+ 91"
            />
            <button
              type="button"
              className="ob-sendotp-btn"
              disabled={sending}
              onClick={handleSendOtp}
            >
              {sending ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
            </button>
          </div>
        </div>

        <div className="ob-field">
          <label>OTP*</label>
          <input
            className="ob-input"
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        {mode === "signup" && (
          <div className="ob-field">
            <label>Email</label>
            <input
              className="ob-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}

        <button className="ob-primary-btn" type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
}
