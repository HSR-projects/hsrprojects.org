/*
    hsr-projects.github.io/hsrprojects.org
    Copyright (C) 2025 Hsr-projects

    Licensed under GNU GPL v3.
*/

// Small animation for smooth fade-in
document.addEventListener("DOMContentLoaded", () => {
  const heroContent = document.querySelector(".hero-content");
  heroContent.style.opacity = 0;
  setTimeout(() => {
    heroContent.style.transition = "opacity 2s";
    heroContent.style.opacity = 1;
  }, 200);
});
