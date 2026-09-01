import React, { useEffect, useState } from "react";
import {
  getReplies,
  addReply,
} from "../../utils/api";

function Conversation({ ticket, user }) {
  const [replies, setReplies] = useState([]);
  const [reply, setReply] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const status = String(
    ticket?.status || "open"
  ).toLowerCase();

  const isClosed = status === "closed";

  // ============================
  // LOAD REPLIES
  // ============================
  useEffect(() => {
    if (!ticket?._id) return;

    const loadReplies = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getReplies(
          ticket._id
        );

        if (data.success) {
          setReplies(
            data.data?.replies || []
          );
        } else {
          setError(
            data.message ||
              "Unable to load conversation"
          );
        }
      } catch (error) {
        console.error(
          "Load Replies Error:",
          error
        );

        setError(
          error.message ||
            "Unable to load conversation"
        );
      } finally {
        setLoading(false);
      }
    };

    loadReplies();
  }, [ticket?._id]);

  // ============================
  // SEND REPLY
  // ============================
  const handleSendReply = async (e) => {
    e.preventDefault();

    if (!reply.trim()) {
      return;
    }

    if (isClosed) {
      setError(
        "Cannot reply to a closed ticket"
      );
      return;
    }

    try {
      setSending(true);
      setError("");
      setMessage("");

      const data = await addReply(
        ticket._id,
        reply.trim()
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to send reply"
        );
      }

      setReply("");

      // Add returned reply immediately
      if (data.data?.reply) {
        setReplies((prev) => [
          ...prev,
          data.data.reply,
        ]);
      } else {
        // Refresh replies if backend
        // does not return the reply
        const refreshed =
          await getReplies(ticket._id);

        if (refreshed.success) {
          setReplies(
            refreshed.data?.replies || []
          );
        }
      }

      setMessage("Reply sent successfully");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Send Reply Error:",
        error
      );

      setError(
        error.message ||
          "Unable to send reply"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="conversation-card">

      {/* ============================
          HEADER
      ============================ */}

      <div className="conversation-header">

        <div>
          <h2>Conversation</h2>

          <p>
            Communicate with the{" "}
            {user?.role === "agent"
              ? "customer"
              : "support agent"}{" "}
            about this ticket.
          </p>
        </div>

        <span className="reply-count">
          {replies.length}{" "}
          {replies.length === 1
            ? "Reply"
            : "Replies"}
        </span>

      </div>

      {/* ============================
          MESSAGES
      ============================ */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ============================
          REPLIES
      ============================ */}

      <div className="replies">

        {loading ? (
          <div className="conversation-loading">
            <div className="loader"></div>
            <p>
              Loading conversation...
            </p>
          </div>
        ) : replies.length === 0 ? (
          <div className="no-replies">
            <div className="no-replies-icon">
              💬
            </div>

            <h3>No replies yet</h3>

            <p>
              Start the conversation by
              sending a message below.
            </p>
          </div>
        ) : (
          replies.map((item, index) => {
            const isAgent =
              item.user?.role ===
              "agent";

            const replyName =
              item.user?.name ||
              (isAgent
                ? "Support Agent"
                : "Customer");

            const replyDate =
              item.createdAt
                ? new Date(
                    item.createdAt
                  ).toLocaleString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : "";

            return (
              <div
                key={
                  item._id || index
                }
                className={`reply-item ${
                  isAgent
                    ? "agent-reply"
                    : "customer-reply"
                }`}
              >

                <div className="reply-avatar">
                  {replyName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="reply-content">

                  <div className="reply-header">

                    <div>
                      <strong>
                        {replyName}
                      </strong>

                      <span
                        className={`reply-role ${
                          isAgent
                            ? "agent"
                            : "customer"
                        }`}
                      >
                        {isAgent
                          ? "Agent"
                          : "Customer"}
                      </span>
                    </div>

                    <span className="reply-time">
                      {replyDate}
                    </span>

                  </div>

                  <p>
                    {item.message}
                  </p>

                </div>

              </div>
            );
          })
        )}

      </div>

      {/* ============================
          REPLY FORM
      ============================ */}

      {isClosed ? (
        <div className="closed-ticket-message">

          <div className="closed-ticket-icon">
            ✓
          </div>

          <div>
            <strong>
              This ticket is closed
            </strong>

            <p>
              No more replies can be
              added to this ticket.
            </p>
          </div>

        </div>
      ) : (
        <form
          className="reply-form"
          onSubmit={handleSendReply}
        >

          <h3>Add Reply</h3>

          <textarea
            value={reply}
            onChange={(e) => {
              setReply(e.target.value);
              setError("");
            }}
            placeholder="Write your reply..."
            disabled={sending}
          />

          <div className="reply-form-footer">

            <span>
              {reply.length} characters
            </span>

            <button
              type="submit"
              className="send-btn"
              disabled={
                sending ||
                !reply.trim()
              }
            >
              {sending
                ? "Sending..."
                : "Send Reply →"}
            </button>

          </div>

        </form>
      )}

    </section>
  );
}

export default Conversation;