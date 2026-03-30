import { useEffect, useState } from "react";

export default function Avatar({ name = "?", size = 36, online = false, src }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const hue = [...name].reduce((total, char) => total + char.charCodeAt(0), 0) % 360;

  return (
    <div style={{ position: "relative", flexShrink: 0, width: size, height: size }}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
            border: "2px solid rgba(255,255,255,0.88)",
            boxShadow: "0 12px 24px rgba(223, 139, 90, 0.18)",
          }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: `linear-gradient(135deg, hsl(${hue},78%,72%), hsl(${(hue + 48) % 360},85%,62%))`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: size * 0.34,
            color: "#fffefb",
            userSelect: "none",
            border: "2px solid rgba(255,255,255,0.78)",
            boxShadow: "0 12px 24px rgba(223, 139, 90, 0.18)",
          }}
        >
          {initials}
        </div>
      )}
      {online ? (
        <span
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#10b981",
            border: "2px solid #fffdf8",
            boxShadow: "0 0 0 4px rgba(16,185,129,0.12)",
          }}
        />
      ) : null}
    </div>
  );
}
