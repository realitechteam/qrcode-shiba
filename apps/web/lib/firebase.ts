import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged,
    User,
    Auth,
} from "firebase/auth";

// Firebase configuration from environment variables.
// Set NEXT_PUBLIC_FIREBASE_* variables in Vercel (or .env.local for local dev).
// These are public client-side identifiers embedded at build time by Next.js.
function getFirebaseConfig() {
    const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
    };

    if (!config.apiKey || !config.authDomain || !config.projectId) {
        console.error(
            "[Firebase] Missing required env vars: NEXT_PUBLIC_FIREBASE_API_KEY, " +
            "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID. " +
            "Google login will not work."
        );
    }

    return config;
}

// Lazy initialization — only runs on client side
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;

function getFirebaseApp(): FirebaseApp {
    if (!app) {
        if (!getApps().length) {
            app = initializeApp(getFirebaseConfig());
        } else {
            app = getApps()[0]!;
        }
    }
    return app;
}

function getFirebaseAuth(): Auth {
    if (!auth) {
        auth = getAuth(getFirebaseApp());
    }
    return auth;
}

function getGoogleProvider(): GoogleAuthProvider {
    if (!googleProvider) {
        googleProvider = new GoogleAuthProvider();
        googleProvider.setCustomParameters({
            prompt: "select_account",
        });
    }
    return googleProvider;
}

// Sign in with Google - try popup first, fallback to redirect
export const signInWithGoogle = async (): Promise<User> => {
    const firebaseAuth = getFirebaseAuth();
    const provider = getGoogleProvider();

    try {
        // Try popup first (works on most browsers)
        const result = await signInWithPopup(firebaseAuth, provider);
        return result.user;
    } catch (error: any) {
        // If popup blocked by COOP or browser policy, use redirect
        if (
            error.code === "auth/popup-blocked" ||
            error.code === "auth/popup-closed-by-user" ||
            error.code === "auth/cancelled-popup-request" ||
            error.code === "auth/internal-error"
        ) {
            console.log("Popup blocked, falling back to redirect...");
            await signInWithRedirect(firebaseAuth, provider);
            // This line won't execute - page will redirect
            throw new Error("REDIRECT_IN_PROGRESS");
        }
        throw error;
    }
};

// Get redirect result (call on page load to handle redirect-based auth)
export const getGoogleRedirectResult = async (): Promise<User | null> => {
    try {
        const result = await getRedirectResult(getFirebaseAuth());
        return result?.user || null;
    } catch (error) {
        console.error("Error getting redirect result:", error);
        return null;
    }
};

// Sign out
export const firebaseSignOut = async (): Promise<void> => {
    await signOut(getFirebaseAuth());
};

// Get current user
export const getCurrentUser = (): User | null => {
    return getFirebaseAuth().currentUser;
};

// Subscribe to auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(getFirebaseAuth(), callback);
};

// Get ID token for backend authentication
export const getIdToken = async (): Promise<string | null> => {
    const user = getFirebaseAuth().currentUser;
    if (user) {
        return await user.getIdToken();
    }
    return null;
};

export { getFirebaseApp as app, getFirebaseAuth as auth };
export type { User };
