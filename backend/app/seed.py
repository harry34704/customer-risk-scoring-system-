from __future__ import annotations

import argparse
from typing import Any, Optional

import httpx
from sqlalchemy import select

from app.core.config import settings
from app.db.session import SessionLocal
from app.models import User
from app.services.demo_data import demo_credentials, refresh_logistic_artifact, reset_seed_data, seed_demo_dataset


def ensure_supabase_demo_user(email: str, password: str, role: str) -> Optional[dict[str, Any]]:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        return None

    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json",
    }
    payload = {"email": email, "password": password, "email_confirm": True, "user_metadata": {"role": role}}

    with httpx.Client(timeout=15.0) as client:
        existing = client.get(
            f"{settings.supabase_url}/auth/v1/admin/users",
            headers=headers,
            params={"page": 1, "per_page": 1000},
        )
        if existing.status_code == 200:
            for user in existing.json().get("users", []):
                if user.get("email") == email:
                    return user
        response = client.post(f"{settings.supabase_url}/auth/v1/admin/users", headers=headers, json=payload)
        response.raise_for_status()
        return response.json().get("user")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the Customer Risk Scoring System database.")
    parser.add_argument("--reset", action="store_true", help="Delete existing seeded tables before inserting demo data.")
    parser.add_argument("--applicants", type=int, default=500, help="Number of applicants to generate.")
    parser.add_argument(
        "--skip-auth-users",
        action="store_true",
        help="Skip Supabase Auth demo-user provisioning even if service role credentials exist.",
    )
    parser.add_argument(
        "--refresh-model",
        action="store_true",
        help="Regenerate backend/app/data/logistic_baseline.json from synthetic training data.",
    )
    args = parser.parse_args()

    if args.refresh_model:
        refresh_logistic_artifact(settings.logistic_model_path)

    with SessionLocal() as session:
        if args.reset:
            reset_seed_data(session)

        actor_user_id: Optional[str] = None
        for credential in demo_credentials():
            auth_user = None
            if not args.skip_auth_users:
                auth_user = ensure_supabase_demo_user(
                    credential["email"],
                    credential["password"],
                    credential["role"],
                )

            user_id = auth_user["id"] if auth_user else credential.get("id")
            existing = session.scalar(select(User).where(User.email == credential["email"]))
            if existing is None:
                existing = User(
                    id=user_id or credential["email"].replace("@", "-").replace(".", "-"),
                    email=credential["email"],
                    full_name="Demo Admin" if credential["role"] == "admin" else "Risk Analyst",
                    role=credential["role"],
                    is_demo=True,
                )
                session.add(existing)
            elif user_id:
                existing.id = user_id
            if credential["role"] == "admin":
                actor_user_id = existing.id
        session.flush()
        seed_demo_dataset(session, applicant_count=args.applicants, actor_user_id=actor_user_id)
        session.commit()


if __name__ == "__main__":
    main()
