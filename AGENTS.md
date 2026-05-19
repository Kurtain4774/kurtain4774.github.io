# Portfolio Site - Codex Guide

## What This Is
A static personal portfolio website for Kurtis Quant. The current site has four visual sections:

1. **Hero** - full-viewport ramen shop scene with rain, glow overlays, clickable zones, and mouse-following hints.
2. **About** - centered bio and skills grid over an interactive particle canvas.
3. **Projects** - screenshot showcase with a pixel scramble/reform transition and bidirectional project cycling.
4. **Contact** - social links plus a terminal-style mailto contact flow.

The site is designed for GitHub Pages and must keep working as plain static files.

## Tech Stack
- Vanilla HTML, CSS, and JavaScript only.
- HTML5 Canvas 2D API for rain, about particles, and project pixel transitions.
- Pure CSS for layout, glow overlays, scroll snapping, terminal styling, and responsive behavior.
- No frameworks, no build tools, no package manager, and no external runtime libraries.

## File Structure
```text
/
  index.html             # Main document and section markup
  style.css              # All layout, responsive styles, and CSS animations
  hero.js                # Hero rain canvas
  aboutParticles.js      # About section particle field and skill color reactions
  projects.js            # Project data array
  pixelGrid.js           # Project screenshot sampling and pixel transition logic
  main.js                # App wiring, shared animation loop, navigation, contact flow
  AGENTS.md              # Codex-facing project guide
  CLAUDE.md              # Claude-facing project guide
/assets/
  hero.png               # Ramen shop hero image
  Resume.pdf             # Resume asset currently present in the repo
  screenshots/
    tftdualytics.png
    quoted.png
    habitflow.png
```

## Runtime Loading
`index.html` loads scripts in this order:

1. `projects.js`
2. `pixelGrid.js`
3. `aboutParticles.js`
4. `hero.js`
5. `main.js`

Keep this order unless you convert the site to modules. `main.js` depends on globals created by the previous files: `projects`, `PixelGrid`, `AboutParticleSystem`, and `HeroAnimator`.

## Page Behavior

### Global Layout
- Desktop uses full-page vertical scroll snapping on `body`.
- `html` is fixed to viewport height on desktop; mobile switches back to natural page flow.
- `.top-nav` is fixed at the top and links to About, Projects, Contact, and GitHub.
- Respect `prefers-reduced-motion` for scroll behavior and terminal cursor/boot animation.
- `main.js` pauses the shared animation loop and timer-driven effects on `visibilitychange`.

### Hero Section
- `#hero` is full viewport on desktop with a minimum width of `1100px`.
- `assets/hero.png` fills the scene with `object-fit: cover`.
- `#rain-canvas` overlays the image and uses `pointer-events: none`.
- Rain starts after a short delay in `HeroAnimator`; current counts are 250 drops on desktop and 60 on mobile.
- Current rain is vertical with gradient strokes. There is no steam effect in the present implementation.
- Glow overlays include:
  - `.overlay-neon`
  - `.overlay-neon-roof`
  - `.overlay-interior`
- `main.js` adds periodic extra neon flicker and delayed interior light flicker.
- Desktop transparent zones:
  - `.zone-projects` scrolls to `#projects`.
  - `.zone-shop` scrolls to `#about`.
  - `.zone-github` opens `https://github.com/Kurtain4774`.
- Hovering a zone shows a fixed mouse-following hint. Pressing `E` while hovering a zone triggers that zone's action.
- Mobile hides zones and shows buttons for About, Projects, and GitHub below the image.

### About Section
- `#about` contains `#about-particles`, copy, and a 12-card skills grid.
- `AboutParticleSystem` sizes its particle count by canvas area, currently from 100 to 250 particles.
- Particles drift, wrap at section edges, draw proximity lines, and respond to pointer movement.
- Skill cards are buttons with inline SVG icons and `data-particle-color` values.
- Clicking a skill card marks it active and eases the particle color toward that card's accent color.

### Projects Section
- Project data lives in `projects.js`.
- Current order:
  1. TFT Dualytics
  2. Quoted
  3. Habit Tracker
- `PixelGrid` preloads all screenshots, samples colors once per transition, and renders the full screenshot while idle.
- Current tile constants are `TILE = 10` and `GAP = 0`.
- Transition states are `IDLE`, `SCRAMBLING`, and `REFORMING`.
- The current transition gathers tiles toward random interior scatter targets, eases colors toward the next screenshot, then reforms to the next screenshot's home grid.
- Right and left edge overlays trigger next/previous project on desktop.
- Mobile hides edge overlays and shows `Prev` and `Next` buttons below the canvas.
- Clicking the screenshot while idle opens the active project's live URL.
- Clicking while a transition is active speeds it up by setting `grid.speed = 4`, though current easing code does not otherwise use `speed`.

### Contact Section
- Includes resume, email, GitHub, and LinkedIn social links.
- The form is a terminal-style progressive flow:
  1. Name
  2. Email
  3. Subject
  4. Message
  5. Send confirmation
- The form does not send to a backend. It builds a `mailto:` URL for `kurtismquant@gmail.com`.
- `Y` submits at the confirmation step. `N` returns to the message step.
- The current HTML references `./assets/Kurtis_Quant_Resume.pdf`; the repo currently contains `assets/Resume.pdf`. Keep the asset and link names in sync when touching contact assets.

## Project Data
```js
const projects = [
  {
    title: "TFT Dualytics",
    description: "TFT Statistic Website - React, Node.js, Riot Games API, MongoDB",
    image: "./assets/screenshots/tftdualytics.png",
    link: "https://github.com/kurtain4774/tftdualytics",
    liveUrl: "https://tftdualytics.com/"
  },
  {
    title: "Quoted",
    description: "Pinterest-style quote board - React, Express, MongoDB, JWT auth",
    image: "./assets/screenshots/quoted.png",
    link: "https://github.com/kurtain4774/quoted",
    liveUrl: "https://quotedwords.vercel.app/"
  },
  {
    title: "Habit Tracker",
    description: "Daily habit tracker - Next.js, Express, Prisma, Tailwind CSS",
    image: "./assets/screenshots/habitflow.png",
    link: "https://github.com/kurtain4774/habitflow",
    liveUrl: "https://habit-tracker-nu-flame.vercel.app/"
  }
];
```

## Development Rules
- Keep the site framework-free and build-free.
- Preserve the global-script loading model unless there is a clear reason to migrate everything together.
- Do not add external libraries, CDNs, analytics scripts, or generated build artifacts.
- Use Canvas 2D for rain, particles, and pixel project animation.
- Do not sample project pixels every frame; sample only when loading or transitioning images.
- Avoid expensive work inside animation loops. The shared loop in `main.js` should remain the central animation driver.
- Do not use `ctx.save()` or `ctx.restore()` inside large tile or particle render loops unless there is a measured reason.
- Keep desktop scroll snapping and mobile natural scrolling behavior intact.
- Keep mobile under 768px usable without overlaid hero zones.
- Avoid adding nav bars, footers, or extra sections unless the user explicitly asks. The current four sections are the intended surface area.
- Use ASCII in source and docs unless a file already requires a specific non-ASCII character.

## Testing Checklist
- Open `index.html` directly or serve the folder with a simple static server.
- Desktop checks:
  - Page starts at the hero on reload.
  - Top nav scrolls to About, Projects, and Contact.
  - Hero zones show hints, click correctly, and `E` works while hovering.
  - Rain starts and pauses/resumes after tab visibility changes.
  - About particles respond to mouse movement and skill card clicks.
  - Project next/previous controls cycle through all three projects.
  - Clicking an idle project opens its live URL.
  - Contact terminal validates each step and opens a mail client on submit.
- Mobile checks around 390px width:
  - No horizontal scroll.
  - Hero image uses natural height.
  - Mobile hero buttons are visible.
  - Project Prev/Next buttons are visible.
  - About skill grid is two columns.
  - Contact form fields fit without overlap.

## Current Git Context Notes
- This repository may have deleted legacy files such as `script.js`, `styles.css`, `favicon.svg`, `.gitattributes`, and `.DS_Store`.
- Do not restore or remove those changes unless the user explicitly asks.
