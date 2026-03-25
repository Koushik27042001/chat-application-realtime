import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyByNIG9Zs3CK67_DBdecUqz2pOLi__jSxw",
  authDomain: "chat-application-19f75.firebaseapp.com",
  projectId: "chat-application-19f75",
  storageBucket: "chat-application-19f75.firebasestorage.app",
  messagingSenderId: "245883713190",
  appId: "1:245883713190:web:0e7d09c120de6933d9e667",
  measurementId: "G-6SREHP0S1R",
};

const app = initializeApp(firebaseConfig);

const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export { app, analytics };
