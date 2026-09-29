import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  AtSign,
  Mail,
  Camera,
  Check,
  Video,
  ThumbsUp,
  History,
  Tv,
  LogOut,
  UserCheck,
  Save,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { UserAccount } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onUpdateProfile: (updated: Partial<UserAccount>) => void;
  onSignOut: () => void;
  onOpenSwitchAccount: () => void;
  onNavigateToTab: (tab: any) => void;
  myVideosCount: number;
  darkMode: boolean;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
  onSignOut,
  onOpenSwitchAccount,
  onNavigateToTab,
  myVideosCount,
  darkMode,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(user.name);
    setHandle(user.handle);
    setBio(user.bio || '');
    // Check if custom avatar is stored
    const storedCustom = localStorage.getItem('viewtube_custom_avatar');
    setAvatarUrl(storedCustom || user.avatarUrl);
  }, [user]);

  if (!isOpen) return null;

  // Process chosen image from device: downscale for clean avatar and store as data URL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Image size exceeds 15MB. Please choose a smaller photo.');
      return;
    }
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        try {
          // Crop square to 360x360 for high quality profile image with small storage footprint
          const canvas = document.createElement('canvas');
          const maxDim = 360;
          canvas.width = maxDim;
          canvas.height = maxDim;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            const minSide = Math.min(img.width, img.height);
            const startX = (img.width - minSide) / 2;
            const startY = (img.height - minSide) / 2;
            ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, maxDim, maxDim);
            const optimized = canvas.toDataURL('image/jpeg', 0.88);
            applyNewAvatar(optimized);
          } else {
            applyNewAvatar(dataUrl);
          }
        } catch {
          applyNewAvatar(dataUrl);
        }
      };
      img.onerror = () => {
        setUploadError('Failed to load image. Please try another photo.');
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setUploadError('Failed to read image from device.');
    };
    reader.readAsDataURL(file);
  };

  const applyNewAvatar = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
    setUploadSuccess('Profile picture updated!');
    setUploadError(null);

    // Save selected profile image to localStorage so it remains available after reopening the website
    try {
      localStorage.setItem('viewtube_custom_avatar', newAvatarUrl);
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    onUpdateProfile({ avatarUrl: newAvatarUrl });

    setTimeout(() => {
      setUploadSuccess(null);
    }, 3000);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input so same file can be re-selected if wanted
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleResetToDefault = () => {
    const defaultUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    setAvatarUrl(defaultUrl);
    try {
      localStorage.removeItem('viewtube_custom_avatar');
    } catch {}
    onUpdateProfile({ avatarUrl: defaultUrl });
    setUploadSuccess('Reverted to default avatar.');
    setTimeout(() => setUploadSuccess(null), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let cleanHandle = handle.trim();
    if (!cleanHandle.startsWith('@')) {
      cleanHandle = `@${cleanHandle}`;
    }

    const finalAvatar = avatarUrl.trim() || user.avatarUrl;

    try {
      localStorage.setItem('viewtube_custom_avatar', finalAvatar);
    } catch {}

    onUpdateProfile({
      name: name.trim(),
      handle: cleanHandle,
      bio: bio.trim(),
      avatarUrl: finalAvatar,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 700);
  };

  const isCustomImage = avatarUrl.startsWith('data:image/');

  return (
    <div
      id="profile-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="profile-modal"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden relative max-h-[92vh] flex flex-col ${
          darkMode ? 'bg-[#1e1e1e] text-white border-[#333333]' : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Banner Area */}
        <div className="relative h-28 sm:h-32 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 overflow-hidden flex-shrink-0">
          {user.bannerUrl && (
            <img
              src={user.bannerUrl}
              alt="Channel Banner"
              className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden Device File Input */}
        <input
          id="profile-image-file-input"
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Scrollable Modal Content */}
        <div className="px-6 pb-6 pt-0 relative overflow-y-auto flex-1">
          {/* Avatar and Action Controls */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-4 gap-3">
            <div className="relative inline-block group">
              <img
                src={avatarUrl || user.avatarUrl}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-[#1e1e1e] shadow-xl bg-neutral-800"
              />
              <button
                type="button"
                id="btn-trigger-avatar-change"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute bottom-1 right-1 p-2 rounded-full bg-red-600 text-white shadow-md hover:bg-red-500 transition-all hover:scale-110 cursor-pointer"
                title="Change or upload profile picture"
                aria-label="Upload profile picture"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-upload-direct"
                onClick={() => {
                  setShowAvatarPicker(true);
                  fileInputRef.current?.click();
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Upload image from device"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>

              {!isEditing ? (
                <button
                  type="button"
                  id="btn-edit-profile"
                  onClick={() => setIsEditing(true)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    darkMode
                      ? 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white'
                      : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                id="btn-switch-account"
                onClick={() => {
                  onClose();
                  onOpenSwitchAccount();
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  darkMode
                    ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-300'
                    : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
                title="Switch or add another account"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Switch</span>
              </button>

              <button
                type="button"
                id="btn-signout"
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Sign out of ViewTube"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {uploadSuccess && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {uploadError && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Profile Image Upload & Picker Drawer */}
          {showAvatarPicker && (
            <div
              className={`p-4 rounded-xl border mb-4 animate-in fade-in ${
                darkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-xs font-semibold mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-neutral-200">
                  <ImageIcon className="w-4 h-4 text-red-500" />
                  <span>Custom Profile Picture</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-[11px] text-neutral-400 hover:text-white hover:underline cursor-pointer"
                >
                  Done
                </button>
              </div>

              {/* Device Image Drag & Drop / Upload Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? 'border-red-500 bg-red-500/10 scale-[1.01]'
                    : darkMode
                    ? 'border-neutral-700 hover:border-red-500/60 hover:bg-neutral-800/60 bg-neutral-950/40'
                    : 'border-slate-300 hover:border-red-500/60 hover:bg-slate-100 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-red-600/15 flex items-center justify-center text-red-500">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-200">
                    Click to upload image from your device
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    or drag & drop your photo here (PNG, JPG, WebP)
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-1 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold transition-colors"
                >
                  Browse Device Files
                </button>
              </div>

              {/* Current Image Info & Reset Options */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800 text-[11px]">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <span>Current:</span>
                  <span className="font-semibold text-neutral-200">
                    {isCustomImage ? 'Custom device photo' : 'Default / Preset avatar'}
                  </span>
                </div>
                {isCustomImage && (
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-neutral-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Revert to standard default avatar"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Default</span>
                  </button>
                )}
              </div>

              {/* Default / Preset Avatars Carousel */}
              <div className="mt-3">
                <span className="block text-[11px] font-semibold text-neutral-400 mb-2">
                  Or select a preset avatar:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Preset ${i + 1}`}
                      onClick={() => {
                        setAvatarUrl(url);
                        try {
                          localStorage.setItem('viewtube_custom_avatar', url);
                        } catch {}
                        onUpdateProfile({ avatarUrl: url });
                        setUploadSuccess(`Preset avatar ${i + 1} selected!`);
                        setTimeout(() => setUploadSuccess(null), 2000);
                      }}
                      className={`w-9 h-9 rounded-full object-cover cursor-pointer transition-all flex-shrink-0 ${
                        avatarUrl === url
                          ? 'ring-2 ring-red-500 scale-105'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Profile Edit Mode vs View Mode */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Display Name
                </label>
                <div
                  className={`flex items-center px-3 h-9 rounded-xl border ${
                    darkMode ? 'bg-[#121212] border-neutral-700' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-neutral-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Channel Handle
                </label>
                <div
                  className={`flex items-center px-3 h-9 rounded-xl border ${
                    darkMode ? 'bg-[#121212] border-neutral-700' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <AtSign className="w-3.5 h-3.5 text-neutral-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full bg-transparent text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Channel Description / Bio
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio with viewers..."
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none resize-none ${
                    darkMode ? 'bg-[#121212] border-neutral-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAvatarPicker(true);
                    fileInputRef.current?.click();
                  }}
                  className="px-3 h-9 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>

                <button
                  type="submit"
                  id="btn-save-profile"
                  className="flex-1 h-9 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <span className="text-xs font-medium text-neutral-400">{user.handle}</span>
              </div>

              {user.email && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
                  <Mail className="w-3 h-3 text-neutral-500" />
                  <span>{user.email}</span>
                </div>
              )}

              {user.bio ? (
                <p className="text-xs text-neutral-300 mt-2.5 leading-relaxed bg-neutral-800/40 p-2.5 rounded-xl border border-neutral-700/30">
                  {user.bio}
                </p>
              ) : (
                <p className="text-xs text-neutral-500 mt-2 italic">
                  No channel bio yet. Click "Edit Profile" to add one!
                </p>
              )}

              {/* Channel Metrics Bento Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToTab('my-videos');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
                    darkMode ? 'border-neutral-800 bg-neutral-900/60' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-red-500 text-[11px] font-semibold mb-1">
                    <Video className="w-3.5 h-3.5" />
                    <span>Uploads</span>
                  </div>
                  <div className="text-base font-bold">{myVideosCount}</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToTab('subscriptions');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
                    darkMode ? 'border-neutral-800 bg-neutral-900/60' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-blue-400 text-[11px] font-semibold mb-1">
                    <Tv className="w-3.5 h-3.5" />
                    <span>Channels</span>
                  </div>
                  <div className="text-base font-bold">{user.subscribedChannelIds?.length || 0}</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToTab('liked-videos');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
                    darkMode ? 'border-neutral-800 bg-neutral-900/60' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold mb-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Liked</span>
                  </div>
                  <div className="text-base font-bold">{user.likedVideoIds?.length || 0}</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToTab('history');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
                    darkMode ? 'border-neutral-800 bg-neutral-900/60' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-purple-400 text-[11px] font-semibold mb-1">
                    <History className="w-3.5 h-3.5" />
                    <span>History</span>
                  </div>
                  <div className="text-base font-bold">{user.historyVideoIds?.length || 0}</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
