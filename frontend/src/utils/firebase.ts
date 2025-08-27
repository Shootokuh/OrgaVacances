import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAm220u1zaSEAll2r82nnebHgp-9pj89rg",
  authDomain: "orga-vacances.firebaseapp.com",
  projectId: "orga-vacances",
  storageBucket: "orga-vacances.appspot.com", // corrige ici: .app → .appspot.com
  messagingSenderId: "832598430152",
  appId: "1:832598430152:web:7b6aaa4882a63c5fabf0fd",
  measurementId: "G-CTZ5J51226"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);