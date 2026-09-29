import React from 'react';
import { Video } from '../types';
import { VideoCard } from '../components/VideoCard';
import { Upload, Trash2, Video as VideoIcon } from 'lucide-react';

interface MyVideosPageProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  onDeleteVideo: (videoId: string) => void;
  onOpenUpload: () => void;
  darkMode: boolean;
  onToggleWatchLater: (videoId: string) => void;
  watchLaterIds: string[];
}

export const MyVideosPage: React.FC<MyVideosPageProps> = ({
  videos,
  onSelectVideo,
  onDeleteVideo,
  onOpenUpload,
  darkMode,
  onToggleWatchLater,
  watchLaterIds,
}) => {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <VideoIcon className="w-5 h-5 text-red-500" />
            <span>Your Uploads</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage your published content and offline video library ({videos.length} videos)
          </p>
        </div>
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-semibold cursor-pointer transition-colors shadow-xs"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Video</span>
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-24 text-neutral-500 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mx-auto mb-4 border border-neutral-800">
            <Upload className="w-8 h-8 text-neutral-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-300">No uploads yet</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Upload custom MP4, WebM videos from your device or record with your webcam.
          </p>
          <button
            onClick={onOpenUpload}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-full cursor-pointer transition-colors"
          >
            Upload Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-4">
          {videos.map((video) => (
            <div key={video.id} className="relative group">
              <VideoCard
                video={video}
                onSelect={onSelectVideo}
                darkMode={darkMode}
                onToggleWatchLater={onToggleWatchLater}
                isSavedWatchLater={watchLaterIds.includes(video.id)}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteVideo(video.id);
                }}
                className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-black/70 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                title="Delete this upload"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
