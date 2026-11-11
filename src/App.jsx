import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ChatRoom from './components/ChatRoom';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { createRoom, joinRoom } from './services/chatService';
import { Loader2, Sparkles } from 'lucide-react';

export default function App() {
  const { currentUser, username, authLoading, loginAsGuest } = useAuth();
  const { addToast } = useToast();

  const [activeRoom, setActiveRoom] = useState(null);
  const [restoringSession, setRestoringSession] = useState(true);
  const [inviteCode, setInviteCode] = useState('');

  // Extract ?room=CODE from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('room');
    if (codeParam) {
      setInviteCode(codeParam.replace(/\D/g, '').slice(0, 4));
    }
  }, []);

  // Restore previous session on reload or initial visit
  useEffect(() => {
    if (authLoading) return;

    const restorePreviousRoom = async () => {
      const storedRoom = localStorage.getItem('quickchat_active_room');
      if (!storedRoom) {
        setRestoringSession(false);
        return;
      }

      try {
        let parsedRoom;
        try {
          parsedRoom = JSON.parse(storedRoom);
        } catch {
          parsedRoom = { roomCode: storedRoom };
        }

        const roomCode = parsedRoom.roomCode || parsedRoom.id;
        if (!roomCode) {
          localStorage.removeItem('quickchat_active_room');
          setRestoringSession(false);
          return;
        }

        let user = currentUser;
        if (!user) {
          const storedUsername = localStorage.getItem('quickchat_username') || 'Guest';
          user = await loginAsGuest(storedUsername);
        }

        const roomData = await joinRoom({
          roomCode,
          user,
          username: user.displayName || username || 'Guest'
        });

        setActiveRoom(roomData);
        localStorage.setItem('quickchat_active_room', JSON.stringify(roomData));
      } catch (err) {
        console.warn('Could not restore previous room:', err.message);
        localStorage.removeItem('quickchat_active_room');
        addToast('Previous room is no longer active', 'info');
      } finally {
        setRestoringSession(false);
      }
    };

    restorePreviousRoom();
  }, [authLoading, currentUser, username, loginAsGuest, addToast]);

  const handleCreateRoom = async (customName) => {
    let user = currentUser;
    if (!user) {
      user = await loginAsGuest(username || 'Guest');
    }

    const newRoom = await createRoom({
      user,
      username,
      customName
    });

    setActiveRoom(newRoom);
    localStorage.setItem('quickchat_active_room', JSON.stringify(newRoom));
    window.history.replaceState({}, '', `/?room=${newRoom.roomCode}`);
    addToast(`Room #${newRoom.roomCode} created!`, 'success');
  };

  const handleJoinRoom = async (roomCode) => {
    let user = currentUser;
    if (!user) {
      user = await loginAsGuest(username || 'Guest');
    }

    const joined = await joinRoom({
      roomCode,
      user,
      username
    });

    setActiveRoom(joined);
    localStorage.setItem('quickchat_active_room', JSON.stringify(joined));
    window.history.replaceState({}, '', `/?room=${joined.roomCode}`);
    addToast(`Connected to #${joined.roomCode}`, 'success');
  };

  const handleLeaveRoom = useCallback(() => {
    setActiveRoom(null);
    localStorage.removeItem('quickchat_active_room');
    window.history.replaceState({}, '', window.location.pathname);
    addToast('Left room', 'info');
  }, [addToast]);

  // Loading state
  if (authLoading || restoringSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-mesh-dark bg-grid-ambient text-slate-100 relative overflow-hidden">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
          <span className="text-xs font-mono text-slate-400">connecting...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-mesh-dark bg-grid-ambient text-slate-100 relative selection:bg-indigo-600 selection:text-white">
      {/* Header */}
      <Navbar onLeaveRoom={handleLeaveRoom} inRoom={!!activeRoom} />

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col relative z-10">
        {activeRoom ? (
          <ChatRoom room={activeRoom} onLeave={handleLeaveRoom} />
        ) : (
          <Home
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            inviteCode={inviteCode}
          />
        )}
      </main>
    </div>
  );
}
