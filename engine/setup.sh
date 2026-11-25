#!/bin/bash
# One-time setup for a fresh workspace. Run from engine/.
set -e
cd "$(dirname "$0")"
npm i three@0.170.0 puppeteer-core@23 --silent
pip install --break-system-packages -q kokoro-onnx soundfile scipy pillow
mkdir -p /home/claude/dl && cd /home/claude/dl
npm pack kokoro-q8-shards@1.0.0 @beatsheet/voice-kokoro@0.3.0 --silent >/dev/null
mkdir -p q8 bs && tar -xzf kokoro-q8-shards-1.0.0.tgz -C q8 && tar -xzf beatsheet-voice-kokoro-0.3.0.tgz -C bs
cat q8/package/kokoro-q8.part{0,1,2,3,4,5}.bin > kokoro-q8.onnx
echo "fbae9257e1e05ffc727e951ef9b9c98418e6d79f1c9b6b13bd59f5c9028a1478  kokoro-q8.onnx" | sha256sum -c
python3 -c "
import numpy as np,glob,os
v={os.path.basename(p)[:-4]: np.fromfile(p,dtype=np.float32).reshape(-1,1,256) for p in glob.glob('bs/package/voices/*.bin')}
np.savez('voices.npz',**v); print('voices',len(v))"
