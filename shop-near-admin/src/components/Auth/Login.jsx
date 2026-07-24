import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../api/adminApi";
import useAuthStore from "../../store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await adminLogin(email, password);
      const body = res.data;
      if (body.code === 0 || !body.data?.token) {
        setError(body.message || "Login failed. Check your credentials.");
        return;
      }
      const { token, admin } = body.data;
      login(token, admin);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <div style={styles.logo}>
          <img src="/newLogo.jpeg" alt="ShopNear" style={styles.logoImage} />
        </div>
        <h2 style={styles.title}>Admin Login</h2>
        <p style={styles.subtitle}>Sign in to your admin panel</p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@shopnear.com"
          style={styles.input}
          autoFocus
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="........"
          style={styles.input}
        />

        <button
          type="submit"
          style={{
            ...styles.btn,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f7f7fa",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "48px 40px",
    width: 400,
    maxWidth: "90vw",
    boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    marginBottom: 24,
    justifyContent: "center",
  },
  logoImage: {
    width: 170,
    maxWidth: "100%",
    height: 60,
    objectFit: "contain",
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: 700,
    color: "#222",
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
    color: "#888",
    fontSize: 14,
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#444",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1.5px solid #ececec",
    borderRadius: 10,
    fontSize: 15,
    outline: "none",
    background: "#f7f7fa",
    boxSizing: "border-box",
  },
  btn: {
    marginTop: 28,
    padding: "13px 0",
    background: "#FF6051",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  error: {
    background: "#fff0f0",
    color: "#e53e3e",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 8,
  },
};
