function formatReadReceipt(readReceipt) {
  if (!readReceipt) return null;
  if (readReceipt === "Seen") {
    return "Seen";
  }
  return "Sent";
}

export default function MessageBubble({ message, readReceipt = null }) {
  const isImage = message.messageType === "image";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: message.own ? "flex-end" : "flex-start",
        padding: "0.22rem 0",
        animation: "bubbleIn 0.25s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <div
        style={{
          maxWidth: "68%",
          padding: "0.78rem 1rem",
          borderRadius: message.own
            ? "1.35rem 1.35rem 0.35rem 1.35rem"
            : "1.35rem 1.35rem 1.35rem 0.35rem",
          background: message.own
            ? "linear-gradient(135deg, #ff7a59, #ffb347)"
            : "rgba(255,255,255,0.84)",
          border: message.own ? "1px solid rgba(255,138,112,0.22)" : "1px solid rgba(255,255,255,0.88)",
          backdropFilter: "blur(8px)",
          boxShadow: message.own
            ? "0 16px 34px rgba(255,122,89,0.2)"
            : "0 12px 28px rgba(173, 137, 109, 0.1)",
        }}
      >
        <p
          style={{
            fontSize: "0.89rem",
            lineHeight: 1.65,
            color: message.own ? "#fffdf9" : "#314255",
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 500,
            display: isImage ? "none" : "block",
          }}
        >
          {message.text}
        </p>
        {isImage ? (
          <a
            href={message.text}
            target="_blank"
            rel="noreferrer"
            title="Open image"
            style={{
              display: "block",
              overflow: "hidden",
              borderRadius: "1rem",
              background: message.own ? "rgba(255,255,255,0.16)" : "rgba(15,23,42,0.06)",
            }}
          >
            <img
              src={message.text}
              alt="Shared"
              loading="lazy"
              style={{
                display: "block",
                width: "min(320px, 62vw)",
                maxHeight: 360,
                objectFit: "cover",
              }}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </a>
        ) : null}
        <p
          style={{
            fontSize: "0.65rem",
            color: message.own ? "rgba(255,255,255,0.78)" : "#96a1b0",
            marginTop: "0.35rem",
            textAlign: "right",
            fontWeight: 700,
          }}
        >
          {message.time}
          {readReceipt ? (
            <span
              style={{
                marginLeft: "0.5rem",
                fontWeight: 700,
                fontSize: "0.68rem",
                letterSpacing: "0.06em",
                opacity: message.own ? 0.95 : 1,
              }}
            >
              {formatReadReceipt(readReceipt)}
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}
