import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  // =========================================================
  // AUTH
  // =========================================================

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

  const [authMode, setAuthMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // =========================================================
  // TICKETS
  // =========================================================

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replies, setReplies] = useState([]);

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // CREATE TICKET
  // =========================================================

  const [showCreateTicket, setShowCreateTicket] = useState(false);

  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketCategory, setTicketCategory] = useState("general");
  const [ticketPriority, setTicketPriority] = useState("medium");

  // =========================================================
  // REPLY
  // =========================================================

  const [reply, setReply] = useState("");

  // =========================================================
  // AUTH HEADERS
  // =========================================================

  const getAuthHeaders = (currentToken = token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${currentToken}`,
  });

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    setTickets([]);
    setSelectedTicket(null);
    setReplies([]);

    setEmail("");
    setPassword("");
    setName("");
    setReply("");

    setMessage("");
    setError("");
    setAuthError("");

    setShowCreateTicket(false);
  };

  // =========================================================
  // LOGIN
  // =========================================================

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
        setAuthError(
          data.message || "Invalid email or password"
        );
        return;
      }

      const loggedInUser = data.data?.user;
      const loggedInToken = data.data?.token;

      if (!loggedInUser || !loggedInToken) {
        setAuthError("Invalid response from server");
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
      setAuthError("");
    } catch (err) {
      console.error("Login Error:", err);

      setAuthError(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // =========================================================
  // REGISTER
  // =========================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setAuthError("");
    setMessage("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
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
          data.message || "Registration failed"
        );
        return;
      }

      const registeredUser = data.data?.user;
      const registeredToken = data.data?.token;

      if (!registeredUser || !registeredToken) {
        setAuthError(
          "Invalid registration response"
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

      setAuthError("");
    } catch (err) {
      console.error("Register Error:", err);

      setAuthError(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // =========================================================
  // GET CURRENT USER
  // =========================================================

  useEffect(() => {
    if (!token) return;

    const getCurrentUser = async () => {
      try {
        const response = await fetch(
          `${API}/auth/me`,
          {
            headers: getAuthHeaders(token),
          }
        );

        const data = await response.json();

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          logout();
          return;
        }

        if (response.ok && data.success) {
          const currentUser = data.data?.user;

          if (currentUser) {
            setUser(currentUser);

            localStorage.setItem(
              "user",
              JSON.stringify(currentUser)
            );
          }
        }
      } catch (err) {
        console.error(
          "Get Current User Error:",
          err
        );
      }
    };

    getCurrentUser();
  }, [token]);

  // =========================================================
  // FETCH TICKETS
  // =========================================================

  const fetchTickets = async () => {
    if (!token || !user?.role) return;

    try {
      setLoading(true);
      setError("");

      /*
        CUSTOMER
        -> /tickets/my

        AGENT
        -> /tickets

        Agent ko ALL tickets chahiye:
        - New tickets
        - Unassigned tickets
        - Assigned tickets
        - Resolved tickets
        - Old tickets
      */

      const endpoint =
        user.role === "agent"
          ? `${API}/tickets`
          : `${API}/tickets/my`;

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

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to fetch tickets"
        );
        return;
      }

      setTickets(
        Array.isArray(data.data?.tickets)
          ? data.data.tickets
          : []
      );
    } catch (err) {
      console.error(
        "Fetch Tickets Error:",
        err
      );

      setError("Unable to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role) {
      fetchTickets();
    }
  }, [token, user?.role]);

  // =========================================================
  // CREATE TICKET
  // =========================================================

  const createTicket = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!ticketTitle.trim()) {
      setError("Ticket title is required");
      return;
    }

    if (
      ticketDescription.trim().length < 10
    ) {
      setError(
        "Description must be at least 10 characters"
      );
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(
        `${API}/tickets`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            title: ticketTitle.trim(),
            description:
              ticketDescription.trim(),
            category: ticketCategory,
            priority: ticketPriority,
          }),
        }
      );

      const data = await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        logout();
        return;
      }

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to create ticket"
        );
        return;
      }

      const newTicket =
        data.data?.ticket;

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
        "Ticket created successfully. Status: Open"
      );
    } catch (err) {
      console.error(
        "Create Ticket Error:",
        err
      );

      setError(
        "Unable to create ticket"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // FETCH SINGLE TICKET
  // =========================================================

  const fetchTicketById = async (ticketId) => {
    if (!token) return;

    try {
      setDetailLoading(true);

      setError("");
      setMessage("");
      setReplies([]);

      const response = await fetch(
        `${API}/tickets/${ticketId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      /*
        IMPORTANT:
        Ticket detail par 401/403 aaye to
        logout nahi karna.
      */

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setError(
          data.message ||
            "You are not allowed to view this ticket"
        );
        return;
      }

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to fetch ticket"
        );
        return;
      }

      const ticket =
        data.data?.ticket;

      if (!ticket) {
        setError("Ticket not found");
        return;
      }

      setSelectedTicket(ticket);

      await fetchReplies(ticketId);
    } catch (err) {
      console.error(
        "Fetch Ticket Error:",
        err
      );

      setError("Unable to open ticket");
    } finally {
      setDetailLoading(false);
    }
  };

  // =========================================================
  // FETCH REPLIES
  // =========================================================

  const fetchReplies = async (ticketId) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API}/replies/${ticketId}`,
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
          data.message ||
            "You are not allowed to view replies"
        );
        return;
      }

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to fetch conversation"
        );
        return;
      }

      setReplies(
        data.data?.replies || []
      );
    } catch (err) {
      console.error(
        "Fetch Replies Error:",
        err
      );

      setError(
        "Unable to fetch conversation"
      );
    }
  };

  // =========================================================
  // ASSIGN TICKET - AGENT
  // =========================================================

  const assignTicket = async () => {
    if (!selectedTicket) return;

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

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
          data.message ||
            "You are not allowed to assign this ticket"
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
        setSelectedTicket(
          updatedTicket
        );

        setTickets((prev) =>
          prev.map((ticket) =>
            ticket._id ===
            updatedTicket._id
              ? updatedTicket
              : ticket
          )
        );
      }

      setMessage(
        "Ticket assigned to you. Status: In-Progress"
      );
    } catch (err) {
      console.error(
        "Assign Ticket Error:",
        err
      );

      setError(
        "Unable to assign ticket"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // UPDATE STATUS - AGENT
  // =========================================================

  const updateStatus = async (status) => {
    if (!selectedTicket) return;

    try {
      setActionLoading(true);

      setError("");
      setMessage("");

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
          data.message ||
            "You are not allowed to update this ticket"
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

      setSelectedTicket(
        updatedTicket
      );

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id ===
          updatedTicket._id
            ? updatedTicket
            : ticket
        )
      );

      if (status === "resolved") {
        setMessage(
          "Ticket resolved successfully"
        );
      } else if (
        status === "in-progress"
      ) {
        setMessage(
          "Ticket is now In-Progress"
        );
      } else {
        setMessage(
          `Ticket status updated to ${status}`
        );
      }
    } catch (err) {
      console.error(
        "Update Status Error:",
        err
      );

      setError(
        "Unable to update ticket status"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // REOPEN TICKET - CUSTOMER
  // =========================================================

  const reopenTicket = async () => {
    if (!selectedTicket) return;

    try {
      setActionLoading(true);

      setError("");
      setMessage("");

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
          data.message ||
            "You are not allowed to reopen this ticket"
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

      setSelectedTicket(
        updatedTicket
      );

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id ===
          updatedTicket._id
            ? updatedTicket
            : ticket
        )
      );

      setMessage(
        "Ticket reopened. Status: In-Progress"
      );
    } catch (err) {
      console.error(
        "Reopen Ticket Error:",
        err
      );

      setError(
        "Unable to reopen ticket"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // SEND REPLY
  // =========================================================

  const sendReply = async () => {
    if (
      !selectedTicket ||
      !reply.trim()
    ) {
      return;
    }

    /*
      Conversation allowed:

      OPEN
      IN-PROGRESS

      RESOLVED:
      Customer must reopen first.

      CLOSED:
      Not part of our active workflow.
    */

    if (
      selectedTicket.status ===
      "resolved"
    ) {
      setError(
        "This ticket is resolved. Reopen it before sending a reply."
      );
      return;
    }

    if (
      selectedTicket.status ===
      "closed"
    ) {
      setError(
        "This ticket is closed."
      );
      return;
    }

    try {
      setActionLoading(true);

      setError("");
      setMessage("");

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
          data.message ||
            "You are not allowed to reply"
        );
        return;
      }

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to send reply"
        );
        return;
      }

      setReply("");

      setMessage(
        "Reply added successfully"
      );

      await fetchReplies(
        selectedTicket._id
      );

      /*
        Refresh ticket because backend
        may update ticket data.
      */

      const ticketResponse =
        await fetch(
          `${API}/tickets/${selectedTicket._id}`,
          {
            headers:
              getAuthHeaders(),
          }
        );

      const ticketData =
        await ticketResponse.json();

      if (
        ticketResponse.ok &&
        ticketData.success &&
        ticketData.data?.ticket
      ) {
        const updatedTicket =
          ticketData.data.ticket;

        setSelectedTicket(
          updatedTicket
        );

        setTickets((prev) =>
          prev.map((ticket) =>
            ticket._id ===
            updatedTicket._id
              ? updatedTicket
              : ticket
          )
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
      setActionLoading(false);
    }
  };

  // =========================================================
  // CLOSE DETAIL
  // =========================================================

  const closeTicketDetail = () => {
    setSelectedTicket(null);
    setReplies([]);
    setReply("");

    setMessage("");
    setError("");

    /*
      Dashboard par wapas aane par
      latest ticket data fetch karo.
    */

    fetchTickets();
  };

  // =========================================================
  // AUTH PAGE
  // =========================================================

  if (!token) {
    return (
      <div className="auth-page">

        <div className="auth-wrapper">

          <div className="auth-brand">

            <div className="auth-logo">
              DH
            </div>

            <h1>DeskHub</h1>

            <p>
              Simple and powerful customer
              support management
            </p>

          </div>

          <div className="auth-card">

            {/* AUTH TABS */}

            <div className="auth-tabs">

              <button
                type="button"
                className={
                  authMode === "login"
                    ? "auth-tab active"
                    : "auth-tab"
                }
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
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
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                }}
              >
                Register
              </button>

            </div>

            {/* =================================================
                LOGIN
            ================================================= */}

            {authMode === "login" ? (

              <>

                <div className="auth-heading">

                  <h2>
                    Welcome back
                  </h2>

                  <p>
                    Login to your DeskHub
                    account
                  </p>

                </div>

                <form
                  onSubmit={handleLogin}
                  className="auth-form"
                >

                  <div className="form-group">

                    <label>
                      Email
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(
                          e.target.value
                        );
                        setAuthError("");
                      }}
                      placeholder="Enter your email"
                      autoComplete="email"
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Password
                    </label>

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(
                          e.target.value
                        );
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
                    className="auth-submit"
                    disabled={authLoading}
                  >
                    {authLoading
                      ? "Logging in..."
                      : "Login"}
                  </button>

                </form>

                <div className="auth-switch">

                  Don't have an account?

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(
                        "register"
                      );
                      setAuthError("");
                    }}
                  >
                    Create account
                  </button>

                </div>

              </>

            ) : (

              /* =================================================
                  REGISTER
              ================================================= */

              <>

                <div className="auth-heading">

                  <h2>
                    Create account
                  </h2>

                  <p>
                    Join DeskHub as a
                    Customer or Agent
                  </p>

                </div>

                <form
                  onSubmit={handleRegister}
                  className="auth-form"
                >

                  <div className="form-group">

                    <label>
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(
                          e.target.value
                        );
                        setAuthError("");
                      }}
                      placeholder="Enter your name"
                      autoComplete="name"
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Email
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(
                          e.target.value
                        );
                        setAuthError("");
                      }}
                      placeholder="Enter your email"
                      autoComplete="email"
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Password
                    </label>

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(
                          e.target.value
                        );
                        setAuthError("");
                      }}
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Account Type
                    </label>

                    <div className="role-options">

                      <label
                        className={
                          role === "customer"
                            ? "role-option selected"
                            : "role-option"
                        }
                      >

                        <input
                          type="radio"
                          name="role"
                          value="customer"
                          checked={
                            role ===
                            "customer"
                          }
                          onChange={() =>
                            setRole(
                              "customer"
                            )
                          }
                        />

                        <span>

                          <strong>
                            Customer
                          </strong>

                          <small>
                            Create and track
                            support tickets
                          </small>

                        </span>

                      </label>

                      <label
                        className={
                          role === "agent"
                            ? "role-option selected"
                            : "role-option"
                        }
                      >

                        <input
                          type="radio"
                          name="role"
                          value="agent"
                          checked={
                            role === "agent"
                          }
                          onChange={() =>
                            setRole(
                              "agent"
                            )
                          }
                        />

                        <span>

                          <strong>
                            Agent
                          </strong>

                          <small>
                            Manage and resolve
                            tickets
                          </small>

                        </span>

                      </label>

                    </div>

                  </div>

                  {authError && (
                    <div className="auth-error">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="auth-submit"
                    disabled={authLoading}
                  >
                    {authLoading
                      ? "Creating account..."
                      : "Create Account"}
                  </button>

                </form>

                <div className="auth-switch">

                  Already have an account?

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(
                        "login"
                      );
                      setAuthError("");
                    }}
                  >
                    Login
                  </button>

                </div>

              </>

            )}

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN LOADING
  // =========================================================

  if (
    loading &&
    !selectedTicket &&
    tickets.length === 0
  ) {
    return (
      <div className="loading-screen">

        <div className="loader"></div>

        <h3>
          Loading DeskHub...
        </h3>

        <p>
          Please wait
        </p>

      </div>
    );
  }

  // =========================================================
  // MAIN APP
  // =========================================================

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="navbar">

        <div className="navbar-inner">

          <div className="brand">

            <div className="brand-icon">
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
                {user?.name ||
                  "User"}
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

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="main-container">

        {/* ===================================================
            TICKET DETAIL
        =================================================== */}

        {selectedTicket ? (

          <div className="ticket-detail-page">

            <button
              className="back-btn"
              onClick={closeTicketDetail}
            >
              ← Back to Tickets
            </button>

            {detailLoading ? (

              <div className="detail-loading">

                <div className="loader"></div>

                <p>
                  Loading ticket...
                </p>

              </div>

            ) : (

              <>

                {/* =================================================
                    DETAIL CARD
                ================================================= */}

                <div className="detail-card">

                  <div className="detail-header">

                    <div>

                      <div className="ticket-number">
                        TICKET #
                        {selectedTicket._id.slice(-6)}
                      </div>

                      <h1>
                        {selectedTicket.title ||
                          "Untitled Ticket"}
                      </h1>

                      <p className="ticket-id">

                        Created{" "}

                        {selectedTicket.createdAt
                          ? new Date(
                              selectedTicket.createdAt
                            ).toLocaleString()
                          : "-"}

                      </p>

                    </div>

                    <span
                      className={`status-badge ${String(
                        selectedTicket.status ||
                          "open"
                      ).toLowerCase()}`}
                    >
                      {selectedTicket.status ===
                      "in-progress"
                        ? "In-Progress"
                        : selectedTicket.status}
                    </span>

                  </div>

                  <div className="divider"></div>

                  <section className="description-section">

                    <h3>
                      Problem Description
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

                      <strong
                        className={`priority-${String(
                          selectedTicket.priority ||
                            "medium"
                        ).toLowerCase()}`}
                      >
                        {selectedTicket.priority}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Customer
                      </span>

                      <strong>
                        {selectedTicket.createdBy
                          ?.name ||
                          "Customer"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Assigned Agent
                      </span>

                      <strong>
                        {selectedTicket.assignedTo
                          ?.name ||
                          "Unassigned"}
                      </strong>
                    </div>

                  </div>

                </div>

                {/* =================================================
                    AGENT WORKFLOW
                ================================================= */}

                {user?.role === "agent" && (

                  <div className="status-card">

                    <div className="status-card-header">

                      <div>

                        <h2>
                          Ticket Workflow
                        </h2>

                        <p>
                          Manage this support
                          ticket
                        </p>

                      </div>

                    </div>

                    <div className="workflow-box">

                      <div
                        className={
                          selectedTicket.status ===
                          "open"
                            ? "workflow-step active"
                            : "workflow-step"
                        }
                      >

                        <span>
                          1
                        </span>

                        <strong>
                          Open
                        </strong>

                      </div>

                      <div className="workflow-line"></div>

                      <div
                        className={
                          selectedTicket.status ===
                          "in-progress"
                            ? "workflow-step active"
                            : "workflow-step"
                        }
                      >

                        <span>
                          2
                        </span>

                        <strong>
                          In-Progress
                        </strong>

                      </div>

                      <div className="workflow-line"></div>

                      <div
                        className={
                          selectedTicket.status ===
                          "resolved"
                            ? "workflow-step active"
                            : "workflow-step"
                        }
                      >

                        <span>
                          3
                        </span>

                        <strong>
                          Resolved
                        </strong>

                      </div>

                    </div>

                    <div className="status-buttons">

                      {/* OPEN + UNASSIGNED */}

                      {selectedTicket.status ===
                        "open" &&
                        !selectedTicket.assignedTo && (

                          <button
                            className="assign-btn"
                            onClick={
                              assignTicket
                            }
                            disabled={
                              actionLoading
                            }
                          >
                            {actionLoading
                              ? "Assigning..."
                              : "Assign Ticket to Me"}
                          </button>

                        )}

                      {/* ASSIGNED + OPEN */}

                      {selectedTicket.status ===
                        "open" &&
                        selectedTicket.assignedTo &&
                        String(
                          selectedTicket
                            .assignedTo?._id ||
                            selectedTicket.assignedTo
                        ) ===
                          String(user?.id) && (

                          <button
                            className="status-btn progress-btn"
                            onClick={() =>
                              updateStatus(
                                "in-progress"
                              )
                            }
                            disabled={
                              actionLoading
                            }
                          >
                            Start Progress
                          </button>

                        )}

                      {/* IN-PROGRESS */}

                      {selectedTicket.status ===
                        "in-progress" &&
                        selectedTicket.assignedTo &&
                        String(
                          selectedTicket
                            .assignedTo?._id ||
                            selectedTicket.assignedTo
                        ) ===
                          String(user?.id) && (

                          <button
                            className="status-btn resolve-btn"
                            onClick={() =>
                              updateStatus(
                                "resolved"
                              )
                            }
                            disabled={
                              actionLoading
                            }
                          >
                            Resolve Ticket
                          </button>

                        )}

                      {/* RESOLVED */}

                      {selectedTicket.status ===
                        "resolved" && (

                          <div className="resolved-info">

                            ✓ Ticket has been
                            resolved.

                          </div>

                        )}

                    </div>

                  </div>

                )}

                {/* =================================================
                    CUSTOMER REOPEN
                ================================================= */}

                {user?.role === "customer" &&
                  selectedTicket.status ===
                    "resolved" && (

                    <div className="reopen-card">

                      <div>

                        <h2>
                          Is the issue still not fixed?
                        </h2>

                        <p>
                          Reopen this ticket to
                          continue the conversation
                          with the support agent.
                        </p>

                      </div>

                      <button
                        className="reopen-btn"
                        onClick={
                          reopenTicket
                        }
                        disabled={
                          actionLoading
                        }
                      >
                        {actionLoading
                          ? "Reopening..."
                          : "Reopen Ticket"}
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

                      <h2>
                        Conversation
                      </h2>

                      <p>
                        Communicate about this
                        support request
                      </p>

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

                        <strong>
                          No replies yet
                        </strong>

                        <span>
                          Start the conversation
                          below.
                        </span>

                      </div>

                    ) : (

                      replies.map(
                        (item, index) => (

                          <div
                            className={`reply-item ${
                              item.user?.role ===
                              "agent"
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

                                <div className="reply-avatar">

                                  {(
                                    item.user
                                      ?.name ||
                                    "U"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}

                                </div>

                                <div>

                                  <strong>
                                    {item.user
                                      ?.name ||
                                      "User"}
                                  </strong>

                                  <small>
                                    {item.user
                                      ?.role ||
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

                        )
                      )

                    )}

                  </div>

                  {/* =================================================
                      REPLY FORM
                  ================================================= */}

                  {selectedTicket.status ===
                    "open" ||
                  selectedTicket.status ===
                    "in-progress" ? (

                    <div className="reply-form">

                      <div className="reply-form-title">

                        <div>

                          <h3>
                            Add Reply
                          </h3>

                          <span>
                            Reply as{" "}
                            <strong>
                              {user?.role}
                            </strong>
                          </span>

                        </div>

                      </div>

                      <textarea
                        value={reply}
                        onChange={(e) =>
                          setReply(
                            e.target.value
                          )
                        }
                        placeholder="Write your message..."
                        disabled={
                          actionLoading
                        }
                      />

                      <div className="reply-actions">

                        <span>
                          {reply.length}{" "}
                          characters
                        </span>

                        <button
                          className="send-btn"
                          onClick={
                            sendReply
                          }
                          disabled={
                            !reply.trim() ||
                            actionLoading
                          }
                        >
                          {actionLoading
                            ? "Sending..."
                            : "Send Reply →"}
                        </button>

                      </div>

                    </div>

                  ) : selectedTicket.status ===
                    "resolved" ? (

                    <div className="resolved-reply-message">

                      <strong>
                        Ticket Resolved
                      </strong>

                      <span>
                        {user?.role ===
                        "customer"
                          ? "Reopen the ticket if you need to continue the conversation."
                          : "The ticket has been resolved. Customer can reopen it if required."}
                      </span>

                    </div>

                  ) : (

                    <div className="closed-message">

                      This ticket is closed and
                      cannot receive replies.

                    </div>

                  )}

                </div>

              </>

            )}

          </div>

        ) : (

          /* =====================================================
             DASHBOARD
          ===================================================== */

          <>

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="page-header">

              <div>

                <div className="eyebrow">
                  {user?.role === "agent"
                    ? "SUPPORT DASHBOARD"
                    : "CUSTOMER DASHBOARD"}
                </div>

                <h1>
                  {user?.role === "agent"
                    ? "Manage Support Tickets"
                    : "My Support Tickets"}
                </h1>

                <p>
                  {user?.role === "agent"
                    ? "View new tickets, assign tickets and help customers."
                    : "Create and track your support requests."}
                </p>

              </div>

              {user?.role ===
                "customer" && (

                <button
                  className="create-ticket-btn"
                  onClick={() => {
                    setShowCreateTicket(
                      !showCreateTicket
                    );

                    setError("");
                    setMessage("");
                  }}
                >
                  {showCreateTicket
                    ? "× Close"
                    : "+ Create Ticket"}
                </button>

              )}

            </div>

            {/* =================================================
                CREATE TICKET
            ================================================= */}

            {showCreateTicket &&
              user?.role ===
                "customer" && (

                <div className="create-ticket-card">

                  <div className="create-ticket-header">

                    <div>

                      <h2>
                        Create New Ticket
                      </h2>

                      <p>
                        Tell us what problem
                        you are facing.
                      </p>

                    </div>

                    <button
                      type="button"
                      className="close-form-btn"
                      onClick={() =>
                        setShowCreateTicket(
                          false
                        )
                      }
                    >
                      ×
                    </button>

                  </div>

                  <form
                    onSubmit={
                      createTicket
                    }
                  >

                    <div className="form-group">

                      <label>
                        Ticket Title
                      </label>

                      <input
                        type="text"
                        value={
                          ticketTitle
                        }
                        onChange={(e) =>
                          setTicketTitle(
                            e.target.value
                          )
                        }
                        placeholder="Example: Unable to login"
                      />

                    </div>

                    <div className="form-group">

                      <label>
                        Description
                      </label>

                      <textarea
                        value={
                          ticketDescription
                        }
                        onChange={(e) =>
                          setTicketDescription(
                            e.target.value
                          )
                        }
                        placeholder="Describe your problem in detail..."
                      />

                    </div>

                    <div className="create-grid">

                      <div className="form-group">

                        <label>
                          Category
                        </label>

                        <select
                          value={
                            ticketCategory
                          }
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

                        <label>
                          Priority
                        </label>

                        <select
                          value={
                            ticketPriority
                          }
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

                    <div className="create-actions">

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() =>
                          setShowCreateTicket(
                            false
                          )
                        }
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="primary-btn"
                        disabled={
                          actionLoading
                        }
                      >
                        {actionLoading
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
                STATS
            ================================================= */}

            <div className="stats-grid">

              <div className="stat-card">
                <span>
                  Total
                </span>

                <strong>
                  {tickets.length}
                </strong>
              </div>

              <div className="stat-card">
                <span>
                  Open
                </span>

                <strong>
                  {
                    tickets.filter(
                      (ticket) =>
                        ticket.status ===
                        "open"
                    ).length
                  }
                </strong>
              </div>

              <div className="stat-card">
                <span>
                  In-Progress
                </span>

                <strong>
                  {
                    tickets.filter(
                      (ticket) =>
                        ticket.status ===
                        "in-progress"
                    ).length
                  }
                </strong>
              </div>

              <div className="stat-card">
                <span>
                  Resolved
                </span>

                <strong>
                  {
                    tickets.filter(
                      (ticket) =>
                        ticket.status ===
                        "resolved"
                    ).length
                  }
                </strong>
              </div>

            </div>

            {/* =================================================
                TICKET HEADER
            ================================================= */}

            <div className="ticket-list-header">

              <div>

                <h2>
                  {user?.role === "agent"
                    ? "All Support Tickets"
                    : "Your Support Tickets"}
                </h2>

                <p>
                  {user?.role === "agent"
                    ? "New, assigned and resolved customer tickets."
                    : "View and track all your support requests."}
                </p>

              </div>

              <span>
                {tickets.length}{" "}
                {tickets.length === 1
                  ? "ticket"
                  : "tickets"}
              </span>

            </div>

            {/* =================================================
                EMPTY
            ================================================= */}

            {tickets.length === 0 ? (

              <div className="empty-card">

                <div className="empty-icon">

                  {user?.role ===
                  "agent"
                    ? "✓"
                    : "+"}

                </div>

                <h3>

                  {user?.role ===
                  "agent"
                    ? "No tickets available"
                    : "No tickets yet"}

                </h3>

                <p>

                  {user?.role ===
                  "agent"
                    ? "New customer tickets will appear here."
                    : "Create your first support ticket to get help."}

                </p>

                {user?.role ===
                  "customer" && (

                  <button
                    className="primary-btn"
                    onClick={() =>
                      setShowCreateTicket(
                        true
                      )
                    }
                  >
                    + Create Ticket
                  </button>

                )}

              </div>

            ) : (

              /* =================================================
                  TICKETS
              ================================================= */

              <div className="tickets-list">

                {tickets.map(
                  (ticket) => (

                    <div
                      className="ticket-card"
                      key={
                        ticket._id
                      }
                    >

                      <div className="ticket-top">

                        <div>

                          <div className="ticket-number">

                            #
                            {ticket._id.slice(
                              -6
                            )}

                          </div>

                          <h2>

                            {ticket.title ||
                              "Untitled Ticket"}

                          </h2>

                        </div>

                        <span
                          className={`status-badge ${String(
                            ticket.status ||
                              "open"
                          ).toLowerCase()}`}
                        >

                          {ticket.status ===
                          "in-progress"
                            ? "In-Progress"
                            : ticket.status}

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
                            {ticket.category}
                          </strong>

                        </div>

                        <div>

                          <span>
                            Priority
                          </span>

                          <strong
                            className={`priority-${String(
                              ticket.priority ||
                                "medium"
                            ).toLowerCase()}`}
                          >
                            {ticket.priority}
                          </strong>

                        </div>

                        <div>

                          <span>
                            Customer
                          </span>

                          <strong>

                            {ticket
                              .createdBy
                              ?.name ||
                              "Customer"}

                          </strong>

                        </div>

                        {user?.role ===
                          "agent" && (

                          <div>

                            <span>
                              Assigned To
                            </span>

                            <strong>

                              {ticket
                                .assignedTo
                                ?.name ||
                                "Unassigned"}

                            </strong>

                          </div>

                        )}

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
                          className="view-ticket-btn"
                          onClick={() =>
                            fetchTicketById(
                              ticket._id
                            )
                          }
                        >
                          View Ticket →
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </>

        )}

      </main>

    </div>
  );
}

export default App;