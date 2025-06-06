// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {initializeAuth, getReactNativePersistence} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCDPsW5_dQ5mHDY9mtcVfP_q6zdmvFfJ6c",
    authDomain: "music-version-control.firebaseapp.com",
    projectId: "music-version-control",
    storageBucket: "music-version-control.firebasestorage.app",
    messagingSenderId: "1343407837",
    appId: "1:1343407837:web:3b306f6fdc258f28c47d34",
    measurementId: "G-YB0TT1JCQH"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = initializeAuth(app,
    {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });