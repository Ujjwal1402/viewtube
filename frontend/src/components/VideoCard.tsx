import React, { useState, useEffect } from 'react';
import { Video } from '../types';
import { formatDuration, formatViews } from '../utils/formatters';
import { extractVideoDuration } from '../utils/videoMetadata';
import { CheckCircle2, Radio, Clock, Check } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  onSelect: (video: Video) => void;
  darkMode: boolean;
  onToggleWatchLater?: (videoId: string) => void;
  isSavedWatchLater?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelect,
  darkMode,
  onToggleWatchLater,
  isSavedWatchLater = false,
}) => {
  const [actualDuration, setActualDuration] = useState<number>(video.duration);

  useEffect(() => {
    setActualDuration(video.duration);
  }, [video.duration]);

  // Extract the exact duration from the video file's metadata only if missing or zero
  useEffect(() => {
    if (video.isLive || !video.videoUrl || (video.duration && video.duration > 0)) return;
    let isCancelled = false;

    extractVideoDuration(video.videoUrl).then((metadataDur) => {
      if (!isCancelled && metadataDur > 0) {
        setActualDuration(metadataDur);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [video.videoUrl, video.isLive, video.duration]);

  return (
    <div
      id={`video-card-${video.id}`}
      onClick={() => onSelect(video)}
      className="group cursor-pointer flex flex-col gap-3 transition-transform duration-200"
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-800 shadow-xs">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Live Indicator or Duration Badge */}
        {video.isLive ? (
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-md">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>LIVE</span>
          </div>
        ) : (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 text-white font-medium text-[11px] font-mono shadow-sm">
            {formatDuration(actualDuration)}
          </div>
        )}

        {/* User Upload badge */}
        {video.isUserUpload && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-blue-600/90 text-white font-semibold text-[10px] uppercase tracking-wider backdrop-blur-xs">
            Your Upload
          </div>
        )}

        {/* Quick Watch Later button on hover */}
        {onToggleWatchLater && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchLater(video.id);
            }}
            className={`absolute top-2 right-2 p-1.5 rounded-md backdrop-blur-md transition-all shadow-md cursor-pointer ${
              isSavedWatchLater
                ? 'bg-red-600 text-white opacity-100'
                : 'bg-black/80 text-white opacity-0 group-hover:opacity-100 hover:bg-black'
            }`}
            title={isSavedWatchLater ? 'Saved to Watch Later' : 'Watch Later'}
            aria-label="Watch Later"
          >
            {isSavedWatchLater ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Live Viewer Count Overlay if live */}
        {video.isLive && video.liveViewerCount && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-neutral-200 text-[10px] font-medium backdrop-blur-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            {formatViews(video.liveViewerCount)} watching
          </div>
        )}
      </div>

      {/* Meta Container */}
      <div className="flex gap-3 items-start px-0.5">
        {/* Channel Avatar */}
        <img
          src={video.channel.avatarUrl}
          alt={video.channel.name}
          className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5 ring-1 ring-neutral-700/50"
        />

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-semibold leading-snug line-clamp-2 transition-colors ${
              darkMode ? 'text-neutral-100 group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'
            }`}
            title={video.title}
          >
            {video.title}
          </h3>

          <div className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
            <span className="truncate hover:underline">{video.channel.name}</span>
            {video.channel.verified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
            )}
          </div>

          <div className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
            {video.isLive ? (
              <span className="text-red-500 font-medium">
                {video.liveViewerCount ? `${formatViews(video.liveViewerCount)} watching` : 'Streaming live'}
              </span>
            ) : (
              <>
                <span>{formatViews(video.views)} views</span>
                <span>•</span>
                <span>{video.createdAt}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
