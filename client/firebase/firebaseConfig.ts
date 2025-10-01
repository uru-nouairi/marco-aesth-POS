import { firebaseApp, firebaseAuth, firebaseFirestore } from "@/services/firebase";

export const app = firebaseApp();
export const auth = firebaseAuth();
export const db = firebaseFirestore();
