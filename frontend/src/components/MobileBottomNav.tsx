import React from 'react';
import { Home, PlusCircle, FolderHeart, History, Radio, User } from 'lucide-react';
import { ActiveNavTab, UserAccount } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  onOpenUpload: () => void;
  darkMode: boolean;
  hasLiveBroadcasting?: boolean;
  user?: UserAccount;
  onOpenProfile?: () => void;
  onOpenAuth?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenUpload,
  darkMode,
  hasLiveBroadcasting = false,
  user,
  onOpenProfile,
  onOpenAuth,
}) => {
  return (
    <nav
      id="mobile-bottom-navbar"
      className={`sm:hidden fixed bottom-0 inset-x-0 z-40 border-t flex items-center justify-around h-14 px-2 select-none ${
        darkMode ? 'bg-[#0f0f0f] border-[#272727] text-neutral-300' : 'bg-white border-slate-200 text-slate-700'
      }`}
    >
      {/* Home */}
      <button
        id="mob-nav-home"
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${
          activeTab === 'home' ? (darkMode ? 'text-white font-bold' : 'text-slate-900 font-bold') : 'text-neutral-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Home</span>
      </button>

      {/* Live / Explore */}
      <button
        id="mob-nav-live"
        onClick={() => onSelectTab('live')}
        className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${
          activeTab === 'live' ? 'text-red-500 font-bold' : 'text-neutral-400'
        }`}
      >
        <Radio className={`w-5 h-5 ${hasLiveBroadcasting ? 'text-red-500 animate-pulse' : ''}`} />
        <span className="text-[10px] mt-0.5">Live</span>
      </button>

      {/* Create / Upload (+) */}
      <button
        id="mob-nav-create"
        onClick={onOpenUpload}
        className="flex flex-col items-center justify-center flex-1 py-1 cursor-pointer text-red-500 hover:scale-105 transition-transform"
        title="Create or upload"
      >
        <PlusCircle className="w-7 h-7" />
        <span className="text-[9px] mt-0.5 font-bold">Create</span>
      </button>

      {/* Subscriptions */}
      <button
        id="mob-nav-subs"
        onClick={() => onSelectTab('subscriptions')}
        className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${
          activeTab === 'subscriptions'
            ? darkMode
              ? 'text-white font-bold'
              : 'text-slate-900 font-bold'
            : 'text-neutral-400'
        }`}
      >
        <FolderHeart className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Subscriptions</span>
      </button>

      {/* You / Profile */}
      <button
        id="mob-nav-profile"
        onClick={() => {
          if (user?.isLoggedIn === false) {
            onOpenAuth?.();
          } else {
            onOpenProfile?.();
          }
        }}
        className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${
          activeTab === 'profile' ? (darkMode ? 'text-white font-bold' : 'text-slate-900 font-bold') : 'text-neutral-400'
        }`}
      >
        {user?.isLoggedIn !== false && user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-5 h-5 rounded-full object-cover ring-1 ring-neutral-500"
          />
        ) : (
          <User className="w-5 h-5" />
        )}
        <span className="text-[10px] mt-0.5">You</span>
      </button>
    </nav>
  );
};
