# Deploy notes

## Eligibility

| Platform | Fit | Notes |
| --- | --- | --- |
| **Render** (recommended) | Good | Blueprint in [`render.yaml`](../../render.yaml); one gunicorn service serves UI + API |
| Railway / Fly.io | Good | Same `Procfile` / gunicorn model; no Blueprint checked in |
| **Vercel** | Poor as-is | Static/serverless focus; would require splitting SPA + API and restoring a production API base URL |
| Heroku-style | Good | Historical target; `Procfile` still present |

## Render from GitHub

1. Connect [Trevor5008/rsa-cipher-demo](https://github.com/Trevor5008/rsa-cipher-demo) in the Render dashboard via **Blueprint**.
2. Build: `./scripts/build-production.sh` (needs `NODE_VERSION` / `PYTHON_VERSION` from the Blueprint).
3. Start: `gunicorn --bind 0.0.0.0:$PORT app:app`.
4. Smoke on the public URL: Bigger primes → encrypt `test` → **Decrypt this** → recovered `test`.

The learning UI keeps same-origin API calls in production (`getApiBaseUrl()` returns `""`).

## Local production smoke (2026-11-18)

Exercised the Render recipe without a public `onrender.com` URL (Blueprint connect is a one-time dashboard step):

- `npm run build` → `frontend/dist` present
- `gunicorn --bind 0.0.0.0:5055 app:app`
- `GET /` and hashed asset → 200
- Bigger primes keys → encrypt `test` → decrypt → `test` (4 trace rows)

After connecting the GitHub repo in Render, repeat the same walkthrough on the public service URL.
