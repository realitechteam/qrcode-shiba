"use client";

import { useRouter } from "next/navigation";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/index";

export default function PrivacyPage() {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-16 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="mb-6 -ml-2 text-muted-foreground hover:text-foreground gap-2 animate-fade-in"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t("common.back")}
                </Button>

                {/* Header */}
                <div className="text-center mb-12 animate-slide-up">
                    <div className="w-16 h-16 rounded-2xl bg-shiba-500/10 flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-shiba-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{t("privacy.title")}</h1>
                    <p className="text-muted-foreground">{t("privacy.lastUpdated")}: 31/01/2026</p>
                </div>

                {/* Content */}
                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">{t("privacy.sections.collection.title")}</h2>
                        <p className="text-muted-foreground mb-3">
                            {t("privacy.sections.collection.content")}
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            <li>{t("privacy.sections.collection.items.0")}</li>
                            <li>{t("privacy.sections.collection.items.1")}</li>
                            <li>{t("privacy.sections.collection.items.2")}</li>
                            <li>{t("privacy.sections.collection.items.3")}</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">{t("privacy.sections.usage.title")}</h2>
                        <p className="text-muted-foreground mb-3">
                            {t("privacy.sections.usage.content")}
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            <li>{t("privacy.sections.usage.items.0")}</li>
                            <li>{t("privacy.sections.usage.items.1")}</li>
                            <li>{t("privacy.sections.usage.items.2")}</li>
                            <li>{t("privacy.sections.usage.items.3")}</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">{t("privacy.sections.security.title")}</h2>
                        <p className="text-muted-foreground">
                            {t("privacy.sections.security.content")}
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                            <li>{t("privacy.sections.security.items.0")}</li>
                            <li>{t("privacy.sections.security.items.1")}</li>
                            <li>{t("privacy.sections.security.items.2")}</li>
                            <li>{t("privacy.sections.security.items.3")}</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">{t("privacy.sections.sharing.title")}</h2>
                        <p className="text-muted-foreground">
                            {t("privacy.sections.sharing.content")}
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                            <li>{t("privacy.sections.sharing.items.0")}</li>
                            <li>{t("privacy.sections.sharing.items.1")}</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">{t("privacy.sections.rights.title")}</h2>
                        <p className="text-muted-foreground">
                            {t("privacy.sections.rights.content")}
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                            <li>{t("privacy.sections.rights.items.0")}</li>
                            <li>{t("privacy.sections.rights.items.1")}</li>
                            <li>{t("privacy.sections.rights.items.2")}</li>
                            <li>{t("privacy.sections.rights.items.3")}</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">{t("privacy.sections.cookies.title")}</h2>
                        <p className="text-muted-foreground">
                            {t("privacy.sections.cookies.content")}
                        </p>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">{t("privacy.sections.contact.title")}</h2>
                        <p className="text-muted-foreground">
                            {t("privacy.sections.contact.content")}{" "}
                            <a href="mailto:privacy@shiba.pw" className="text-shiba-500 hover:underline">
                                privacy@shiba.pw
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
