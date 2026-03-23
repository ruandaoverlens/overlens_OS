#!/bin/bash
# Process videos: create web previews and copy originals to download folder
# Preview: 720p H.264, CRF 28, fast start for web streaming
# Download: original quality copy

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Use Windows-style path for ffmpeg compatibility
WIN_DIR="$(cygpath -w "$SCRIPT_DIR" 2>/dev/null || echo "$SCRIPT_DIR")"
PREVIEW_DIR="$SCRIPT_DIR/preview"
DOWNLOAD_DIR="$SCRIPT_DIR/download"
WIN_PREVIEW="$(cygpath -w "$PREVIEW_DIR" 2>/dev/null || echo "$PREVIEW_DIR")"

total=0
processed=0
skipped=0
failed=0

# Collect and sort videos alphabetically
mapfile -t sorted_files < <(for f in "$SCRIPT_DIR"/*.mp4; do [ -f "$f" ] && basename "$f"; done | sort)
total=${#sorted_files[@]}

echo "========================================"
echo "  Video Processing for Brand Assets"
echo "========================================"
echo "Total videos to process: $total"
echo ""

for filename in "${sorted_files[@]}"; do
  f="$SCRIPT_DIR/$filename"
  processed=$((processed + 1))

  echo "[$processed/$total] Processing: $filename"

  # Copy original to download folder
  if [ ! -f "$DOWNLOAD_DIR/$filename" ]; then
    cp "$f" "$DOWNLOAD_DIR/$filename"
    echo "  -> Original copied to download/"
  else
    echo "  -> Original already in download/ (skipped copy)"
  fi

  # Create web preview
  if [ -f "$PREVIEW_DIR/$filename" ]; then
    echo "  -> Preview already exists (skipped)"
    skipped=$((skipped + 1))
    continue
  fi

  # Use Windows paths to avoid ffmpeg issues with brackets in filenames
  win_input="$WIN_DIR\\$filename"
  win_output="$WIN_PREVIEW\\$filename"

  ffmpeg -i "$win_input" \
    -vf "scale=-2:720" \
    -c:v libx264 -crf 28 -preset medium \
    -c:a aac -b:a 128k \
    -movflags +faststart \
    -y "$win_output" \
    -loglevel warning -stats 2>&1

  if [ $? -eq 0 ]; then
    # Show size comparison
    orig_size=$(stat -c%s "$f" 2>/dev/null || stat -f%z "$f" 2>/dev/null)
    prev_size=$(stat -c%s "$PREVIEW_DIR/$filename" 2>/dev/null || stat -f%z "$PREVIEW_DIR/$filename" 2>/dev/null)
    if [ -n "$orig_size" ] && [ -n "$prev_size" ] && [ "$orig_size" -gt 0 ]; then
      reduction=$(( (orig_size - prev_size) * 100 / orig_size ))
      echo "  -> Preview created (${reduction}% smaller)"
    else
      echo "  -> Preview created"
    fi
  else
    echo "  -> ERROR: Failed to create preview"
    failed=$((failed + 1))
  fi

  echo ""
done

echo "========================================"
echo "  Processing Complete"
echo "========================================"
echo "Total:    $total"
echo "Skipped:  $skipped"
echo "Failed:   $failed"
echo ""
echo "Preview folder: $PREVIEW_DIR"
echo "Download folder: $DOWNLOAD_DIR"
