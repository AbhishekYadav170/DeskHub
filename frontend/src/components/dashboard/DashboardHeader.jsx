import React from "react";

function DashboardHeader({
  user,
  onLogout,
  onCreateTicket,
  isCustomer,
}) {
  const userName = user?.name || "User";
  const userRole = user?.role || "customer";

  const firstLetter = userName
    .charAt(0)
    .toUpperCase();

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-inner">

        {/* ============================
            BRAND
        ============================ */}

        <div className="dashboard-brand">
          <div className="brand-logo">
            S
          </div>

          <div className="brand-text">
            <strong>SupportDesk</strong>
            <span>Customer Support</span>
          </div>
        </div>

        {/* ============================
            RIGHT SIDE
        ============================ */}

        <div className="dashboard-header-actions">

          {/* CUSTOMER CREATE BUTTON */}

          {isCustomer && (
            <button
              type="button"
              className="header-create-btn"
              onClick={onCreateTicket}
            >
              <span>+</span>
              Create Ticket
            </button>
          )}

          {/* USER */}

          <div className="header-user">

            <div className="user-avatar">
              {firstLetter}
            </div>

            <div className="user-info">

              <strong>{userName}</strong>

              <span>
                {userRole === "agent"
                  ? "Support Agent"
                  : "Customer"}
              </span>

            </div>

          </div>

          {/* LOGOUT */}

          <button
            type="button"
            className="logout-btn"
            onClick={onLogout}
            title="Logout"
          >
            Logout
          </button>

        </div>

      </div>
    </header>
  );
}

export default DashboardHeader;