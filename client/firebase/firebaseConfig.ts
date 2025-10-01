import {
  firebaseApp,
  firebaseAuth,
  firebaseFirestore,
  firebaseStorage,
} from "@/services/firebase";

export const app = firebaseApp();
export const auth = firebaseAuth();
export const db = firebaseFirestore();
export const storage = firebaseStorage();
