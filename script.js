// Loading Screen Handler
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  // Keep loader visible for 1.8 seconds for professional feel
  setTimeout(() => {
    loader.style.transition = "opacity 0.8s ease, visibility 0.8s";
    loader.style.opacity = "0";
    loader.style.visibility = "hidden";
  }, 1800);
});

// Privacy Policy Handler
document.getElementById("privacyBtn").addEventListener("click", () => {
  alert("Privacy Policy\n\nThis is a professional portfolio for Saphal. No personal data is collected or tracked. Your privacy is 100% respected.");
});
