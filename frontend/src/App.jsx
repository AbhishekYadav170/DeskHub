// import { useEffect, useMemo, useState } from "react";
// import "./App.css";

// const API = "http://localhost:5000/api";

// function App() {
//   // =====================================================
//   // AUTH
//   // =====================================================

//   const [token, setToken] = useState(() =>
//     localStorage.getItem("token")
//   );

//   const [user, setUser] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem("user")) || null;
//     } catch {
//       return null;
//     }
//   });

//   const [authMode, setAuthMode] = useState("login");

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("customer");

//   const [authLoading, setAuthLoading] = useState(false);
//   const [authError, setAuthError] = useState("");

//   // =====================================================
//   // TICKETS
//   // =====================================================

//   const [tickets, setTickets] = useState([]);
//   const [selectedTicket, setSelectedTicket] = useState(null);

//   const [loading, setLoading] = useState(false);
//   const [actionLoading, setActionLoading] = useState(false);

//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   // =====================================================
//   // DASHBOARD FILTERS
//   // =====================================================

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [categoryFilter, setCategoryFilter] = useState("all");
//   const [priorityFilter, setPriorityFilter] = useState("all");

//   // =====================================================
//   // CREATE TICKET
//   // =====================================================

//   const [showCreateTicket, setShowCreateTicket] = useState(false);

//   const [ticketTitle, setTicketTitle] = useState("");
//   const [ticketDescription, setTicketDescription] = useState("");
//   const [ticketCategory, setTicketCategory] = useState("general");
//   const [ticketPriority, setTicketPriority] = useState("medium");

//   const [createTicketLoading, setCreateTicketLoading] =
//     useState(false);

//   const [createTicketError, setCreateTicketError] =
//     useState("");

//   // =====================================================
//   // REPLIES
//   // =====================================================

//   const [replies, setReplies] = useState([]);
//   const [reply, setReply] = useState("");
//   const [replyLoading, setReplyLoading] = useState(false);

//   // =====================================================
//   // AUTH HEADERS
//   // =====================================================

//   const getAuthHeaders = (currentToken = token) => ({
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${currentToken}`,
//   });

//   // =====================================================
//   // CLEAR FILTERS
//   // =====================================================

//   const clearFilters = () => {
//     setSearch("");
//     setStatusFilter("all");
//     setCategoryFilter("all");
//     setPriorityFilter("all");
//   };

//   // =====================================================
//   // LOGOUT
//   // =====================================================

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");

//     setToken(null);
//     setUser(null);

//     setTickets([]);
//     setSelectedTicket(null);
//     setReplies([]);

//     setEmail("");
//     setPassword("");
//     setName("");
//     setRole("customer");

//     setReply("");

//     setMessage("");
//     setError("");
//     setAuthError("");

//     setShowCreateTicket(false);

//     clearFilters();
//   };

//   // =====================================================
//   // LOGIN
//   // =====================================================

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     setAuthError("");
//     setError("");
//     setMessage("");

//     if (!email.trim() || !password.trim()) {
//       setAuthError("Email and password are required");
//       return;
//     }

//     try {
//       setAuthLoading(true);

//       const response = await fetch(`${API}/auth/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: email.trim(),
//           password,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         setAuthError(
//           data.message || "Invalid email or password"
//         );
//         return;
//       }

//       const loggedInUser = data.data?.user;
//       const loggedInToken = data.data?.token;

//       if (!loggedInUser || !loggedInToken) {
//         setAuthError("Invalid login response from server");
//         return;
//       }

//       localStorage.setItem("token", loggedInToken);
//       localStorage.setItem(
//         "user",
//         JSON.stringify(loggedInUser)
//       );

//       setToken(loggedInToken);
//       setUser(loggedInUser);

//       setEmail("");
//       setPassword("");
//     } catch (err) {
//       console.error("Login Error:", err);

//       setAuthError(
//         "Unable to connect to server. Please try again."
//       );
//     } finally {
//       setAuthLoading(false);
//     }
//   };

//   // =====================================================
//   // REGISTER
//   // =====================================================

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     setAuthError("");
//     setError("");
//     setMessage("");

//     if (
//       !name.trim() ||
//       !email.trim() ||
//       !password.trim()
//     ) {
//       setAuthError(
//         "Name, email and password are required"
//       );
//       return;
//     }

//     if (password.length < 6) {
//       setAuthError(
//         "Password must be at least 6 characters"
//       );
//       return;
//     }

//     try {
//       setAuthLoading(true);

//       const response = await fetch(`${API}/auth/register`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: name.trim(),
//           email: email.trim(),
//           password,
//           role,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         setAuthError(
//           data.message || "Unable to register"
//         );
//         return;
//       }

//       const registeredUser = data.data?.user;
//       const registeredToken = data.data?.token;

//       if (!registeredUser || !registeredToken) {
//         setAuthError(
//           "Invalid registration response from server"
//         );
//         return;
//       }

//       localStorage.setItem("token", registeredToken);
//       localStorage.setItem(
//         "user",
//         JSON.stringify(registeredUser)
//       );

//       setToken(registeredToken);
//       setUser(registeredUser);

//       setName("");
//       setEmail("");
//       setPassword("");
//       setRole("customer");
//     } catch (err) {
//       console.error("Register Error:", err);

//       setAuthError(
//         "Unable to connect to server. Please try again."
//       );
//     } finally {
//       setAuthLoading(false);
//     }
//   };

//   // =====================================================
//   // GET CURRENT USER
//   // =====================================================

//   useEffect(() => {
//     if (!token) return;

//     const getCurrentUser = async () => {
//       try {
//         const response = await fetch(`${API}/auth/me`, {
//           headers: getAuthHeaders(token),
//         });

//         const data = await response.json();

//         if (
//           response.status === 401 ||
//           response.status === 403
//         ) {
//           logout();
//           return;
//         }

//         if (response.ok && data.success) {
//           const currentUser = data.data?.user;

//           if (currentUser) {
//             setUser(currentUser);

//             localStorage.setItem(
//               "user",
//               JSON.stringify(currentUser)
//             );
//           }
//         }
//       } catch (err) {
//         console.error(
//           "Get Current User Error:",
//           err
//         );
//       }
//     };

//     getCurrentUser();

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   // =====================================================
//   // FETCH TICKETS
//   // =====================================================

//   const fetchTickets = async () => {
//     if (!token || !user?.role) return;

//     try {
//       setLoading(true);
//       setError("");

//       let endpoint = "";

//       // Customer -> own tickets
//       if (user.role === "customer") {
//         endpoint = `${API}/tickets/my`;
//       }

//       // Agent -> ALL tickets
//       // Important:
//       // New + unassigned + assigned tickets
//       // sab agent ko dikhenge.
//       if (user.role === "agent") {
//         endpoint = `${API}/tickets`;
//       }

//       if (!endpoint) {
//         setError("Invalid user role");
//         return;
//       }

//       const response = await fetch(endpoint, {
//         headers: getAuthHeaders(),
//       });

//       const data = await response.json();

//       if (
//         response.status === 401 ||
//         response.status === 403
//       ) {
//         setError(
//           data.message || "Access denied"
//         );
//         return;
//       }

//       if (!response.ok || !data.success) {
//         setError(
//           data.message || "Unable to fetch tickets"
//         );
//         return;
//       }

//       setTickets(data.data?.tickets || []);
//     } catch (err) {
//       console.error("Fetch Tickets Error:", err);
//       setError("Unable to fetch tickets");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token && user?.role) {
//       fetchTickets();
//     }

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token, user?.role]);

//   // =====================================================
//   // STATISTICS
//   // =====================================================

//   const stats = useMemo(() => {
//     return {
//       total: tickets.length,

//       open: tickets.filter(
//         (ticket) => ticket.status === "open"
//       ).length,

//       inProgress: tickets.filter(
//         (ticket) => ticket.status === "in-progress"
//       ).length,

//       resolved: tickets.filter(
//         (ticket) => ticket.status === "resolved"
//       ).length,

//       closed: tickets.filter(
//         (ticket) => ticket.status === "closed"
//       ).length,
//     };
//   }, [tickets]);

//   // =====================================================
//   // FILTERED TICKETS
//   // =====================================================

//   const filteredTickets = useMemo(() => {
//     const searchValue = search.trim().toLowerCase();

//     return tickets.filter((ticket) => {
//       const title = String(
//         ticket.title || ""
//       ).toLowerCase();

//       const description = String(
//         ticket.description || ""
//       ).toLowerCase();

//       const ticketId = String(
//         ticket._id || ""
//       ).toLowerCase();

//       const customerName = String(
//         ticket.createdBy?.name || ""
//       ).toLowerCase();

//       const matchesSearch =
//         !searchValue ||
//         title.includes(searchValue) ||
//         description.includes(searchValue) ||
//         ticketId.includes(searchValue) ||
//         customerName.includes(searchValue);

//       const matchesStatus =
//         statusFilter === "all" ||
//         ticket.status === statusFilter;

//       const matchesCategory =
//         categoryFilter === "all" ||
//         ticket.category === categoryFilter;

//       const matchesPriority =
//         priorityFilter === "all" ||
//         ticket.priority === priorityFilter;

//       return (
//         matchesSearch &&
//         matchesStatus &&
//         matchesCategory &&
//         matchesPriority
//       );
//     });
//   }, [
//     tickets,
//     search,
//     statusFilter,
//     categoryFilter,
//     priorityFilter,
//   ]);

//   // =====================================================
//   // CREATE TICKET
//   // =====================================================

//   const handleCreateTicket = async (e) => {
//     e.preventDefault();

//     setCreateTicketError("");
//     setMessage("");
//     setError("");

//     if (
//       !ticketTitle.trim() ||
//       !ticketDescription.trim()
//     ) {
//       setCreateTicketError(
//         "Title and description are required"
//       );
//       return;
//     }

//     if (ticketTitle.trim().length < 3) {
//       setCreateTicketError(
//         "Title must be at least 3 characters"
//       );
//       return;
//     }

//     if (ticketDescription.trim().length < 10) {
//       setCreateTicketError(
//         "Description must be at least 10 characters"
//       );
//       return;
//     }

//     try {
//       setCreateTicketLoading(true);

//       const response = await fetch(`${API}/tickets`, {
//         method: "POST",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({
//           title: ticketTitle.trim(),
//           description: ticketDescription.trim(),
//           category: ticketCategory,
//           priority: ticketPriority,
//         }),
//       });

//       const data = await response.json();

//       if (
//         response.status === 401 ||
//         response.status === 403
//       ) {
//         setCreateTicketError(
//           data.message || "Access denied"
//         );
//         return;
//       }

//       if (!response.ok || !data.success) {
//         setCreateTicketError(
//           data.message || "Unable to create ticket"
//         );
//         return;
//       }

//       setTicketTitle("");
//       setTicketDescription("");
//       setTicketCategory("general");
//       setTicketPriority("medium");

//       setShowCreateTicket(false);

//       setMessage(
//         "Ticket created successfully. Status: OPEN"
//       );

//       // Refresh from database
//       await fetchTickets();
//     } catch (err) {
//       console.error(
//         "Create Ticket Error:",
//         err
//       );

//       setCreateTicketError(
//         "Unable to connect to server. Please try again."
//       );
//     } finally {
//       setCreateTicketLoading(false);
//     }
//   };

//   // =====================================================
//   // FETCH REPLIES
//   // =====================================================

//   const fetchReplies = async (ticketId) => {
//     if (!token) return;

//     try {
//       const response = await fetch(
//         `${API}/replies/${ticketId}`,
//         {
//           headers: getAuthHeaders(),
//         }
//       );

//       const data = await response.json();

//       if (
//         response.status === 401 ||
//         response.status === 403
//       ) {
//         setError(
//           data.message ||
//             "You are not allowed to view replies"
//         );
//         return;
//       }

//       if (!response.ok || !data.success) {
//         setError(
//           data.message ||
//             "Unable to fetch conversation"
//         );
//         return;
//       }

//       setReplies(
//         data.data?.replies || []
//       );
//     } catch (err) {
//       console.error(
//         "Fetch Replies Error:",
//         err
//       );

//       setError(
//         "Unable to fetch conversation"
//       );
//     }
//   };

//   // =====================================================
//   // OPEN TICKET
//   // =====================================================

//   const openTicket = async (ticket) => {
//     setSelectedTicket(ticket);
//     setReplies([]);
//     setReply("");
//     setMessage("");
//     setError("");

//     await fetchReplies(ticket._id);
//   };

//   // =====================================================
//   // ASSIGN TICKET TO CURRENT AGENT
//   // =====================================================

//   const assignTicketToMe = async () => {
//     if (!selectedTicket) return;

//     try {
//       setActionLoading(true);
//       setError("");
//       setMessage("");

//       const response = await fetch(
//         `${API}/tickets/${selectedTicket._id}/assign`,
//         {
//           method: "PATCH",
//           headers: getAuthHeaders(),
//         }
//       );

//       const data = await response.json();

//       if (
//         response.status === 401 ||
//         response.status === 403
//       ) {
//         setError(
//           data.message || "Access denied"
//         );
//         return;
//       }

//       if (!response.ok || !data.success) {
//         setError(
//           data.message ||
//             "Unable to assign ticket"
//         );
//         return;
//       }

//       const updatedTicket =
//         data.data?.ticket;

//       if (updatedTicket) {
//         setSelectedTicket(updatedTicket);

//         setTickets((previous) =>
//           previous.map((ticket) =>
//             ticket._id === updatedTicket._id
//               ? updatedTicket
//               : ticket
//           )
//         );
//       }

//       setMessage(
//         "Ticket assigned to you. Status: IN-PROGRESS"
//       );
//     } catch (err) {
//       console.error(
//         "Assign Ticket Error:",
//         err
//       );

//       setError("Unable to assign ticket");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // =====================================================
//   // SEND REPLY
//   // =====================================================

//   const sendReply = async () => {
//     if (
//       !selectedTicket ||
//       !reply.trim()
//     ) {
//       return;
//     }

//     // Closed ticket cannot receive reply
//     if (selectedTicket.status === "closed") {
//       setError(
//         "Cannot reply to a closed ticket"
//       );
//       return;
//     }

//     // Customer must reopen resolved ticket
//     if (
//       user?.role === "customer" &&
//       selectedTicket.status === "resolved"
//     ) {
//       setError(
//         "Please reopen the ticket before replying"
//       );
//       return;
//     }

//     // Agent must be assigned
//     if (
//       user?.role === "agent" &&
//       selectedTicket.assignedTo &&
//       String(
//         selectedTicket.assignedTo._id ||
//           selectedTicket.assignedTo
//       ) !== String(user.id)
//     ) {
//       setError(
//         "You can only reply to tickets assigned to you"
//       );
//       return;
//     }

//     // Agent cannot reply before assignment
//     if (
//       user?.role === "agent" &&
//       !selectedTicket.assignedTo
//     ) {
//       setError(
//         "Please assign this ticket to yourself first"
//       );
//       return;
//     }

//     try {
//       setReplyLoading(true);
//       setError("");
//       setMessage("");

//       const response = await fetch(
//         `${API}/replies/${selectedTicket._id}`,
//         {
//           method: "POST",
//           headers: getAuthHeaders(),
//           body: JSON.stringify({
//             message: reply.trim(),
//           }),
//         }
//       );

//       const data = await response.json();

//       if (
//         response.status === 401 ||
//         response.status === 403
//       ) {
//         setError(
//           data.message || "Access denied"
//         );
//         return;
//       }

//       if (!response.ok || !data.success) {
//         setError(
//           data.message ||
//             "Unable to add reply"
//         );
//         return;
//       }

//       setReply("");

//       setMessage(
//         "Reply added successfully"
//       );

//       await fetchReplies(
//         selectedTicket._id
//       );
//     } catch (err) {
//       console.error(
//         "Send Reply Error:",
//         err
//       );

//       setError("Unable to send reply");
//     } finally {
//       setReplyLoading(false);
//     }
//   };

//   // =====================================================
//   // UPDATE STATUS
//   // =====================================================

//   const updateStatus = async (status) => {
//     if (!selectedTicket) return;

//     try {
//       setActionLoading(true);
//       setError("");
//       setMessage("");

//       const response = await fetch(
//         `${API}/tickets/${selectedTicket._id}/status`,
//         {
//           method: "PATCH",
//           headers: getAuthHeaders(),
//           body: JSON.stringify({
//             status,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (
//         response.status === 401 ||
//         response.status === 403
//       ) {
//         setError(
//           data.message || "Access denied"
//         );
//         return;
//       }

//       if (!response.ok || !data.success) {
//         setError(
//           data.message ||
//             "Unable to update ticket status"
//         );
//         return;
//       }

//       const updatedTicket =
//         data.data?.ticket || {
//           ...selectedTicket,
//           status,
//         };

//       setSelectedTicket(updatedTicket);

//       setTickets((previous) =>
//         previous.map((ticket) =>
//           ticket._id === updatedTicket._id
//             ? updatedTicket
//             : ticket
//         )
//       );

//       setMessage(
//         `Ticket status updated to ${status
//           .replace("-", " ")
//           .toUpperCase()}`
//       );
//     } catch (err) {
//       console.error(
//         "Update Status Error:",
//         err
//       );

//       setError(
//         "Unable to update ticket status"
//       );
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // =====================================================
//   // REOPEN TICKET - CUSTOMER
//   // =====================================================

//   const reopenTicket = async () => {
//     if (!selectedTicket) return;

//     try {
//       setActionLoading(true);
//       setError("");
//       setMessage("");

//       const response = await fetch(
//         `${API}/tickets/${selectedTicket._id}/reopen`,
//         {
//           method: "PATCH",
//           headers: getAuthHeaders(),
//         }
//       );

//       const data = await response.json();

//       if (
//         response.status === 401 ||
//         response.status === 403
//       ) {
//         setError(
//           data.message || "Access denied"
//         );
//         return;
//       }

//       if (!response.ok || !data.success) {
//         setError(
//           data.message ||
//             "Unable to reopen ticket"
//         );
//         return;
//       }

//       const updatedTicket =
//         data.data?.ticket || {
//           ...selectedTicket,
//           status: "in-progress",
//         };

//       setSelectedTicket(updatedTicket);

//       setTickets((previous) =>
//         previous.map((ticket) =>
//           ticket._id === updatedTicket._id
//             ? updatedTicket
//             : ticket
//         )
//       );

//       setMessage(
//         "Ticket reopened. Status: IN-PROGRESS"
//       );
//     } catch (err) {
//       console.error(
//         "Reopen Ticket Error:",
//         err
//       );

//       setError(
//         "Unable to reopen ticket"
//       );
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // =====================================================
//   // CLOSE DETAIL
//   // =====================================================

//   const closeTicketDetail = () => {
//     setSelectedTicket(null);
//     setReplies([]);
//     setReply("");

//     setMessage("");
//     setError("");
//   };

//   // =====================================================
//   // AUTH PAGE
//   // =====================================================

//   if (!token) {
//     return (
//       <div className="auth-page">

//         <div className="auth-card">

//           <div className="auth-logo">
//             DH
//           </div>

//           <h1>
//             {authMode === "login"
//               ? "Welcome back"
//               : "Create your account"}
//           </h1>

//           <p className="auth-subtitle">
//             {authMode === "login"
//               ? "Login to your DeskHub account"
//               : "Join DeskHub as a Customer or Agent"}
//           </p>

//           <div className="auth-tabs">

//             <button
//               type="button"
//               className={
//                 authMode === "login"
//                   ? "auth-tab active"
//                   : "auth-tab"
//               }
//               onClick={() => {
//                 setAuthMode("login");
//                 setAuthError("");
//               }}
//             >
//               Login
//             </button>

//             <button
//               type="button"
//               className={
//                 authMode === "register"
//                   ? "auth-tab active"
//                   : "auth-tab"
//               }
//               onClick={() => {
//                 setAuthMode("register");
//                 setAuthError("");
//               }}
//             >
//               Register
//             </button>

//           </div>

//           {/* LOGIN */}

//           {authMode === "login" ? (

//             <form
//               onSubmit={handleLogin}
//               className="auth-form"
//             >

//               <div className="form-group">

//                 <label>
//                   Email
//                 </label>

//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => {
//                     setEmail(e.target.value);
//                     setAuthError("");
//                   }}
//                   placeholder="Enter your email"
//                   autoComplete="email"
//                 />

//               </div>

//               <div className="form-group">

//                 <label>
//                   Password
//                 </label>

//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => {
//                     setPassword(e.target.value);
//                     setAuthError("");
//                   }}
//                   placeholder="Enter your password"
//                   autoComplete="current-password"
//                 />

//               </div>

//               {authError && (
//                 <div className="auth-error">
//                   {authError}
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 className="login-btn"
//                 disabled={authLoading}
//               >
//                 {authLoading
//                   ? "Logging in..."
//                   : "Login"}
//               </button>

//               <div className="auth-switch">

//                 <span>
//                   Don't have an account?
//                 </span>

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setAuthMode("register");
//                     setAuthError("");
//                   }}
//                 >
//                   Register
//                 </button>

//               </div>

//             </form>

//           ) : (

//             /* REGISTER */

//             <form
//               onSubmit={handleRegister}
//               className="auth-form"
//             >

//               <div className="form-group">

//                 <label>
//                   Full Name
//                 </label>

//                 <input
//                   type="text"
//                   value={name}
//                   onChange={(e) => {
//                     setName(e.target.value);
//                     setAuthError("");
//                   }}
//                   placeholder="Enter your full name"
//                   autoComplete="name"
//                 />

//               </div>

//               <div className="form-group">

//                 <label>
//                   Email
//                 </label>

//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => {
//                     setEmail(e.target.value);
//                     setAuthError("");
//                   }}
//                   placeholder="Enter your email"
//                   autoComplete="email"
//                 />

//               </div>

//               <div className="form-group">

//                 <label>
//                   Password
//                 </label>

//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => {
//                     setPassword(e.target.value);
//                     setAuthError("");
//                   }}
//                   placeholder="Minimum 6 characters"
//                   autoComplete="new-password"
//                 />

//               </div>

//               <div className="form-group">

//                 <label>
//                   Account Type
//                 </label>

//                 <div className="role-options">

//                   <button
//                     type="button"
//                     className={
//                       role === "customer"
//                         ? "role-option active"
//                         : "role-option"
//                     }
//                     onClick={() => setRole("customer")}
//                   >
//                     <span className="role-icon">
//                       👤
//                     </span>

//                     <strong>
//                       Customer
//                     </strong>

//                     <small>
//                       Create and track tickets
//                     </small>
//                   </button>

//                   <button
//                     type="button"
//                     className={
//                       role === "agent"
//                         ? "role-option active"
//                         : "role-option"
//                     }
//                     onClick={() => setRole("agent")}
//                   >
//                     <span className="role-icon">
//                       🛠️
//                     </span>

//                     <strong>
//                       Agent
//                     </strong>

//                     <small>
//                       Manage support tickets
//                     </small>
//                   </button>

//                 </div>

//               </div>

//               {authError && (
//                 <div className="auth-error">
//                   {authError}
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 className="login-btn"
//                 disabled={authLoading}
//               >
//                 {authLoading
//                   ? "Creating account..."
//                   : "Create Account"}
//               </button>

//               <div className="auth-switch">

//                 <span>
//                   Already have an account?
//                 </span>

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setAuthMode("login");
//                     setAuthError("");
//                   }}
//                 >
//                   Login
//                 </button>

//               </div>

//             </form>

//           )}

//         </div>

//       </div>
//     );
//   }

//   // =====================================================
//   // LOADING
//   // =====================================================

//   if (loading && !selectedTicket) {
//     return (
//       <div className="loading-screen">

//         <div className="loader"></div>

//         <h3>
//           Loading DeskHub...
//         </h3>

//         <p>
//           Preparing your support dashboard
//         </p>

//       </div>
//     );
//   }

//   // =====================================================
//   // MAIN APP
//   // =====================================================

//   return (
//     <div className="app">

//       {/* =================================================
//           NAVBAR
//       ================================================= */}

//       <header className="navbar">

//         <div className="navbar-inner">

//           <div className="brand">

//             <div className="brand-logo">
//               DH
//             </div>

//             <div>
//               <div className="brand-name">
//                 DeskHub
//               </div>

//               <div className="brand-role">
//                 {user?.role === "agent"
//                   ? "Support Agent"
//                   : "Customer Portal"}
//               </div>
//             </div>

//           </div>

//           <div className="navbar-right">

//             <div className="user-info">

//               <div className="user-avatar">
//                 {(
//                   user?.name || "U"
//                 )
//                   .charAt(0)
//                   .toUpperCase()}
//               </div>

//               <div>

//                 <strong>
//                   {user?.name || "User"}
//                 </strong>

//                 <span>
//                   {user?.role}
//                 </span>

//               </div>

//             </div>

//             <button
//               className="logout-btn"
//               onClick={logout}
//             >
//               Logout
//             </button>

//           </div>

//         </div>

//       </header>

//       {/* =================================================
//           MAIN
//       ================================================= */}

//       <main className="main-container">

//         {selectedTicket ? (

//           /* =================================================
//              TICKET DETAIL
//           ================================================= */

//           <div className="ticket-detail-page">

//             <button
//               className="back-btn"
//               onClick={closeTicketDetail}
//             >
//               ← Back to Dashboard
//             </button>

//             {message && (
//               <div className="success-message">
//                 {message}
//               </div>
//             )}

//             {error && (
//               <div className="error-message">
//                 {error}
//               </div>
//             )}

//             {/* DETAIL CARD */}

//             <div className="detail-card">

//               <div className="detail-header">

//                 <div>

//                   <div className="ticket-number">
//                     Ticket #
//                     {String(
//                       selectedTicket._id || ""
//                     ).slice(-6)}
//                   </div>

//                   <h1>
//                     {selectedTicket.title ||
//                       "Untitled Ticket"}
//                   </h1>

//                   <p className="ticket-id">
//                     Created{" "}
//                     {selectedTicket.createdAt
//                       ? new Date(
//                           selectedTicket.createdAt
//                         ).toLocaleString()
//                       : "-"}
//                   </p>

//                 </div>

//                 <span
//                   className={`status-badge ${String(
//                     selectedTicket.status ||
//                       "open"
//                   ).toLowerCase()}`}
//                 >
//                   {selectedTicket.status ||
//                     "open"}
//                 </span>

//               </div>

//               <div className="divider"></div>

//               <div className="detail-meta">

//                 <div>
//                   <span>
//                     Category
//                   </span>

//                   <strong>
//                     {selectedTicket.category}
//                   </strong>
//                 </div>

//                 <div>
//                   <span>
//                     Priority
//                   </span>

//                   <strong>
//                     {selectedTicket.priority}
//                   </strong>
//                 </div>

//                 <div>
//                   <span>
//                     Customer
//                   </span>

//                   <strong>
//                     {selectedTicket.createdBy?.name ||
//                       "Customer"}
//                   </strong>
//                 </div>

//                 <div>
//                   <span>
//                     Assigned Agent
//                   </span>

//                   <strong>
//                     {selectedTicket.assignedTo?.name ||
//                       "Unassigned"}
//                   </strong>
//                 </div>

//               </div>

//               <div className="divider"></div>

//               <section className="description-section">

//                 <h3>
//                   Issue Description
//                 </h3>

//                 <p>
//                   {selectedTicket.description}
//                 </p>

//               </section>

//             </div>

//             {/* AGENT ACTIONS */}

//             {user?.role === "agent" && (

//               <div className="action-card">

//                 <div className="action-card-header">

//                   <div>

//                     <span className="eyebrow">
//                       AGENT ACTIONS
//                     </span>

//                     <h2>
//                       Ticket Management
//                     </h2>

//                   </div>

//                   {selectedTicket.assignedTo ? (
//                     <span className="assigned-label">
//                       Assigned
//                     </span>
//                   ) : (
//                     <span className="unassigned-label">
//                       Unassigned
//                     </span>
//                   )}

//                 </div>

//                 {!selectedTicket.assignedTo && (

//                   <button
//                     className="assign-btn"
//                     onClick={assignTicketToMe}
//                     disabled={actionLoading}
//                   >
//                     {actionLoading
//                       ? "Assigning..."
//                       : "Assign Ticket to Me →"}
//                   </button>

//                 )}

//                 {selectedTicket.assignedTo && (
//                   <div className="status-buttons">

//                     <button
//                       className="status-btn progress-btn"
//                       onClick={() =>
//                         updateStatus(
//                           "in-progress"
//                         )
//                       }
//                       disabled={actionLoading}
//                     >
//                       In-Progress
//                     </button>

//                     <button
//                       className="status-btn resolve-btn"
//                       onClick={() =>
//                         updateStatus(
//                           "resolved"
//                         )
//                       }
//                       disabled={actionLoading}
//                     >
//                       Resolve
//                     </button>

//                     <button
//                       className="status-btn close-btn"
//                       onClick={() =>
//                         updateStatus(
//                           "closed"
//                         )
//                       }
//                       disabled={actionLoading}
//                     >
//                       Close
//                     </button>

//                   </div>
//                 )}

//               </div>

//             )}

//             {/* CUSTOMER REOPEN */}

//             {user?.role === "customer" &&
//               selectedTicket.status ===
//                 "resolved" && (

//                 <div className="reopen-card">

//                   <div>

//                     <span className="eyebrow">
//                       TICKET RESOLVED
//                     </span>

//                     <h3>
//                       Need more help?
//                     </h3>

//                     <p>
//                       Reopen this ticket to
//                       continue the conversation
//                       with our support team.
//                     </p>

//                   </div>

//                   <button
//                     className="reopen-btn"
//                     onClick={reopenTicket}
//                     disabled={actionLoading}
//                   >
//                     {actionLoading
//                       ? "Reopening..."
//                       : "Reopen Ticket"}
//                   </button>

//                 </div>

//               )}

//             {/* CONVERSATION */}

//             <div className="conversation-card">

//               <div className="conversation-header">

//                 <div>

//                   <span className="eyebrow">
//                     SUPPORT
//                   </span>

//                   <h2>
//                     Conversation
//                   </h2>

//                 </div>

//                 <span>
//                   {replies.length}{" "}
//                   {replies.length === 1
//                     ? "Reply"
//                     : "Replies"}
//                 </span>

//               </div>

//               <div className="replies">

//                 {replies.length === 0 ? (

//                   <div className="no-replies">

//                     <div className="no-replies-icon">
//                       💬
//                     </div>

//                     <strong>
//                       No replies yet
//                     </strong>

//                     <span>
//                       Start the conversation
//                       below.
//                     </span>

//                   </div>

//                 ) : (

//                   replies.map(
//                     (item, index) => (

//                       <div
//                         className={`reply-item ${
//                           item.user?.role ===
//                           "agent"
//                             ? "agent-reply"
//                             : "customer-reply"
//                         }`}
//                         key={
//                           item._id ||
//                           index
//                         }
//                       >

//                         <div className="reply-header">

//                           <div className="reply-user">

//                             <div className="reply-avatar">
//                               {(
//                                 item.user?.name ||
//                                 "U"
//                               )
//                                 .charAt(0)
//                                 .toUpperCase()}
//                             </div>

//                             <div>

//                               <strong>
//                                 {item.user?.name ||
//                                   "User"}
//                               </strong>

//                               <small>
//                                 {item.user?.role ||
//                                   "customer"}
//                               </small>

//                             </div>

//                           </div>

//                           <span>
//                             {item.createdAt
//                               ? new Date(
//                                   item.createdAt
//                                 ).toLocaleString()
//                               : ""}
//                           </span>

//                         </div>

//                         <p>
//                           {item.message}
//                         </p>

//                       </div>

//                     )
//                   )

//                 )}

//               </div>

//               {/* REPLY FORM */}

//               {selectedTicket.status !==
//                 "closed" && (
//                 <div className="reply-form">

//                   <div className="reply-form-title">

//                     <div>

//                       <h3>
//                         Add Reply
//                       </h3>

//                       <span>
//                         Reply as{" "}
//                         <strong>
//                           {user?.role}
//                         </strong>
//                       </span>

//                     </div>

//                   </div>

//                   <textarea
//                     value={reply}
//                     onChange={(e) =>
//                       setReply(
//                         e.target.value
//                       )
//                     }
//                     placeholder="Write your message..."
//                     disabled={replyLoading}
//                   />

//                   <div className="reply-actions">

//                     <span>
//                       {reply.length} characters
//                     </span>

//                     <button
//                       className="send-btn"
//                       onClick={sendReply}
//                       disabled={
//                         !reply.trim() ||
//                         replyLoading
//                       }
//                     >
//                       {replyLoading
//                         ? "Sending..."
//                         : "Send Reply →"}
//                     </button>

//                   </div>

//                 </div>
//               )}

//               {selectedTicket.status ===
//                 "closed" && (

//                 <div className="closed-notice">
//                   🔒 This ticket is closed and
//                   cannot receive new replies.
//                 </div>

//               )}

//             </div>

//           </div>

//         ) : (

//           /* =================================================
//              DASHBOARD
//           ================================================= */

//           <>

//             <div className="page-header">

//               <div>

//                 <span className="eyebrow">
//                   DESKHUB
//                 </span>

//                 <h1>
//                   {user?.role === "agent"
//                     ? "Support Dashboard"
//                     : "My Support Dashboard"}
//                 </h1>

//                 <p>
//                   {user?.role === "agent"
//                     ? "Manage, search and resolve customer support tickets."
//                     : "Create and track your support requests."}
//                 </p>

//               </div>

//               {user?.role === "customer" && (

//                 <button
//                   className="create-ticket-btn"
//                   onClick={() => {
//                     setShowCreateTicket(
//                       !showCreateTicket
//                     );
//                     setError("");
//                     setMessage("");
//                     setCreateTicketError("");
//                   }}
//                 >
//                   {showCreateTicket
//                     ? "× Cancel"
//                     : "+ Create Ticket"}
//                 </button>

//               )}

//             </div>

//             {message && (
//               <div className="success-message">
//                 {message}
//               </div>
//             )}

//             {error && (
//               <div className="error-message">
//                 {error}
//               </div>
//             )}

//             {/* =================================================
//                 CREATE TICKET
//             ================================================= */}

//             {showCreateTicket &&
//               user?.role === "customer" && (

//                 <div className="create-card">

//                   <div className="create-header">

//                     <div>

//                       <span className="eyebrow">
//                         NEW REQUEST
//                       </span>

//                       <h2>
//                         Create Support Ticket
//                       </h2>

//                     </div>

//                     <button
//                       className="close-create-btn"
//                       onClick={() =>
//                         setShowCreateTicket(false)
//                       }
//                     >
//                       ×
//                     </button>

//                   </div>

//                   <form
//                     onSubmit={handleCreateTicket}
//                   >

//                     <div className="create-grid">

//                       <div className="form-group">

//                         <label>
//                           Ticket Title
//                         </label>

//                         <input
//                           type="text"
//                           value={ticketTitle}
//                           onChange={(e) =>
//                             setTicketTitle(
//                               e.target.value
//                             )
//                           }
//                           placeholder="What do you need help with?"
//                         />

//                       </div>

//                       <div className="form-group">

//                         <label>
//                           Category
//                         </label>

//                         <select
//                           value={ticketCategory}
//                           onChange={(e) =>
//                             setTicketCategory(
//                               e.target.value
//                             )
//                           }
//                         >
//                           <option value="general">
//                             General
//                           </option>

//                           <option value="technical">
//                             Technical
//                           </option>

//                           <option value="billing">
//                             Billing
//                           </option>

//                           <option value="account">
//                             Account
//                           </option>
//                         </select>

//                       </div>

//                       <div className="form-group">

//                         <label>
//                           Priority
//                         </label>

//                         <select
//                           value={ticketPriority}
//                           onChange={(e) =>
//                             setTicketPriority(
//                               e.target.value
//                             )
//                           }
//                         >
//                           <option value="low">
//                             Low
//                           </option>

//                           <option value="medium">
//                             Medium
//                           </option>

//                           <option value="high">
//                             High
//                           </option>

//                           <option value="urgent">
//                             Urgent
//                           </option>
//                         </select>

//                       </div>

//                       <div className="form-group full">

//                         <label>
//                           Description
//                         </label>

//                         <textarea
//                           value={
//                             ticketDescription
//                           }
//                           onChange={(e) =>
//                             setTicketDescription(
//                               e.target.value
//                             )
//                           }
//                           placeholder="Describe your issue in detail..."
//                           rows="6"
//                         />

//                       </div>

//                     </div>

//                     {createTicketError && (
//                       <div className="error-message">
//                         {createTicketError}
//                       </div>
//                     )}

//                     <div className="create-footer">

//                       <span>
//                         Your ticket will be
//                         visible to support agents.
//                       </span>

//                       <button
//                         type="submit"
//                         className="primary-btn"
//                         disabled={
//                           createTicketLoading
//                         }
//                       >
//                         {createTicketLoading
//                           ? "Creating..."
//                           : "Create Ticket"}
//                       </button>

//                     </div>

//                   </form>

//                 </div>

//               )}

//             {/* =================================================
//                 STATS
//             ================================================= */}

//             <div className="stats-grid">

//               <button
//                 className={`stat-card ${
//                   statusFilter === "all"
//                     ? "active"
//                     : ""
//                 }`}
//                 onClick={() => {
//                   setStatusFilter("all");
//                 }}
//               >
//                 <span>
//                   Total Tickets
//                 </span>

//                 <strong>
//                   {stats.total}
//                 </strong>

//                 <small>
//                   All support requests
//                 </small>
//               </button>

//               <button
//                 className={`stat-card ${
//                   statusFilter === "open"
//                     ? "active"
//                     : ""
//                 }`}
//                 onClick={() =>
//                   setStatusFilter("open")
//                 }
//               >
//                 <span>
//                   Open
//                 </span>

//                 <strong>
//                   {stats.open}
//                 </strong>

//                 <small>
//                   Waiting for action
//                 </small>
//               </button>

//               <button
//                 className={`stat-card ${
//                   statusFilter === "in-progress"
//                     ? "active"
//                     : ""
//                 }`}
//                 onClick={() =>
//                   setStatusFilter("in-progress")
//                 }
//               >
//                 <span>
//                   In-Progress
//                 </span>

//                 <strong>
//                   {stats.inProgress}
//                 </strong>

//                 <small>
//                   Currently being handled
//                 </small>
//               </button>

//               <button
//                 className={`stat-card ${
//                   statusFilter === "resolved"
//                     ? "active"
//                     : ""
//                 }`}
//                 onClick={() =>
//                   setStatusFilter("resolved")
//                 }
//               >
//                 <span>
//                   Resolved
//                 </span>

//                 <strong>
//                   {stats.resolved}
//                 </strong>

//                 <small>
//                   Successfully resolved
//                 </small>
//               </button>

//               <button
//                 className={`stat-card ${
//                   statusFilter === "closed"
//                     ? "active"
//                     : ""
//                 }`}
//                 onClick={() =>
//                   setStatusFilter("closed")
//                 }
//               >
//                 <span>
//                   Closed
//                 </span>

//                 <strong>
//                   {stats.closed}
//                 </strong>

//                 <small>
//                   Completed tickets
//                 </small>
//               </button>

//             </div>

//             {/* =================================================
//                 FILTER / SEARCH
//             ================================================= */}

//             <div className="filter-card">

//               <div className="filter-top">

//                 <div>

//                   <span className="eyebrow">
//                     TICKET MANAGEMENT
//                   </span>

//                   <h2>
//                     {user?.role === "agent"
//                       ? "All Customer Tickets"
//                       : "My Tickets"}
//                   </h2>

//                 </div>

//                 <span className="result-count">
//                   {filteredTickets.length} of{" "}
//                   {tickets.length} tickets
//                 </span>

//               </div>

//               <div className="filter-row">

//                 <div className="search-box">

//                   <span>
//                     🔎
//                   </span>

//                   <input
//                     type="text"
//                     value={search}
//                     onChange={(e) =>
//                       setSearch(
//                         e.target.value
//                       )
//                     }
//                     placeholder="Search tickets, customer, ID..."
//                   />

//                   {search && (
//                     <button
//                       onClick={() =>
//                         setSearch("")
//                       }
//                     >
//                       ×
//                     </button>
//                   )}

//                 </div>

//                 <select
//                   value={statusFilter}
//                   onChange={(e) =>
//                     setStatusFilter(
//                       e.target.value
//                     )
//                   }
//                 >
//                   <option value="all">
//                     All Status
//                   </option>

//                   <option value="open">
//                     Open
//                   </option>

//                   <option value="in-progress">
//                     In-Progress
//                   </option>

//                   <option value="resolved">
//                     Resolved
//                   </option>

//                   <option value="closed">
//                     Closed
//                   </option>
//                 </select>

//                 <select
//                   value={categoryFilter}
//                   onChange={(e) =>
//                     setCategoryFilter(
//                       e.target.value
//                     )
//                   }
//                 >
//                   <option value="all">
//                     All Categories
//                   </option>

//                   <option value="technical">
//                     Technical
//                   </option>

//                   <option value="billing">
//                     Billing
//                   </option>

//                   <option value="account">
//                     Account
//                   </option>

//                   <option value="general">
//                     General
//                   </option>
//                 </select>

//                 <select
//                   value={priorityFilter}
//                   onChange={(e) =>
//                     setPriorityFilter(
//                       e.target.value
//                     )
//                   }
//                 >
//                   <option value="all">
//                     All Priority
//                   </option>

//                   <option value="low">
//                     Low
//                   </option>

//                   <option value="medium">
//                     Medium
//                   </option>

//                   <option value="high">
//                     High
//                   </option>

//                   <option value="urgent">
//                     Urgent
//                   </option>
//                 </select>

//                 {(search ||
//                   statusFilter !== "all" ||
//                   categoryFilter !== "all" ||
//                   priorityFilter !== "all") && (

//                   <button
//                     className="clear-filter-btn"
//                     onClick={clearFilters}
//                   >
//                     Clear
//                   </button>

//                 )}

//               </div>

//             </div>

//             {/* =================================================
//                 TICKET LIST
//             ================================================= */}

//             {filteredTickets.length === 0 ? (

//               <div className="empty-card">

//                 <div className="empty-icon">
//                   {tickets.length === 0
//                     ? "✓"
//                     : "🔎"}
//                 </div>

//                 <h3>
//                   {tickets.length === 0
//                     ? user?.role === "agent"
//                       ? "No tickets available"
//                       : "No tickets yet"
//                     : "No matching tickets"}
//                 </h3>

//                 <p>
//                   {tickets.length === 0
//                     ? user?.role === "agent"
//                       ? "New customer tickets will appear here."
//                       : "Create your first support ticket to get help."
//                     : "Try changing your search or filters."}
//                 </p>

//                 {tickets.length > 0 && (
//                   <button
//                     className="secondary-btn"
//                     onClick={clearFilters}
//                   >
//                     Clear Filters
//                   </button>
//                 )}

//                 {tickets.length === 0 &&
//                   user?.role === "customer" && (

//                     <button
//                       className="primary-btn"
//                       onClick={() =>
//                         setShowCreateTicket(true)
//                       }
//                     >
//                       + Create Ticket
//                     </button>

//                   )}

//               </div>

//             ) : (

//               <div className="tickets-list">

//                 {filteredTickets.map(
//                   (ticket) => (

//                     <div
//                       className="ticket-card"
//                       key={ticket._id}
//                     >

//                       <div className="ticket-top">

//                         <div>

//                           <div className="ticket-number">
//                             #
//                             {String(
//                               ticket._id
//                             ).slice(-6)}
//                           </div>

//                           <h2>
//                             {ticket.title ||
//                               "Untitled Ticket"}
//                           </h2>

//                         </div>

//                         <span
//                           className={`status-badge ${String(
//                             ticket.status ||
//                               "open"
//                           ).toLowerCase()}`}
//                         >
//                           {ticket.status ||
//                             "open"}
//                         </span>

//                       </div>

//                       <p className="ticket-description">
//                         {ticket.description}
//                       </p>

//                       <div className="ticket-info">

//                         <div>

//                           <span>
//                             Category
//                           </span>

//                           <strong>
//                             {ticket.category}
//                           </strong>

//                         </div>

//                         <div>

//                           <span>
//                             Priority
//                           </span>

//                           <strong
//                             className={`priority-text ${ticket.priority}`}
//                           >
//                             {ticket.priority}
//                           </strong>

//                         </div>

//                         <div>

//                           <span>
//                             Customer
//                           </span>

//                           <strong>
//                             {ticket.createdBy
//                               ?.name ||
//                               "Customer"}
//                           </strong>

//                         </div>

//                         <div>

//                           <span>
//                             Agent
//                           </span>

//                           <strong>
//                             {ticket.assignedTo
//                               ?.name ||
//                               "Unassigned"}
//                           </strong>

//                         </div>

//                       </div>

//                       <div className="ticket-footer">

//                         <span className="ticket-date">
//                           {ticket.createdAt
//                             ? new Date(
//                                 ticket.createdAt
//                               ).toLocaleDateString()
//                             : "-"}
//                         </span>

//                         <button
//                           className="primary-outline-btn"
//                           onClick={() =>
//                             openTicket(
//                               ticket
//                             )
//                           }
//                         >
//                           View Ticket →
//                         </button>

//                       </div>

//                     </div>

//                   )
//                 )}

//               </div>

//             )}

//           </>

//         )}

//       </main>

//     </div>
//   );
// }

// export default App;




import React, { useEffect, useState } from "react";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import Dashboard from "./components/dashboard/Dashboard";

import TicketDetail from "./components/tickets/TicketDetail";
import Conversation from "./components/tickets/Conversation";

import { getCurrentUser } from "./utils/api";

import "./App.css";

function App() {
  // ============================
  // AUTH STATE
  // ============================

  const [user, setUser] = useState(null);

  const [authPage, setAuthPage] =
    useState("login");

  const [loading, setLoading] =
    useState(true);

  // ============================
  // TICKET STATE
  // ============================

  const [selectedTicket, setSelectedTicket] =
    useState(null);

  // ============================
  // CHECK LOGIN SESSION
  // ============================

  useEffect(() => {
    const checkUser = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await getCurrentUser();

        if (response?.success) {
          setUser(
            response.data?.user || null
          );
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error(
          "Session Error:",
          error
        );

        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // ============================
  // LOGIN SUCCESS
  // ============================

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setSelectedTicket(null);
  };

  // ============================
  // REGISTER SUCCESS
  // ============================

  const handleRegister = (registeredUser) => {
    setUser(registeredUser);
    setSelectedTicket(null);
  };

  // ============================
  // LOGOUT
  // ============================

  const handleLogout = () => {
    localStorage.removeItem("token");

    setUser(null);
    setSelectedTicket(null);
    setAuthPage("login");
  };

  // ============================
  // OPEN TICKET
  // ============================

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  // ============================
  // BACK TO DASHBOARD
  // ============================

  const handleBackToDashboard = () => {
    setSelectedTicket(null);
  };

  // ============================
  // UPDATE TICKET
  // ============================

  const handleTicketUpdated = (
    updatedTicket
  ) => {
    setSelectedTicket(updatedTicket);
  };

  // ============================
  // LOADING SCREEN
  // ============================

  if (loading) {
    return (
      <div className="app-loading">

        <div className="loading-spinner"></div>

        <h2>
          SupportDesk
        </h2>

        <p>
          Checking your session...
        </p>

      </div>
    );
  }

  // ============================
  // AUTH SCREEN
  // ============================

  if (!user) {
    return (
      <div className="auth-wrapper">

        {authPage === "login" ? (
          <Login
            onLogin={handleLogin}
            onRegister={() =>
              setAuthPage("register")
            }
          />
        ) : (
          <Register
            onRegister={handleRegister}
            onSwitchToLogin={() =>
              setAuthPage("login")
            }
          />
        )}

      </div>
    );
  }

  // ============================
  // TICKET DETAIL
  // ============================

  if (selectedTicket) {
    return (
      <div className="app">

        <TicketDetail
          ticket={selectedTicket}
          user={user}
          onBack={
            handleBackToDashboard
          }
          onTicketUpdated={
            handleTicketUpdated
          }
        />

        <Conversation
          ticket={selectedTicket}
          user={user}
        />

      </div>
    );
  }

  // ============================
  // DASHBOARD
  // ============================

  return (
    <div className="app">

      <Dashboard
        user={user}
        onLogout={handleLogout}
        onViewTicket={
          handleViewTicket
        }
      />

    </div>
  );
}

export default App;