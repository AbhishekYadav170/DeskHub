import React, { useState } from "react";
import { createTicket } from "../../utils/api";

function CreateTicket({ onBack, onTicketCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    priority: "medium",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================
  // HANDLE INPUT
  // ============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ============================
  // CREATE TICKET
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = formData.title.trim();
    const description =
      formData.description.trim();

    if (!title) {
      setError("Please enter ticket title.");
      return;
    }

    if (title.length < 3) {
      setError(
        "Ticket title must be at least 3 characters."
      );
      return;
    }

    if (!description) {
      setError(
        "Please describe your issue."
      );
      return;
    }

    if (description.length < 10) {
      setError(
        "Description must be at least 10 characters."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await createTicket({
        title,
        description,
        category: formData.category,
        priority: formData.priority,
      });

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to create ticket."
        );
      }

      const newTicket =
        data.data?.ticket;

      setSuccess(
        "Ticket created successfully!"
      );

      setFormData({
        title: "",
        description: "",
        category: "general",
        priority: "medium",
      });

      // Send newly created ticket
      // back to Dashboard
      if (onTicketCreated && newTicket) {
        setTimeout(() => {
          onTicketCreated(newTicket);
        }, 700);
      }
    } catch (error) {
      console.error(
        "Create Ticket Error:",
        error
      );

      setError(
        error.message ||
          "Unable to create ticket."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket-page">

      {/* ============================
          BACK
      ============================ */}

      <button
        type="button"
        className="back-btn"
        onClick={onBack}
      >
        ← Back to Dashboard
      </button>

      {/* ============================
          HEADER
      ============================ */}

      <div className="create-ticket-header">

        <div>
          <span className="page-eyebrow">
            CUSTOMER SUPPORT
          </span>

          <h1>Create New Ticket</h1>

          <p>
            Tell us about your issue and our
            support team will help you.
          </p>
        </div>

      </div>

      {/* ============================
          FORM CARD
      ============================ */}

      <form
        className="create-ticket-card"
        onSubmit={handleSubmit}
      >

        {/* ERROR */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {/* TITLE */}

        <div className="form-group">

          <label htmlFor="ticket-title">
            Ticket Title
          </label>

          <input
            id="ticket-title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Example: Unable to login to my account"
            maxLength={150}
            disabled={loading}
          />

          <small>
            {formData.title.length}/150
          </small>

        </div>

        {/* DESCRIPTION */}

        <div className="form-group">

          <label htmlFor="ticket-description">
            Describe Your Issue
          </label>

          <textarea
            id="ticket-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please explain your issue in detail..."
            rows={7}
            disabled={loading}
          />

          <small>
            Minimum 10 characters
          </small>

        </div>

        {/* CATEGORY + PRIORITY */}

        <div className="form-row">

          <div className="form-group">

            <label htmlFor="ticket-category">
              Category
            </label>

            <select
              id="ticket-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
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

            <label htmlFor="ticket-priority">
              Priority
            </label>

            <select
              id="ticket-priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={loading}
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

        {/* INFO */}

        <div className="ticket-info-box">

          <span className="ticket-info-icon">
            💡
          </span>

          <div>
            <strong>
              What happens next?
            </strong>

            <p>
              Your ticket will be created with
              <b> Open </b>
              status. A support agent can then
              assign the ticket to themselves and
              start working on your issue.
            </p>
          </div>

        </div>

        {/* BUTTONS */}

        <div className="create-ticket-actions">

          <button
            type="button"
            className="cancel-btn"
            onClick={onBack}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="create-btn"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Ticket →"}
          </button>

        </div>

      </form>
    </div>
  );
}

export default CreateTicket;