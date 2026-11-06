
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDxwEbRUjibnD73Q-f0xYeovUJ3cL5HcHk",
  authDomain: "edgescore-cafd3.firebaseapp.com",
  projectId: "edgescore-cafd3",
  storageBucket: "edgescore-cafd3.appspot.com",
  messagingSenderId: "695072478192",
  appId: "1:695072478192:web:089c90467ce1ec2af1c335",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
