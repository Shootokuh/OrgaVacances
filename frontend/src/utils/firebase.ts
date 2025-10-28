import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "orga-vac-dev.firebaseapp.com",
  projectId: "orga-vac-dev",
  storageBucket: "orga-vac-dev.appspot.com",
  messagingSenderId: "187970966374",
  appId: "1:187970966374:web:383c0926829b2d09a6aea7",
  measurementId: "G-0F3RZCYDR9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);