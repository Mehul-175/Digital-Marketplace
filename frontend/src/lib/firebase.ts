
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "digital-marketplace-f3458.firebaseapp.com",
  projectId: "digital-marketplace-f3458",
  storageBucket: "digital-marketplace-f3458.firebasestorage.app",
  messagingSenderId: "192717131328",
  appId: "1:192717131328:web:52604d8db1fe02ff0299a5"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export { auth, provider }