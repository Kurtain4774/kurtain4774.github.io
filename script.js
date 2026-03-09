/**
 * Kurtis Quant Portfolio Logic
 * Handles: Theme Toggling, LocalStorage Persistence, and Smooth Scroll observers
 */

const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// 1. Initialize Theme from LocalStorage or System Preference
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Set initial theme
if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
    updateToggleIcon(savedTheme);
} else if (systemPrefersDark) {
    htmlElement.setAttribute('data-theme', 'dark');
    updateToggleIcon('dark');
}

// 2. Theme Toggle Event Listener
themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Apply theme
    htmlElement.setAttribute('data-theme', newTheme);
    
    // Save preference
    localStorage.setItem('theme', newTheme);
    
    // Update UI
    updateToggleIcon(newTheme);
});

// Helper function for icon swap
function updateToggleIcon(theme) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// 3. Scroll Reveal Animation (Optional but Professional)
// This makes sections fade in as you scroll down
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply initial hidden state and observe sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.6s ease-out';
    observer.observe(section);
});

function copyEmail() {
    const email = document.getElementById('emailAddr').innerText;
    navigator.clipboard.writeText(email);
    const btn = document.getElementById('copyBtn');
    btn.innerText = "Copied!";
    setTimeout(() => { btn.innerText = "Copy"; }, 2000);
}
function copyEmail() {
    const email = document.getElementById('emailAddr').innerText;
    const btn = document.getElementById('copyBtn');
    
    navigator.clipboard.writeText(email).then(() => {
        // Visual Feedback
        const originalText = btn.innerText;
        btn.innerText = "Copied!";
        btn.style.background = "var(--primary)";
        btn.style.color = "white";

        // Reset after 2 seconds
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = "";
            btn.style.color = "";
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Add this to your script.js
window.onblur = () => { document.title = "Come back! | KQ Portfolio"; }
window.onfocus = () => { document.title = "Kurtis Quant | Portfolio"; }

// 4. Close Mobile Nav on link click (If you add a mobile menu later)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        // Logic to close mobile menu would go here
        console.log(`Navigating to ${link.getAttribute('href')}`);
    });
});