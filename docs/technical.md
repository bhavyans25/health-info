technical.md — Technical Stack & Architecture
0. Two-Phase Build
Phase 1 — The App (Backend + Frontend): described in the rest of this document. Built and demoed first — database, API, auth, posts, stories, follow system, search, E2EE chat.
Phase 2 — Marketing Website: same Next.js/Tailwind stack as the app, built after Phase 1 is complete. Can live as a separate route group (e.g., / marketing pages vs /app product pages) within the same Next.js project rather than a fully separate repo — this makes the "register on marketing site → land in app" handoff trivial (same domain, same auth cookies, no cross-origin redirect needed).
Shared auth system across both phases — one User table, one session/token mechanism, no duplicate accounts.
1. Overview
A single-repo (or simple monorepo) full-stack JavaScript/TypeScript application, chosen for webinar-friendliness: one language across the whole stack, huge community support, easy live-coding.


2. Frontend
Concern
Choice
Notes
Framework
React (Next.js)
App Router, SSR for feed/profile pages, CSR for interactive chat/story UI
Language
TypeScript
Type-safety while live-coding reduces silly demo bugs
Styling
Tailwind CSS
Fast to demo, utility-first, easy responsive classes
State/data-fetching
React Query (TanStack Query)
Caching, optimistic updates for likes/follows
Forms/validation
React Hook Form + Zod
Shared Zod schemas can be reused on backend too
Realtime client
Socket.IO client
Chat + live story-view updates
Media handling
browser-image-compression + native canvas crop
Client-side resize before upload

3. Backend
Concern
Choice
Notes
Runtime
Node.js
Pairs naturally with Next.js API routes or a separate Express/Fastify service
API layer
Next.js Route Handlers (or Express if kept as separate service)
REST-style JSON API
Realtime server
Socket.IO (Node)
Handles chat delivery, typing/presence if added later
ORM
Prisma
Type-safe DB access, migrations, great live-demo DX
Database
PostgreSQL
Relational integrity for users/posts/follows/messages
Media storage
S3-compatible object storage (e.g., AWS S3 / Cloudflare R2 / Supabase Storage)
Signed upload URLs, never store binary blobs in Postgres
Cache/session store
Redis
Session storage, rate-limiting counters, presence/online status
Auth
JWT (access + refresh tokens) via httpOnly cookies, or NextAuth/Auth.js
See security.md for full detail
Cross-device session
Server-tracked refresh tokens per device/session (a Session table keyed to userId), not just a client-stored cookie
Needed for the "log in once, stay logged in across devices/browsers on the same account" requirement — see note below

3.1 Note on Cross-Device "No Re-Login" Behavior
Worth clarifying for the build: a new device cannot silently know who you are without some credential — there has to be one login per new device the first time (this is standard and unavoidable; even Instagram/WhatsApp require an initial login or QR scan on a new device). What is achievable, and matches the "detect and skip login" request, is:

Same browser/device, later visit: session persists via the refresh-token cookie — no re-login needed (this is the common case being asked for).
A genuinely new device (e.g., first time opening on phone): the standard pattern is one initial login on that device, after which that device also stays logged in going forward — same as Instagram's real behavior.
If the actual goal is "scan a QR code on phone to link it instantly like WhatsApp Web," that's a distinct, more advanced feature (device-linking flow) — flagged as a pending suggestion below rather than assumed silently.
4. Chat / End-to-End Encryption Layer
Concern
Choice
Notes
Key exchange
Signal-style protocol concepts: per-device asymmetric keypair (X25519) generated client-side
Private key never leaves device
Message encryption
libsodium (via libsodium-wrappers in browser) — authenticated encryption (crypto_box)
Server relays/stores ciphertext only
Transport
Socket.IO over WSS (TLS)
Encryption happens above the transport layer — WSS protects metadata in transit, E2EE protects content even from the server
Key storage
Public keys in Postgres (keyed to user), private keys in browser (IndexedDB), never transmitted




Full detail and threat model in security.md.
5. Infrastructure / DevOps
Concern
Choice
Notes
Hosting (frontend/backend)
Vercel (Next.js) or Railway/Render for a combined Node service
Easiest for live webinar deploys
Realtime hosting
Needs a long-lived Node process (Socket.IO) — Railway/Render/Fly.io rather than serverless
Serverless platforms don't hold persistent WS connections well
DB hosting
Supabase / Neon / Railway Postgres
Managed Postgres, easy to spin up live
Environment config
.env + a documented .env.example
Never commit real secrets
CI
GitHub Actions (lint + typecheck + build on push)
Optional but recommended if time allows

6. Repo Structure (proposed)
/apps

  /web        -> Next.js frontend + API routes

  /realtime   -> Socket.IO server (if split out)

/packages

  /db         -> Prisma schema + client

  /shared     -> Shared Zod schemas/types between frontend & backend

/docs

  Gemini.md

  skills.md

  technical.md

  security.md

  design.md
7. Data Model (high-level)
User (id, username, email, passwordHash, name, bio, avatarUrl, publicKey, createdAt)
Session (id, userId, refreshTokenHash, deviceInfo, createdAt, lastUsedAt, expiresAt) — enables persistent, per-device session tracking
Post (id, authorId, caption, mediaUrls[], createdAt)
Like (id, postId, userId)
Comment (id, postId, userId, text, createdAt)
Story (id, authorId, mediaUrl, createdAt, expiresAt)
StoryView (id, storyId, viewerId, viewedAt)
Follow (id, followerId, followingId)
Conversation (id, participantIds[])
Message (id, conversationId, senderId, ciphertext, nonce, createdAt, deliveredAt)


Pending Suggestions
Add Docker Compose for local dev (Postgres + Redis + app) so setup is one command — proposal, not yet in spec.
Consider tRPC instead of REST if the presenter wants tighter type-safety end-to-end (trade-off: steeper live-demo learning curve).
QR-code device linking (WhatsApp Web-style) so a phone can be linked to an already-logged-in account without typing credentials on the phone at all — only add this if that's actually the intended behavior (see §3.1 note above), since it's a meaningfully bigger feature than standard persistent sessions.

