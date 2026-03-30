export default function SearchBar({ value, onChange }) {
  return (
    <div style={{ position: "relative", margin: "0.8rem 0.85rem 0.1rem" }}>
      <svg
        style={{
          position: "absolute",
          left: "0.85rem",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#d86d49"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search conversations..."
        style={{
          width: "100%",
          padding: "0.78rem 0.9rem 0.78rem 2.45rem",
          background: "rgba(255,255,255,0.88)",
          border: "1.5px solid rgba(255,122,89,0.14)",
          borderRadius: "999px",
          color: "#233042",
          fontSize: "0.82rem",
          fontFamily: "'Manrope', sans-serif",
          outline: "none",
          transition: "border-color 0.18s, box-shadow 0.18s, background 0.18s",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
        }}
        onFocus={(event) => {
          event.target.style.borderColor = "rgba(255,122,89,0.4)";
          event.target.style.boxShadow = "0 0 0 5px rgba(255,122,89,0.12)";
          event.target.style.background = "#fff";
        }}
        onBlur={(event) => {
          event.target.style.borderColor = "rgba(255,122,89,0.14)";
          event.target.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.65)";
          event.target.style.background = "rgba(255,255,255,0.88)";
        }}
      />
    </div>
  );
}
