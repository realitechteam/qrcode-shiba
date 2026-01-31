"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Target, Shield, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/index";

export default function AboutPage() {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            {/* Hero */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground gap-2 animate-fade-in"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t("common.back")}
                    </Button>
                    <div className="text-center animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-shiba-500/10 text-shiba-600 text-sm font-medium mb-6">
                            <Sparkles className="h-4 w-4" />
                            {t("about.badge")}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            {t("about.title")}{" "}
                            <span className="text-shiba-500">{t("about.titleHighlight")}</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {t("about.subtitle")}
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-16 px-4 bg-muted/30">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-14 h-14 rounded-2xl bg-shiba-500/10 flex items-center justify-center mx-auto mb-4">
                                <Target className="h-7 w-7 text-shiba-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t("about.mission.title")}</h3>
                            <p className="text-muted-foreground">
                                {t("about.mission.description")}
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-14 h-14 rounded-2xl bg-shiba-500/10 flex items-center justify-center mx-auto mb-4">
                                <Users className="h-7 w-7 text-shiba-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t("about.team.title")}</h3>
                            <p className="text-muted-foreground">
                                {t("about.team.description")}
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-14 h-14 rounded-2xl bg-shiba-500/10 flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-7 w-7 text-shiba-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t("about.commitment.title")}</h3>
                            <p className="text-muted-foreground">
                                {t("about.commitment.description")}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Us */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">{t("about.whyUs.title")}</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4 p-6 rounded-2xl border bg-card">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <span className="text-2xl">🚀</span>
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">{t("about.whyUs.speed.title")}</h3>
                                <p className="text-muted-foreground">{t("about.whyUs.speed.description")}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-6 rounded-2xl border bg-card">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <span className="text-2xl">📊</span>
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">{t("about.whyUs.analytics.title")}</h3>
                                <p className="text-muted-foreground">{t("about.whyUs.analytics.description")}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-6 rounded-2xl border bg-card">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <span className="text-2xl">🎨</span>
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">{t("about.whyUs.customization.title")}</h3>
                                <p className="text-muted-foreground">{t("about.whyUs.customization.description")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-4">{t("about.cta.title")}</h2>
                    <p className="text-muted-foreground mb-6">
                        {t("about.cta.subtitle")}
                    </p>
                    <Link href="/login">
                        <Button className="bg-shiba-500 hover:bg-shiba-600 gap-2">
                            {t("about.cta.button")}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
