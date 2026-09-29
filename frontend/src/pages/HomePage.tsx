import React from 'react';
import { Video } from '../types';
import { VideoCard } from '../components/VideoCard';
import { Sparkles, Search, X, Radio } from 'lucide-react';

interface HomePageProps {
  videos: Video[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onClearSearch: () => void;
  onSelectVideo: (video: Video) => void;
  darkMode: boolean;
  onToggleWatchLater: (videoId: string) => void;
  watchLaterIds: string[];
}

export const HomePage: React.FC<HomePageProps> = ({
  videos,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onClearSearch,
  onSelectVideo,
  darkMode,
  onToggleWatchLater,
  watchLaterIds,
}) => {
  return (
    <div>
      {/* Active Search Query Header */}
      {searchQuery && (
        <div className="px-4 md:px-6 pt-5 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Search className="w-4 h-4 text-red-500" />
            <span>Search results for:</span>
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              "{searchQuery}"
            </span>
            <span className="text-xs text-neutral-500">({videos.length} found)</span>
          </div>
          <button
            onClick={onClearSearch}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white px-2.5 py-1 rounded-md bg-neutral-800/60 hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      )}

      {/* Active Category Banner when filtering by Live Now or specific topic */}
      {!searchQuery && selectedCategory === 'Live Now' && (
        <div className="px-4 md:px-6 pt-5 pb-1 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <Radio className="w-4 h-4 text-red-500" />
          <h2 className="text-base font-bold tracking-tight">Live Now</h2>
          <span className="text-xs text-neutral-400">({videos.length} active streams)</span>
        </div>
      )}

      {/* Main Video Grid */}
      <div className="p-4 md:p-6">
        {videos.length === 0 ? (
          <div className="text-center py-24 text-neutral-500 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mx-auto mb-4 border border-neutral-800">
              <Sparkles className="w-8 h-8 text-neutral-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-300">No videos found</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Try adjusting your search terms or picking another category chip above.
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  if (searchQuery) onClearSearch();
                  onSelectCategory('All');
                }}
                className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-full cursor-pointer transition-colors"
              >
                Show All Videos
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-8 gap-x-4">
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
    </div>
  );
};
