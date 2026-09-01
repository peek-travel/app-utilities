#!/usr/bin/env bash
#
# Compile the CLI (with the repo's own tsc — no extra dependency) and run it.
# Static config is read from ./.env; the auth token is the first argument.
#
#   ./run.sh <authToken> <functionName> [params...]
#   ./run.sh help
#   ./run.sh help <functionName>
#
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"

TSC="$ROOT/node_modules/typescript/bin/tsc"
if [ ! -f "$TSC" ]; then
  echo "typescript not found at $TSC — run 'npm install' in the repo root first." >&2
  exit 1
fi

# Incremental compile: only the first run (or after a source change) pays tsc.
node "$TSC" -p "$DIR/tsconfig.json"

# cwd = this folder so the CLI reads ./.env from here.
cd "$DIR"
exec node "$DIR/.build/scripts/gql-cli/cli.js" "$@"
