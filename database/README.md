# Database Architecture & Schema Documentation

This directory contains the database definitions, migration schemas, and seeders for the **ViewTube** video streaming platform.

## Directory Structure

```
database/
├── schema/
│   └── schema.sql       # Relational DDL schema (PostgreSQL / SQLite compatible)
├── seeders/
│   ├── seed_data.json   # Seed records for initial categories, channels, and test users
│   └── seed.ts          # Automated seeding script
└── README.md            # Schema documentation & entity relationship reference
```

## Relational Entity Model

```
   [users] ─────────────< [channels]
      │                       │
      │ 1                     │ 1
      ▼                       ▼
 [comments] <─────────── [videos] ──────────< [video_tags]
      │                       │
      │ (parent_id)           │ 1
      ▼                       ▼
 [comments (nested)]    [live_chat_messages]
      ▲                       ▲
      │                       │
   [users] ─────────────> [subscriptions]
      │                       │
      ├─────────────────> [video_likes]
      ├─────────────────> [watch_later]
      └─────────────────> [watch_history]
```

## Tables & Relationships

1. **`users`**: Identity, profile details, avatar URL, channel banners, and subscriber counts.
2. **`channels`**: Creator channel information, verified badges, owner mapping, subscriber metrics.
3. **`categories`**: Browse filter topics (e.g., *Technology*, *Animation*, *Music*, *Sci-Fi*, *Travel*).
4. **`videos`**: Metadata, H.264/MP4 stream URLs, thumbnails, real duration in seconds, views, likes/dislikes, category references, live streaming flags.
5. **`comments`**: 2-level hierarchical discussion trees (top-level comments and child replies), heart reactions, likes, and creator pins.
6. **`subscriptions`**: Many-to-many relationship mapping users to followed creator channels.
7. **`video_likes`**: Like/dislike state tracking per user and video.
8. **`watch_later`**: Bookmarked playlist queue.
9. **`watch_history`**: Chronological viewing logs with timestamp ordering.
10. **`live_chat_messages`**: Real-time broadcast chat, super chats, badges, and moderator tags.

## In-Memory & Relational Engines

The backend includes a high-performance in-memory repository store populated with initial seed records during development, while providing full compatibility with relational SQL databases through `schema.sql`.
