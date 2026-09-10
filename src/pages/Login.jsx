import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user, claims, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && claims?.role) {
      const dest = claims.role === "admin" ? "/admin" : claims.role === "superadmin" ? "/superadmin" : "/teacher";
      navigate(dest, { replace: true });
    }
  }, [loading, user, claims, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(mapAuthError(err.code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-wrapper">
      <form onSubmit={handleSubmit} className="login-card">
        <h1 className="login-title">Είσοδος</h1>

        <label className="login-label">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          autoComplete="email"
        />

        <label className="login-label">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          autoComplete="current-password"
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={submitting} className="login-button">
          {submitting ? "Signing in..." : "Είσοδος"}
        </button>
      </form>
    </div>
  );
}

function mapAuthError(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again in a few minutes.";
    default:
      return "Couldn't sign in. Try again.";
  }
}