// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBsPku0LMeQl550teZ2tUlZsk-3Hjf3aQw",
  authDomain: "shinobipath-itinerary-planner.firebaseapp.com",
  projectId: "shinobipath-itinerary-planner",
  storageBucket: "shinobipath-itinerary-planner.firebasestorage.app",
  messagingSenderId: "376872381879",
  appId: "1:376872381879:web:3800f4b07aaa323f868c32",
  measurementId: "G-5T99DBZGH4",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
  }
};

export const logout = async () => {
  await signOut(auth);
};
