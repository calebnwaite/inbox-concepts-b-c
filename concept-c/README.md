# Concept C: Swipe to Prioritize + Smart Inbox

Interactive prototype of Sketch #5. Static HTML, CSS and JavaScript only: no build step, no backend, no external requests.
Open `concept-c/index.html` directly (file://) or serve the repo folder from any static host.

## What it shows
Three linked views over one shared state (kept in memory and `localStorage`):
1. **Phone Sort**: drag the card right for *Priority* or left for *Later* (touch or mouse), or use the buttons, arrow keys and Undo. A counter shows how many are left.
2. **Desktop inbox**: reorders live, with animation, into "Priority · sorted by your swipes" and "Everything else". Each sender has a learned confidence score, so after two swipes right on Corey his other emails rise on their own. The "Why this order" panel explains every priority row, and "Sorting confidence" rises with each swipe. "Forward to Thomas?" and "Follow up?" ask for confirmation, then update the row (simulated).
3. **Phone Daily Summary**: priority email in depth with drawn attachment previews, everything else as quick hits, and an "Ask about today's email" chat with suggested questions and a typing indicator.

Persona: a project manager (Alex) at a commercial general contractor; Jeff, the Project Executive, is one of the senders (change order for unit 4B, inspection, pour schedule, supplier Corey, hand-offs to Thomas).

## How to demo
1. On a laptop the phone sits beside the desktop inbox. Swipe the first card right, then watch the inbox.
2. Swipe Corey's two emails right and watch his third email rise by itself, with a "Learned" badge.
3. Try "Forward to Thomas?", then switch the phone to **Summary** and ask "What needs a reply today?".
4. On a phone-sized screen the tab bar switches between Sort, Inbox and Summary. "?" replays the guided tour, "Reset demo" starts over. Add `?notour` to the URL to skip the tour.

## Limitations
- All data and answers are fake and canned (keyword matching, no AI). Forwarding and reminders are simulated.
- Learning is a simple per-sender score: a sender is promoted when about two-thirds of their emails are marked priority.
- State lives in the browser only. The phone and desktop are one page, not two devices.

## Tests
`node tests/run-all.mjs concept-c` runs the click-through tests (laptop and phone, headless Edge). `node concept-c/tests/shots.mjs` regenerates `docs/screenshots/concept-c-*.png`.
