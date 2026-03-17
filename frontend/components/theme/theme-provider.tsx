"use client";

import { createContext, startTransition, useContext, useEffect, useState, type ReactNode } from "react";

import { APP_THEME_STORAGE_KEY, APP_THEMES, type AppTheme } from "@/lib/themes";

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  themes: typeof APP_THEMES;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: AppTheme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(APP_THEME_STORAGE_KEY, theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>("april-mist");

  useEffect(() => {
    const storedTheme = localStorage.getItem(APP_THEME_STORAGE_KEY) as AppTheme | null;
    const nextTheme = APP_THEMES.some((item) => item.id === storedTheme) ? storedTheme ?? "april-mist" : "april-mist";
    setThemeState(nextTheme);
    applyTheme(nextTheme);
  }, []);

  function setTheme(nextTheme: AppTheme) {
    startTransition(() => {
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: APP_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
