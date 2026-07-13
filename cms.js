import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmpd_eZ_BCRV12ZcghPCzSPle6NXQWxsk",
  authDomain: "hotelgamesuscms.firebaseapp.com",
  projectId: "hotelgamesuscms",
  storageBucket: "hotelgamesuscms.firebasestorage.app",
  messagingSenderId: "1013426379116",
  appId: "1:1013426379116:web:09d6e5a40c83d8b31b3b49",
  measurementId: "G-21K2P60DH8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);