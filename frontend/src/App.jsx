import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  // =====================================================
  // AUTH STATE
  // =====================================================

  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  // =====================================================
  // AUTH PAGE STATE
  // =====================================================

  const [authMode, setAuthMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // =====================================================
  // TICKET STATE
  // =====================================================

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replies, setReplies] = useState([]);

  const [reply, setReply] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // AUTH HEADERS
  // =====================================================

  const getAuthHeaders = (currentToken = token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${currentToken}`,
  });

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    setTickets([]);
    setSelectedTicket(null);
    setReplies([]);
    setReply("");

    setMessage("");
    setError("");

    setAuthMode("login");
    setAuthError("");
    setAuthSuccess("");
  };

  // =====================================================
  // SWITCH LOGIN / REGISTER
  // =====================================================

  const switchAuthMode = (mode) => {
    setAuthMode(mode);

    setName("");
    setEmail("");
    setPassword("");
    setRole("customer");

    setAuthError("");
    setAuthSuccess("");
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setAuthError("");
    setAuthSuccess("");

    if (!email.trim() || !password.trim()) {
      setAuthError("Email and password are required.");
      return;
    }

    try {
      setAuthLoading(true);

      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setAuthError(
          data.message || "Invalid email or password."
        );
        return;
      }

      const loggedInUser = data.data?.user;
      const loggedInToken = data.data?.token;

      if (!loggedInUser || !loggedInToken) {
        setAuthError("Invalid response from server.");
        return;
      }

      localStorage.setItem("token", loggedInToken);
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      setToken(loggedInToken);
      setUser(loggedInUser);

      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Login Error:", err);

      setAuthError(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setAuthError("");
    setAuthSuccess("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setAuthError(
        "Name, email and password are required."
      );
      return;
    }

    if (password.length < 6) {
      setAuthError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setAuthLoading(true);

      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setAuthError(
          data.message || "Unable to create account."
        );
        return;
      }

      const registeredUser = data.data?.user;
      const registeredToken = data.data?.token;

      if (!registeredUser || !registeredToken) {
        setAuthError(
          "Account created, but login information was not returned."
        );
        return;
      }

      // Automatically login after registration
      localStorage.setItem(
        "token",
        registeredToken
      );

      localStorage.setItem(
        "user",
        JSON.stringify(registeredUser)
      );

      setToken(registeredToken);
      setUser(registeredUser);

      setName("");
      setEmail("");
      setPassword("");
      setRole("customer");
    } catch (err) {
      console.error("Register Error:", err);

      setAuthError(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  useEffect(() => {
    if (!token) {
      return;
    }

    const getUser = async () => {
      try {
        const response = await fetch(`${API}/auth/me`, {
          headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          logout();
          return;
        }

        if (data.success && data.data?.user) {
          setUser(data.data.user);

          localStorage.setItem(
            "user",
            JSON.stringify(data.data.user)
          );
        } else {
          setError(
            data.message ||
              "Unable to fetch current user."
          );
        }
      } catch (err) {
        console.error("Get User Error:", err);
        setError("Unable to fetch user.");
      }
    };

    getUser();
  }, [token]);

  // =====================================================
  // GET TICKETS
  // =====================================================

  useEffect(() => {
    if (!token || !user?.role) {
      setLoading(false);
      return;
    }

    const getTickets = async () => {
      try {
        setLoading(true);
        setError("");

        let endpoint = "";

        if (user.role === "agent") {
          endpoint = `${API}/tickets/assigned`;
        }

        if (user.role === "customer") {
          endpoint = `${API}/tickets/my`;
        }

        if (!endpoint) {
          setError("Invalid user role.");
          return;
        }

        const response = await fetch(endpoint, {
          headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          setError(
            data.message || "Access denied."
          );
          return;
        }

        if (data.success) {
          setTickets(
            data.data?.tickets || []
          );
        } else {
          setError(
            data.message ||
              "Unable to fetch tickets."
          );
        }
      } catch (err) {
        console.error("Get Tickets Error:", err);
        setError("Unable to fetch tickets.");
      } finally {
        setLoading(false);
      }
    };

    getTickets();
  }, [token, user?.role]);

  // =====================================================
  // OPEN TICKET
  // =====================================================

  const openTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setReplies([]);
    setReply("");
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API}/replies/${ticket._id}`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setError(
          data.message || "Access denied."
        );
        return;
      }

      if (data.success) {
        setReplies(
          data.data?.replies || []
        );
      } else {
        setError(
          data.message ||
            "Unable to fetch conversation."
        );
      }
    } catch (err) {
      console.error("Get Replies Error:", err);
      setError("Unable to fetch replies.");
    }
  };

  // =====================================================
  // SEND REPLY
  // =====================================================

  const sendReply = async () => {
    if (!selectedTicket || !reply.trim()) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API}/replies/${selectedTicket._id}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            message: reply.trim(),
          }),
        }
      );

      const data = await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setError(
          data.message || "Access denied."
        );
        return;
      }

      if (data.success) {
        setMessage("Reply added successfully.");
        setReply("");

        const repliesResponse = await fetch(
          `${API}/replies/${selectedTicket._id}`,
          {
            headers: getAuthHeaders(),
          }
        );

        const repliesData =
          await repliesResponse.json();

        if (repliesData.success) {
          setReplies(
            repliesData.data?.replies || []
          );
        }
      } else {
        setError(
          data.message ||
            "Unable to add reply."
        );
      }
    } catch (err) {
      console.error("Send Reply Error:", err);
      setError("Unable to send reply.");
    }
  };

  // =====================================================
  // UPDATE TICKET STATUS
  // =====================================================

  const updateStatus = async (status) => {
    if (!selectedTicket) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API}/tickets/${selectedTicket._id}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setError(
          data.message || "Access denied."
        );
        return;
      }

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to update ticket status."
        );
        return;
      }

      const updatedTicket =
        data.data?.ticket || {
          ...selectedTicket,
          status,
        };

      setSelectedTicket(updatedTicket);

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === selectedTicket._id
            ? updatedTicket
            : ticket
        )
      );

      setMessage(
        `Ticket status updated to ${status}.`
      );
    } catch (err) {
      console.error(
        "Update Status Error:",
        err
      );

      setError(
        "Unable to update ticket status."
      );
    }
  };

  // =====================================================
  // LOGIN / REGISTER PAGE
  // =====================================================

  if (!token) {
    return (
      <div className="auth-page">

        <div className="auth-wrapper">

          {/* LEFT SIDE */}
          <div className="auth-brand-panel">

            <div className="auth-brand-logo">
              DH
            </div>

            <h1>DeskHub</h1>

            <p>
              Simple and powerful support
              ticket management.
            </p>

            <div className="brand-features">

              <div className="feature-item">
                <span>✓</span>
                <div>
                  <strong>Manage Tickets</strong>
                  <small>
                    Track and manage support requests.
                  </small>
                </div>
              </div>

              <div className="feature-item">
                <span>✓</span>
                <div>
                  <strong>Easy Communication</strong>
                  <small>
                    Reply to customers instantly.
                  </small>
                </div>
              </div>

              <div className="feature-item">
                <span>✓</span>
                <div>
                  <strong>Role Based Access</strong>
                  <small>
                    Separate customer and agent access.
                  </small>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="auth-card">

            <div className="mobile-logo">
              DH
            </div>

            <div className="auth-heading">

              <h2>
                {authMode === "login"
                  ? "Welcome back"
                  : "Create your account"}
              </h2>

              <p>
                {authMode === "login"
                  ? "Login to continue to DeskHub"
                  : "Join DeskHub and get started today"}
              </p>

            </div>

            {/* AUTH TABS */}

            <div className="auth-tabs">

              <button
                type="button"
                className={
                  authMode === "login"
                    ? "auth-tab active"
                    : "auth-tab"
                }
                onClick={() =>
                  switchAuthMode("login")
                }
              >
                Login
              </button>

              <button
                type="button"
                className={
                  authMode === "register"
                    ? "auth-tab active"
                    : "auth-tab"
                }
                onClick={() =>
                  switchAuthMode("register")
                }
              >
                Register
              </button>

            </div>

            {/* ================= LOGIN ================= */}

            {authMode === "login" ? (

              <form
                className="auth-form"
                onSubmit={handleLogin}
              >

                <div className="form-group">

                  <label htmlFor="login-email">
                    Email Address
                  </label>

                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setAuthError("");
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="login-password">
                    Password
                  </label>

                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setAuthError("");
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />

                </div>

                {authError && (
                  <div className="auth-error">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={authLoading}
                >
                  {authLoading
                    ? "Logging in..."
                    : "Login to DeskHub"}
                </button>

                <p className="auth-bottom-text">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() =>
                      switchAuthMode("register")
                    }
                  >
                    Create account
                  </button>
                </p>

              </form>

            ) : (

              /* ================= REGISTER ================= */

              <form
                className="auth-form"
                onSubmit={handleRegister}
              >

                <div className="form-group">

                  <label htmlFor="register-name">
                    Full Name
                  </label>

                  <input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setAuthError("");
                    }}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="register-email">
                    Email Address
                  </label>

                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setAuthError("");
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="register-password">
                    Password
                  </label>

                  <input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setAuthError("");
                    }}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                  />

                </div>

                {/* ROLE */}

                <div className="form-group">

                  <label>
                    Select Account Type
                  </label>

                  <div className="role-options">

                    <button
                      type="button"
                      className={
                        role === "customer"
                          ? "role-option selected"
                          : "role-option"
                      }
                      onClick={() =>
                        setRole("customer")
                      }
                    >
                      <span className="role-icon">
                        👤
                      </span>

                      <span>
                        <strong>
                          Customer
                        </strong>

                        <small>
                          Create and track tickets
                        </small>
                      </span>

                    </button>

                    <button
                      type="button"
                      className={
                        role === "agent"
                          ? "role-option selected"
                          : "role-option"
                      }
                      onClick={() =>
                        setRole("agent")
                      }
                    >
                      <span className="role-icon">
                        🛠
                      </span>

                      <span>
                        <strong>
                          Agent
                        </strong>

                        <small>
                          Manage assigned tickets
                        </small>
                      </span>

                    </button>

                  </div>

                </div>

                {authError && (
                  <div className="auth-error">
                    {authError}
                  </div>
                )}

                {authSuccess && (
                  <div className="auth-success">
                    {authSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={authLoading}
                >
                  {authLoading
                    ? "Creating account..."
                    : "Create Account"}
                </button>

                <p className="auth-bottom-text">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() =>
                      switchAuthMode("login")
                    }
                  >
                    Login
                  </button>
                </p>

              </form>

            )}

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="loading-screen">

        <div className="loader"></div>

        <h3>Loading DeskHub...</h3>

        <p>
          Please wait while we load your tickets.
        </p>

      </div>
    );
  }

  // =====================================================
  // MAIN APP
  // =====================================================

  return (
    <div className="app">

      {/* NAVBAR */}

      <header className="navbar">

        <div className="navbar-inner">

          <div className="brand">

            <div className="brand-logo">
              DH
            </div>

            <div>

              <div className="brand-name">
                DeskHub
              </div>

              <div className="brand-role">
                {user?.role === "agent"
                  ? "Support Agent"
                  : "Customer"}
              </div>

            </div>

          </div>

          <div className="user-area">

            <div className="user-info">

              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                {user?.email}
              </span>

            </div>

            <button
              className="logout-btn"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </div>

      </header>

      {/* MAIN */}

      <main className="main-container">

        {!selectedTicket ? (

          <>

            {/* DASHBOARD HEADER */}

            <div className="page-header">

              <div>

                <div className="eyebrow">
                  {user?.role === "agent"
                    ? "AGENT DASHBOARD"
                    : "CUSTOMER DASHBOARD"}
                </div>

                <h1>
                  {user?.role === "agent"
                    ? "Assigned Tickets"
                    : "My Tickets"}
                </h1>

                <p>
                  {user?.role === "agent"
                    ? "Manage and resolve tickets assigned to you."
                    : "Manage and track your support requests."}
                </p>

              </div>

            </div>

            {message && (
              <div className="success-message">
                ✓ {message}
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* STATS */}

            <div className="dashboard-stats">

              <div className="stat-card">

                <div className="stat-icon">
                  🎫
                </div>

                <div>
                  <span>Total Tickets</span>
                  <strong>{tickets.length}</strong>
                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon">
                  🟢
                </div>

                <div>
                  <span>Open / Active</span>

                  <strong>
                    {
                      tickets.filter(
                        (ticket) =>
                          !["resolved", "closed"].includes(
                            String(
                              ticket.status || ""
                            ).toLowerCase()
                          )
                      ).length
                    }
                  </strong>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon">
                  ✓
                </div>

                <div>

                  <span>Resolved</span>

                  <strong>
                    {
                      tickets.filter(
                        (ticket) =>
                          String(
                            ticket.status || ""
                          ).toLowerCase() ===
                          "resolved"
                      ).length
                    }
                  </strong>

                </div>

              </div>

            </div>

            {/* TICKET COUNT */}

            <div className="ticket-section-heading">

              <div>

                <h2>
                  {user?.role === "agent"
                    ? "Your Assigned Tickets"
                    : "Your Support Tickets"}
                </h2>

                <p>
                  {tickets.length}{" "}
                  {tickets.length === 1
                    ? "ticket"
                    : "tickets"}{" "}
                  available
                </p>

              </div>

            </div>

            {/* TICKETS */}

            {tickets.length === 0 ? (

              <div className="empty-card">

                <div className="empty-icon">
                  🎫
                </div>

                <h3>
                  {user?.role === "agent"
                    ? "No assigned tickets"
                    : "No tickets found"}
                </h3>

                <p>
                  {user?.role === "agent"
                    ? "There are currently no tickets assigned to you."
                    : "You have not created any support tickets yet."}
                </p>

              </div>

            ) : (

              <div className="tickets-list">

                {tickets.map((ticket) => {

                  const ticketStatus =
                    String(
                      ticket.status || "open"
                    ).toLowerCase();

                  return (
                    <div
                      className="ticket-card"
                      key={ticket._id}
                    >

                      <div className="ticket-top">

                        <div className="ticket-title-area">

                          <span className="ticket-label">
                            SUPPORT TICKET
                          </span>

                          <h2>
                            {ticket.title ||
                              ticket.subject ||
                              "Untitled Ticket"}
                          </h2>

                        </div>

                        <span
                          className={`status-badge ${ticketStatus}`}
                        >
                          {ticket.status ||
                            "open"}
                        </span>

                      </div>

                      <p className="ticket-description">
                        {ticket.description ||
                          "No description available."}
                      </p>

                      <div className="ticket-info">

                        <div>
                          <span>
                            Category
                          </span>

                          <strong>
                            {ticket.category ||
                              "General"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Priority
                          </span>

                          <strong>
                            {ticket.priority ||
                              "Normal"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Customer
                          </span>

                          <strong>
                            {ticket.createdBy?.name ||
                              ticket.user?.name ||
                              ticket.customer?.name ||
                              "Customer"}
                          </strong>
                        </div>

                      </div>

                      <div className="ticket-footer">

                        <span className="ticket-date">
                          {ticket.createdAt
                            ? new Date(
                                ticket.createdAt
                              ).toLocaleDateString()
                            : ""}
                        </span>

                        <button
                          className="primary-outline-btn"
                          onClick={() =>
                            openTicket(ticket)
                          }
                        >
                          View Ticket →
                        </button>

                      </div>

                    </div>
                  );
                })}

              </div>

            )}

          </>

        ) : (

          /* =================================================
             TICKET DETAIL
          ================================================= */

          <div className="ticket-detail-page">

            <button
              className="back-btn"
              onClick={() => {
                setSelectedTicket(null);
                setReplies([]);
                setReply("");
                setMessage("");
                setError("");
              }}
            >
              ← Back to{" "}
              {user?.role === "agent"
                ? "Assigned Tickets"
                : "My Tickets"}
            </button>

            {/* DETAIL CARD */}

            <div className="detail-card">

              <div className="detail-header">

                <div>

                  <span className="ticket-label">
                    SUPPORT TICKET
                  </span>

                  <h1>
                    {selectedTicket.title ||
                      selectedTicket.subject ||
                      "Untitled Ticket"}
                  </h1>

                  <p className="ticket-id">
                    Ticket ID:{" "}
                    {selectedTicket._id}
                  </p>

                </div>

                <span
                  className={`status-badge ${String(
                    selectedTicket.status ||
                      "open"
                  ).toLowerCase()}`}
                >
                  {selectedTicket.status ||
                    "open"}
                </span>

              </div>

              <div className="divider"></div>

              <section className="description-section">

                <h3>
                  Description
                </h3>

                <p>
                  {selectedTicket.description ||
                    "No description available."}
                </p>

              </section>

              <div className="divider"></div>

              <div className="details-grid">

                <div>
                  <span>
                    Category
                  </span>

                  <strong>
                    {selectedTicket.category ||
                      "General"}
                  </strong>
                </div>

                <div>
                  <span>
                    Priority
                  </span>

                  <strong>
                    {selectedTicket.priority ||
                      "Normal"}
                  </strong>
                </div>

                <div>
                  <span>
                    Created
                  </span>

                  <strong>
                    {selectedTicket.createdAt
                      ? new Date(
                          selectedTicket.createdAt
                        ).toLocaleDateString()
                      : "-"}
                  </strong>
                </div>

                <div>
                  <span>
                    Customer
                  </span>

                  <strong>
                    {selectedTicket.createdBy?.name ||
                      selectedTicket.user?.name ||
                      "Customer"}
                  </strong>
                </div>

              </div>

            </div>

            {/* STATUS */}

            {user?.role === "agent" && (
              <div className="status-card">

                <div>

                  <span className="section-label">
                    TICKET MANAGEMENT
                  </span>

                  <h2>
                    Update Ticket Status
                  </h2>

                </div>

                <div className="status-buttons">

                  <button
                    className="status-btn progress-btn"
                    onClick={() =>
                      updateStatus(
                        "in-progress"
                      )
                    }
                  >
                    In-Progress
                  </button>

                  <button
                    className="status-btn resolve-btn"
                    onClick={() =>
                      updateStatus(
                        "resolved"
                      )
                    }
                  >
                    ✓ Resolve
                  </button>

                  <button
                    className="status-btn close-btn"
                    onClick={() =>
                      updateStatus(
                        "closed"
                      )
                    }
                  >
                    Close
                  </button>

                </div>

              </div>
            )}

            {message && (
              <div className="success-message">
                ✓ {message}
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* CONVERSATION */}

            <div className="conversation-card">

              <div className="conversation-header">

                <div>

                  <span className="section-label">
                    SUPPORT CHAT
                  </span>

                  <h2>
                    Conversation
                  </h2>

                </div>

                <span className="reply-count">
                  {replies.length}{" "}
                  {replies.length === 1
                    ? "Reply"
                    : "Replies"}
                </span>

              </div>

              <div className="replies">

                {replies.length === 0 ? (

                  <div className="no-replies">

                    <div className="no-replies-icon">
                      💬
                    </div>

                    <h3>
                      No replies yet
                    </h3>

                    <p>
                      Start the conversation below.
                    </p>

                  </div>

                ) : (

                  replies.map(
                    (item, index) => (

                      <div
                        className={`reply-item ${
                          item.user?.role === "agent"
                            ? "agent-reply"
                            : "customer-reply"
                        }`}
                        key={
                          item._id ||
                          index
                        }
                      >

                        <div className="reply-header">

                          <div>

                            <strong>
                              {item.user?.name ||
                                "User"}
                            </strong>

                            <small>
                              {item.user?.role ||
                                "customer"}
                            </small>

                          </div>

                          <span>
                            {item.createdAt
                              ? new Date(
                                  item.createdAt
                                ).toLocaleString()
                              : ""}
                          </span>

                        </div>

                        <p>
                          {item.message}
                        </p>

                      </div>

                    )
                  )

                )}

              </div>

              {/* ADD REPLY */}

              <div className="reply-form">

                <div className="reply-form-heading">

                  <div>

                    <span className="section-label">
                      MESSAGE
                    </span>

                    <h3>
                      Add Reply
                    </h3>

                  </div>

                </div>

                <textarea
                  value={reply}
                  onChange={(e) =>
                    setReply(
                      e.target.value
                    )
                  }
                  placeholder="Write your reply..."
                />

                <div className="reply-form-footer">

                  <span>
                    Press the button to send
                    your message.
                  </span>

                  <button
                    className="send-btn"
                    onClick={sendReply}
                    disabled={
                      !reply.trim()
                    }
                  >
                    Send Reply →
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default App;