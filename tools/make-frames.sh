#!/bin/sh
# Rebuilds the scroll animation frames from a video.
# Usage (from the wedding-site folder):  sh tools/make-frames.sh path/to/video.mp4
# Needs ffmpeg. Afterwards, set data-frames="<count>" on the .bg element in index.html.
rm -rf media/frames && mkdir -p media/frames
ffmpeg -v error -y -i "$1" -an -vf "fps=30,scale=720:-2" -c:v libwebp -quality 78 -start_number 1 media/frames/%03d.webp
echo "Done: $(ls media/frames | wc -l) frames -> set data-frames=\"$(ls media/frames | wc -l)\" in index.html"
