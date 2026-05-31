import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Client Firebase config (apiKey is safe to ship — security rules protect data).
 * In Firebase Console → Authentication: enable Email/Password + Google, and add
 * `localhost` (and your production domain) under Authorized domains.
 */
const firebaseConfig = {
  apiKey: "AIzaSyB3Gzs4kFZYEjBMBgYohvHAoEI08Wa1mBo",
  authDomain: "ai-learning-dashboard-77689.firebaseapp.com",
  projectId: "ai-learning-dashboard-77689",
  storageBucket: "ai-learning-dashboard-77689.firebasestorage.app",
  messagingSenderId: "653610172924",
  appId: "1:653610172924:web:77faba53cf202ab0343279",
  measurementId: "G-XK7SQCR6Q6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;