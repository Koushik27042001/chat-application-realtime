import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";


import Avatar from "../components/chat/Avatar";
import ChatHeader from "../components/chat/ChatHeader";
import ContactRow from "../components/chat/ContactRow";
import MessageBubble from "../components/chat/MessageBubble";
import MessageInput from "../components/chat/MessageInput";
import SearchBar from "../components/chat/SearchBar";
import GroupCreationModal from "../components/chat/GroupCreationModal";
import { useAuth } from "../context/AuthContext";
import useNotifications from "../hooks/useNotifications";
import useSocket from "../hooks/useSocket";
import useWebRTCCall from "../hooks/useWebRTCCall";
import { conversationApi, messageApi, uploadApi, userApi } from "../services/api";
import {
  normalizeContact,
  normalizeMessage,
  prepareChatImageForUpload,
  prepareAvatarForUpload,
  isImageMessageContent,
  upsertContact,
} from "./chat/helpers";
import ChatPageRain from "../components/chat/ChatPageRain.jsx";
import NotificationsBell from "../components/chat/NotificationsBell.jsx";
import ChatCallOverlay from "./chat/ChatCallOverlay.jsx";
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [avatarFeedback, setAvatarFeedback] = useState("");
  const [imageUploadFeedback, setImageUploadFeedback] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [showScrollJump, setShowScrollJump] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const activeChatIdRef = useRef(null);
  const contactsRef = useRef([]);
  const threadRef = useRef({ peerId: null, convId: null });
  const socketRef = useRef(null);
  const partnerTypingHideTimerRef = useRef(null);
  const typingThrottleRef = useRef(0);
  const typingAutoStopRef = useRef(null);
  const markIncomingReadTimerRef = useRef(null);
  const prevTypingTargetRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const stickMessagesToBottomRef = useRef(true);
  const avatarInputRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const searchQuery = searchTerm.trim();

  const {
    notifications,
    unreadCount,
    refreshNotifications,
    ingestNotificationFromSocket,
    markNotificationRead,
    markAllNotificationsRead,
  } = useNotifications(token);

  const updateJumpVisibility = useCallback(() => {
    const el = messagesAreaRef.current;
    if (!el) return;
    const threshold = 88;
    const distanceFromBottom = el.scrollHeight - el.clientHeight - el.scrollTop;
    const pinned = distanceFromBottom <= threshold;
    stickMessagesToBottomRef.current = pinned;
    setShowScrollJump(distanceFromBottom > threshold && messages.length > 0);
  }, [messages.length]);

  useEffect(() => {
    if (stickMessagesToBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    const id = requestAnimationFrame(updateJumpVisibility);
    return () => cancelAnimationFrame(id);
  }, [messages, updateJumpVisibility]);

  useEffect(() => {
    const el = messagesAreaRef.current;
    if (!el) return;
    updateJumpVisibility();
    el.addEventListener("scroll", updateJumpVisibility, { passive: true });
    return () => el.removeEventListener("scroll", updateJumpVisibility);
  }, [activeChatId, updateJumpVisibility]);

  useEffect(() => {
    const el = messagesAreaRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => updateJumpVisibility());
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeChatId, updateJumpVisibility]);

  useEffect(() => {
    stickMessagesToBottomRef.current = true;
    setShowScrollJump(false);
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      updateJumpVisibility();
    });
  }, [activeChatId, updateJumpVisibility]);

  const scrollMessagesToLatest = useCallback(() => {
    stickMessagesToBottomRef.current = true;
    setShowScrollJump(false);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    requestAnimationFrame(updateJumpVisibility);
  }, [updateJumpVisibility]);


  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(timeoutId);
  }, []);

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

  const handleOpenFromNotification = async (notification) => {
    if (notification?.type === "CALL") {
      return;
    }
    const sid =
      notification?.meta?.senderId ?? notification?.meta?.sender?.toString?.();
    if (!sid || !token) {
      return;
    }
    const id = String(sid);
    let contact = contactsRef.current.find((c) => c.id === id);
    if (!contact) {
      try {
        const { data } = await userApi.get(token, id);
        contact = normalizeContact(data);
      } catch {
        contact = normalizeContact({ id, name: "User" });
      }
    }
    handleSelectContact(contact);
  };

  const handleIncomingMessage = async (message) => {
    const senderId = String(message.sender?.toString?.() ?? message.sender ?? "");
    const normalizedIncomingMessage = normalizeMessage(message, user?.id);
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
            lastMessage: normalizedIncomingMessage.messageType === "image" ? "Photo" : normalizedIncomingMessage.text,
            lastMessageAt: message.createdAt || new Date().toISOString(),
          },
          { prepend: true }
        )
      );
    }

    if (activeChatIdRef.current === senderId) {
      setMessages((current) => [...current, normalizedIncomingMessage]);
      const cid =
        message.conversationId?.toString?.() ??
        contactsRef.current.find((c) => c.id === senderId)?.conversationId;
      if (cid && token) {
        window.clearTimeout(markIncomingReadTimerRef.current);
        markIncomingReadTimerRef.current = window.setTimeout(async () => {
          try {
            await messageApi.markRead(token, cid);
            socketRef.current?.emit("read-receipt", {
              receiverId: senderId,
              conversationId: cid,
            });
          } catch {
            /* ignore */
          }
        }, 420);
      }
    }
  };

  const onRemoteTyping = useCallback((payload) => {
    if (String(payload?.fromUserId) !== String(threadRef.current.peerId) || !threadRef.current.peerId) {
      return;
    }
    setPartnerTyping(true);
    window.clearTimeout(partnerTypingHideTimerRef.current);
    partnerTypingHideTimerRef.current = window.setTimeout(() => setPartnerTyping(false), 3500);
  }, []);

  const onRemoteStopTyping = useCallback((payload) => {
    if (String(payload?.fromUserId) !== String(threadRef.current.peerId)) return;
    setPartnerTyping(false);
  }, []);

  const onConversationReadEvt = useCallback((payload) => {
    const { peerId, convId } = threadRef.current;
    if (!convId || !peerId || !payload?.conversationId || !payload?.readByUserId) return;
    if (String(payload.conversationId) !== String(convId)) return;
    if (String(payload.readByUserId) !== String(peerId)) return;
    setMessages((prev) => prev.map((m) => (m.own ? { ...m, status: "seen" } : m)));
  }, []);

  const { socket, isConnected, onlineUsers } = useSocket({
    userId: user?.id,
    onMessage: handleIncomingMessage,
    onNotification: ingestNotificationFromSocket,
    onTyping: onRemoteTyping,
    onStopTyping: onRemoteStopTyping,
    onConversationRead: onConversationReadEvt,
  });

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  const rtc = useWebRTCCall(socket, user?.id);

  useEffect(() => {
    const startedAt = rtc.session?.startedAt;
    if (!startedAt) {
      setCallDurationSeconds(0);
      return undefined;
    }

    const syncDuration = () => {
      const elapsed = Math.max(
        0,
        Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
      );
      setCallDurationSeconds(elapsed);
    };

    syncDuration();
    const intervalId = setInterval(syncDuration, 1000);
    return () => clearInterval(intervalId);
  }, [rtc.session?.startedAt]);

  useEffect(() => {
    const el = localVideoRef.current;
    if (!el) return;
    el.srcObject = rtc.localStream || null;
    if (rtc.localStream) {
      void el.play().catch(() => {});
    }
    return () => {
      el.srcObject = null;
    };
  }, [rtc.localStream]);

  useEffect(() => {
    const el = remoteVideoRef.current;
    if (!el) return;
    el.srcObject = rtc.remoteStream || null;
    if (rtc.remoteStream) {
      void el.play().catch(() => {});
    }
    return () => {
      el.srcObject = null;
    };
  }, [rtc.remoteStream]);

  useEffect(() => {
    const el = remoteAudioRef.current;
    if (!el) return;
    el.srcObject = rtc.remoteStream || null;
    if (rtc.remoteStream) {
      void el.play().catch(() => {});
    }
    return () => {
      el.srcObject = null;
    };
  }, [rtc.remoteStream]);

  useEffect(() => {
    if (!rtc.banner) return;
    const timer = window.setTimeout(() => rtc.clearBanner(), 5600);
    return () => window.clearTimeout(timer);
  }, [rtc.banner, rtc.clearBanner]);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    contactsRef.current = contacts;
    const c = contacts.find((row) => row.id === activeChatId);
    threadRef.current = { peerId: activeChatId, convId: c?.conversationId ?? null };
  }, [contacts, activeChatId]);

  useEffect(() => {
    const s = socketRef.current;
    const prevPeer = prevTypingTargetRef.current;
    if (s && prevPeer && activeChatId && prevPeer !== activeChatId) {
      s.emit("stop-typing", { receiverId: prevPeer });
    }
    prevTypingTargetRef.current = activeChatId;
    setPartnerTyping(false);
  }, [activeChatId]);

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
              contact.id === activeChatId
                ? {
                    ...contact,
                    lastMessage:
                      lastMessage.messageType === "image" ||
                      isImageMessageContent(lastMessage.text)
                        ? "Photo"
                        : lastMessage.text,
                  }
                : contact
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

  useEffect(() => {
    if (
      !token ||
      !socket ||
      !activeChatId ||
      !activeContact?.conversationId ||
      String(activeContact.id) !== String(activeChatId)
    ) {
      return;
    }

    let cancelled = false;
    const { id: pid, conversationId: cid } = activeContact;

    const t = window.setTimeout(async () => {
      try {
        await messageApi.markRead(token, cid);
        if (cancelled) return;
        socket.emit("read-receipt", { receiverId: pid, conversationId: cid });
      } catch {
        /* ignore */
      }
    }, 420);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [token, socket, activeChatId, activeContact?.id, activeContact?.conversationId]);

  const lastOwnMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.own) return messages[i].id;
    }
    return null;
  }, [messages]);

  const scheduleTypingPing = useCallback(() => {
    const s = socketRef.current;
    const peerId = threadRef.current.peerId;
    if (!s || !peerId) return;
    const now = Date.now();
    if (now - typingThrottleRef.current > 750) {
      s.emit("typing", { receiverId: peerId });
      typingThrottleRef.current = now;
    }
    window.clearTimeout(typingAutoStopRef.current);
    typingAutoStopRef.current = window.setTimeout(() => {
      s.emit("stop-typing", { receiverId: peerId });
    }, 2600);
  }, []);

  const flushTypingStop = useCallback(() => {
    const s = socketRef.current;
    const peerId = threadRef.current.peerId;
    if (!s || !peerId) return;
    window.clearTimeout(typingAutoStopRef.current);
    s.emit("stop-typing", { receiverId: peerId });
  }, []);

  const callPeerId = rtc.incoming?.from ?? rtc.session?.peerId ?? null;

  const callPeerContact = useMemo(() => {
    if (!callPeerId) return null;
    const merged = [...contacts, ...directoryResults];
    return merged.find((c) => String(c.id) === String(callPeerId)) || null;
  }, [callPeerId, contacts, directoryResults]);

  const callPeerName =
    callPeerContact?.name || (callPeerId ? `User ${callPeerId}` : "");

  const headerCallMatches =
    activeContact &&
    rtc.session &&
    String(rtc.session.peerId) === String(activeContact.id);

  const headerCallMode =
    headerCallMatches && rtc.session.callType === "voice"
      ? "voice"
      : headerCallMatches
        ? "video"
        : null;

  const callDurationLabel = formatCallDuration(callDurationSeconds);

  const handleToggleVideoCall = () => {
    activeContact?.id && rtc.toggleVideoCall(activeContact.id);
  };

  const handleToggleVoiceCall = () => {
    activeContact?.id && rtc.toggleVoiceCall(activeContact.id);
  };

  const isIncomingVideo =
    rtc.incoming != null && rtc.incoming.callType !== "audio";
  const isActiveVideoSession = rtc.session?.callType === "video";

  const handleSend = async (text) => {
    if (!token || !activeContact) {
      return;
    }

    try {
      const { data } = await messageApi.send(token, {
        receiverId: activeContact.id,
        content: text,
        messageType: "text",
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

  const handleImageSend = async (file) => {
    if (!token || !activeContact || isUploadingImage) {
      return;
    }

    setIsUploadingImage(true);
    setImageUploadFeedback("");

    try {
      const image = await prepareChatImageForUpload(file);
      const { data: uploaded } = await uploadApi.image(token, image);
      const { data } = await messageApi.send(token, {
        receiverId: activeContact.id,
        content: uploaded.url,
        messageType: "image",
      });
      const nextMessage = normalizeMessage(data.message, user?.id);

      setMessages((current) => [...current, nextMessage]);
      setContacts((current) =>
        upsertContact(
          current,
          {
            ...activeContact,
            lastMessage: "Photo",
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
    } catch (error) {
      setImageUploadFeedback(
        error?.response?.data?.message ||
          error?.message ||
          "Could not send the selected photo."
      );
    } finally {
      setIsUploadingImage(false);
    }
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

      {rtc.banner ? (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 18,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 400,
            padding: "0.55rem 1rem",
            borderRadius: "999px",
            fontSize: "0.78rem",
            fontWeight: 600,
            maxWidth: "min(90vw, 420px)",
            textAlign: "center",
            background:
              rtc.banner.type === "error"
                ? "rgba(239,68,68,0.95)"
                : "rgba(30,41,59,0.92)",
            color: "#fefce8",
            boxShadow: "0 14px 40px rgba(0,0,0,0.2)",
          }}
        >
          {rtc.banner.msg}
        </div>
      ) : null}

      <ChatPageRain />

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

          <div style={{ padding: "0.5rem 0.85rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <p className="section-label" style={{ margin: 0, flex: 1 }}>{searchQuery ? "Search results" : "Chats"}</p>
            <button
              onClick={() => setIsGroupModalOpen(true)}
              className="create-group-btn"
              title="Create a new group"
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: "0.5rem",
                backgroundColor: "#ff7a59",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: "600",
                transition: "background-color 0.2s",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#ff6a3d")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#ff7a59")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Group

            </button>
          </div>

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
                className="sidebar-foot-btn"
                disabled={isSavingAvatar}
                onClick={() => avatarInputRef.current?.click()}
              >
                {isSavingAvatar ? "Saving..." : "Upload"}
              </button>
              <button
                type="button"
                className="sidebar-foot-btn"
                disabled={isSavingAvatar}
                onClick={handleAutoAvatar}
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

            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <NotificationsBell
                notifications={notifications}
                unreadCount={unreadCount}
                onRefresh={refreshNotifications}
                onMarkRead={(id, wasUnread) => markNotificationRead(id, wasUnread)}
                onMarkAllRead={markAllNotificationsRead}
                onOpenFromNotification={(n) => void handleOpenFromNotification(n)}
              />
              <button className="logout-btn" onClick={handleLogout}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>
          </div>

          {activeContact ? (
            <>
              <ChatHeader
                activeContact={activeContact}
                online={onlineSet.has(String(activeContact.id))}
                partnerTyping={partnerTyping}
                callMode={headerCallMode}
                callDurationLabel={callDurationLabel}
                onToggleVideoCall={handleToggleVideoCall}
                onToggleVoiceCall={handleToggleVoiceCall}
                token={token}
                currentUserId={user?.id}
                onGroupMemberRemoved={(memberId) => {
                  // Handle member removal from group
                  if (activeContact.participants) {
                    setContacts((prev) =>
                      prev.map((c) =>
                        c.id === activeContact.id
                          ? {
                              ...c,
                              participants: c.participants.filter((p) => p.id !== memberId && p._id !== memberId),
                            }
                          : c
                      )
                    );
                  }
                }}
              />

              <div className="messages-area" ref={messagesAreaRef}>
                <div className="date-sep">Today</div>
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: "0.8rem", marginTop: "3rem" }}>
                    No messages yet. Say hello!
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      readReceipt={
                        message.own && message.id === lastOwnMessageId
                          ? String(message.status).toLowerCase() === "seen"
                            ? "Seen"
                            : "Sent"
                          : null
                      }
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
                {showScrollJump ? (
                  <button
                    type="button"
                    className="chat-scroll-jump"
                    aria-label="Scroll to latest messages"
                    title="Latest messages"
                    onClick={scrollMessagesToLatest}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                ) : null}
              </div>

              {imageUploadFeedback ? (
                <p
                  style={{
                    padding: "0.55rem 1.15rem 0",
                    color: "#b91c1c",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    background: "rgba(255,255,255,0.2)",
                  }}
                >
                  {imageUploadFeedback}
                </p>
              ) : null}
              <MessageInput
                onSend={handleSend}
                onImageSelected={handleImageSend}
                onTypingActivity={scheduleTypingPing}
                onTypingBlur={flushTypingStop}
                isUploadingImage={isUploadingImage}
              />
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">Chat</div>
              <p className="empty-title">No conversation selected</p>
              <p className="empty-sub">Pick a contact from the sidebar to start chatting</p>
            </div>
          )}
        </div>

        <ChatCallOverlay
          rtc={rtc}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          remoteAudioRef={remoteAudioRef}
          callPeerName={callPeerName}
          callPeerContact={callPeerContact}
          callDurationSeconds={callDurationSeconds}
          isIncomingVideo={isIncomingVideo}
          isActiveVideoSession={isActiveVideoSession}
        />

        <GroupCreationModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          contacts={contacts.filter((c) => !c.isGroup)}
          token={token}
          currentUser={user}
          onGroupCreated={(group) => {
            setIsGroupModalOpen(false);
            // Fetch updated conversations list
            if (token) {
              conversationApi.list(token).then(({ data }) => {
                setContacts(data || []);
                setActiveChatId(group.conversationId);
              }).catch(() => {
                // Handle error silently
              });
            }
          }}
        />
      </div>
    </>
  );
}
