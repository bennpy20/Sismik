// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBy3vUtRO5cGXs5un0J1CjjH-JAPppaEmk",
  authDomain: "sismik-9b769.firebaseapp.com",
  projectId: "sismik-9b769",
  storageBucket: "sismik-9b769.firebasestorage.app",
  messagingSenderId: "756288719040",
  appId: "1:756288719040:web:25b5f15548095b41ff8525",
  measurementId: "G-H06HP2TVW4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);