// CONFIGURATION
const MY_EMAIL = "gamersaphal8@gmail.com";

// 1. PROFESSIONAL LOADER LOGIC
window.addEventListener('DOMContentLoaded', () => {
    let progress = 0;
    const bar = document.getElementById('progress-bar');
    
    const interval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress > 100) progress = 100;
        bar.style.width = progress + "%";

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                const loader = document.getElementById("loader");
                loader.style.opacity = "0";
                loader.style.transition = "0.5s";
                setTimeout(() => {
                    loader.style.display = "none";
                    document.querySelector(".container").style.display = "grid";
                    checkAdmin();
                }, 500);
            }, 400);
        }
    }, 150);
});

// 2. ADMIN IGN EDITING
function checkAdmin() {
    // This simulates being "logged in" as you
    if (MY_EMAIL === "gamersaphal8@gmail.com") {
        document.getElementById("edit-ign-btn").style.display = "inline-block";
    }
}

function editIGN() {
    const newIGN = prompt("Enter new Minecraft IGN:", "Saphal123");
    if (newIGN) {
        document.getElementById("ign-display").innerHTML = `<b>${newIGN}</b>`;
    }
}

// 3. TYPED.JS
new Typed("#typing", {
  strings: [
    "Hi, I'm <span class='gradient-text'>Saphal Thapaliya</span>.",
    "A developer from <span class='gradient-text'>Dhading, Nepal</span>.",
    "Building creative <span class='gradient-text'>digital experiences</span>."
  ],
  typeSpeed: 40,
  backSpeed: 20,
  loop: true,
  contentType: "html" // 🔥 THIS FIXES IT
});

// 4. PARTICLES.JS
particlesJS("particles-js", {
    particles: {
        number: { value: 60 },
        color: { value: "#00f2ff" },
        shape: { type: "circle" },
        opacity: { value: 0.5 },
        size: { value: 2 },
        line_linked: { enable: true, distance: 150, color: "#00f2ff", opacity: 0.2, width: 1 },
        move: { enable: true, speed: 1.5 }
    }
});

// 5. UTILS
function copyText(text) {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard: " + text);
}

// 6. SERVER STATUS
fetch("https://api.mcsrvstat.us/2/play.mcnpnetwork.com")
.then(res => res.json())
.then(data => {
    const statusDiv = document.getElementById("status");
    if(data.online){
        statusDiv.innerHTML = `Server: <span style='color:#00ffb3'>ONLINE</span> | Players: ${data.players.online}/${data.players.max}`;
    } else {
        statusDiv.innerHTML = "Server Status: <span style='color:red'>OFFLINE</span>";
    }
});
