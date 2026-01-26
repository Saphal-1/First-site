// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDMIgjDVUOiRvjgplXce15DD27wUe-04LQ",
  authDomain: "firstsitexyz.firebaseapp.com",
  projectId: "firstsitexyz",
  storageBucket: "firstsitexyz.firebasestorage.app",
  messagingSenderId: "104279243313",
  appId: "1:104279243313:web:485df97877f6a1cb31b310",
  measurementId: "G-V9N1F1Q9ZQ"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
const ADMIN_CODE = "Saphal is a developer";

// AUTH ELEMENTS
const authBox = document.getElementById("auth");
const userBox = document.getElementById("userBox");
const reviewForm = document.getElementById("reviewForm");
const userName = document.getElementById("userName");

// LOGIN
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
}

function emailLogin() {
  auth.signInWithEmailAndPassword(email.value, password.value)
    .catch(() => auth.createUserWithEmailAndPassword(email.value, password.value));
}

function logout() {
  auth.signOut();
}

// AUTH STATE
auth.onAuthStateChanged(user => {
  if (user) {
    authBox.style.display = "none";
    userBox.style.display = "block";
    reviewForm.style.display = "block";
    userName.innerText = user.email || user.displayName;
    loadReviews();
  } else {
    authBox.style.display = "block";
    userBox.style.display = "none";
    reviewForm.style.display = "none";
  }
});

// STAR SYSTEM
let rating = 0;
document.querySelectorAll(".stars i").forEach(star => {
  star.onclick = () => {
    rating = star.dataset.v;
    document.querySelectorAll(".stars i").forEach(s => {
      s.className = s.dataset.v <= rating ? "fa-solid fa-star" : "fa-regular fa-star";
    });
  };
});

// SUBMIT REVIEW
reviewForm.onsubmit = e => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user || rating === 0) return alert("Rating required");

  const data = {
    uid: user.uid,
    name: user.displayName || user.email,
    title: title.value,
    msg: message.value,
    rating: rating,
    time: Date.now(),
    votes: { up: 0, down: 0 }
  };

  db.ref("reviews").push(data);
  reviewForm.reset();
};

// LOAD REVIEWS
function loadReviews() {
  db.ref("reviews").on("value", snap => {
    reviews.innerHTML = "";
    snap.forEach(c => {
      const r = c.val();
      const id = c.key;
      const owner = auth.currentUser.uid === r.uid;

      reviews.innerHTML += `
      <div class="card">
        <b>${r.name}</b> — ${"★".repeat(r.rating)}
        <h4>${r.title}</h4>
        <p>${r.msg}</p>

        <button onclick="vote('${id}','up')">👍 ${r.votes?.up || 0}</button>
        <button onclick="vote('${id}','down')">👎 ${r.votes?.down || 0}</button>

        ${owner ? `<button onclick="editReview('${id}')">Edit</button>
        <button onclick="deleteReview('${id}')">Delete</button>` : ""}

        <button onclick="admin('${id}')">Admin</button>
      </div>`;
    });
  });
}

// VOTE (DAILY)
function vote(id, type) {
  const key = `vote-${id}`;
  if (localStorage.getItem(key)) return alert("Already voted today");
  db.ref(`reviews/${id}/votes/${type}`).transaction(v => (v || 0) + 1);
  localStorage.setItem(key, Date.now());
}

// OWNER
function editReview(id) {
  const msg = prompt("Edit review");
  if (msg) db.ref("reviews/" + id).update({ msg });
}

function deleteReview(id) {
  db.ref("reviews/" + id).remove();
}

// ADMIN
function admin(id) {
  const code = prompt("Admin code");
  if (code !== ADMIN_CODE) return;
  const act = prompt("edit / delete");
  if (act === "delete") deleteReview(id);
  if (act === "edit") editReview(id);
        }
