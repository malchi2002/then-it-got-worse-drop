#!/bin/bash
# ship3.sh <id> <base>  -> videos/<base>_v3.mp4 + covers/<base>.jpg
set -e
ID=$1; B=$2; R=/home/claude/then-it-got-worse-drop; E=/home/claude/engine
C=$(python3 -c "import json;d=json.load(open('$E/videos/$ID/timeline.json'));print(round(d['hook']['end']+0.05,2))")
mkdir -p $R/covers; ffmpeg -v error -y -ss $C -i $E/videos/$ID/v2.mp4 -frames:v 1 -q:v 2 $R/covers/$B.jpg
cp $E/videos/$ID/v2.mp4 $R/videos/${B}_v3.mp4
mkdir -p $R/engine/videos/$ID && cp $E/videos/$ID/{spec.json,video.js} $R/engine/videos/$ID/; cp $E/{hooks.json,transform.py,tts.py,ship3.sh} $R/engine/; cp $E/web/lib.js $R/engine/web/
cd $R && git add -A && git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -qm "$ID: spoken hook + cover (v3)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GDUEGe5Cwn379iPzJxnAxt" && git push -q 2>&1 | grep -v negotiat || true
sleep 10; for p in videos/${B}_v3.mp4 covers/$B.jpg; do curl -sI -r 0-10 https://raw.githubusercontent.com/malchi2002/then-it-got-worse-drop/main/$p | grep -E "^HTTP/2" | tr -d '\r'; done
