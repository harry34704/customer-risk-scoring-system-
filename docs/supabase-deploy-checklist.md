# Supabase Deployment Checklist

This project uses Supabase for:

- Postgres
- Auth (email/password)

Application hosting remains:

- Frontend: Vercel
- Backend: Render

## 1. Create the Supabase project

Create a project in Supabase and capture these values:

- Project URL
- Anon key
- Service role key
- Postgres connection string

## 2. Configure Supabase Auth

Under `Authentication > Providers`:

- Enable `Email`
- If you want the demo seed users to log in immediately, disable email confirmations for local/dev

Under `Authentication > URL Configuration` add:

- `http://localhost:3000`
- Your Vercel production URL

## 3. Apply the database schema

Run from the backend:

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

This creates:

- `users`
- `applicants`
- `applicant_financials`
- `payment_history`
- `scoring_rules`
- `risk_scores`
- `audit_logs`

## 4. Seed demo data

If `SUPABASE_SERVICE_ROLE_KEY` is set, the seed job will also create the demo auth users in Supabase Auth.

```bash
cd backend
source .venv/bin/activate
python -m app.seed --reset --applicants 500 --refresh-model
```

## 5. Required environment variables

### Frontend

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_BASE_URL=https://your-render-api.onrender.com/api/v1
```

### Backend

```env
DATABASE_URL=postgresql+psycopg://postgres:password@db.your-project.supabase.co:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
FRONTEND_URL=https://your-vercel-app.vercel.app
LOGISTIC_MODEL_PATH=app/data/logistic_baseline.json
SEED_DEMO_PASSWORD=Demo123!
```

## 6. Deployment order

1. Create/configure Supabase project
2. Set backend env vars on Render
3. Deploy backend and run migrations
4. Seed demo data
5. Set frontend env vars on Vercel
6. Deploy frontend
7. Add final Vercel URL to Supabase Auth allowed URLs

## 7. Demo accounts

- `demo@riskscore.local / Demo123!`
- `analyst@riskscore.local / Demo123!`

## 8. What still needs real project input

Before the full app can function against Supabase, replace the placeholder local env values with:

- real `SUPABASE_URL`
- real `SUPABASE_ANON_KEY`
- real `SUPABASE_SERVICE_ROLE_KEY`
- real `DATABASE_URL`
