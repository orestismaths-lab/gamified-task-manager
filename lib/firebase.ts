// Firebase configuration and initialization
// Replace with your Firebase config from Firebase Console

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBqYpcWeIVhsYxOgw4bNZIs2EP0VPQPvsA",
  authDomain: "gamified-task-manager-3e2a4.firebaseapp.com",
  projectId: "gamified-task-manager-3e2a4",
  storageBucket: "gamified-task-manager-3e2a4.firebasestorage.app",
  messagingSenderId: "597365672090",
  appId: "1:597365672090:web:6ac3bdde323721cb18f723",
  measurementId: "G-P6DYB5RDKN"
};

// Initialize Firebase (only if not already initialized)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export default app;

