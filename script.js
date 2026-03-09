/**
 * Kurtis Quant Portfolio Script
 * Features:
 * - Page load animation
 * - Scroll reveal animations
 * - Theme toggle with persistence
 * - Mobile navigation
 * - Copy email interaction
 * - Tab focus title change
 */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setupThemeToggle();
  setupScrollAnimations();
  setupMobileMenu();
  setupCopyEmail();
  setupTabFocusTitle();
  setupPageLoadAnimation();
});

/* =========================
   THEME SYSTEM
========================= */

function initTheme() {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme) {
    root.setAttribute("data-theme", savedTheme);
    updateToggleIcon(savedTheme);
  } else if (systemPrefersDark) {
    root.setAttribute("data-theme", "dark");
    updateToggleIcon("dark");
  }
}

function setupThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  const root = document.documentElement;

  if (!toggle) return;

}

function updateToggleIcon(theme) {
  const toggle = document.getElementById("themeToggle");

  if (!toggle) return;

  toggle.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
}

/* =========================
   PAGE LOAD ANIMATION
========================= */

function setupPageLoadAnimation() {
  document.body.classList.add("page-loaded");
}

/* =========================
   SCROLL REVEAL ANIMATIONS
========================= */

function setupScrollAnimations() {
  const sections = document.querySelectorAll("section");

  if (!sections.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  sections.forEach(section => {
    section.classList.add("reveal");
    observer.observe(section);
  });
}

/* =========================
   MOBILE MENU
========================= */

function setupMobileMenu() {
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.querySelector(".nav-links");

  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });
}

/* =========================
   COPY EMAIL BUTTON
========================= */

function setupCopyEmail() {
  const btn = document.getElementById("copyBtn");
  const emailEl = document.getElementById("emailAddr");

  if (!btn || !emailEl) return;

  btn.addEventListener("click", () => {
    const email = emailEl.innerText;

    navigator.clipboard.writeText(email).then(() => {
      const original = btn.innerText;

      btn.innerText = "Copied!";
      btn.style.background = "var(--primary)";
      btn.style.color = "white";

      setTimeout(() => {
        btn.innerText = original;
        btn.style.background = "";
        btn.style.color = "";
      }, 2000);
    }).catch(err => {
      console.error("Clipboard copy failed:", err);
    });
  });
}

/* =========================
   TAB TITLE CHANGE
========================= */

function setupTabFocusTitle() {
  const originalTitle = document.title;

  window.addEventListener("blur", () => {
    document.title = "Come back! | KQ Portfolio";
  });

  window.addEventListener("focus", () => {
    document.title = originalTitle;
  });
}

const glow = document.querySelector(".cursor-glow");

window.addEventListener("mousemove", (e) => {
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

document.querySelectorAll(".btn, .btn-outline").forEach(button => {

  button.addEventListener("mousemove", e => {
    const rect = button.getBoundingClientRect();

    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translate(0,0)";
  });

});

const toggle = document.getElementById("themeToggle");
const root = document.documentElement;

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  root.setAttribute("data-theme", "dark");
  toggle.checked = true;
}

toggle.addEventListener("change", () => {

  if (toggle.checked) {
    root.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  } else {
    root.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  }

});