import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth, signInAnonymously } from "firebase/auth";

// Basado en tu google-services.json (Android)
const firebaseConfig = {
  apiKey: "AIzaSyBOXQIaU_B5F6qUrBkMHyL6DcaZ4a4Ipco",
  authDomain: "grupo-g4-fn.firebaseapp.com",
  projectId: "grupo-g4-fn",
  storageBucket: "grupo-g4-fn.firebasestorage.app",
  messagingSenderId: "57848130730",
  appId: "1:57848130730:web:1aaf3cc3c73a7f2d15b4d3"
};
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const auth = getAuth(app);

// Para poder subir sin login de usuario (activa "Anonymous" en Firebase Auth)
if (!auth.currentUser) {
  signInAnonymously(auth).catch((e) =>
    console.warn("Firebase anonymous auth failed:", e?.message || e)
  );
}