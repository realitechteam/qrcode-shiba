"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeQRGenerator } from "@/components/HomeQRGenerator";
import { AuthHeader } from "@/components/AuthHeader";
import { QrCode, ArrowRight, Zap, BarChart3, Palette, Globe, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n/index";

export default function HomePage() {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-screen flex-col">
            {/* Header with Auth State */}
            <AuthHeader />

            {/* Hero Section with QR Generator */}
            <section className="relative overflow-hidden py-12 md:py-20">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,hsl(24,100%,53%,0.1),transparent)]" />

                <div className="container">
                    {/* Title */}
                    <div className="text-center mb-10">
                        <div className="mb-4 inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm">
                            <Zap className="mr-2 h-4 w-4 text-shiba-500" />
                            <span>{t("home.hero.badge")}</span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                            {t("home.hero.title")}{" "}
                            <span className="text-gradient">{t("home.hero.titleHighlight")}</span>
                        </h1>

                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            {t("home.hero.subtitle")}
                        </p>
                    </div>

                    {/* QR Generator Component */}
                    <HomeQRGenerator />
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 bg-muted/30">
                <div className="container">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="space-y-2">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                <Check className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold">{t("home.benefits.free.title")}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t("home.benefits.free.description")}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <Zap className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold">{t("home.benefits.fast.title")}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t("home.benefits.fast.description")}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                <Palette className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold">{t("home.benefits.customize.title")}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t("home.benefits.customize.description")}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">{t("home.features.title")}</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            {t("home.features.subtitle")}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={<Palette className="h-6 w-6" />}
                            title={t("home.features.customization.title")}
                            description={t("home.features.customization.description")}
                        />
                        <FeatureCard
                            icon={<BarChart3 className="h-6 w-6" />}
                            title={t("home.features.analytics.title")}
                            description={t("home.features.analytics.description")}
                        />
                        <FeatureCard
                            icon={<Zap className="h-6 w-6" />}
                            title={t("home.features.dynamic.title")}
                            description={t("home.features.dynamic.description")}
                        />
                        <FeatureCard
                            icon={<Globe className="h-6 w-6" />}
                            title={t("home.features.integration.title")}
                            description={t("home.features.integration.description")}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container">
                    <div className="rounded-3xl bg-gradient-to-br from-shiba-500 to-shiba-600 p-12 text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">
                            {t("home.cta.title")}
                        </h2>
                        <p className="text-shiba-100 mb-8 max-w-2xl mx-auto">
                            {t("home.cta.subtitle")}
                        </p>
                        <Link href="/login">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="bg-white text-shiba-600 hover:bg-shiba-50 gap-2"
                            >
                                {t("home.cta.button")}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-12 mt-auto">
                <div className="container">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-shiba-500 to-shiba-600">
                                <QrCode className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-semibold">QRCode-Shiba</span>
                        </div>

                        <nav className="flex gap-6 text-sm text-muted-foreground">
                            <Link href="/about" className="hover:text-foreground">{t("nav.about")}</Link>
                            <Link href="/terms" className="hover:text-foreground">{t("footer.legal")}</Link>
                            <Link href="/privacy" className="hover:text-foreground">{t("privacy.title")}</Link>
                            <Link href="/contact" className="hover:text-foreground">{t("nav.contact")}</Link>
                        </nav>

                        <p className="text-sm text-muted-foreground">
                            {t("footer.copyright")}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-shiba-100 text-shiba-600 dark:bg-shiba-900/30 dark:text-shiba-400">
                {icon}
            </div>
            <h3 className="mb-2 font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
