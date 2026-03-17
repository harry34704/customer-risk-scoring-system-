export type FaqEntry = {
  id: string;
  category: "login" | "workspace" | "imports" | "scoring" | "reports" | "rules";
  question: string;
  answer: string;
};

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: "login-demo",
    category: "login",
    question: "How do I sign in if I just landed here?",
    answer:
      "Use one of the demo accounts if the environment has been seeded, or create your own account from the login page. New accounts can load a private demo workspace from the dashboard or settings page."
  },
  {
    id: "workspace-demo",
    category: "workspace",
    question: "What does Load demo workspace actually do?",
    answer:
      "It creates a private 500-applicant sample portfolio for the current user, including payment history, rules, scores, and trend data. Your edits stay isolated to your account."
  },
  {
    id: "imports-schema",
    category: "imports",
    question: "Where do I get the right CSV structure?",
    answer:
      "Open Imports to see the required headers, preview sample files, and download ready-made applicant and payment-history CSV templates."
  },
  {
    id: "score-bands",
    category: "scoring",
    question: "What do low, medium, and high risk mean here?",
    answer:
      "The score band is a simplified label over the raw score. Low indicates cleaner affordability and repayment signals, medium signals moderate caution, and high suggests the applicant should move into manual review or tighter underwriting."
  },
  {
    id: "rule-vs-logistic",
    category: "scoring",
    question: "What is the difference between deterministic and logistic scoring?",
    answer:
      "Deterministic scoring applies explicit business rules with configurable weights. Logistic scoring is a statistical baseline that estimates default probability from the full feature mix and shows the strongest contributing factors."
  },
  {
    id: "rules-impact",
    category: "rules",
    question: "What happens when I change a rule?",
    answer:
      "The system updates your workspace rule set and rescales the deterministic scores for your current applicant portfolio. It does not overwrite other users' rules or portfolios."
  },
  {
    id: "reports-meaning",
    category: "reports",
    question: "What are the report metrics measured against?",
    answer:
      "Applicants is the total scored portfolio in the selected mode. Average score is the mean raw score. High risk share is the percentage of applicants currently labeled high risk. Average PD is the mean probability of default across the selected cohort."
  },
  {
    id: "loss-watchlist",
    category: "reports",
    question: "What does money lost or recovery gap mean on the dashboard?",
    answer:
      "It shows the cumulative shortfall between amount due and amount paid for applicants with unpaid exposure. It helps operations teams identify where the portfolio is leaking cash and who may need collection or intervention."
  }
];
