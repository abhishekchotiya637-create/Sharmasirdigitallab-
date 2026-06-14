// ============================================================
// Sharma Sir's Digital Lab — Firebase Auth Module
// ============================================================
// ⚠️ STEP 1: Paste your firebaseConfig below (from Firebase Console
//    → Project Settings → General → Your apps → Web app)
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup,
  RecaptchaVerifier, signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// =============== FIREBASE CONFIG (Sharma Sir's Digital Lab) ===============
const firebaseConfig = {
  apiKey: "AIzaSyC0KSUHxzJPsk29ETOgojpH6rc003fBLII",
  authDomain: "sharma-sir-digital-lab-df5c4.firebaseapp.com",
  projectId: "sharma-sir-digital-lab-df5c4",
  storageBucket: "sharma-sir-digital-lab-df5c4.firebasestorage.app",
  messagingSenderId: "1055829277012",
  appId: "1:1055829277012:web:048eca81306175a51b30c1"
};
// =================================================================

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ---------- Email/Password ----------
export async function signupWithEmail(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", cred.user.uid), {
    name, email, createdAt: new Date().toISOString(), purchases: []
  }, { merge: true });
  return cred.user;
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ---------- Google ----------
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  await setDoc(doc(db, "users", cred.user.uid), {
    name: cred.user.displayName,
    email: cred.user.email,
    createdAt: new Date().toISOString()
  }, { merge: true });
  return cred.user;
}

// ---------- Phone OTP ----------
let confirmationResult = null;

export function setupRecaptcha(buttonId) {
  window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
    size: "invisible"
  });
}

export async function sendOtp(phoneNumber) {
  // phoneNumber format: +91XXXXXXXXXX
  confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
  return confirmationResult;
}

export async function verifyOtp(code) {
  const cred = await confirmationResult.confirm(code);
  await setDoc(doc(db, "users", cred.user.uid), {
    phone: cred.user.phoneNumber,
    createdAt: new Date().toISOString()
  }, { merge: true });
  return cred.user;
}

// ---------- Session / Logout ----------
export function watchAuthState(callback) {
  onAuthStateChanged(auth, callback);
}

export async function logout() {
  await signOut(auth);
}

// ---------- Purchases (Premium Content Access) ----------
// Each premium item has a unique "itemId" (e.g. "notes-cet2026-history")
export async function hasPurchased(uid, itemId) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return false;
  const purchases = snap.data().purchases || [];
  return purchases.includes(itemId);
}

export async function getUserData(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
    }
