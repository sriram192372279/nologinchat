import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ChatRoom from './components/ChatRoom';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { createRoom, joinRoom } from './services/chatService';
import { Loader2, Radio, Sparkles } from 'lucide-react';

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
    addToast(`Room #${newRoom.roomCode} initialized!`, 'success');
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
    addToast(`Connected to Room #${joined.roomCode}`, 'success');
  };

  const handleLeaveRoom = useCallback(() => {
    setActiveRoom(null);
    localStorage.removeItem('quickchat_active_room');
    window.history.replaceState({}, '', window.location.pathname);
    addToast('Disconnected from room', 'info');
  }, [addToast]);

  // Loading state with luxury glowing spinner
  if (authLoading || restoringSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-mesh-light dark:bg-mesh-dark bg-grid-ambient text-slate-900 dark:text-slate-100 relative overflow-hidden">
        {/* Ambient glow in background */}
        <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-600/30 via-purple-600/30 to-cyan-500/30 blur-3xl animate-pulse-glow pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center shadow-glow-indigo animate-scale-up">
              <Sparkles className="w-7 h-7 text-white animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </span>
          </div>

          <div className="text-center">
            <h2 className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              QuickChat
            </h2>
            <p className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 justify-center">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              <span>Initializing secure edge session...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-mesh-light dark:bg-mesh-dark bg-grid-ambient text-slate-900 dark:text-slate-100 transition-colors duration-200 relative selection:bg-indigo-600 selection:text-white">
      {/* Dynamic ambient background glow circles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-indigo-500/[0.12] dark:bg-indigo-600/[0.14] rounded-full blur-[130px] animate-aurora" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-purple-500/[0.1] dark:bg-purple-600/[0.13] rounded-full blur-[120px] animate-aurora" style={{ animationDelay: '3s' }} />
        <div className="absolute -bottom-32 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.08] dark:bg-cyan-500/[0.1] rounded-full blur-[140px] animate-aurora" style={{ animationDelay: '6s' }} />
      </div>

      {/* Luxury Navigation Header */}
      <Navbar onLeaveRoom={handleLeaveRoom} inRoom={!!activeRoom} />

      {/* Main Content Viewport */}
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

      {/* World-Class SaaS Footer (only shown on home screen, not inside active chat) */}
      {!activeRoom && (
        <footer className="w-full relative z-10 py-6 border-t border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-slate-700 dark:text-slate-300">Firestore Mesh Engine:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Operational</span>
            </div>

            <div className="flex items-center gap-6">
              <span className="font-mono">P2P Ephemeral Protocol</span>
              <span>&bull;</span>
              <span className="font-mono">4-Digit PIN Rooms</span>
              <span>&bull;</span>
              <span>&copy; {new Date().getFullYear()} QuickChat Inc.</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
