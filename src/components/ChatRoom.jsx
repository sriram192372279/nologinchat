import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  subscribeToMessages,
  sendMessage,
  subscribeToMembers,
  leaveRoom,
  updatePresence
} from '../services/chatService';
import { playSendSound, playReceiveSound } from '../utils/soundEffects';
import MembersModal from './MembersModal';
import WallpaperSelector from './WallpaperSelector';
import { CHAT_THEMES } from '../constants/chatThemes';
import {
  ArrowDown,
  Copy,
  Check,
  Share2,
  LogOut,
  Users,
  Send,
  Loader2,
  Volume2,
  VolumeX,
  CheckCheck,
  Smile,
  Crown
} from 'lucide-react';

const EMOJI_BAR = ['👋', '❤️', '🔥', '😂', '🎉', '👍', '🚀', '✨'];

// High-contrast, vibrant participant palette
const USER_PALETTE = [
  { text: 'text-indigo-600 dark:text-indigo-400', avatar: 'from-indigo-600 to-purple-600' },
  { text: 'text-emerald-600 dark:text-emerald-400', avatar: 'from-emerald-500 to-teal-600' },
  { text: 'text-rose-600 dark:text-rose-400', avatar: 'from-rose-500 to-pink-600' },
  { text: 'text-amber-600 dark:text-amber-400', avatar: 'from-amber-500 to-orange-600' },
  { text: 'text-cyan-600 dark:text-cyan-400', avatar: 'from-cyan-500 to-blue-600' },
  { text: 'text-fuchsia-600 dark:text-fuchsia-400', avatar: 'from-fuchsia-600 to-purple-600' },
];

function getUserColorStyle(username = '') {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_PALETTE[Math.abs(hash) % USER_PALETTE.length];
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    date = new Date();
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateHeader(timestamp) {
  if (!timestamp) return 'Today';
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    date = new Date();
  }

  const now = new Date();
  if (date.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ChatRoom({ room, onLeave }) {
  const { currentUser, username } = useAuth();
  const { addToast } = useToast();

  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('quickchat_sound') !== 'false';
  });
  const [wallpaperTheme, setWallpaperTheme] = useState(() => {
    return localStorage.getItem('quickchat_chat_wallpaper') || 'default';
  });

  const lastSentTimeRef = useRef(0);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const prevMsgCountRef = useRef(0);

  const roomCode = room?.roomCode || room?.id;
  const activeTheme = CHAT_THEMES.find(t => t.id === wallpaperTheme) || CHAT_THEMES[0];

  const handleSelectTheme = (themeId) => {
    setWallpaperTheme(themeId);
    try {
      localStorage.setItem('quickchat_chat_wallpaper', themeId);
    } catch (e) {
      console.warn('Storage error:', e);
    }
    const found = CHAT_THEMES.find(t => t.id === themeId);
    addToast(`Theme applied: ${found?.name || 'Default'}`, 'info', 1500);
  };

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('quickchat_sound', String(next));
      return next;
    });
  };

  useEffect(() => {
    if (!roomCode) return;

    const unsubMessages = subscribeToMessages(
      roomCode,
      (newMsgs) => {
        if (newMsgs.length > prevMsgCountRef.current && prevMsgCountRef.current > 0) {
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg && lastMsg.senderId !== currentUser?.uid && soundEnabled) {
            playReceiveSound();
          }
        }
        prevMsgCountRef.current = newMsgs.length;
        setMessages(newMsgs);
      },
      (err) => {
        addToast(`Network: ${err.message}`, 'error');
      }
    );

    const unsubMembers = subscribeToMembers(
      roomCode,
      (newMembers) => {
        setMembers(newMembers);
      },
      (err) => {
        console.warn('Members subscribe issue:', err);
      }
    );

    if (currentUser) {
      updatePresence({ roomCode, userId: currentUser.uid, username });
    }

    const heartbeat = setInterval(() => {
      if (currentUser && roomCode) {
        updatePresence({ roomCode, userId: currentUser.uid, username });
      }
    }, 45000);

    return () => {
      unsubMessages();
      unsubMembers();
      clearInterval(heartbeat);
    };
  }, [roomCode, currentUser, username, addToast, soundEnabled]);

  useEffect(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isFar = scrollHeight - scrollTop - clientHeight > 200;
    setShowScrollBottom(isFar);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      addToast(`Room PIN #${roomCode} copied!`, 'success');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      addToast('Failed to copy', 'error');
    }
  };

  const handleShareInvite = async () => {
    const inviteUrl = `${window.location.origin}/?room=${roomCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QuickChat — Room #${roomCode}`,
          text: `Join my private room #${roomCode} on QuickChat:`,
          url: inviteUrl
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') console.warn('Share API:', err);
      }
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      addToast('Invite link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      addToast('Failed to copy invite link', 'error');
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : inputText).trim();
    if (!text || sending) return;

    const now = Date.now();
    if (now - lastSentTimeRef.current < 350) return;

    setSending(true);
    try {
      await sendMessage({
        roomCode,
        user: currentUser,
        username,
        messageText: text
      });
      if (soundEnabled) {
        playSendSound();
      }
      setInputText('');
      lastSentTimeRef.current = Date.now();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      setTimeout(scrollToBottom, 40);
    } catch (err) {
      addToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLeaveRoom = async () => {
    if (currentUser && roomCode) {
      await leaveRoom({ roomCode, userId: currentUser.uid });
    }
    localStorage.removeItem('quickchat_active_room');
    onLeave();
  };

  const handleQuickEmoji = (emoji) => {
    setInputText(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full px-2 sm:px-4 py-2 sm:py-3 relative z-10">
      {/* ── Top Bar ───────────────────────────────────── */}
      <div className="glass-panel rounded-2xl px-4 py-3 shadow-md mb-2.5 flex items-center justify-between gap-3 animate-fade-up">
        {/* Left: Room Badge & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 text-white flex items-center justify-center font-mono font-extrabold text-base shadow-glow-indigo shrink-0">
            #
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {room?.name || `Room #${roomCode}`}
              </span>
              {room?.createdBy === currentUser?.uid && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <Crown className="w-3 h-3 text-amber-500" /> Host
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <button
                onClick={handleCopyCode}
                title="Click to copy 4-digit PIN"
                className="group inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30 transition-all border border-indigo-500/30 cursor-pointer"
              >
                <span>#{roomCode}</span>
                {copiedCode ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-indigo-500 group-hover:scale-110 transition-transform" />
                )}
              </button>
              <span className="text-xs text-slate-400 hidden sm:inline">&bull;</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-medium">Click PIN to copy</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Wallpaper Selector */}
          <WallpaperSelector
            currentTheme={wallpaperTheme}
            onSelectTheme={handleSelectTheme}
          />

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Members Button */}
          <button
            onClick={() => setIsMembersModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Users className="w-3.5 h-3.5" />
            <span>{members.length || 1}</span>
            <span className="hidden sm:inline">online</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShareInvite}
            title="Share room invitation"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-indigo-500" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Invite'}</span>
          </button>

          {/* Leave Button */}
          <button
            onClick={handleLeaveRoom}
            title="Exit room"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* ── Messages Stream ───────────────────────────── */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto px-3 sm:px-5 py-4 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-lg relative flex flex-col space-y-3 transition-colors duration-200 ${activeTheme.wrapperClass}`}
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto animate-scale-up">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1px] shadow-glow-indigo mb-4">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[23px] flex items-center justify-center font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-xl">
                #{roomCode}
              </div>
            </div>
            <h3 className={`font-display font-extrabold text-lg ${activeTheme.isDarkTheme ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              Room #{roomCode} is live &amp; ready!
            </h3>
            <p className={`text-xs sm:text-sm mt-1 max-w-sm leading-relaxed ${activeTheme.isDarkTheme ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
              Share the 4-digit PIN <span className="font-mono font-bold text-indigo-400">#{roomCode}</span> with your colleagues or friends to begin.
            </p>

            <button
              onClick={() => handleSendMessage('👋 Hello everyone!')}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold hover:bg-indigo-500/30 transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <span>Say Hello</span>
              <span>👋</span>
            </button>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUser?.uid;
            const prevMsg = messages[index - 1];
            const isSameSender = prevMsg && prevMsg.senderId === msg.senderId;
            const userStyle = getUserColorStyle(msg.username || 'User');
            const showDateHeader = !prevMsg || formatDateHeader(prevMsg.createdAt) !== formatDateHeader(msg.createdAt);

            return (
              <div key={msg.id || index} className="w-full">
                {showDateHeader && (
                  <div className="flex items-center justify-center my-3 select-none">
                    <span className={`px-3.5 py-1 rounded-full backdrop-blur-md text-[11px] font-mono font-bold shadow-sm border ${
                      activeTheme.isDarkTheme
                        ? 'bg-slate-900/90 text-slate-200 border-white/15'
                        : 'bg-slate-200/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-300/60 dark:border-white/10'
                    }`}>
                      {formatDateHeader(msg.createdAt)}
                    </span>
                  </div>
                )}

                <div
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isSameSender ? 'mt-1' : 'mt-3'}`}
                >
                  {/* Sender Name with Personalized Color Tag */}
                  {!isSameSender && !isMe && (
                    <div className="flex items-center gap-1.5 ml-9 mb-1 text-xs">
                      <span className={`font-bold ${userStyle.text}`}>
                        {msg.username || 'Anonymous'}
                      </span>
                      {msg.senderId === room?.createdBy && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5 text-amber-500" /> Host
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Bubble Row with Avatar */}
                  <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Unique Colored Avatar for incoming messages */}
                    {!isMe && !isSameSender && (
                      <div
                        className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${userStyle.avatar} text-white font-extrabold text-xs flex items-center justify-center shrink-0 mb-1 shadow-sm select-none`}
                      >
                        {msg.username ? msg.username.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    {!isMe && isSameSender && <div className="w-7 shrink-0" />}

                    {/* Chat Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-xs sm:text-[14px] leading-relaxed break-words whitespace-pre-wrap select-text shadow-sm ${
                        isMe
                          ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white rounded-br-xs font-medium shadow-indigo-600/20'
                          : `${activeTheme.bubbleOther} rounded-bl-xs border font-medium`
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>

                  {/* Timestamp & Read ticks */}
                  <div className={`flex items-center gap-1 text-[11px] font-mono mt-1 px-1 ${
                    activeTheme.isDarkTheme ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
                  } ${isMe ? 'mr-1' : 'ml-10'}`}>
                    <span>{formatTimestamp(msg.createdAt)}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating jump to bottom pill */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="self-center -mt-10 mb-2 z-20 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xl flex items-center gap-2 hover:scale-105 transition-all transform active:scale-95 cursor-pointer"
        >
          <ArrowDown className="w-3.5 h-3.5 text-indigo-500" />
          <span>New messages</span>
        </button>
      )}

      {/* Quick Reaction Bar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
          <Smile className="w-3.5 h-3.5 text-indigo-500" /> Quick
        </span>
        {EMOJI_BAR.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleQuickEmoji(emoji)}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-base flex items-center justify-center transition-all hover:scale-125 active:scale-95 border border-slate-200 dark:border-white/10 cursor-pointer shrink-0"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* ── Input Command Dock ─────────────────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="glass-panel rounded-2xl p-2 shadow-lg flex items-end gap-2 transition-all focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10"
      >
        <div className="flex-1 relative flex items-center">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            maxLength={1000}
            placeholder={`Message #${roomCode}...`}
            className="w-full resize-none max-h-28 py-2 px-3 text-xs sm:text-[14px] bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none leading-relaxed font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all active:scale-95 shadow-md shadow-indigo-600/25 cursor-pointer"
          aria-label="Send message"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>

      {/* Input keyboard hints */}
      <div className="flex items-center justify-between px-3 pt-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">
        <span>↵ Return to send &bull; Shift + ↵ for newline</span>
        {inputText.length > 500 && (
          <span>{inputText.length}/1000</span>
        )}
      </div>

      {/* Members Modal */}
      <MembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={members}
        creatorId={room?.createdBy}
        currentUserId={currentUser?.uid}
      />
    </div>
  );
}
