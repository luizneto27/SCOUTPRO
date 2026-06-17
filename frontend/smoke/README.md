Frontend static pages for ScoutPro (smoke tests)

How to run locally:

1. Start the backend and ensure it's reachable at http://localhost:8080
2. From this folder run a static server, for example:

```bash
cd frontend/smoke
python3 -m http.server 8000
# or: npx http-server -p 8000
```

3. Open http://localhost:8000 in the browser.

Notes:
- Pages use the API at `/api/v1/*` on the same host by default. If your backend is on a different host/port edit `assets/app.js` -> `BASE_URL`.
- These pages are minimal, intended for quick manual verification before opening a PR to `develop`.
