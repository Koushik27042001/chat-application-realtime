import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Avatar from "../components/chat/Avatar";
import ChatHeader from "../components/chat/ChatHeader";
import ContactRow from "../components/chat/ContactRow";
import MessageBubble from "../components/chat/MessageBubble";
import MessageInput from "../components/chat/MessageInput";
import SearchBar from "../components/chat/SearchBar";
import { useAuth } from "../context/AuthContext";
import useSocket from "../hooks/useSocket";
import { conversationApi, messageApi, userApi } from "../services/api";
import {
  normalizeContact,
  normalizeMessage,
  prepareAvatarForUpload,
  upsertContact,
} from "./chat/helpers";
import { chatPageStyles } from "./chat/styles";

const formatCallDuration = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${paddedMinutes}:${paddedSeconds}`;
};

export default function Chat() {
  const navigate = useNavigate();
  const { logout, token, user, saveAuth } = useAuth();

  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [directoryResults, setDirectoryResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [avatarFeedback, setAvatarFeedback] = useState("");
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);

  const activeChatIdRef = useRef(null);
  const contactsRef = useRef([]);
  const messagesEndRef = useRef(null);
  const avatarInputRef = useRef(null);

  const searchQuery = searchTerm.trim();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!activeVideoCall?.startedAt) {
      setCallDurationSeconds(0);
      return undefined;
    }

    const syncDuration = () => {
      const elapsed = Math.max(
        0,
        Math.floor((Date.now() - new Date(activeVideoCall.startedAt).getTime()) / 1000)
      );
      setCallDurationSeconds(elapsed);
    };

    syncDuration();
    const intervalId = setInterval(syncDuration, 1000);
    return () => clearInterval(intervalId);
  }, [activeVideoCall]);

  const handleSelectContact = (contact) => {
    const normalized = normalizeContact(contact);
    if (!normalized.id) {
      return;
    }

    setContacts((current) => upsertContact(current, normalized));
    setActiveChatId(normalized.id);
    setSidebarOpen(false);

    if (searchQuery) {
      setSearchTerm("");
      setDirectoryResults([]);
    }
  };

  const handleIncomingMessage = async (message) => {
    const senderId = String(message.sender?.toString?.() ?? message.sender ?? "");
    let incomingContact = contactsRef.current.find((contact) => contact.id === senderId);

    if (!incomingContact && token && senderId) {
      try {
        const { data } = await userApi.get(token, senderId);
        incomingContact = normalizeContact(data);
      } catch {
        incomingContact = normalizeContact({ id: senderId, name: "Unknown user" });
      }
    }

    if (incomingContact) {
      setContacts((current) =>
        upsertContact(
          current,
          {
            ...incomingContact,
            conversationId: message.conversationId || incomingContact.conversationId,
            lastMessage: message.content,
            lastMessageAt: message.createdAt || new Date().toISOString(),
          },
          { prepend: true }
        )
      );
    }

    if (activeChatIdRef.current === senderId) {
      setMessages((current) => [...current, normalizeMessage(message, user?.id)]);
    }
  };

  const { socket, isConnected, onlineUsers } = useSocket({
    userId: user?.id,
    onMessage: handleIncomingMessage,
  });

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);

  useEffect(() => {
    if (!token) {
      return;
    }

    conversationApi
      .list(token)
      .then(({ data }) => {
        const nextContacts = data.map(normalizeContact);
        setContacts(nextContacts);
        if (!activeChatIdRef.current && nextContacts.length) {
          setActiveChatId(nextContacts[0].id);
        }
      })
      .catch(() => setContacts([]));
  }, [token]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    if (!searchQuery) {
      setDirectoryResults([]);
      setIsSearching(false);
      return undefined;
    }

    let cancelled = false;
    setIsSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await userApi.list(token, searchQuery);
        if (!cancelled) {
          setDirectoryResults(data.map(normalizeContact));
        }
      } catch {
        if (!cancelled) {
          setDirectoryResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [token, searchQuery]);

  useEffect(() => {
    if (!token || !activeChatId) {
      setMessages([]);
      return;
    }

    const activeContact = contactsRef.current.find((contact) => contact.id === activeChatId);
    if (!activeContact) {
      setMessages([]);
      return;
    }

    (async () => {
      try {
        let conversationId = activeContact.conversationId;
        if (!conversationId) {
          const { data } = await conversationApi.withUser(token, activeContact.id);
          conversationId = data.conversationId || null;
          setContacts((current) =>
            current.map((contact) =>
              contact.id === activeContact.id ? { ...contact, conversationId } : contact
            )
          );
        }

        if (!conversationId) {
          setMessages([]);
          return;
        }

        const { data } = await messageApi.list(token, conversationId, 0, 20);
        const nextMessages = data.map((message) => normalizeMessage(message, user?.id));
        setMessages(nextMessages);

        const lastMessage = nextMessages[nextMessages.length - 1];
        if (lastMessage) {
          setContacts((current) =>
            current.map((contact) =>
              contact.id === activeChatId ? { ...contact, lastMessage: lastMessage.text } : contact
            )
          );
        }
      } catch {
        setMessages([]);
      }
    })();
  }, [token, activeChatId, user?.id]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery) {
      return contacts;
    }

    const contactMap = new Map(contacts.map((contact) => [contact.id, contact]));
    return directoryResults.map((result) => ({
      ...result,
      ...(contactMap.get(result.id) || {}),
    }));
  }, [contacts, directoryResults, searchQuery]);

  const onlineSet = useMemo(
    () => new Set((onlineUsers || []).map((id) => String(id))),
    [onlineUsers]
  );

  const activeContact =
    filteredContacts.find((contact) => contact.id === activeChatId) ||
    contacts.find((contact) => contact.id === activeChatId) ||
    filteredContacts[0] ||
    contacts[0];

  const isVideoCallActive = Boolean(
    activeContact && activeVideoCall?.contactId === activeContact.id && activeVideoCall?.startedAt
  );
  const callDurationLabel = formatCallDuration(callDurationSeconds);

  const handleToggleVideoCall = () => {
    if (!activeContact) {
      return;
    }

    setActiveVideoCall((current) => {
      if (current?.contactId === activeContact.id) {
        return null;
      }

      return {
        contactId: activeContact.id,
        startedAt: new Date().toISOString(),
      };
    });
  };

  const handleSend = async (text) => {
    if (!token || !activeContact) {
      return;
    }

    try {
      const { data } = await messageApi.send(token, {
        receiverId: activeContact.id,
        content: text,
      });
      const nextMessage = normalizeMessage(data.message, user?.id);

      setMessages((current) => [...current, nextMessage]);
      setContacts((current) =>
        upsertContact(
          current,
          {
            ...activeContact,
            lastMessage: nextMessage.text,
            conversationId: data.conversation?._id || activeContact.conversationId || null,
            lastMessageAt: data.message?.createdAt || new Date().toISOString(),
          },
          { prepend: true }
        )
      );

      if (socket) {
        socket.emit("private-message", {
          receiverId: activeContact.id,
          message: data.message,
        });
      }
    } catch {}
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleAvatarUpload = async (file) => {
    if (!token || !file) {
      return;
    }

    if (!file.type?.startsWith("image/")) {
      setAvatarFeedback("Please choose an image file.");
      return;
    }

    setIsSavingAvatar(true);
    setAvatarFeedback("");

    try {
      const dataUrl = await prepareAvatarForUpload(file);
      const { data } = await userApi.updateAvatar(token, dataUrl);
      saveAuth({ token, user: data });
      setAvatarFeedback("Profile picture updated.");
    } catch (error) {
      setAvatarFeedback(
        error?.response?.data?.message ||
          error?.message ||
          "Could not update the profile picture."
      );
    } finally {
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
      setIsSavingAvatar(false);
    }
  };

  const handleAutoAvatar = async () => {
    if (!token) {
      return;
    }

    setIsSavingAvatar(true);
    setAvatarFeedback("");

    try {
      const { data } = await userApi.updateAvatar(token, "auto");
      saveAuth({ token, user: data });
      setAvatarFeedback("Default avatar restored.");
    } catch (error) {
      setAvatarFeedback(
        error?.response?.data?.message || "Could not restore the default avatar."
      );
    } finally {
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
      setIsSavingAvatar(false);
    }
  };

  return (
    <>
      <style>{chatPageStyles}</style>

      <div className="chat-root">
        {sidebarOpen ? <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} /> : null}

        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <div className="sidebar-brand-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

          <p className="section-label">{searchQuery ? "Search results" : "Chats"}</p>

          <div className="contact-list">
            {isSearching ? (
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.78rem", marginTop: "2rem" }}>
                Searching users...
              </p>
            ) : filteredContacts.length === 0 ? (
              <p style={{ textAlign: "center", color: "#475569", fontSize: "0.78rem", marginTop: "2rem", lineHeight: 1.6 }}>
                {searchQuery
                  ? "No registered user matched that name or user ID."
                  : "No chats yet. Search by name or user ID to start a conversation."}
              </p>
            ) : (
              filteredContacts.map((contact) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  active={contact.id === activeContact?.id}
                  online={onlineSet.has(String(contact.id))}
                  onClick={handleSelectContact}
                />
              ))
            )}
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
                onChange={(event) => handleAvatarUpload(event.target.files?.[0])}
              />
              <button
                type="button"
                disabled={isSavingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                style={{
                  padding: "0.35rem 0.6rem",
                  fontSize: "0.68rem",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#cbd5e1",
                  cursor: isSavingAvatar ? "wait" : "pointer",
                  opacity: isSavingAvatar ? 0.7 : 1,
                }}
              >
                {isSavingAvatar ? "Saving..." : "Upload"}
              </button>
              <button
                type="button"
                disabled={isSavingAvatar}
                onClick={handleAutoAvatar}
                style={{
                  padding: "0.35rem 0.6rem",
                  fontSize: "0.68rem",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#cbd5e1",
                  cursor: isSavingAvatar ? "wait" : "pointer",
                  opacity: isSavingAvatar ? 0.7 : 1,
                }}
              >
                Auto
              </button>
            </div>
            {avatarFeedback ? (
              <p
                style={{
                  width: "100%",
                  fontSize: "0.68rem",
                  color:
                    avatarFeedback.includes("updated") || avatarFeedback.includes("restored")
                      ? "#86efac"
                      : "#fca5a5",
                  marginTop: "0.15rem",
                  lineHeight: 1.5,
                }}
              >
                {avatarFeedback}
              </p>
            ) : null}
          </div>
        </aside>

        <div className={`main ${mounted ? "show" : ""}`}>
          <div className="topbar">
            <div className="topbar-left">
              <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen((current) => !current)}
                aria-label="Toggle sidebar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
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
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign out
            </button>
          </div>

          {activeContact ? (
            <>
              <ChatHeader
                activeContact={activeContact}
                online={onlineSet.has(String(activeContact.id))}
                isVideoCallActive={isVideoCallActive}
                callDurationLabel={callDurationLabel}
                onToggleVideoCall={handleToggleVideoCall}
              />

              <div className="messages-area">
                <div className="date-sep">Today</div>
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: "0.8rem", marginTop: "3rem" }}>
                    No messages yet. Say hello!
                  </div>
                ) : (
                  messages.map((message) => <MessageBubble key={message.id} message={message} />)
                )}
                <div ref={messagesEndRef} />
              </div>

              <MessageInput onSend={handleSend} />
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">Chat</div>
              <p className="empty-title">No conversation selected</p>
              <p className="empty-sub">Pick a contact from the sidebar to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
