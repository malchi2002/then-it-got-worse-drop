#!/bin/bash
# ship.sh <id> <mp4name> <repo-filename> <msg>
set -e
ID=$1; MP=$2; F=$3; MSG=$4; R=/home/claude/then-it-got-worse-drop
cp /home/claude/engine/videos/$ID/$MP.mp4 $R/videos/$F
mkdir -p $R/engine/videos/$ID && cp /home/claude/engine/videos/$ID/{spec.json,video.js} $R/engine/videos/$ID/
cp /home/claude/engine/ship.sh $R/engine/ 2>/dev/null || true
cd $R && git add -A && git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -qm "$MSG

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GDUEGe5Cwn379iPzJxnAxt" && git -c push.negotiate=true push -q 2>&1 | grep -v negotiat || true
sleep 12; curl -sI -r 0-10 https://raw.githubusercontent.com/malchi2002/then-it-got-worse-drop/main/videos/$F | grep -E "^HTTP/2"
