import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBeJyDV_9XtQ3uHM_ZYI7BoE40fn6QfPYo",
  authDomain: "cinemultiplex.firebaseapp.com",
  projectId: "cinemultiplex",
  storageBucket: "cinemultiplex.firebasestorage.app",
  messagingSenderId: "595772193554",
  appId: "1:595772193554:web:6de65d7b948930957851cb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = "multiplex-canning";