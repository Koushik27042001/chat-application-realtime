import { useEffect, useRef, useState } from "react";

import { EMOJI_GROUPS } from "../../pages/chat/helpers";

export default function MessageInput({ onSend, onTypingActivity, onTypingBlur }) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const pickerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!showEmojiPicker) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      const target = event.target;
      if (pickerRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      setShowEmojiPicker(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showEmojiPicker]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    onSend(trimmed);
    setText("");
    setShowEmojiPicker(false);
    onTypingBlur?.();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      setText((current) => `${current}${emoji}`);
      return;
    }

    const start = textarea.selectionStart ?? text.length;
    const end = textarea.selectionEnd ?? text.length;
    const nextText = `${text.slice(0, start)}${emoji}${text.slice(end)}`;
    const nextCaret = start + emoji.length;

    setText(nextText);
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCaret, nextCaret);
    });
  };

  return (
    <div
      style={{
        position: "relative",
        padding: "1rem 1.15rem 1.1rem",
        display: "flex",
        gap: "0.7rem",
        alignItems: "flex-end",
        borderTop: "1px solid rgba(255,122,89,0.1)",
        background: "linear-gradient(180deg, rgba(255,250,245,0.78), rgba(255,255,255,0.9))",
        backdropFilter: "blur(16px)",
      }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          if (next.trim()) {
            onTypingActivity?.();
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        style={{
          flex: 1,
          resize: "none",
          background: "rgba(255,255,255,0.92)",
          border: "1.5px solid rgba(255,122,89,0.14)",
          borderRadius: "1.15rem",
          padding: "0.85rem 1rem",
          color: "#213041",
          fontSize: "0.9rem",
          fontFamily: "'Manrope', sans-serif",
          outline: "none",
          transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
          lineHeight: 1.55,
          boxShadow: "0 10px 26px rgba(203, 162, 132, 0.08)",
        }}
        onFocus={(event) => {
          event.target.style.borderColor = "rgba(255,122,89,0.42)";
          event.target.style.boxShadow = "0 0 0 5px rgba(255,122,89,0.12)";
          event.target.style.background = "#fff";
        }}
        onBlur={(event) => {
          event.target.style.borderColor = "rgba(255,122,89,0.14)";
          event.target.style.boxShadow = "0 10px 26px rgba(203, 162, 132, 0.08)";
          event.target.style.background = "rgba(255,255,255,0.92)";
          onTypingBlur?.();
        }}
      />
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open emoji picker"
        aria-expanded={showEmojiPicker}
        onClick={() => setShowEmojiPicker((current) => !current)}
        style={{
          width: 46,
          height: 46,
          borderRadius: "1rem",
          border: "1px solid rgba(255,122,89,0.14)",
          background: showEmojiPicker ? "rgba(255,122,89,0.14)" : "rgba(255,255,255,0.88)",
          color: showEmojiPicker ? "#d66b46" : "#9a7a67",
          fontSize: "1.1rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 0.15s, border-color 0.15s, color 0.15s, transform 0.15s",
          boxShadow: "0 10px 24px rgba(203, 162, 132, 0.1)",
        }}
      >
        {"\u{1F60A}"}
      </button>
      <button
        type="button"
        onClick={submit}
        style={{
          width: 48,
          height: 48,
          borderRadius: "1rem",
          flexShrink: 0,
          background: text.trim() ? "linear-gradient(135deg,#ff7a59,#ffb347)" : "rgba(255,255,255,0.75)",
          border: text.trim() ? "none" : "1px solid rgba(255,122,89,0.14)",
          cursor: text.trim() ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
          boxShadow: text.trim() ? "0 16px 30px rgba(255,122,89,0.22)" : "0 10px 24px rgba(203, 162, 132, 0.08)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={text.trim() ? "#fffdf9" : "#c19d87"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>

      {showEmojiPicker ? (
        <div
          ref={pickerRef}
          style={{
            position: "absolute",
            right: "1rem",
            bottom: "calc(100% + 0.6rem)",
            width: "min(320px, calc(100vw - 2rem))",
            padding: "0.95rem",
            borderRadius: "1.2rem",
            border: "1px solid rgba(255,255,255,0.85)",
            background: "rgba(255,250,245,0.96)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 22px 54px rgba(161, 111, 77, 0.18)",
            zIndex: 30,
          }}
        >
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.84rem", color: "#243143", marginBottom: "0.2rem" }}>
            Add emoji
          </p>
          <p style={{ fontSize: "0.72rem", color: "#8e9aa8", marginBottom: "0.8rem" }}>
            Pick one to insert it at your cursor.
          </p>
          {EMOJI_GROUPS.map((group) => (
            <div key={group.label} style={{ marginTop: "0.72rem" }}>
              <p style={{ fontSize: "0.68rem", color: "#d07d57", marginBottom: "0.45rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>
                {group.label}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "0.48rem" }}>
                {group.items.map((emoji) => (
                  <button
                    key={`${group.label}-${emoji}`}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    style={{
                      height: 44,
                      borderRadius: "0.9rem",
                      border: "1px solid rgba(255,255,255,0.88)",
                      background: "rgba(255,255,255,0.82)",
                      fontSize: "1.15rem",
                      cursor: "pointer",
                      transition: "transform 0.15s, background 0.15s, border-color 0.15s",
                      boxShadow: "0 10px 18px rgba(203, 162, 132, 0.08)",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform = "translateY(-1px)";
                      event.currentTarget.style.background = "#fff4ee";
                      event.currentTarget.style.borderColor = "rgba(255,122,89,0.22)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = "translateY(0)";
                      event.currentTarget.style.background = "rgba(255,255,255,0.82)";
                      event.currentTarget.style.borderColor = "rgba(255,255,255,0.88)";
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
