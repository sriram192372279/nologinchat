# QuickChat – Simple Real-Time Chat Website

> **Connect. Chat. Share.**

A fast, lightweight, and modern real-time chat application built with **React + Vite**, **Tailwind CSS**, and **Firebase (Firestore & Authentication)**. QuickChat allows anyone to instantly create private rooms, share 6-character room codes, and chat in real time with zero unnecessary friction.

---

## ✨ Features

- **⚡ Instant Real-Time Messaging**: Built on Firebase Firestore real-time snapshot listeners (`onSnapshot`) for instant delivery without polling or external websocket servers.
- **🔑 Clean Room Management**:
  - **Create Room**: Generates an unambiguous, unique 6-character room code (e.g. `QC7A9K`).
  - **Join Room**: Simple code-entry modal with validation, error states, and automatic uppercase formatting.
  - **One-Click Share & Copy**: Web Share API integration with automatic fallback to clipboard copy (`?room=CODE` invite links).
- **🔒 Flexible Authentication**:
  - **Continue with Google**: One-click Google Popup authentication.
  - **Continue as Guest**: Fast Anonymous authentication with customizable display names.
  - No forced sign-up wall—users can jump straight into creating or joining rooms.
- **🔄 Robust Session Persistence**:
  - Active rooms and username sessions automatically restore upon page refresh.
  - Stored via `localStorage` with Firebase Auth session continuity.
  - Leaving a room cleanly purges active state and returns to homepage.
- **👥 Active Member Tracking**:
  - Real-time online member count in the room header.
  - Members modal displaying all joined users, host badges, and presence indicators.
- **🎨 Modern UI / UX**:
  - Light and Dark mode toggle (persisted locally).
  - Modern chat bubbles with sender/receiver visual contrast.
  - Quick emoji reaction picker (`👋`, `👍`, `❤️`, `😂`, `🔥`, `🎉`).
  - Auto-scroll to latest message with a floating "New messages" jump button when scrolled up.
  - Non-intrusive floating toast notifications for user actions and connection states.
  - Empty message prevention and message length validation (max 1,000 characters).

---

## 🗄️ Firebase Database Architecture

### 1. `rooms`
Collection storing room metadata. Document IDs match the 6-character room code.
```typescript
rooms/{roomCode}
  roomCode: string        // "XK8P2L"
  name: string            // Room title (e.g. "Design Sync" or "Room #XK8P2L")
  createdBy: string       // User UID of the creator
  creatorName: string     // Display name of creator
  createdAt: timestamp    // Server timestamp
  isActive: boolean       // Room active state
```

### 2. `messages`
Real-time messages sent within rooms.
```typescript
messages/{messageId}
  roomId: string          // Associated roomCode
  senderId: string        // UID of sender
  username: string        // Sender's display name
  message: string         // Text content (1-1000 chars)
  createdAt: timestamp    // Server timestamp
```

### 3. `roomMembers`
Active room memberships and presence tracking. Document IDs are formatted as `{roomCode}_{userId}`.
```typescript
roomMembers/{roomCode_userId}
  roomId: string          // Associated roomCode
  userId: string          // User UID
  username: string        // User display name
  joinedAt: timestamp    // When user joined the room
  lastSeen: number        // Client epoch timestamp for heartbeat presence
```

---

## 🛡️ Firestore Security Rules

Production-ready Firestore rules are included in [`firestore.rules`](./firestore.rules):
- Only authenticated users (Google or Guest) can read rooms or register as members.
- Only registered room members can read and send messages to that room.
- User IDs are verified directly against `request.auth.uid`.

To deploy rules to Firebase:
```bash
firebase deploy --only firestore:rules
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm or pnpm

### 2. Setup Configuration
A `.env` file is already created for your linked Firebase project (`dialy-water`). If configuring a new environment, copy `.env.example`:
```bash
cp .env.example .env
```

Verify your `.env` variables:
```env
VITE_FIREBASE_API_KEY=AIzaSyBJRmDmun4FF4XtXmnlyZlBczrSJrQj4fQ
VITE_FIREBASE_AUTH_DOMAIN=dialy-water.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dialy-water
VITE_FIREBASE_STORAGE_BUCKET=dialy-water.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=990304703055
VITE_FIREBASE_APP_ID=1:990304703055:web:4d3f64b8607c8b247e503a
VITE_FIREBASE_MEASUREMENT_ID=G-0XK8QFW104
```

### 3. Enable Firebase Authentication Providers
In the [Firebase Console](https://console.firebase.google.com/project/dialy-water/authentication/providers):
1. Navigate to **Authentication** > **Sign-in method**.
2. Enable **Anonymous**.
3. Enable **Google** (choose your support email and save).
4. Under **Authorized domains**, make sure `localhost` is listed.

### 4. Enable Cloud Firestore
1. Navigate to **Firestore Database** in Firebase Console.
2. If not already initialized, click **Create database** (start in test mode or deploy [`firestore.rules`](./firestore.rules)).

### 5. Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 6. Build for Production
```bash
npm run build
```
The optimized assets will be emitted in `dist/`.

---

## 📁 Project Structure

```
quickchat/
├── src/
│   ├── assets/              # Static assets
│   ├── components/
│   │   ├── ChatRoom.jsx     # Main real-time chat interface & message thread
│   │   ├── CreateRoomModal.jsx # Room creation modal dialog
│   │   ├── Home.jsx         # Clean minimal homepage & quick actions
│   │   ├── JoinRoomModal.jsx# 6-character room code input modal
│   │   ├── MembersModal.jsx # Active room members list
│   │   ├── Navbar.jsx       # Header with branding, user info & theme toggle
│   │   └── UsernameModal.jsx# Guest username selection & profile editor
│   ├── context/
│   │   ├── AuthContext.jsx  # Google & Guest auth state, persistence & profile
│   │   ├── ThemeContext.jsx # Light / Dark mode management
│   │   └── ToastContext.jsx # Modern toast notification provider
│   ├── services/
│   │   └── chatService.js   # Firestore operations, room codes & listeners
│   ├── App.jsx              # Main application router & session restore logic
│   ├── firebase.js          # Firebase SDK initialization
│   ├── index.css            # Tailwind CSS directives & scrollbar styles
│   └── main.jsx             # React root entry point
├── firestore.rules          # Secure Firestore security rules
├── firebase.json            # Firebase Hosting configuration
├── .env                     # Local environment configuration
├── .env.example             # Template environment variables
├── package.json
└── vite.config.js
```
