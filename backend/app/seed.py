from __future__ import annotations

import argparse

from app.core.config import settings
from app.db.session import SessionLocal
from app.services.demo_data import refresh_logistic_artifact, reset_seed_data, seed_demo_dataset, seed_demo_users


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the Customer Risk Scoring System database.")
    parser.add_argument("--reset", action="store_true", help="Delete existing seeded tables before inserting demo data.")
    parser.add_argument("--applicants", type=int, default=500, help="Number of applicants to generate.")
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

        demo_users = seed_demo_users(session, password=settings.seed_demo_password)
        for demo_user in demo_users:
            seed_demo_dataset(
                session,
                applicant_count=args.applicants,
                owner_user_id=demo_user.id,
                actor_user_id=demo_user.id,
            )
        session.commit()


if __name__ == "__main__":
    main()
