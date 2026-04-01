import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRWhZHMHk3YMMSOW_Bct5XvjLLQmL-bRk",
  authDomain: "sendflow-challenge-9c3ba.firebaseapp.com",
  databaseURL: "https://sendflow-challenge-9c3ba-default-rtdb.firebaseio.com",
  projectId: "sendflow-challenge-9c3ba",
  storageBucket: "sendflow-challenge-9c3ba.firebasestorage.app",
  messagingSenderId: "966518381881",
  appId: "1:966518381881:web:b4063b7295685ba9469ce8",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
