import Avatar from "./Avatar";

export default function ContactRow({ contact, active, onClick, online }) {
  return (
    <button
      type="button"
      className="contact-row-btn"
      data-active={active ? "true" : "false"}
      onClick={() => onClick(contact)}
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
