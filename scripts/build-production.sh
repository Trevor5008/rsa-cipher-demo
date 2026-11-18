#!/usr/bin/env bash
# Production build used by Render (and for local gunicorn smoke tests).
# Installs Python deps, then builds the Vite app into frontend/dist for Flask to serve.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

python -m pip install -r requirements.txt

cd frontend
npm ci
npm run build
