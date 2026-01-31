"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// Import translations
import en from "./locales/en.json";
import vi from "./locales/vi.json";
import ja from "./locales/ja.json";
import de from "./locales/de.json";

// Types
export type Locale = "en" | "vi" | "ja" | "de";

export interface LocaleInfo {
    code: Locale;
    name: string;
    nativeName: string;
    flag: string;
}

export const LOCALES: LocaleInfo[] = [
    { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
    { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
    { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
    { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
];

export const DEFAULT_LOCALE: Locale = "en";

const translations: Record<Locale, typeof en> = {
    en,
    vi,
    ja,
    de,
};

// Context
interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
    locales: LocaleInfo[];
    currentLocale: LocaleInfo;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to get nested value from object
function getNestedValue(obj: Record<string, unknown>, path: string): string {
    const keys = path.split(".");
    let result: unknown = obj;

    for (const key of keys) {
        if (result && typeof result === "object" && key in result) {
            result = (result as Record<string, unknown>)[key];
        } else {
            return path; // Return the key if translation not found
        }
    }

    return typeof result === "string" ? result : path;
}

// Provider
export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load saved locale from localStorage on mount
    useEffect(() => {
        const savedLocale = localStorage.getItem("locale") as Locale | null;
        if (savedLocale && LOCALES.some((l) => l.code === savedLocale)) {
            setLocaleState(savedLocale);
        }
        setIsInitialized(true);
    }, []);

    // Set locale and persist to localStorage
    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem("locale", newLocale);
        // Update HTML lang attribute
        document.documentElement.lang = newLocale;
    }, []);

    // Translation function
    const t = useCallback(
        (key: string): string => {
            return getNestedValue(translations[locale] as unknown as Record<string, unknown>, key);
        },
        [locale]
    );

    const currentLocale = LOCALES.find((l) => l.code === locale) || LOCALES[0];

    // Prevent hydration mismatch by rendering children only after client-side initialization
    if (!isInitialized) {
        return null;
    }

    return (
        <LanguageContext.Provider
            value= {{
        locale,
            setLocale,
            t,
            locales: LOCALES,
                currentLocale,
            }
}
        >
    { children }
    </LanguageContext.Provider>
    );
}

// Hook
export function useTranslation() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useTranslation must be used within a LanguageProvider");
    }
    return context;
}

// Export a function to get translations for server components (static)
export function getTranslations(locale: Locale = DEFAULT_LOCALE) {
    return translations[locale];
}
