import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./tests/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        mist: "#F8FAFC",
        slate: "#475569",
        signal: "#0F766E",
        ember: "#C2410C",
        alert: "#B91C1C",
        card: "#FFFFFF",
        line: "#E2E8F0"
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "ui-sans-serif",
          "system-ui"
        ]
      },
      boxShadow: {
        soft: "0 24px 48px rgba(15, 23, 42, 0.08)"
      },
      backgroundImage: {
        "grid-fade": "radial-gradient(circle at top, rgba(15,118,110,0.08), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98))"
      }
    }
  },
  plugins: []
};

export default config;

