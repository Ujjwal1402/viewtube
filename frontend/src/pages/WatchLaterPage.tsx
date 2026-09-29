import React from 'react';
import { Video } from '../types';
import { VideoCard } from '../components/VideoCard';
import { Clock } from 'lucide-react';

interface WatchLaterPageProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  darkMode: boolean;
  onToggleWatchLater: (videoId: string) => void;
  watchLaterIds: string[];
}

export const WatchLaterPage: React.FC<WatchLaterPageProps> = ({
  videos,
  onSelectVideo,
  darkMode,
  onToggleWatchLater,
  watchLaterIds,
}) => {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
        <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Watch Later</h2>
          <p className="text-xs text-neutral-400 mt-0.5">{videos.length} videos queued</p>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-24 text-neutral-500 max-w-md mx-auto">
          <Clock className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
          <h3 className="text-lg font-semibold text-neutral-300">Your Watch Later playlist is empty</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Save videos to watch later by hovering over any thumbnail and clicking the clock icon.
          </p>
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
