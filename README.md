# The Long Lie-In: test room (v3 hall)

Private test build. Plain HTML/CSS/JS, no build step.

Run locally: `cd site && python3 -m http.server 8123`, then open http://localhost:8123/

Touch: hold the left/right arrows, tap JUMP (a second finger while holding a direction gives a running jump), tap a pocket to drop its item, plus pause and mute.
Keys: arrows or A/D to move, Space/Up/W to jump, P/Esc to pause, M to mute, 1/2 to drop.

Test: `cd tools/pw && node test.js 844 390` (Playwright with touch emulation; needs the local server on port 8123).
