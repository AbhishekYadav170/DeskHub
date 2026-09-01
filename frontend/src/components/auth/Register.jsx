import { useState } from "react";
import { registerUser } from "../../utils/api";

function Register({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, role } = formData;

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await registerUser(
         name.trim(),
         email.trim(),
         password,
         role
        );

      if (!data.success) {
        setError(data.message || "Registration failed.");
        return;
      }

      const registeredUser = data.data?.user;
      const token = data.data?.token;

      if (!registeredUser || !token) {
        setError("Invalid registration response from server.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(registeredUser)
      );

      if (onRegister) {
        onRegister(registeredUser, token);
      }
    } catch (err) {
      console.error("Register Error:", err);

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

        <div className="logo-box">
          DH
        </div>

        <h1>Create account</h1>

        <p className="auth-subtitle">
          Create your DeskHub account
        </p>

        <form onSubmit={handleSubmit}>

          {/* NAME */}
          <div className="form-group">
            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label htmlFor="register-email">
              Email
            </label>

            <input
              id="register-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label htmlFor="register-password">
              Password
            </label>

            <input
              id="register-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
            />
          </div>

          {/* ROLE */}
          <div className="form-group">
            <label htmlFor="role">
              Account Type
            </label>

            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="customer">
                Customer
              </option>

              <option value="agent">
                Agent
              </option>
            </select>
          </div>

          {/* ERROR */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* REGISTER BUTTON */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        {/* LOGIN SWITCH */}
        <div className="auth-switch">
          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={onSwitchToLogin}
            className="auth-switch-btn"
          >
            Login
          </button>
        </div>

      </div>
    </div>
  );
}

export default Register;