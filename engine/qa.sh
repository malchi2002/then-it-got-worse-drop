#!/bin/bash
# qa.sh <id>  -> /tmp/qa_<id>.jpg + duration
cd /home/claude/engine/videos/$1
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 v2.mp4); echo "$1 dur=$D"
E=$(python3 -c "print($D-0.8)"); M=$(python3 -c "print($D/2)")
i=0; for t in 0.4 2 $M $E; do ffmpeg -v error -y -ss $t -i v2.mp4 -frames:v 1 -vf scale=300:-1 /tmp/q$i.jpg; i=$((i+1)); done
ffmpeg -v error -y -i /tmp/q0.jpg -i /tmp/q1.jpg -i /tmp/q2.jpg -i /tmp/q3.jpg -filter_complex hstack=4 /tmp/qa_$1.jpg
