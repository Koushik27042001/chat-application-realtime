export default function MessageBubble({ message, own }) {
  return (
    <div className={`flex ${own ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs rounded-2xl px-4 py-2 shadow-sm ${
          own ? "bg-blue-500 text-white" : "bg-gray-300 text-slate-800"
        }`}
      >
        <p>{message.text}</p>
        <p className={`mt-1 text-[11px] ${own ? "text-blue-100" : "text-slate-500"}`}>
          {message.time}
        </p>
      </div>
    </div>
  );
}
