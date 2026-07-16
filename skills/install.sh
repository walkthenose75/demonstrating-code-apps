#!/usr/bin/env bash
# Installs the vendored Copilot skills into ~/.copilot/skills so Copilot can discover them.
# Usage:  ./skills/install.sh
set -euo pipefail
src="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
dest="$HOME/.copilot/skills"
mkdir -p "$dest"

for dir in "$src"/*/; do
  name="$(basename "$dir")"
  cp -R "$dir" "$dest/"
  echo "installed skill -> $dest/$name"
done
echo "Done. Restart Copilot if it was already running so it picks up the skills."
