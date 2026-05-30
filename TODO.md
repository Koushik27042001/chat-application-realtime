# TODO List

## Completed Features

### Group Chat Feature (✅ COMPLETED)
- [x] Add group fields to Conversation model (isGroup, groupName, groupDescription, groupAdmin, groupImage)
- [x] Add group operations to Conversation repository
- [x] Add group services (createGroup, getGroupDetails, addGroupMember, removeGroupMember, updateGroupInfo)
- [x] Add group controller endpoints
- [x] Add group routes (/group/create, /group/:groupId, /group/add-member, /group/remove-member)
- [x] Create GroupCreationModal component for creating new groups
- [x] Create GroupMembers component for managing group members
- [x] Add "Create Group" button to Chat page sidebar
- [x] Update Sidebar component with group support
- [x] Update ChatHeader to display group info and member count
- [x] Update API client with group endpoints
- [x] Update Chat page to handle group conversations
- [x] Add group member removal functionality

## Features Still To Do

- [ ] Add/adjust mobile-specific CSS for the Chat layout (chat-root, main, topbar, messages-area, message input spacing).
- [ ] Ensure the sidebar overlay + main panel sizing works well under small viewport widths.
- [ ] Reduce paddings/font sizes on small screens where needed to prevent overflow.
- [ ] Run frontend build/dev lint/tests (npm) to ensure changes compile.
- [ ] Verify key flows on mobile breakpoints (open chat, send message, emoji picker, toggle sidebar, notifications).
- [ ] Group chat message history and persistence
- [ ] Group avatar/image upload
- [ ] Delete group functionality
- [ ] Leave group functionality
- [ ] WebRTC support for group video calls
- [ ] Group notifications
- [ ] Group message read receipts


