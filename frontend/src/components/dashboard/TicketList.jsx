import React from "react";
import TicketCard from "../tickets/TicketCard";

function TicketList({
  tickets,
  user,
  onViewTicket,
  onRefresh,
}) {
  // ============================
  // EMPTY STATE
  // ============================

  if (!tickets || tickets.length === 0) {
    return (
      <div className="tickets-empty-state">

        <div className="empty-icon">
          🎫
        </div>

        <h3>No tickets found</h3>

        <p>
          {user?.role === "agent"
            ? "There are no tickets matching your current filters."
            : "You have not created any support tickets yet."}
        </p>

        <button
          type="button"
          className="empty-refresh-btn"
          onClick={onRefresh}
        >
          ↻ Refresh Tickets
        </button>

      </div>
    );
  }

  return (
    <div className="ticket-list">

      {tickets.map((ticket) => (
        <TicketCard
          key={ticket._id}
          ticket={ticket}
          user={user}
          onViewTicket={onViewTicket}
        />
      ))}

    </div>
  );
}

export default TicketList;