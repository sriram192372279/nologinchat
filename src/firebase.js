import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously, 
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

// Firebase configuration using Vite environment variables with robust fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBJRmDmun4FF4XtXmnlyZlBczrSJrQj4fQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dialy-water.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dialy-water",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dialy-water.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "990304703055",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:990304703055:web:4d3f64b8607c8b247e503a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0XK8QFW104"
};

// Initialize Firebase once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export {
  app,
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInAnonymously,
  firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  deleteDoc
};

