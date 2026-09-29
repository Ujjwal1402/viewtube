import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Comment,
  LiveChatMessage,
  UserAccount,
  ActiveNavTab,
} from './types';
import { loadUserVideosFromDB, deleteUserVideoFromDB } from './utils/indexedDB';
import { extractVideoDuration } from './utils/videoMetadata';
import { videoService } from './services/videoService';
import { commentService } from './services/commentService';
import { authService } from './services/authService';

// Layout & Pages
import { MainLayout } from './layouts/MainLayout';
import {
  HomePage,
  SubscriptionsPage,
  MyVideosPage,
  LikedVideosPage,
  WatchLaterPage,
  ProfilePage,
} from './pages';

// Views & Modals
import { WatchView } from './components/WatchView';
import { HistoryView } from './components/HistoryView';
import { UploadModal } from './components/UploadModal';
import { LiveStudioModal } from './components/LiveStudioModal';
import { CastReceiverModal, CastDevice } from './components/CastReceiverModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';

// Initial fallback seed data
import {
  INITIAL_VIDEOS,
  INITIAL_COMMENTS,
  INITIAL_LIVE_CHAT,
  CURRENT_USER,
} from './data/seedVideos';

export default function App() {
  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>(() => {
    try {
      const saved = localStorage.getItem('viewtube_comments');
      return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
    } catch {
      return INITIAL_COMMENTS;
    }
  });
  const [liveChatMap, setLiveChatMap] = useState<Record<string, LiveChatMessage[]>>(INITIAL_LIVE_CHAT);
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    try {
      const saved = localStorage.getItem('viewtube_user');
      const customAvatar = localStorage.getItem('viewtube_custom_avatar');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...CURRENT_USER,
          ...parsed,
          avatarUrl: customAvatar || parsed.avatarUrl || CURRENT_USER.avatarUrl,
          subscribedChannelIds: Array.isArray(parsed.subscribedChannelIds)
            ? parsed.subscribedChannelIds
            : CURRENT_USER.subscribedChannelIds,
          likedVideoIds: Array.isArray(parsed.likedVideoIds)
            ? parsed.likedVideoIds
            : CURRENT_USER.likedVideoIds,
          dislikedVideoIds: Array.isArray(parsed.dislikedVideoIds)
            ? parsed.dislikedVideoIds
            : CURRENT_USER.dislikedVideoIds,
          watchLaterIds: Array.isArray(parsed.watchLaterIds)
            ? parsed.watchLaterIds
            : CURRENT_USER.watchLaterIds,
          historyVideoIds:
            Array.isArray(parsed.historyVideoIds) && parsed.historyVideoIds.length > 0
              ? parsed.historyVideoIds
              : CURRENT_USER.historyVideoIds,
          isHistoryPaused: typeof parsed.isHistoryPaused === 'boolean' ? parsed.isHistoryPaused : false,
        };
      } else if (customAvatar) {
        return {
          ...CURRENT_USER,
          avatarUrl: customAvatar,
        };
      }
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
    return CURRENT_USER;
  });

  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [liveStudioOpen, setLiveStudioOpen] = useState(false);
  const [castModalOpen, setCastModalOpen] = useState(false);
  const [connectedCastDevice, setConnectedCastDevice] = useState<CastDevice | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [activeBroadcastingVideo, setActiveBroadcastingVideo] = useState<Video | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Sync comments and user to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('viewtube_comments', JSON.stringify(commentsMap));
    } catch (e) {
      console.warn('Comments storage sync error:', e);
    }
  }, [commentsMap]);

  useEffect(() => {
    try {
      localStorage.setItem('viewtube_user', JSON.stringify(currentUser));
      if (currentUser.avatarUrl) {
        localStorage.setItem('viewtube_custom_avatar', currentUser.avatarUrl);
      }
    } catch (e) {
      console.warn('User storage sync error:', e);
    }
  }, [currentUser]);

  // Load user videos from IndexedDB on startup
  useEffect(() => {
    loadUserVideosFromDB().then((userVideos) => {
      if (userVideos.length > 0) {
        setVideos((prev) => {
          const existingIds = new Set(prev.map((v) => v.id));
          const newVideos = userVideos.filter((uv) => !existingIds.has(uv.id));
          return [...newVideos, ...prev];
        });
      }
    });
  }, []);

  // Fetch initial videos from Backend API with fallback
  useEffect(() => {
    videoService
      .fetchVideos()
      .then((apiVideos) => {
        if (apiVideos && apiVideos.length > 0) {
          setVideos((prev) => {
            const userUploaded = prev.filter((v) => v.isUserUpload);
            const apiVideoIds = new Set(apiVideos.map((av) => av.id));
            const merged = [...userUploaded, ...apiVideos];
            // Include any extra local seed videos not yet in API
            prev.forEach((pv) => {
              if (!apiVideoIds.has(pv.id) && !pv.isUserUpload) {
                merged.push(pv);
              }
            });
            return merged;
          });
        }
      })
      .catch((err) => {
        console.warn('Backend API fetch offline/fallback:', err?.message || err);
      });
  }, []);

  // Background probe for real video durations
  const probedUrlsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    let isCancelled = false;

    videos.forEach((vid) => {
      if (vid.isLive || !vid.videoUrl || (vid.duration && vid.duration > 0) || probedUrlsRef.current.has(vid.videoUrl)) return;
      probedUrlsRef.current.add(vid.videoUrl);

      extractVideoDuration(vid.videoUrl).then((realDuration) => {
        if (isCancelled || !realDuration) return;
        setVideos((prevVideos) =>
          prevVideos.map((v) =>
            v.id === vid.id && v.duration !== realDuration
              ? { ...v, duration: realDuration }
              : v
          )
        );
        setCurrentVideo((prevCurr) =>
          prevCurr && prevCurr.id === vid.id && prevCurr.duration !== realDuration
            ? { ...prevCurr, duration: realDuration }
            : prevCurr
        );
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [videos]);

  // Deep linking via window hash (e.g. #video=vid-1, #history, etc.)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#video=')) {
        const targetId = hash.replace('#video=', '').split('?')[0];
        const found = videos.find((v) => v.id === targetId);
        if (found) {
          setCurrentVideo(found);
          if (!currentUser.isHistoryPaused) {
            setCurrentUser((prev) => {
              const list = Array.isArray(prev.historyVideoIds) ? prev.historyVideoIds : [];
              return {
                ...prev,
                historyVideoIds: [found.id, ...list.filter((id) => id !== found.id)],
              };
            });
          }
        }
      } else if (hash === '#history') {
        setCurrentVideo(null);
        setActiveTab('history');
      } else if (hash === '#live') {
        setCurrentVideo(null);
        setActiveTab('live');
        setSelectedCategory('Live Now');
      } else if (hash === '#subscriptions') {
        setCurrentVideo(null);
        setActiveTab('subscriptions');
      } else if (hash === '#my-videos') {
        setCurrentVideo(null);
        setActiveTab('my-videos');
      } else if (hash === '#liked-videos') {
        setCurrentVideo(null);
        setActiveTab('liked-videos');
      } else if (hash === '#watch-later') {
        setCurrentVideo(null);
        setActiveTab('watch-later');
      } else if (hash === '#profile') {
        setCurrentVideo(null);
        setActiveTab('profile');
      } else if (hash.startsWith('#search=')) {
        const query = decodeURIComponent(hash.replace('#search=', ''));
        setSearchQuery(query);
        setCurrentVideo(null);
        setActiveTab('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [videos, currentUser.isHistoryPaused]);

  // Search submission logic
  const handleSearchSubmit = (query?: string) => {
    const q = query !== undefined ? query : searchQuery;
    setSearchQuery(q);
    setCurrentVideo(null);
    setActiveTab('home');
    setSelectedCategory('All');
    if (q.trim()) {
      window.location.hash = `search=${encodeURIComponent(q.trim())}`;
    } else {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Video Selection
  const handleSelectVideo = (video: Video) => {
    setCurrentVideo(video);
    window.location.hash = `video=${video.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Track view in backend
    videoService.recordView(video.id).catch(() => {});

    // Add to watch history
    if (!currentUser.isHistoryPaused) {
      setCurrentUser((prev) => {
        const list = Array.isArray(prev.historyVideoIds) ? prev.historyVideoIds : [];
        return {
          ...prev,
          historyVideoIds: [video.id, ...list.filter((id) => id !== video.id)],
        };
      });
    }
  };

  // History Actions
  const handleRemoveFromHistory = (videoId: string) => {
    setCurrentUser((prev) => ({
      ...prev,
      historyVideoIds: (prev.historyVideoIds || []).filter((id) => id !== videoId),
    }));
  };

  const handleClearHistory = () => {
    setCurrentUser((prev) => ({
      ...prev,
      historyVideoIds: [],
    }));
  };

  const handleTogglePauseHistory = () => {
    setCurrentUser((prev) => ({
      ...prev,
      isHistoryPaused: !prev.isHistoryPaused,
    }));
  };

  // Likes & Dislikes
  const handleToggleLikeVideo = (videoId: string) => {
    const isLiked = currentUser.likedVideoIds.includes(videoId);
    setCurrentUser((prev) => ({
      ...prev,
      likedVideoIds: isLiked
        ? prev.likedVideoIds.filter((id) => id !== videoId)
        : [...prev.likedVideoIds, videoId],
      dislikedVideoIds: prev.dislikedVideoIds.filter((id) => id !== videoId),
    }));

    videoService.toggleLike(videoId, !isLiked).catch(() => {});
  };

  const handleToggleDislikeVideo = (videoId: string) => {
    const isDisliked = currentUser.dislikedVideoIds.includes(videoId);
    setCurrentUser((prev) => ({
      ...prev,
      dislikedVideoIds: isDisliked
        ? prev.dislikedVideoIds.filter((id) => id !== videoId)
        : [...prev.dislikedVideoIds, videoId],
      likedVideoIds: prev.likedVideoIds.filter((id) => id !== videoId),
    }));
  };

  // Channel Subscriptions
  const handleToggleSubscribe = (channelId: string) => {
    const isSub = currentUser.subscribedChannelIds.includes(channelId);
    setCurrentUser((prev) => ({
      ...prev,
      subscribedChannelIds: isSub
        ? prev.subscribedChannelIds.filter((id) => id !== channelId)
        : [...prev.subscribedChannelIds, channelId],
    }));

    setVideos((prev) =>
      prev.map((v) => {
        if (v.channel.id === channelId) {
          return {
            ...v,
            channel: {
              ...v.channel,
              subscribers: isSub ? Math.max(0, v.channel.subscribers - 1) : v.channel.subscribers + 1,
            },
          };
        }
        return v;
      })
    );

    setCurrentVideo((prev) =>
      prev && prev.channel.id === channelId
        ? {
            ...prev,
            channel: {
              ...prev.channel,
              subscribers: isSub
                ? Math.max(0, prev.channel.subscribers - 1)
                : prev.channel.subscribers + 1,
            },
          }
        : prev
    );

    authService.toggleSubscription(currentUser.id, channelId).catch(() => {});
  };

  // Watch Later
  const handleToggleWatchLater = (videoId: string) => {
    const isSaved = currentUser.watchLaterIds.includes(videoId);
    setCurrentUser((prev) => ({
      ...prev,
      watchLaterIds: isSaved
        ? prev.watchLaterIds.filter((id) => id !== videoId)
        : [...prev.watchLaterIds, videoId],
    }));
  };

  // Comments & Replies
  const handleAddComment = (content: string, parentId?: string | null) => {
    if (!currentVideo) return;
    const vidId = currentVideo.id;

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      videoId: vidId,
      parentId: parentId || null,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        handle: currentUser.handle,
        avatarUrl: currentUser.avatarUrl,
        isCreator: currentVideo.channel.id === currentUser.id,
      },
      content,
      createdAt: 'Just now',
      likes: 0,
      replies: [],
    };

    setCommentsMap((prev) => {
      const currentList = prev[vidId] || [];
      if (!parentId) {
        return {
          ...prev,
          [vidId]: [newComment, ...currentList],
        };
      } else {
        const updated = currentList.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newComment],
            };
          }
          return c;
        });
        return {
          ...prev,
          [vidId]: updated,
        };
      }
    });

    commentService
      .addComment(vidId, content, newComment.author, parentId)
      .catch(() => {});
  };

  const handleLikeComment = (commentId: string, parentId?: string | null) => {
    if (!currentVideo) return;
    const vidId = currentVideo.id;

    setCommentsMap((prev) => {
      const list = prev[vidId] || [];
      const updated = list.map((c) => {
        if (!parentId) {
          if (c.id === commentId) {
            const nextLiked = !c.isLiked;
            return {
              ...c,
              isLiked: nextLiked,
              isDisliked: nextLiked ? false : c.isDisliked,
              likes: nextLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
            };
          }
          return c;
        } else {
          if (c.id === parentId && c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) => {
                if (r.id === commentId) {
                  const nextLiked = !r.isLiked;
                  return {
                    ...r,
                    isLiked: nextLiked,
                    isDisliked: nextLiked ? false : r.isDisliked,
                    likes: nextLiked ? r.likes + 1 : Math.max(0, r.likes - 1),
                  };
                }
                return r;
              }),
            };
          }
          return c;
        }
      });
      return {
        ...prev,
        [vidId]: updated,
      };
    });
  };

  const handleDislikeComment = (commentId: string, parentId?: string | null) => {
    if (!currentVideo) return;
    const vidId = currentVideo.id;

    setCommentsMap((prev) => {
      const list = prev[vidId] || [];
      const updated = list.map((c) => {
        if (!parentId) {
          if (c.id === commentId) {
            const nextDisliked = !c.isDisliked;
            const wasLiked = Boolean(c.isLiked);
            return {
              ...c,
              isDisliked: nextDisliked,
              isLiked: nextDisliked ? false : c.isLiked,
              likes: nextDisliked && wasLiked ? Math.max(0, c.likes - 1) : c.likes,
            };
          }
          return c;
        } else {
          if (c.id === parentId && c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) => {
                if (r.id === commentId) {
                  const nextDisliked = !r.isDisliked;
                  const wasLiked = Boolean(r.isLiked);
                  return {
                    ...r,
                    isDisliked: nextDisliked,
                    isLiked: nextDisliked ? false : r.isLiked,
                    likes: nextDisliked && wasLiked ? Math.max(0, r.likes - 1) : r.likes,
                  };
                }
                return r;
              }),
            };
          }
          return c;
        }
      });
      return {
        ...prev,
        [vidId]: updated,
      };
    });
  };

  const handleDeleteComment = (commentId: string, parentId?: string | null) => {
    if (!currentVideo) return;
    const vidId = currentVideo.id;

    setCommentsMap((prev) => {
      const list = prev[vidId] || [];
      if (!parentId) {
        return {
          ...prev,
          [vidId]: list.filter((c) => c.id !== commentId),
        };
      } else {
        return {
          ...prev,
          [vidId]: list.map((c) =>
            c.id === parentId
              ? { ...c, replies: (c.replies || []).filter((r) => r.id !== commentId) }
              : c
          ),
        };
      }
    });
  };

  const handleEditComment = (commentId: string, newContent: string, parentId?: string | null) => {
    if (!currentVideo) return;
    const vidId = currentVideo.id;

    setCommentsMap((prev) => {
      const list = prev[vidId] || [];
      if (!parentId) {
        return {
          ...prev,
          [vidId]: list.map((c) =>
            c.id === commentId ? { ...c, content: newContent, createdAt: 'Just now (edited)' } : c
          ),
        };
      } else {
        return {
          ...prev,
          [vidId]: list.map((c) =>
            c.id === parentId
              ? {
                  ...c,
                  replies: (c.replies || []).map((r) =>
                    r.id === commentId ? { ...r, content: newContent, createdAt: 'Just now (edited)' } : r
                  ),
                }
              : c
          ),
        };
      }
    });
  };

  // Video Upload
  const handleSaveUploadedVideo = (newVideo: Video) => {
    setVideos((prev) => [newVideo, ...prev]);
    setCurrentVideo(newVideo);
    window.location.hash = `video=${newVideo.id}`;
    setUploadModalOpen(false);
  };

  // Delete User Upload
  const handleDeleteUploadedVideo = async (videoId: string) => {
    await deleteUserVideoFromDB(videoId);
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    if (currentVideo?.id === videoId) {
      setCurrentVideo(null);
      window.location.hash = '';
    }
  };

  // Live Broadcast
  const handleStartBroadcast = (broadcastVideo: Video) => {
    setActiveBroadcastingVideo(broadcastVideo);
    setVideos((prev) => [broadcastVideo, ...prev.filter((v) => v.id !== broadcastVideo.id)]);
    setCurrentVideo(broadcastVideo);
    window.location.hash = `video=${broadcastVideo.id}`;
  };

  // Auth & Profile
  const handleOpenAuth = (tab: 'signin' | 'signup' = 'signin') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
  };

  const handleUpdateProfile = (updated: Partial<UserAccount>) => {
    if (updated.avatarUrl) {
      try {
        localStorage.setItem('viewtube_custom_avatar', updated.avatarUrl);
      } catch (e) {
        console.warn('LocalStorage avatar save error:', e);
      }
    }
    setCurrentUser((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  // Filtered video list for Feed / Search
  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      !searchQuery.trim() ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === 'live') {
      return matchesSearch && Boolean(video.isLive);
    }

    const matchesCategory =
      selectedCategory === 'All' || selectedCategory === 'Trending'
        ? true
        : selectedCategory === 'Live Now'
        ? Boolean(video.isLive)
        : selectedCategory === 'Your Uploads'
        ? Boolean(video.isUserUpload)
        : video.category.toLowerCase() === selectedCategory.toLowerCase() ||
          video.channel.name.toLowerCase() === selectedCategory.toLowerCase() ||
          Boolean(video.tags?.some((t) => t.toLowerCase() === selectedCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  // Subscribed Channels list
  const subscribedChannels = Array.from(
    new Map(
      videos
        .filter((v) => currentUser.subscribedChannelIds.includes(v.channel.id))
        .map((v) => [v.channel.id, v.channel])
    ).values()
  );

  const handleTabChange = (tab: ActiveNavTab, categoryName?: string) => {
    setActiveTab(tab);
    setCurrentVideo(null);
    if (tab === 'home') {
      setSelectedCategory('All');
      setSearchQuery('');
      window.location.hash = '';
    } else if (tab === 'live') {
      setSelectedCategory('Live Now');
      window.location.hash = 'live';
    } else if (tab === 'category' && categoryName) {
      setSelectedCategory(categoryName);
      window.location.hash = '';
    } else {
      window.location.hash = tab;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentVideo(null);
    setSearchQuery('');
    if (cat === 'Live Now') {
      setActiveTab('live');
      window.location.hash = 'live';
    } else if (cat === 'Your Uploads') {
      setActiveTab('my-videos');
      window.location.hash = 'my-videos';
    } else {
      setActiveTab('home');
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      selectedCategory={selectedCategory}
      onSelectCategory={handleSelectCategory}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      onCloseMobileSidebar={() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          setSidebarOpen(false);
        }
      }}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearchSubmit={handleSearchSubmit}
      allVideos={videos}
      onSelectVideo={handleSelectVideo}
      onOpenUpload={() => setUploadModalOpen(true)}
      onOpenLiveStudio={() => setLiveStudioOpen(true)}
      onOpenCastModal={() => setCastModalOpen(true)}
      onOpenAuth={handleOpenAuth}
      onOpenProfileModal={() => setProfileModalOpen(true)}
      onSignOut={() => {
        setCurrentUser((prev) => ({ ...prev, isLoggedIn: false }));
        setProfileModalOpen(false);
      }}
      currentUser={currentUser}
      darkMode={darkMode}
      onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      myVideosCount={videos.filter((v) => v.isUserUpload).length}
      liveVideosCount={videos.filter((v) => v.isLive).length}
      isWatching={Boolean(currentVideo)}
      hasLiveBroadcasting={Boolean(activeBroadcastingVideo)}
      isCastConnected={Boolean(connectedCastDevice)}
    >
      {/* Dynamic View Render */}
      {currentVideo ? (
        <WatchView
          video={currentVideo}
          allVideos={videos}
          comments={commentsMap[currentVideo.id] || []}
          liveChatMessages={liveChatMap[currentVideo.id] || []}
          currentUser={currentUser}
          onSelectVideo={handleSelectVideo}
          onToggleLikeVideo={handleToggleLikeVideo}
          onToggleDislikeVideo={handleToggleDislikeVideo}
          onToggleSubscribe={handleToggleSubscribe}
          onToggleWatchLater={handleToggleWatchLater}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
          onDislikeComment={handleDislikeComment}
          onDeleteComment={handleDeleteComment}
          onEditComment={handleEditComment}
          darkMode={darkMode}
          onOpenCastModal={() => setCastModalOpen(true)}
          isCastConnected={Boolean(connectedCastDevice)}
        />
      ) : activeTab === 'history' ? (
        <HistoryView
          allVideos={videos}
          historyVideoIds={currentUser.historyVideoIds || []}
          isHistoryPaused={Boolean(currentUser.isHistoryPaused)}
          onSelectVideo={handleSelectVideo}
          onRemoveFromHistory={handleRemoveFromHistory}
          onClearHistory={handleClearHistory}
          onTogglePauseHistory={handleTogglePauseHistory}
          onGoHome={() => handleTabChange('home')}
          darkMode={darkMode}
        />
      ) : activeTab === 'subscriptions' ? (
        <SubscriptionsPage
          videos={videos.filter((v) => currentUser.subscribedChannelIds.includes(v.channel.id))}
          subscribedChannels={subscribedChannels}
          onSelectVideo={handleSelectVideo}
          darkMode={darkMode}
          onToggleWatchLater={handleToggleWatchLater}
          watchLaterIds={currentUser.watchLaterIds}
        />
      ) : activeTab === 'my-videos' ? (
        <MyVideosPage
          videos={videos.filter((v) => v.isUserUpload)}
          onSelectVideo={handleSelectVideo}
          onDeleteVideo={handleDeleteUploadedVideo}
          onOpenUpload={() => setUploadModalOpen(true)}
          darkMode={darkMode}
          onToggleWatchLater={handleToggleWatchLater}
          watchLaterIds={currentUser.watchLaterIds}
        />
      ) : activeTab === 'liked-videos' ? (
        <LikedVideosPage
          videos={videos.filter((v) => currentUser.likedVideoIds.includes(v.id))}
          onSelectVideo={handleSelectVideo}
          darkMode={darkMode}
          onToggleWatchLater={handleToggleWatchLater}
          watchLaterIds={currentUser.watchLaterIds}
        />
      ) : activeTab === 'watch-later' ? (
        <WatchLaterPage
          videos={videos.filter((v) => currentUser.watchLaterIds.includes(v.id))}
          onSelectVideo={handleSelectVideo}
          darkMode={darkMode}
          onToggleWatchLater={handleToggleWatchLater}
          watchLaterIds={currentUser.watchLaterIds}
        />
      ) : activeTab === 'profile' ? (
        <ProfilePage
          currentUser={currentUser}
          userVideos={videos.filter((v) => v.channel.id === currentUser.id || v.isUserUpload)}
          onSelectVideo={handleSelectVideo}
          onOpenProfileModal={() => setProfileModalOpen(true)}
          onOpenAuthModal={handleOpenAuth}
          onOpenUploadModal={() => setUploadModalOpen(true)}
          onOpenLiveStudio={() => setLiveStudioOpen(true)}
          darkMode={darkMode}
          onToggleWatchLater={handleToggleWatchLater}
          watchLaterIds={currentUser.watchLaterIds}
        />
      ) : (
        <HomePage
          videos={filteredVideos}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          searchQuery={searchQuery}
          onClearSearch={() => {
            setSearchQuery('');
            window.location.hash = '';
          }}
          onSelectVideo={handleSelectVideo}
          darkMode={darkMode}
          onToggleWatchLater={handleToggleWatchLater}
          watchLaterIds={currentUser.watchLaterIds}
        />
      )}

      {/* Modals & Dialogs */}
      {uploadModalOpen && (
        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          currentUser={currentUser}
          onVideoUploaded={handleSaveUploadedVideo}
          darkMode={darkMode}
        />
      )}

      {liveStudioOpen && (
        <LiveStudioModal
          isOpen={liveStudioOpen}
          onClose={() => setLiveStudioOpen(false)}
          currentUser={currentUser}
          onStreamStarted={handleStartBroadcast}
          onStreamEnded={(savedVod) => {
            if (savedVod) {
              setVideos((prev) => [savedVod, ...prev]);
            }
            setActiveBroadcastingVideo(null);
          }}
          darkMode={darkMode}
        />
      )}

      {castModalOpen && (
        <CastReceiverModal
          isOpen={castModalOpen}
          onClose={() => setCastModalOpen(false)}
          activeVideo={currentVideo}
          connectedDevice={connectedCastDevice}
          onConnectDevice={(device) => setConnectedCastDevice(device)}
          darkMode={darkMode}
        />
      )}

      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialTab={authModalTab}
          onLoginSuccess={handleLoginSuccess}
          darkMode={darkMode}
        />
      )}

      {profileModalOpen && (
        <ProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={currentUser}
          onUpdateProfile={handleUpdateProfile}
          onSignOut={() => {
            setCurrentUser((prev) => ({ ...prev, isLoggedIn: false }));
            setProfileModalOpen(false);
          }}
          onOpenSwitchAccount={() => {
            setProfileModalOpen(false);
            setAuthModalTab('signin');
            setAuthModalOpen(true);
          }}
          onNavigateToTab={(tab) => {
            setProfileModalOpen(false);
            handleTabChange(tab);
          }}
          myVideosCount={videos.filter((v) => v.isUserUpload).length}
          darkMode={darkMode}
        />
      )}
    </MainLayout>
  );
}
