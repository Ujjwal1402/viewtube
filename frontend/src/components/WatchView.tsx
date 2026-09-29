import React, { useState, useRef, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Clock,
  Download,
  MoreHorizontal,
  CheckCircle2,
  Bell,
  Check,
  Sparkles,
  Radio,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Play,
} from 'lucide-react';
import { Video, Comment, UserAccount, LiveChatMessage } from '../types';
import { formatViews, formatDuration } from '../utils/formatters';
import { extractVideoDuration } from '../utils/videoMetadata';
import { VideoPlayer, VideoPlayerHandle } from './VideoPlayer';
import { CommentsSection } from './CommentsSection';
import { LiveChat } from './LiveChat';
import { VideoCard } from './VideoCard';
import { ShareModal } from './ShareModal';

interface WatchViewProps {
  video: Video;
  allVideos: Video[];
  comments: Comment[];
  liveChatMessages: LiveChatMessage[];
  currentUser: UserAccount;
  onSelectVideo: (video: Video) => void;
  onToggleLikeVideo: (videoId: string) => void;
  onToggleDislikeVideo: (videoId: string) => void;
  onToggleSubscribe: (channelId: string) => void;
  onToggleWatchLater: (videoId: string) => void;
  onAddComment: (content: string, parentId?: string | null) => void;
  onLikeComment: (commentId: string, parentId?: string | null) => void;
  onDislikeComment: (commentId: string, parentId?: string | null) => void;
  onDeleteComment: (commentId: string, parentId?: string | null) => void;
  onEditComment: (commentId: string, newContent: string, parentId?: string | null) => void;
  darkMode: boolean;
  onOpenCastModal?: () => void;
  isCastConnected?: boolean;
}

const RecommendationItem: React.FC<{
  video: Video;
  onSelect: (video: Video) => void;
}> = ({ video, onSelect }) => {
  const [duration, setDuration] = useState(video.duration);

  useEffect(() => {
    setDuration(video.duration);
  }, [video.duration]);

  useEffect(() => {
    if (video.isLive || !video.videoUrl || (video.duration && video.duration > 0)) return;
    let cancelled = false;
    extractVideoDuration(video.videoUrl).then((d) => {
      if (!cancelled && d > 0) {
        setDuration(d);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [video.videoUrl, video.isLive, video.duration]);

  return (
    <div
      id={`recommendation-item-${video.id}`}
      onClick={() => {
        onSelect(video);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className="flex gap-2.5 group cursor-pointer p-1.5 rounded-xl hover:bg-neutral-800/40 transition-colors"
    >
      <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Play className="w-6 h-6 text-white fill-current drop-shadow" />
        </div>
        {video.isLive ? (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[9px] uppercase">
            LIVE
          </span>
        ) : (
          <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">
            {formatDuration(duration)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-semibold line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
          {video.title}
        </h4>
        <p className="text-[11px] text-neutral-400 truncate mt-1">{video.channel.name}</p>
        <p className="text-[11px] text-neutral-500">
          {video.isLive ? (
            <span className="text-red-500 font-medium">LIVE</span>
          ) : (
            `${formatViews(video.views)} views`
          )}
        </p>
      </div>
    </div>
  );
};

export const WatchView: React.FC<WatchViewProps> = ({
  video,
  allVideos,
  comments,
  liveChatMessages,
  currentUser,
  onSelectVideo,
  onToggleLikeVideo,
  onToggleDislikeVideo,
  onToggleSubscribe,
  onToggleWatchLater,
  onAddComment,
  onLikeComment,
  onDislikeComment,
  onDeleteComment,
  onEditComment,
  darkMode,
  onOpenCastModal,
  isCastConnected = false,
}) => {
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(true);

  const playerRef = useRef<VideoPlayerHandle>(null);

  const isLiked = currentUser.likedVideoIds.includes(video.id);
  const isDisliked = currentUser.dislikedVideoIds.includes(video.id);
  const isSubscribed = currentUser.subscribedChannelIds.includes(video.channel.id);
  const isSavedWatchLater = currentUser.watchLaterIds.includes(video.id);

  // Filter recommendations (exclude current video)
  const recommendations = allVideos.filter((v) => v.id !== video.id);
  const nextVideo = recommendations[0] || null;

  const handleNextVideo = () => {
    if (nextVideo) {
      onSelectVideo(nextVideo);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSeek = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = video.videoUrl;
    a.download = `${video.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div id="watch-view-page" className="w-full max-w-[1680px] mx-auto px-2 sm:px-4 md:px-6 py-4">
      <div className={`flex flex-col ${isTheaterMode ? 'gap-6' : 'lg:flex-row gap-6'}`}>
        {/* Left Column: Player + Info + Comments */}
        <div className={`flex-1 min-w-0 ${isTheaterMode ? 'w-full' : ''}`}>
          {/* Main Video Player */}
          <div className="w-full">
            <VideoPlayer
              ref={playerRef}
              video={video}
              isTheaterMode={isTheaterMode}
              onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
              darkMode={darkMode}
              onNextVideo={handleNextVideo}
              nextVideo={nextVideo}
              isAutoplayEnabled={isAutoplayEnabled}
              onToggleAutoplay={() => setIsAutoplayEnabled(!isAutoplayEnabled)}
              onOpenCastModal={onOpenCastModal}
              isCastConnected={isCastConnected}
            />
          </div>

          {/* Video Title */}
          <h1
            id="watch-video-title"
            className="text-lg md:text-xl font-bold mt-3.5 leading-snug tracking-tight"
          >
            {video.title}
          </h1>

          {/* Meta & Channel Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3 pb-3 border-b border-neutral-800/40">
            {/* Channel Info */}
            <div className="flex items-center gap-3">
              <img
                src={video.channel.avatarUrl}
                alt={video.channel.name}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-700/60"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm truncate">{video.channel.name}</span>
                  {video.channel.verified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                  )}
                </div>
                <div className="text-xs text-neutral-400">
                  {formatViews(video.channel.subscribers)} subscribers
                </div>
              </div>

              {/* Subscribe Button */}
              <button
                id="btn-subscribe"
                onClick={() => onToggleSubscribe(video.channel.id)}
                className={`ml-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                  isSubscribed
                    ? darkMode
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            </div>

            {/* Action Buttons: Like, Dislike, Share, Save */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Like / Dislike Pill */}
              <div
                className={`flex items-center rounded-full border text-xs font-semibold overflow-hidden ${
                  darkMode ? 'bg-neutral-800/80 border-neutral-700' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  id="btn-like-video"
                  onClick={() => onToggleLikeVideo(video.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 hover:bg-white/10 transition-colors cursor-pointer ${
                    isLiked ? 'text-blue-500 font-bold' : ''
                  }`}
                  title="I like this"
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{formatViews(video.likes + (isLiked ? 1 : 0))}</span>
                </button>

                <div className={`w-[1px] h-4 ${darkMode ? 'bg-neutral-700' : 'bg-slate-300'}`} />

                <button
                  id="btn-dislike-video"
                  onClick={() => onToggleDislikeVideo(video.id)}
                  className={`px-3 py-2 hover:bg-white/10 transition-colors cursor-pointer ${
                    isDisliked ? 'text-blue-500' : ''
                  }`}
                  title="I dislike this"
                >
                  <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Share Button */}
              <button
                id="btn-share-video"
                onClick={() => setIsShareModalOpen(true)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
                  darkMode
                    ? 'bg-neutral-800/80 border-neutral-700 hover:bg-neutral-700'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              {/* Watch Later Pill */}
              <button
                id="btn-watch-later"
                onClick={() => onToggleWatchLater(video.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
                  isSavedWatchLater
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                    : darkMode
                    ? 'bg-neutral-800/80 border-neutral-700 hover:bg-neutral-700'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">{isSavedWatchLater ? 'Saved' : 'Save'}</span>
              </button>

              {/* Download Video */}
              <button
                id="btn-download-video"
                onClick={handleDownload}
                className={`p-2 rounded-full border transition-colors cursor-pointer ${
                  darkMode
                    ? 'bg-neutral-800/80 border-neutral-700 hover:bg-neutral-700 text-neutral-300'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                }`}
                title="Download video"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description Box */}
          <div
            id="watch-description-card"
            className={`mt-4 p-3.5 rounded-2xl text-xs leading-relaxed transition-colors select-text ${
              darkMode ? 'bg-neutral-800/50 hover:bg-neutral-800/80' : 'bg-slate-100 hover:bg-slate-200/80'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1.5 flex-wrap">
              {video.isLive ? (
                <span className="text-red-500 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  {video.liveViewerCount ? `${formatViews(video.liveViewerCount)} watching live` : 'Live broadcast'}
                </span>
              ) : (
                <span>{formatViews(video.views)} views</span>
              )}
              <span>•</span>
              <span>{video.createdAt}</span>

              {video.tags && (
                <div className="flex gap-1.5 flex-wrap ml-1">
                  {video.tags.map((tag) => (
                    <span key={tag} className="text-blue-400 hover:underline">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={`whitespace-pre-line ${descriptionExpanded ? '' : 'line-clamp-3'}`}>
              {video.description}
            </div>

            <button
              onClick={() => setDescriptionExpanded(!descriptionExpanded)}
              className="mt-2 font-bold hover:underline cursor-pointer block text-[11px] text-neutral-400 hover:text-neutral-200"
            >
              {descriptionExpanded ? 'Show less' : '...more'}
            </button>
          </div>

          {/* Comments Section */}
          <CommentsSection
            videoId={video.id}
            comments={comments}
            currentUser={currentUser}
            channel={video.channel}
            onAddComment={onAddComment}
            onLikeComment={onLikeComment}
            onDislikeComment={onDislikeComment}
            onDeleteComment={onDeleteComment}
            onEditComment={onEditComment}
            onSeekToTimestamp={handleSeek}
            darkMode={darkMode}
          />
        </div>

        {/* Right Column: Live Chat (if stream) OR Recommendations */}
        <div className={`w-full ${isTheaterMode ? 'w-full lg:w-96' : 'lg:w-96'} flex-shrink-0 space-y-6`}>
          {/* Live Chat Panel (if video is live) */}
          {video.isLive && (
            <div className="w-full">
              <LiveChat
                videoId={video.id}
                initialMessages={liveChatMessages}
                currentUser={currentUser}
                isLive={true}
                darkMode={darkMode}
              />
            </div>
          )}

          {/* Up Next / Recommendations Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-sm tracking-tight">Up Next</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-medium">Autoplay</span>
                <button
                  type="button"
                  id="upnext-autoplay-switch"
                  role="switch"
                  aria-checked={isAutoplayEnabled}
                  onClick={() => setIsAutoplayEnabled(!isAutoplayEnabled)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative flex items-center ${
                    isAutoplayEnabled ? 'bg-red-600' : 'bg-neutral-600'
                  }`}
                  title={isAutoplayEnabled ? 'Autoplay is on' : 'Autoplay is off'}
                  aria-label={isAutoplayEnabled ? 'Disable autoplay' : 'Enable autoplay'}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isAutoplayEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {recommendations.slice(0, 10).map((rec) => (
                <RecommendationItem
                  key={rec.id}
                  video={rec}
                  onSelect={onSelectVideo}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        video={video}
        currentPlaybackTime={currentPlaybackTime}
        darkMode={darkMode}
      />
    </div>
  );
};
