import { useState } from "react";
import { loginUser } from "../../utils/api";

function Login({ onLogin, onRegister }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================
  // HANDLE INPUT
  // ============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // ============================
  // LOGIN
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const email = formData.email.trim();
    const password = formData.password;

    // Validation
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(email, password);

      if (!data.success || !data.data?.user || !data.data?.token) {
        setError(data.message || "Unable to login.");
        return;
      }

      const loggedInUser = data.data.user;
      const token = data.data.token;

      // Save authentication
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      // Send user to App
      if (onLogin) {
        onLogin(loggedInUser, token);
      }

      // Clear form
      setFormData({
        email: "",
        password: "",
      });
    } catch (err) {
      console.error("Login Error:", err);

      setError(
        err.message || "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          DH
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h1>Welcome back</h1>

          <p>
            Login to your DeskHub account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* Email */}
          <div className="form-group">

            <label htmlFor="login-email">
              Email Address
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
            />

          </div>

          {/* Password */}
          <div className="form-group">

            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />

          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

        </form>

        {/* Register */}
        <div className="auth-switch">

          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={onRegister}
            disabled={loading}
          >
            Create account
          </button>

        </div>

      </div>
    </div>
  );
}

export default Login;