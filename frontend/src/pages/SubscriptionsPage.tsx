import React from 'react';
import { Video, Channel } from '../types';
import { VideoCard } from '../components/VideoCard';
import { CheckCircle2, Radio, Sparkles } from 'lucide-react';

interface SubscriptionsPageProps {
  videos: Video[];
  subscribedChannels: Channel[];
  onSelectVideo: (video: Video) => void;
  darkMode: boolean;
  onToggleWatchLater: (videoId: string) => void;
  watchLaterIds: string[];
}

export const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({
  videos,
  subscribedChannels,
  onSelectVideo,
  darkMode,
  onToggleWatchLater,
  watchLaterIds,
}) => {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Subscribed Channels Bar */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>Subscriptions</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-normal">
            {subscribedChannels.length} channels
          </span>
        </h2>

        {subscribedChannels.length > 0 ? (
          <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
            {subscribedChannels.map((channel) => (
              <div
                key={channel.id}
                className="flex flex-col items-center gap-1.5 min-w-[76px] cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={channel.avatarUrl}
                    alt={channel.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-transparent group-hover:ring-red-500 transition-all"
                  />
                  {channel.verified && (
                    <div className="absolute bottom-0 right-0 bg-neutral-900 rounded-full p-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-neutral-300 font-medium truncate max-w-[80px] text-center">
                  {channel.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-500">You haven't subscribed to any creators yet.</p>
        )}
      </div>

      {/* Videos from Subscribed Channels */}
      <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-4">
        Latest from your subscriptions
      </h3>

      {videos.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          <Sparkles className="w-10 h-10 mx-auto mb-2 text-neutral-600" />
          <p className="text-sm">No new videos from subscribed channels</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-4">
          {videos.map((video) => (
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
  );
};
