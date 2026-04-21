# steam-insights-frontend

Frontend web app for report and recommender UI.

## Run (local)

```powershell
cd frontend
npm install
npm run dev
```

By default, local `/api` requests are proxied to `http://localhost:8000`.

## Environment

Copy `.env.example` to `.env` and set values:

- `VITE_API_URL`: backend public base URL (for production)
- `VITE_DEV_API_PROXY`: local dev proxy target (optional)

## Deployment note (Vercel)

- Set `VITE_API_URL` to the deployed AWS backend URL.
- Do not assume same-origin API in production.
