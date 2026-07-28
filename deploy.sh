#!/usr/bin/env bash
#
# Publish this site to DSC personal web space.
#
#   ./deploy.sh                 # uses the settings below
#   FSUID=abc23b ./deploy.sh    # or override per run
#
# Result: https://people.sc.fsu.edu/~$FSUID/$SUBDIR/
#
set -euo pipefail

FSUID="${FSUID:-}"
SUBDIR="${SUBDIR:-5305}"
GATEWAY="${GATEWAY:-pamd.sc.fsu.edu}"

if [[ -z "$FSUID" ]]; then
  echo "Set your FSUID first: edit this file, or run  FSUID=yourid ./deploy.sh" >&2
  exit 1
fi

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="public_html${SUBDIR:+/$SUBDIR}"

# The web server runs as another user, so the path down to the files must be
# traversable and the files themselves world-readable.
ssh "$FSUID@$GATEWAY" "
  set -e
  mkdir -p ~/'$DEST'
  chmod 0711 ~
  chmod 755 ~/public_html
"

rsync -rlvz --delete \
  --chmod=D755,F644 \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude 'deploy.sh' \
  --exclude 'mirror_course.py' \
  -e ssh \
  "$SRC"/ "$FSUID@$GATEWAY:~/$DEST/"

echo
echo "Published: https://people.sc.fsu.edu/~$FSUID/${SUBDIR:+$SUBDIR/}"
