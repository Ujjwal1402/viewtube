import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Radio,
  Settings,
  RotateCcw,
  PictureInPicture2,
  Loader2,
  AlertCircle,
  Volume1,
  RefreshCw,
  SkipForward,
  X,
  Cast,
} from 'lucide-react';
import { Video } from '../types';
import { formatDuration } from '../utils/formatters';

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
}

interface VideoPlayerProps {
  video: Video;
  isTheaterMode: boolean;
  onToggleTheater: () => void;
  darkMode: boolean;
  autoPlay?: boolean;
  onNextVideo?: () => void;
  nextVideo?: Video | null;
  isAutoplayEnabled?: boolean;
  onToggleAutoplay?: () => void;
  onOpenCastModal?: () => void;
  isCastConnected?: boolean;
}

const FALLBACK_STREAM_URLS = [
  '/videos/big_buck_bunny.mp4',
  '/videos/oceans.mp4',
  '/videos/sintel.mp4',
  '/videos/tears_of_steel.mp4',
  '/videos/elephants_dream.mp4',
  '/videos/flower.mp4',
];

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  (
    {
      video,
      isTheaterMode,
      onToggleTheater,
      darkMode,
      autoPlay = true,
      onNextVideo,
      nextVideo,
      isAutoplayEnabled = true,
      onToggleAutoplay,
      onOpenCastModal,
      isCastConnected = false,
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [currentSourceUrl, setCurrentSourceUrl] = useState<string>(video.videoUrl);
    const [fallbackIndex, setFallbackIndex] = useState<number>(0);
    const [isUsingCanvasFallback, setIsUsingCanvasFallback] = useState<boolean>(false);

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(video.duration || 0);
    const [volume, setVolume] = useState<number>(0.85);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [showControls, setShowControls] = useState<boolean>(true);
    const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
    const [isBuffering, setIsBuffering] = useState<boolean>(false);
    const [bufferedPercent, setBufferedPercent] = useState<number>(0);
    const [showUnmuteBanner, setShowUnmuteBanner] = useState<boolean>(false);
    const [playFeedbackIcon, setPlayFeedbackIcon] = useState<'play' | 'pause' | null>(null);
    const [autoplayCountdown, setAutoplayCountdown] = useState<number | null>(null);

    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const bufferingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const playPromiseRef = useRef<Promise<void> | null>(null);

    // Synchronize video props when changing to another video
    const [prevVideoId, setPrevVideoId] = useState(video.id);
    if (prevVideoId !== video.id) {
      setPrevVideoId(video.id);
      setCurrentSourceUrl(video.videoUrl);
      setFallbackIndex(0);
      setIsUsingCanvasFallback(false);
      setCurrentTime(0);
      setBufferedPercent(0);
      setShowUnmuteBanner(false);
      setAutoplayCountdown(null);
      setIsPlaying(false);
      setIsBuffering(false);
    }

    const handleClearBuffering = useCallback(() => {
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
        bufferingTimeoutRef.current = null;
      }
      setIsBuffering(false);
    }, []);

    const handleWaiting = useCallback(() => {
      // Only display the buffering overlay if stalled for more than 350ms
      if (!bufferingTimeoutRef.current) {
        bufferingTimeoutRef.current = setTimeout(() => {
          setIsBuffering(true);
        }, 350);
      }
    }, []);

    const handleProgress = useCallback(() => {
      const vid = videoRef.current;
      if (!vid || !vid.duration || vid.duration === 0) return;
      const current = vid.currentTime;
      const buffered = vid.buffered;
      for (let i = 0; i < buffered.length; i++) {
        if (buffered.start(i) <= current && current <= buffered.end(i) + 0.2) {
          setBufferedPercent((buffered.end(i) / vid.duration) * 100);
          handleClearBuffering();
          break;
        }
      }
    }, [handleClearBuffering]);

    // Robust play handler preventing race conditions and handling autoplay policies
    const safePlay = useCallback(async () => {
      const vid = videoRef.current;
      if (!vid) return;

      try {
        const promise = vid.play();
        playPromiseRef.current = promise;
        await promise;
        setIsPlaying(true);
        setIsBuffering(false);
      } catch (err: unknown) {
        const error = err as { name?: string; message?: string };
        // An AbortError occurs normally when playback is superseded by pause or source navigation
        if (error?.name === 'AbortError') {
          return;
        }

        // Browser restricted unmuted autoplay policy (requires user gesture for unmuted audio)
        if (error?.name === 'NotAllowedError') {
          vid.muted = true;
          setIsMuted(true);
          setShowUnmuteBanner(true);
          try {
            const mutedPromise = vid.play();
            playPromiseRef.current = mutedPromise;
            await mutedPromise;
            setIsPlaying(true);
            setIsBuffering(false);
          } catch (mutedErr: unknown) {
            const mErr = mutedErr as { name?: string };
            if (mErr?.name !== 'AbortError') {
              setIsPlaying(false);
              setIsBuffering(false);
            }
          }
        } else {
          setIsPlaying(false);
          setIsBuffering(false);
        }
      } finally {
        playPromiseRef.current = null;
      }
    }, []);

    // Robust pause handler that awaits in-flight play requests to avoid interruptions
    const safePause = useCallback(async () => {
      const vid = videoRef.current;
      if (!vid) return;

      // If a play() request is still resolving, wait for it before calling pause()
      if (playPromiseRef.current) {
        try {
          await playPromiseRef.current;
        } catch {
          // Play rejection handled in safePlay
        }
      }

      try {
        vid.pause();
      } catch {
        // Ignore pause errors
      }
      setIsPlaying(false);
    }, []);

    // Imperative handle for parent component seeking/control
    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(Math.max(0, seconds), duration || 99999);
          if (videoRef.current.paused) {
            safePlay();
          }
        }
      },
      play: () => {
        safePlay();
      },
      pause: () => {
        safePause();
      },
    }));

    // Initial load and autoplay trigger with non-blocking lifecycle
    useEffect(() => {
      let isCancelled = false;
      handleClearBuffering();

      if (autoPlay) {
        const timer = setTimeout(() => {
          if (!isCancelled) {
            safePlay();
          }
        }, 80);
        return () => {
          isCancelled = true;
          clearTimeout(timer);
        };
      } else {
        setIsBuffering(false);
      }

      return () => {
        isCancelled = true;
      };
    }, [video.id, currentSourceUrl, autoPlay, safePlay, handleClearBuffering]);

    // When video ends naturally
    const handleVideoEnded = () => {
      setIsPlaying(false);
      if (!video.isLive && isAutoplayEnabled && onNextVideo && nextVideo) {
        setAutoplayCountdown(5);
      }
    };

    // Countdown effect for autoplaying next video
    useEffect(() => {
      if (autoplayCountdown === null) return;
      if (autoplayCountdown <= 0) {
        setAutoplayCountdown(null);
        if (onNextVideo) {
          onNextVideo();
        }
        return;
      }

      const timer = setTimeout(() => {
        setAutoplayCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);

      return () => clearTimeout(timer);
    }, [autoplayCountdown, onNextVideo]);

    const handleCancelAutoplay = () => {
      setAutoplayCountdown(null);
    };

    const handlePlayNextImmediately = () => {
      setAutoplayCountdown(null);
      if (onNextVideo) {
        onNextVideo();
      }
    };

    // Handle Network or Decoding Error: auto switch to backup stream or canvas fallback
    const handleVideoError = () => {
      console.warn(`Video failed to load from ${currentSourceUrl}. Trying fallback...`);
      if (fallbackIndex < FALLBACK_STREAM_URLS.length) {
        const nextUrl = FALLBACK_STREAM_URLS[fallbackIndex];
        setFallbackIndex((prev) => prev + 1);
        setCurrentSourceUrl(nextUrl);
      } else {
        // Fallback to dynamic animated stream synthesizer
        console.warn('All remote video streams unavailable. Activating interactive Canvas Synthesizer.');
        setIsUsingCanvasFallback(true);
        setIsBuffering(false);
        setIsPlaying(true);
      }
    };

    // Canvas fallback generator if user is offline or remote CDN is blocked
    useEffect(() => {
      if (!isUsingCanvasFallback || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId: number;
      let frame = 0;

      const render = () => {
        frame++;
        const w = canvas.width;
        const h = canvas.height;

        // Animated gradient background
        const grad = ctx.createLinearGradient(
          0,
          0,
          w * Math.cos(frame * 0.01),
          h * Math.sin(frame * 0.01)
        );
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#1e1b4b');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Animated particles / waves
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < w; x += 10) {
          const y = h / 2 + Math.sin(x * 0.01 + frame * 0.04) * 40;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.beginPath();
        for (let x = 0; x < w; x += 10) {
          const y = h / 2 + Math.cos(x * 0.015 - frame * 0.03) * 50;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Pulsing Live Sphere
        const pulse = 40 + Math.sin(frame * 0.05) * 8;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, pulse, 0, Math.PI * 2);
        ctx.fill();

        // Title overlay
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(video.title, w / 2, h / 2 + 80);

        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Live Simulated Stream • 60 FPS HD', w / 2, h / 2 + 110);

        setCurrentTime((prev) => prev + 1 / 60);

        animationFrameId = requestAnimationFrame(render);
      };

      render();

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }, [isUsingCanvasFallback, video.title]);

    // Play/Pause Action
    const handlePlayPause = async () => {
      if (isUsingCanvasFallback) {
        setIsPlaying(!isPlaying);
        return;
      }

      if (!videoRef.current) return;
      if (videoRef.current.paused) {
        showActionFeedback('play');
        await safePlay();
      } else {
        showActionFeedback('pause');
        await safePause();
      }
    };

    const showActionFeedback = (type: 'play' | 'pause') => {
      setPlayFeedbackIcon(type);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => setPlayFeedbackIcon(null), 600);
    };

    // Keyboard Shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Ignore if user is typing in a textarea or input field
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        if (e.shiftKey && (e.key === 'N' || e.key === 'n')) {
          e.preventDefault();
          if (onNextVideo) {
            onNextVideo();
          }
        } else if (e.code === 'Space' || e.key === 'k') {
          e.preventDefault();
          handlePlayPause();
        } else if (e.key === 'm') {
          e.preventDefault();
          toggleMute();
        } else if (e.key === 'f') {
          e.preventDefault();
          toggleFullscreen();
        } else if (e.key === 'ArrowLeft' || e.key === 'j') {
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
          }
        } else if (e.key === 'ArrowRight' || e.key === 'l') {
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(
              duration,
              videoRef.current.currentTime + 5
            );
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    });

    const handleTimeUpdate = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
        handleProgress();
      }
    };

    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration || video.duration || 0);
        handleClearBuffering();
        handleProgress();
      }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const targetTime = parseFloat(e.target.value);
      if (videoRef.current) {
        videoRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      setVolume(val);
      if (videoRef.current) {
        videoRef.current.volume = val;
        setIsMuted(val === 0);
        videoRef.current.muted = val === 0;
      }
    };

    const toggleMute = () => {
      setShowUnmuteBanner(false);
      if (!videoRef.current) return;
      const nextMute = !isMuted;
      setIsMuted(nextMute);
      videoRef.current.muted = nextMute;
      if (nextMute) {
        videoRef.current.volume = 0;
      } else {
        videoRef.current.volume = volume || 0.8;
      }
    };

    const handleSpeedSelect = (speed: number) => {
      setPlaybackSpeed(speed);
      if (videoRef.current) {
        videoRef.current.playbackRate = speed;
      }
      setShowSpeedMenu(false);
    };

    const toggleFullscreen = () => {
      if (!containerRef.current) return;
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      } else {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    };

    const togglePiP = async () => {
      if (!videoRef.current) return;
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.warn('PiP error', err);
      }
    };

    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
          setShowSpeedMenu(false);
        }
      }, 3500);
    };

    return (
      <div
        ref={containerRef}
        id="video-player-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        onDoubleClick={toggleFullscreen}
        className={`relative w-full overflow-hidden bg-black flex items-center justify-center select-none shadow-2xl transition-all ${
          isTheaterMode
            ? 'max-h-[80vh] aspect-video sm:aspect-21/9 md:aspect-16/9'
            : 'rounded-2xl aspect-video'
        }`}
      >
        {/* HTML5 Video element */}
        {!isUsingCanvasFallback ? (
          <video
            ref={videoRef}
            key={`${video.id}-${currentSourceUrl}`}
            src={currentSourceUrl}
            poster={video.thumbnailUrl}
            playsInline
            preload="auto"
            muted={isMuted}
            loop={video.isLive}
            onClick={handlePlayPause}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onWaiting={handleWaiting}
            onPlaying={() => {
              setIsPlaying(true);
              handleClearBuffering();
            }}
            onPause={() => {
              setIsPlaying(false);
              handleClearBuffering();
            }}
            onCanPlay={handleClearBuffering}
            onCanPlayThrough={handleClearBuffering}
            onSeeked={handleClearBuffering}
            onProgress={handleProgress}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
            className="w-full h-full object-contain cursor-pointer"
          />
        ) : (
          /* Dynamic Canvas Fallback Stream (ensures video always plays) */
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            onClick={handlePlayPause}
            className="w-full h-full object-contain cursor-pointer"
          />
        )}

        {/* Loading / Buffering Spinner */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="p-4 rounded-full bg-black/60 backdrop-blur-xs text-red-500 animate-spin">
              <Loader2 className="w-10 h-10" />
            </div>
          </div>
        )}

        {/* Play/Pause Pulse feedback overlay */}
        {playFeedbackIcon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="p-5 rounded-full bg-black/70 backdrop-blur-xs text-white scale-125 animate-ping duration-300">
              {playFeedbackIcon === 'play' ? (
                <Play className="w-10 h-10 fill-current ml-1" />
              ) : (
                <Pause className="w-10 h-10 fill-current" />
              )}
            </div>
          </div>
        )}

        {/* Next Video Autoplay Countdown Overlay */}
        {autoplayCountdown !== null && nextVideo && (
          <div
            id="autoplay-countdown-overlay"
            className="absolute inset-0 bg-black/85 backdrop-blur-md z-40 flex flex-col items-center justify-center p-4 sm:p-6 text-white text-center"
          >
            <div className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>Up next in {autoplayCountdown}s</span>
            </div>

            {/* Next Video Preview Card */}
            <div
              onClick={handlePlayNextImmediately}
              className="flex items-center gap-3 bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-700/80 rounded-2xl p-3 max-w-md w-full shadow-2xl mb-5 text-left cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="relative w-28 sm:w-32 aspect-video rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0">
                <img
                  src={nextVideo.thumbnailUrl}
                  alt={nextVideo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                  <Play className="w-7 h-7 text-white fill-current drop-shadow" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                  {nextVideo.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 truncate">
                  {nextVideo.channel.name}
                </p>
              </div>
            </div>

            {/* Action Buttons: Cancel vs Play Now */}
            <div className="flex items-center gap-3">
              <button
                id="cancel-autoplay-button"
                onClick={handleCancelAutoplay}
                className="px-5 py-2 rounded-full border border-neutral-600 hover:border-neutral-400 hover:bg-white/10 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="play-next-immediately-button"
                onClick={handlePlayNextImmediately}
                className="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Now</span>
              </button>
            </div>
          </div>
        )}

        {/* Big Center Play Button Overlay on Pause */}
        {!isPlaying && !isBuffering && autoplayCountdown === null && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center backdrop-blur-xs shadow-2xl transition-all transform hover:scale-110 cursor-pointer z-20"
            aria-label="Play video"
          >
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
          </button>
        )}

        {/* Live indicator badge overlay at top-left */}
        {video.isLive && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-lg bg-red-600/90 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-xs shadow-lg">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>LIVE</span>
            {video.liveViewerCount && (
              <span className="text-white/80 font-normal ml-1">
                {video.liveViewerCount.toLocaleString()} watching
              </span>
            )}
          </div>
        )}

        {/* Unmute Prompt Banner if browser initiated muted autoplay */}
        {showUnmuteBanner && (
          <button
            onClick={toggleMute}
            className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-xl transition-all cursor-pointer animate-bounce"
          >
            <VolumeX className="w-4 h-4 text-red-500" />
            <span>Tap to unmute</span>
          </button>
        )}

        {/* Custom Video Controls Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 sm:p-4 pt-10 transition-opacity duration-300 z-30 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Seek Bar (Progress Track with Buffer Indicator) */}
          {!video.isLive ? (
            <div className="relative group/track mb-2.5 h-1.5 hover:h-2.5 flex items-center transition-all cursor-pointer">
              {/* Total Track Background */}
              <div className="absolute inset-0 bg-white/20 rounded-full" />
              {/* Buffered Range Bar (YouTube-style semi-transparent white) */}
              <div
                className="absolute inset-y-0 left-0 bg-white/40 rounded-full pointer-events-none transition-all duration-150"
                style={{ width: `${Math.min(100, Math.max(0, bufferedPercent))}%` }}
              />
              {/* Played Progress Bar (Red) */}
              <div
                className="absolute inset-y-0 left-0 bg-red-600 rounded-full pointer-events-none"
                style={{ width: `${Math.min(100, (currentTime / (duration || 1)) * 100)}%` }}
              />
              {/* Native range input on top for precise scrubbing and accessibility */}
              <input
                id="video-seek-slider"
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="relative z-10 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2 select-none">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">
                Live Broadcast • Real-time Stream
              </span>
            </div>
          )}

          {/* Bottom Controls Row */}
          <div className="flex items-center justify-between text-white text-xs">
            {/* Left Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handlePlayPause}
                className="p-1.5 hover:text-red-500 transition-colors cursor-pointer"
                title={isPlaying ? 'Pause (k / space)' : 'Play (k / space)'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current" />
                )}
              </button>

              {/* Next Video Button */}
              {onNextVideo && (
                <button
                  id="player-next-video-button"
                  onClick={onNextVideo}
                  className="p-1.5 text-neutral-300 hover:text-white hover:text-red-500 transition-colors cursor-pointer"
                  title={nextVideo ? `Next video (Shift+N): ${nextVideo.title}` : 'Next video (Shift+N)'}
                  aria-label="Next video"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>
              )}

              {/* Volume Slider & Toggle */}
              <div className="flex items-center gap-1.5 group/vol">
                <button
                  onClick={toggleMute}
                  className="p-1.5 hover:text-red-500 transition-colors cursor-pointer"
                  title="Mute (m)"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-red-400" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-14 sm:w-20 h-1 bg-white/30 rounded-lg appearance-none accent-white cursor-pointer"
                />
              </div>

              {/* Time display */}
              <div className="text-neutral-300 font-mono text-[11px] select-none">
                {video.isLive ? (
                  <span className="text-red-500 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> LIVE
                  </span>
                ) : (
                  <span>
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                  </span>
                )}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 relative">
              {/* Autoplay Toggle Switch */}
              {onToggleAutoplay && (
                <button
                  id="player-autoplay-toggle"
                  onClick={onToggleAutoplay}
                  className="p-1.5 hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1.5 text-neutral-300 hover:text-white"
                  title={isAutoplayEnabled ? 'Autoplay is on' : 'Autoplay is off'}
                  aria-label={isAutoplayEnabled ? 'Disable autoplay' : 'Enable autoplay'}
                >
                  <span className="text-[10px] hidden md:inline font-medium">Autoplay</span>
                  <div
                    className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                      isAutoplayEnabled ? 'bg-red-600' : 'bg-neutral-600'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white transition-transform ${
                        isAutoplayEnabled ? 'translate-x-3' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
              )}

              {/* Playback Speed Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="px-2 py-1 rounded hover:bg-white/10 text-neutral-300 hover:text-white font-medium text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                  title="Playback Speed"
                >
                  <Settings className="w-4 h-4" />
                  <span>{playbackSpeed}x</span>
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-10 right-0 bg-[#282828] border border-neutral-700 rounded-xl p-1 shadow-2xl z-50 min-w-28 text-neutral-200">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase text-neutral-400 border-b border-neutral-700 mb-1">
                      Playback Speed
                    </div>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => handleSpeedSelect(spd)}
                        className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-neutral-700 transition-colors flex items-center justify-between ${
                          playbackSpeed === spd ? 'text-red-500 font-bold' : ''
                        }`}
                      >
                        <span>{spd === 1 ? 'Normal' : `${spd}x`}</span>
                        {playbackSpeed === spd && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cast / Device Receiver Button */}
              {onOpenCastModal && (
                <button
                  id="player-cast-button"
                  onClick={onOpenCastModal}
                  className={`p-1.5 transition-colors cursor-pointer ${
                    isCastConnected ? 'text-red-500' : 'hover:text-red-500 text-neutral-300 hover:text-white'
                  }`}
                  title={isCastConnected ? 'Connected to Cast Receiver' : 'Cast to TV / Receiver'}
                  aria-label="Cast to TV or Receiver"
                >
                  <Cast className="w-4 h-4" />
                </button>
              )}

              {/* Picture in Picture */}
              <button
                onClick={togglePiP}
                className="p-1.5 hover:text-red-500 transition-colors cursor-pointer"
                title="Picture in picture"
              >
                <PictureInPicture2 className="w-4 h-4" />
              </button>

              {/* Theater Mode Toggle */}
              <button
                onClick={onToggleTheater}
                className={`p-1.5 hover:text-red-500 transition-colors cursor-pointer hidden sm:block ${
                  isTheaterMode ? 'text-red-500' : 'text-neutral-300'
                }`}
                title={isTheaterMode ? 'Default view' : 'Theater mode'}
              >
                <div
                  className={`w-4 h-3 border-2 ${
                    isTheaterMode ? 'border-red-500' : 'border-current'
                  } rounded-xs`}
                />
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 hover:text-red-500 transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit fullscreen (f)' : 'Fullscreen (f)'}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
