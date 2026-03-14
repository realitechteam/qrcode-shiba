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

// Firebase configuration
// These are public client-side identifiers (not secrets).
// Security is enforced by Firebase Security Rules and domain restrictions.
const firebaseConfig = {
    apiKey: "AIzaSyCA1Bbe27Y4t9sjD_Z4zcCJ6kFhyXOwybw",
    authDomain: "realitech-qrshiba.firebaseapp.com",
    projectId: "realitech-qrshiba",
    storageBucket: "realitech-qrshiba.firebasestorage.app",
    messagingSenderId: "889212525805",
    appId: "1:889212525805:web:2e3114d1cd7dc0a8bdc0e4",
    measurementId: "G-VDLYVWT9CE",
};

// Initialize Firebase (prevent multiple instances)
let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0]!;
}

auth = getAuth(app);

// Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: "select_account",
});

// Sign in with Google - try popup first, fallback to redirect
export const signInWithGoogle = async (): Promise<User> => {
    try {
        // Try popup first (works on most browsers)
        const result = await signInWithPopup(auth, googleProvider);
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
            await signInWithRedirect(auth, googleProvider);
            // This line won't execute - page will redirect
            throw new Error("REDIRECT_IN_PROGRESS");
        }
        throw error;
    }
};

// Get redirect result (call on page load to handle redirect-based auth)
export const getGoogleRedirectResult = async (): Promise<User | null> => {
    try {
        const result = await getRedirectResult(auth);
        return result?.user || null;
    } catch (error) {
        console.error("Error getting redirect result:", error);
        return null;
    }
};

// Sign out
export const firebaseSignOut = async (): Promise<void> => {
    await signOut(auth);
};

// Get current user
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

// Subscribe to auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Get ID token for backend authentication
export const getIdToken = async (): Promise<string | null> => {
    const user = auth.currentUser;
    if (user) {
        return await user.getIdToken();
    }
    return null;
};

export { auth, app };
export type { User };
