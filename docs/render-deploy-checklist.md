# Render Deployment Checklist

This checklist assumes you are deploying the current Render-only version of the app:

- Next.js frontend on Render
- FastAPI backend on Render
- Render Postgres
- in-app email/password auth

## 1. Push the repository to GitHub

1. Create an empty GitHub repository.
2. Add the remote:

```bash
git remote add origin https://github.com/<your-user>/<your-repo>.git
```

3. Push the code:

```bash
git push -u origin main
```

## 2. Create the Render Blueprint

1. In Render, choose `New +`.
2. Choose `Blueprint`.
3. Connect the GitHub repository.
4. Select the repo root that contains `render.yaml`.
5. Confirm the Blueprint creates:
   - `customer-risk-scoring-db`
   - `customer-risk-scoring-api`
   - `customer-risk-scoring-web`

## 3. Set the backend environment variables

In the API service, confirm these values:

- `DATABASE_URL`
  Source: `customer-risk-scoring-db` -> `connectionString`
- `CORS_ORIGINS`
  Set this manually to your web service origin, for example `https://your-web-service.onrender.com`
- `FRONTEND_URL`
  Set this manually to your web service origin, for example `https://your-web-service.onrender.com`
- `AUTH_SECRET_KEY`
  Use the generated value from the Blueprint or replace it with your own long random secret.
- `AUTH_TOKEN_TTL_MINUTES`
  Set to `10080`
- `LOGISTIC_MODEL_PATH`
  Set to `app/data/logistic_baseline.json`
- `SEED_DEMO_PASSWORD`
  Set to `Demo123!` or your preferred demo password

## 4. Set the frontend environment variable

In the web service, confirm:

- `NEXT_PUBLIC_API_BASE_URL`
  Set this manually to `https://your-api-service.onrender.com` or `https://your-api-service.onrender.com/api/v1`

## 5. Deploy both services

1. Trigger a deploy from the Blueprint or from each service dashboard.
2. Wait for the API health check at `/healthz` to pass.
3. Wait for the frontend `/login` page to load.
4. If the frontend still shows `Missing required environment variable: NEXT_PUBLIC_API_BASE_URL`, open the web service in Render, confirm the env var exists, then trigger a manual redeploy.

## 6. Run the seed job

Preferred option if your Render plan includes shell access:

```bash
cd /opt/render/project/src/backend
python -m app.seed --reset --applicants 500 --refresh-model
```

Free-plan alternative if shell access is unavailable:

1. Open `customer-risk-scoring-db` in Render.
2. Click `Connect`.
3. Copy the `External Database URL`.
4. From your local machine, run:

```bash
cd backend
source .venv/bin/activate
DATABASE_URL='postgresql://...' alembic upgrade head
DATABASE_URL='postgresql://...' SEED_DEMO_PASSWORD='Demo123!' PYTHONPATH=. python -m app.seed --reset --applicants 500 --refresh-model
```

This creates the demo users, a private 500-applicant workspace for each demo login, scoring rules, score records, and the logistic baseline artifact.

## 7. Verify the deployment

1. Open the frontend `/login` page.
2. Sign in with:
   - `demo@riskscore.local` / `Demo123!`
   - `analyst@riskscore.local` / `Demo123!`
   - or create your own account and click `Load demo workspace`
3. Verify these routes:
   - `/dashboard`
   - `/applicants`
   - `/imports`
   - `/reports`
   - `/settings`

## 8. If you deployed from an older local database snapshot

If your database was created from the earlier Supabase-auth version of the app:

1. Run:

```bash
alembic upgrade head
```

2. Rerun the seed job so demo users receive local password hashes:

```bash
python -m app.seed --reset --applicants 500 --refresh-model
```
