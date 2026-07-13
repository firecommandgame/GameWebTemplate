// ======================================================
// HOTEL GAMES FIREBASE CMS
// Handles:
// - Firebase connection
// - Administrator login/logout
// - Saving posts to Firestore
// - Loading News, Media, and Community posts
// ======================================================

// ------------------------------
// Firebase imports
// ------------------------------

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";


// ------------------------------
// Firebase configuration
// ------------------------------

const firebaseConfig = {
    apiKey: "AIzaSyCmpd_eZ_BCRV12ZcghPCzSPle6NXQWxsk",
    authDomain: "hotelgamesuscms.firebaseapp.com",
    projectId: "hotelgamesuscms",
    storageBucket: "hotelgamesuscms.firebasestorage.app",
    messagingSenderId: "1013426379116",
    appId: "1:1013426379116:web:09d6e5a40c83d8b31b3b49",
    measurementId: "G-21K2P60DH8"
};


// ------------------------------
// Initialize Firebase
// ------------------------------

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// ======================================================
// SECURITY AND DISPLAY HELPERS
// ======================================================

// Prevent titles and body text from injecting HTML into the page.
function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}


// Allow normal image filenames, relative paths, and HTTPS URLs.
function getSafeImageSource(value = "") {
    const source = String(value).trim();

    if (!source) {
        return "";
    }

    const isHttpsUrl = source.startsWith("https://");
    const isRelativePath =
        source.startsWith("./") ||
        source.startsWith("../") ||
        /^[a-zA-Z0-9/_\-.%]+$/.test(source);

    if (isHttpsUrl || isRelativePath) {
        return source;
    }

    return "";
}


// Convert Firestore timestamps into readable dates.
function formatPostDate(timestamp) {
    if (!timestamp) {
        return "";
    }

    try {
        const date =
            typeof timestamp.toDate === "function"
                ? timestamp.toDate()
                : new Date(timestamp);

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    } catch (error) {
        console.error("Unable to format post date:", error);
        return "";
    }
}


// Convert a post into an HTML card.
function createPostCard(post) {
    const title = escapeHTML(post.title || "Untitled");
    const body = escapeHTML(post.body || "").replace(/\n/g, "<br>");
    const imageSource = getSafeImageSource(post.image || "");
    const date = escapeHTML(formatPostDate(post.createdAt));

    return `
        <article class="card">

            ${
                imageSource
                    ? `
                        <img
                            src="${escapeHTML(imageSource)}"
                            alt="${title}"
                            loading="lazy"
                        >
                    `
                    : ""
            }

            <div class="content">

                <h3>${title}</h3>

                <p>${body}</p>

                ${
                    date
                        ? `<p class="small">${date}</p>`
                        : ""
                }

            </div>

        </article>
    `;
}


// ======================================================
// LOAD PUBLISHED POSTS
// ======================================================

async function loadPosts(category) {
    const postsContainer = document.getElementById("posts");

    if (!postsContainer) {
        return;
    }

    postsContainer.innerHTML = `
        <p class="small">Loading posts...</p>
    `;

    try {
        /*
        This query retrieves published posts.

        Category filtering and sorting happen in JavaScript.
        This avoids requiring a Firestore composite index.
        */

        const postsQuery = query(
            collection(db, "posts"),
            where("status", "==", "published")
        );

        const querySnapshot = await getDocs(postsQuery);

        const posts = [];

        querySnapshot.forEach(documentSnapshot => {
            const post = {
                id: documentSnapshot.id,
                ...documentSnapshot.data()
            };

            if (post.category === category) {
                posts.push(post);
            }
        });

        // Newest post first.
        posts.sort((firstPost, secondPost) => {
            const firstTime =
                firstPost.createdAt?.toMillis?.() || 0;

            const secondTime =
                secondPost.createdAt?.toMillis?.() || 0;

            return secondTime - firstTime;
        });

        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <p class="small">
                    No posts have been published yet.
                </p>
            `;

            return;
        }

        postsContainer.innerHTML = posts
            .map(createPostCard)
            .join("");

    } catch (error) {
        console.error("Unable to load posts:", error);

        postsContainer.innerHTML = `
            <p class="small">
                Posts could not be loaded. Check your Firebase
                connection and Firestore security rules.
            </p>
        `;
    }
}


// Make loadPosts available to HTML body onload attributes.
//
// Example:
// <body onload="loadPosts('media')">

window.loadPosts = loadPosts;


// ======================================================
// ADMIN PAGE
// ======================================================

const postForm = document.getElementById("postForm");

if (postForm) {

    // Hide the publishing form until authentication is confirmed.
    postForm.style.display = "none";


    // ------------------------------
    // Create login panel
    // ------------------------------

    const loginSection = document.createElement("section");

    loginSection.id = "adminLoginSection";

    loginSection.innerHTML = `
        <form id="adminLoginForm">

            <h2>Administrator Login</h2>

            <p class="small">
                Sign in with the administrator account created
                in Firebase Authentication.
            </p>

            <input
                id="loginEmail"
                type="email"
                placeholder="Administrator Email"
                autocomplete="username"
                required
            >

            <input
                id="loginPassword"
                type="password"
                placeholder="Password"
                autocomplete="current-password"
                required
            >

            <button
                class="btn"
                id="loginBtn"
                type="submit"
            >
                Sign In
            </button>

            <p
                class="small"
                id="loginMessage"
                aria-live="polite"
            ></p>

        </form>
    `;

    const formSection = postForm.closest("section");

    if (formSection) {
        formSection.before(loginSection);
    } else {
        postForm.parentNode.insertBefore(loginSection, postForm);
    }


    // ------------------------------
    // Create administrator toolbar
    // ------------------------------

    const adminToolbar = document.createElement("div");

    adminToolbar.id = "adminToolbar";
    adminToolbar.style.display = "none";
    adminToolbar.style.marginBottom = "24px";

    adminToolbar.innerHTML = `
        <p
            class="small"
            id="adminIdentity"
        ></p>

        <button
            class="btn"
            id="logoutBtn"
            type="button"
        >
            Sign Out
        </button>
    `;

    postForm.insertBefore(
        adminToolbar,
        postForm.firstChild
    );


    // ------------------------------
    // Get login elements
    // ------------------------------

    const adminLoginForm =
        document.getElementById("adminLoginForm");

    const loginEmail =
        document.getElementById("loginEmail");

    const loginPassword =
        document.getElementById("loginPassword");

    const loginMessage =
        document.getElementById("loginMessage");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const adminIdentity =
        document.getElementById("adminIdentity");


    // ------------------------------
    // Administrator login
    // ------------------------------

    adminLoginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            loginMessage.textContent = "Signing in...";

            try {
                await signInWithEmailAndPassword(
                    auth,
                    loginEmail.value.trim(),
                    loginPassword.value
                );

                adminLoginForm.reset();
                loginMessage.textContent = "";

            } catch (error) {
                console.error("Administrator sign-in failed:", error);

                loginMessage.textContent =
                    "Sign-in failed. Check your email and password.";
            }
        }
    );


    // ------------------------------
    // Administrator logout
    // ------------------------------

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {
                await signOut(auth);
            } catch (error) {
                console.error("Sign-out failed:", error);

                alert("Unable to sign out.");
            }
        }
    );


    // ------------------------------
    // Detect login status
    // ------------------------------

    onAuthStateChanged(auth, user => {

        if (user) {
            loginSection.style.display = "none";
            postForm.style.display = "";
            adminToolbar.style.display = "";

            adminIdentity.textContent =
                `Signed in as ${user.email}`;

        } else {
            loginSection.style.display = "";
            postForm.style.display = "none";
            adminToolbar.style.display = "none";

            adminIdentity.textContent = "";
        }
    });


    // ------------------------------
    // Save post to Firestore
    // ------------------------------

    postForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!auth.currentUser) {
                alert("You must sign in before saving a post.");
                return;
            }

            const titleInput =
                document.getElementById("title");

            const categoryInput =
                document.getElementById("category");

            const imageInput =
                document.getElementById("image");

            const bodyInput =
                document.getElementById("body");

            const statusInput =
                document.getElementById("status");

            const submitButton =
                postForm.querySelector(
                    'button[type="submit"]'
                );


            // Validate required fields.
            if (!titleInput.value.trim()) {
                alert("Enter a post title.");
                return;
            }

            if (!categoryInput.value) {
                alert("Select a category.");
                return;
            }

            if (!bodyInput.value.trim()) {
                alert("Enter post content.");
                return;
            }


            const originalButtonText =
                submitButton.textContent;

            submitButton.disabled = true;
            submitButton.textContent = "Saving...";


            try {
                await addDoc(
                    collection(db, "posts"),
                    {
                        title: titleInput.value.trim(),

                        category: categoryInput.value,

                        image: imageInput.value.trim(),

                        body: bodyInput.value.trim(),

                        status: statusInput.value,

                        createdAt: serverTimestamp(),

                        authorEmail:
                            auth.currentUser.email,

                        authorUid:
                            auth.currentUser.uid
                    }
                );

                if (statusInput.value === "published") {
                    alert("Post published successfully.");
                } else {
                    alert("Draft saved successfully.");
                }

                postForm.reset();

            } catch (error) {
                console.error("Unable to save post:", error);

                alert(
                    "The post could not be saved. " +
                    "Check your Firestore security rules."
                );

            } finally {
                submitButton.disabled = false;
                submitButton.textContent =
                    originalButtonText;
            }
        }
    );
}
