// ===============================
// HOTEL GAMES CMS
// Firebase Connection
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const firebaseConfig = {

    apiKey: "AIzaSyCmpd_eZ_BCRV12ZcghPCzSPle6NXQWxsk",

    authDomain: "hotelgamesuscms.firebaseapp.com",

    projectId: "hotelgamesuscms",

    storageBucket: "hotelgamesuscms.firebasestorage.app",

    messagingSenderId: "1013426379116",

    appId: "1:1013426379116:web:09d6e5a40c83d8b31b3b49",

    measurementId: "G-21K2P60DH8"

};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// =====================================
// ADMIN LOGIN
// =====================================

const form = document.getElementById("postForm");

if (form) {

    // Create login panel

    const loginBox = document.createElement("div");

    loginBox.innerHTML = `

        <input
            id="loginEmail"
            type="email"
            placeholder="Admin Email"
        >

        <input
            id="loginPassword"
            type="password"
            placeholder="Password"
        >

        <button
            class="btn"
            id="loginBtn"
            type="button"
        >
            Sign In
        </button>

        <button
            class="btn"
            id="logoutBtn"
            type="button"
            style="display:none"
        >
            Logout
        </button>

        <hr style="margin:25px 0">

    `;

    form.parentNode.insertBefore(loginBox, form);

    form.style.display = "none";

    const loginBtn = document.getElementById("loginBtn");

    const logoutBtn = document.getElementById("logoutBtn");


    // ==========================
    // Login
    // ==========================

    loginBtn.onclick = async () => {

        try {

            await signInWithEmailAndPassword(

                auth,

                document.getElementById("loginEmail").value,

                document.getElementById("loginPassword").value

            );

        }

        catch (error) {

            alert(error.message);

        }

    };


    // ==========================
    // Logout
    // ==========================

    logoutBtn.onclick = () => {

        signOut(auth);

    };


    // ==========================
    // Detect Login State
    // ==========================

    onAuthStateChanged(auth, (user) => {

        if (user) {

            form.style.display = "";

            loginBtn.style.display = "none";

            logoutBtn.style.display = "";

        }

        else {

            form.style.display = "none";

            loginBtn.style.display = "";

            logoutBtn.style.display = "none";

        }

    });

}
