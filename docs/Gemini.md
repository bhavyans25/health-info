GEMINI.md — Master Project Prompt / PRD
Project Codename: "InstaClone" (Full-Stack Instagram-style Social App)
This file is the single source of truth for the AI coding assistant (or any developer/agent) working on this project. Read this file fully before writing any code. Other files in this repo (skills.md, technical.md, security.md, design.md) are referenced from here and should be treated as extensions of this prompt.


1. Role & Context
You are acting as a senior full-stack engineer and technical architect building a production-grade, portfolio/demo-quality social media web application for a live webinar walkthrough. The presenter will build this application live/iteratively in front of an audience, so:

Code must be clean, incrementally demonstrable, and organized into clear milestones (auth → profile → posts/stories → search/follow → chat).
Prefer well-known, boring, stable technology over experimental tools — the goal is a reliable live build, not bleeding-edge risk.
Explain architectural decisions briefly in code comments/commit messages, since an audience is following along.
Every feature should be built as a vertical slice (DB model → API → UI) so it can be demoed end-to-end before moving to the next feature.


2. What We Are Building
The project is built in two phases:

Phase 1 — Backend + App (Frontend + Backend). The full-stack Instagram-clone application itself is built first: database, API, auth, posts, stories, follow system, search, and end-to-end encrypted chat — all described below. This is built and demoed first in the webinar.

Phase 2 — Marketing Website. A standalone, visually fascinating marketing/landing site for the InstaClone product (hero section, feature highlights, screenshots/mockups, call-to-action), built after the app itself is complete. See design.md (once filled in) for the visual direction.

Handoff between the two: the marketing site includes its own Register/Login entry point. When a user registers (or logs in) from the marketing site, they are redirected straight into the app (built in Phase 1) — i.e., the marketing site's auth is the app's auth, not a separate account system. There is one shared user/auth system across both, not two.

Cross-device session persistence: once a user is authenticated on one device, opening the site/app on another device (e.g., desktop → phone) should detect the existing valid session/token for that account and skip login — the user should not have to log in again on a second device within the same session validity window. (Note for build: this requires the auth token/session to be tied to the account server-side, not just stored locally per-browser — see technical.md and security.md for the session strategy this implies.)

A simplified but functionally complete clone of Instagram's core social loop:

Authentication — register, login, logout, session handling.
Profile management — edit name, username, bio, avatar, links.
Posts — image upload, caption, like, comment, delete.
Stories — 24-hour ephemeral image/video uploads, viewable by followers.
Discovery — search bar to find any registered user (all accounts on the platform must be searchable/browsable).
Social graph — follow / unfollow / followers / following lists.
Chat / DMs — 1:1 real-time messaging with end-to-end encryption (E2EE).

Out of scope (explicitly excluded to keep this buildable in a webinar):

Reels/video feed algorithm, ads, monetization, multi-language, notifications-as-a-service infra, shadow-ban/spam ML, third-party API integrations (Facebook/Meta login), payment systems.


3. Guiding Principles
Security by default: auth, encryption, and input validation are not "add later" — they're built in from the first commit (see security.md).
Simplicity over cleverness: the audience needs to follow the logic.
Mobile-first responsive UI: Instagram is primarily a mobile experience; the web clone should look correct on mobile widths first.
Everything is a real working feature — no fake/mocked data in the final state, though mocked data is acceptable for early UI scaffolding milestones.


4. Technical Stack
See technical.md for full detail. Summary: a modern JS/TS full-stack app (frontend framework + Node backend or a unified full-stack framework), relational database, object storage for media, WebSocket layer for real-time chat, and a dedicated encryption layer for DMs.


5. Security
See security.md for full detail. Summary: password hashing, JWT/session security, rate limiting, input sanitization, signed media URLs, and client-side E2EE for chat (server never sees plaintext messages).


6. Design
See design.md — intentionally left blank. Visual design direction (colors, typography, layout system) will be supplied separately.


7. Feature List
See skills.md for the full, itemized feature breakdown per module.


8. Working Agreement / How to Use These Files
When the presenter says "okay, agreed" or similar confirmation on a proposed addition, that addition should be merged into the relevant .md file (this file, skills.md, technical.md, or security.md) — not just left in chat.
design.md stays blank until explicitly filled in later.
Any new suggested feature/tech/security measure should be proposed as a numbered suggestion, not silently added.


9. Build Phases (Top-Level Order)
Phase 1 — App Backend + Frontend: the full Instagram-clone app, backend first (see skills.md build order within this phase).
Phase 2 — Marketing Website: fascinating, high-polish landing site with Register/Login built in, built after the app is complete.
Registration/login on the Phase 2 site hands the authenticated user directly into the Phase 1 app — shared auth, not separate systems.
10. Suggested Additions (Pending Approval)
(Renumbered from the original list — content unchanged.) These are not yet part of the spec — proposed for consideration; say "agreed" against any number to have it merged into the relevant file:

Email verification on signup (prevents throwaway/spam accounts) — belongs in security.md.
Forgot password / reset flow via email token — belongs in skills.md + security.md.
Post comments + nested replies (Instagram-lite version) — belongs in skills.md.
Notifications feed (likes, comments, follows, DMs) — even a simple in-app bell icon, no push infra — belongs in skills.md.
Private accounts (follow requests requiring approval) — belongs in skills.md + security.md.
Read receipts / typing indicators in chat — belongs in skills.md.
Disappearing messages in chat (Instagram Vanish Mode-style) — pairs well with E2EE — belongs in security.md + skills.md.
Rate-limited signup/login via CAPTCHA (e.g., hCaptcha) — belongs in security.md.
Content moderation basics — report post/user, admin review queue — belongs in skills.md.
Explore/Discover grid (trending or random public posts, not just search) — belongs in skills.md.

