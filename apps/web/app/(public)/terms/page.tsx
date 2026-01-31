"use client";

import { useRouter } from "next/navigation";
import { Scale, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/index";

export default function TermsPage() {
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
                        <Scale className="h-8 w-8 text-shiba-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{t("terms.title")}</h1>
                    <p className="text-muted-foreground">{t("terms.lastUpdated")}: 31/01/2026</p>
                </div>

                {/* Content */}
                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">{t("terms.sections.acceptance.title")}</h2>
                        <p className="text-muted-foreground">
                            {t("terms.sections.acceptance.content")}
                        </p>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">{t("terms.sections.description.title")}</h2>
                        <p className="text-muted-foreground">
                            {t("terms.sections.description.content")}
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                            <li>{t("terms.sections.description.items.0")}</li>
                            <li>{t("terms.sections.description.items.1")}</li>
                            <li>{t("terms.sections.description.items.2")}</li>
                            <li>{t("terms.sections.description.items.3")}</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">{t("terms.sections.account.title")}</h2>
                        <p className="text-muted-foreground">
                            {t("terms.sections.account.content")}
                        </p>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">{t("terms.sections.prohibited.title")}</h2>
                        <p className="text-muted-foreground">
                            {t("terms.sections.prohibited.content")}
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                            <li>{t("terms.sections.prohibited.items.0")}</li>
                            <li>{t("terms.sections.prohibited.items.1")}</li>
                            <li>{t("terms.sections.prohibited.items.2")}</li>
                            <li>{t("terms.sections.prohibited.items.3")}</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">{t("terms.sections.payment.title")}</h2>
                        <p className="text-muted-foreground">
                            {t("terms.sections.payment.content")}
                        </p>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">{t("terms.sections.contact.title")}</h2>
                        <p className="text-muted-foreground">
                            {t("terms.sections.contact.content")}{" "}
                            <a href="mailto:support@shiba.pw" className="text-shiba-500 hover:underline">
                                support@shiba.pw
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
