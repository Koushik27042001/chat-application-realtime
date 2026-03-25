import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import ChatHeader from "../components/ChatHeader";
import MessageBubble from "../components/MessageBubble";
import MessageInput from "../components/MessageInput";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import useSocket from "../hooks/useSocket";
import { conversationApi, messageApi, userApi } from "../services/api";

/* ─── helpers ─────────────────────────────────────────────────── */
const formatTime = (v) =>
  new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const normalizeMessage = (msg, currentUserId) => {
  const senderId = msg.sender?.toString?.() ?? msg.sender;
  return {
    id: msg._id || msg.id || `msg-${Date.now()}`,
    text: msg.content,
    sender: senderId,
    own: senderId === currentUserId,
    time: formatTime(msg.createdAt || new Date()),
  };
};

/* ─── avatar initials ─────────────────────────────────────────── */
const Avatar = ({ name = "?", size = 36, online = false, src }) => {
  const [imgError, setImgError] = useState(false);
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
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
          }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: `linear-gradient(135deg, hsl(${hue},60%,55%), hsl(${(hue + 60) % 360},60%,45%))`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: size * 0.36,
            color: "#fff",
            userSelect: "none",
          }}
        >
          {initials}
        </div>
      )}
      {online && (
        <span style={{
          position: "absolute", bottom: 1, right: 1,
          width: 9, height: 9, borderRadius: "50%",
          background: "#22c55e", border: "2px solid #0d0f1a",
        }} />
      )}
    </div>
  );
};

/* ─── contact row in sidebar ──────────────────────────────────── */
const ContactRow = ({ contact, active, onClick, online }) => (
  <button
    onClick={() => onClick(contact)}
    style={{
      width: "100%", textAlign: "left", display: "flex", alignItems: "center",
      gap: "0.75rem", padding: "0.65rem 0.85rem", borderRadius: "0.9rem",
      background: active ? "rgba(139,92,246,0.18)" : "transparent",
      border: active ? "1px solid rgba(139,92,246,0.35)" : "1px solid transparent",
      cursor: "pointer", transition: "all 0.18s", marginBottom: "0.25rem",
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
  >
    <Avatar name={contact.name} size={40} online={online} src={contact.avatar} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{
        fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: "0.82rem",
        color: active ? "#c4b5fd" : "#e2e8f0", whiteSpace: "nowrap",
        overflow: "hidden", textOverflow: "ellipsis",
      }}>{contact.name}</p>
      <p style={{
        fontSize: "0.72rem", color: "#64748b", whiteSpace: "nowrap",
        overflow: "hidden", textOverflow: "ellipsis", marginTop: "0.15rem",
      }}>{contact.lastMessage}</p>
    </div>
    {active && (
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: "#8b5cf6", flexShrink: 0,
        boxShadow: "0 0 8px #8b5cf6",
      }} />
    )}
  </button>
);

/* ─── message bubble (own / other) ───────────────────────────── */
const Bubble = ({ message }) => (
  <div style={{
    display: "flex", justifyContent: message.own ? "flex-end" : "flex-start",
    padding: "0.2rem 0", animation: "bubbleIn 0.25s cubic-bezier(.4,0,.2,1)",
  }}>
    <div style={{
      maxWidth: "68%", padding: "0.65rem 1rem",
      borderRadius: message.own ? "1.2rem 1.2rem 0.25rem 1.2rem" : "1.2rem 1.2rem 1.2rem 0.25rem",
      background: message.own
        ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
        : "rgba(255,255,255,0.07)",
      border: message.own ? "none" : "1px solid rgba(255,255,255,0.09)",
      backdropFilter: "blur(8px)",
      boxShadow: message.own ? "0 4px 20px rgba(124,58,237,0.35)" : "none",
    }}>
      <p style={{
        fontSize: "0.875rem", lineHeight: 1.6, color: message.own ? "#fff" : "#e2e8f0",
        fontFamily: "'DM Sans', sans-serif",
      }}>{message.text}</p>
      <p style={{
        fontSize: "0.65rem", color: message.own ? "rgba(255,255,255,0.5)" : "#475569",
        marginTop: "0.3rem", textAlign: "right",
      }}>{message.time}</p>
    </div>
  </div>
);

/* ─── inline message input ────────────────────────────────────── */
const InlineInput = ({ onSend }) => {
  const [text, setText] = useState("");
  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } };
  const submit = () => { if (text.trim()) { onSend(text.trim()); setText(""); } };

  return (
    <div style={{
      padding: "0.85rem 1rem", display: "flex", gap: "0.65rem", alignItems: "flex-end",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(10,12,24,0.6)", backdropFilter: "blur(16px)",
    }}>
      <textarea
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Type a message…"
        style={{
          flex: 1, resize: "none", background: "rgba(255,255,255,0.05)",
          border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "0.85rem",
          padding: "0.7rem 1rem", color: "#e2e8f0", fontSize: "0.875rem",
          fontFamily: "'DM Sans', sans-serif", outline: "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
          lineHeight: 1.5,
        }}
        onFocus={e => { e.target.style.borderColor = "#8b5cf6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.15)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
      />
      {/* emoji btn placeholder */}
      <button type="button" style={{
        width: 42, height: 42, borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)", color: "#94a3b8", fontSize: "1.1rem",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "background 0.15s",
      }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
      >😊</button>
      <button
        onClick={submit}
        type="button"
        style={{
          width: 42, height: 42, borderRadius: "0.75rem", flexShrink: 0,
          background: text.trim() ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(255,255,255,0.05)",
          border: "none", cursor: text.trim() ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
          boxShadow: text.trim() ? "0 4px 16px rgba(124,58,237,0.4)" : "none",
        }}
        onMouseEnter={e => { if (text.trim()) e.currentTarget.style.transform = "scale(1.08)"; }}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={text.trim() ? "#fff" : "#475569"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
};

/* ─── search bar ──────────────────────────────────────────────── */
const SearchBar = ({ value, onChange }) => (
  <div style={{ position: "relative", margin: "0.75rem 0.85rem" }}>
    <svg style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search conversations…"
      style={{
        width: "100%", padding: "0.6rem 0.75rem 0.6rem 2.2rem",
        background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)",
        borderRadius: "0.75rem", color: "#e2e8f0", fontSize: "0.8rem",
        fontFamily: "'DM Sans', sans-serif", outline: "none",
        transition: "border-color 0.18s, box-shadow 0.18s",
      }}
      onFocus={e => { e.target.style.borderColor = "#8b5cf6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.15)"; }}
      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
    />
  </div>
);

/* ─── mobile drawer toggle ────────────────────────────────────── */

/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                  */
/* ═══════════════════════════════════════════════════════════════ */
export default function Chat() {
  const navigate = useNavigate();
  const { logout, token, user, saveAuth } = useAuth();

  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [mounted, setMounted] = useState(false);

  const activeChatIdRef = useRef(null);
  const contactsRef = useRef([]);
  const messagesEndRef = useRef(null);
  const avatarInputRef = useRef(null);

  /* auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  /* ── socket ── */
  const handleIncomingMessage = (message) => {
    const senderId = message.sender?.toString?.() ?? message.sender;
    setContacts((cur) =>
      cur.map((c) =>
        c.id === senderId
          ? { ...c, conversationId: message.conversationId || c.conversationId, lastMessage: message.content }
          : c
      )
    );
    if (activeChatIdRef.current === senderId) {
      setMessages((cur) => [...cur, normalizeMessage(message, user?.id)]);
    }
  };

  const { socket, isConnected, onlineUsers } = useSocket({ userId: user?.id, onMessage: handleIncomingMessage });

  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);
  useEffect(() => { contactsRef.current = contacts; }, [contacts]);

  /* ── load users ── */
  useEffect(() => {
    if (!token) return;
    userApi.list(token).then(({ data }) => {
      const next = data.map((c) => ({
        id: c.id, name: c.name, email: c.email, avatar: c.avatar,
        conversationId: null, lastMessage: "Tap to start chatting.",
      }));
      setContacts(next);
      if (!activeChatId && next.length) setActiveChatId(next[0].id);
    }).catch(() => setContacts([]));
  }, [token]);

  /* ── load messages ── */
  useEffect(() => {
    if (!token || !activeChatId) { setMessages([]); return; }
    const ac = contactsRef.current.find((c) => c.id === activeChatId);
    if (!ac) { setMessages([]); return; }

    (async () => {
      try {
        let cid = ac.conversationId;
        if (!cid) {
          const { data: cd } = await conversationApi.withUser(token, ac.id);
          cid = cd.conversationId || null;
          setContacts((cur) => cur.map((c) => c.id === ac.id ? { ...c, conversationId: cid } : c));
        }
        if (!cid) { setMessages([]); return; }
        const { data } = await messageApi.list(token, cid, 0, 20);
        const norm = data.map((m) => normalizeMessage(m, user?.id));
        setMessages(norm);
        const last = norm[norm.length - 1];
        if (last) setContacts((cur) => cur.map((c) => c.id === activeChatId ? { ...c, lastMessage: last.text } : c));
      } catch { setMessages([]); }
    })();
  }, [token, activeChatId, user?.id]);

  const filteredContacts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      `${c.name} ${c.email || ""} ${c.lastMessage}`.toLowerCase().includes(q)
    );
  }, [contacts, searchTerm]);

  const onlineSet = useMemo(
    () => new Set((onlineUsers || []).map((id) => String(id))),
    [onlineUsers]
  );

  const activeContact =
    filteredContacts.find((c) => c.id === activeChatId) ||
    contacts.find((c) => c.id === activeChatId) ||
    filteredContacts[0] || contacts[0];

  const handleSend = async (text) => {
    if (!token || !activeContact) return;
    try {
      const { data } = await messageApi.send(token, { receiverId: activeContact.id, content: text });
      const norm = normalizeMessage(data.message, user?.id);
      setMessages((cur) => [...cur, norm]);
      setContacts((cur) => cur.map((c) =>
        c.id === activeContact.id
          ? { ...c, lastMessage: norm.text, conversationId: data.conversation?._id || c.conversationId }
          : c
      ));
      if (socket) socket.emit("private-message", { receiverId: activeContact.id, message: data.message });
    } catch {}
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleAvatarUpload = async (file) => {
    if (!token || !file) return;
    if (!file.type?.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result;
        const { data } = await userApi.updateAvatar(token, dataUrl);
        saveAuth({ token, user: data });
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  const handleAutoAvatar = async () => {
    if (!token) return;
    try {
      const { data } = await userApi.updateAvatar(token, "auto");
      saveAuth({ token, user: data });
    } catch {}
  };

  /* ─── render ─────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0f1a; font-family: 'DM Sans', sans-serif; }

        .chat-root {
          height: 100dvh; overflow: hidden;
          display: flex;
          background: #0d0f1a;
          position: relative;
        }
        /* subtle grid texture */
        .chat-root::before {
          content: '';
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px);
          background-size: 36px 36px;
        }

        /* ── sidebar ── */
        .sidebar {
          width: 280px; flex-shrink: 0;
          background: rgba(10,12,24,0.85);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column;
          backdrop-filter: blur(20px);
          position: relative; z-index: 10;
          transition: transform 0.3s cubic-bezier(.4,0,.2,1);
        }
        @media (max-width: 640px) {
          .sidebar {
            position: fixed; inset-y: 0; left: 0;
            transform: translateX(-100%);
            width: 85vw; max-width: 300px;
            box-shadow: 8px 0 40px rgba(0,0,0,0.6);
          }
          .sidebar.open { transform: translateX(0); }
          .sidebar-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.5);
            z-index: 9; backdrop-filter: blur(2px);
          }
        }

        .sidebar-header {
          padding: 1.1rem 0.85rem 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .sidebar-brand {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0 0.1rem; margin-bottom: 0.75rem;
        }
        .sidebar-brand-icon {
          width: 32px; height: 32px; border-radius: 0.6rem;
          background: linear-gradient(135deg,#7c3aed,#4f46e5);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 16px rgba(124,58,237,0.4);
        }
        .sidebar-brand-name {
          font-family: 'Syne',sans-serif; font-weight: 700;
          font-size: 1rem; color: #f1f5f9; letter-spacing: -0.01em;
        }
        .sidebar-brand-name span { color: #8b5cf6; }

        .contact-list {
          flex: 1; overflow-y: auto; padding: 0.5rem 0.5rem;
          scrollbar-width: thin; scrollbar-color: rgba(139,92,246,0.3) transparent;
        }
        .contact-list::-webkit-scrollbar { width: 4px; }
        .contact-list::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 99px; }

        /* ── main ── */
        .main {
          flex: 1; display: flex; flex-direction: column;
          min-width: 0; position: relative; z-index: 1;
          opacity: 0; transform: translateX(16px);
          transition: opacity 0.45s .1s, transform 0.45s .1s;
        }
        .main.show { opacity: 1; transform: none; }

        /* top bar */
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.75rem 1.25rem;
          background: rgba(10,12,24,0.7);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          flex-shrink: 0;
        }
        .topbar-left { display: flex; align-items: center; gap: 0.75rem; }
        .mobile-menu-btn {
          display: none; width: 34px; height: 34px; border-radius: 0.6rem;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer; align-items: center; justify-content: center; color: #94a3b8;
          transition: background 0.15s;
        }
        @media (max-width: 640px) { .mobile-menu-btn { display: flex; } }

        .user-info-badge {
          display: flex; align-items: center; gap: 0.5rem;
        }
        .status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
          animation: statusPulse 3s infinite;
        }
        @keyframes statusPulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .user-name-label {
          font-family: 'Syne',sans-serif; font-weight: 600;
          font-size: 0.82rem; color: #e2e8f0;
        }
        .user-sub { font-size: 0.7rem; color: #475569; }

        .logout-btn {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.45rem 0.85rem; border-radius: 0.65rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #94a3b8; font-size: 0.78rem; font-weight: 500;
          cursor: pointer; transition: all 0.18s;
          font-family: 'DM Sans', sans-serif;
        }
        .logout-btn:hover {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.25);
          color: #fca5a5;
        }

        /* chat header */
        .chat-header-bar {
          display: flex; align-items: center; gap: 0.85rem;
          padding: 0.8rem 1.25rem;
          background: rgba(13,15,26,0.8);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(16px);
          flex-shrink: 0;
        }
        .chat-contact-name {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.9rem; color: #f1f5f9;
        }
        .chat-contact-status {
          font-size: 0.7rem; color: #64748b; margin-top: 0.1rem;
        }
        .chat-contact-status.online { color: #22c55e; }

        /* messages area */
        .messages-area {
          flex: 1; overflow-y: auto;
          padding: 1.25rem 1rem;
          display: flex; flex-direction: column; gap: 0.1rem;
          scrollbar-width: thin; scrollbar-color: rgba(139,92,246,0.2) transparent;
          background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,58,237,0.04) 0%, transparent 70%);
        }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.2); border-radius: 99px; }

        /* date separator */
        .date-sep {
          display: flex; align-items: center; gap: 0.75rem;
          margin: 0.75rem 0; font-size: 0.68rem;
          color: #475569; text-transform: uppercase; letter-spacing: 0.08em;
        }
        .date-sep::before, .date-sep::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(255,255,255,0.06);
        }

        /* empty state */
        .empty-state {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 1rem;
          color: #475569;
        }
        .empty-icon {
          width: 64px; height: 64px; border-radius: 1.2rem;
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.75rem;
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        .empty-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 1.05rem; color: #94a3b8;
        }
        .empty-sub { font-size: 0.8rem; color: #475569; }

        /* bubble animation */
        @keyframes bubbleIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: none; }
        }

        /* section label */
        .section-label {
          padding: 0.4rem 0.85rem 0.2rem;
          font-size: 0.63rem; color: #475569;
          font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
        }

        /* connection badge */
        .conn-badge {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.7rem; color: #64748b; margin-left: auto;
        }
        .conn-dot {
          width: 6px; height: 6px; border-radius: 50%;
        }
        .conn-dot.on  { background: #22c55e; box-shadow: 0 0 5px #22c55e; }
        .conn-dot.off { background: #ef4444; }

        /* sidebar footer */
        .sidebar-footer {
          padding: 0.75rem 0.85rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; gap: 0.65rem;
          flex-wrap: wrap;
        }
        .sidebar-footer-name {
          font-size: 0.8rem; font-weight: 600; color: #cbd5e1;
          font-family: 'Syne', sans-serif;
        }
        .sidebar-footer-email { font-size: 0.68rem; color: #475569; }
        .sidebar-footer-actions {
          margin-left: auto;
          display: flex;
          gap: 0.4rem;
          width: 100%;
          justify-content: flex-end;
        }

        /* reveal */
        .reveal { opacity: 0; transform: translateY(12px);
          transition: opacity 0.4s, transform 0.4s; }
        .reveal.show { opacity: 1; transform: none; }
        .d1 { transition-delay: 0.08s; }
        .d2 { transition-delay: 0.16s; }
        .d3 { transition-delay: 0.24s; }
      `}</style>

      <div className="chat-root">

        {/* ── Mobile overlay ── */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ════════════ SIDEBAR ════════════ */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <div className="sidebar-brand-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <span className="sidebar-brand-name">Chattr<span>.</span></span>
              <div className="conn-badge" style={{ marginLeft: "auto" }}>
                <span className={`conn-dot ${isConnected ? "on" : "off"}`} />
                <span>{isConnected ? "Live" : "Off"}</span>
              </div>
            </div>
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>

          <p className="section-label">Messages</p>

          <div className="contact-list">
            {filteredContacts.length === 0 ? (
              <p style={{ textAlign: "center", color: "#475569", fontSize: "0.78rem", marginTop: "2rem" }}>
                No contacts found
              </p>
            ) : filteredContacts.map((c) => (
              <ContactRow
                key={c.id}
                contact={c}
                active={c.id === activeContact?.id}
                online={onlineSet.has(String(c.id))}
                onClick={(contact) => { setActiveChatId(contact.id); setSidebarOpen(false); }}
              />
            ))}
          </div>

          <div className="sidebar-footer">
            <Avatar name={user?.name || "Me"} size={34} online={isConnected} src={user?.avatar} />
            <div>
              <p className="sidebar-footer-name">{user?.name || "You"}</p>
              <p className="sidebar-footer-email">{user?.email || ""}</p>
            </div>
            <div className="sidebar-footer-actions">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                style={{
                  padding: "0.35rem 0.6rem",
                  fontSize: "0.68rem",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#cbd5e1",
                  cursor: "pointer",
                }}
              >
                Upload
              </button>
              <button
                type="button"
                onClick={handleAutoAvatar}
                style={{
                  padding: "0.35rem 0.6rem",
                  fontSize: "0.68rem",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#cbd5e1",
                  cursor: "pointer",
                }}
              >
                Auto
              </button>
            </div>
          </div>
        </aside>

        {/* ════════════ MAIN PANEL ════════════ */}
        <div className={`main ${mounted ? "show" : ""}`}>

          {/* Top bar */}
          <div className="topbar">
            <div className="topbar-left">
              <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen((s) => !s)}
                aria-label="Toggle sidebar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <div className="user-info-badge">
                <span className="status-dot" />
                <div>
                  <p className="user-name-label">{user?.name || "Chat member"}</p>
                  <p className="user-sub">Dashboard</p>
                </div>
              </div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>

          {activeContact ? (
            <>
              {/* Chat header bar */}
              <div className={`chat-header-bar reveal d1 ${mounted ? "show" : ""}`}>
                <Avatar name={activeContact.name} size={38} online={onlineSet.has(String(activeContact.id))} src={activeContact.avatar} />
                <div>
                  <p className="chat-contact-name">{activeContact.name}</p>
                  <p className={`chat-contact-status ${onlineSet.has(String(activeContact.id)) ? "online" : ""}`}>
                    {onlineSet.has(String(activeContact.id)) ? "● Active now" : "○ Offline"}
                  </p>
                </div>
                {/* action icons */}
                <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
                  {[
                    <path key="v" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>,
                    <><circle key="p" cx="12" cy="12" r="3"/><path key="p2" d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></>,
                  ].map((icon, i) => (
                    <button key={i} type="button" style={{
                      width: 34, height: 34, borderRadius: "0.6rem",
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: "#64748b", transition: "all 0.15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.1)"; e.currentTarget.style.color = "#a78bfa"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#64748b"; }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {icon}
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="messages-area">
                <div className="date-sep">Today</div>
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: "0.8rem", marginTop: "3rem" }}>
                    No messages yet. Say hello! 👋
                  </div>
                ) : messages.map((msg) => (
                  <Bubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <InlineInput onSend={handleSend} />
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <p className="empty-title">No conversation selected</p>
              <p className="empty-sub">Pick a contact from the sidebar to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
