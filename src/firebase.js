import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";      

const firebaseConfig = {
  apiKey: "AIzaSyAuy6rlUK70fxxBNUdjqQnow12HlhKnNiM",
  authDomain: "event-finder-40141.firebaseapp.com",
  projectId: "event-finder-40141",
  storageBucket: "event-finder-40141.firebasestorage.app",
  messagingSenderId: "18385202737",
  appId: "1:18385202737:web:55e6a28f641b02c4e76f10",
  measurementId: "G-VLL9T53HJL",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
