skills.md — Feature Breakdown ("Skills" the app must have)
This file lists every functional feature the app must implement, grouped by module. Each item is written as a testable capability. Use this as the build checklist during the webinar.


1. Authentication & Onboarding (Phase 1)
User can register with email, username, password.
Username must be unique, validated in real time (like Instagram's green checkmark).
Password strength validation on the client and server.
User can log in with username/email + password.
User can log out (session/token invalidated).
Persistent session (stay logged in on refresh) via secure cookie or token storage.
Auth-protected routes redirect unauthenticated users to login.
2. Profile Management
User has a profile page showing avatar, name, username, bio, post count, follower/following counts.
User can edit: display name, username, bio, profile photo, external link.
Profile photo upload with client-side crop/resize before upload.
User can view any other user's public profile.
User can delete their own account (with confirmation).
3. Posts
User can create a post: upload 1 or more images, add caption.
Posts appear on the user's own profile grid.
Posts appear in a home feed composed of posts from followed users.
User can like/unlike a post.
User can comment on a post.
User can delete their own post.
Post detail view (click to expand, see all comments).
4. Stories
User can upload a story (image/short video).
Stories auto-expire after 24 hours.
Story bar at top of home feed shows followed users with active stories.
Tapping a story avatar opens a full-screen, auto-advancing story viewer.
Story owner can see who has viewed their story.
5. Discovery & Search
Global search bar finds users by username or display name.
Every registered account is discoverable — no account is hidden from search by default (unless a future "private account" feature is approved).
Search results show avatar, username, name, follow button.
Debounced/typeahead search (results update as you type).
6. Social Graph (Follow System)
User can follow / unfollow another user.
Follower count and following count shown on profile.
Followers list and Following list are viewable (tappable from profile).
Home feed only shows posts from users you follow (plus your own).
7. Chat / Direct Messages (End-to-End Encrypted)
User can start a 1:1 conversation with any other user.
Messages are encrypted on the sender's device and decrypted only on the recipient's device (server stores ciphertext only — see security.md for the encryption design).
Real-time delivery via WebSocket when both users are online.
Message history persists (as ciphertext) and loads on chat reopen.
Basic message states: sent, delivered (read receipts are a pending suggestion, not required for v1).
Conversation list view showing all active chats, sorted by most recent.
8. Phase 2 — Marketing Website
Fascinating, high-polish landing page (hero section, product story, feature highlights, screenshots/mockups of the app), built after the app itself is complete.
Register and Login entry points on the marketing site (this is the app's real auth from Phase 1, not a separate demo form).
Successful registration/login on the marketing site redirects the user straight into the app.
Responsive, animation-rich, portfolio-quality visual polish.
Design direction to be defined in design.md (currently blank, pending).
9. Cross-Cutting / Platform Features
Responsive layout: mobile-first, works down to ~375px width, scales up to desktop.
Loading and empty states for every list view (feed, search, chat, stories).
Basic error handling/toasts for failed actions (upload fail, network error, etc.).
404 / not-found page.


Build Order (recommended for the webinar's live-demo flow)
Auth (register/login/logout + protected routing) — backend-first
Profile view + edit
Post creation + home feed + like/comment
Follow system + search/discovery
Stories
Chat with E2EE (most complex — saved for last, dedicated segment)
Cross-device session persistence (verify: logging in on desktop, then opening on phone, does not require re-login)
Marketing website (Phase 2 — built last, once the full app is working, then wired to the same auth)


Pending Feature Suggestions
See "Suggested Additions" in Gemini.md §9 — items 3, 4, 5, 6, 7, 9, 10 would land here once approved.

