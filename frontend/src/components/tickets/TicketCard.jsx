import React from "react";

function TicketCard({
  ticket,
  user,
  onViewTicket,
}) {
  const status = ticket?.status || "open";
  const priority = ticket?.priority || "medium";
  const category = ticket?.category || "general";

  const customerName =
    ticket?.createdBy?.name || "Customer";

  const agentName =
    ticket?.assignedTo?.name || "Unassigned";

  const isAgent = user?.role === "agent";

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

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <article className="ticket-card">

      {/* ============================
          TOP
      ============================ */}

      <div className="ticket-card-top">

        <div className="ticket-card-id">
          #{ticket?._id?.slice(-6).toUpperCase()}
        </div>

        <div className="ticket-card-badges">

          <span
            className={`ticket-status status-${status}`}
          >
            <span className="status-dot"></span>
            {formatStatus(status)}
          </span>

          <span
            className={`ticket-priority priority-${priority}`}
          >
            {priority}
          </span>

        </div>

      </div>

      {/* ============================
          CONTENT
      ============================ */}

      <div className="ticket-card-content">

        <h3>
          {ticket?.title || "Untitled Ticket"}
        </h3>

        <p className="ticket-description">
          {ticket?.description ||
            "No description available."}
        </p>

      </div>

      {/* ============================
          META
      ============================ */}

      <div className="ticket-card-meta">

        <div className="ticket-meta-item">

          <span className="meta-label">
            Category
          </span>

          <strong>
            {category.charAt(0).toUpperCase() +
              category.slice(1)}
          </strong>

        </div>

        <div className="ticket-meta-item">

          <span className="meta-label">
            Created
          </span>

          <strong>
            {formatDate(ticket?.createdAt)}
          </strong>

        </div>

        {isAgent && (
          <div className="ticket-meta-item">

            <span className="meta-label">
              Customer
            </span>

            <strong>
              {customerName}
            </strong>

          </div>
        )}

        {isAgent && (
          <div className="ticket-meta-item">

            <span className="meta-label">
              Assigned To
            </span>

            <strong
              className={
                ticket?.assignedTo
                  ? "assigned-agent"
                  : "unassigned"
              }
            >
              {agentName}
            </strong>

          </div>
        )}

      </div>

      {/* ============================
          FOOTER
      ============================ */}

      <div className="ticket-card-footer">

        <div className="ticket-owner">

          <div className="ticket-owner-avatar">
            {customerName
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <span>Created by</span>
            <strong>
              {customerName}
            </strong>
          </div>

        </div>

        <button
          type="button"
          className="view-ticket-btn"
          onClick={() =>
            onViewTicket(ticket)
          }
        >
          View Ticket
          <span>→</span>
        </button>

      </div>

    </article>
  );
}

export default TicketCard;