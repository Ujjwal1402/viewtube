# ViewTube — Video Streaming & Creator Broadcast Platform

> A modern, production-grade video streaming platform inspired by YouTube, featuring video playback, real-time live broadcasting, interactive commenting with nested discussion trees, voice search, and persistent user customization.

[![CI Pipeline](https://github.com/viewtube/viewtube-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/viewtube/viewtube-platform/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)

---

## Architecture Overview

ViewTube is architected as a clean, decoupled monorepo separating presentation, API routing, business domain logic, and data persistence:

```
youtube-inspired-video-platform/
│
├── frontend/                     # React 19 Client SPA
│   ├── public/                   # Static assets, MP4 streams, and icons
│   ├── src/
│   │   ├── components/           # Reusable UI widgets (VideoPlayer, Navbar, VideoCard, etc.)
│   │   ├── constants/            # Application categories and routes
│   │   ├── layouts/              # Main responsive layout shell
│   │   ├── pages/                # Views (Home, Subscriptions, MyVideos, Profile, etc.)
│   │   ├── services/             # Typed REST API integration layer
│   │   ├── types/                # Domain models & TypeScript interfaces
│   │   └── utils/                # IndexedDB storage, Web Audio chimes, metadata extraction
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                      # Node.js + Express REST API Server
│   ├── src/
│   │   ├── config/               # Database engine & environment configurations
│   │   ├── controllers/          # HTTP request handlers
│   │   ├── middleware/           # Error handling, request logging, and auth guards
│   │   ├── models/               # Domain entity contracts
│   │   ├── repositories/         # Data persistence layer
│   │   ├── routes/               # API route definitions (/api/videos, /api/auth, etc.)
│   │   ├── services/             # Business rules, recommendation engine, and chat logic
│   │   └── validators/           # Payload schema validators
│   └── package.json
│
├── database/                     # Relational database models and seed data
│   ├── schema/
│   │   └── schema.sql            # PostgreSQL/SQLite DDL definitions
│   ├── seeders/
│   │   └── seed_data.json        # Curated video catalog and user accounts
│   └── README.md
│
├── docs/                         # Engineering and architecture specifications
│   ├── architecture/
│   │   └── ARCHITECTURE.md       # Architectural deep-dive & data flow diagrams
│   └── api/
│       └── API_REFERENCE.md      # OpenAPI/REST endpoint documentation
│
├── tests/                        # Automated test suites
│   ├── integration/
│   │   └── api.test.ts           # REST endpoint validation tests
│   └── e2e/
│       └── playback_flow.test.ts # End-to-end user journey specification
│
├── .github/
│   └── workflows/
│       └── ci.yml                # Automated CI pipeline (lint, test, build)
│
├── server.ts                     # Full-stack dev server & production entrypoint
├── docker-compose.yml            # Multi-container Docker deployment
├── .env.example                  # Environment configuration template
└── README.md
```

---

## Key Features

- **Video Playback Engine**: HTML5 player supporting play/pause, seek scrubbing, volume/mute, speed selection (0.5x - 2x), theater mode, and full-screen playback.
- **Real-Time Live Broadcast & Chat**: Live streaming studio modal with simulated live chat, Super Chat donations, viewer counts, and moderation badges.
- **Voice Search with Native Permissions**: Web Speech API audio receiver with browser microphone permission memory and Web Audio synthesized feedback chimes.
- **Interactive Commenting & Nested Replies**: 2-level comment trees with creator heart badges, like counters, and interactive timestamp seeking (e.g., clicking `1:15` jumps the player directly to that time).
- **Device Image Profile Uploads**: Profile modal allowing users to select and crop local images from their device, automatically persisted via `localStorage` and synchronized across all views.
- **Client Offline Video Storage**: Local MP4/WebM video upload system backed by browser `IndexedDB`, allowing offline video management without server storage quotas.
- **Search & Auto-Suggest**: Instant autocomplete search based on titles, channels, categories, and tags.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React |
| **Backend** | Express.js, Node.js, TypeScript, TSX |
| **Database** | Relational SQL Schema (`database/schema/schema.sql`) + High-performance In-Memory Engine |
| **Storage** | HTML5 IndexedDB (video blobs), LocalStorage (auth/session/avatars) |
| **Audio/Voice**| Web Speech API (`SpeechRecognition`), Web Audio API (`AudioContext`) |
| **Testing** | Node Test Runner, TypeScript typechecking, Integration test suite |
| **DevOps** | Docker, Docker Compose, GitHub Actions CI |

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **bun** / **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/viewtube/viewtube-platform.git
cd viewtube-platform
```

### 2. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
# Starts the full-stack server (Vite frontend + Express API at http://localhost:3000)
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Quality Assurance

```bash
# Run TypeScript compilation and lint checks
npm run lint

# Run backend API integration tests
npm test

# Build production bundle
npm run build
```

---

## Running with Docker

```bash
# Build and run containers for ViewTube application and PostgreSQL
docker-compose up --build -d

# Stop services
docker-compose down
```

---

## Demo Credentials (Safe Development Accounts)

| Role | Handle | Email | Notes |
| :--- | :--- | :--- | :--- |
| **Default Creator** | `@alexrivera_studio` | `alex@viewtube.io` | Preloaded with creator badge & uploads |
| **Test User** | `@sarah_explores` | `sarah@viewtube.io` | Preloaded with subscriptions |

---

## Future Improvements

- [ ] Adaptive bitrate streaming (HLS / DASH) with video transcoding pipeline
- [ ] WebSocket-based live chat scaling for high-concurrency streams
- [ ] User playlist creation & custom playlist management
- [ ] Video chapters marker support on the playback scrubber
