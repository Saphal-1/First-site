import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDMIgjDVUOiRvjgplXce15DD27wUe-04LQ",
  authDomain: "firstsitexyz.firebaseapp.com",
  projectId: "firstsitexyz",
  storageBucket: "firstsitexyz.firebasestorage.app",
  messagingSenderId: "104279243313",
  appId: "1:104279243313:web:485df97877f6a1cb31b310",
  measurementId: "G-V9N1F1Q9ZQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const ADMIN_EMAIL = "gamersaphal8@gmail.com"; // Your email from script.js

// Function to post a review
window.postReview = async () => {
    const name = document.getElementById('reviewerName').value;
    const content = document.getElementById('reviewContent').value;
    
    if(name && content) {
        await addDoc(collection(db, "reviews"), {
            name: name,
            content: content,
            timestamp: Date.now(),
            ownerEmail: "user@example.com" // In a real app, this would be the logged-in user
        });
        document.getElementById('reviewerName').value = '';
        document.getElementById('reviewContent').value = '';
    }
};

// Real-time listener for reviews
onSnapshot(query(collection(db, "reviews"), orderBy("timestamp", "desc")), (snapshot) => {
    const list = document.getElementById('reviews-list');
    list.innerHTML = '';
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        
        // Admin/Owner Logic
        const isAdmin = (ADMIN_EMAIL === "gamersaphal8@gmail.com"); 
        const isOwner = true; // For this demo, we assume the current user owns their posts

        const reviewHtml = `
            <div class="card review-card">
                <div class="review-header">
                    <span class="reviewer-name">${data.name}</span>
                    <div class="menu-container">
                        <i class="fa-solid fa-ellipsis-vertical three-dots" onclick="toggleMenu('${id}')"></i>
                        <div id="dropdown-${id}" class="dropdown-menu">
                            ${isOwner ? `<button onclick="editReview('${id}', '${data.content}')">Edit</button>` : ''}
                            ${isAdmin ? `<button onclick="deleteReview('${id}')" style="color:#ff4e4e">Delete</button>` : ''}
                        </div>
                    </div>
                </div>
                <p class="review-text" id="text-${id}">${data.content}</p>
            </div>
        `;
        list.innerHTML += reviewHtml;
    });
});

// Admin Delete Function
window.deleteReview = async (id) => {
    if(confirm("Admin: Are you sure you want to delete this review?")) {
        await deleteDoc(doc(db, "reviews", id));
    }
};

// Owner Edit Function
window.editReview = async (id, oldContent) => {
    const newContent = prompt("Edit your review:", oldContent);
    if(newContent) {
        await updateDoc(doc(db, "reviews", id), { content: newContent });
    }
};
