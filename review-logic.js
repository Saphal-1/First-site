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

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// ================= REVIEW SYSTEM =================
const reviewForm = document.getElementById("reviewForm");
const container = document.getElementById("reviewsContainer");
const SECRET_CODE = "saphal-dev-admin"; // Change this to your secret code

// 1. Listen for data
database.ref("reviews").on("value", (snapshot) => {
    container.innerHTML = ""; 
    snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        const id = childSnapshot.key;
        renderReview(id, data);
    });
});

// 2. UI Rendering
function renderReview(id, data) {
    const card = document.createElement("div");
    card.className = "card review-card";

    card.innerHTML = `
        <div class="three-dots" onclick="toggleMenu('${id}', event)">
            <i class="fa-solid fa-ellipsis-vertical"></i>
        </div>
        <div id="menu-${id}" class="admin-menu">
            <button onclick="promptEdit('${id}', '${data.message}')">Edit Review</button>
            <button onclick="promptDelete('${id}')">Delete Review</button>
        </div>
        <div class="rating-stars">${"★".repeat(data.rating)}</div>
        <p style="margin-bottom: 15px; font-size: 15px; opacity: 0.9;">"${data.message}"</p>
        <div style="font-size: 12px; opacity: 0.5;">
            <strong>${data.name}</strong> • ${data.date}
        </div>
    `;
    container.prepend(card);
}

// 3. Post Review
reviewForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const newReview = {
        name: document.getElementById("reviewName").value,
        rating: parseInt(document.getElementById("reviewRating").value),
        message: document.getElementById("reviewMessage").value,
        date: new Date().toLocaleDateString()
    };

    database.ref("reviews").push(newReview)
        .then(() => reviewForm.reset())
        .catch((error) => alert("Error: " + error.message));
});

// 4. Admin Functions
window.toggleMenu = function(id, event) {
    event.stopPropagation();
    const menu = document.getElementById(`menu-${id}`);
    const allMenus = document.querySelectorAll('.admin-menu');
    allMenus.forEach(m => { if(m !== menu) m.style.display = "none"; });
    menu.style.display = menu.style.display === "block" ? "none" : "block";
};

window.promptDelete = function(id) {
    const userInput = prompt("Enter Admin Secret Code to delete:");
    if (userInput === SECRET_CODE) {
        database.ref("reviews/" + id).remove();
    } else if (userInput !== null) {
        alert("Incorrect Code!");
    }
};

window.promptEdit = function(id, currentMsg) {
    // Basic owner edit - in this simple system, we use the same code or just allow it
    const newMsg = prompt("Edit your review content:", currentMsg);
    if (newMsg && newMsg !== currentMsg) {
        database.ref("reviews/" + id).update({ message: newMsg });
    }
};

// Close menu on click outside
window.onclick = () => document.querySelectorAll('.admin-menu').forEach(m => m.style.display = "none");
