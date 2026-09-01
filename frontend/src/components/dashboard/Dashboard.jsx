import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getMyTickets,
  getAllTickets,
  getAssignedTickets,
} from "../../utils/api";

import DashboardHeader from "./DashboardHeader";
import DashboardStats from "./DashboardStats";
import TicketFilters from "./TicketFilters";
import TicketList from "./TicketList";
import CreateTicket from "../tickets/CreateTicket";

function Dashboard({ user, onLogout, onViewTicket }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [priorityFilter, setPriorityFilter] =
    useState("all");
  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [showCreateTicket, setShowCreateTicket] =
    useState(false);

  const isAgent = user?.role === "agent";
  const isCustomer = user?.role === "customer";

  // ============================
  // FETCH TICKETS
  // ============================
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (isAgent) {
        response = await getAllTickets();
      } else {
        response = await getMyTickets();
      }

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to fetch tickets"
        );
      }

      setTickets(
        response.data?.tickets || []
      );
    } catch (err) {
      console.error(
        "Dashboard Tickets Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load tickets"
      );
    } finally {
      setLoading(false);
    }
  }, [isAgent]);

  // ============================
  // INITIAL LOAD
  // ============================
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // ============================
  // FILTER TICKETS
  // ============================
  const filteredTickets = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !searchText ||
        ticket.title
          ?.toLowerCase()
          .includes(searchText) ||
        ticket.description
          ?.toLowerCase()
          .includes(searchText) ||
        ticket.category
          ?.toLowerCase()
          .includes(searchText) ||
        ticket.createdBy?.name
          ?.toLowerCase()
          .includes(searchText) ||
        ticket.createdBy?.email
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        ticket.priority === priorityFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        ticket.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory
      );
    });
  }, [
    tickets,
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
  ]);

  // ============================
  // STATISTICS
  // ============================
  const stats = useMemo(() => {
    return {
      total: tickets.length,

      open: tickets.filter(
        (ticket) =>
          ticket.status === "open"
      ).length,

      inProgress: tickets.filter(
        (ticket) =>
          ticket.status === "in-progress"
      ).length,

      resolved: tickets.filter(
        (ticket) =>
          ticket.status === "resolved"
      ).length,

      closed: tickets.filter(
        (ticket) =>
          ticket.status === "closed"
      ).length,

      urgent: tickets.filter(
        (ticket) =>
          ticket.priority === "urgent"
      ).length,
    };
  }, [tickets]);

  // ============================
  // NEW TICKET CREATED
  // ============================
  const handleTicketCreated = (ticket) => {
    setTickets((prev) => [
      ticket,
      ...prev,
    ]);

    setShowCreateTicket(false);
  };

  // ============================
  // CLEAR FILTERS
  // ============================
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setCategoryFilter("all");
  };

  // ============================
  // CREATE TICKET PAGE
  // ============================
  if (
    isCustomer &&
    showCreateTicket
  ) {
    return (
      <CreateTicket
        onBack={() =>
          setShowCreateTicket(false)
        }
        onTicketCreated={
          handleTicketCreated
        }
      />
    );
  }

  return (
    <div className="dashboard">

      {/* ============================
          HEADER
      ============================ */}

      <DashboardHeader
        user={user}
        onLogout={onLogout}
        onCreateTicket={() =>
          setShowCreateTicket(true)
        }
        isCustomer={isCustomer}
      />

      {/* ============================
          MAIN
      ============================ */}

      <main className="dashboard-main">

        {/* Welcome */}

        <div className="dashboard-intro">

          <div>
            <span className="page-eyebrow">
              {isAgent
                ? "AGENT WORKSPACE"
                : "CUSTOMER PORTAL"}
            </span>

            <h1>
              {isAgent
                ? "Support Dashboard"
                : "My Support Tickets"}
            </h1>

            <p>
              {isAgent
                ? "Manage customer tickets, conversations and resolutions from one place."
                : "Track your support requests and communicate with our support team."}
            </p>
          </div>

          {isCustomer && (
            <button
              className="create-ticket-main-btn"
              onClick={() =>
                setShowCreateTicket(true)
              }
            >
              + Create Ticket
            </button>
          )}

        </div>

        {/* ============================
            STATS
        ============================ */}

        <DashboardStats
          stats={stats}
          user={user}
        />

        {/* ============================
            FILTERS
        ============================ */}

        <TicketFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={
            setStatusFilter
          }
          priorityFilter={
            priorityFilter
          }
          setPriorityFilter={
            setPriorityFilter
          }
          categoryFilter={
            categoryFilter
          }
          setCategoryFilter={
            setCategoryFilter
          }
          clearFilters={clearFilters}
        />

        {/* ============================
            TICKET LIST
        ============================ */}

        <section className="dashboard-ticket-section">

          <div className="ticket-section-header">

            <div>
              <h2>
                {isAgent
                  ? "All Tickets"
                  : "My Tickets"}
              </h2>

              <p>
                Showing{" "}
                <strong>
                  {filteredTickets.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {tickets.length}
                </strong>{" "}
                tickets
              </p>
            </div>

            <button
              className="refresh-btn"
              onClick={fetchTickets}
              disabled={loading}
            >
              ↻{" "}
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>

          {/* ERROR */}

          {error && (
            <div className="error-message dashboard-error">
              <span>⚠</span>
              <div>
                <strong>
                  Unable to load tickets
                </strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* LOADING */}

          {loading ? (
            <div className="dashboard-loading">

              <div className="loader"></div>

              <p>
                Loading tickets...
              </p>

            </div>
          ) : (
            <TicketList
              tickets={filteredTickets}
              user={user}
              onViewTicket={onViewTicket}
              onRefresh={fetchTickets}
            />
          )}

        </section>

      </main>
    </div>
  );
}

export default Dashboard;