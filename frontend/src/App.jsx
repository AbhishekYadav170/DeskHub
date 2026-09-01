import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  // =====================================================
  // AUTH STATE
  // =====================================================

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  // =====================================================
  // AUTH FORM
  // =====================================================

  const [authMode, setAuthMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // =====================================================
  // TICKETS
  // =====================================================

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // CREATE TICKET
  // =====================================================

  const [showCreateTicket, setShowCreateTicket] = useState(false);

  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketCategory, setTicketCategory] = useState("general");
  const [ticketPriority, setTicketPriority] = useState("medium");

  const [createTicketLoading, setCreateTicketLoading] = useState(false);
  const [createTicketError, setCreateTicketError] = useState("");

  // =====================================================
  // REPLIES
  // =====================================================

  const [replies, setReplies] = useState([]);
  const [reply, setReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

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
    setAuthError("");

    setName("");
    setEmail("");
    setPassword("");
    setRole("customer");

    setAuthMode("login");
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setAuthError("");
    setMessage("");
    setError("");

    if (!email.trim() || !password.trim()) {
      setAuthError("Email and password are required");
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
        setAuthError(data.message || "Invalid email or password");
        return;
      }

      const loggedInUser = data.data?.user;
      const loggedInToken = data.data?.token;

      if (!loggedInToken || !loggedInUser) {
        setAuthError("Invalid login response from server");
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
    setMessage("");
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setAuthError(
        "Name, email and password are required"
      );
      return;
    }

    if (password.length < 6) {
      setAuthError(
        "Password must be at least 6 characters"
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
          data.message || "Unable to register"
        );
        return;
      }

      const registeredUser = data.data?.user;
      const registeredToken = data.data?.token;

      if (!registeredUser || !registeredToken) {
        setAuthError(
          "Invalid registration response from server"
        );
        return;
      }

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
            data.message || "Unable to fetch current user"
          );
        }
      } catch (err) {
        console.error("Get User Error:", err);
        setError("Unable to fetch user");
      }
    };

    getUser();

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        // Customer -> own tickets
        if (user.role === "customer") {
          endpoint = `${API}/tickets/my`;
        }

        // Agent -> ALL tickets
        // This is important because new/unassigned
        // tickets must also appear to the agent.
        if (user.role === "agent") {
          endpoint = `${API}/tickets`;
        }

        if (!endpoint) {
          setError("Invalid user role");
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
            data.message || "Access denied"
          );
          return;
        }

        if (data.success) {
          setTickets(data.data?.tickets || []);
        } else {
          setError(
            data.message || "Unable to fetch tickets"
          );
        }
      } catch (err) {
        console.error("Get Tickets Error:", err);
        setError("Unable to fetch tickets");
      } finally {
        setLoading(false);
      }
    };

    getTickets();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role]);

  // =====================================================
  // CREATE TICKET
  // =====================================================

  const handleCreateTicket = async (e) => {
    e.preventDefault();

    setCreateTicketError("");
    setMessage("");
    setError("");

    if (
      !ticketTitle.trim() ||
      !ticketDescription.trim()
    ) {
      setCreateTicketError(
        "Title and description are required"
      );
      return;
    }

    if (ticketTitle.trim().length < 3) {
      setCreateTicketError(
        "Title must be at least 3 characters"
      );
      return;
    }

    if (ticketDescription.trim().length < 10) {
      setCreateTicketError(
        "Description must be at least 10 characters"
      );
      return;
    }

    try {
      setCreateTicketLoading(true);

      const response = await fetch(`${API}/tickets`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: ticketTitle.trim(),
          description: ticketDescription.trim(),
          category: ticketCategory,
          priority: ticketPriority,
        }),
      });

      const data = await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setCreateTicketError(
          data.message || "Access denied"
        );
        return;
      }

      if (!response.ok || !data.success) {
        setCreateTicketError(
          data.message || "Unable to create ticket"
        );
        return;
      }

      const newTicket = data.data?.ticket;

      if (newTicket) {
        setTickets((prev) => [
          newTicket,
          ...prev,
        ]);
      }

      setTicketTitle("");
      setTicketDescription("");
      setTicketCategory("general");
      setTicketPriority("medium");

      setShowCreateTicket(false);

      setMessage(
        "Ticket created successfully. Status: OPEN"
      );
    } catch (err) {
      console.error(
        "Create Ticket Error:",
        err
      );

      setCreateTicketError(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setCreateTicketLoading(false);
    }
  };

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
          data.message || "Access denied"
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
            "Unable to fetch replies"
        );
      }
    } catch (err) {
      console.error(
        "Get Replies Error:",
        err
      );

      setError(
        "Unable to fetch replies"
      );
    }
  };

  // =====================================================
  // ASSIGN TICKET TO CURRENT AGENT
  // =====================================================

  const assignTicketToMe = async () => {
    if (!selectedTicket) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API}/tickets/${selectedTicket._id}/assign`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setError(
          data.message || "Access denied"
        );
        return;
      }

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to assign ticket"
        );
        return;
      }

      const updatedTicket =
        data.data?.ticket;

      if (updatedTicket) {
        setSelectedTicket(updatedTicket);

        setTickets((prev) =>
          prev.map((item) =>
            item._id === updatedTicket._id
              ? updatedTicket
              : item
          )
        );
      }

      setMessage(
        "Ticket assigned to you. Status: IN-PROGRESS"
      );
    } catch (err) {
      console.error(
        "Assign Ticket Error:",
        err
      );

      setError(
        "Unable to assign ticket"
      );
    }
  };

  // =====================================================
  // SEND REPLY
  // =====================================================

  const sendReply = async () => {
    if (!selectedTicket) {
      return;
    }

    if (!reply.trim()) {
      return;
    }

    // Closed ticket cannot receive reply
    if (selectedTicket.status === "closed") {
      setError(
        "Cannot reply to a closed ticket"
      );
      return;
    }

    // Resolved customer should reopen first
    if (
      user?.role === "customer" &&
      selectedTicket.status === "resolved"
    ) {
      setError(
        "Please reopen the ticket before replying"
      );
      return;
    }

    // Agent should be assigned before replying
    if (
      user?.role === "agent" &&
      selectedTicket.assignedTo &&
      String(
        selectedTicket.assignedTo._id ||
          selectedTicket.assignedTo
      ) !== String(user.id)
    ) {
      setError(
        "You can only reply to tickets assigned to you"
      );
      return;
    }

    setMessage("");
    setError("");

    try {
      setReplyLoading(true);

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
          data.message || "Access denied"
        );
        return;
      }

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to add reply"
        );
        return;
      }

      setReply("");

      setMessage(
        "Reply added successfully"
      );

      const repliesResponse =
        await fetch(
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
    } catch (err) {
      console.error(
        "Send Reply Error:",
        err
      );

      setError(
        "Unable to send reply"
      );
    } finally {
      setReplyLoading(false);
    }
  };

  // =====================================================
  // UPDATE STATUS
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
          data.message || "Access denied"
        );
        return;
      }

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to update ticket status"
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
        `Ticket status updated to ${status.toUpperCase()}`
      );
    } catch (err) {
      console.error(
        "Update Status Error:",
        err
      );

      setError(
        "Unable to update ticket status"
      );
    }
  };

  // =====================================================
  // REOPEN TICKET
  // =====================================================

  const reopenTicket = async () => {
    if (!selectedTicket) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API}/tickets/${selectedTicket._id}/reopen`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setError(
          data.message || "Access denied"
        );
        return;
      }

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to reopen ticket"
        );
        return;
      }

      const updatedTicket =
        data.data?.ticket || {
          ...selectedTicket,
          status: "in-progress",
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
        "Ticket reopened. Status: IN-PROGRESS"
      );
    } catch (err) {
      console.error(
        "Reopen Ticket Error:",
        err
      );

      setError(
        "Unable to reopen ticket"
      );
    }
  };

  // =====================================================
  // CLOSE DETAIL
  // =====================================================

  const closeTicketDetail = () => {
    setSelectedTicket(null);
    setReplies([]);
    setReply("");
    setMessage("");
    setError("");
  };

  // =====================================================
  // AUTH PAGE
  // =====================================================

  if (!token) {
    return (
      <div className="auth-page">

        <div className="auth-card">

          <div className="logo-box">
            DH
          </div>

          <h1>
            {authMode === "login"
              ? "Welcome back"
              : "Create your account"}
          </h1>

          <p className="auth-subtitle">
            {authMode === "login"
              ? "Login to your DeskHub account"
              : "Register to use DeskHub support"}
          </p>

          {authMode === "login" ? (

            <form onSubmit={handleLogin}>

              <div className="form-group">
                <label htmlFor="login-email">
                  Email
                </label>

                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setAuthError("");
                  }}
                  placeholder="Enter your email"
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
                className="login-btn"
                disabled={authLoading}
              >
                {authLoading
                  ? "Logging in..."
                  : "Login"}
              </button>

              <div className="auth-switch">
                <span>
                  Don't have an account?
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                  }}
                >
                  Register
                </button>
              </div>

            </form>

          ) : (

            <form onSubmit={handleRegister}>

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
                  Email
                </label>

                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setAuthError("");
                  }}
                  placeholder="Enter your email"
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

              <div className="form-group">
                <label htmlFor="register-role">
                  Register As
                </label>

                <select
                  id="register-role"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                >
                  <option value="customer">
                    Customer
                  </option>

                  <option value="agent">
                    Agent
                  </option>
                </select>
              </div>

              {authError && (
                <div className="auth-error">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="login-btn"
                disabled={authLoading}
              >
                {authLoading
                  ? "Creating account..."
                  : "Create Account"}
              </button>

              <div className="auth-switch">
                <span>
                  Already have an account?
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                  }}
                >
                  Login
                </button>
              </div>

            </form>
          )}

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

        <p>
          Loading DeskHub...
        </p>

      </div>
    );
  }

  // =====================================================
  // MAIN APP
  // =====================================================

  return (
    <div className="app">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="navbar">

        <div className="navbar-inner">

          <div className="brand">

            <div className="brand-name">
              DeskHub
            </div>

            <div className="brand-role">
              {user?.role === "agent"
                ? "Agent Dashboard"
                : "Customer Dashboard"}
            </div>

          </div>

          <div className="nav-right">

            <div className="user-info">

              <strong>
                {user?.name}
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

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="main-container">

        {!selectedTicket ? (

          <>
            {/* =================================================
                DASHBOARD HEADER
            ================================================= */}

            <div className="page-header">

              <div>

                <div className="eyebrow">
                  {user?.role === "agent"
                    ? "SUPPORT CENTER"
                    : "MY SUPPORT"}
                </div>

                <h1>
                  {user?.role === "agent"
                    ? "All Support Tickets"
                    : "My Tickets"}
                </h1>

                <p>
                  {user?.role === "agent"
                    ? "View, assign and manage customer support tickets."
                    : "Create and track your support requests."}
                </p>

              </div>

              {user?.role === "customer" && (
                <button
                  className="create-ticket-btn"
                  onClick={() => {
                    setShowCreateTicket(true);
                    setCreateTicketError("");
                    setMessage("");
                    setError("");
                  }}
                >
                  + Create Ticket
                </button>
              )}

            </div>

            {/* =================================================
                CREATE TICKET FORM
            ================================================= */}

            {user?.role === "customer" &&
              showCreateTicket && (

                <div className="create-ticket-card">

                  <div className="create-ticket-header">

                    <div>

                      <div className="card-eyebrow">
                        NEW REQUEST
                      </div>

                      <h2>
                        Create New Ticket
                      </h2>

                      <p>
                        Describe your issue and our
                        support agent will assist you.
                      </p>

                    </div>

                    <button
                      type="button"
                      className="close-create-btn"
                      onClick={() => {
                        setShowCreateTicket(false);
                        setCreateTicketError("");
                      }}
                    >
                      ×
                    </button>

                  </div>

                  <form
                    onSubmit={handleCreateTicket}
                    className="create-ticket-form"
                  >

                    <div className="form-group">

                      <label htmlFor="ticket-title">
                        Ticket Title
                      </label>

                      <input
                        id="ticket-title"
                        type="text"
                        value={ticketTitle}
                        onChange={(e) => {
                          setTicketTitle(
                            e.target.value
                          );
                          setCreateTicketError("");
                        }}
                        placeholder="Example: Unable to login to my account"
                        maxLength={150}
                      />

                    </div>

                    <div className="form-group">

                      <label htmlFor="ticket-description">
                        Description
                      </label>

                      <textarea
                        id="ticket-description"
                        value={ticketDescription}
                        onChange={(e) => {
                          setTicketDescription(
                            e.target.value
                          );
                          setCreateTicketError("");
                        }}
                        placeholder="Explain your problem in detail..."
                        minLength={10}
                      />

                    </div>

                    <div className="ticket-form-row">

                      <div className="form-group">

                        <label htmlFor="ticket-category">
                          Category
                        </label>

                        <select
                          id="ticket-category"
                          value={ticketCategory}
                          onChange={(e) =>
                            setTicketCategory(
                              e.target.value
                            )
                          }
                        >
                          <option value="general">
                            General
                          </option>

                          <option value="technical">
                            Technical
                          </option>

                          <option value="billing">
                            Billing
                          </option>

                          <option value="account">
                            Account
                          </option>
                        </select>

                      </div>

                      <div className="form-group">

                        <label htmlFor="ticket-priority">
                          Priority
                        </label>

                        <select
                          id="ticket-priority"
                          value={ticketPriority}
                          onChange={(e) =>
                            setTicketPriority(
                              e.target.value
                            )
                          }
                        >
                          <option value="low">
                            Low
                          </option>

                          <option value="medium">
                            Medium
                          </option>

                          <option value="high">
                            High
                          </option>

                          <option value="urgent">
                            Urgent
                          </option>
                        </select>

                      </div>

                    </div>

                    {createTicketError && (
                      <div className="error-message">
                        {createTicketError}
                      </div>
                    )}

                    <div className="create-ticket-actions">

                      <button
                        type="button"
                        className="cancel-ticket-btn"
                        onClick={() => {
                          setShowCreateTicket(false);
                          setCreateTicketError("");
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="submit-ticket-btn"
                        disabled={createTicketLoading}
                      >
                        {createTicketLoading
                          ? "Creating..."
                          : "Create Ticket"}
                      </button>

                    </div>

                  </form>

                </div>
              )}

            {/* =================================================
                MESSAGES
            ================================================= */}

            {message && (
              <div className="success-message">
                {message}
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* =================================================
                TICKET SUMMARY
            ================================================= */}

            <div className="ticket-summary">

              <div className="summary-item">
                <strong>
                  {tickets.length}
                </strong>

                <span>
                  Total Tickets
                </span>
              </div>

              <div className="summary-item">
                <strong>
                  {
                    tickets.filter(
                      (ticket) =>
                        ticket.status === "open"
                    ).length
                  }
                </strong>

                <span>
                  Open
                </span>
              </div>

              <div className="summary-item">
                <strong>
                  {
                    tickets.filter(
                      (ticket) =>
                        ticket.status === "in-progress"
                    ).length
                  }
                </strong>

                <span>
                  In Progress
                </span>
              </div>

              <div className="summary-item">
                <strong>
                  {
                    tickets.filter(
                      (ticket) =>
                        ticket.status === "resolved"
                    ).length
                  }
                </strong>

                <span>
                  Resolved
                </span>
              </div>

            </div>

            {/* =================================================
                AGENT INFO
            ================================================= */}

            {user?.role === "agent" && (
              <div className="workflow-info">

                <div>
                  <span className="workflow-number">
                    01
                  </span>

                  <div>
                    <strong>
                      Open
                    </strong>

                    <p>
                      New customer tickets appear here.
                    </p>
                  </div>
                </div>

                <div>
                  <span className="workflow-number">
                    02
                  </span>

                  <div>
                    <strong>
                      Assign
                    </strong>

                    <p>
                      Assign an unassigned ticket to yourself.
                    </p>
                  </div>
                </div>

                <div>
                  <span className="workflow-number">
                    03
                  </span>

                  <div>
                    <strong>
                      Resolve
                    </strong>

                    <p>
                      Communicate with the customer and resolve it.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* =================================================
                TICKETS
            ================================================= */}

            {tickets.length === 0 ? (

              <div className="empty-card">

                <div className="empty-icon">
                  ✓
                </div>

                <h3>
                  {user?.role === "agent"
                    ? "No tickets available"
                    : "No tickets found"}
                </h3>

                <p>
                  {user?.role === "agent"
                    ? "New customer tickets will appear here."
                    : "Create your first support ticket to get started."}
                </p>

                {user?.role === "customer" && (
                  <button
                    className="create-ticket-btn empty-create-btn"
                    onClick={() =>
                      setShowCreateTicket(true)
                    }
                  >
                    + Create Ticket
                  </button>
                )}

              </div>

            ) : (

              <div className="tickets-list">

                {tickets.map((ticket) => {

                  const isAssignedToMe =
                    user?.role === "agent" &&
                    ticket.assignedTo &&
                    String(
                      ticket.assignedTo._id ||
                        ticket.assignedTo
                    ) === String(user.id);

                  const isUnassigned =
                    !ticket.assignedTo;

                  return (

                    <div
                      className="ticket-card"
                      key={ticket._id}
                    >

                      <div className="ticket-top">

                        <div className="ticket-title-area">

                          <div className="ticket-number">
                            TICKET
                          </div>

                          <h2>
                            {ticket.title ||
                              "Untitled Ticket"}
                          </h2>

                        </div>

                        <span
                          className={`status-badge ${String(
                            ticket.status || "open"
                          ).toLowerCase()}`}
                        >
                          {ticket.status || "open"}
                        </span>

                      </div>

                      <p className="ticket-description">
                        {ticket.description}
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
                              "Medium"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Customer
                          </span>

                          <strong>
                            {ticket.createdBy?.name ||
                              ticket.user?.name ||
                              "Customer"}
                          </strong>
                        </div>

                        {user?.role === "agent" && (
                          <div>
                            <span>
                              Assigned To
                            </span>

                            <strong>
                              {ticket.assignedTo?.name ||
                                "Unassigned"}
                            </strong>
                          </div>
                        )}

                      </div>

                      <div className="ticket-footer">

                        <div className="ticket-created">

                          Created{" "}

                          {ticket.createdAt
                            ? new Date(
                                ticket.createdAt
                              ).toLocaleDateString()
                            : "-"}

                        </div>

                        <div className="ticket-actions">

                          {user?.role === "agent" &&
                            isUnassigned && (
                              <button
                                className="assign-btn"
                                onClick={() =>
                                  openTicket(ticket)
                                }
                              >
                                Assign to Me
                              </button>
                            )}

                          {user?.role === "agent" &&
                            isAssignedToMe && (
                              <span className="assigned-label">
                                ✓ Assigned to you
                              </span>
                            )}

                          <button
                            className="primary-outline-btn"
                            onClick={() =>
                              openTicket(ticket)
                            }
                          >
                            View Ticket
                          </button>

                        </div>

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
              onClick={closeTicketDetail}
            >
              ← Back to{" "}
              {user?.role === "agent"
                ? "All Tickets"
                : "My Tickets"}
            </button>

            {/* =================================================
                DETAIL CARD
            ================================================= */}

            <div className="detail-card">

              <div className="detail-header">

                <div>

                  <div className="card-eyebrow">
                    SUPPORT TICKET
                  </div>

                  <h1>
                    {selectedTicket.title ||
                      "Untitled Ticket"}
                  </h1>

                  <p className="ticket-id">
                    Ticket ID:{" "}
                    {selectedTicket._id}
                  </p>

                </div>

                <span
                  className={`status-badge large ${String(
                    selectedTicket.status || "open"
                  ).toLowerCase()}`}
                >
                  {selectedTicket.status || "open"}
                </span>

              </div>

              <div className="divider"></div>

              <section className="description-section">

                <h3>
                  Description
                </h3>

                <p>
                  {selectedTicket.description}
                </p>

              </section>

              <div className="divider"></div>

              <div className="details-grid">

                <div>
                  <span>
                    Category
                  </span>

                  <strong>
                    {selectedTicket.category}
                  </strong>
                </div>

                <div>
                  <span>
                    Priority
                  </span>

                  <strong>
                    {selectedTicket.priority}
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
                      "Customer"}
                  </strong>
                </div>

                <div>
                  <span>
                    Assigned Agent
                  </span>

                  <strong>
                    {selectedTicket.assignedTo?.name ||
                      "Unassigned"}
                  </strong>
                </div>

              </div>

            </div>

            {/* =================================================
                AGENT ACTIONS
            ================================================= */}

            {user?.role === "agent" && (
              <div className="status-card">

                <div className="status-card-header">

                  <div>

                    <div className="card-eyebrow">
                      AGENT ACTIONS
                    </div>

                    <h2>
                      Manage Ticket
                    </h2>

                  </div>

                  {!selectedTicket.assignedTo && (
                    <span className="unassigned-pill">
                      Unassigned
                    </span>
                  )}

                </div>

                {!selectedTicket.assignedTo ? (

                  <div className="assign-section">

                    <p>
                      This ticket has not been assigned
                      to an agent yet.
                    </p>

                    <button
                      className="assign-main-btn"
                      onClick={assignTicketToMe}
                    >
                      Assign to Me
                    </button>

                  </div>

                ) : String(
                    selectedTicket.assignedTo?._id ||
                      selectedTicket.assignedTo
                  ) === String(user.id) ? (

                  <>

                    <div className="assigned-success">
                      ✓ This ticket is assigned to you
                    </div>

                    <div className="status-buttons">

                      <button
                        className="status-btn progress-btn"
                        onClick={() =>
                          updateStatus(
                            "in-progress"
                          )
                        }
                        disabled={
                          selectedTicket.status ===
                          "in-progress"
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
                        disabled={
                          selectedTicket.status ===
                            "resolved" ||
                          selectedTicket.status ===
                            "closed"
                        }
                      >
                        Resolve
                      </button>

                      <button
                        className="status-btn close-btn"
                        onClick={() =>
                          updateStatus(
                            "closed"
                          )
                        }
                        disabled={
                          selectedTicket.status ===
                          "closed"
                        }
                      >
                        Close
                      </button>

                    </div>

                  </>

                ) : (

                  <div className="assigned-other">
                    This ticket is assigned to{" "}
                    <strong>
                      {selectedTicket.assignedTo?.name ||
                        "another agent"}
                    </strong>
                    .
                  </div>

                )}

              </div>
            )}

            {/* =================================================
                CUSTOMER REOPEN
            ================================================= */}

            {user?.role === "customer" &&
              selectedTicket.status === "resolved" && (

                <div className="reopen-card">

                  <div>

                    <div className="card-eyebrow">
                      TICKET RESOLVED
                    </div>

                    <h2>
                      Need more help?
                    </h2>

                    <p>
                      Reopen this ticket if your issue
                      is not completely resolved.
                    </p>

                  </div>

                  <button
                    className="reopen-btn"
                    onClick={reopenTicket}
                  >
                    Reopen Ticket
                  </button>

                </div>
              )}

            {/* =================================================
                MESSAGES
            ================================================= */}

            {message && (
              <div className="success-message">
                {message}
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* =================================================
                CONVERSATION
            ================================================= */}

            <div className="conversation-card">

              <div className="conversation-header">

                <div>

                  <div className="card-eyebrow">
                    SUPPORT CHAT
                  </div>

                  <h2>
                    Conversation
                  </h2>

                </div>

                <span>
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
                    (item, index) => {

                      const isAgent =
                        item.user?.role ===
                        "agent";

                      return (

                        <div
                          className={`reply-item ${
                            isAgent
                              ? "agent-reply"
                              : "customer-reply"
                          }`}
                          key={
                            item._id ||
                            index
                          }
                        >

                          <div className="reply-header">

                            <div className="reply-user">

                              <div
                                className={`reply-avatar ${
                                  isAgent
                                    ? "agent-avatar"
                                    : "customer-avatar"
                                }`}
                              >
                                {(
                                  item.user?.name ||
                                  "U"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

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

                      );
                    }
                  )
                )}

              </div>

              {/* =================================================
                  REPLY FORM
              ================================================= */}

              <div className="reply-form">

                <h3>
                  Add Reply
                </h3>

                {selectedTicket.status ===
                  "closed" ? (

                  <div className="reply-disabled">
                    🔒 This ticket is closed and can no
                    longer receive replies.
                  </div>

                ) : selectedTicket.status ===
                    "resolved" &&
                  user?.role === "customer" ? (

                  <div className="reply-disabled">
                    ✓ This ticket is resolved. Reopen
                    it above if you need further help.
                  </div>

                ) : user?.role === "agent" &&
                  selectedTicket.assignedTo &&
                  String(
                    selectedTicket.assignedTo?._id ||
                      selectedTicket.assignedTo
                  ) !== String(user.id) ? (

                  <div className="reply-disabled">
                    🔒 This ticket is assigned to
                    another agent.
                  </div>

                ) : (

                  <>

                    <textarea
                      value={reply}
                      onChange={(e) => {
                        setReply(e.target.value);
                        setError("");
                      }}
                      placeholder="Write your reply..."
                    />

                    <button
                      className="send-btn"
                      onClick={sendReply}
                      disabled={
                        !reply.trim() ||
                        replyLoading
                      }
                    >
                      {replyLoading
                        ? "Sending..."
                        : "Send Reply"}
                    </button>

                  </>
                )}

              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}

export default App;