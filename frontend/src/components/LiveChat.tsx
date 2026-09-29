import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  DollarSign,
  ChevronDown,
  Smile,
  ShieldAlert,
  Radio,
  X,
  Heart,
} from 'lucide-react';
import { LiveChatMessage, UserAccount } from '../types';
import { SIMULATED_CHAT_BOTS } from '../data/seedVideos';

interface LiveChatProps {
  videoId: string;
  initialMessages: LiveChatMessage[];
  currentUser: UserAccount;
  isLive: boolean;
  darkMode: boolean;
}

export const LiveChat: React.FC<LiveChatProps> = ({
  videoId,
  initialMessages,
  currentUser,
  isLive,
  darkMode,
}) => {
  const [messages, setMessages] = useState<LiveChatMessage[]>(initialMessages || []);
  const [inputText, setInputText] = useState('');
  const [isSuperChatModalOpen, setIsSuperChatModalOpen] = useState(false);
  const [superChatAmount, setSuperChatAmount] = useState('5.00');
  const [superChatMessage, setSuperChatMessage] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sync initial messages when video changes
  useEffect(() => {
    setMessages(initialMessages || []);
  }, [videoId, initialMessages]);

  // Scroll to bottom when new messages arrive if autoScroll is enabled
  useEffect(() => {
    if (autoScroll && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  // Simulate audience chatter in live streams
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Pick random bot and text
      const bot = SIMULATED_CHAT_BOTS[Math.floor(Math.random() * SIMULATED_CHAT_BOTS.length)];
      const text = bot.texts[Math.floor(Math.random() * bot.texts.length)];

      const newMsg: LiveChatMessage = {
        id: `sim-${Date.now()}-${Math.random()}`,
        user: {
          id: `bot-${bot.name}`,
          name: bot.name,
          avatarUrl: bot.avatar,
        },
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev.slice(-80), newMsg]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: LiveChatMessage = {
      id: `user-${Date.now()}`,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
        badge: 'YOU',
      },
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setAutoScroll(true);
  };

  const handleSendSuperChat = () => {
    if (!superChatMessage.trim()) return;

    const colors: Record<string, string> = {
      '2.00': '#1e88e5',
      '5.00': '#00897b',
      '10.00': '#f57c00',
      '20.00': '#e53935',
      '50.00': '#8e24aa',
    };

    const scMsg: LiveChatMessage = {
      id: `sc-${Date.now()}`,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
        badge: 'SUPPORTER',
      },
      text: superChatMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSuperChat: true,
      superChatAmount: `$${superChatAmount}`,
      superChatColor: colors[superChatAmount] || '#e53935',
    };

    setMessages((prev) => [...prev, scMsg]);
    setIsSuperChatModalOpen(false);
    setSuperChatMessage('');
    setAutoScroll(true);
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 60;
    setAutoScroll(isNearBottom);
  };

  if (isCollapsed) {
    return (
      <div
        className={`w-full rounded-2xl border p-3 flex items-center justify-between shadow-sm cursor-pointer transition-colors ${
          darkMode ? 'bg-[#181818] border-neutral-800 hover:bg-[#202020]' : 'bg-white border-slate-200 hover:bg-slate-50'
        }`}
        onClick={() => setIsCollapsed(false)}
      >
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="text-xs font-bold">Show Live Chat</span>
          <span className="text-[11px] text-neutral-400">({messages.length} messages)</span>
        </div>
        <ChevronDown className="w-4 h-4 text-neutral-400" />
      </div>
    );
  }

  return (
    <div
      id="live-chat-panel"
      className={`w-full flex flex-col h-[520px] rounded-2xl border shadow-md overflow-hidden relative ${
        darkMode ? 'bg-[#181818] border-neutral-800 text-neutral-200' : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Header */}
      <div
        className={`px-4 py-3 flex items-center justify-between border-b ${
          darkMode ? 'border-neutral-800 bg-[#1f1f1f]' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-red-500 animate-pulse" />
          <h3 className="font-bold text-xs uppercase tracking-wider">Top Chat</h3>
          <span className="text-[10px] px-1.5 py-0.2 bg-red-600/20 text-red-400 font-semibold rounded-full">
            LIVE
          </span>
        </div>

        <button
          onClick={() => setIsCollapsed(true)}
          className="text-xs text-neutral-400 hover:text-neutral-200 p-1 rounded-md"
          title="Hide chat"
        >
          Hide
        </button>
      </div>

      {/* Messages Feed */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs select-text"
      >
        {messages.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 text-xs">
            Welcome to live chat! Remember to guard your privacy and abide by community guidelines.
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.isSuperChat) {
              return (
                <div
                  key={msg.id}
                  className="rounded-xl overflow-hidden shadow-md text-white animate-in fade-in"
                  style={{ backgroundColor: msg.superChatColor || '#e53935' }}
                >
                  <div className="px-3 py-2 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-2">
                      <img
                        src={msg.user.avatarUrl}
                        alt={msg.user.name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-white/40"
                      />
                      <span className="font-bold text-xs">{msg.user.name}</span>
                    </div>
                    <span className="font-extrabold text-sm">{msg.superChatAmount}</span>
                  </div>
                  <div className="px-3 py-2 font-medium text-xs text-white/95">
                    {msg.text}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex items-start gap-2 group/msg hover:bg-white/5 p-1 rounded-lg transition-colors">
                <img
                  src={msg.user.avatarUrl}
                  alt={msg.user.name}
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5"
                />
                <div className="min-w-0 flex-1 leading-relaxed">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-neutral-400 text-[11px]">
                      {msg.timestamp}
                    </span>
                    <span
                      className={`font-bold text-xs ${
                        msg.user.isOwner
                          ? 'text-amber-400'
                          : msg.user.isMod
                          ? 'text-blue-400'
                          : darkMode
                          ? 'text-neutral-300'
                          : 'text-slate-800'
                      }`}
                    >
                      {msg.user.name}
                    </span>

                    {msg.user.badge && (
                      <span className="text-[9px] font-bold px-1 rounded uppercase tracking-wider bg-neutral-700 text-white">
                        {msg.user.badge}
                      </span>
                    )}
                  </div>
                  <p className={`break-words text-xs ${darkMode ? 'text-neutral-200' : 'text-slate-900'}`}>
                    {msg.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Auto-scroll catch-up pill */}
      {!autoScroll && (
        <button
          onClick={() => {
            setAutoScroll(true);
            if (chatContainerRef.current) {
              chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
          }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-semibold shadow-lg flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          <span>New messages below</span>
        </button>
      )}

      {/* Input Bar */}
      <div
        className={`p-2.5 border-t ${
          darkMode ? 'border-neutral-800 bg-[#1c1c1c]' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          {/* Super Chat Trigger */}
          <button
            type="button"
            onClick={() => setIsSuperChatModalOpen(true)}
            className="p-1.5 rounded-full bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 transition-colors flex-shrink-0 cursor-pointer"
            title="Send Super Chat donation"
          >
            <DollarSign className="w-4 h-4" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Chat publicly..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className={`w-full text-xs px-3 py-2 rounded-full border focus:outline-none focus:border-blue-500 transition-colors ${
                darkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`p-2 rounded-full transition-all ${
              inputText.trim()
                ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Super Chat Modal Simulator */}
      {isSuperChatModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-2xl p-4 shadow-2xl border ${
              darkMode ? 'bg-[#242424] border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-700/50">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Send a Super Chat</span>
              </div>
              <button
                onClick={() => setIsSuperChatModalOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-400">Select Amount</label>
                <div className="grid grid-cols-5 gap-1.5 mt-1.5">
                  {['2.00', '5.00', '10.00', '20.00', '50.00'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSuperChatAmount(amt)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        superChatAmount === amt
                          ? 'bg-amber-500 text-white border-amber-500 scale-105 shadow-md'
                          : 'border-neutral-700 hover:bg-neutral-700/50'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400">Highlighted Message</label>
                <textarea
                  rows={2}
                  placeholder="Support the stream with a highlighted message..."
                  value={superChatMessage}
                  onChange={(e) => setSuperChatMessage(e.target.value)}
                  className={`w-full mt-1.5 p-2 text-xs rounded-xl border focus:outline-none focus:border-amber-500 ${
                    darkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <button
                onClick={handleSendSuperChat}
                disabled={!superChatMessage.trim()}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                  superChatMessage.trim()
                    ? 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow-md'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                Buy and Send (${superChatAmount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
