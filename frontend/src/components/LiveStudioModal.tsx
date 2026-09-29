import React, { useState, useRef, useEffect } from 'react';
import {
  Radio,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  X,
  Sparkles,
  Users,
  Clock,
  Heart,
  Settings2,
  CheckCircle2,
  Copy,
  StopCircle,
} from 'lucide-react';
import { Video, UserAccount, LiveChatMessage } from '../types';
import { saveUserVideoToDB } from '../utils/indexedDB';

interface LiveStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onStreamStarted: (liveVideo: Video) => void;
  onStreamEnded: (savedVodVideo?: Video) => void;
  darkMode: boolean;
}

export const LiveStudioModal: React.FC<LiveStudioModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStreamStarted,
  onStreamEnded,
  darkMode,
}) => {
  const [streamTitle, setStreamTitle] = useState('🔴 Live Coding & Community Hangout!');
  const [streamCategory, setStreamCategory] = useState('Technology');
  const [isLiveBroadcasting, setIsLiveBroadcasting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveViewers, setLiveViewers] = useState(14);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [streamKey] = useState(`live_${Math.random().toString(36).substring(2, 10)}`);
  const [copiedKey, setCopiedKey] = useState(false);
  const [currentLiveVideoId, setCurrentLiveVideoId] = useState<string | null>(null);

  // Broadcaster studio chat
  const [studioChat, setStudioChat] = useState<LiveChatMessage[]>([]);
  const [broadcasterInput, setBroadcasterInput] = useState('');

  // Media stream refs
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const viewersIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Setup media stream on open
  useEffect(() => {
    if (!isOpen) {
      cleanupStream();
      return;
    }

    initMediaStream();

    return () => {
      cleanupStream();
    };
  }, [isOpen]);

  const initMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Could not access camera/mic', err);
    }
  };

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (viewersIntervalRef.current) clearInterval(viewersIntervalRef.current);
    if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);
    setIsLiveBroadcasting(false);
    setElapsedSeconds(0);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Revert to camera
      initMediaStream();
      setIsScreenSharing(false);
    } else {
      try {
        if (navigator.mediaDevices.getDisplayMedia) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          if (streamRef.current) {
            // keep audio track
            const audioTracks = streamRef.current.getAudioTracks();
            if (audioTracks[0]) screenStream.addTrack(audioTracks[0]);
          }
          streamRef.current = screenStream;
          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = screenStream;
            videoPreviewRef.current.play().catch(() => {});
          }
          setIsScreenSharing(true);
        }
      } catch (err) {
        console.warn('Screen share cancelled', err);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMicMuted;
      });
      setIsMicMuted(!isMicMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = isVideoDisabled;
      });
      setIsVideoDisabled(!isVideoDisabled);
    }
  };

  // Start Broadcasting Live
  const handleStartBroadcasting = () => {
    setIsLiveBroadcasting(true);
    setElapsedSeconds(0);
    setLiveViewers(18);

    const vidId = `user-live-${Date.now()}`;
    setCurrentLiveVideoId(vidId);

    // Capture snapshot for thumbnail
    let thumbUrl = 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80';
    if (videoPreviewRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoPreviewRef.current, 0, 0, canvas.width, canvas.height);
          thumbUrl = canvas.toDataURL('image/jpeg', 0.8);
        }
      } catch (err) {
        // fallback to default
      }
    }

    const liveVideo: Video = {
      id: vidId,
      title: streamTitle,
      description: `Official live broadcast by ${currentUser.name} on ViewTube Studio. Welcome to the stream! Join the discussion in chat.`,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: thumbUrl,
      duration: 0,
      views: 18,
      createdAt: 'Streamed live right now',
      category: streamCategory,
      isLive: true,
      liveViewerCount: 18,
      likes: 12,
      dislikes: 0,
      tags: ['live', 'studio', streamCategory.toLowerCase()],
      isUserLive: true,
      channel: {
        id: currentUser.id,
        name: currentUser.name,
        handle: currentUser.handle,
        avatarUrl: currentUser.avatarUrl,
        verified: true,
        subscribers: 1540,
      },
    };

    onStreamStarted(liveVideo);

    // Start timer
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Simulate viewer fluctuation
    viewersIntervalRef.current = setInterval(() => {
      setLiveViewers((prev) => {
        const change = Math.floor(Math.random() * 7) - 2;
        return Math.max(8, prev + change);
      });
    }, 4000);

    // Initial studio chat
    const initialMsgs: LiveChatMessage[] = [
      {
        id: 'st-1',
        user: { id: 'bot-1', name: 'Lucas Scott', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
        text: 'Stream is looking super clean! Let’s go! 🚀',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: 'st-2',
        user: { id: 'bot-2', name: 'Chloe Wang', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
        text: 'Audio is coming in loud and clear! 🎧',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setStudioChat(initialMsgs);

    // Incoming audience chats
    chatIntervalRef.current = setInterval(() => {
      const commenters = [
        { name: 'Alex M.', text: 'Great explanation on that part!' },
        { name: 'DevSam', text: 'Can you show the terminal again?' },
        { name: 'Elena R.', text: 'Subscribed to the channel! Keep streaming!' },
        { name: 'Marcus_99', text: 'Where are you streaming from? 🙌' },
      ];
      const c = commenters[Math.floor(Math.random() * commenters.length)];
      setStudioChat((prev) => [
        ...prev.slice(-30),
        {
          id: `c-${Date.now()}`,
          user: {
            id: `usr-${c.name}`,
            name: c.name,
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          },
          text: c.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 5000);
  };

  // End Broadcasting
  const handleEndBroadcasting = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (viewersIntervalRef.current) clearInterval(viewersIntervalRef.current);
    if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);

    setIsLiveBroadcasting(false);

    // Save as VOD (Video on Demand)
    const vodVideo: Video = {
      id: `vod-${Date.now()}`,
      title: `${streamTitle} (VOD Archive)`,
      description: `Full recorded replay of the live broadcast streamed by ${currentUser.name}. Total stream time: ${Math.floor(
        elapsedSeconds / 60
      )}m ${elapsedSeconds % 60}s.`,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80',
      duration: Math.max(1, elapsedSeconds),
      views: liveViewers * 4 + 32,
      createdAt: 'Just now',
      category: streamCategory,
      likes: Math.max(15, Math.floor(liveViewers * 0.4)),
      dislikes: 0,
      tags: ['live', 'archive', 'vod'],
      isUserUpload: true,
      channel: {
        id: currentUser.id,
        name: currentUser.name,
        handle: currentUser.handle,
        avatarUrl: currentUser.avatarUrl,
        verified: true,
        subscribers: 1540,
      },
    };

    onStreamEnded(vodVideo);
    onClose();
  };

  const handleBroadcasterChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcasterInput.trim()) return;

    setStudioChat((prev) => [
      ...prev,
      {
        id: `bc-${Date.now()}`,
        user: {
          id: currentUser.id,
          name: currentUser.name,
          avatarUrl: currentUser.avatarUrl,
          isOwner: true,
          badge: 'HOST',
        },
        text: broadcasterInput.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setBroadcasterInput('');
  };

  const formatStreamClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div
      id="live-studio-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 md:p-6 overflow-y-auto"
    >
      <div
        className={`w-full max-w-4xl rounded-2xl shadow-2xl border flex flex-col overflow-hidden my-auto ${
          darkMode ? 'bg-[#181818] border-neutral-700 text-neutral-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Studio Top Bar */}
        <div
          className={`px-5 py-3.5 flex items-center justify-between border-b ${
            darkMode ? 'border-neutral-800 bg-[#202020]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm">ViewTube Live Studio</h2>
                {isLiveBroadcasting ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    LIVE • {formatStreamClock(elapsedSeconds)}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-neutral-700 text-neutral-300 font-medium text-[10px] uppercase">
                    Setup Mode
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">Manage stream feed, live chat, and audio/video input</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-700/50 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Layout: Video Stage + Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
          {/* Main Stage (2 Cols) */}
          <div className="lg:col-span-2 p-4 flex flex-col justify-between">
            {/* Live Camera / Monitor Viewport */}
            <div className="relative aspect-video rounded-xl bg-black overflow-hidden flex items-center justify-center border border-neutral-800 shadow-inner">
              <video
                ref={videoPreviewRef}
                playsInline
                muted // always mute local preview in studio to avoid audio feedback loops!
                className={`w-full h-full object-contain ${isVideoDisabled ? 'hidden' : ''}`}
              />

              {isVideoDisabled && (
                <div className="flex flex-col items-center justify-center text-neutral-500">
                  <VideoOff className="w-12 h-12 mb-2" />
                  <span className="text-xs">Camera feed is currently paused</span>
                </div>
              )}

              {/* Status overlays */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                {isLiveBroadcasting ? (
                  <div className="flex items-center gap-2 bg-red-600 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-md">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>ON AIR</span>
                  </div>
                ) : (
                  <div className="bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium backdrop-blur-xs">
                    Previewing
                  </div>
                )}
              </div>

              {isLiveBroadcasting && (
                <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-xs font-semibold">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>{liveViewers} Viewers</span>
                </div>
              )}

              {/* Mute indicator overlay */}
              {isMicMuted && (
                <div className="absolute bottom-3 left-3 bg-red-600/90 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                  <MicOff className="w-3 h-3" /> Muted
                </div>
              )}
            </div>

            {/* Studio Device Controls */}
            <div className="flex items-center justify-between mt-4 px-1">
              <div className="flex items-center gap-2">
                {/* Mic toggle */}
                <button
                  onClick={toggleMic}
                  className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
                    isMicMuted
                      ? 'bg-red-600 text-white border-red-600'
                      : darkMode
                      ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
                      : 'bg-slate-100 border-slate-300 hover:bg-slate-200'
                  }`}
                  title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Camera toggle */}
                <button
                  onClick={toggleVideo}
                  className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
                    isVideoDisabled
                      ? 'bg-red-600 text-white border-red-600'
                      : darkMode
                      ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
                      : 'bg-slate-100 border-slate-300 hover:bg-slate-200'
                  }`}
                  title={isVideoDisabled ? 'Turn camera on' : 'Turn camera off'}
                >
                  {isVideoDisabled ? <VideoOff className="w-4 h-4" /> : <VideoIcon className="w-4 h-4" />}
                </button>

                {/* Screen share toggle */}
                <button
                  onClick={toggleScreenShare}
                  className={`px-3 py-2 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isScreenSharing
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : darkMode
                      ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
                      : 'bg-slate-100 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>{isScreenSharing ? 'Stop Screen' : 'Share Screen'}</span>
                </button>
              </div>

              {/* Stream Action Button */}
              <div>
                {!isLiveBroadcasting ? (
                  <button
                    onClick={handleStartBroadcasting}
                    className="px-6 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Go Live Now</span>
                  </button>
                ) : (
                  <button
                    onClick={handleEndBroadcasting}
                    className="px-6 py-2 rounded-full bg-neutral-900 border border-red-500 hover:bg-red-950 text-red-400 font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span>End Stream</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Side Panel: Settings OR Studio Live Chat */}
          <div className="p-4 flex flex-col h-[480px]">
            {!isLiveBroadcasting ? (
              /* Setup Form */
              <div className="space-y-4 overflow-y-auto pr-1 text-xs">
                <div className="font-bold text-xs uppercase tracking-wider text-neutral-400 pb-1 border-b border-neutral-800">
                  Stream Settings
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Stream Title</label>
                  <input
                    type="text"
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    className={`w-full p-2 rounded-xl border focus:outline-none focus:border-red-500 ${
                      darkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Category</label>
                  <select
                    value={streamCategory}
                    onChange={(e) => setStreamCategory(e.target.value)}
                    className={`w-full p-2 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Music">Music</option>
                    <option value="Just Chatting">Just Chatting</option>
                    <option value="Education">Education</option>
                  </select>
                </div>

                {/* Simulated Stream Key for OBS / Hardware encoders */}
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    Stream Key (Optional for OBS)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      readOnly
                      value={streamKey}
                      className={`flex-1 p-2 rounded-xl border font-mono text-[11px] ${
                        darkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-400' : 'bg-slate-100 border-slate-300'
                      }`}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(streamKey);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="p-2 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white"
                      title="Copy Key"
                    >
                      {copiedKey ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-800/40 border border-neutral-700/50 space-y-1 text-neutral-400 text-[11px]">
                  <div className="font-semibold text-neutral-200">Browser Ingestion Ready</div>
                  <p>You can broadcast directly with your webcam and mic with zero software needed.</p>
                </div>
              </div>
            ) : (
              /* Broadcaster Live Chat & Stats */
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>Live Audience Chat</span>
                  </div>
                  <span className="text-[10px] text-green-400 font-semibold">Healthy Bitrate (60fps)</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-2 p-1 text-xs">
                  {studioChat.map((msg) => (
                    <div key={msg.id} className="leading-snug">
                      <span className="font-semibold text-neutral-400 text-[10px] mr-1.5">
                        {msg.timestamp}
                      </span>
                      <span
                        className={`font-bold text-xs mr-1 ${
                          msg.user.isOwner ? 'text-amber-400' : 'text-blue-400'
                        }`}
                      >
                        {msg.user.name}:
                      </span>
                      <span className="text-neutral-200">{msg.text}</span>
                    </div>
                  ))}
                </div>

                {/* Broadcaster Quick Response Bar */}
                <form onSubmit={handleBroadcasterChat} className="mt-2 flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Message your stream..."
                    value={broadcasterInput}
                    onChange={(e) => setBroadcasterInput(e.target.value)}
                    className={`flex-1 text-xs px-3 py-1.5 rounded-xl border focus:outline-none focus:border-red-500 ${
                      darkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
