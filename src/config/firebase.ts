import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC1I6MTWdoHLt-EzcROIFHlAzFiVxMEML8",
  authDomain: "grubz-92e04.firebaseapp.com",
  projectId: "grubz-92e04",
  storageBucket: "grubz-92e04.firebasestorage.app",
  messagingSenderId: "1088977882597",
  appId: "1:1088977882597:web:39787e2b8457ef2006730c",
  measurementId: "G-0X70Z5PSNM"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
