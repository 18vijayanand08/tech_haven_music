// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFeEzAvwVaDTw-G9e4OK9Qz3yI0ghx3E8",
  authDomain: "tech-haven-music-8b2c5.firebaseapp.com",
  projectId: "tech-haven-music-8b2c5",
  storageBucket: "tech-haven-music-8b2c5.firebasestorage.app",
  messagingSenderId: "627594184544",
  appId: "1:627594184544:web:cb89f928fb523b06778005"
};

// Initialize Firebase
const firebaseapp = initializeApp(firebaseConfig);

export let __AUTH = getAuth(firebaseapp)

export let __DB =getFirestore(firebaseapp)