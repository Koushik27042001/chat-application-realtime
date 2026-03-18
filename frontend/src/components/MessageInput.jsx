import { useEffect, useState } from "react";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();

    if (!trimmed) {
      return;
    }

    onSend(trimmed);
    setText("");
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        handleSend();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [text]);

  return (
    <div className="border-t border-slate-200 bg-white p-3">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-slate-200 p-3 outline-none transition focus:border-blue-500"
        />

        <button
          onClick={handleSend}
          className="rounded-xl bg-blue-500 px-5 text-white transition hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
