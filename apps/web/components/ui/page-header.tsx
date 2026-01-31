"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
    title: string;
    description?: string;
    showBack?: boolean;
}

export function PageHeader({ title, description, showBack = true }: PageHeaderProps) {
    const router = useRouter();

    return (
        <div className="mb-8 animate-fade-in">
            {showBack && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="mb-4 -ml-2 text-muted-foreground hover:text-foreground gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </Button>
            )}
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && (
                <p className="text-muted-foreground mt-2">{description}</p>
            )}
        </div>
    );
}
