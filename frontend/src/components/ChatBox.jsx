import { useMemo, useState } from "react";

import MessageBubble from "./MessageBubble";

const ChatBox = ({ activeContact, currentUser }) => {
  const [draft, setDraft] = useState("");

  const messages = useMemo(
    () =>
      activeContact
        ? [
            {
              id: 1,
              senderId: activeContact.id,
              content: "Hey, are we still on for the product sync today?",
            },
            {
              id: 2,
              senderId: currentUser?.id,
              content: "Yep, I have already shared the draft agenda.",
            },
          ]
        : [],
    [activeContact, currentUser?.id]
  );

  if (!activeContact) {
    return (
      <section className="flex min-h-[520px] flex-1 items-center justify-center rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-panel backdrop-blur">
        <div className="max-w-md text-center">
          <p className="font-display text-2xl font-semibold text-ink">
            Pick a conversation
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Your React + Tailwind chat shell is ready. Connect it to the backend
            message APIs to make it live.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[520px] flex-1 flex-col rounded-[2rem] border border-white/70 bg-white/80 shadow-panel backdrop-blur">
      <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            {activeContact.name}
          </h2>
          <p className="text-sm text-teal">Online now</p>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.senderId === currentUser?.id}
          />
        ))}
      </div>

      <form className="border-t border-slate-100 px-6 py-5">
        <div className="flex gap-3">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm outline-none transition focus:border-coral focus:bg-white"
          />
          <button
            type="button"
            className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ef6a49]"
          >
            Send
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChatBox;
