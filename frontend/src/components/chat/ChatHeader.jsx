import Avatar from "./Avatar";

export default function ChatHeader({
  activeContact,
  online,
  isVideoCallActive = false,
  callDurationLabel = "00:00",
  onToggleVideoCall,
}) {
  if (!activeContact) {
    return null;
  }

  return (
    <div className="chat-header-bar reveal d1 show">
      <Avatar
        name={activeContact.name}
        size={40}
        online={online}
        src={activeContact.avatar}
      />
      <div>
        <p className="chat-contact-name">{activeContact.name}</p>
        <p className={`chat-contact-status ${online ? "online" : ""}`}>
          {online ? "Active now" : "Offline"}
        </p>
      </div>

      {isVideoCallActive ? (
        <div
          style={{
            marginLeft: "auto",
            marginRight: "0.35rem",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.45rem 0.7rem",
            borderRadius: "999px",
            background: "linear-gradient(135deg, rgba(255,122,89,0.14), rgba(255,186,120,0.2))",
            border: "1px solid rgba(255,122,89,0.2)",
            color: "#c95d37",
            fontSize: "0.73rem",
            fontWeight: 800,
            boxShadow: "0 12px 24px rgba(255,122,89,0.12)",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#ff7a59",
              boxShadow: "0 0 0 5px rgba(255,122,89,0.12)",
            }}
          />
          <span>Video call {callDurationLabel}</span>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: "0.55rem" }}>
        <button
          type="button"
          onClick={onToggleVideoCall}
          title={isVideoCallActive ? "End video call" : "Start video call"}
          style={{
            width: 38,
            height: 38,
            borderRadius: "1rem",
            background: isVideoCallActive
              ? "linear-gradient(135deg, #ff7a59, #ffb347)"
              : "rgba(255,255,255,0.8)",
            border: isVideoCallActive
              ? "none"
              : "1px solid rgba(255,122,89,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: isVideoCallActive ? "#fffdf9" : "#9b7b67",
            transition: "all 0.15s",
            boxShadow: isVideoCallActive
              ? "0 14px 28px rgba(255,122,89,0.22)"
              : "0 10px 22px rgba(210, 142, 99, 0.12)",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.87v6.26a1 1 0 0 1-1.447.9L15 14" />
            <path d="M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
          </svg>
        </button>

        <button
          type="button"
          style={{
            width: 38,
            height: 38,
            borderRadius: "1rem",
            background: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(255,122,89,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#9b7b67",
            transition: "all 0.15s",
            boxShadow: "0 10px 22px rgba(210, 142, 99, 0.12)",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = "#fff6f0";
            event.currentTarget.style.color = "#d56d47";
            event.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = "rgba(255,255,255,0.8)";
            event.currentTarget.style.color = "#9b7b67";
            event.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
