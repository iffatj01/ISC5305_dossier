#!/usr/bin/env bash
# check_dossier.sh — form check for the AI dossier (§16 item 8 kit).
# Checks FORM only: title, required headings in order, no unfilled slots, caps.
# It cannot judge substance — that is graded by a human. Passing this script
# means "gradable", not "good".
#
# Usage: ./check_dossier.sh <dossier-file>     exit 0 = form OK, exit 1 = fix and re-run
set -euo pipefail

f="${1:-}"
if [ -z "$f" ] || [ ! -f "$f" ]; then
  echo "FAIL: usage: ./check_dossier.sh <dossier-file> (file not found: '${f}')"
  exit 1
fi

if grep -q $'\r' "$f"; then
  echo "FAIL: ${f} has Windows (CRLF) line endings — every check would misfire. Re-save as LF (e.g. run: dos2unix ${f}) and re-run"
  exit 1
fi

title="$(head -n1 "$f")"
case "$title" in
  "# AI Dossier — Full Form") variant=full ;;
  "# AI Dossier — Lite")      variant=lite ;;
  *) echo "FAIL: first line must be '# AI Dossier — Full Form' or '# AI Dossier — Lite' (got: ${title})"; exit 1 ;;
esac

H_MODEL="## Model and settings"
H_COUNT="## Total prompts"
H_PROMPT="## Best prompt (verbatim)"
H_MISTAKE="## The mistake I caught (symptom → evidence → fix)"
H_PIN="## What I'd pin next time"

if [ "$variant" = full ]; then
  headings=("$H_MODEL" "$H_COUNT" "$H_PROMPT" "$H_MISTAKE" "$H_PIN")
else
  headings=("$H_MODEL" "$H_PROMPT" "$H_MISTAKE")
fi

for h in "${headings[@]}"; do
  if ! grep -qxF "$h" "$f"; then
    echo "FAIL: missing required heading: ${h}"
    echo "  (keep headings exactly as seeded in the template — including the — and → characters; don't retype them)"
    exit 1
  fi
done

got="$(grep '^## ' "$f" || true)"
want="$(printf '%s\n' "${headings[@]}")"
if [ "$got" != "$want" ]; then
  echo "FAIL: headings out of order, duplicated, or extra heading present — expected exactly, in order:"
  printf '  %s\n' "${headings[@]}"
  echo "  (note: any line starting with '## ' counts as a heading — even inside a code fence; if your pasted prompt contains one, indent it)"
  exit 1
fi

if grep -qF "(your entry)" "$f"; then
  echo "FAIL: unfilled slot — replace every '(your entry)' placeholder with your own text"
  exit 1
fi

# Per-field content-line counts. A content line is non-empty, not a heading,
# not a '<!--' hint line, and inside a field (preamble before the first ## is free).
counts_for() {  # $1 = heading; prints that field's content-line count
  awk -v want="$1" '
    incmt   {if (index($0, "-->")) incmt = 0; next}
    /^<!--/ {if (!index($0, "-->")) incmt = 1; next}
    /^## /  {insec = ($0 == want); next}
    /^[[:space:]]*$/ {next}
    insec   {n++}
    END {print n + 0}
  ' "$f"
}

for h in "${headings[@]}"; do
  if [ "$(counts_for "$h")" -eq 0 ]; then
    echo "FAIL: empty field: ${h}"
    exit 1
  fi
done

if [ "$variant" = lite ]; then
  total=0
  for h in "${headings[@]}"; do
    total=$(( total + $(counts_for "$h") ))
  done
  if [ "$total" -gt 10 ]; then
    echo "FAIL: ${total} content lines total — over the 10-content-line cap (over cap = ungraded)"
    exit 1
  fi
else
  m="$(counts_for "$H_MISTAKE")"
  if [ "$m" -gt 5 ]; then
    echo "FAIL: '${H_MISTAKE}' has ${m} content lines — over the 5-line cap (over cap = ungraded)"
    exit 1
  fi
  p="$(counts_for "$H_PIN")"
  if [ "$p" -gt 2 ]; then
    echo "FAIL: '${H_PIN}' has ${p} content lines — over the 2-line cap (over cap = ungraded)"
    exit 1
  fi
fi

echo "OK: ${f} — form check passed (${variant} form). Substance is graded by a human."
