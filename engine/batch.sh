#!/bin/bash
# batch.sh vid1 vid2 ... : transform, tts, render, finish -> <vid>/v2.mp4
cd /home/claude/engine
for v in "$@"; do
  echo "=== $v $(date +%T)"
  python3 transform.py $v || continue
  python3 tts.py videos/$v 2>/dev/null | head -1
  N=$(python3 -c "import json,math;d=json.load(open('videos/$v/timeline.json'));print(math.ceil((d['dur']+0.05)*30))")
  rm -rf videos/$v/frames
  node render.mjs $v range 0 $N 2>&1 | grep -E "ERR|Error" | head -3
  ./finish.sh $v v2 2>&1 | tail -1
  echo "done $v frames=$N $(date +%T)"
done
