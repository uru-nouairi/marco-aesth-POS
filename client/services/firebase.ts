import { initializeApp, type FirebaseApp, getApps } from "firebase/app";
import type { FirebaseOptions } from "firebase/app";
import {
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  type Auth,
} from "firebase/auth";
import {
  initializeFirestore,
  persistentMultipleTabManager,
  persistentLocalCache,
  CACHE_SIZE_UNLIMITED,
  type Firestore,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFunctions, type Functions } from "firebase/functions";

interface FirebaseResources {
  app: FirebaseApp;
  auth: Auth | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
  functions: Functions | null;
}

const requiredEnvKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

function getRuntimeEnv(): Record<string, string | undefined> {
  // Prefer Vite's import.meta.env in browser build; fall back to process.env (server) or window.__env if present
  const meta = (typeof import.meta !== "undefined" ? (import.meta as any).env : {}) as Record<string, string | undefined>;
  const proc = typeof process !== "undefined" && (process.env as Record<string, string | undefined>) ? (process.env as Record<string, string | undefined>) : {};
  const win = typeof window !== "undefined" && (window as any).__env ? (window as any).__env : {};
  return { ...proc, ...meta, ...win } as Record<string, string | undefined>;
}

function validateConfig(env: Record<string, string | undefined>): string[] {
  const missing = requiredEnvKeys.filter((key) => !env[key]);
  if (missing.length > 0) {
    // warn but do not throw so the app can continue in offline/mock mode
    // keep the message clear for debugging
    // eslint-disable-next-line no-console
    console.warn(
      `[firebase] Missing configuration values: ${missing.join(", ")}. Add them to your Vite environment file to connect Firebase.`,
    );
  }
  return missing;
}

let resources: FirebaseResources | null = null;

export const getFirebase = (): FirebaseResources => {
  if (resources) return resources;

  // If running in a non-browser environment (SSR), avoid initializing browser-only Firebase services
  if (typeof window === "undefined") {
    resources = {
      app: ({} as FirebaseApp),
      auth: null,
      firestore: null,
      storage: null,
      functions: null,
    };
    return resources;
  }

  const env = getRuntimeEnv();
  const missing = validateConfig(env);
  if (missing.length > 0) {
    resources = {
      app: ({} as FirebaseApp),
      auth: null,
      firestore: null,
      storage: null,
      functions: null,
    };
    return resources;
  }

  const firebaseConfig: FirebaseOptions = {
    apiKey: env.VITE_FIREBASE_API_KEY as string,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string,
    projectId: env.VITE_FIREBASE_PROJECT_ID as string,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
    appId: env.VITE_FIREBASE_APP_ID as string,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
  };

  const app = getApps()[0] ?? initializeApp(firebaseConfig);

  let auth: Auth | null = null;
  try {
    auth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: undefined,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[firebase] initializeAuth failed — auth unavailable in this environment", err);
  }

  let firestore: Firestore | null = null;
  try {
    firestore = initializeFirestore(app, {
      localCache: persistentLocalCache({
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[firebase] initializeFirestore failed — firestore unavailable in this environment", err);
  }

  let storage: FirebaseStorage | null = null;
  try {
    storage = getStorage(app);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[firebase] getStorage failed — storage unavailable", err);
  }

  let functions: Functions | null = null;
  try {
    const functionsRegion = (getRuntimeEnv().VITE_FIREBASE_FUNCTIONS_REGION as string) ?? "australia-southeast1";
    functions = getFunctions(app, functionsRegion as any);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[firebase] getFunctions failed — functions unavailable", err);
  }

  resources = { app, auth, firestore, storage, functions };
  return resources;
};

export const firebaseApp = (): FirebaseApp => getFirebase().app;
export const firebaseAuth = (): Auth | null => {
  return getFirebase().auth;
};
export const firebaseFirestore = (): Firestore | null => {
  return getFirebase().firestore;
};
export const firebaseStorage = (): FirebaseStorage | null => {
  return getFirebase().storage;
};
export const firebaseFunctions = (): Functions | null => {
  return getFirebase().functions;
};

export type UserRole = "owner" | "cashier";

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  status: "active" | "invited" | "suspended";
  displayName?: string;
  posPin?: string;
  createdAt?: Date;
  lastShiftClosedAt?: Date | null;
  forcePasswordReset?: boolean;
}
