// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {initializeAuth, getReactNativePersistence} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import storage from '@react-native-firebase/storage';
import functions from '@react-native-firebase/functions';

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
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export {storage, functions}
