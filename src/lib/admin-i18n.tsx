"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import en, { type AdminTranslationKey } from "./locales/en";
import ar from "./locales/ar";

type Lang = "en" | "ar";

const locales: Record<Lang, Record<AdminTranslationKey, string>> = { en, ar };

const AdminI18nContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: AdminTranslationKey) => string;
}>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export function useAdminI18n() {
  return useContext(AdminI18nContext);
}

export function AdminI18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("admin-lang") as Lang) || "en";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("admin-lang", l);
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = l;
  }, []);

  const t = useCallback((key: AdminTranslationKey) => locales[lang][key] ?? key, [lang]);

  return (
    <AdminI18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </AdminI18nContext.Provider>
  );
}
