// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyDMIgjDVUOiRvjgplXce15DD27wUe-04LQ",
  authDomain: "firstsitexyz.firebaseapp.com",
  databaseURL: "https://firstsitexyz-default-rtdb.firebaseio.com", // Ensure RTDB is enabled in Firebase Console
  projectId: "firstsitexyz",
  storageBucket: "firstsitexyz.firebasestorage.app",
  messagingSenderId: "104279243313",
  appId: "1:104279243313:web:485df97877f6a1cb31b310"
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const auth = firebase.auth();

const reviewForm = document.getElementById("reviewForm");
const container = document.getElementById("reviewsContainer");
const userStatus = document.getElementById("userStatus");

let currentUser = null;
const ADMIN_EMAIL = "gamersaphal8@gmail.com"; // change this

// ================= AUTH =================
function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.createUserWithEmailAndPassword(email, password)
        .catch(err => alert(err.message));
}

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .catch(err => alert(err.message));
}

function logout() {
    auth.signOut();
}

auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        userStatus.innerText = "Logged in as: " + user.email;
    } else {
        currentUser = null;
        userStatus.innerText = "Not logged in";
    }
});

// ================= LOAD REVIEWS =================
database.ref("reviews")
.orderByChild("timestamp")
.on("value", snapshot => {
    container.innerHTML = "";
    const reviews = [];

    snapshot.forEach(child => {
        reviews.push({
            id: child.key,
            data: child.val()
        });
    });

    reviews.reverse(); // newest first

    reviews.forEach(item => renderReview(item.id, item.data));
});

// ================= RENDER =================
function renderReview(id, data) {
    const card = document.createElement("div");
    card.className = "card";

    const isOwner = currentUser && currentUser.uid === data.uid;
    const isAdmin = currentUser && currentUser.email === ADMIN_EMAIL;

    card.innerHTML = `
        ${(isOwner || isAdmin) ? `
        <div class="three-dots" onclick="toggleMenu('${id}', event)">⋮</div>
        <div id="menu-${id}" class="admin-menu">
            ${isOwner ? `<button onclick="editReview('${id}', \`${data.message}\`)">Edit</button>` : ""}
            <button onclick="deleteReview('${id}')">Delete</button>
        </div>
        ` : ""}

        <div class="rating-stars">${"★".repeat(data.rating)}</div>
        <p>"${data.message}"</p>
        <div>
            <strong>${data.name}</strong> • ${data.date}
        </div>
    `;

    container.appendChild(card);
}

// ================= POST =================
reviewForm.addEventListener("submit", e => {
    e.preventDefault();

    if (!currentUser) {
        alert("Please login first!");
        return;
    }

    const newReview = {
        name: document.getElementById("reviewName").value,
        rating: parseInt(document.getElementById("reviewRating").value),
        message: document.getElementById("reviewMessage").value,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now(),
        uid: currentUser.uid,
        email: currentUser.email
    };

    database.ref("reviews").push(newReview)
        .then(() => reviewForm.reset())
        .catch(err => alert(err.message));
});

// ================= EDIT (ONLY MESSAGE) =================
window.editReview = function(id, currentMsg) {
    const newMsg = prompt("Edit your review:", currentMsg);

    if (newMsg && newMsg !== currentMsg) {
        database.ref("reviews/" + id).update({
            message: newMsg
        });
    }
};

// ================= DELETE =================
window.deleteReview = function(id) {
    if (!currentUser) return;

    if (confirm("Are you sure?")) {
        database.ref("reviews/" + id).remove();
    }
};

// ================= MENU =================
window.toggleMenu = function(id, event) {
    event.stopPropagation();
    const menu = document.getElementById(`menu-${id}`);
    document.querySelectorAll('.admin-menu')
        .forEach(m => m.style.display = "none");

    menu.style.display = menu.style.display === "block" ? "none" : "block";
};

window.onclick = () => {
    document.querySelectorAll('.admin-menu')
        .forEach(m => m.style.display = "none");
};
