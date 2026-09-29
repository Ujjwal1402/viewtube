import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Menu,
  Search,
  Mic,
  Video as VideoIcon,
  Radio,
  Bell,
  X,
  Upload,
  Sun,
  Moon,
  CheckCircle2,
  Cast,
  ArrowLeft,
  Clock,
  TrendingUp,
  Volume2,
  Sparkles,
  User,
  Users,
  LogOut,
} from 'lucide-react';
import { UserAccount, Video } from '../types';
import { AudioReceiverModal } from './AudioReceiverModal';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
  videoId?: string;
}

interface NavbarProps {
  user: UserAccount;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query?: string) => void;
  onToggleSidebar: () => void;
  onOpenUpload: () => void;
  onOpenLiveStudio: () => void;
  onGoHome: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  hasLiveBroadcasting?: boolean;
  onOpenCastModal?: () => void;
  isCastConnected?: boolean;
  allVideos?: Video[];
  onSelectVideo?: (video: Video) => void;
  onOpenProfile?: () => void;
  onOpenAuth?: (tab?: 'signin' | 'signup') => void;
  onSignOut?: () => void;
  onSelectTab?: (tab: any) => void;
}

const POPULAR_SEARCHES = [
  'lofi hip hop radio',
  'SpaceX Starship Super Heavy',
  'Blender animation 4K',
  'Tears of Steel sci fi',
  'Big Buck Bunny 60fps',
  'Live streams',
  'Nature ocean drone 4k',
];

export const Navbar: React.FC<NavbarProps> = ({
  user,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onToggleSidebar,
  onOpenUpload,
  onOpenLiveStudio,
  onGoHome,
  darkMode,
  onToggleDarkMode,
  hasLiveBroadcasting = false,
  onOpenCastModal,
  isCastConnected = false,
  allVideos = [],
  onSelectVideo,
  onOpenProfile,
  onOpenAuth,
  onSignOut,
  onSelectTab,
}) => {
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Dynamic notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Space Orbit Live is now streaming',
      message: 'SpaceX Starship Super Heavy Test 7 official 4K broadcast is live.',
      timeAgo: '45m ago',
      isRead: false,
      videoId: 'vid-live-2',
    },
    {
      id: 'notif-2',
      title: 'Blender Studio loved your comment',
      message: 'Loved your review on "Big Buck Bunny - 4K 60FPS Remastered".',
      timeAgo: '2h ago',
      isRead: false,
      videoId: 'vid-1',
    },
    {
      id: 'notif-3',
      title: 'New upload from Lo-Fi Beats',
      message: 'lofi hip hop radio - beats to relax/study to [24/7 LIVE STREAM]',
      timeAgo: '5h ago',
      isRead: true,
      videoId: 'vid-live-1',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const createMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setCreateMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live search suggestions based on query and all available videos
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return POPULAR_SEARCHES.slice(0, 5).map((term) => ({
        text: term,
        type: 'popular' as const,
      }));
    }

    const matches: { text: string; type: 'video' | 'channel' | 'tag' }[] = [];
    const seen = new Set<string>();

    for (const v of allVideos) {
      if (v.title.toLowerCase().includes(q) && !seen.has(v.title)) {
        seen.add(v.title);
        matches.push({ text: v.title, type: 'video' });
      }
      if (v.channel.name.toLowerCase().includes(q) && !seen.has(v.channel.name)) {
        seen.add(v.channel.name);
        matches.push({ text: v.channel.name, type: 'channel' });
      }
      if (v.tags) {
        for (const t of v.tags) {
          if (t.toLowerCase().includes(q) && !seen.has(t)) {
            seen.add(t);
            matches.push({ text: t, type: 'tag' });
          }
        }
      }
      if (matches.length >= 7) break;
    }

    if (matches.length === 0) {
      return POPULAR_SEARCHES.filter((p) => p.toLowerCase().includes(q)).map((p) => ({
        text: p,
        type: 'popular' as const,
      }));
    }

    return matches.slice(0, 7);
  }, [searchQuery, allVideos]);

  // Handle Search Submission
  const handleSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = customQuery !== undefined ? customQuery : searchQuery;
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    onSearchChange(finalQuery);
    onSearchSubmit(finalQuery);
  };

  const handleSelectSuggestion = (suggestedText: string) => {
    onSearchChange(suggestedText);
    handleSubmit(undefined, suggestedText);
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && suggestions[selectedIndex]) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex].text);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Audio Receiver Handling: Opens audio receiver and fetches recognized audio to search
  const handleOpenAudioReceiver = () => {
    setVoiceModalOpen(true);
  };

  const handleAudioReceived = (recognizedText: string) => {
    if (!recognizedText.trim()) return;
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    // 1. Automatically place the text into the search bar
    onSearchChange(recognizedText);
    // 2. Immediately perform the search
    onSearchSubmit(recognizedText);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    setNotificationsOpen(false);
    if (notif.videoId && onSelectVideo) {
      const found = allVideos.find((v) => v.id === notif.videoId);
      if (found) {
        onSelectVideo(found);
      }
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <header
      id="app-navbar"
      className={`sticky top-0 z-40 h-14 flex items-center justify-between px-3 md:px-4 border-b ${
        darkMode ? 'bg-[#0f0f0f] border-[#272727] text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* If Mobile Search Mode is Active, show full-width search input */}
      {mobileSearchOpen ? (
        <div className="flex items-center w-full gap-2 animate-in fade-in duration-150">
          <button
            id="btn-close-mobile-search"
            onClick={() => setMobileSearchOpen(false)}
            className={`p-2 rounded-full transition-colors ${
              darkMode ? 'hover:bg-[#272727] text-neutral-300' : 'hover:bg-slate-100 text-slate-700'
            }`}
            aria-label="Back to navigation"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <form onSubmit={(e) => handleSubmit(e)} className="flex-1 flex items-center">
            <div
              className={`flex items-center w-full h-10 px-3.5 rounded-full border transition-colors ${
                darkMode ? 'bg-[#121212] border-[#303030]' : 'bg-slate-100 border-slate-300'
              }`}
            >
              <Search className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
              <input
                ref={mobileInputRef}
                id="search-input-mobile"
                type="text"
                autoFocus
                placeholder="Search ViewTube..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none placeholder:text-neutral-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          <button
            id="btn-mobile-voice-search"
            type="button"
            onClick={handleOpenAudioReceiver}
            className={`w-10 h-10 rounded-full transition-all flex items-center justify-center cursor-pointer ${
              voiceModalOpen
                ? 'bg-red-600 text-white ring-2 ring-red-500/40'
                : darkMode
                ? 'bg-[#222222] hover:bg-[#303030] text-neutral-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Search with your voice"
            aria-label="Search with your voice"
          >
            <Mic className={`w-4 h-4 ${voiceModalOpen ? 'text-white' : 'text-neutral-200'}`} />
          </button>
        </div>
      ) : (
        <>
          {/* Left: Hamburger & Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-sidebar-toggle"
              onClick={onToggleSidebar}
              className={`p-2 rounded-full transition-colors ${
                darkMode ? 'hover:bg-[#272727] text-neutral-300' : 'hover:bg-slate-100 text-slate-700'
              }`}
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              id="btn-brand-home"
              onClick={onGoHome}
              className="flex items-center gap-2 group cursor-pointer focus:outline-none select-none"
            >
              <div className="w-8 h-6 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
                <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[7px] border-l-white ml-0.5" />
              </div>
              <div className="flex items-baseline tracking-tight">
                <span className="font-bold text-lg tracking-tighter">View</span>
                <span className="font-extrabold text-lg tracking-tighter text-red-600">Tube</span>
                {hasLiveBroadcasting && (
                  <span className="ml-2 hidden sm:flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-red-600/20 text-red-500 rounded-full border border-red-500/30 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Live Active
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Middle: Desktop Search Box & Suggestions */}
          <div
            ref={searchContainerRef}
            className="hidden sm:flex items-center justify-center flex-1 max-w-xl mx-4 relative"
          >
            <form onSubmit={(e) => handleSubmit(e)} className="flex items-center w-full">
              <div
                className={`flex items-center w-full h-10 px-4 rounded-l-full border focus-within:border-blue-500 transition-colors ${
                  darkMode ? 'bg-[#121212] border-[#303030]' : 'bg-white border-slate-300'
                }`}
              >
                <Search className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
                <input
                  ref={desktopInputRef}
                  id="search-input"
                  type="text"
                  placeholder="Search videos, live streams, creators..."
                  value={searchQuery}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-sm focus:outline-none placeholder:text-neutral-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      onSearchChange('');
                      setShowSuggestions(false);
                      onSearchSubmit('');
                    }}
                    className="text-neutral-400 hover:text-neutral-200 p-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                id="btn-search-submit"
                type="submit"
                className={`h-10 px-5 flex items-center justify-center rounded-r-full border border-l-0 transition-colors cursor-pointer ${
                  darkMode
                    ? 'bg-[#222222] border-[#303030] hover:bg-[#2a2a2a] text-neutral-300'
                    : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
                }`}
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Voice Search Microphone Button beside Search Bar */}
            <button
              id="btn-audio-receiver"
              type="button"
              onClick={handleOpenAudioReceiver}
              className={`ml-2 sm:ml-2.5 w-10 h-10 rounded-full transition-all cursor-pointer flex-shrink-0 flex items-center justify-center border ${
                voiceModalOpen
                  ? 'bg-red-600 border-red-500 text-white ring-2 ring-red-500/40 shadow-sm'
                  : darkMode
                  ? 'bg-[#222222] border-[#303030] hover:bg-[#2a2a2a] text-neutral-200 hover:text-white'
                  : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
              title="Search with your voice"
              aria-label="Search with your voice"
            >
              <Mic className={`w-4 h-4 ${voiceModalOpen ? 'text-white' : 'text-neutral-200'}`} />
            </button>

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                id="search-suggestions-dropdown"
                className={`absolute top-12 left-0 right-12 rounded-2xl shadow-2xl border py-2 z-50 overflow-hidden ${
                  darkMode ? 'bg-[#212121] border-[#383838] text-neutral-200' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 px-4 py-1">
                  {searchQuery.trim() ? 'Matching queries' : 'Trending on ViewTube'}
                </div>
                {suggestions.map((item, idx) => (
                  <button
                    key={`${item.text}-${idx}`}
                    type="button"
                    onClick={() => handleSelectSuggestion(item.text)}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      selectedIndex === idx
                        ? darkMode
                          ? 'bg-[#333333] text-white font-semibold'
                          : 'bg-slate-100 text-blue-600 font-semibold'
                        : darkMode
                        ? 'hover:bg-[#2e2e2e]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      {item.type === 'popular' ? (
                        <TrendingUp className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      ) : (
                        <Search className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{item.text}</span>
                    </div>
                    {item.type !== 'popular' && (
                      <span className="text-[10px] text-neutral-500 capitalize">{item.type}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            {/* Mobile Search Open Button (visible on small screens) */}
            <button
              id="btn-open-mobile-search"
              onClick={() => {
                setMobileSearchOpen(true);
                setTimeout(() => mobileInputRef.current?.focus(), 80);
              }}
              className={`sm:hidden p-2 rounded-full transition-colors ${
                darkMode ? 'hover:bg-[#272727] text-neutral-300' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Search"
              aria-label="Open search bar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cast & Device Receiver Button */}
            {onOpenCastModal && (
              <button
                id="btn-cast-receiver"
                onClick={onOpenCastModal}
                className={`relative p-2 rounded-full transition-colors cursor-pointer ${
                  isCastConnected
                    ? 'text-red-500 bg-red-500/15 ring-1 ring-red-500/30'
                    : darkMode
                    ? 'hover:bg-[#272727] text-neutral-300'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
                title={isCastConnected ? 'Cast active (Receiver connected)' : 'Cast to TV / Receiver'}
                aria-label="Cast to TV / Receiver"
              >
                <Cast className="w-4 h-4" />
                {isCastConnected && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                )}
              </button>
            )}

            {/* Create dropdown */}
            <div className="relative" ref={createMenuRef}>
              <button
                id="btn-create-menu"
                onClick={() => setCreateMenuOpen(!createMenuOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-[#272727] hover:bg-[#383838] text-neutral-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <VideoIcon className="w-4 h-4 text-red-500" />
                <span className="hidden md:inline">Create</span>
              </button>

              {createMenuOpen && (
                <div
                  id="create-dropdown-menu"
                  className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl border py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                    darkMode ? 'bg-[#282828] border-[#3e3e3e] text-neutral-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <button
                    id="menu-upload-video"
                    onClick={() => {
                      setCreateMenuOpen(false);
                      onOpenUpload();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-left transition-colors cursor-pointer ${
                      darkMode ? 'hover:bg-[#3e3e3e]' : 'hover:bg-slate-100'
                    }`}
                  >
                    <Upload className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="font-semibold">Upload video</div>
                      <div className="text-[11px] text-neutral-400">Share MP4 or record webcam</div>
                    </div>
                  </button>

                  <button
                    id="menu-go-live"
                    onClick={() => {
                      setCreateMenuOpen(false);
                      onOpenLiveStudio();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-left transition-colors cursor-pointer ${
                      darkMode ? 'hover:bg-[#3e3e3e]' : 'hover:bg-slate-100'
                    }`}
                  >
                    <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        Go live
                        <span className="text-[9px] bg-red-600 text-white font-bold px-1 rounded">LIVE</span>
                      </div>
                      <div className="text-[11px] text-neutral-400">Broadcast webcam or screen</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Dark/Light mode toggle */}
            <button
              id="btn-toggle-theme"
              onClick={onToggleDarkMode}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                darkMode ? 'hover:bg-[#272727] text-neutral-300' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Notifications Receiver */}
            <div className="relative" ref={notificationsRef}>
              <button
                id="btn-notifications"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2 rounded-full transition-colors cursor-pointer ${
                  darkMode ? 'hover:bg-[#272727] text-neutral-300' : 'hover:bg-slate-100 text-slate-700'
                }`}
                title="Notifications"
                aria-label="Open notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 px-1 min-w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div
                  id="notifications-popup"
                  className={`absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl shadow-2xl border py-2.5 z-50 ${
                    darkMode ? 'bg-[#282828] border-[#3e3e3e] text-neutral-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-neutral-700/40 text-xs font-bold uppercase tracking-wider text-neutral-400">
                    <span>Notifications ({notifications.length})</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllNotificationsRead}
                        className="text-[11px] text-blue-400 hover:underline font-normal lowercase cursor-pointer"
                      >
                        mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-neutral-700/20">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3 flex gap-3 text-xs transition-colors cursor-pointer ${
                          !notif.isRead
                            ? darkMode
                              ? 'bg-neutral-800/80 hover:bg-[#383838]'
                              : 'bg-blue-50/50 hover:bg-slate-100'
                            : darkMode
                            ? 'hover:bg-[#353535]'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            !notif.isRead ? 'bg-red-500' : 'bg-transparent'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-neutral-100 line-clamp-1">{notif.title}</p>
                          <p className="text-neutral-400 text-[11px] line-clamp-2 mt-0.5">{notif.message}</p>
                          <span className="text-[10px] text-neutral-500 mt-1 inline-block">{notif.timeAgo}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Sign In Section */}
            {user.isLoggedIn === false ? (
              <div className="flex items-center gap-1.5 pl-1">
                <button
                  id="btn-navbar-signin"
                  onClick={() => onOpenAuth?.('signin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/80 text-blue-400 hover:bg-blue-500/10 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                  title="Sign in to ViewTube"
                >
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sign in</span>
                </button>
              </div>
            ) : (
              <div className="relative pl-1" ref={userMenuRef}>
                <button
                  id="btn-user-avatar"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="relative block rounded-full focus:outline-none"
                  title={`${user.name} (${user.handle})`}
                  aria-label="Account profile menu"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-neutral-700 hover:ring-red-500 transition-all cursor-pointer"
                  />
                </button>

                {userMenuOpen && (
                  <div
                    id="user-profile-dropdown"
                    className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border py-2 z-50 animate-in fade-in duration-100 ${
                      darkMode ? 'bg-[#282828] border-[#3e3e3e] text-neutral-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    {/* User summary */}
                    <div className="px-4 py-2.5 border-b border-neutral-700/40 flex items-center gap-3">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-600 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate">{user.name}</p>
                        <p className="text-xs text-neutral-400 truncate">{user.handle}</p>
                        {user.email && <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        id="menu-item-profile"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenProfile?.();
                        }}
                        className={`w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                          darkMode ? 'hover:bg-[#383838]' : 'hover:bg-slate-100'
                        }`}
                      >
                        <User className="w-4 h-4 text-red-500" />
                        <span>Your Profile & Channel</span>
                      </button>

                      <button
                        id="menu-item-uploads"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onSelectTab?.('my-videos');
                        }}
                        className={`w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                          darkMode ? 'hover:bg-[#383838]' : 'hover:bg-slate-100'
                        }`}
                      >
                        <Upload className="w-4 h-4 text-blue-400" />
                        <span>Your Uploads</span>
                      </button>

                      <button
                        id="menu-item-switch-account"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenAuth?.('signin');
                        }}
                        className={`w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                          darkMode ? 'hover:bg-[#383838]' : 'hover:bg-slate-100'
                        }`}
                      >
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span>Switch Account / Sign In</span>
                      </button>

                      <button
                        id="menu-item-signup"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenAuth?.('signup');
                        }}
                        className={`w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                          darkMode ? 'hover:bg-[#383838]' : 'hover:bg-slate-100'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Create New Account</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-neutral-700/40">
                      <button
                        id="menu-item-signout"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onSignOut?.();
                        }}
                        className={`w-full px-4 py-2.5 text-xs font-semibold text-red-400 flex items-center gap-3 transition-colors cursor-pointer ${
                          darkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                        }`}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Audio Receiver Modal: Receives audio, fetches to search bar, and automatically searches */}
      <AudioReceiverModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onAudioReceived={handleAudioReceived}
        darkMode={darkMode}
      />
    </header>
  );
};
