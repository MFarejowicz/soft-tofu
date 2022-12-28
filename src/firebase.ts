import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDiA8xUyktDXGhMQY7BVGPkbiAjJ9nmopU",
  authDomain: "soft-tofu.firebaseapp.com",
  databaseURL: "https://soft-tofu-default-rtdb.firebaseio.com",
  projectId: "soft-tofu",
  storageBucket: "soft-tofu.appspot.com",
  messagingSenderId: "868951130631",
  appId: "1:868951130631:web:a3093c47640cbb891c20a2",
  measurementId: "G-F8SKNN54ML",
};

export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
