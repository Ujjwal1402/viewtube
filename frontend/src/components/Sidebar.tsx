import React from 'react';
import {
  Home,
  Radio,
  Tv,
  SquarePlay,
  History,
  Clock,
  ThumbsUp,
  Flame,
  Music2,
  Gamepad2,
  Cpu,
  GraduationCap,
  Sparkles,
  User,
} from 'lucide-react';
import { ActiveNavTab, Video, UserAccount } from '../types';

interface SidebarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab, categoryName?: string) => void;
  selectedCategory: string;
  isOpen: boolean;
  onCloseMobile: () => void;
  darkMode: boolean;
  myVideosCount: number;
  liveVideosCount: number;
  user?: UserAccount;
  onOpenProfile?: () => void;
  onOpenAuth?: (tab?: 'signin' | 'signup') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  selectedCategory,
  isOpen,
  onCloseMobile,
  darkMode,
  myVideosCount,
  liveVideosCount,
  user,
  onOpenProfile,
  onOpenAuth,
}) => {
  const mainItems = [
    { id: 'home', label: 'Home', icon: Home },
    {
      id: 'live',
      label: 'Live Streams',
      icon: Radio,
      badge: liveVideosCount > 0 ? `${liveVideosCount} live` : undefined,
      badgeLive: true,
    },
    { id: 'subscriptions', label: 'Subscriptions', icon: Tv },
  ];

  const libraryItems = [
    {
      id: 'my-videos',
      label: 'Your Uploads',
      icon: SquarePlay,
      badge: myVideosCount > 0 ? myVideosCount.toString() : undefined,
    },
    { id: 'history', label: 'History', icon: History },
    { id: 'watch-later', label: 'Watch Later', icon: Clock },
    { id: 'liked-videos', label: 'Liked Videos', icon: ThumbsUp },
  ];

  const exploreItems = [
    { name: 'Trending', icon: Flame },
    { name: 'Music', icon: Music2 },
    { name: 'Gaming', icon: Gamepad2 },
    { name: 'Technology', icon: Cpu },
    { name: 'Animation', icon: Sparkles },
    { name: 'Education', icon: GraduationCap },
  ];

  // Subscribed channels list preview
  const subscribedChannels = [
    {
      name: 'Lofi Girl Café',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isLive: true,
    },
    {
      name: 'Space Orbit Live',
      avatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=80',
      isLive: true,
    },
    {
      name: 'Blender Studio',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      isLive: false,
    },
  ];

  const bgClass = darkMode ? 'bg-[#0f0f0f] border-[#272727] text-neutral-200' : 'bg-white border-slate-200 text-slate-800';
  const activeClass = darkMode ? 'bg-[#272727] text-white font-semibold' : 'bg-slate-100 text-slate-900 font-semibold';
  const hoverClass = darkMode ? 'hover:bg-[#1f1f1f] text-neutral-300' : 'hover:bg-slate-50 text-slate-700';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-xs"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-14 left-0 z-30 h-[calc(100vh-3.5rem)] overflow-y-auto border-r transition-all duration-200 select-none ${bgClass} ${
          isOpen ? 'w-60 px-3 py-2' : 'hidden md:flex flex-col w-18 items-center py-2 px-1'
        }`}
      >
        {isOpen ? (
          /* Full Expanded Sidebar */
          <div className="space-y-4 pb-12">
            {/* Main Tabs */}
            <div className="space-y-0.5">
              {mainItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-item-${item.id}`}
                    onClick={() => {
                      onSelectTab(item.id as ActiveNavTab);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                      isActive ? activeClass : hoverClass
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={`w-5 h-5 ${item.badgeLive && isActive ? 'text-red-500' : ''}`} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                          item.badgeLive
                            ? 'bg-red-600 text-white animate-pulse'
                            : darkMode
                            ? 'bg-neutral-800 text-neutral-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className={`border-t my-2 ${darkMode ? 'border-neutral-800' : 'border-slate-200'}`} />

            {/* Library / User */}
            <div>
              <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                You
              </div>
              <div className="space-y-0.5">
                {user?.isLoggedIn !== false ? (
                  <button
                    id="sidebar-item-profile"
                    onClick={() => {
                      onOpenProfile?.();
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${hoverClass}`}
                  >
                    <div className="flex items-center gap-4">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-neutral-500"
                        />
                      ) : (
                        <User className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm font-semibold truncate">Your Channel</span>
                    </div>
                  </button>
                ) : (
                  <div className={`p-3 rounded-xl border my-1.5 ${
                    darkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <p className="text-xs text-neutral-400 mb-2 leading-relaxed">
                      Sign in to like videos, comment, and save your favorites.
                    </p>
                    <button
                      id="btn-sidebar-signin"
                      onClick={() => {
                        onOpenAuth?.('signin');
                        onCloseMobile();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/80 text-blue-400 hover:bg-blue-500/10 text-xs font-semibold cursor-pointer transition-all"
                    >
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      <span>Sign in</span>
                    </button>
                  </div>
                )}

                {libraryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-item-${item.id}`}
                      onClick={() => {
                        onSelectTab(item.id as ActiveNavTab);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        isActive ? activeClass : hoverClass
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[11px] font-medium px-1.5 py-0.2 bg-blue-600/20 text-blue-400 rounded-md">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`border-t my-2 ${darkMode ? 'border-neutral-800' : 'border-slate-200'}`} />

            {/* Subscriptions */}
            <div>
              <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Subscriptions
              </div>
              <div className="space-y-1">
                {subscribedChannels.map((ch) => (
                  <button
                    key={ch.name}
                    onClick={() => {
                      onSelectTab('category', ch.name);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${hoverClass}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={ch.avatar}
                        alt={ch.name}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                      <span className="text-sm truncate">{ch.name}</span>
                    </div>
                    {ch.isLive && (
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className={`border-t my-2 ${darkMode ? 'border-neutral-800' : 'border-slate-200'}`} />

            {/* Explore Topics */}
            <div>
              <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Explore
              </div>
              <div className="space-y-0.5">
                {exploreItems.map((topic) => {
                  const Icon = topic.icon;
                  const isActive = activeTab === 'category' && selectedCategory === topic.name;
                  return (
                    <button
                      key={topic.name}
                      onClick={() => {
                        onSelectTab('category', topic.name);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        isActive ? activeClass : hoverClass
                      }`}
                    >
                      <Icon className="w-5 h-5 text-neutral-400" />
                      <span className="text-sm">{topic.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Compact Collapsed Sidebar (Icons only with small labels) */
          <div className="w-full space-y-3">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id as ActiveNavTab)}
                  className={`w-full flex flex-col items-center justify-center py-3 px-1 rounded-xl text-[10px] transition-colors cursor-pointer ${
                    isActive ? activeClass : hoverClass
                  }`}
                  title={item.label}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5 mb-1" />
                    {item.badgeLive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    )}
                  </div>
                  <span className="truncate max-w-full text-[10px]">{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => onSelectTab('my-videos')}
              className={`w-full flex flex-col items-center justify-center py-3 px-1 rounded-xl text-[10px] transition-colors cursor-pointer ${
                activeTab === 'my-videos' ? activeClass : hoverClass
              }`}
              title="Your Uploads"
            >
              <SquarePlay className="w-5 h-5 mb-1" />
              <span className="truncate max-w-full text-[10px]">Uploads</span>
            </button>

            <button
              onClick={() => onSelectTab('history')}
              className={`w-full flex flex-col items-center justify-center py-3 px-1 rounded-xl text-[10px] transition-colors cursor-pointer ${
                activeTab === 'history' ? activeClass : hoverClass
              }`}
              title="History"
            >
              <History className="w-5 h-5 mb-1" />
              <span className="truncate max-w-full text-[10px]">History</span>
            </button>

            <button
              onClick={() => {
                if (user?.isLoggedIn === false) {
                  onOpenAuth?.('signin');
                } else {
                  onOpenProfile?.();
                }
              }}
              className={`w-full flex flex-col items-center justify-center py-3 px-1 rounded-xl text-[10px] transition-colors cursor-pointer ${hoverClass}`}
              title="You / Channel"
            >
              {user?.isLoggedIn !== false && user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-5 h-5 rounded-full object-cover mb-1 ring-1 ring-neutral-500"
                />
              ) : (
                <User className="w-5 h-5 mb-1" />
              )}
              <span className="truncate max-w-full text-[10px]">You</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
