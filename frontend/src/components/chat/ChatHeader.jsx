import { useState } from "react";
import Avatar from "./Avatar";
import GroupMembers from "./GroupMembers";

export default function ChatHeader({
  activeContact,
  online,
  partnerTyping = false,
  callMode = null,
  callDurationLabel = "00:00",
  onToggleVideoCall,
  onToggleVoiceCall,
  token,
  currentUserId,
  onGroupMemberRemoved,
}) {
  const [isGroupMembersOpen, setIsGroupMembersOpen] = useState(false);

  if (!activeContact) {
    return null;
  }

  const isGroup = activeContact.isGroup;

  return (
    <>
      <div className="chat-header-bar reveal d1 show">
        <Avatar
          name={activeContact.name}
          size={40}
          online={online && !isGroup}
          src={activeContact.avatar}
        />
        <div
          style={{ cursor: isGroup ? "pointer" : "default" }}
          onClick={() => isGroup && setIsGroupMembersOpen(true)}
        >
          <p className="chat-contact-name">{activeContact.name}</p>
          <p className={`chat-contact-status ${online && !isGroup ? "online" : ""}`}>
            {isGroup ? (
              <span>
                {activeContact.participants?.length || 0} member{
                  (activeContact.participants?.length || 0) !== 1 ? "s" : ""
                }
              </span>
            ) : partnerTyping ? (
              <span className="chat-typing-line">
                Typing
                <span className="chat-typing-dots">
                  <span />
                  <span />
                  <span />
                </span>
              </span>
            ) : online ? (
              "Active now"
            ) : (
              "Offline"
            )}
          </p>
        </div>

        {callMode ? (
          <div
            style={{
              marginLeft: "auto",
              marginRight: "0.35rem",
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.45rem 0.7rem",
              borderRadius: "999px",
              background:
                callMode === "video"
                  ? "linear-gradient(135deg, rgba(255,122,89,0.14), rgba(255,186,120,0.2))"
                  : "linear-gradient(135deg, rgba(31,182,166,0.14), rgba(79,209,197,0.2))",
              border:
                callMode === "video"
                  ? "1px solid rgba(255,122,89,0.2)"
                  : "1px solid rgba(31,182,166,0.25)",
              color: callMode === "video" ? "#c95d37" : "#14877a",
              fontSize: "0.73rem",
              fontWeight: 800,
              boxShadow: "0 12px 24px rgba(255,122,89,0.08)",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: callMode === "video" ? "#ff7a59" : "#1fb6a6",
                boxShadow:
                  callMode === "video"
                    ? "0 0 0 5px rgba(255,122,89,0.12)"
                    : "0 0 0 5px rgba(31,182,166,0.15)",
              }}
            />
            <span>{callMode === "video" ? "Video" : "Voice"} call {callDurationLabel}</span>
          </div>
        ) : null}

        <div style={{ display: "flex", gap: "0.55rem" }}>
          <button
            type="button"
            onClick={onToggleVideoCall}
            title={callMode === "video" ? "End video call" : "Start video call"}
            style={{
              width: 38,
              height: 38,
              borderRadius: "1rem",
              background:
                callMode === "video"
                  ? "linear-gradient(135deg, #ff7a59, #ffb347)"
                  : "rgba(255,255,255,0.8)",
              border:
                callMode === "video" ? "none" : "1px solid rgba(255,122,89,0.12)",
              display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: callMode === "video" ? "#fffdf9" : "#9b7b67",
            transition: "all 0.15s",
            boxShadow:
              callMode === "video"
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
          title={callMode === "voice" ? "End voice call" : "Start voice call"}
          onClick={onToggleVoiceCall}
          style={{
            width: 38,
            height: 38,
            borderRadius: "1rem",
            background:
              callMode === "voice"
                ? "linear-gradient(135deg, #1fb6a6, #4fd1c5)"
                : "rgba(255,255,255,0.8)",
            border:
              callMode === "voice" ? "none" : "1px solid rgba(31,182,166,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: callMode === "voice" ? "#f0fdf9" : "#9b7b67",
            transition: "all 0.15s",
            boxShadow:
              callMode === "voice"
                ? "0 14px 28px rgba(31,182,166,0.22)"
                : "0 10px 22px rgba(210, 142, 99, 0.12)",
          }}
          onMouseEnter={(event) => {
            if (callMode === "voice") return;
            event.currentTarget.style.background = "#eefcfb";
            event.currentTarget.style.color = "#14877a";
            event.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background =
              callMode === "voice"
                ? "linear-gradient(135deg, #1fb6a6, #4fd1c5)"
                : "rgba(255,255,255,0.8)";
            event.currentTarget.style.color = callMode === "voice" ? "#f0fdf9" : "#9b7b67";
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

    <GroupMembers
      group={isGroup ? activeContact : null}
      currentUserId={currentUserId}
      token={token}
      onMemberRemoved={onGroupMemberRemoved}
      isOpen={isGroupMembersOpen}
      onClose={() => setIsGroupMembersOpen(false)}
    />
    </>
  );
}
