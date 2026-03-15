import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDL77xCPWWUE1fpe2Wl90t1EeDEEQOwAho",
    authDomain: "quickcart-a6c39.firebaseapp.com",
    projectId: "quickcart-a6c39",
    storageBucket: "quickcart-a6c39.firebasestorage.app",
    messagingSenderId: "419232228820",
    appId: "1:419232228820:web:5f04b8eb992ce90b94a241",
    measurementId: "G-0EBD65ZCTY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
