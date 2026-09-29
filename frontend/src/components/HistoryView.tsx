import React, { useState, useMemo } from 'react';
import {
  History,
  Trash2,
  Pause,
  Play,
  Search,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Film,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Video } from '../types';
import { formatDuration, formatViews } from '../utils/formatters';

interface HistoryViewProps {
  allVideos: Video[];
  historyVideoIds: string[];
  isHistoryPaused: boolean;
  onSelectVideo: (video: Video) => void;
  onRemoveFromHistory: (videoId: string) => void;
  onClearHistory: () => void;
  onTogglePauseHistory: () => void;
  onGoHome: () => void;
  darkMode: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  allVideos,
  historyVideoIds,
  isHistoryPaused,
  onSelectVideo,
  onRemoveFromHistory,
  onClearHistory,
  onTogglePauseHistory,
  onGoHome,
  darkMode,
}) => {
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  // Map history IDs to video objects in exact chronological order (most recent first)
  const historyVideos = useMemo(() => {
    const videoMap = new Map<string, Video>();
    allVideos.forEach((v) => videoMap.set(v.id, v));

    const result: Video[] = [];
    const seen = new Set<string>();

    historyVideoIds.forEach((id) => {
      if (!seen.has(id) && videoMap.has(id)) {
        seen.add(id);
        result.push(videoMap.get(id)!);
      }
    });

    return result;
  }, [allVideos, historyVideoIds]);

  // Filter history videos by search query if present
  const displayedVideos = useMemo(() => {
    if (!historySearchQuery.trim()) return historyVideos;
    const q = historySearchQuery.toLowerCase();
    return historyVideos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.channel.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [historyVideos, historySearchQuery]);

  return (
    <div id="history-view-page" className="w-full max-w-[1560px] mx-auto px-2 sm:px-4 md:px-6 py-4">
      {/* Top Banner Alert when History is Paused */}
      {isHistoryPaused && (
        <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2.5">
            <Pause className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Watch history is paused.</strong> New videos you watch won't be saved to your history until you resume it.
            </span>
          </div>
          <button
            onClick={onTogglePauseHistory}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Turn on history
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Watched Videos List */}
        <div className="flex-1 w-full min-w-0">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-600/10 text-red-500">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Watch history</h1>
                <p className="text-xs text-neutral-400">
                  {historyVideos.length === 1
                    ? '1 video in history'
                    : `${historyVideos.length} videos in history`}
                  {historySearchQuery && ` • ${displayedVideos.length} matching`}
                </p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {displayedVideos.length === 0 ? (
            <div className="py-20 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-neutral-800/60 mx-auto flex items-center justify-center text-neutral-400">
                <Film className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold">
                {historySearchQuery ? 'No search results found' : 'This list has no videos'}
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {historySearchQuery
                  ? `No videos in your history match "${historySearchQuery}". Try a different keyword.`
                  : 'Videos you watch will be saved here so you can easily find them again anytime.'}
              </p>
              {historySearchQuery ? (
                <button
                  onClick={() => setHistorySearchQuery('')}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded-full transition-colors cursor-pointer"
                >
                  Clear search filter
                </button>
              ) : (
                <button
                  onClick={onGoHome}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-full transition-all shadow-md cursor-pointer"
                >
                  <span>Explore videos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* History Items List */
            <div className="space-y-4">
              {displayedVideos.map((video) => (
                <div
                  key={video.id}
                  id={`history-item-${video.id}`}
                  className={`group relative flex flex-col sm:flex-row gap-3.5 p-2.5 rounded-2xl transition-all ${
                    darkMode
                      ? 'hover:bg-neutral-800/50'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => onSelectVideo(video)}
                    className="relative w-full sm:w-60 md:w-64 aspect-video rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0 cursor-pointer shadow-xs"
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="p-3 rounded-full bg-black/60 text-white">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    {video.isLive ? (
                      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[9px] uppercase">
                        LIVE
                      </span>
                    ) : (
                      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">
                        {formatDuration(video.duration)}
                      </span>
                    )}
                    {/* Simulated Watch Progress Bar */}
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-neutral-700/50">
                      <div className="h-full bg-red-600 w-full" />
                    </div>
                  </div>

                  {/* Metadata and Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 pr-8">
                    <div>
                      <h3
                        onClick={() => onSelectVideo(video)}
                        className="text-sm sm:text-base font-semibold line-clamp-2 leading-snug cursor-pointer group-hover:text-red-500 transition-colors"
                      >
                        {video.title}
                      </h3>

                      <div className="flex items-center gap-2 mt-1.5 text-xs text-neutral-400">
                        <img
                          src={video.channel.avatarUrl}
                          alt={video.channel.name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="font-medium hover:text-neutral-200 transition-colors">
                          {video.channel.name}
                        </span>
                        {video.channel.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        )}
                        <span>•</span>
                        <span>{formatViews(video.views)} views</span>
                      </div>

                      <p className="text-xs text-neutral-400/90 line-clamp-2 mt-2 leading-relaxed">
                        {video.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] text-neutral-500 font-medium">
                        Watched recently
                      </span>
                    </div>
                  </div>

                  {/* Remove from history button */}
                  <button
                    id={`btn-remove-history-${video.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromHistory(video.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer ${
                      darkMode
                        ? 'hover:bg-neutral-700 text-neutral-400 hover:text-red-400'
                        : 'hover:bg-slate-200 text-slate-500 hover:text-red-600'
                    }`}
                    title="Remove from watch history"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: History Controls Sidebar */}
        <div
          id="history-controls-panel"
          className={`w-full lg:w-80 rounded-2xl p-5 border flex-shrink-0 lg:sticky lg:top-20 space-y-5 ${
            darkMode
              ? 'bg-[#181818] border-[#2e2e2e]'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          {/* Search Watch History */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 block">
              Search watch history
            </label>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-colors ${
                darkMode
                  ? 'bg-[#121212] border-neutral-700 focus-within:border-neutral-500'
                  : 'bg-slate-50 border-slate-300 focus-within:border-slate-500'
              }`}
            >
              <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <input
                type="text"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full bg-transparent outline-none placeholder:text-neutral-500 text-xs"
              />
              {historySearchQuery && (
                <button
                  onClick={() => setHistorySearchQuery('')}
                  className="text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="h-[1px] bg-neutral-800/60" />

          {/* History Management Actions */}
          <div className="space-y-2.5">
            <button
              id="btn-clear-all-history"
              disabled={historyVideos.length === 0}
              onClick={() => setShowClearModal(true)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                historyVideos.length === 0
                  ? 'opacity-40 cursor-not-allowed text-neutral-500'
                  : darkMode
                  ? 'hover:bg-red-500/10 text-neutral-200 hover:text-red-400'
                  : 'hover:bg-red-50 text-slate-800 hover:text-red-600'
              }`}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>Clear all watch history</span>
            </button>

            <button
              id="btn-toggle-pause-history"
              onClick={onTogglePauseHistory}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                darkMode
                  ? 'hover:bg-neutral-800 text-neutral-200'
                  : 'hover:bg-slate-100 text-slate-800'
              }`}
            >
              {isHistoryPaused ? (
                <>
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>Turn on watch history</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 text-amber-400" />
                  <span>Pause watch history</span>
                </>
              )}
            </button>
          </div>

          <div className="h-[1px] bg-neutral-800/60" />

          {/* Quick Stats / Info */}
          <div className="text-[11px] text-neutral-400 space-y-1.5 leading-relaxed">
            <div className="flex justify-between">
              <span>Saved videos:</span>
              <span className="font-semibold text-neutral-200">{historyVideos.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Recording status:</span>
              <span
                className={`font-semibold ${
                  isHistoryPaused ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {isHistoryPaused ? 'Paused' : 'Active'}
              </span>
            </div>
            <p className="pt-2 text-neutral-500 text-[10px]">
              Watch history makes it easy to find videos you recently watched and improves video recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Clearing History */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 border ${
              darkMode
                ? 'bg-[#222222] border-neutral-700 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2.5 rounded-xl bg-red-500/10">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold">Clear watch history?</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Your ViewTube watch history will be cleared. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  darkMode ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                id="btn-confirm-clear-history"
                onClick={() => {
                  onClearHistory();
                  setShowClearModal(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Clear watch history
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
