# Customer Risk Scoring System

Portfolio-grade full-stack underwriting workspace built with Next.js 14, TypeScript, Tailwind CSS, FastAPI, SQLAlchemy/Alembic, and Postgres. The app scores applicants with configurable deterministic rules plus a logistic regression baseline, shows explainable top-factor breakdowns, supports CSV imports and exports, and ships with seeded demo data for 500 applicants.

Full repo structure is captured in [docs/folder-tree.txt](./docs/folder-tree.txt).

## Stack

- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts
- Backend: FastAPI, SQLAlchemy 2.0, Alembic, ReportLab
- Database: Postgres
- Auth: simple in-app email/password auth with PBKDF2 password hashes and signed bearer tokens
- Deployment: Render Blueprint for web, API, and Postgres

## Feature set

- In-app email/password auth
- Dashboard with risk distribution, defaults by month, recovery by segment, and score trend charts
- Applicants list with search, filters, and manual entry
- Applicant detail pages with dual-mode scores, explanation cards, payment history, and audit trail
- Scoring rules editor with portfolio rescoring
- CSV uploads for applicants and payment histories
- CSV export and printable PDF export
- Seed workflow for 500 realistic demo applicants
- Backend scoring/auth tests and frontend critical-flow tests

## Core tables

- `users`
- `applicants`
- `applicant_financials`
- `payment_history`
- `scoring_rules`
- `risk_scores`
- `audit_logs`

## Local setup

### 1. Copy environment files

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### 2. Set local environment variables

Frontend:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Backend:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/customer_risk_scoring
CORS_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
AUTH_SECRET_KEY=change-this-local-secret
AUTH_TOKEN_TTL_MINUTES=10080
LOGISTIC_MODEL_PATH=app/data/logistic_baseline.json
SEED_DEMO_PASSWORD=Demo123!
```

### 3. Start Postgres

Run any local Postgres instance and create a database named `customer_risk_scoring`, or update `DATABASE_URL` to match your local database.

### 4. Install backend dependencies

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
```

### 5. Run migrations

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

If you previously ran the older Supabase-auth version, this applies `0002_add_password_hash_to_users`. Rerun the seed command after migrating so demo users receive valid local passwords.

### 6. Seed demo data

```bash
cd backend
source .venv/bin/activate
python -m app.seed --reset --applicants 500 --refresh-model
```

### 7. Start the backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

Backend health check: `http://127.0.0.1:8000/healthz`

### 8. Install frontend dependencies

```bash
cd frontend
npm install
```

### 9. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend login page: `http://localhost:3000/login`

## Demo credentials

- `demo@riskscore.local` / `Demo123!`
- `analyst@riskscore.local` / `Demo123!`

If you change `SEED_DEMO_PASSWORD`, rerun the seed command and use the updated password shown on the Settings page.

## Testing

Backend:

```bash
cd backend
source .venv/bin/activate
pytest
```

Frontend:

```bash
cd frontend
npm run test
```

Production frontend build:

```bash
cd frontend
npm run build
```

## Seed and screenshot workflow

```bash
cd backend
source .venv/bin/activate
python -m app.seed --reset --applicants 500 --refresh-model
```

Then sign in and capture:

- `/dashboard`
- `/applicants`
- `/reports`

## CSV expectations

Applicants CSV headers:

`external_id,first_name,last_name,email,phone,date_of_birth,employment_status,company_name,years_employed,residential_status,region,status,annual_income,monthly_expenses,debt_to_income_ratio,savings_balance,existing_credit_lines,credit_utilization,bankruptcies,open_delinquencies,credit_score,requested_amount,loan_purpose`

Payment history CSV headers:

`applicant_external_id,applicant_email,payment_month,amount_due,amount_paid,days_late,status`

## Exact Render environment variables

### Backend service

- `DATABASE_URL`
  Use Render Postgres `connectionString` from `customer-risk-scoring-db`.
- `CORS_ORIGINS`
  Example: `https://your-web-service.onrender.com,http://localhost:3000`
- `FRONTEND_URL`
  Example: `https://your-web-service.onrender.com`
- `AUTH_SECRET_KEY`
  Use a long random secret. The Blueprint can generate this automatically.
- `AUTH_TOKEN_TTL_MINUTES`
  Recommended: `10080`
- `LOGISTIC_MODEL_PATH`
  Set to `app/data/logistic_baseline.json`
- `SEED_DEMO_PASSWORD`
  Recommended demo seed password: `Demo123!`

### Frontend service

- `NEXT_PUBLIC_API_BASE_URL`
  Example: `https://your-api-service.onrender.com/api/v1`

## GitHub-ready deployment checklist

See [docs/render-deploy-checklist.md](./docs/render-deploy-checklist.md) for the full step-by-step flow.

Short version:

1. Create an empty GitHub repo.
2. Add the remote and push `main`.
3. Create a new Render Blueprint from the repo.
4. Let Render create the Postgres database, API service, and frontend service from `render.yaml`.
5. Set the API and web URLs in `NEXT_PUBLIC_API_BASE_URL`, `FRONTEND_URL`, and `CORS_ORIGINS`.
6. Confirm `AUTH_SECRET_KEY` exists and `DATABASE_URL` is linked from Render Postgres.
7. Deploy both services.
8. Open a Render shell on the API service and run the seed command.
9. Log in with the seeded demo credentials and verify `/dashboard`, `/imports`, and `/reports`.

## Render deployment

The repository includes [render.yaml](./render.yaml) for a single-platform deployment on Render:

- `customer-risk-scoring-db` for Postgres
- `customer-risk-scoring-api` for FastAPI
- `customer-risk-scoring-web` for Next.js

The API start command runs migrations automatically:

```bash
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

After the first deploy, seed the database from the Render API shell:

```bash
python -m app.seed --reset --applicants 500 --refresh-model
```
