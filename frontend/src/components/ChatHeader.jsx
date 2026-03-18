const ChatHeader = ({ activeContact, isConnected }) => {
  if (!activeContact) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-coral/15 font-semibold text-coral">
          {activeContact.name.slice(0, 1)}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{activeContact.name}</h2>
          <p className="text-sm text-slate-500">{activeContact.role}</p>
        </div>
      </div>

      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        {isConnected ? "Socket Live" : "Mock Mode"}
      </div>
    </div>
  );
};

export default ChatHeader;
