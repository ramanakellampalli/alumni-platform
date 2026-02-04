import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase project configuration
// You'll get these values from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCMXAmwyx7D5b6maymeM5Myz_nT3ZV_110",
  authDomain: "alumni-platform-fd554.firebaseapp.com",
  projectId: "alumni-platform-fd554",
  storageBucket: "alumni-platform-fd554.firebasestorage.app",
  messagingSenderId: "180766688406",
  appId: "1:180766688406:web:3f93228f90b984b7b5eeb7",
  measurementId: "G-83EGM3G04S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
