#!/bin/bash
# Xuất intro Pika từ lõi core/: tiếng của từng kiểu (sound/mix-pN.wav), MP4 nền trắng, MOV ProRes 4444 nền trong suốt, PNG có alpha.
# Cần: Google Chrome, Node 18+, Python 3 + numpy, ffmpeg (brew install ffmpeg).
# Dùng: tools/export.sh               mọi kiểu, ra export/ (MP4 xem thử chép vào preview/)
#       VARIANTS="P5 P9" tools/export.sh   chỉ vài kiểu
set -e
cd "$(dirname "$0")"
FFMPEG="${FFMPEG:-ffmpeg}"
OUT=../export; mkdir -p "$OUT/png-alpha" ../preview
TMP=$(mktemp -d)
node build.mjs >/dev/null
ALL=$(ls ../core/variants | sed -n 's/^p\([0-9]*\)-.*\.js$/P\1/p' | sort -t P -k2 -n | tr '\n' ' ')
for V in ${VARIANTS:-$ALL}; do
  v=$(echo $V | tr 'P' 'p'); NAME=$(ls ../core/variants | grep "^$v-" | sed 's/\.js$//'); N="pika-intro-$NAME"
  VARIANT=$V node render.mjs "$TMP/$V/white" 30 white &
  VARIANT=$V node render.mjs "$TMP/$V/alpha" 30 none &
  wait
  DUR=$(python3 -c "print($(ls $TMP/$V/white/f*.png | wc -l) / 30)")
  python3 sfx.py "$TMP/$V/white/events.json" "$TMP/$V/sfx.wav" $DUR >/dev/null
  python3 mix_voice.py "$TMP/$V/sfx.wav" ../sound/voice-pika.wav "$(cat $TMP/$V/white/voice.txt)" "../sound/mix-$v.wav"
  "$FFMPEG" -y -loglevel error -framerate 30 -i "$TMP/$V/white/f%04d.png" -i "../sound/mix-$v.wav" \
    -c:v libx264 -pix_fmt yuv420p -crf 16 -c:a aac -b:a 192k -shortest "$OUT/$N.mp4"
  "$FFMPEG" -y -loglevel error -framerate 30 -i "$TMP/$V/alpha/f%04d.png" -i "../sound/mix-$v.wav" \
    -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le -c:a pcm_s16le -shortest "$OUT/$N-alpha.mov"
  rm -rf "$OUT/png-alpha/$N"; mv "$TMP/$V/alpha" "$OUT/png-alpha/$N"
  cp "$OUT/$N.mp4" ../preview/
done
node build.mjs >/dev/null      # chép tiếng mới sang 2 dự án mẫu
rm -rf "$TMP"
echo "Xong: $OUT"
