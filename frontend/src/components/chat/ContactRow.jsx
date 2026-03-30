import Avatar from "./Avatar";

export default function ContactRow({ contact, active, onClick, online }) {
  return (
    <button
      onClick={() => onClick(contact)}
      style={{
        width: "100%",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: "0.8rem",
        padding: "0.82rem 0.9rem",
        borderRadius: "1.25rem",
        background: active
          ? "linear-gradient(135deg, rgba(255,122,89,0.16), rgba(255,186,120,0.22))"
          : "rgba(255,255,255,0.68)",
        border: active
          ? "1px solid rgba(255,122,89,0.28)"
          : "1px solid rgba(255,255,255,0.72)",
        cursor: "pointer",
        transition: "all 0.18s",
        marginBottom: "0.35rem",
        boxShadow: active ? "0 14px 30px rgba(255,122,89,0.14)" : "0 10px 20px rgba(190, 153, 128, 0.08)",
      }}
      onMouseEnter={(event) => {
        if (!active) {
          event.currentTarget.style.background = "rgba(255,255,255,0.92)";
          event.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(event) => {
        if (!active) {
          event.currentTarget.style.background = "rgba(255,255,255,0.68)";
          event.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      <Avatar name={contact.name} size={42} online={online} src={contact.avatar} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 700,
            fontSize: "0.84rem",
            color: active ? "#8d3d25" : "#253041",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {contact.name}
        </p>
        <p
          style={{
            fontSize: "0.72rem",
            color: active ? "#a66b4b" : "#7e8a9b",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginTop: "0.18rem",
          }}
        >
          {contact.lastMessage}
        </p>
      </div>
      {active ? (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ff7a59, #ffb347)",
            flexShrink: 0,
            boxShadow: "0 0 0 6px rgba(255,122,89,0.14)",
          }}
        />
      ) : null}
    </button>
  );
}
