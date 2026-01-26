// ================= FIREBASE CONFIG =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  push,
  onValue,
  update,
  remove,
  runTransaction
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDMIgjDVUOiRvjgplXce15DD27wUe-04LQ",
  authDomain: "firstsitexyz.firebaseapp.com",
  projectId: "firstsitexyz",
  databaseURL: "https://firstsitexyz-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ================= ADMIN =================
const ADMIN_UIDS = [
  "PUT_YOUR_FIREBASE_UID_HERE"
];

// ================= ELEMENTS =================
const authBox = document.getElementById("auth");
const userBox = document.getElementById("userBox");
const reviewForm = document.getElementById("reviewForm");
const userName = document.getElementById("userName");
const reviews = document.getElementById("reviews");

const email = document.getElementById("email");
const password = document.getElementById("password");

// ================= LOGIN =================
window.googleLogin = () => {
  const provider = new GoogleAuthProvider();
  signInWithRedirect(auth, provider);
};

window.emailLogin = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      await createUserWithEmailAndPassword(auth, email.value, password.value);
    } else {
      alert(err.message);
    }
  }
};

window.logout = () => signOut(auth);

// ================= AUTH STATE =================
onAuthStateChanged(auth, user => {
  if (user) {
    authBox.style.display = "none";
    userBox.style.display = "block";
    reviewForm.style.display = "block";
    userName.textContent = user.email || "User";
    loadReviews();
  } else {
    authBox.style.display = "block";
    userBox.style.display = "none";
    reviewForm.style.display = "none";
  }
});

// ================= STAR RATING =================
let rating = 0;
document.querySelectorAll(".stars i").forEach(star => {
  star.onclick = () => {
    rating = Number(star.dataset.v);
    document.querySelectorAll(".stars i").forEach(s => {
      s.className =
        Number(s.dataset.v) <= rating
          ? "fa-solid fa-star"
          : "fa-regular fa-star";
    });
  };
});

// ================= SUBMIT REVIEW =================
reviewForm.onsubmit = e => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user || rating === 0) return alert("Give rating");

  push(ref(db, "reviews"), {
    uid: user.uid,
    name: user.email,
    title: title.value,
    msg: message.value,
    rating,
    time: Date.now(),
    votes: { up: 0, down: 0 }
  });

  reviewForm.reset();
};

// ================= LOAD REVIEWS =================
function loadReviews() {
  onValue(ref(db, "reviews"), snap => {
    reviews.innerHTML = "";
    snap.forEach(c => {
      const r = c.val();
      const id = c.key;
      const owner = auth.currentUser?.uid === r.uid;
      const admin = ADMIN_UIDS.includes(auth.currentUser?.uid);

      reviews.innerHTML += `
        <div class="card">
          <b>${r.name}</b> — ${"★".repeat(r.rating)}
          <h4>${r.title}</h4>
          <p>${r.msg}</p>

          <button onclick="vote('${id}','up')">👍 ${r.votes?.up || 0}</button>
          <button onclick="vote('${id}','down')">👎 ${r.votes?.down || 0}</button>

          ${owner || admin ? `
            <button onclick="editReview('${id}')">Edit</button>
            <button onclick="deleteReview('${id}')">Delete</button>
          ` : ""}
        </div>`;
    });
  });
}

// ================= VOTING =================
window.vote = (id, type) => {
  const key = `vote-${id}-${new Date().toDateString()}`;
  if (localStorage.getItem(key)) return alert("Already voted today");

  runTransaction(ref(db, `reviews/${id}/votes/${type}`), v => (v || 0) + 1);
  localStorage.setItem(key, "1");
};

// ================= EDIT / DELETE =================
window.editReview = id => {
  const msg = prompt("Edit message");
  if (msg) update(ref(db, "reviews/" + id), { msg });
};

window.deleteReview = id => remove(ref(db, "reviews/" + id));
