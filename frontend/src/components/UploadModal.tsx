import React, { useState, useRef } from 'react';
import {
  Upload,
  Video as VideoIcon,
  Camera,
  X,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  Clock,
  Play,
  Pause,
  StopCircle,
} from 'lucide-react';
import { Video, UserAccount } from '../types';
import { saveUserVideoToDB } from '../utils/indexedDB';
import { formatDuration } from '../utils/formatters';
import { extractVideoDuration } from '../utils/videoMetadata';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onVideoUploaded: (newVideo: Video) => void;
  darkMode: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onVideoUploaded,
  darkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  // Auto-extracted thumbnails from video frames
  const [extractedThumbnails, setExtractedThumbnails] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>('');
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState<string | null>(null);

  // Metadata form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [tagsInput, setTagsInput] = useState('tech, video, creator');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Webcam/Screen recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingErrorMessage, setRecordingErrorMessage] = useState('');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordVideoPreviewRef = useRef<HTMLVideoElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate thumbnail snapshots using hidden canvas
  const generateThumbnailsFromVideo = (videoEl: HTMLVideoElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dur = videoEl.duration || 5;
    const captureTimes = [0.5, dur * 0.35, dur * 0.7].filter((t) => t < dur);
    const thumbs: string[] = [];

    let idx = 0;
    const captureNext = () => {
      if (idx >= captureTimes.length) {
        if (thumbs.length > 0) {
          setExtractedThumbnails(thumbs);
          setSelectedThumbnail(thumbs[0]);
        }
        return;
      }
      videoEl.currentTime = captureTimes[idx];
    };

    videoEl.onseeked = () => {
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      thumbs.push(canvas.toDataURL('image/jpeg', 0.85));
      idx++;
      captureNext();
    };

    captureNext();
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please choose a valid video file (MP4, WebM, etc.)');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);

    // Default title from filename
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));

    // Load video to inspect duration & extract thumbnails
    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    tempVideo.crossOrigin = 'anonymous';
    tempVideo.preload = 'metadata';
    tempVideo.muted = true;
    tempVideo.onloadedmetadata = () => {
      const dur = tempVideo.duration;
      if (dur && isFinite(dur) && !isNaN(dur) && dur > 0) {
        setVideoDuration(Math.round(dur));
      }
      generateThumbnailsFromVideo(tempVideo);
    };

    // Also probe using the dedicated metadata extractor
    extractVideoDuration(url).then((exactDur) => {
      if (exactDur > 0) {
        setVideoDuration(exactDur);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Direct In-Browser Recording
  const startRecording = async (useScreen = false) => {
    try {
      let stream: MediaStream;
      if (useScreen && navigator.mediaDevices.getDisplayMedia) {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      }

      setMediaStream(stream);
      if (recordVideoPreviewRef.current) {
        recordVideoPreviewRef.current.srcObject = stream;
        recordVideoPreviewRef.current.play().catch(() => {});
      }

      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const recordedFile = new File([recordedBlob], `recording-${Date.now()}.webm`, {
          type: 'video/webm',
        });
        handleFileChange(recordedFile);
        stream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Media recording error', err);
      setRecordingErrorMessage(
        'Camera/microphone was restricted or not found in this environment. You can upload any video file or click "Load Sample Recording" below to test.'
      );
    }
  };

  const handleUseSampleRecording = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch('/videos/oceans.mp4');
      const blob = await res.blob();
      const sampleFile = new File([blob], `webcam-recording-${Date.now()}.mp4`, { type: 'video/mp4' });
      handleFileChange(sampleFile);
    } catch (err) {
      console.warn('Failed to load sample clip', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // Submit and save to IndexedDB
  const handleFinalUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setStatusMessage('Reading media stream...');
    setUploadProgress(20);

    await new Promise((r) => setTimeout(r, 400));
    setUploadProgress(50);
    setStatusMessage('Encoding video container...');

    await new Promise((r) => setTimeout(r, 500));
    setUploadProgress(85);
    setStatusMessage('Finalizing thumbnail and publishing...');

    const finalThumbnail =
      customThumbnailUrl ||
      selectedThumbnail ||
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80';

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const videoId = `user-vid-${Date.now()}`;
    let finalDur = videoDuration;
    if ((!finalDur || finalDur <= 0) && videoPreviewUrl) {
      finalDur = await extractVideoDuration(videoPreviewUrl);
    }
    if ((!finalDur || finalDur <= 0) && recordingSeconds > 0) {
      finalDur = recordingSeconds;
    }

    const meta: Omit<Video, 'id' | 'videoUrl' | 'thumbnailUrl'> = {
      title: title || 'Untitled User Video',
      description: description || 'Uploaded by user on ViewTube.',
      duration: Math.max(1, finalDur || 1),
      views: 1,
      createdAt: 'Just now',
      category: category || 'Technology',
      likes: 1,
      dislikes: 0,
      tags: tagsArray,
      isUserUpload: true,
      channel: {
        id: currentUser.id,
        name: currentUser.name,
        handle: currentUser.handle,
        avatarUrl: currentUser.avatarUrl,
        verified: false,
        subscribers: 120,
      },
    };

    try {
      const savedVideo = await saveUserVideoToDB(videoId, selectedFile, finalThumbnail, meta);
      setUploadProgress(100);
      setStatusMessage('Upload complete!');
      await new Promise((r) => setTimeout(r, 400));

      onVideoUploaded(savedVideo);
      onClose();
    } catch (err) {
      console.error('Failed to save user video', err);
      // Fallback
      const blobUrl = URL.createObjectURL(selectedFile);
      const fallbackVideo: Video = {
        ...meta,
        id: videoId,
        videoUrl: blobUrl,
        thumbnailUrl: finalThumbnail,
      };
      onVideoUploaded(fallbackVideo);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="upload-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 md:p-6 overflow-y-auto"
    >
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 ${
          darkMode ? 'bg-[#212121] border-neutral-700 text-neutral-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            darkMode ? 'border-neutral-700 bg-[#282828]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base">Creator Studio Upload</h2>
              <p className="text-xs text-neutral-400">Add videos to your ViewTube channel</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-700/50 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {!selectedFile ? (
            /* Upload or Record Picker */
            <div>
              <div className="flex gap-2 p-1 bg-neutral-800/40 rounded-xl mb-5 w-fit border border-neutral-700/40">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'upload' ? 'bg-blue-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab('record')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === 'record' ? 'bg-blue-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Quick Record
                </button>
              </div>

              {activeTab === 'upload' ? (
                /* Drag & Drop Area */
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                    darkMode
                      ? 'border-neutral-700 hover:border-blue-500 bg-neutral-800/30'
                      : 'border-slate-300 hover:border-blue-500 bg-slate-50'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-blue-600/10 text-blue-500 flex items-center justify-center mb-3">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">Drag and drop video files to upload</h3>
                  <p className="text-xs text-neutral-400 max-w-sm mb-4">
                    Your videos will be private until you publish them. Supports MP4, WebM, and MOV up to 4K resolution.
                  </p>
                  <button
                    type="button"
                    className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md"
                  >
                    Select Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  />
                </div>
              ) : (
                /* In-browser Recorder */
                <div className="space-y-4 text-center">
                  <div className="aspect-video w-full max-w-md mx-auto rounded-xl bg-black overflow-hidden relative flex items-center justify-center border border-neutral-700">
                    <video
                      ref={recordVideoPreviewRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!isRecording && !mediaStream && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 p-4">
                        <Camera className="w-10 h-10 mb-2 text-neutral-500" />
                        <span className="text-xs font-semibold">Record from your webcam or screen</span>
                      </div>
                    )}
                    {isRecording && (
                      <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600/90 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>REC 00:{recordingSeconds.toString().padStart(2, '0')}</span>
                      </div>
                    )}
                  </div>

                  {recordingErrorMessage && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs text-left max-w-md mx-auto">
                      <p>{recordingErrorMessage}</p>
                      <button
                        type="button"
                        onClick={handleUseSampleRecording}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors"
                      >
                        Load Sample Recording
                      </button>
                    </div>
                  )}

                  <div className="flex justify-center gap-3">
                    {!isRecording ? (
                      <>
                        <button
                          onClick={() => startRecording(false)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          Record Webcam
                        </button>
                        <button
                          onClick={() => startRecording(true)}
                          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-full flex items-center gap-1.5 border border-neutral-700 cursor-pointer"
                        >
                          <VideoIcon className="w-4 h-4 text-blue-400" />
                          Record Screen
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="px-5 py-2 bg-neutral-900 text-red-500 hover:bg-black text-xs font-bold rounded-full flex items-center gap-2 border border-red-500 shadow-md cursor-pointer animate-pulse"
                      >
                        <StopCircle className="w-4 h-4" />
                        Stop and Use Recording
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Video Details Form with Thumbnail Picker */
            <div className="space-y-5">
              {/* Top summary card */}
              <div className="flex gap-4 p-3 rounded-xl bg-neutral-800/40 border border-neutral-700/50 items-center">
                <div className="w-28 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 relative">
                  {videoPreviewUrl && (
                    <video src={videoPreviewUrl} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <div className="font-semibold truncate">{selectedFile.name}</div>
                  <div className="text-neutral-400 mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {formatDuration(videoDuration)}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setVideoPreviewUrl(null);
                    }}
                    className="text-red-400 hover:underline text-[11px] mt-1 inline-block"
                  >
                    Choose different file
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Video Title (Required)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add a title that describes your video"
                  className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 ${
                    darkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell viewers about your video (add timestamps like 0:15 for chapters)"
                  className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 resize-none ${
                    darkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              {/* Thumbnail Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Thumbnail
                </label>
                <p className="text-[11px] text-neutral-400 mb-2">
                  Select an auto-extracted frame from the video or upload a custom image.
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {extractedThumbnails.map((thumb, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedThumbnail(thumb);
                        setCustomThumbnailUrl(null);
                      }}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        selectedThumbnail === thumb && !customThumbnailUrl
                          ? 'border-blue-500 scale-105 shadow-md'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={thumb} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white px-1 rounded">
                        Frame {idx + 1}
                      </span>
                    </button>
                  ))}

                  {/* Custom upload thumbnail button */}
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className={`aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center p-1 transition-all ${
                      customThumbnailUrl
                        ? 'border-blue-500 overflow-hidden'
                        : darkMode
                        ? 'border-neutral-700 hover:border-neutral-500'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {customThumbnailUrl ? (
                      <img src={customThumbnailUrl} alt="Custom" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 text-neutral-400 mb-1" />
                        <span className="text-[10px] text-neutral-400">Custom image</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const r = new FileReader();
                        r.onload = () => setCustomThumbnailUrl(r.result as string);
                        r.readAsDataURL(f);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Category and Tags */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Music">Music</option>
                    <option value="Animation">Animation</option>
                    <option value="Education">Education</option>
                    <option value="Travel">Travel</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. gameplay, tutorial, 4k"
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              {/* Upload Progress Indicator */}
              {isProcessing && (
                <div className="space-y-1.5 p-3 rounded-xl bg-blue-600/10 border border-blue-500/30">
                  <div className="flex justify-between text-xs font-semibold text-blue-400">
                    <span>{statusMessage}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-700 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {selectedFile && (
          <div
            className={`px-6 py-3.5 flex items-center justify-between border-t ${
              darkMode ? 'border-neutral-700 bg-[#282828]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <span className="text-xs text-neutral-400">Visibility: Public</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold rounded-full hover:bg-neutral-700/50 text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalUpload}
                disabled={isProcessing || !title.trim()}
                className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
                  isProcessing || !title.trim()
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-md'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Publishing...' : 'Publish Video'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
