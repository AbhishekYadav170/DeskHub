import React from "react";

function TicketFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
  clearFilters,
}) {
  const hasFilters =
    search ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    categoryFilter !== "all";

  return (
    <section className="ticket-filters">

      {/* ============================
          FILTER HEADER
      ============================ */}

      <div className="filters-header">

        <div>
          <h2>Find Tickets</h2>
          <p>
            Search and filter tickets by
            status, priority and category.
          </p>
        </div>

        {hasFilters && (
          <button
            type="button"
            className="clear-filters-btn"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        )}

      </div>

      {/* ============================
          FILTER CONTROLS
      ============================ */}

      <div className="filters-grid">

        {/* SEARCH */}

        <div className="filter-search">

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search tickets..."
          />

          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>

        {/* STATUS */}

        <div className="filter-control">

          <label htmlFor="status-filter">
            Status
          </label>

          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="all">
              All Status
            </option>

            <option value="open">
              Open
            </option>

            <option value="in-progress">
              In Progress
            </option>

            <option value="resolved">
              Resolved
            </option>

            <option value="closed">
              Closed
            </option>
          </select>

        </div>

        {/* PRIORITY */}

        <div className="filter-control">

          <label htmlFor="priority-filter">
            Priority
          </label>

          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value)
            }
          >
            <option value="all">
              All Priority
            </option>

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

        {/* CATEGORY */}

        <div className="filter-control">

          <label htmlFor="category-filter">
            Category
          </label>

          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
          >
            <option value="all">
              All Categories
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

            <option value="general">
              General
            </option>
          </select>

        </div>

      </div>

      {/* ============================
          ACTIVE FILTERS
      ============================ */}

      {hasFilters && (
        <div className="active-filters">

          <span className="active-filter-title">
            Active filters:
          </span>

          {search && (
            <span className="filter-tag">
              Search: "{search}"
            </span>
          )}

          {statusFilter !== "all" && (
            <span className="filter-tag">
              Status:{" "}
              {statusFilter === "in-progress"
                ? "In Progress"
                : statusFilter}
            </span>
          )}

          {priorityFilter !== "all" && (
            <span className="filter-tag">
              Priority: {priorityFilter}
            </span>
          )}

          {categoryFilter !== "all" && (
            <span className="filter-tag">
              Category: {categoryFilter}
            </span>
          )}

        </div>
      )}

    </section>
  );
}

export default TicketFilters;