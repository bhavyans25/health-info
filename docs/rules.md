rules.md — Project Rules & Guardrails
This file defines the hard rules for building and operating the app — what every feature is allowed to do, what it's not allowed to do, and what should happen when something goes wrong. Treat this as a constraints checklist to build against, not just documentation.


1. General Rules (Apply to Every Feature)
No feature does another feature's job. Each module (auth, profile, posts, stories, chat, search) should only accept the kind of input/action it's meant for. If a user tries to do something out of scope for that screen, the app must not silently accept it, silently fail, or crash — it must show a clear popup/toast telling the user what's allowed.
Every action gets feedback. Success, failure, or "not allowed" — the user should never be left wondering if something happened. No silent failures.
Never trust the client. Every rule enforced in the UI (file type, size, permissions) must also be enforced on the server. UI validation is for user experience; server validation is for actual security.
Fail safe, not silent. If something breaks, the system should reject the action and show an error — never save corrupt/partial data, never leave the UI in an unclear state.
Ownership is enforced everywhere. A user can only edit/delete their own content (posts, stories, profile, messages). Any attempt to act on someone else's content is blocked server-side and shown as an error, not just hidden in the UI.


2. Feature-Specific Rules
Stories
Only image/video files allowed (per security.md MIME/size limits). If a user tries to upload anything else (e.g., a PDF, a .zip, a non-media file), show a popup: "Only photos or videos can be added to your story." Do not attempt to process or store the file.
A story is view-only content tied to its 24-hour lifecycle — it cannot be edited after posting (only deleted). If a user tries to "edit" a story, show: "Stories can't be edited after posting — delete and repost instead."
Stories cannot contain post-only actions (e.g., likes/comments) unless that feature is explicitly approved later — if attempted, block with an explanatory popup rather than a broken/half-built UI.
Posts
Only image files allowed for v1 (per skills.md — video posts are out of scope unless added later). If a user tries to upload a video or non-image file to a post, show: "Only photos can be added to a post right now."
Captions have a max length (define in technical.md/Zod schema); exceeding it should block submission with a clear character-count warning, not silently truncate.
A deleted post must cascade-remove its likes/comments — never leave orphaned data.
Profile
Username changes must be validated for uniqueness before save; if taken, show: "That username is already in use." Never silently reject or save a duplicate.
Bio/name fields must respect max-length limits; block save with a message if exceeded, don't silently cut the text.
Chat / DMs
Messages can only be sent to the intended recipient in that specific conversation — never broadcast, never cross-deliver to the wrong conversation.
If the encryption/decryption step fails for any reason (e.g., missing public key), the app must not send/display a broken or plaintext fallback message — it should show: "This message couldn't be sent securely. Please try again." Never silently downgrade to unencrypted delivery.
A user cannot message someone who has blocked them (once/if blocking is added — currently out of scope, tracked as a pending suggestion).
Follow / Search
A user cannot follow themselves. If attempted, block silently (disable the button) rather than showing an error — this is a UI-preventable case, not a user mistake to scold.
Search should never expose private data (email, password hash, etc.) in results — only public profile fields.


3. Error Handling Rules
User-facing errors are plain language, never raw stack traces or database errors. Example: instead of showing a Prisma/SQL error, show "Something went wrong. Please try again."
Every error is logged server-side (with enough context to debug — user id, action, timestamp) even though the user only sees the friendly message.
Network/connection failures (e.g., chat message fails to send, upload drops mid-way) should show a retry option, not just fail silently.
Out-of-scope actions get a popup, not a crash. This is the core "story rule" the presenter described: if a user tries to do something a feature isn't built for, the response is always a clear, specific popup message explaining what is and isn't allowed there — never a generic error, never a silent no-op, never a broken UI state.
Critical failures (auth/session errors) log the user out safely and redirect to login with a message like "Your session expired, please log in again" — never leave the app in a half-authenticated state.


4. Content & Behavior Rules
No feature should allow uploading executable files, scripts, or anything outside the approved media types listed in security.md.
No feature should allow a user to impersonate another user (e.g., no free-text "display name" field that mimics system messages/usernames of existing accounts in a misleading way) — flagged for consideration once moderation features are discussed.
All destructive actions (delete post, delete story, delete account) require a confirmation step before executing — never a single, accidental, irreversible tap.


5. When Something Goes Wrong — Standard Response Pattern
For any invalid/out-of-scope/failed action anywhere in the app, follow this same pattern every time, so behavior is consistent across the whole product:

Block the action before it reaches the database (validate first, act second).
Show one clear popup/toast stating what happened and, where relevant, what the user can do instead (e.g., "Only photos or videos can be added to your story.").
Log it server-side for debugging, without exposing internals to the user.
Leave the UI in a clean, unchanged state — no partial uploads, no half-saved data, no broken screens.


6. Pending / Not Yet Covered
Blocking/reporting users (mentioned above under Chat) — not yet in skills.md, add if approved.
Rate-limiting rules for repeated failed actions (e.g., spamming follow/unfollow) — not yet specified, candidate for security.md.
Content moderation rules (see Gemini.md §10 suggestion #9) — would extend this file once approved.

