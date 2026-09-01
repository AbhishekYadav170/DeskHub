import React from "react";

function DashboardStats({ stats, user }) {
  const isAgent = user?.role === "agent";

  const statCards = [
    {
      key: "total",
      label: "Total Tickets",
      value: stats?.total || 0,
      icon: "🎫",
      className: "total",
    },
    {
      key: "open",
      label: "Open",
      value: stats?.open || 0,
      icon: "📂",
      className: "open",
    },
    {
      key: "inProgress",
      label: "In Progress",
      value: stats?.inProgress || 0,
      icon: "⚙️",
      className: "progress",
    },
    {
      key: "resolved",
      label: "Resolved",
      value: stats?.resolved || 0,
      icon: "✓",
      className: "resolved",
    },
    {
      key: "closed",
      label: "Closed",
      value: stats?.closed || 0,
      icon: "🔒",
      className: "closed",
    },
  ];

  return (
    <section className="dashboard-stats">

      <div className="stats-header">
        <div>
          <h2>
            {isAgent
              ? "Ticket Overview"
              : "My Ticket Overview"}
          </h2>

          <p>
            Track your ticket status at a glance.
          </p>
        </div>
      </div>

      <div className="stats-grid">

        {statCards.map((stat) => (
          <div
            key={stat.key}
            className={`stat-card ${stat.className}`}
          >

            <div className="stat-card-top">

              <div className="stat-icon">
                {stat.icon}
              </div>

              <span className="stat-label">
                {stat.label}
              </span>

            </div>

            <div className="stat-value">
              {stat.value}
            </div>

          </div>
        ))}

      </div>

      {/* URGENT TICKETS */}

      {isAgent && (
        <div className="urgent-summary">

          <div className="urgent-summary-icon">
            !
          </div>

          <div>
            <strong>
              {stats?.urgent || 0} urgent{" "}
              {stats?.urgent === 1
                ? "ticket"
                : "tickets"}
            </strong>

            <span>
              Require priority attention
            </span>
          </div>

        </div>
      )}

    </section>
  );
}

export default DashboardStats;