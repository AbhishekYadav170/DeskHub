import React, { useState } from "react";
import {
  assignTicket,
  updateTicketStatus,
  reopenTicket,
} from "../../utils/api";

function TicketDetail({
  ticket,
  user,
  onBack,
  onTicketUpdated,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!ticket) return null;

  const isAgent = user?.role === "agent";
  const isCustomer = user?.role === "customer";

  const status = ticket.status || "open";

  const isAssigned =
    ticket.assignedTo &&
    (
      ticket.assignedTo._id === user?.id ||
      ticket.assignedTo === user?.id
    );

  const assignedAgent =
    ticket.assignedTo?.name || "Unassigned";

  const customerName =
    ticket.createdBy?.name || "Customer";

  const formatStatus = (value) => {
    if (value === "in-progress") {
      return "In Progress";
    }

    return value
      .charAt(0)
      .toUpperCase() + value.slice(1);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const showSuccess = (text) => {
    setSuccess(text);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  // ============================
  // ASSIGN TICKET
  // ============================
  const handleAssign = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await assignTicket(
        ticket._id
      );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to assign ticket"
        );
      }

      const updatedTicket =
        response.data?.ticket;

      if (updatedTicket) {
        onTicketUpdated(updatedTicket);
      }

      showSuccess(
        "Ticket assigned successfully"
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to assign ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // STATUS UPDATE
  // ============================
  const handleStatusChange = async (
    newStatus
  ) => {
    try {
      setLoading(true);
      setError("");

      const response =
        await updateTicketStatus(
          ticket._id,
          newStatus
        );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to update status"
        );
      }

      const updatedTicket =
        response.data?.ticket;

      if (updatedTicket) {
        onTicketUpdated(updatedTicket);
      }

      showSuccess(
        `Ticket marked as ${formatStatus(
          newStatus
        )}`
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to update ticket status"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // REOPEN
  // ============================
  const handleReopen = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await reopenTicket(ticket._id);

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to reopen ticket"
        );
      }

      const updatedTicket =
        response.data?.ticket;

      if (updatedTicket) {
        onTicketUpdated(updatedTicket);
      }

      showSuccess(
        "Ticket reopened successfully"
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to reopen ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ticket-detail-page">

      {/* ============================
          BACK
      ============================ */}

      <button
        type="button"
        className="back-btn"
        onClick={onBack}
      >
        ← Back to Tickets
      </button>

      {/* ============================
          ALERTS
      ============================ */}

      {success && (
        <div className="success-message">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠ {error}
        </div>
      )}

      {/* ============================
          MAIN TICKET
      ============================ */}

      <section className="detail-card">

        <div className="detail-header">

          <div>
            <span className="detail-ticket-number">
              Ticket #
              {ticket._id
                ?.slice(-6)
                .toUpperCase()}
            </span>

            <h1>
              {ticket.title}
            </h1>

            <p className="ticket-id">
              ID: {ticket._id}
            </p>
          </div>

          <span
            className={`status-badge ${status}`}
          >
            {formatStatus(status)}
          </span>

        </div>

        <div className="divider" />

        {/* DESCRIPTION */}

        <div className="description-section">

          <h3>Description</h3>

          <p>
            {ticket.description}
          </p>

        </div>

        <div className="divider" />

        {/* TICKET INFORMATION */}

        <div className="details-grid">

          <div>
            <span>Category</span>
            <strong>
              {ticket.category}
            </strong>
          </div>

          <div>
            <span>Priority</span>

            <strong
              className={`priority-text ${ticket.priority}`}
            >
              {ticket.priority}
            </strong>
          </div>

          <div>
            <span>Customer</span>
            <strong>
              {customerName}
            </strong>
          </div>

          <div>
            <span>Assigned Agent</span>
            <strong>
              {assignedAgent}
            </strong>
          </div>

          <div>
            <span>Status</span>
            <strong>
              {formatStatus(status)}
            </strong>
          </div>

          <div>
            <span>Created</span>
            <strong>
              {formatDate(
                ticket.createdAt
              )}
            </strong>
          </div>

        </div>

      </section>

      {/* ============================
          AGENT MANAGEMENT
      ============================ */}

      {isAgent && (
        <section className="status-card">

          <div className="status-card-header">

            <div>
              <h2>
                Ticket Management
              </h2>

              <p>
                Manage assignment and
                ticket status.
              </p>
            </div>

          </div>

          {/* NOT ASSIGNED */}

          {!ticket.assignedTo && (
            <div className="assign-section">

              <div>
                <strong>
                  Ticket is unassigned
                </strong>

                <p>
                  Assign this ticket to
                  yourself to start working
                  on it.
                </p>
              </div>

              <button
                type="button"
                className="assign-btn"
                onClick={handleAssign}
                disabled={loading}
              >
                {loading
                  ? "Assigning..."
                  : "Assign to Me"}
              </button>

            </div>
          )}

          {/* ASSIGNED TO ME */}

          {isAssigned && (
            <div className="assigned-message">
              ✓ This ticket is assigned
              to you.
            </div>
          )}

          {/* STATUS BUTTONS */}

          {isAssigned && (
            <div className="status-management">

              <span className="status-label">
                Update Status
              </span>

              <div className="status-buttons">

                <button
                  type="button"
                  className={`status-btn progress-btn ${
                    status === "in-progress"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleStatusChange(
                      "in-progress"
                    )
                  }
                  disabled={loading}
                >
                  In Progress
                </button>

                <button
                  type="button"
                  className={`status-btn resolve-btn ${
                    status === "resolved"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleStatusChange(
                      "resolved"
                    )
                  }
                  disabled={loading}
                >
                  Resolve
                </button>

                <button
                  type="button"
                  className={`status-btn close-btn ${
                    status === "closed"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleStatusChange(
                      "closed"
                    )
                  }
                  disabled={loading}
                >
                  Close
                </button>

              </div>

            </div>
          )}

        </section>
      )}

      {/* ============================
          CUSTOMER REOPEN
      ============================ */}

      {isCustomer &&
        status === "resolved" && (
          <section className="reopen-card">

            <div>
              <h3>
                Need more help?
              </h3>

              <p>
                If your issue is not
                completely solved, you can
                reopen this ticket.
              </p>
            </div>

            <button
              type="button"
              className="reopen-btn"
              onClick={handleReopen}
              disabled={loading}
            >
              {loading
                ? "Reopening..."
                : "Reopen Ticket"}
            </button>

          </section>
        )}

      {/* ============================
          WORKFLOW
      ============================ */}

      <section className="workflow-card">

        <h3>Ticket Workflow</h3>

        <div className="workflow-steps">

          <div
            className={`workflow-step ${
              [
                "open",
                "in-progress",
                "resolved",
                "closed",
              ].includes(status)
                ? "completed"
                : ""
            }`}
          >
            <span>1</span>

            <div>
              <strong>
                Ticket Created
              </strong>

              <p>
                Customer creates a support
                ticket.
              </p>
            </div>
          </div>

          <div
            className={`workflow-step ${
              [
                "in-progress",
                "resolved",
                "closed",
              ].includes(status)
                ? "completed"
                : ""
            }`}
          >
            <span>2</span>

            <div>
              <strong>
                Agent Assigned
              </strong>

              <p>
                Agent accepts the ticket
                and starts working.
              </p>
            </div>
          </div>

          <div
            className={`workflow-step ${
              [
                "resolved",
                "closed",
              ].includes(status)
                ? "completed"
                : ""
            }`}
          >
            <span>3</span>

            <div>
              <strong>
                Resolution
              </strong>

              <p>
                Agent resolves the issue.
              </p>
            </div>
          </div>

          <div
            className={`workflow-step ${
              status === "closed"
                ? "completed"
                : ""
            }`}
          >
            <span>4</span>

            <div>
              <strong>
                Closed
              </strong>

              <p>
                Ticket is completely
                closed.
              </p>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}

export default TicketDetail;