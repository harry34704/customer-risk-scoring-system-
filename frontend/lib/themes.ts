export type AppTheme = "april-mist" | "cape-town-ledger" | "midnight-slate";

export const APP_THEME_STORAGE_KEY = "customer-risk-ui-theme";

export const APP_THEMES: {
  id: AppTheme;
  name: string;
  summary: string;
  swatches: string[];
}[] = [
  {
    id: "april-mist",
    name: "April Mist",
    summary: "Soft sand, sage, and navy for a calm executive dashboard.",
    swatches: ["#f5f2ea", "#597b73", "#234a4f", "#b15f56"]
  },
  {
    id: "cape-town-ledger",
    name: "Cape Town Ledger",
    summary: "Coastal teal and brushed stone tuned for South African portfolio storytelling.",
    swatches: ["#eef4f1", "#3b7b84", "#19444d", "#b88632"]
  },
  {
    id: "midnight-slate",
    name: "Midnight Slate",
    summary: "A restrained dark boardroom mode for projection screens and late-night reviews.",
    swatches: ["#0f1624", "#79b7a6", "#7fb4e5", "#e3af58"]
  }
];
