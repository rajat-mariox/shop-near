import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  requestAccountDeletionOtp,
  confirmAccountDeletion,
} from "../../api/adminApi";
import PublicLayout from "./PublicLayout";

const REASONS = [
  "I don't find the app useful",
  "I found a better alternative",
  "Too many notifications",
  "Privacy concerns",
  "Other",
];

// Backend error message -> user friendly text
const friendly = (message, fallback) => {
  if (!message) return fallback;
  if (message.includes("not found"))
    return "No Aaspass account found with this mobile number.";
  if (message.includes("too many"))
    return "Too many attempts. Please try again after some time.";
  return message;
};

// Play Store "Delete account" URL: Mobile -> OTP -> Confirm -> Done (bina login)
const DeleteAccount = () => {
  const [step, setStep] = useState(1);
  const [cc] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [txnId, setTxnId] = useState(null);
  const [otp, setOtp] = useState("");
  const [reason, setReason] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { type: "err" | "ok", text }

  useEffect(() => {
    document.title = "Delete your Aaspass account";
  }, []);

  const sendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setMsg({ type: "err", text: "Please enter a valid 10-digit mobile number." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await requestAccountDeletionOtp({
        countryCode: cc,
        mobileNumber: mobile,
      });
      const d = res.data?.data;
      if (res.data?.code === 1 && d?.txnId) {
        setTxnId(d.txnId);
        setStep(2);
        if (d.alreadyRequested) {
          setMsg({
            type: "ok",
            text: "A deletion request is already pending for this account. Confirming again keeps the original schedule.",
          });
        }
      } else {
        setMsg({ type: "err", text: friendly(res.data?.message, "Could not send OTP. Please try again.") });
      }
    } catch (err) {
      setMsg({
        type: "err",
        text: friendly(err.response?.data?.message, "Network error. Please try again."),
      });
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    if (!/^\d{4,6}$/.test(otp.trim())) {
      setMsg({ type: "err", text: "Please enter the OTP you received." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await confirmAccountDeletion({
        txnId,
        otp: otp.trim(),
        reason: [reason, reasonText.trim()].filter(Boolean).join(" - "),
      });
      if (res.data?.code === 1) {
        setStep(3);
      } else {
        setMsg({ type: "err", text: friendly(res.data?.message, "Could not verify OTP. Please try again.") });
      }
    } catch (err) {
      setMsg({
        type: "err",
        text: friendly(err.response?.data?.message, "Could not verify OTP. Please try again."),
      });
    } finally {
      setBusy(false);
    }
  };

  const changeNumber = () => {
    setTxnId(null);
    setOtp("");
    setMsg(null);
    setStep(1);
  };

  return (
    <PublicLayout
      title="Delete your Aaspass account"
      subtitle="Aaspass (aaspas.app) · Android app"
      footer={
        <>
          Read our <Link to="/privacy-policy">Privacy Policy</Link>. Need help
          with your request? Contact us from the{" "}
          <strong>Help &amp; Support</strong> section in the app.
        </>
      }
    >
      <div className="pub-card">
        <h2>How to request account deletion</h2>
        <p>
          You can delete your Aaspass account either from inside the app or
          using the form on this page. Both methods delete the same data.
        </p>
        <p>
          <strong>From the app:</strong>
        </p>
        <ol>
          <li>Open the Aaspass app and log in.</li>
          <li>
            Go to <strong>My Profile</strong>.
          </li>
          <li>
            Tap <strong>Delete account</strong>, choose a reason and confirm.
          </li>
        </ol>
        <p>
          <strong>From this page:</strong> enter the mobile number registered
          with your account, verify the OTP sent to it, and confirm. No login is
          needed.
        </p>
      </div>

      <div className="pub-card">
        <h2>What happens to your data</h2>
        <p>
          Your account is scheduled for deletion immediately and you are logged
          out from all devices. There is a <strong>7-day grace period</strong>:
          if you log in again within 7 days, the deletion is cancelled and your
          account is restored. After 7 days the deletion is permanent and cannot
          be undone.
        </p>
        <table className="pub-table">
          <tbody>
            <tr>
              <td>Deleted permanently</td>
              <td>
                Name, email, date of birth, profile photo, mobile number, saved
                addresses, location, cart, wishlist, notification tokens and
                login sessions.
              </td>
            </tr>
            <tr>
              <td>Retained</td>
              <td>
                Order and payment records are kept for legal, tax (GST) and
                fraud-prevention purposes, but they are anonymised and no longer
                linked to your personal details.
              </td>
            </tr>
            <tr>
              <td>Retention period</td>
              <td>
                Personal data is removed within 7 days of the request.
                Anonymised order records are kept as required by law.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pub-card">
        <h2>Request deletion now</h2>

        {step === 1 && (
          <>
            <label className="pub-label" htmlFor="pub-mobile">
              Registered mobile number
            </label>
            <div className="pub-row">
              <select className="pub-select pub-cc" value={cc} disabled>
                <option value="+91">+91</option>
              </select>
              <input
                id="pub-mobile"
                className="pub-input"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                autoComplete="tel-national"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && sendOtp()}
              />
            </div>
            <button className="pub-btn" onClick={sendOtp} disabled={busy}>
              {busy ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="pub-sub">
              OTP sent to{" "}
              <strong>
                {cc} {mobile}
              </strong>
              . It is valid for 5 minutes.
            </p>
            <label className="pub-label" htmlFor="pub-otp">
              Enter OTP
            </label>
            <input
              id="pub-otp"
              className="pub-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit OTP"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
            <label className="pub-label" htmlFor="pub-reason">
              Reason (optional)
            </label>
            <select
              id="pub-reason"
              className="pub-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Select a reason</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <textarea
              className="pub-textarea"
              style={{ marginTop: 8 }}
              placeholder="Anything else you want to tell us (optional)"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
            />
            <div className="pub-warn">
              This will schedule your account and data for permanent deletion
              after 7 days. Log in within 7 days to cancel.
            </div>
            <button className="pub-btn" onClick={confirm} disabled={busy}>
              {busy ? "Please wait..." : "Delete my account"}
            </button>
            <button className="pub-btn ghost" onClick={changeNumber} disabled={busy}>
              Change number
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <p>
              <strong>Your deletion request has been received.</strong>
            </p>
            <p>
              Your account is now scheduled for permanent deletion in 7 days,
              and you have been logged out from all devices. If you change your
              mind, simply log in to the Aaspass app within 7 days and your
              account will be restored.
            </p>
          </>
        )}

        {msg ? <div className={`pub-msg ${msg.type}`}>{msg.text}</div> : null}
      </div>
    </PublicLayout>
  );
};

export default DeleteAccount;
