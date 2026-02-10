import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface RefPageProps {
    params: { code: string };
}

export default async function ReferralPage({ params }: RefPageProps) {
    const { code } = params;

    // This is a server component.
    // We set the referral code cookie and redirect to the registration page.
    // The cookie will be read during registration to associate the referral.

    // Note: In Next.js App Router, we cannot set cookies in a server component directly
    // during rendering. We'll use a client component wrapper instead.

    // Redirect to register with ref query param (client component will handle cookie)
    redirect(`/register?ref=${encodeURIComponent(code)}`);
}
