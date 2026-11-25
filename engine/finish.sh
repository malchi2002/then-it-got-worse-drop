#!/bin/bash
# usage: finish.sh <vid> <outname>
set -e; V=/home/claude/engine/videos/$1
python3 /home/claude/engine/music.py $V && python3 /home/claude/engine/mix.py $V
ffmpeg -y -loglevel error -framerate 30 -i $V/frames/f%05d.jpg -i $V/mix.wav -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -af "loudnorm=I=-14:TP=-1.5:LRA=11" -shortest -movflags +faststart $V/$2.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 $V/$2.mp4
