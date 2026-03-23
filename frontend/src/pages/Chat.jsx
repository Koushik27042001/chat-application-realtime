import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import ChatHeader from "../components/ChatHeader";
import MessageBubble from "../components/MessageBubble";
import MessageInput from "../components/MessageInput";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import useSocket from "../hooks/useSocket";
import { messageApi, userApi } from "../services/api";

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const normalizeMessage = (message, currentUserId) => {
  const senderId = message.sender?.toString?.() ?? message.sender;
  return {
    id: message._id || message.id || `message-${Date.now()}`,
    text: message.content,
    sender: senderId,
    own: senderId === currentUserId,
    time: formatTime(message.createdAt || new Date()),
  };
};

export default function Chat() {
  const navigate = useNavigate();
  const { logout, token, user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const activeChatIdRef = useRef(null);

  const handleIncomingMessage = (message) => {
    const senderId = message.sender?.toString?.() ?? message.sender;

    setContacts((current) =>
      current.map((contact) =>
        contact.id === senderId
          ? {
              ...contact,
              lastMessage: message.content,
            }
          : contact
      )
    );

    if (activeChatIdRef.current === senderId) {
      setMessages((current) => [
        ...current,
        normalizeMessage(message, user?.id),
      ]);
    }
  };

  const { socket, isConnected } = useSocket({
    userId: user?.id,
    onMessage: handleIncomingMessage,
  });

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    const loadUsers = async () => {
      if (!token) {
        return;
      }

      try {
        const { data } = await userApi.list(token);
        const nextContacts = data.map((contact) => ({
          id: contact.id,
          name: contact.name,
          email: contact.email,
          lastMessage: "Tap to start a conversation.",
        }));

        setContacts(nextContacts);
        if (!activeChatId && nextContacts.length) {
          setActiveChatId(nextContacts[0].id);
        }
      } catch (error) {
        setContacts([]);
      }
    };

    loadUsers();
  }, [token]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!token || !activeChatId) {
        setMessages([]);
        return;
      }

      try {
        const { data } = await messageApi.list(token, activeChatId);
        const normalized = data.map((message) =>
          normalizeMessage(message, user?.id)
        );

        setMessages(normalized);

        const lastMessage = normalized[normalized.length - 1];
        if (lastMessage) {
          setContacts((current) =>
            current.map((contact) =>
              contact.id === activeChatId
                ? { ...contact, lastMessage: lastMessage.text }
                : contact
            )
          );
        }
      } catch (error) {
        setMessages([]);
      }
    };

    loadMessages();
  }, [token, activeChatId, user?.id]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return contacts;
    }

    return contacts.filter((contact) =>
      `${contact.name} ${contact.email || ""} ${contact.id} ${contact.lastMessage}`
        .toLowerCase()
        .includes(query)
    );
  }, [contacts, searchTerm]);

  const activeContact =
    filteredUsers.find((contact) => contact.id === activeChatId) ||
    contacts.find((contact) => contact.id === activeChatId) ||
    filteredUsers[0] ||
    contacts[0];

  const handleSelectContact = (contact) => {
    setActiveChatId(contact.id);
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

      const normalized = normalizeMessage(data.message, user?.id);
      setMessages((current) => [...current, normalized]);

      setContacts((current) =>
        current.map((contact) =>
          contact.id === activeContact.id
            ? { ...contact, lastMessage: normalized.text }
            : contact
        )
      );

      if (socket) {
        socket.emit("private-message", {
          receiverId: activeContact.id,
          message: data.message,
        });
      }
    } catch (error) {
      // Silent fail for now; could add toast/alert.
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-100">
      <div className="flex h-full">
        <Sidebar
          contacts={filteredUsers}
          activeContactId={activeContact?.id}
          onSelectContact={handleSelectContact}
          currentUser={user}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <div className="flex flex-col flex-1 bg-gray-100">
          <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-coral">
                Dashboard
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Signed in as {user?.name || "Chat member"}.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold transition border rounded-xl border-slate-200 text-slate-700 hover:border-coral hover:text-coral"
            >
              Logout
            </button>
          </div>

          {activeContact ? (
            <>
              <ChatHeader activeContact={activeContact} isConnected={isConnected} />

              <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    own={message.own}
                    message={message}
                  />
                ))}
              </div>

              <MessageInput onSend={handleSend} />
            </>
          ) : (
            <div className="flex items-center justify-center flex-1 p-6 text-slate-500">
              Select a user from the sidebar to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
