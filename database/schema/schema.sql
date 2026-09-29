-- =====================================================================
-- ViewTube Video Platform Relational Schema (PostgreSQL / SQLite Compatible)
-- =====================================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    handle VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(180) UNIQUE,
    bio TEXT,
    avatar_url TEXT NOT NULL,
    banner_url TEXT,
    subscribers_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Channels Table
CREATE TABLE IF NOT EXISTS channels (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    handle VARCHAR(60) NOT NULL UNIQUE,
    avatar_url TEXT NOT NULL,
    banner_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    subscribers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Video Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    slug VARCHAR(80) NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0
);

-- Videos Table
CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(64) PRIMARY KEY,
    channel_id VARCHAR(64) NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    duration INTEGER DEFAULT 0, -- in seconds
    views BIGINT DEFAULT 0,
    category_id VARCHAR(40) REFERENCES categories(id) ON DELETE SET NULL,
    category VARCHAR(80) NOT NULL,
    is_live BOOLEAN DEFAULT FALSE,
    live_viewer_count INTEGER DEFAULT 0,
    likes BIGINT DEFAULT 0,
    dislikes BIGINT DEFAULT 0,
    is_user_upload BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Video Tags
CREATE TABLE IF NOT EXISTS video_tags (
    video_id VARCHAR(64) NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (video_id, tag)
);

-- Comments Table (supports 1-level nested replies)
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(64) PRIMARY KEY,
    video_id VARCHAR(64) NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    parent_id VARCHAR(64) REFERENCES comments(id) ON DELETE CASCADE,
    author_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_hearted_by_creator BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel_id VARCHAR(64) NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, channel_id)
);

-- Video Likes Table
CREATE TABLE IF NOT EXISTS video_likes (
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id VARCHAR(64) NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL, -- TRUE = like, FALSE = dislike
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, video_id)
);

-- Watch Later Table
CREATE TABLE IF NOT EXISTS watch_later (
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id VARCHAR(64) NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, video_id)
);

-- Watch History Table
CREATE TABLE IF NOT EXISTS watch_history (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id VARCHAR(64) NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Live Chat Messages Table
CREATE TABLE IF NOT EXISTS live_chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    video_id VARCHAR(64) NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_super_chat BOOLEAN DEFAULT FALSE,
    super_chat_amount VARCHAR(20),
    super_chat_color VARCHAR(20),
    badge VARCHAR(40),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_channel ON videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_videos_views ON videos(views DESC);
CREATE INDEX IF NOT EXISTS idx_comments_video ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user ON watch_history(user_id, watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_chat_video ON live_chat_messages(video_id, created_at ASC);
