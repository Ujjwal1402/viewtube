import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Heart,
  Pin,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  MoreVertical,
  Trash2,
  Edit2,
  Check,
  Smile,
  ArrowUpDown,
} from 'lucide-react';
import { Comment, UserAccount, Channel } from '../types';
import { parseTimestampToSeconds } from '../utils/formatters';

interface CommentsSectionProps {
  videoId: string;
  comments: Comment[];
  currentUser: UserAccount;
  channel: Channel;
  onAddComment: (content: string, parentId?: string | null) => void;
  onLikeComment: (commentId: string, parentId?: string | null) => void;
  onDislikeComment: (commentId: string, parentId?: string | null) => void;
  onDeleteComment: (commentId: string, parentId?: string | null) => void;
  onEditComment: (commentId: string, newContent: string, parentId?: string | null) => void;
  onSeekToTimestamp: (seconds: number) => void;
  darkMode: boolean;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  videoId,
  comments,
  currentUser,
  channel,
  onAddComment,
  onLikeComment,
  onDislikeComment,
  onDeleteComment,
  onEditComment,
  onSeekToTimestamp,
  darkMode,
}) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const quickEmojis = ['🔥', '❤️', '👏', '😂', '🚀', '✨', '🤯', '💯'];

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handlePostMainComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(newCommentText.trim(), null);
    setNewCommentText('');
    setIsInputFocused(false);
  };

  const handlePostReply = (parentId: string) => {
    if (!replyText.trim()) return;
    onAddComment(replyText.trim(), parentId);
    setReplyText('');
    setReplyingToId(null);
    setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.content);
  };

  const handleSaveEdit = (commentId: string, parentId?: string | null) => {
    if (!editText.trim()) return;
    onEditComment(commentId, editText.trim(), parentId);
    setEditingCommentId(null);
  };

  // Render comment text with clickable timestamps
  const renderFormattedContent = (content: string) => {
    // Regex matches 0:00 or 00:00 or 0:00:00
    const parts = content.split(/(\b\d{1,2}:\d{2}(?::\d{2})?\b)/g);
    return (
      <span>
        {parts.map((part, index) => {
          const seconds = parseTimestampToSeconds(part);
          if (seconds !== null) {
            return (
              <button
                key={index}
                type="button"
                onClick={() => onSeekToTimestamp(seconds)}
                className="text-blue-500 hover:text-blue-400 hover:underline font-mono font-medium inline-block px-1 py-0.5 rounded bg-blue-500/10 transition-colors mx-0.5"
                title={`Jump to ${part}`}
              >
                {part}
              </button>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  };

  // Sort logic (pinned comments always on top)
  const sortedComments = [...comments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (sortBy === 'top') {
      return b.likes - a.likes;
    }
    // 'newest' sort
    return b.id.localeCompare(a.id);
  });

  const totalCommentCount = comments.reduce(
    (acc, curr) => acc + 1 + (curr.replies ? curr.replies.length : 0),
    0
  );

  return (
    <section id="comments-section" className="mt-6">
      {/* Header with Total Count and Sort Filter */}
      <div className="flex items-center gap-6 mb-5">
        <h2 className="text-lg md:text-xl font-bold tracking-tight">
          {totalCommentCount.toLocaleString()} {totalCommentCount === 1 ? 'Comment' : 'Comments'}
        </h2>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            id="btn-sort-comments"
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className={`flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              darkMode ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Sort by</span>
          </button>

          {sortDropdownOpen && (
            <div
              className={`absolute left-0 mt-1 w-40 rounded-xl shadow-xl border py-1.5 z-40 ${
                darkMode ? 'bg-[#282828] border-neutral-700 text-neutral-200' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <button
                onClick={() => {
                  setSortBy('top');
                  setSortDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                  sortBy === 'top' ? 'font-bold text-red-500' : darkMode ? 'hover:bg-neutral-700' : 'hover:bg-slate-100'
                }`}
              >
                <span>Top comments</span>
                {sortBy === 'top' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setSortBy('newest');
                  setSortDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                  sortBy === 'newest' ? 'font-bold text-red-500' : darkMode ? 'hover:bg-neutral-700' : 'hover:bg-slate-100'
                }`}
              >
                <span>Newest first</span>
                {sortBy === 'newest' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Comment Input Box */}
      <div className="flex gap-3 mb-8">
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-1 ring-neutral-700"
        />

        <div className="flex-1 min-w-0">
          <form onSubmit={handlePostMainComment}>
            <textarea
              id="main-comment-input"
              rows={isInputFocused || newCommentText ? 3 : 1}
              placeholder="Add a comment... (use timestamps like 0:45 to link video moments)"
              value={newCommentText}
              onFocus={() => setIsInputFocused(true)}
              onChange={(e) => setNewCommentText(e.target.value)}
              className={`w-full bg-transparent text-sm border-b transition-all resize-none focus:outline-none p-1 placeholder:text-neutral-500 ${
                isInputFocused
                  ? 'border-blue-500'
                  : darkMode
                  ? 'border-neutral-700 hover:border-neutral-500'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            />

            {/* Quick Emoji Bar & Action Buttons */}
            {(isInputFocused || newCommentText) && (
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-neutral-400 mr-1 flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5" />
                  </span>
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewCommentText((prev) => prev + emoji)}
                      className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                        darkMode ? 'hover:bg-neutral-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewCommentText('');
                      setIsInputFocused(false);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                      darkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      newCommentText.trim()
                        ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-xs'
                        : darkMode
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Comment
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Comment List */}
      <div className="space-y-6">
        {sortedComments.length === 0 ? (
          <div className="text-center py-10 text-neutral-400 text-sm">
            No comments yet. Be the first to start the conversation!
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div key={comment.id} id={`comment-thread-${comment.id}`} className="flex gap-3 text-sm group">
              <img
                src={comment.author.avatarUrl}
                alt={comment.author.name}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-1 ring-neutral-700/50"
              />

              <div className="flex-1 min-w-0">
                {/* Pinned Badge */}
                {comment.isPinned && (
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-semibold mb-1">
                    <Pin className="w-3.5 h-3.5 fill-current rotate-45 text-neutral-400" />
                    <span>Pinned by {channel.name}</span>
                  </div>
                )}

                {/* Author Info */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-semibold text-xs ${
                      comment.author.isCreator
                        ? 'bg-neutral-700/80 px-2 py-0.5 rounded-full text-white'
                        : darkMode
                        ? 'text-neutral-200'
                        : 'text-slate-800'
                    }`}
                  >
                    {comment.author.name}
                  </span>
                  <span className="text-neutral-400 text-xs">{comment.author.handle}</span>
                  <span className="text-neutral-500 text-xs">• {comment.createdAt}</span>
                </div>

                {/* Content / Edit Mode */}
                {editingCommentId === comment.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      rows={2}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className={`w-full p-2 text-xs rounded-lg border focus:outline-none ${
                        darkMode ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(comment.id, null)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="px-3 py-1 text-xs text-neutral-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={`mt-1 text-xs md:text-sm leading-relaxed ${darkMode ? 'text-neutral-200' : 'text-slate-800'}`}>
                    {renderFormattedContent(comment.content)}
                  </p>
                )}

                {/* Action Buttons Row */}
                <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                  {/* Like Button */}
                  <button
                    onClick={() => onLikeComment(comment.id, null)}
                    className={`flex items-center gap-1.5 p-1 rounded-full transition-colors ${
                      comment.isLiked ? 'text-blue-500 font-bold' : 'hover:text-neutral-200'
                    }`}
                    title="Like"
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                    <span>{comment.likes > 0 && comment.likes.toLocaleString()}</span>
                  </button>

                  {/* Dislike Button */}
                  <button
                    onClick={() => onDislikeComment(comment.id, null)}
                    className={`p-1 rounded-full transition-colors ${
                      comment.isDisliked ? 'text-blue-500' : 'hover:text-neutral-200'
                    }`}
                    title="Dislike"
                  >
                    <ThumbsDown className={`w-3.5 h-3.5 ${comment.isDisliked ? 'fill-current' : ''}`} />
                  </button>

                  {/* Creator Heart */}
                  {comment.isHeartedByCreator && (
                    <div
                      className="flex items-center gap-1 text-[11px] text-red-500 font-semibold cursor-help"
                      title={`${channel.name} loved this`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                      <span className="hidden sm:inline">Loved by creator</span>
                    </div>
                  )}

                  {/* Reply Action */}
                  <button
                    onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                    className="font-semibold hover:text-neutral-200 ml-1 px-1.5 py-0.5 rounded transition-colors"
                  >
                    Reply
                  </button>

                  {/* Delete / Edit if authored by current user */}
                  {comment.author.id === currentUser.id && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => handleStartEdit(comment)}
                        className="p-1 hover:text-blue-400 transition-colors"
                        title="Edit comment"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteComment(comment.id, null)}
                        className="p-1 hover:text-red-400 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Inline Reply Input */}
                {replyingToId === comment.id && (
                  <div className="mt-3 flex gap-2.5 pl-2">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        autoFocus
                        placeholder={`Reply to ${comment.author.name}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handlePostReply(comment.id);
                        }}
                        className={`w-full bg-transparent text-xs border-b pb-1 focus:outline-none placeholder:text-neutral-500 ${
                          darkMode ? 'border-neutral-700 focus:border-blue-500' : 'border-slate-300 focus:border-blue-500'
                        }`}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyText('');
                          }}
                          className="px-2.5 py-1 text-xs text-neutral-400 hover:text-neutral-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePostReply(comment.id)}
                          disabled={!replyText.trim()}
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            replyText.trim()
                              ? 'bg-blue-600 text-white cursor-pointer'
                              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                          }`}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nested Threaded Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-2">
                    <button
                      onClick={() => toggleReplies(comment.id)}
                      className={`flex items-center gap-2 text-xs font-bold text-blue-500 hover:bg-blue-500/10 px-2.5 py-1 rounded-full transition-colors cursor-pointer`}
                    >
                      {expandedReplies[comment.id] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      <span>
                        {expandedReplies[comment.id]
                          ? 'Hide replies'
                          : `${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
                      </span>
                    </button>

                    {/* Replies List */}
                    {expandedReplies[comment.id] && (
                      <div className="space-y-4 mt-3 pl-3 border-l-2 border-neutral-800">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2.5 text-xs group/reply">
                            <img
                              src={reply.author.avatarUrl}
                              alt={reply.author.name}
                              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`font-semibold ${darkMode ? 'text-neutral-200' : 'text-slate-800'}`}>
                                  {reply.author.name}
                                </span>
                                <span className="text-neutral-500 text-[11px]">• {reply.createdAt}</span>
                              </div>

                              <p className={`mt-0.5 leading-relaxed ${darkMode ? 'text-neutral-200' : 'text-slate-800'}`}>
                                {renderFormattedContent(reply.content)}
                              </p>

                              <div className="flex items-center gap-3 mt-1 text-[11px] text-neutral-400">
                                <button
                                  onClick={() => onLikeComment(reply.id, comment.id)}
                                  className={`flex items-center gap-1 hover:text-neutral-200 ${
                                    reply.isLiked ? 'text-blue-500 font-bold' : ''
                                  }`}
                                >
                                  <ThumbsUp className={`w-3 h-3 ${reply.isLiked ? 'fill-current' : ''}`} />
                                  <span>{reply.likes > 0 && reply.likes}</span>
                                </button>
                                <button
                                  onClick={() => onDislikeComment(reply.id, comment.id)}
                                  className="hover:text-neutral-200"
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                </button>

                                {reply.author.id === currentUser.id && (
                                  <button
                                    onClick={() => onDeleteComment(reply.id, comment.id)}
                                    className="hover:text-red-400 ml-auto"
                                    title="Delete reply"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
