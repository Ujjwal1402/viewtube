# ViewTube System Architecture & Engineering Guide

## 1. High-Level Architectural Overview

ViewTube is designed as a modular, decoupled full-stack video streaming and creator broadcast platform.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION TIER                             │
│       React 19 SPA • Tailwind CSS v4 • Lucide React • Web Audio       │
│                                                                        │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐   │
│   │ Main Layout  │     │ Feed / Watch │     │ Audio Voice Receiver │   │
│   │   & Navbar   │     │   Player     │     │ (Web Speech + Chimes)│   │
│   └──────────────┘     └──────────────┘     └──────────────────────┘   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTP / REST / JSON
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY                                 │
│          Express.js Application Router • Request Logging • CORS        │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          BUSINESS LOGIC TIER                           │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│   │  Video Service   │  │ Comment Service  │  │   Auth Service   │     │
│   │ (Search & Feeds) │  │  (Nested Trees)  │  │  (Session & RBAC)│     │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│   ┌──────────────────┐  ┌──────────────────┐                           │
│   │ Live Chat Service│  │  Media Handler   │                           │
│   │ (Super Chat/Bots)│  │ (MIME & Duration)│                           │
│   └──────────────────┘  └──────────────────┘                           │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA & STORAGE PERSISTENCE                      │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│   │ Relational DB /  │  │ Client IndexedDB │  │ HTML5 LocalStore │     │
│   │ In-Memory Engine │  │ (Blobs & Media)  │  │ (Avatars/Session)│     │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. Directory Structure

```
youtube-inspired-video-platform/
│
├── frontend/                     # Client application (React 19 + TypeScript + Vite)
│   ├── public/                   # Static assets, MP4 streams, and icons
│   ├── src/
│   │   ├── components/           # Modular atomic UI components (VideoCard, VideoPlayer, Navbar, etc.)
│   │   ├── constants/            # Application constants and route patterns
│   │   ├── layouts/              # Main application shell and responsive navigation
│   │   ├── pages/                # High-level page views (Home, Watch, Profile, History, etc.)
│   │   ├── services/             # Frontend HTTP API client and business integrations
│   │   ├── types/                # Core TypeScript domain models and contracts
│   │   ├── utils/                # IndexedDB persistence, metadata probing, audio synthesizers
│   │   ├── App.tsx               # Root application coordinator
│   │   ├── main.tsx              # DOM entry point
│   │   └── index.css             # Tailwind CSS styles
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                      # Server-side REST API (Express + TypeScript)
│   ├── src/
│   │   ├── config/               # Environment variables and database store
│   │   ├── controllers/          # HTTP request/response handlers
│   │   ├── middleware/           # Request logging, auth guard, and error handling
│   │   ├── models/               # Data interfaces and entities
│   │   ├── repositories/         # Data access layer for users, videos, comments, and chat
│   │   ├── routes/               # API route definitions (/api/videos, /api/auth, etc.)
│   │   ├── services/             # Core business logic and validation
│   │   ├── validators/           # Payload input sanitizers and validators
│   │   └── app.ts                # Express app factory
│   └── package.json
│
├── database/                     # Relational database specifications
│   ├── schema/
│   │   └── schema.sql            # PostgreSQL/SQLite DDL definitions
│   ├── seeders/
│   │   └── seed_data.json        # Curated video seeds, creators, and comment threads
│   └── README.md
│
├── docs/                         # Engineering and architecture documentation
│   ├── architecture/
│   └── api/
│
├── tests/                        # Automated testing suites
│   ├── integration/              # Backend endpoint integration tests
│   └── e2e/                      # User journey and playback specifications
│
├── .github/
│   └── workflows/
│       └── ci.yml                # Continuous Integration pipeline
│
├── server.ts                     # Full-stack dev & production server
├── docker-compose.yml            # Container orchestration specification
├── .env.example                  # Environment configuration template
└── README.md                     # Comprehensive project documentation
```

## 3. Key Design Principles

1. **Strict Separation of Concerns**: Frontend components do not access the database directly; they communicate through typed API service wrappers.
2. **Offline-Resilient Persistence**: User-uploaded videos and profile avatars are persisted locally via HTML5 `IndexedDB` and `localStorage`, preventing data loss across page reloads.
3. **Audio-Synthesized Interactive Voice**: Speech search utilizes browser `webkitSpeechRecognition` combined with real-time Web Audio API frequency-synthesized feedback tones without requiring external MP3 assets.
4. **Zero-Lag Duration Extraction**: Video durations are extracted using a single-concurrency FIFO queue with session storage caching to protect the main stream playback bandwidth.
