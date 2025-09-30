import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type FirestoreError,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { User } from "firebase/auth";
import {
  firebaseAuth,
  firebaseFirestore,
  firebaseFunctions,
  type UserProfile,
  type UserRole,
} from "@/services/firebase";

interface CreateUserPayload {
  email: string;
  password: string;
  role: UserRole;
  status?: "active" | "invited" | "suspended";
  displayName?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  initialized: boolean; // indicates Firebase services are available
  requiresPasswordChange: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createUserAccount: (payload: CreateUserPayload) => Promise<void>;
  resetCashierPin: (uid: string, pin: string) => Promise<void>;
  changeOwnerPassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const DEFAULT_OWNER_EMAIL = "owner@marcoaesthetics.png";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const hashPin = async (pin: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin.trim());
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const mapFirestoreProfile = (docData: DocumentData, uid: string): UserProfile => {
  const createdAtValue = docData.createdAt?.toDate?.() ?? docData.createdAt ?? undefined;
  const lastShiftClosedAtValue = docData.lastShiftClosedAt?.toDate?.() ?? docData.lastShiftClosedAt ?? null;

  return {
    uid,
    email: docData.email,
    role: docData.role,
    status: docData.status ?? "active",
    displayName: docData.displayName,
    posPin: docData.posPin,
    createdAt: createdAtValue,
    lastShiftClosedAt: lastShiftClosedAtValue,
    forcePasswordReset: docData.forcePasswordReset ?? false,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  let auth: ReturnType<typeof firebaseAuth> | null = null;
  let firestore: ReturnType<typeof firebaseFirestore> | null = null;
  let functions: ReturnType<typeof firebaseFunctions> | null = null;
  let initError: unknown = null;

  try {
    auth = firebaseAuth();
    firestore = firebaseFirestore();
    functions = firebaseFunctions();
  } catch (err) {
    // Firebase not configured in environment; fail gracefully and allow UI to render with limited features
    console.warn("[firebase] initialization failed — running in offline/mock mode", err);
    initError = err;
  }

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  const initialized = !!auth && !!firestore;

  useEffect(() => {
    if (!initialized) {
      // Demo fallback: pre-seed owner user for offline/demo mode so UI can be explored
      setUser({
        uid: "demo-owner",
        email: DEFAULT_OWNER_EMAIL,
        displayName: "Demo Owner",
        // @ts-expect-error minimal mock
      } as User);
      setProfile({
        uid: "demo-owner",
        email: DEFAULT_OWNER_EMAIL,
        role: "owner",
        status: "active",
        displayName: "Connie T.",
        createdAt: new Date(),
        lastShiftClosedAt: null,
        forcePasswordReset: false,
      });
      setRole("owner");
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth!, (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setRole(null);
        setRequiresPasswordChange(false);
        setLoading(false);
        return;
      }

      const userDocRef = doc(firestore, "users", currentUser.uid);

      const unsubscribeProfile = onSnapshot(
        userDocRef,
        async (snapshot) => {
          if (!snapshot.exists()) {
            const inferredRole: UserRole =
              currentUser.email?.toLowerCase() === DEFAULT_OWNER_EMAIL ? "owner" : "cashier";

            await setDoc(
              userDocRef,
              {
                uid: currentUser.uid,
                email: currentUser.email,
                role: inferredRole,
                status: "active",
                createdAt: serverTimestamp(),
                forcePasswordReset: inferredRole === "owner",
              },
              { merge: true },
            );
            return;
          }

          const profileData = mapFirestoreProfile(snapshot.data(), snapshot.id);
          setProfile(profileData);
          setRole(profileData.role);
          setRequiresPasswordChange(profileData.forcePasswordReset ?? false);
          setLoading(false);
        },
        (error: FirestoreError) => {
          console.error("Failed to subscribe to user profile", error);
          setLoading(false);
        },
      );

      return () => {
        unsubscribeProfile();
      };
    });

    return () => {
      unsubscribeAuth();
    };
  }, [auth, firestore]);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not configured — cannot sign in");
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  };

  const createUserAccount = async ({ email, password, role: newRole, status = "active", displayName }: CreateUserPayload) => {
    if (!functions || !firestore) throw new Error("Firebase not configured — cannot create users");
    const callable = httpsCallable(functions, "createPosUser");
    try {
      const { data } = await callable({ email, password, role: newRole, status, displayName });
      const { uid } = data as { uid: string };
      await setDoc(
        doc(firestore, "users", uid),
        {
          uid,
          email,
          role: newRole,
          status,
          displayName: displayName ?? null,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (error) {
      console.error("createPosUser cloud function failed", error);
      throw error;
    }
  };

  const resetCashierPin = async (uid: string, pin: string) => {
    if (!firestore) throw new Error("Firebase not configured — cannot reset PIN");
    const hashedPin = await hashPin(pin);
    await updateDoc(doc(firestore, "users", uid), {
      posPin: hashedPin,
      posPinUpdatedAt: serverTimestamp(),
    });
  };

  const changeOwnerPassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) {
      throw new Error("No authenticated owner account found");
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    if (profile?.forcePasswordReset) {
      await updateDoc(doc(firestore, "users", user.uid), {
        forcePasswordReset: false,
      });
      setRequiresPasswordChange(false);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      role,
      loading,
      requiresPasswordChange,
      signIn,
      signOut,
      createUserAccount,
      resetCashierPin,
      changeOwnerPassword,
    }),
    [user, profile, role, loading, requiresPasswordChange],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
