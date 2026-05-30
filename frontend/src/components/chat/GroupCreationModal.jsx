import { useCallback, useRef, useState } from "react";
import { MdCheckCircle, MdClose } from "react-icons/md";
import { conversationApi } from "../../services/api";

const GroupCreationModal = ({ isOpen, onClose, contacts, token, onGroupCreated, currentUser }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef(null);

  // Filter contacts based on search term
  const filteredContacts = contacts.filter((contact) => {
    if (contact.isGroup) return false; // Don't show groups
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower)
    );
  });

  // Toggle member selection
  const toggleMember = (contactId) => {
    setSelectedMembers((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  // Handle group creation
  const handleCreateGroup = useCallback(async () => {
    // Validation
    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }

    if (selectedMembers.length === 0) {
      setError("Please select at least one member");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await conversationApi.createGroup(token, {
        groupName: groupName.trim(),
        groupDescription: groupDescription.trim(),
        participantIds: selectedMembers,
      });

      // Reset form
      setGroupName("");
      setGroupDescription("");
      setSelectedMembers([]);
      setSearchTerm("");

      // Close modal and notify parent
      onClose();
      if (onGroupCreated) {
        onGroupCreated(response);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to create group";
      setError(errorMsg);
      console.error("Group creation error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [groupName, groupDescription, selectedMembers, token, onClose, onGroupCreated]);

  // Handle click outside modal
  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Create New Group</h2>
          <p className="mt-2 text-sm text-slate-500">Start a group conversation with your contacts</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Group Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700">Group Name *</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g., Project Team, Friends..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
          />
        </div>

        {/* Group Description Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700">Description (Optional)</label>
          <textarea
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            placeholder="What's this group about?"
            rows="2"
            className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
          />
        </div>

        {/* Member Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700">
            Add Members ({selectedMembers.length} selected) *
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contacts by name or email..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
          />
        </div>

        {/* Member List */}
        <div className="mb-6 max-h-64 overflow-y-auto rounded-lg border border-slate-200">
          {filteredContacts.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              {contacts.length === 0 ? "No contacts available" : "No matching contacts found"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => toggleMember(contact.id)}
                  className={`w-full px-4 py-3 text-left transition ${
                    selectedMembers.includes(contact.id)
                      ? "bg-coral/10"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border-2 transition ${
                        selectedMembers.includes(contact.id)
                          ? "border-coral bg-coral"
                          : "border-slate-300"
                      }`}
                    >
                      {selectedMembers.includes(contact.id) && (
                        <MdCheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{contact.name}</p>
                      <p className="text-xs text-slate-500">{contact.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Members Summary */}
        {selectedMembers.length > 0 && (
          <div className="mb-6 rounded-lg bg-slate-50 p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">Selected Members:</p>
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map((memberId) => {
                const contact = contacts.find((c) => c.id === memberId);
                return (
                  <button
                    key={memberId}
                    type="button"
                    onClick={() => toggleMember(memberId)}
                    className="inline-flex items-center gap-2 rounded-full bg-coral/20 px-3 py-1 text-sm text-coral transition hover:bg-coral/30"
                  >
                    {contact?.name}
                    <MdClose className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateGroup}
            disabled={isLoading || !groupName.trim() || selectedMembers.length === 0}
            className="flex-1 rounded-lg bg-coral px-4 py-2 font-medium text-white transition hover:bg-coral/90 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupCreationModal;
