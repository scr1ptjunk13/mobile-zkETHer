// Firebase configuration for Expo/React Native
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your Firebase project configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBcEaSMZ_mrhofoHZ0aNRst_CXwY_uu3q0",
  authDomain: "mobile-zketh-otp.firebaseapp.com",
  projectId: "mobile-zketh-otp",
  storageBucket: "mobile-zketh-otp.firebasestorage.app",
  messagingSenderId: "694765970989",
  appId: "1:694765970989:android:46b649a3e059a89cfe7aa4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
