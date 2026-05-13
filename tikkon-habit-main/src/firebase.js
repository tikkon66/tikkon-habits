import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyADAiIRdZuUGzfIoKv_d6J3EkDnMyuLdb0",
  authDomain: "tikkon-habit.firebaseapp.com",
  projectId: "tikkon-habit",
  storageBucket: "tikkon-habit.firebasestorage.app",
  messagingSenderId: "699199734898",
  appId: "1:699199734898:web:45e3330881395881a7eeeb",
  measurementId: "G-QCEWT98KMB"
};

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app);
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
