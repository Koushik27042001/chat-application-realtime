import { Link } from "react-router-dom";

const Sidebar = ({
  contacts,
  activeContactId,
  onSelectContact,
  currentUser,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <aside className="flex h-screen w-full flex-col border-r border-slate-200 bg-white lg:max-w-xs">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-2xl font-bold text-slate-800">Chats</h2>
        <p className="mt-1 text-sm text-slate-500">
          Signed in as {currentUser?.name || "Guest"}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Your user id: {currentUser?.id || "N/A"}
        </p>
        {currentUser?.role === "admin" ? (
          <Link
            to="/admin"
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Admin dashboard
          </Link>
        ) : null}
      </div>

      <div className="p-4">
        <input
          type="text"
          placeholder="Search users by name or id..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-coral"
        />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        {contacts.map((contact) => {
          const isActive = contact.id === activeContactId;

          return (
            <button
              key={contact.id}
              type="button"
              onClick={() => onSelectContact(contact)}
              className={`w-full rounded-2xl p-3 text-left transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral/15 font-semibold text-coral">
                  {contact.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{contact.name}</p>
                  <p className={`truncate text-sm ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                    {contact.lastMessage}
                  </p>
                  <p className={`truncate text-xs ${isActive ? "text-slate-400" : "text-slate-400"}`}>
                    ID: {contact.id}
                  </p>
                </div>
              </div>
            </button>
          );
        })}

        {!contacts.length ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
            No users match your search.
          </div>
        ) : null}
      </div>
    </aside>
  );
};

export default Sidebar;
