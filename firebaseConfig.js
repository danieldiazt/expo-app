// firebaseConfig.jsx
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCBJReuUaI11pX7Rz9ssYNCGLJoojEg8E8",
    authDomain: "baloto-a6d7f.firebaseapp.com",
    projectId: "baloto-a6d7f",
    storageBucket: "baloto-a6d7f.firebasestorage.app",
    messagingSenderId: "1004239133954",
    appId: "1:1004239133954:web:ed2c5cbf4e0a1d18d5b61b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };