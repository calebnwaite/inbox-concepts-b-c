# Concept B: Mobile-First, Hands-Free

Interactive high-fidelity prototype (Sketch #3). Static HTML, CSS and classic JavaScript: no backend, no build, no
external fonts or CDNs. Open `concept-b/index.html` directly (file://) or serve the repo folder over http.

## What it shows
- **Verbal updates (Listen tab):** "Now reading 1 of 9" with an animated waveform, Read aloud (speech synthesis), a big
  mic with simulated speech-to-text (Send / Edit / Cancel), Skip, Next, and "Set reply-by".
- **Automatic calendar (Day tab):** Mon-Fri tabs; reply-by deadlines from emails appear automatically and are struck
  through once replied; "Read my day aloud".
- **Easy swipe organizer (Sort tab):** drag the card with finger or mouse: up forwards, right replies, down saves, left
  deletes. Buttons do the same, with Undo and an empty state.
- **Folders + workload (Work tab):** six stat cards and folder counts that change as you reply and sort; Reset demo.
- A guided tour (first visit, "?" to replay). On a laptop the app sits in a phone frame with a caption; on a phone it is
  full screen with a bottom tab bar. State is shared across screens and saved in localStorage.

## How to demo
1. Listen: tap the mic, watch the transcript type, Send. Then Next, tap "Reply by", pick Wed 3:00 PM, Add to calendar.
2. Day: Monday shows Jeff's reply struck through; open Wednesday to see the new 3:00 PM deadline.
3. Sort: swipe the change order card in all four directions (or use the buttons), then Undo.
4. Work: see the numbers move; Reset demo restores the sample inbox.

## Limitations
- Replies, forwards and deletes are simulated; no email is sent. The data is fake (a construction GC).
- Real speech: the optional "Use my real microphone" switch uses the Web Speech API where the browser allows it and
  otherwise falls back to the simulated transcript (with a console warning). Read aloud needs a tap first (browser rule)
  and does nothing audible if the browser has no voices.
- Reply-by times are limited to Mon-Fri on the hour, 7:00 AM-5:00 PM.

## Tests
`node tests/run-all.mjs concept-b` (headless Edge, served on 127.0.0.1:8132, plus a file:// smoke test).
`node concept-b/tests/shots.mjs` regenerates `docs/screenshots/concept-b-*.png`.
