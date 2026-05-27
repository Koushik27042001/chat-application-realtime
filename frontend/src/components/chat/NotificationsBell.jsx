import { useEffect, useRef, useState } from "react";

function formatRelativeTime(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString();
}

function typeLabel(type) {
  switch (type) {
    case "MESSAGE":
      return "Message";
    case "CALL":
      return "Call";
    case "ADMIN":
      return "Admin";
    default:
      return type || "Notice";
  }
}

export default function NotificationsBell({
  notifications,
  unreadCount,
  onRefresh,
  onMarkRead,
  onMarkAllRead,
  onOpenFromNotification,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const close = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    if (open && onRefresh) onRefresh();
  }, [open, onRefresh]);

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
        onClick={() => setOpen((x) => !x)}
        style={{
          width: 42,
          height: 42,
          borderRadius: "1rem",
          border: "1px solid rgba(148,163,184,0.25)",
          background: "rgba(255,255,255,0.85)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          position: "relative",
          boxShadow: "0 8px 20px rgba(148,163,184,0.12)",
          color: "#475569",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 ? (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              borderRadius: 999,
              background: "linear-gradient(135deg,#ff7a59,#ffb347)",
              color: "#fff",
              fontSize: "0.58rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "min(360px, calc(100vw - 2rem))",
            maxHeight: 420,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.9)",
            background: "linear-gradient(180deg, rgba(255,252,248,0.98), rgba(255,247,239,0.97))",
            boxShadow: "0 26px 60px rgba(120,82,62,0.18)",
            zIndex: 300,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 14px",
              borderBottom: "1px solid rgba(251,146,118,0.15)",
              fontWeight: 800,
              fontSize: "0.82rem",
              color: "#1e293b",
            }}
          >
            Notifications
            {unreadCount > 0 && onMarkAllRead ? (
              <button
                type="button"
                onClick={() => {
                  onMarkAllRead();
                }}
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  border: "none",
                  background: "transparent",
                  color: "#d56d47",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div style={{ overflowY: "auto", maxHeight: 340 }}>
            {notifications.length === 0 ? (
              <p
                style={{
                  padding: "1.75rem 1rem",
                  textAlign: "center",
                  fontSize: "0.8rem",
                  color: "#64748b",
                }}
              >
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => {
                const id = String(n._id ?? n.id ?? "");
                const unread = !n.isRead;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      if (!id) return;
                      onMarkRead?.(id, unread);
                      onOpenFromNotification?.(n);
                      setOpen(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "11px 14px",
                      border: "none",
                      borderBottom: "1px solid rgba(226,232,240,0.9)",
                      background: unread ? "rgba(255,122,89,0.06)" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.62rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "#fb923c",
                      }}
                    >
                      {typeLabel(n.type)}
                    </span>
                    <p style={{ margin: "4px 0 2px", fontSize: "0.8rem", color: "#334155", lineHeight: 1.45 }}>
                      {typeof n.content === "string" ? n.content.slice(0, 180) : "New activity"}
                    </p>
                    <span style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600 }}>
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
