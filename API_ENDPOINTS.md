# API Endpoints Documentation & Verification

## Backend Base URL
`http://localhost:5000/api` (or `${VITE_API_URL}/api`)

---

## ✅ AUTH ENDPOINTS
- **POST** `/auth/register` - Register new user
- **POST** `/auth/login` - Login user
- **POST** `/auth/google` - Google OAuth login
- **POST** `/auth/admin-login` - Admin login
- **POST** `/auth/refresh` - Refresh access token
- **POST** `/auth/logout` - Logout user
- **GET** `/auth/me` - Get current user info
- **POST** `/auth/forgot-password` - Request password reset
- **POST** `/auth/reset-password/:token` - Reset password with token
- **POST** `/auth/send-otp` - Send OTP for verification
- **POST** `/auth/verify-otp` - Verify OTP

---

## ✅ CONVERSATION ENDPOINTS (NEW GROUP SUPPORT)

### Regular Conversations
- **GET** `/conversations` - List all user conversations (includes groups)
- **GET** `/conversations/with/:userId` - Get conversation with specific user

### Group Operations
- **POST** `/conversations/group/create` - Create new group
  ```json
  {
    "groupName": "Project Team",
    "groupDescription": "Team for project X",
    "participantIds": ["userId1", "userId2", "userId3"]
  }
  ```

- **GET** `/conversations/group/:groupId` - Get group details with members
  
- **POST** `/conversations/group/add-member` - Add member to group (admin only)
  ```json
  {
    "groupId": "groupId",
    "userId": "newMemberId"
  }
  ```

- **POST** `/conversations/group/remove-member` - Remove member from group (admin or self)
  ```json
  {
    "groupId": "groupId",
    "userId": "memberId"
  }
  ```

- **PATCH** `/conversations/group/:groupId` - Update group info (admin only)
  ```json
  {
    "groupName": "New Name",
    "groupDescription": "New Description",
    "groupImage": "imageUrl"
  }
  ```

---

## ✅ MESSAGE ENDPOINTS
- **GET** `/messages` - Get messages for conversation
  - Query params: `conversationId`, `page`, `limit`
- **PATCH** `/messages/read` - Mark messages as read
- **POST** `/messages` - Send message

---

## ✅ NOTIFICATION ENDPOINTS
- **GET** `/notifications` - Get notifications
  - Query params: `page`, `limit`
- **PATCH** `/notifications/:id/read` - Mark notification as read
- **PATCH** `/notifications/read-all` - Mark all as read

---

## ✅ UPLOAD ENDPOINTS
- **POST** `/uploads/image` - Upload image

---

## ✅ USER ENDPOINTS
- **GET** `/users` - List all users with search
  - Query params: `search`
- **GET** `/users/:userId` - Get specific user details
- **PATCH** `/users/me/avatar` - Update user avatar

---

## ✅ ADMIN ENDPOINTS
- **GET** `/admin/analytics` - Get admin analytics

---

## 🔐 AUTHENTICATION
All endpoints except auth routes require:
- **Header:** `Authorization: Bearer {accessToken}`
- **Credentials:** Cookie-based sessions

---

## ✅ FRONTEND API CLIENT CONFIGURATION

All endpoints are properly configured in `frontend/src/services/api.js`:

### conversationApi methods:
```javascript
conversationApi.list(token)                           // GET /conversations
conversationApi.withUser(token, userId)               // GET /conversations/with/:userId
conversationApi.createGroup(token, payload)           // POST /conversations/group/create
conversationApi.getGroupDetails(token, groupId)       // GET /conversations/group/:groupId
conversationApi.addGroupMember(token, payload)        // POST /conversations/group/add-member
conversationApi.removeGroupMember(token, payload)     // POST /conversations/group/remove-member
conversationApi.updateGroupInfo(token, groupId, data) // PATCH /conversations/group/:groupId
```

---

## ✅ VERIFICATION CHECKLIST

### Backend Routes
- [x] All conversation routes registered in `/api/conversations`
- [x] Group endpoints configured with auth middleware
- [x] Error handling middleware applied

### Frontend API Client
- [x] All conversation API methods exported
- [x] Auth token properly configured in headers
- [x] Error interceptor handles 401 responses
- [x] Response data extraction working

### Components Integration
- [x] GroupCreationModal uses `conversationApi.createGroup()`
- [x] GroupMembers uses `conversationApi.removeGroupMember()`
- [x] Chat page fetches conversations with group support
- [x] ChatHeader displays group info properly

### Security
- [x] All group endpoints protected with `protect` middleware
- [x] Admin-only operations validated server-side
- [x] User ID validation on all requests
- [x] ObjectId validation for group/user IDs

---

## 🧪 TESTING API ENDPOINTS

### Test Group Creation (POST)
```bash
curl -X POST http://localhost:5000/api/conversations/group/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupName": "Test Group",
    "groupDescription": "Testing group creation",
    "participantIds": ["userId1", "userId2"]
  }'
```

### Test Get Group Details (GET)
```bash
curl -X GET http://localhost:5000/api/conversations/group/groupId \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Add Member (POST)
```bash
curl -X POST http://localhost:5000/api/conversations/group/add-member \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "groupId",
    "userId": "newUserId"
  }'
```

### Test Remove Member (POST)
```bash
curl -X POST http://localhost:5000/api/conversations/group/remove-member \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "groupId",
    "userId": "userId"
  }'
```

### Test Update Group Info (PATCH)
```bash
curl -X PATCH http://localhost:5000/api/conversations/group/groupId \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupName": "Updated Name",
    "groupDescription": "Updated description"
  }'
```

---

## ✅ STATUS: ALL ENDPOINTS CONFIGURED AND WORKING

**Last Updated:** May 30, 2026
**React Icons:** ✅ Installed (v5.0.1)
**Components Optimized:** ✅ Yes
