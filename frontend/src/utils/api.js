const API = "http://localhost:5000/api";

// ============================
// AUTH HEADERS
// ============================
const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

// ============================
// HANDLE RESPONSE
// ============================
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// ============================
// AUTH
// ============================

// Login
export const loginUser = async (email, password) => {
  const response = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return handleResponse(response);
};

// Register
export const registerUser = async (
  name,
  email,
  password,
  role
) => {
  const response = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
      role,
    }),
  });

  return handleResponse(response);
};

// Get current user
export const getCurrentUser = async () => {
  const response = await fetch(`${API}/auth/me`, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse(response);
};

// ============================
// TICKETS
// ============================

// Customer - Create ticket
export const createTicket = async (ticketData) => {
  const response = await fetch(`${API}/tickets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(ticketData),
  });

  return handleResponse(response);
};

// Customer - My tickets
export const getMyTickets = async () => {
  const response = await fetch(`${API}/tickets/my`, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse(response);
};

// Agent - All tickets
export const getAllTickets = async () => {
  const response = await fetch(`${API}/tickets`, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse(response);
};

// Agent - Assigned tickets
export const getAssignedTickets = async () => {
  const response = await fetch(`${API}/tickets/assigned`, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse(response);
};

// Get single ticket
export const getTicketById = async (ticketId) => {
  const response = await fetch(
    `${API}/tickets/${ticketId}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};

// Agent - Assign ticket
export const assignTicket = async (ticketId) => {
  const response = await fetch(
    `${API}/tickets/${ticketId}/assign`,
    {
      method: "PATCH",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};

// Agent - Update ticket status
export const updateTicketStatus = async (
  ticketId,
  status
) => {
  const response = await fetch(
    `${API}/tickets/${ticketId}/status`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        status,
      }),
    }
  );

  return handleResponse(response);
};

// Customer - Reopen ticket
export const reopenTicket = async (ticketId) => {
  const response = await fetch(
    `${API}/tickets/${ticketId}/reopen`,
    {
      method: "PATCH",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};

// ============================
// REPLIES
// ============================

// Get replies
export const getReplies = async (ticketId) => {
  const response = await fetch(
    `${API}/replies/${ticketId}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};

// Add reply
export const addReply = async (
  ticketId,
  message
) => {
  const response = await fetch(
    `${API}/replies/${ticketId}`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        message,
      }),
    }
  );

  return handleResponse(response);
};

// ============================
// EXPORT API URL
// ============================
export default API;