#!/bin/bash
# re-render frames + encode only (spec/tts unchanged)
cd /home/claude/engine
for v in "$@"; do
  N=$(python3 -c "import json,math;d=json.load(open('videos/$v/timeline.json'));print(math.ceil((d['dur']+0.05)*30))")
  rm -rf videos/$v/frames; node render.mjs $v range 0 $N 2>&1 | grep -E "ERR|Error" | head -3
  ./finish.sh $v v2 2>&1 | tail -1; echo "redone $v $(date +%T)"
done
