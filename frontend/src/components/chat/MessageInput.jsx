import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { EMOJI_GROUPS } from "../../pages/chat/helpers";

const PICKER_GAP = 10;
const EDGE = 12;

function useEmojiPickerPosition(open, anchorRef, panelRef) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 320, maxHeight: 360 });

  const recalc = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor || !open) return;

    const rect = anchor.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.max(260, Math.min(340, vw - EDGE * 2));
    const panelH = panelRef.current?.offsetHeight || 360;
    const maxHeight = Math.min(400, vh - EDGE * 2);

    let left = rect.right - width;
    if (left < EDGE) left = EDGE;
    if (left + width > vw - EDGE) left = vw - EDGE - width;

    const spaceAbove = rect.top - EDGE - PICKER_GAP;
    const spaceBelow = vh - rect.bottom - EDGE - PICKER_GAP;

    let top;
    let height = Math.min(maxHeight, Math.max(220, panelH));

    if (spaceAbove >= 200 || spaceAbove >= spaceBelow) {
      top = Math.max(EDGE, rect.top - height - PICKER_GAP);
      height = Math.min(height, rect.top - EDGE - PICKER_GAP);
    } else {
      top = rect.bottom + PICKER_GAP;
      height = Math.min(height, spaceBelow);
    }

    setPos({ top, left, width, maxHeight: height });
  }, [open, anchorRef, panelRef]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    recalc();
    const raf = requestAnimationFrame(recalc);
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
    };
  }, [open, recalc]);

  return pos;
}

export default function MessageInput({ onSend, onTypingActivity, onTypingBlur }) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const pickerRef = useRef(null);
  const triggerRef = useRef(null);
  const rootRef = useRef(null);
  const panelPos = useEmojiPickerPosition(showEmojiPicker, triggerRef, pickerRef);

  useEffect(() => {
    if (!showEmojiPicker) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowEmojiPicker(false);
      }
    };

    const onPointerDown = (event) => {
      const target = event.target;
      if (
        pickerRef.current?.contains(target) ||
        triggerRef.current?.contains(target) ||
        rootRef.current?.contains(target)
      ) {
        return;
      }
      setShowEmojiPicker(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
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

    const value = textarea.value;
    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const nextText = `${value.slice(0, start)}${emoji}${value.slice(end)}`;
    const nextCaret = start + emoji.length;

    setText(nextText);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const pickerPanel = showEmojiPicker ? (
    <div
      ref={pickerRef}
      className="emoji-picker-panel"
      role="dialog"
      aria-label="Emoji picker"
      style={{
        position: "fixed",
        top: panelPos.top,
        left: panelPos.left,
        width: panelPos.width,
        maxHeight: panelPos.maxHeight,
        zIndex: 10060,
      }}
    >
      <div className="emoji-picker-panel__header">
        <p className="emoji-picker-panel__title">Emojis</p>
        <button
          type="button"
          className="emoji-picker-panel__close"
          aria-label="Close emoji picker"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowEmojiPicker(false)}
        >
          ×
        </button>
      </div>
      <p className="emoji-picker-panel__hint">
        Tap as many as you like — they insert at your cursor. Close with ×, Escape, or click outside.
      </p>
      <div className="emoji-picker-panel__scroll">
        {EMOJI_GROUPS.map((group) => (
          <div key={group.label} className="emoji-picker-panel__group">
            <p className="emoji-picker-panel__group-label">{group.label}</p>
            <div className="emoji-picker-panel__grid">
              {group.items.map((emoji) => (
                <button
                  key={`${group.label}-${emoji}`}
                  type="button"
                  className="emoji-picker-panel__emoji-btn"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div
      ref={rootRef}
      className="message-input-glass"
      style={{
        position: "relative",
        zIndex: showEmojiPicker ? 3 : 1,
        padding: "1rem 1.15rem 1.1rem",
        display: "flex",
        gap: "0.7rem",
        alignItems: "flex-end",
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
        aria-label={showEmojiPicker ? "Close emoji picker" : "Open emoji picker"}
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

      {typeof document !== "undefined" && pickerPanel
        ? createPortal(pickerPanel, document.body)
        : null}
    </div>
  );
}
