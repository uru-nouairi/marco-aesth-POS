import { initializeApp, type FirebaseApp, getApps } from "firebase/app";
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
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
  functions: Functions;
}

const requiredEnvKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

function validateConfig(): void {
  const missing = requiredEnvKeys.filter((key) => !firebaseConfig[key as keyof typeof firebaseConfig]);
  if (missing.length > 0) {
    console.warn(
      `[firebase] Missing configuration values: ${missing.join(", ")}. Add them to your Vite environment file to connect Firebase.`,
    );
  }
}

let resources: FirebaseResources | null = null;

export const getFirebase = (): FirebaseResources => {
  if (resources) {
    return resources;
  }

  validateConfig();

  const app = getApps()[0] ?? initializeApp(firebaseConfig);

  const auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    popupRedirectResolver: undefined,
  });

  const firestore = initializeFirestore(app, {
    localCache: persistentLocalCache({
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      tabManager: persistentMultipleTabManager(),
    }),
  });

  const storage = getStorage(app);
  const functionsRegion = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION ?? "australia-southeast1";
  const functions = getFunctions(app, functionsRegion);

  resources = { app, auth, firestore, storage, functions };
  return resources;
};

export const firebaseApp = (): FirebaseApp => getFirebase().app;
export const firebaseAuth = (): Auth => getFirebase().auth;
export const firebaseFirestore = (): Firestore => getFirebase().firestore;
export const firebaseStorage = (): FirebaseStorage => getFirebase().storage;
export const firebaseFunctions = (): Functions => getFirebase().functions;

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
