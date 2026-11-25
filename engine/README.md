# Then It Got Worse — Short video engine

Each video lives in `videos/<id>/` with `spec.json` (script, SFX, music style) and `video.js` (3D shots, built on `web/lib.js`).

Pipeline (cloud workspace with Chrome at /usr/bin/google-chrome):
1. `./setup.sh` (once): npm/pip deps, Kokoro TTS model + voices (from npm packages).
2. `python3 tts.py videos/<id>` -> voice.wav + timeline.json
3. `node render.mjs <id> stills 1,5,10` -> preview stills; `python3 sheet.py videos/<id>`
4. `node render.mjs <id> range 0 <frames>` -> frames (30 fps, 1080x1920, ~230 ms/frame)
5. `./finish.sh <id> <name>` -> original music + SFX mix + mp4 at -14 LUFS
6. Copy mp4 to `../videos/`, push, schedule via Metricool (brand ThenItGotWorse, YouTube + Instagram).

Narrator: Kokoro `am_michael` (speed 1.08); dialogue `bm_george`. Recurring hero: Dale (orange wooden mannequin, red nose).
Format: "What if every X was 3x Y than the last?" ladder, HUD counter, "Then it got worse." pivot card, real-physics fact ending.
