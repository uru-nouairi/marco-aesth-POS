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

const env = import.meta.env as Record<string, string | undefined>;

const requiredEnvKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

function validateConfig(): void {
  const missing = requiredEnvKeys.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[firebase] Missing configuration values: ${missing.join(", ")}. Add them to your Vite environment file to connect Firebase.`,
    );
  }
}

let resources: FirebaseResources | null = null;

const firebaseConfig: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const getFirebase = (): FirebaseResources => {
  if (resources) {
    return resources;
  }

  validateConfig();

  const app = getApps()[0] ?? initializeApp(firebaseConfig);

  let auth: Auth | null = null;
  try {
    auth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: undefined,
    });
  } catch (err) {
    console.warn(
      "[firebase] initializeAuth failed — auth unavailable in this environment",
      err,
    );
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
    console.warn(
      "[firebase] initializeFirestore failed — firestore unavailable in this environment",
      err,
    );
  }

  let storage: FirebaseStorage | null = null;
  try {
    storage = getStorage(app);
  } catch (err) {
    console.warn("[firebase] getStorage failed — storage unavailable", err);
  }

  let functions: Functions | null = null;
  try {
    const functionsRegion =
      import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION ?? "australia-southeast1";
    functions = getFunctions(app, functionsRegion);
  } catch (err) {
    console.warn("[firebase] getFunctions failed — functions unavailable", err);
  }

  resources = { app, auth, firestore, storage, functions };
  return resources;
};

export const firebaseApp = (): FirebaseApp => getFirebase().app;
export const firebaseAuth = (): Auth => {
  const a = getFirebase().auth;
  if (!a) throw new Error("Firebase Auth is not available in this environment");
  return a;
};
export const firebaseFirestore = (): Firestore => {
  const f = getFirebase().firestore;
  if (!f) throw new Error("Firestore is not available in this environment");
  return f;
};
export const firebaseStorage = (): FirebaseStorage => {
  const s = getFirebase().storage;
  if (!s)
    throw new Error("Firebase Storage is not available in this environment");
  return s;
};
export const firebaseFunctions = (): Functions => {
  const fn = getFirebase().functions;
  if (!fn)
    throw new Error("Firebase Functions is not available in this environment");
  return fn;
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
