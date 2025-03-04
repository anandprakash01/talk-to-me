// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
// import {getAnalytics} from "firebase/analytics";

import {getAuth, GoogleAuthProvider} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0mBu4BqeXICbtIVKhrEUvtSy8ajfMlyA",
  authDomain: "talk-to-me-web.firebaseapp.com",
  projectId: "talk-to-me-web",
  storageBucket: "talk-to-me-web.firebasestorage.app",
  messagingSenderId: "567449022581",
  appId: "1:567449022581:web:0e3eb107b3ec0eb92d083c",
  measurementId: "G-9CG04MLJNC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
// const analytics = getAnalytics(app);

export {auth, provider};
