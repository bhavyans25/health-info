security.md — Security Requirements
This file defines the baseline security posture. The presenter will add further hardening manually after the webinar — this is the required floor, not the ceiling.


1. Authentication Security
Passwords hashed with bcrypt or argon2 (never plaintext, never reversible encryption).
Minimum password policy enforced client + server side (length, not-too-common check).
JWT access tokens short-lived (e.g., 15 min); refresh tokens longer-lived, stored in httpOnly, Secure, SameSite=Strict cookies — never in localStorage.
Refresh token rotation on use; revoke on logout.
Rate-limit login attempts per IP/account (e.g., via Redis) to slow brute force.
Generic error messages on login failure ("invalid credentials") — never reveal whether the email/username exists.
2. Session & Authorization
Every API route validates the session/JWT server-side; never trust client-supplied user IDs.
Ownership checks on every mutation: a user can only edit/delete their own posts, stories, profile, messages.
Role/permission checks scaffolded even if only one role ("user") exists today, so an "admin" role can be added later without a rewrite.
3. Input Validation & Sanitization
All inputs validated server-side with Zod schemas (mirrored from frontend, never trusted from frontend alone).
File uploads restricted by MIME type and size (images: jpg/png/webp, max size enforced; video for stories: mp4, size/duration-limited).
Sanitize/escape any user-generated text rendered in the UI (bio, captions, comments) to prevent stored XSS.
Parameterized queries / ORM (Prisma) only — no raw string-concatenated SQL.
4. Media & Storage Security
Uploads go through signed, time-limited upload URLs to object storage — the app server never proxies raw file bytes unnecessarily.
Serve media via signed/expiring URLs where appropriate, especially for anything not meant to be public forever (e.g., story media).
Strip EXIF/location metadata from uploaded images before storage.
5. Transport Security
HTTPS/WSS enforced everywhere (no plain HTTP/WS in production).
HSTS header enabled.
CORS locked down to known frontend origin(s) only.
6. End-to-End Encrypted Chat (Core Security Feature)
Threat model: the server (and its operator/database) must not be able to read message plaintext, even if the database is compromised or subpoenaed.

Each user device generates an asymmetric keypair (X25519) client-side on first login; private key is stored only in the browser (IndexedDB), never transmitted to the server.
Public keys are published to the server and are the only key material stored there.
Messages are encrypted client-side using authenticated encryption (e.g., libsodium crypto_box) using sender's private key + recipient's public key before being sent to the server.
Server stores and relays ciphertext + nonce only; it has no ability to decrypt.
Decryption happens only on the recipient's client using their private key.
Consideration/limitation to document for the audience: multi-device support and key-loss/recovery are hard problems (Signal-level protocols solve this with device linking); for a webinar-scope app, document this as a known limitation rather than over-engineering it live.
7. General Web App Hardening
Standard security headers (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options).
CSRF protection on any cookie-authenticated state-changing request.
Dependency scanning (e.g., npm audit / Dependabot) as a habit, not necessarily live-demoed.
Environment secrets only via .env, never committed; .env.example documents required vars without real values.
8. Manual Additions (Reserved)
The presenter will add further security measures here manually after the webinar. This section intentionally left as a placeholder list:

(to be added manually)
(to be added manually)


Pending Suggestions (see Gemini.md §9)
Email verification (item 1)
Forgot-password flow (item 2)
Private accounts / follow approval (item 5)
Disappearing messages (item 7)
CAPTCHA on signup/login (item 8)

