export default function MessageBubble({ message, readReceipt = null }) {
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
          }}
        >
          {message.text}
        </p>
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
                marginLeft: "0.45rem",
                fontWeight: 600,
                fontSize: "0.58rem",
                letterSpacing: "0.04em",
                opacity: readReceipt === "Seen" ? 0.95 : 0.75,
              }}
            >
              {readReceipt}
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}
