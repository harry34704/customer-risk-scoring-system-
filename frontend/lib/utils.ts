import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SOUTH_AFRICAN_REGIONS = new Set(["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State"]);
const UNITED_KINGDOM_REGIONS = new Set(["London", "Manchester", "Birmingham", "Leeds", "Liverpool", "Glasgow"]);

function currencyFromRegion(region?: string) {
  if (!region) {
    return "USD";
  }
  if (SOUTH_AFRICAN_REGIONS.has(region)) {
    return "ZAR";
  }
  if (UNITED_KINGDOM_REGIONS.has(region)) {
    return "GBP";
  }
  return "USD";
}

function localeFromCurrency(currency: string) {
  if (currency === "ZAR") {
    return "en-ZA";
  }
  if (currency === "GBP") {
    return "en-GB";
  }
  return "en-US";
}

export function formatCurrency(value: number, options?: { region?: string; currency?: string; maximumFractionDigits?: number }) {
  const currency = options?.currency ?? currencyFromRegion(options?.region);
  const locale = localeFromCurrency(currency);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: options?.maximumFractionDigits ?? 0
  }).format(value);
}

export function formatPercent(value: number, options?: { alreadyScaled?: boolean }) {
  const numericValue = options?.alreadyScaled ? value : value * 100;
  return `${numericValue.toFixed(1)}%`;
}

export function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function slugToLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
