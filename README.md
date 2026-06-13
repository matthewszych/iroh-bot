# 🍵 Uncle Iroh Bot

A Discord bot inspired by Uncle Iroh from Avatar: The Last Airbender. Dispenses wisdom, lets users choose their bending element, features a leveling system, and plays music in voice channels.

## Features

- **🍵 /wisdom** — Receive a piece of Iroh's wisdom (element-specific if you've chosen one)
- **🌊🔥🪨💨 /choose-element** — Pick your bending element (Fire, Water, Earth, Air)
- **📊 /profile** — View your bender profile, rank, level, and XP progress
- **🏆 /leaderboard** — See the top benders in your server
- **☕ /tea** — Get a tea recommendation from Iroh
- **💬 /iroh** — Just chat with Uncle Iroh
- **🤖 /ask-iroh** — AI-generated responses (feature-flagged, requires OpenAI key)
- **🎵 /play** — Play a song from YouTube (URL or search)
- **⏸️ /pause** — Pause/resume playback
- **⏭️ /skip** — Skip the current track
- **⏹️ /stop** — Stop playback and disconnect
- **🎶 /queue** — View the current music queue
- **🔁 /loop** — Toggle loop mode (off/track/queue)
- **🎵 /nowplaying** — Show what's currently playing
- **🗑️ /clear** — Clear the music queue
- **Passive XP** — Earn XP by chatting (after choosing an element)
- **Level-up announcements** — Iroh congratulates you on leveling up
- **Auto-leave** — Bot leaves voice when no users remain

## Prerequisites

- Node.js 18+
- PostgreSQL
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) (for music)
- [FFmpeg](https://ffmpeg.org/) (for audio processing)

## Setup

### 1. Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** and name it (e.g., "Uncle Iroh")
3. Go to the **Bot** tab and click **Reset Token** — copy the token
4. Under **Privileged Gateway Intents**, enable **Message Content Intent**
5. Go to **OAuth2 > URL Generator**, select scopes: `bot`, `applications.commands`
6. Select permissions: `Send Messages`, `Embed Links`, `Read Message History`, `Connect`, `Speak`
7. Use the generated URL to invite the bot to your server

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values. On Windows, set `YT_DLP_PATH` and `FFMPEG_PATH` if they aren't in your system PATH.

### 4. Install Dependencies

```bash
npm install
```

### 5. Deploy Slash Commands

```bash
npm run deploy
```

### 6. Start the Bot

```bash
npm run dev
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start bot in development mode (ts-node) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled bot from `dist/` |
| `npm run deploy` | Register slash commands with Discord |
| `npm run migrate` | Run database migrations |
| `npm run migrate:make` | Create a new migration file |
| `npm run migrate:rollback` | Rollback last migration batch |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint source code |
| `npm run format` | Format source code |

## Leveling System

- Earn **5 XP** per message (1-minute cooldown, must have an element chosen)
- Earn **10 XP** per `/wisdom` command
- Level-up thresholds increase with each level (100 × level^1.5)
- Each element has unique rank titles:

| Level Range | Fire | Water | Earth | Air |
|-------------|------|-------|-------|-----|
| 1–5 | Spark | Dewdrop | Pebble | Breeze |
| 6–10 | Flame Dancer | Stream Runner | Stone Shaper | Wind Walker |
| 11–15 | Fire Breather | Wave Rider | Boulder Crusher | Gust Rider |
| 16–20 | Inferno Wielder | Tidal Master | Seismic Striker | Storm Chaser |
| 21–25 | Sun Warrior | Moon Spirit Blessed | Metal Bender | Sky Bison Master |
| 26–30 | Dragon of the West | Ocean's Fury | Badgermole Sage | Eternal Nomad |
| 31+ | Avatar of Fire | Avatar of Water | Avatar of Earth | Avatar of Air |

## Tech Stack

- **TypeScript** — Strict mode, ES2022
- **discord.js** v14 — Discord API
- **@discordjs/voice** — Voice channel support
- **Knex** + **PostgreSQL** — Database with migrations
- **yt-dlp** + **FFmpeg** — YouTube audio streaming
- **OpenAI** — AI-generated wisdom (optional, feature-flagged)
- **pino** — Structured logging
- **Vitest** — Testing
- **ESLint** + **Prettier** — Code quality

## Project Structure

```
iroh-bot/
├── src/
│   ├── bot.ts                — Entry point & event handlers
│   ├── deploy-commands.ts    — Slash command registration
│   ├── commands/
│   │   ├── index.ts          — Command registry
│   │   ├── wisdom.ts         — /wisdom
│   │   ├── ask-iroh.ts       — /ask-iroh (AI)
│   │   ├── choose-element.ts — /choose-element
│   │   ├── profile.ts        — /profile
│   │   ├── leaderboard.ts    — /leaderboard
│   │   ├── tea.ts            — /tea
│   │   ├── iroh.ts           — /iroh
│   │   ├── play.ts           — /play
│   │   ├── pause.ts          — /pause
│   │   ├── skip.ts           — /skip
│   │   ├── stop.ts           — /stop
│   │   ├── queue.ts          — /queue
│   │   ├── nowplaying.ts     — /nowplaying
│   │   ├── loop.ts           — /loop
│   │   └── clear.ts          — /clear
│   ├── services/
│   │   ├── wisdom.ts         — Curated Iroh quotes
│   │   ├── leveling.ts       — XP, levels, ranks
│   │   ├── music.ts          — yt-dlp music player
│   │   └── ai.ts             — OpenAI integration
│   ├── db/
│   │   ├── connection.ts     — Knex instance
│   │   ├── index.ts          — Barrel export
│   │   ├── users.ts          — User queries
│   │   ├── wisdom-log.ts     — Wisdom log queries
│   │   └── migrations/       — Knex migration files
│   └── shared/
│       ├── constants.ts      — Types & element info
│       └── logger.ts         — Pino logger
├── tests/                     — Vitest tests
├── docker-compose.yml         — Local PostgreSQL
├── knexfile.ts                — Knex configuration
├── .env.example               — Environment template
└── package.json
```
