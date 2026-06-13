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
const auth = firebase.auth();

// ================= GLOBAL STATE =================
let currentUser = null;
let isAdmin = false;
const ADMIN_EMAIL = "gamersaphal8@gmail.com"; 

let isEditing = false;
let editId = null;
let editTempData = null;

const reviewForm = document.getElementById("reviewForm");
const container = document.getElementById("reviewsContainer");

// ================= AUTHENTICATION FLOW =================

// Check state on load
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        isAdmin = (user.email === ADMIN_EMAIL);
        localStorage.setItem('authChoice', 'logged_in');
        document.getElementById('authModal').style.display = 'none';
        updateUI(user);
    } else {
        currentUser = null;
        isAdmin = false;
        updateUI(null);
        
        // Show modal if new visitor
        if (!localStorage.getItem('authChoice')) {
            document.getElementById('authModal').style.display = 'flex';
        }
    }
});

function updateUI(user) {
    const profileBar = document.getElementById('userProfileBar');
    if (user) {
        profileBar.style.display = 'flex';
        document.getElementById('userName').innerText = user.displayName || "Anonymous";
        document.getElementById('userEmail').innerText = user.email || "No Email";
        document.getElementById('userAvatar').src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}&background=00f2ff&color=fff`;
    } else {
        profileBar.style.display = 'none';
    }
}

window.openAuthModal = () => document.getElementById('authModal').style.display = 'flex';

window.loginWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(err => alert(err.message));
};

window.loginWithDiscord = () => {
    // Note: Discord requires OAuthProvider configured in Firebase Console.
    const provider = new firebase.auth.OAuthProvider('oidc.discord');
    auth.signInWithPopup(provider).catch(err => {
        // Fallback message if user hasn't configured Identity Platform yet
        if(err.code === 'auth/operation-not-supported-in-this-environment' || err.code === 'auth/invalid-credential') {
            alert("Discord Auth is not fully configured in Firebase yet. Please continue with Google or Guest mode for now!");
        } else {
            console.error(err);
        }
    });
};

window.continueAsGuest = () => {
    localStorage.setItem('authChoice', 'guest');
    document.getElementById('authModal').style.display = 'none';
};

window.logout = () => {
    auth.signOut().then(() => {
        localStorage.removeItem('authChoice');
        resetForm();
    });
};

// ================= REVIEW SYSTEM =================

// 1. Listen for data (Sort Newest First)
database.ref("reviews").on("value", (snapshot) => {
    const reviewsArray = [];
    snapshot.forEach((child) => {
        reviewsArray.push({ id: child.key, ...child.val() });
    });
    
    // Sort descending based on timestamp
    reviewsArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    container.innerHTML = ""; 
    reviewsArray.forEach(rev => renderReview(rev.id, rev));
});

// 2. UI Rendering
function renderReview(id, data) {
    const card = document.createElement("div");
    card.className = "card review-card glassmorphism";
    
    // Ownership / Admin Check
    const isOwner = currentUser && currentUser.uid === data.uid;
    const canEdit = isOwner || isAdmin;
    
    let menuHtml = "";
    if (canEdit) {
        menuHtml = `
            <div class="three-dots" onclick="toggleMenu('${id}', event)">
                <i class="fa-solid fa-ellipsis-vertical"></i>
            </div>
            <div id="menu-${id}" class="admin-menu">
                <button onclick="startEdit('${id}', ${JSON.stringify(data).replace(/"/g, '&quot;')})">
                    <i class="fa-solid fa-pen"></i> Edit Review
                </button>
                <button onclick="deleteReview('${id}')" style="color: #ff4d4d;">
                    <i class="fa-solid fa-trash"></i> Delete Review
                </button>
            </div>
        `;
    }

    const avatar = data.photoURL || `https://ui-avatars.com/api/?name=${data.name || 'G'}&background=1e293b&color=00f2ff`;
    const verifiedBadge = (data.provider && data.provider !== 'guest') 
        ? `<i class="fa-solid fa-circle-check" style="color: #00f2ff; margin-left: 5px; font-size: 14px;" title="Verified Profile"></i>` : '';
    
    const dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : (data.date || "Unknown Date");

    card.innerHTML = `
        ${menuHtml}
        <div style="display:flex; align-items:center; margin-bottom: 15px;">
            <img src="${avatar}" style="width: 42px; height: 42px; border-radius: 50%; border: 2px solid rgba(0, 242, 255, 0.4); margin-right: 15px;">
            <div>
                <div style="font-weight: 600; font-size: 15px;">${data.name} ${verifiedBadge}</div>
                <div style="font-size: 11px; opacity: 0.6;">${dateStr}</div>
            </div>
        </div>
        <div class="rating-stars" style="margin-bottom: 12px;">${"★".repeat(data.rating)}</div>
        <p style="font-size: 14px; opacity: 0.9; line-height: 1.6;">"${data.message}"</p>
    `;
    container.appendChild(card);
}

// 3. Post / Update Review
reviewForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Prevent Guest Submission
    if (!currentUser) {
        document.getElementById('guestPopup').style.display = 'flex';
        return;
    }

    const reviewData = {
        uid: currentUser.uid,
        email: currentUser.email || "",
        name: currentUser.displayName || "Anonymous User",
        photoURL: currentUser.photoURL || "",
        provider: currentUser.providerData[0]?.providerId || "custom",
        rating: parseInt(document.getElementById("reviewRating").value),
        message: document.getElementById("reviewMessage").value,
        createdAt: isEditing ? (editTempData.createdAt || Date.now()) : Date.now()
    };

    if (isEditing && editId) {
        database.ref("reviews/" + editId).update(reviewData)
            .then(() => resetForm())
            .catch(err => alert("Error updating review: " + err.message));
    } else {
        database.ref("reviews").push(reviewData)
            .then(() => resetForm())
            .catch(err => alert("Error posting review: " + err.message));
    }
});

// 4. Utility / Control Functions
window.toggleMenu = function(id, event) {
    event.stopPropagation();
    const menu = document.getElementById(`menu-${id}`);
    document.querySelectorAll('.admin-menu').forEach(m => { if(m !== menu) m.style.display = "none"; });
    menu.style.display = menu.style.display === "block" ? "none" : "block";
};

window.startEdit = function(id, data) {
    isEditing = true;
    editId = id;
    editTempData = data;
    document.getElementById("reviewRating").value = data.rating;
    document.getElementById("reviewMessage").value = data.message;
    document.getElementById("submitBtn").innerText = "SAVE CHANGES";
    document.getElementById("formTitle").innerText = "Editing Your Review";
    document.getElementById("cancelEdit").style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteReview = function(id) {
    if (confirm("Are you sure you want to delete this review?")) {
        database.ref("reviews/" + id).remove();
    }
};

function resetForm() {
    isEditing = false;
    editId = null;
    editTempData = null;
    reviewForm.reset();
    document.getElementById("submitBtn").innerText = "SUBMIT REVIEW";
    document.getElementById("formTitle").innerText = "Leave a Review";
    document.getElementById("cancelEdit").style.display = "none";
}

document.getElementById("cancelEdit").onclick = resetForm;

// Close menus when clicking outside
window.onclick = (e) => {
    document.querySelectorAll('.admin-menu').forEach(m => m.style.display = "none");
};
