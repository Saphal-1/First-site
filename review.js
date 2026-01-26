import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  runTransaction
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDMIgjDVUOiRvjgplXce15DD27wUe-04LQ",
  authDomain: "firstsitexyz.firebaseapp.com",
  databaseURL: "https://firstsitexyz-default-rtdb.firebaseio.com",
  projectId: "firstsitexyz"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elements
const form = document.getElementById("reviewForm");
const reviewsBox = document.getElementById("reviews");
const stars = document.querySelectorAll(".stars i");

let rating = 0;

// ⭐ Star rating
stars.forEach(star => {
  star.onclick = () => {
    rating = Number(star.dataset.v);
    stars.forEach(s =>
      s.className =
        Number(s.dataset.v) <= rating
          ? "fa-solid fa-star"
          : "fa-regular fa-star"
    );
  };
});

// 📝 Submit review
form.onsubmit = e => {
  e.preventDefault();
  if (rating === 0) return alert("Please select rating");

  push(ref(db, "reviews"), {
    name: name.value.trim(),
    title: title.value.trim(),
    message: message.value.trim(),
    rating,
    createdAt: Date.now(),
    votes: { up: 0, down: 0 }
  });

  form.reset();
  rating = 0;
  stars.forEach(s => s.className = "fa-regular fa-star");
};

// 📥 Load reviews
onValue(ref(db, "reviews"), snap => {
  reviewsBox.innerHTML = "";

  const data = [];
  snap.forEach(c => data.push({ id: c.key, ...c.val() }));

  data.sort((a, b) => b.createdAt - a.createdAt);

  data.forEach(r => {
    reviewsBox.innerHTML += `
      <div class="card">
        <b>${escape(r.name)}</b> • ${"★".repeat(r.rating)}
        <h4>${escape(r.title)}</h4>
        <p>${escape(r.message)}</p>
        <small>${new Date(r.createdAt).toLocaleString()}</small>
        <div class="vote">
          <button onclick="vote('${r.id}','up')">👍 ${r.votes?.up || 0}</button>
          <button onclick="vote('${r.id}','down')">👎 ${r.votes?.down || 0}</button>
        </div>
      </div>`;
  });
});

// 👍 Voting (1 per day)
window.vote = (id, type) => {
  const key = `vote-${id}-${new Date().toDateString()}`;
  if (localStorage.getItem(key)) return alert("Already voted today");

  runTransaction(ref(db, `reviews/${id}/votes/${type}`), v => (v || 0) + 1);
  localStorage.setItem(key, "1");
};

// 🛡 Escape HTML
function escape(str) {
  return str.replace(/[&<>"']/g, m =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m])
  );
                     }    name: user.email,
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
