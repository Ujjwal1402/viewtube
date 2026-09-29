import React, { useState } from 'react';
import { X, Copy, CheckCircle2, Share2, Code } from 'lucide-react';
import { Video } from '../types';
import { formatDuration } from '../utils/formatters';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video;
  currentPlaybackTime: number;
  darkMode: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  video,
  currentPlaybackTime,
  darkMode,
}) => {
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'embed'>('link');

  if (!isOpen) return null;

  const baseUrl = window.location.origin + window.location.pathname;
  const timestampParam = includeTimestamp ? `?t=${Math.floor(currentPlaybackTime)}s` : '';
  const shareUrl = `${baseUrl}#video=${video.id}${timestampParam}`;

  const embedCode = `<iframe width="560" height="315" src="${shareUrl}" title="${video.title}" frameborder="0" allowfullscreen></iframe>`;

  const copyTextSafely = (text: string): boolean => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopy(text);
      });
      return true;
    }
    return fallbackCopy(text);
  };

  const fallbackCopy = (text: string): boolean => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  };

  const handleCopyLink = () => {
    copyTextSafely(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    copyTextSafely(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <div
      id="share-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
    >
      <div
        className={`w-full max-w-md rounded-2xl p-5 shadow-2xl border ${
          darkMode ? 'bg-[#212121] border-neutral-700 text-neutral-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-700/50">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Share2 className="w-4 h-4 text-blue-500" />
            <span>Share Video</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-neutral-700/50 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mt-4 p-1 bg-neutral-800/40 rounded-xl border border-neutral-700/40 w-fit text-xs">
          <button
            onClick={() => setActiveTab('link')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'link' ? 'bg-blue-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Direct Link
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
              activeTab === 'embed' ? 'bg-blue-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Embed
          </button>
        </div>

        {activeTab === 'link' ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className={`w-full p-2 text-xs rounded-xl border font-mono select-all ${
                  darkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-50 border-slate-300'
                }`}
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 flex-shrink-0"
              >
                {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Checkbox for start at current time */}
            {!video.isLive && (
              <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={includeTimestamp}
                  onChange={(e) => setIncludeTimestamp(e.target.checked)}
                  className="rounded accent-blue-600"
                />
                <span>Start at {formatDuration(currentPlaybackTime)}</span>
              </label>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <textarea
              readOnly
              rows={3}
              value={embedCode}
              className={`w-full p-2 text-xs rounded-xl border font-mono select-all ${
                darkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-50 border-slate-300'
              }`}
            />
            <button
              onClick={handleCopyEmbed}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              {copiedEmbed ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedEmbed ? 'Embed Code Copied' : 'Copy Embed Code'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
