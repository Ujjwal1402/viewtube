# ViewTube REST API Reference

Base URL: `/api`

All responses follow a consistent JSON response envelope:
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 1. System Health

### `GET /api/health`
Returns service availability and server timestamp.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "ViewTube API",
  "timestamp": "2026-09-23T09:30:00.000Z",
  "version": "1.0.0"
}
```

---

## 2. Videos

### `GET /api/videos`
Retrieves video catalog with optional filter query parameters.

**Query Parameters**:
- `search` *(string, optional)*: Query string to match against titles, descriptions, channel names, and tags.
- `category` *(string, optional)*: Category filter (`Technology`, `Animation`, `Music`, `Sci-Fi`, etc.).

**Response `200 OK`**:
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": "vid-1",
      "title": "Big Buck Bunny (4K 60FPS Remastered Animation)",
      "description": "A large, lovable rabbit deals with forest bullies...",
      "videoUrl": "/videos/big_buck_bunny.mp4",
      "thumbnailUrl": "https://images.unsplash.com/...",
      "duration": 60,
      "views": 3421890,
      "category": "Animation",
      "likes": 184500,
      "dislikes": 1200,
      "channel": {
        "id": "ch-blender",
        "name": "Blender Open Movies",
        "handle": "@blender_studio",
        "avatarUrl": "https://images.unsplash.com/...",
        "verified": true,
        "subscribers": 1840000
      }
    }
  ]
}
```

### `GET /api/videos/:id`
Retrieves single video by unique identifier.

### `GET /api/videos/:id/recommendations`
Retrieves recommended related videos for playback view.

### `POST /api/videos`
Uploads or registers a new video.

**Request Body**:
```json
{
  "title": "My New Tech Tutorial",
  "description": "Step-by-step programming tutorial",
  "videoUrl": "/videos/my_video.mp4",
  "thumbnailUrl": "https://images.unsplash.com/...",
  "duration": 180,
  "category": "Technology",
  "tags": ["coding", "react", "typescript"]
}
```

### `POST /api/videos/:id/view`
Increments view counter for a video.

### `POST /api/videos/:id/like`
Toggles like or dislike count.

---

## 3. Comments

### `GET /api/videos/:videoId/comments`
Retrieves discussion thread for a given video, including nested replies.

### `POST /api/videos/:videoId/comments`
Posts a comment or nested reply.

**Request Body**:
```json
{
  "content": "Incredible animation quality! Check 1:15 for the comedic trap.",
  "parentId": null,
  "author": {
    "id": "user-current",
    "name": "Alex Rivera",
    "handle": "@alexrivera_studio",
    "avatarUrl": "https://images.unsplash.com/..."
  }
}
```

### `POST /api/videos/:videoId/comments/:commentId/like`
Likes or unlikes a comment.

---

## 4. Authentication & User Profile

### `POST /api/auth/login`
Authenticates user by email or handle.

**Request Body**:
```json
{
  "emailOrHandle": "alex@viewtube.io"
}
```

### `POST /api/auth/signup`
Creates a new account.

**Request Body**:
```json
{
  "name": "Alex Rivera",
  "email": "alex@viewtube.io",
  "handle": "@alexrivera_studio"
}
```

### `POST /api/auth/profile`
Updates user profile settings and custom avatar.

---

## 5. Live Stream Chat

### `GET /api/live/:videoId/chat`
Retrieves chat stream history for active broadcast.

### `POST /api/live/:videoId/chat`
Sends live chat message or Super Chat.
