import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBBgf4L_DY1bNjjCU1u_QdyBG-yZvElsmE",
  authDomain: "buy2basket-e-commerce.firebaseapp.com",
  projectId: "buy2basket-e-commerce",
  storageBucket: "buy2basket-e-commerce.firebasestorage.app",
  messagingSenderId: "770136506717",
  appId: "1:770136506717:web:d5729f2bb68c8a8032a8b4",
  measurementId: "G-3XC9557QB5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app) 
