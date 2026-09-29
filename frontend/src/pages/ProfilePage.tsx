import React from 'react';
import { UserAccount, Video } from '../types';
import { VideoCard } from '../components/VideoCard';
import { Camera, Edit3, LogIn, Sparkles, Upload, Radio } from 'lucide-react';

interface ProfilePageProps {
  currentUser: UserAccount;
  userVideos: Video[];
  onSelectVideo: (video: Video) => void;
  onOpenProfileModal: () => void;
  onOpenAuthModal: (tab: 'signin' | 'signup') => void;
  onOpenUploadModal: () => void;
  onOpenLiveStudio: () => void;
  darkMode: boolean;
  onToggleWatchLater: (videoId: string) => void;
  watchLaterIds: string[];
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  userVideos,
  onSelectVideo,
  onOpenProfileModal,
  onOpenAuthModal,
  onOpenUploadModal,
  onOpenLiveStudio,
  darkMode,
  onToggleWatchLater,
  watchLaterIds,
}) => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Banner */}
      <div className="w-full h-40 md:h-64 bg-linear-to-r from-neutral-900 via-red-950/40 to-neutral-900 relative overflow-hidden">
        {currentUser.bannerUrl ? (
          <img
            src={currentUser.bannerUrl}
            alt="Channel banner"
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600">
            <span className="text-sm">Customize channel banner in settings</span>
          </div>
        )}
      </div>

      {/* Header Info */}
      <div className="px-4 md:px-8 py-6 border-b border-neutral-800">
        {!currentUser.isLoggedIn ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">You are browsing as Guest</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Sign in to customize your channel, publish videos, and join live chats.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenAuthModal('signin')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => onOpenAuthModal('signup')}
                className="px-4 py-2 border border-neutral-600 hover:bg-neutral-800 text-neutral-200 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Create Account</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className="relative group cursor-pointer"
                onClick={onOpenProfileModal}
                title="Click to change profile picture"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-red-500 shadow-md group-hover:opacity-85 transition-opacity"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 font-semibold border border-red-500/30">
                    Creator
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {currentUser.handle} • {(currentUser.subscribersCount ?? 14200).toLocaleString()} subscribers • {userVideos.length} videos
                </p>
                {currentUser.bio && (
                  <p className="text-xs text-neutral-300 mt-2 max-w-xl line-clamp-2 leading-relaxed">
                    {currentUser.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenUploadModal}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
              <button
                onClick={onOpenLiveStudio}
                className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Radio className="w-3.5 h-3.5 text-red-400" />
                <span>Go Live</span>
              </button>
              <button
                onClick={onOpenProfileModal}
                className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Customize Channel</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Uploads Tab Header & Videos */}
      <div className="px-4 md:px-8 py-6">
        <h3 className="text-base font-bold mb-4">Channel Uploads</h3>
        {userVideos.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">
            <Upload className="w-10 h-10 mx-auto mb-2 text-neutral-600" />
            <p className="text-sm">No videos uploaded by this channel yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-4">
            {userVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onSelect={onSelectVideo}
                darkMode={darkMode}
                onToggleWatchLater={onToggleWatchLater}
                isSavedWatchLater={watchLaterIds.includes(video.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
