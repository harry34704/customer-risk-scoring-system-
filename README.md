# Customer Risk Scoring System

Portfolio-grade full-stack underwriting workspace built with Next.js 14, TypeScript, Tailwind CSS, FastAPI, SQLAlchemy/Alembic, and Supabase Postgres/Auth. The application scores applicants with both configurable deterministic rules and a synthetic logistic regression baseline, exposes explainable top-factor breakdowns, supports bulk CSV ingestion, and ships with seeded demo data for 500 applicants.

Full repo structure is captured in [docs/folder-tree.txt](./docs/folder-tree.txt).

## Feature set

- Supabase email/password authentication
- Dashboard with risk distribution, defaults by month, recovery by segment, and score trend charts
- Applicant list with filter/search and manual-entry form
- Applicant detail pages with dual-mode scores, top-factor explanation cards, payment history, and audit trail
- Configurable scoring rules editor with portfolio rescoring
- CSV uploads for applicants and payment histories
- Report summary page with CSV export and PDF export
- Seed workflow for 500 realistic demo applicants and demo credentials
- Backend scoring tests and frontend critical-flow tests

## Architecture

### Frontend

- `frontend/`
- Next.js 14 App Router
- TypeScript + Tailwind CSS
- Supabase SSR/browser clients for auth
- Recharts for dashboard visualizations

### Backend

- `backend/`
- FastAPI + SQLAlchemy 2.0
- Alembic migrations
- Supabase Postgres via `DATABASE_URL`
- Supabase Auth validation via `/auth/v1/user`
- Seed CLI with demo data + optional Supabase Auth user provisioning

### Core domain tables

- `users`
- `applicants`
- `applicant_financials`
- `payment_history`
- `scoring_rules`
- `risk_scores`
- `audit_logs`

## Local setup

### 1. Create a Supabase project

1. Create a new Supabase project.
2. Enable Email authentication under `Authentication > Providers`.
3. For easiest local demo seeding, disable email confirmation or use the Auth admin seed path with `SUPABASE_SERVICE_ROLE_KEY`.
4. Copy:
   - Project URL
   - Anon key
   - Service role key
   - Postgres connection string

### 2. Configure environment variables

Copy the example files:

```bash
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env
```

Set the frontend variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Set the backend variables:

```env
DATABASE_URL=postgresql+psycopg://postgres:password@db.your-project.supabase.co:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
LOGISTIC_MODEL_PATH=app/data/logistic_baseline.json
SEED_DEMO_PASSWORD=Demo123!
```

### 3. Install backend dependencies

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
```

### 4. Run database migrations

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

This applies the application schema into your Supabase Postgres `public` schema.

### 5. Seed model artifact, demo users, and 500 applicants

```bash
cd backend
source .venv/bin/activate
python -m app.seed --reset --applicants 500 --refresh-model
```

Notes:

- If `SUPABASE_SERVICE_ROLE_KEY` is set, the seed command will attempt to create the demo auth users directly in Supabase Auth.
- If you omit the service role key, the seed still creates the application-side user profiles and applicant/demo records. You can then sign up the demo accounts manually through the UI with the same credentials.

### 6. Start the backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`, with app routes under `http://127.0.0.1:8000/api/v1`.

### 7. Install frontend dependencies

```bash
cd frontend
npm install
```

### 8. Start the frontend

```bash
cd frontend
npm run dev
```

The frontend runs at `http://localhost:3000`.

## Demo credentials

Use either seeded demo account:

- `demo@riskscore.local` / `Demo123!`
- `analyst@riskscore.local` / `Demo123!`

## Testing

### Backend

```bash
cd backend
source .venv/bin/activate
pytest
```

### Frontend

```bash
cd frontend
npm run test
```

## Seed and screenshot workflow

For a clean screenshot/demo cycle:

```bash
cd backend
source .venv/bin/activate
python -m app.seed --reset --applicants 500 --refresh-model
```

Then start the backend and frontend and open:

- `/dashboard`
- `/applicants`
- `/reports`

## CSV expectations

### Applicants CSV

Headers:

`external_id,first_name,last_name,email,phone,date_of_birth,employment_status,company_name,years_employed,residential_status,region,status,annual_income,monthly_expenses,debt_to_income_ratio,savings_balance,existing_credit_lines,credit_utilization,bankruptcies,open_delinquencies,credit_score,requested_amount,loan_purpose`

### Payment histories CSV

Headers:

`applicant_external_id,applicant_email,payment_month,amount_due,amount_paid,days_late,status`

## Deployment

### Backend on Render

Use the included [`render.yaml`](./render.yaml) or configure manually:

- Root directory: `backend`
- Build command: `python -m pip install -r requirements.txt`
- Start command: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Required Render environment variables:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CORS_ORIGINS`
- `FRONTEND_URL`

### Frontend on Vercel

Configure the Vercel project with:

- Root directory: `frontend`
- Framework preset: `Next.js`

Required Vercel environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL`

Set `NEXT_PUBLIC_API_BASE_URL` to your Render backend, for example:

```env
NEXT_PUBLIC_API_BASE_URL=https://customer-risk-scoring-api.onrender.com/api/v1
```

### Supabase production notes

- Add your Vercel URL and localhost URLs to the Supabase Auth redirect/site URL allowlist.
- Use the Supabase pooled Postgres connection string for `DATABASE_URL`.
- Keep the service role key only on the backend/Render side.

## Useful commands

Generate the folder tree artifact again:

```bash
npm run tree > docs/folder-tree.txt
```

Refresh the synthetic logistic artifact only:

```bash
cd backend
source .venv/bin/activate
python -m app.seed --refresh-model
```
