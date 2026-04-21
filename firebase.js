// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCM8yvAsrQ6eDrdEmWAB7N_MLkGLjfzCVw",
  authDomain: "charming-candlee.firebaseapp.com",
  projectId: "charming-candlee",
  storageBucket: "charming-candlee.firebasestorage.app",
  messagingSenderId: "658723983327",
  appId: "1:658723983327:web:3f4e6f84a01c5b59203e6a",
  measurementId: "G-P50B2F2GT0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);

export default app;
