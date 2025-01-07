let theme = localStorage.getItem('theme');

if (!theme) {
  theme = 'light'; // Default to 'light' if no theme is stored
  localStorage.setItem('theme', theme); // Store the 'light' theme in localStorage
}

// Apply the theme (e.g., to the body element or a specific class)
document.body.classList.add(theme);

