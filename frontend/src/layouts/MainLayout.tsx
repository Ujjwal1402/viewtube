import React from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { ActiveNavTab, UserAccount, Video } from '../types';
import { FEED_CATEGORIES } from '../constants/categories';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab, categoryName?: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCloseMobileSidebar: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q?: string) => void;
  allVideos: Video[];
  onSelectVideo: (video: Video) => void;
  onOpenUpload: () => void;
  onOpenLiveStudio: () => void;
  onOpenCastModal: () => void;
  onOpenAuth: (tab?: 'signin' | 'signup') => void;
  onOpenProfileModal: () => void;
  onSignOut: () => void;
  currentUser: UserAccount;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  myVideosCount: number;
  liveVideosCount: number;
  isWatching: boolean;
  hasLiveBroadcasting?: boolean;
  isCastConnected?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  selectedCategory,
  onSelectCategory,
  sidebarOpen,
  onToggleSidebar,
  onCloseMobileSidebar,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  allVideos,
  onSelectVideo,
  onOpenUpload,
  onOpenLiveStudio,
  onOpenCastModal,
  onOpenAuth,
  onOpenProfileModal,
  onSignOut,
  currentUser,
  darkMode,
  onToggleDarkMode,
  myVideosCount,
  liveVideosCount,
  isWatching,
  hasLiveBroadcasting = false,
  isCastConnected = false,
}) => {
  const showCategoryBar = !isWatching && activeTab !== 'history';

  const isChipActive = (cat: string) => {
    if (activeTab === 'my-videos') return cat === 'Your Uploads';
    if (activeTab === 'live') return cat === 'Live Now';
    if (activeTab === 'home' || activeTab === 'category') {
      return selectedCategory === cat;
    }
    return false;
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? 'bg-[#0f0f0f] text-neutral-100' : 'bg-slate-50 text-slate-900'
      } flex flex-col font-sans transition-colors duration-200`}
    >
      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onToggleSidebar={onToggleSidebar}
        onOpenUpload={onOpenUpload}
        onOpenLiveStudio={onOpenLiveStudio}
        onGoHome={() => onTabChange('home')}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        hasLiveBroadcasting={hasLiveBroadcasting}
        onOpenCastModal={onOpenCastModal}
        isCastConnected={isCastConnected}
        allVideos={allVideos}
        onSelectVideo={onSelectVideo}
        onOpenProfile={onOpenProfileModal}
        onOpenAuth={onOpenAuth}
        onSignOut={onSignOut}
        onSelectTab={onTabChange}
      />

      <div className="flex flex-1">
        {/* Responsive Sidebar */}
        {!isWatching && (
          <Sidebar
            activeTab={activeTab}
            onSelectTab={onTabChange}
            selectedCategory={selectedCategory}
            isOpen={sidebarOpen}
            onCloseMobile={onCloseMobileSidebar}
            darkMode={darkMode}
            myVideosCount={myVideosCount}
            liveVideosCount={liveVideosCount}
            user={currentUser}
            onOpenProfile={onOpenProfileModal}
            onOpenAuth={onOpenAuth}
          />
        )}

        {/* Main View Area — no overflow property so sticky top-14 anchors to window viewport */}
        <main className="flex-1 min-w-0 transition-all duration-200 pb-16 md:pb-8">
          {showCategoryBar && (
            <div
              id="category-chips-bar"
              className={`sticky top-14 z-20 px-4 md:px-6 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-b transition-colors ${
                darkMode
                  ? 'bg-[#0f0f0f]/95 border-[#272727]'
                  : 'bg-white/95 border-slate-200'
              } backdrop-blur-md`}
            >
              {FEED_CATEGORIES.map((cat) => {
                const active = isChipActive(cat);
                return (
                  <button
                    key={cat}
                    id={`filter-chip-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => onSelectCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer flex-shrink-0 ${
                      active
                        ? darkMode
                          ? 'bg-white text-neutral-900 font-semibold shadow-xs'
                          : 'bg-slate-900 text-white font-semibold'
                        : darkMode
                        ? 'bg-[#272727] text-neutral-200 hover:bg-[#3a3a3a]'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={onTabChange}
        onOpenUpload={onOpenUpload}
        darkMode={darkMode}
        hasLiveBroadcasting={hasLiveBroadcasting}
        user={currentUser}
        onOpenProfile={onOpenProfileModal}
        onOpenAuth={() => onOpenAuth('signin')}
      />
    </div>
  );
};
