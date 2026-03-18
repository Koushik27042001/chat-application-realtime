import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ChatHeader from "../components/ChatHeader";
import MessageBubble from "../components/MessageBubble";
import MessageInput from "../components/MessageInput";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import useSocket from "../hooks/useSocket";

const initialChats = [
  {
    id: "user-1",
    name: "John Doe",
    role: "Frontend Developer",
    lastMessage: "Can you review the dashboard layout?",
    messages: [
      { id: "1", text: "Hello!", sender: "me", time: "09:30 AM" },
      { id: "2", text: "Hi there!", sender: "them", time: "09:31 AM" },
      {
        id: "3",
        text: "Can you review the dashboard layout?",
        sender: "them",
        time: "09:32 AM",
      },
    ],
  },
  {
    id: "user-2",
    name: "Sarah Lee",
    role: "Product Designer",
    lastMessage: "The spacing feels much better now.",
    messages: [
      {
        id: "4",
        text: "The spacing feels much better now.",
        sender: "them",
        time: "10:12 AM",
      },
    ],
  },
  {
    id: "user-3",
    name: "Alex Kim",
    role: "Backend Engineer",
    lastMessage: "Socket server will be ready later today.",
    messages: [
      {
        id: "5",
        text: "Socket server will be ready later today.",
        sender: "them",
        time: "11:05 AM",
      },
    ],
  },
];

const formatTime = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function Chat() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { isConnected } = useSocket();
  const [searchTerm, setSearchTerm] = useState("");
  const [chatUsers, setChatUsers] = useState(initialChats);
  const [activeChatId, setActiveChatId] = useState(initialChats[0].id);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return chatUsers;
    }

    return chatUsers.filter((contact) =>
      `${contact.name} ${contact.role} ${contact.lastMessage}`
        .toLowerCase()
        .includes(query)
    );
  }, [chatUsers, searchTerm]);

  const activeContact =
    filteredUsers.find((contact) => contact.id === activeChatId) ||
    chatUsers.find((contact) => contact.id === activeChatId) ||
    filteredUsers[0] ||
    chatUsers[0];

  const handleSelectContact = (contact) => {
    setActiveChatId(contact.id);
  };

  const handleSend = (text) => {
    setChatUsers((current) =>
      current.map((contact) => {
        if (contact.id !== activeChatId) {
          return contact;
        }

        const nextMessage = {
          id: `message-${Date.now()}`,
          text,
          sender: "me",
          time: formatTime(),
        };

        return {
          ...contact,
          lastMessage: text,
          messages: [...contact.messages, nextMessage],
        };
      })
    );
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

        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-coral">
                Dashboard
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Mock authentication is active for UI testing.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-coral hover:text-coral"
            >
              Logout
            </button>
          </div>

          {activeContact ? (
            <>
              <ChatHeader activeContact={activeContact} isConnected={isConnected} />

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {activeContact.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    own={message.sender === "me"}
                    message={message}
                  />
                ))}
              </div>

              <MessageInput onSend={handleSend} />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-slate-500">
              Select a user from the sidebar to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
