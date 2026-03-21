// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyDMIgjDVUOiRvjgplXce15DD27wUe-04LQ",
  authDomain: "firstsitexyz.firebaseapp.com",
  databaseURL: "https://firstsitexyz-default-rtdb.firebaseio.com",
  projectId: "firstsitexyz",
  storageBucket: "firstsitexyz.firebasestorage.app",
  messagingSenderId: "104279243313",
  appId: "1:104279243313:web:485df97877f6a1cb31b310"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// ================= REVIEW SYSTEM =================
const reviewForm = document.getElementById("reviewForm");
const container = document.getElementById("reviewsContainer");
const adminModal = document.getElementById("adminModal");
const secretInput = document.getElementById("adminSecretInput");
const confirmBtn = document.getElementById("confirmAdminBtn");
const SECRET_CODE = "saphal-dev-admin"; // Your secret code

let currentAction = null; // 'delete' or 'edit'
let targetId = null;
let isEditing = false;
let editId = null;

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
            <button onclick="openAdminModal('${id}', 'edit', ${JSON.stringify(data).replace(/"/g, '&quot;')})">
                <i class="fa-solid fa-pen"></i> Edit Review
            </button>
            <button onclick="openAdminModal('${id}', 'delete')" style="color: #ff4d4d;">
                <i class="fa-solid fa-trash"></i> Delete Review
            </button>
        </div>
        <div class="rating-stars">${"★".repeat(data.rating)}</div>
        <p style="margin-bottom: 15px; font-size: 15px; opacity: 0.9;">"${data.message}"</p>
        <div style="font-size: 12px; opacity: 0.5;">
            <strong>${data.name}</strong> • ${data.date}
        </div>
    `;
    container.prepend(card);
}

// 3. Post / Update Review
reviewForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const reviewData = {
        name: document.getElementById("reviewName").value,
        rating: parseInt(document.getElementById("reviewRating").value),
        message: document.getElementById("reviewMessage").value,
        date: isEditing ? "(Edited) " + new Date().toLocaleDateString() : new Date().toLocaleDateString()
    };

    if (isEditing && editId) {
        database.ref("reviews/" + editId).update(reviewData)
            .then(() => resetForm())
            .catch(err => alert(err.message));
    } else {
        database.ref("reviews").push(reviewData)
            .then(() => reviewForm.reset())
            .catch(err => alert(err.message));
    }
});

function resetForm() {
    isEditing = false;
    editId = null;
    reviewForm.reset();
    document.getElementById("submitBtn").innerText = "SUBMIT REVIEW";
    document.getElementById("formTitle").innerText = "Community Reviews";
    document.getElementById("cancelEdit").style.display = "none";
}

document.getElementById("cancelEdit").onclick = resetForm;

// 4. Modal & Admin Logic
window.toggleMenu = function(id, event) {
    event.stopPropagation();
    const menu = document.getElementById(`menu-${id}`);
    document.querySelectorAll('.admin-menu').forEach(m => { if(m !== menu) m.style.display = "none"; });
    menu.style.display = menu.style.display === "block" ? "none" : "block";
};

window.openAdminModal = function(id, action, data = null) {
    targetId = id;
    currentAction = action;
    if (data) window.tempData = data; // Store data for edit mode
    adminModal.style.display = "flex";
    secretInput.value = "";
    secretInput.focus();
};

window.closeModal = function() {
    adminModal.style.display = "none";
};

confirmBtn.onclick = function() {
    if (secretInput.value === SECRET_CODE) {
        if (currentAction === 'delete') {
            database.ref("reviews/" + targetId).remove();
        } else if (currentAction === 'edit') {
            startEdit(targetId, window.tempData);
        }
        closeModal();
    } else {
        showError("Incorrect Admin Code!");
        secretInput.value = "";
    }
};

function startEdit(id, data) {
    isEditing = true;
    editId = id;
    document.getElementById("reviewName").value = data.name;
    document.getElementById("reviewRating").value = data.rating;
    document.getElementById("reviewMessage").value = data.message;
    document.getElementById("submitBtn").innerText = "SAVE CHANGES";
    document.getElementById("formTitle").innerText = "Editing Review...";
    document.getElementById("cancelEdit").style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.onclick = (e) => {
    if (e.target === adminModal) closeModal();
    document.querySelectorAll('.admin-menu').forEach(m => m.style.display = "none");
};

function showError(message) {
    const box = document.getElementById("errorBox");
    const text = document.getElementById("errorText");

    text.innerText = message;
    box.style.display = "block";

    setTimeout(() => {
        box.style.display = "none";
    }, 3000);
}
