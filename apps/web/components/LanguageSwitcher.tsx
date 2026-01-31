"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useTranslation, type Locale } from "@/lib/i18n/index";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
    const { locale, setLocale, locales, currentLocale } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (code: Locale) => {
        setLocale(code);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                    "border border-border bg-background/50 backdrop-blur-sm",
                    "hover:bg-muted/50 transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-shiba-500/20"
                )}
                aria-label="Select language"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="hidden sm:inline">{currentLocale.flag}</span>
                <span className="hidden md:inline text-muted-foreground">{currentLocale.nativeName}</span>
                <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180"
                )} />
            </button>

            {isOpen && (
                <div
                    className={cn(
                        "absolute right-0 top-full mt-2 z-50",
                        "min-w-[160px] py-1 rounded-lg",
                        "border border-border bg-popover shadow-lg",
                        "animate-fade-in"
                    )}
                    role="listbox"
                    aria-label="Language options"
                >
                    {locales.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 text-sm",
                                "hover:bg-muted/50 transition-colors",
                                locale === lang.code && "bg-shiba-500/10 text-shiba-600"
                            )}
                            role="option"
                            aria-selected={locale === lang.code}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="font-medium">{lang.nativeName}</span>
                            {locale === lang.code && (
                                <span className="ml-auto text-shiba-500">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
