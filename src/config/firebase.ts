import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Your Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Optional, for Analytics
};

// Debug: Check if Firebase config is loaded
console.log('🔥 Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '✅ Loaded' : '❌ Missing',
  authDomain: firebaseConfig.authDomain ? '✅ Loaded' : '❌ Missing',
  projectId: firebaseConfig.projectId ? '✅ Loaded' : '❌ Missing',
  storageBucket: firebaseConfig.storageBucket ? '✅ Loaded' : '❌ Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Loaded' : '❌ Missing',
  appId: firebaseConfig.appId ? '✅ Loaded' : '❌ Missing'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to Firebase emulators in development (optional)
if (process.env.NODE_ENV === 'development' && !auth.emulatorConfig) {
  try {
    // Uncomment these lines if you want to use Firebase emulators for local development
    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectFirestoreEmulator(db, 'localhost', 8080);
    // connectStorageEmulator(storage, 'localhost', 9199);
    // connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (error) {
    console.log('Firebase emulators already connected or not available');
  }
}

export default app;
