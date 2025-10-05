// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaIVN9gsSSy9aK2GtyNaSSojLnwxZYPzQ",
  authDomain: "stormhacks2025-f53b9.firebaseapp.com",
  projectId: "stormhacks2025-f53b9",
  storageBucket: "stormhacks2025-f53b9.firebasestorage.app",
  messagingSenderId: "652698241045",
  appId: "1:652698241045:web:af5d1dbb6fe608e212261c",
  measurementId: "G-QSCNY4DSJL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };