#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "$0")/.." && pwd)
source_dir="$repo_root/public/assets/backgrounds/source"
output_dir="$repo_root/public/assets/backgrounds/layers"

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick's magick command is required." >&2
  exit 1
fi

mkdir -p "$output_dir"

themes=(neon-harbor frost-citadel verdant-arcology violet-rift ember-bastion)

for theme in "${themes[@]}"; do
  source="$source_dir/$theme.png"
  if [[ ! -f "$source" ]]; then
    echo "Missing source panorama: $source" >&2
    exit 1
  fi

  normalized="/tmp/heavy-ball-$theme-normalized.png"
  mid_mask="/tmp/heavy-ball-$theme-mid-mask.png"
  near_mask="/tmp/heavy-ball-$theme-near-mask.png"

  # Preserve the authored proportions. Heavy Ball renders these on 16:9
  # camera-facing planes, so crop the panorama's outer edges instead of
  # stretching it into a different shape.
  magick "$source" -resize '1920x1080^' -gravity center -extent 1920x1080 \
    -strip "$normalized"

  # The far layer retains the complete panorama. The mild blur keeps gameplay
  # geometry crisp against it and lets the extracted layers read as depth.
  magick "$normalized" -blur 0x0.7 -quality 84 \
    "$output_dir/$theme-far.webp"

  # Mid layer: fade in across the lower 62% of the panorama, slightly sharpen,
  # and lower opacity so its offset reads as atmospheric depth rather than a
  # duplicated photograph.
  magick -size 1920x410 xc:black -size 1920x670 gradient:black-white \
    -append "$mid_mask"
  magick "$normalized" -modulate 92,105,100 -sharpen 0x0.8 \
    "$mid_mask" -alpha off -compose CopyOpacity -composite \
    -channel A -evaluate multiply 0.42 +channel -quality 82 \
    "$output_dir/$theme-mid.webp"

  # Near layer: only the bottom 34% survives, darkened into a foreground rim.
  # It travels the most and supplies the strongest parallax cue.
  magick -size 1920x713 xc:black -size 1920x367 gradient:black-white \
    -append "$near_mask"
  magick "$normalized" -modulate 48,85,100 -blur 0x0.25 \
    "$near_mask" -alpha off -compose CopyOpacity -composite \
    -channel A -evaluate multiply 0.72 +channel -quality 82 \
    "$output_dir/$theme-near.webp"
done

echo "Built ${#themes[@]} Heavy Ball background depth stacks in $output_dir"
