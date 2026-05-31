import { useCallback, useState } from "react";
import { MdClose } from "react-icons/md";
import { conversationApi } from "../../services/api";

const GroupMembers = ({ group, currentUserId, token, onMemberRemoved, isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const adminId = String(group?.admin?._id || group?.admin?.id || group?.admin || "");

  const isAdmin = adminId === String(currentUserId);

  const handleRemoveMember = useCallback(
    async (memberId) => {
      if (!isAdmin) {
        setError("Only group admin can remove members");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        await conversationApi.removeGroupMember(token, {
          groupId: group.id,
          userId: memberId,
        });

        if (onMemberRemoved) {
          onMemberRemoved(memberId);
        }
      } catch (err) {
        const errorMsg = err?.response?.data?.message || err?.message || "Failed to remove member";
        setError(errorMsg);
        console.error("Remove member error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [group?.id, token, isAdmin, onMemberRemoved]
  );

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Group Members</h2>
          <p className="mt-2 text-sm text-slate-500">
            {group.participants?.length || 0} member{(group.participants?.length || 0) !== 1 ? "s" : ""}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Members List */}
        <div className="mb-6 space-y-2">
          {group.participants?.map((member) => {
            const isCurrentUser = member.id === currentUserId || member._id === currentUserId;
            const memberId = String(member.id || member._id || "");
            const isGroupAdmin = memberId === adminId;

            return (
                <div key={member.id || member._id} className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral/15 font-semibold text-coral">
                    {member.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {member.name}
                      {isCurrentUser && " (You)"}
                      {isGroupAdmin && " (Admin)"}
                    </p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                </div>

                {/* Remove Button */}
                {isAdmin && !isCurrentUser && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id || member._id)}
                    disabled={isLoading}
                    className="ml-2 rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    title="Remove member"
                  >
                    <MdClose className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default GroupMembers;
