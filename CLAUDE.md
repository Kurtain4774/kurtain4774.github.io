# Portfolio Site - Claude Code Guide

When working on frontend changes, use the --frontend-design skill if it is available in your environment.

## What This Is
A static personal portfolio website for Kurtis Quant. The current site has four visual sections:

1. **Hero** - panorama-pannable ramen shop scene with rain, glow overlays, dismissible hotspots, clickable zones, and mouse-following hints.
2. **About** - centered bio and skills grid over an interactive particle canvas. Mobile shows a scroll-driven card stack.
3. **Projects** - screenshot showcase with a pixel scramble/reform transition, bidirectional project cycling, and a scroll gate until all projects are seen.
4. **Contact** - social links, a bird flock canvas, a terminal-style mailto flow (desktop), and a simplified mobile form.

The site is designed for GitHub Pages and must keep working as plain static files.

## Tech Stack
- Vanilla HTML, CSS, and JavaScript only.
- HTML5 Canvas 2D API for rain, particles, bird flock, and project pixel transitions.
- Pure CSS for layout, glow overlays, scroll snapping, terminal styling, and responsive behavior.
- No frameworks, no build tools, no package manager, and no external runtime libraries.

## File Structure
```text
/
  index.html             # Main document and section markup
  style.css              # All layout, responsive styles, and CSS animations
  hero.js                # Hero rain canvas (HeroAnimator)
  aboutParticles.js      # Shared particle field used across all sections (AboutParticleSystem)
  projects.js            # Project data array
  pixelGrid.js           # Project screenshot sampling and pixel transition logic (PixelGrid)
  birdFlock.js           # Contact section bird flock canvas (BirdFlock)
  cloudMist.js           # Present in the repo but NOT loaded by index.html
  main.js                # App wiring, shared animation loop, navigation, contact flow, settings popup
  AGENTS.md              # Codex-facing project guide
  CLAUDE.md              # Claude-facing project guide
/assets/
  hero.png               # Ramen shop hero image
  Resume.pdf             # Resume (linked as ./assets/Resume.pdf, downloaded as Kurtis_Quant_Resume.pdf)
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
5. `birdFlock.js`
6. `main.js`

Keep this order unless you convert the site to modules. `main.js` depends on globals created by the previous files: `projects`, `PixelGrid`, `AboutParticleSystem`, `HeroAnimator`, and `BirdFlock`.

## Page Behavior

### Global Layout
- Desktop uses full-page vertical scroll snapping on `body`.
- `html` is fixed to viewport height on desktop; mobile switches back to natural page flow.
- `.top-nav` is fixed at the top and links to About, Projects, Contact, GitHub, and a Settings button.
- Respect `prefers-reduced-motion` for scroll behavior and terminal cursor/boot animation.
- `main.js` pauses the shared animation loop and timer-driven effects on `visibilitychange`.
- Each section element gets an `is-visible` class from an IntersectionObserver; animations only run while their section is visible. The hero starts visible to avoid lag on first paint.

### Settings Popup
- `#settings-btn` in `.top-nav` opens `#settings-popup` (role="dialog").
- Controls: Enable Particles toggle, Count slider (20–500, default 150), and per-section color pickers (About, Projects, Contact).
- Enabling/disabling affects all `AboutParticleSystem` instances and the `BirdFlock` canvas.
- The color pickers drive `setColor()` on the relevant particle system(s) and bird flock.
- Popup closes on outside click, Escape key, or the close button.

### Hero Section
- `#hero` contains `.hero-panorama` (a horizontally overflowing, mouse-draggable panorama) wrapping `.hero-scene`.
- `.hero-scene` holds the hero image, rain canvas, glow overlays, clickable zones, and hotspot overlay.
- `assets/hero.png` fills the scene via CSS; `#rain-canvas` overlays it with `pointer-events: none`.
- Rain starts after a 1000ms delay in `HeroAnimator`; current counts are **200 drops on desktop and 50 on mobile**.
- Rain uses solid strokes (`rgb(215, 230, 255)`) with per-drop `globalAlpha`, not per-drop gradients.
- Glow overlays inside `.hero-scene`:
  - `.overlay-neon`
  - `.overlay-neon-awning`
  - `.overlay-neon-roof`
  - `.overlay-interior`
- `main.js` adds periodic neon flicker (Web Animations API, ~30s interval) and delayed interior light flicker (4–8s random interval after 1800ms initial delay).
- Desktop transparent zones inside `.hero-scene`:
  - `.zone-projects` scrolls to `#projects`.
  - `.zone-shop` scrolls to `#about`.
  - `.zone-github` opens `https://github.com/Kurtain4774`.
- Hovering a zone shows a mouse-following `.zone-hint`. Pressing `E` while hovering triggers that zone's action.
- `.hotspot-overlay` shows pulsing dot indicators for zones on first visit. It is dismissed on the first zone interaction and the dismissal is persisted in `sessionStorage` (`kurtisHeroHotspotsDismissed`). Dismissed hotspots are removed from the DOM after a 380ms fade.
- `#hero-mobile-particles` canvas sits below the panorama on mobile and runs an `AboutParticleSystem`.
- `.mobile-hero-panel` shows a name/title card on mobile below the panorama.
- `.mobile-nav` shows About, Projects, and GitHub buttons on mobile.

### About Section
- `#about` contains `#about-particles`, copy, and a **10-card** skills grid.
- `AboutParticleSystem` sizes its particle count by canvas area, from 100 to 250 particles (constants: `minParticleCount`, `maxParticleCount`).
- Particles drift, wrap at section edges, draw proximity lines (within `lineRadius = 150px`), and respond to pointer movement (within `mouseRadius = 500px`).
- Skill cards are buttons with inline SVG icons and `data-particle-color` values.
- Clicking a skill card marks it active and calls `setColor()` on all particle systems and the bird flock simultaneously.
- On mobile, the skills grid animates as a **scroll-driven card stack**: CSS custom properties (`--stack-angle`, `--stack-entry`, `--stack-z`, etc.) are updated on scroll via `requestAnimationFrame`. The top card at each scroll position is auto-activated, driving particle color changes without a click.

### Projects Section
- Project data lives in `projects.js`.
- `#projects-particles` canvas runs a second `AboutParticleSystem` behind the project card.
- Current order:
  1. TFT Dualytics
  2. Quoted
  3. Habit Tracker
- Layout: left arrow button (`#arrow-trigger-left`) | `.project-card` | right arrow button (`#arrow-trigger`).
- `.project-card` contains a "Projects" heading, `.pixel-wrap > #pixel-canvas`, and `.project-meta` (title, description, GitHub/Live links, `#project-counter` showing "N / 3").
- `PixelGrid` preloads all screenshots, samples colors once per transition, and renders the full screenshot while idle. Constants: `TILE = 10`, `GAP = 0`, `FULL_TRANSITION_FRAMES = 120`.
- Transition states: `IDLE (0)`, `SCRAMBLING (1)`, `REFORMING (2)`.
- Arrow buttons trigger `grid.explode(1)` / `grid.explode(-1)`.
- Clicking the canvas while idle opens the active project's `liveUrl` in a new tab. Clicking during a transition sets `grid.speed = 4`.
- **Scroll gate**: downward scroll (wheel or touch swipe) on the projects section is intercepted until all 3 projects have been viewed. After seeing all projects there is a 500ms dwell before scrolling is unlocked. `#scroll-unlock-hint` shows viewing progress ("N / 3 seen") and changes to "Scroll down to continue" when unlocked.
- On mobile, `#mobile-projects-showcase` renders all projects as `<article class="mobile-project-card">` elements with a screenshot link, title, description, and Live App / Learn More links. Arrow buttons and pixel canvas are hidden on mobile.

### Contact Section
- `.sky-decor` wraps `#contact-mobile-particles` and `#bird-canvas`.
- On desktop, `BirdFlock` renders animated boids in `#bird-canvas`. On mobile, `#contact-mobile-particles` shows an `AboutParticleSystem` instead.
- Clicking any `.social-link` adds 15 boids to the flock and hides the `#social-hint` ("Click a link to attract more birds") permanently for the session.
- Social links: Resume (download), Email, GitHub, LinkedIn.
- The resume link is `./assets/Resume.pdf` with `download="Kurtis_Quant_Resume.pdf"`.
- **Desktop terminal form** (`#contact-form`): progressive flow — Name, Email, Subject, Message, then `[Y/N]` confirmation. `Y` triggers submit; `N` returns to the message step. Builds a `mailto:` URL for `kurtismquant@gmail.com`.
- **Mobile form** (`#mobile-contact-form`): simplified Name, Email, Message fields with inline validation and a Send button that also builds a `mailto:` URL.
- `#back-to-top` button appears (`.visible`) when the contact section is intersecting and scrolls back to `#hero` on click.

## Project Data
```js
const projects = [
  {
    title: "TFT Dualytics",
    description: "TFT Statistic Website -- React, Node.js, Riot Games API, MongoDB",
    image: "./assets/screenshots/tftdualytics.png",
    link: "https://github.com/Kurtain4774/TFT-Dualytics",
    liveUrl: "https://tft-dualytics.vercel.app/"
  },
  {
    title: "Quoted",
    description: "Pinterest-style quote board -- React, Express, MongoDB, JWT auth",
    image: "./assets/screenshots/quoted.png",
    link: "https://github.com/Kurtain4774/QuoteWebApplication",
    liveUrl: "https://quotedwords.vercel.app/"
  },
  {
    title: "Habit Tracker",
    description: "Daily habit tracker -- Next.js, Express, Prisma, Tailwind CSS",
    image: "./assets/screenshots/habitflow.png",
    link: "https://github.com/Kurtain4774/habit-tracker",
    liveUrl: "https://habit-tracker-nu-flame.vercel.app/"
  }
];
```

## Development Rules
- Keep the site framework-free and build-free.
- Preserve the global-script loading model unless there is a clear reason to migrate everything together.
- Do not add external libraries, CDNs, analytics scripts, or generated build artifacts.
- Use Canvas 2D for rain, particles, bird flock, and pixel project animation.
- Do not sample project pixels every frame; sample only when loading or transitioning images.
- Avoid expensive work inside animation loops. The shared loop in `main.js` should remain the central animation driver.
- Do not use `ctx.save()` or `ctx.restore()` inside large tile or particle render loops unless there is a measured reason.
- Keep desktop scroll snapping and mobile natural scrolling behavior intact.
- Keep mobile under 768px usable without overlaid hero zones.
- Avoid adding nav bars, footers, or extra sections unless the user explicitly asks. The current four sections are the intended surface area.
- Use ASCII in source and docs unless a file already requires a specific non-ASCII character.
- Do not load `cloudMist.js` unless the user explicitly asks to activate it; it is currently unused.

## Testing Checklist
- Open `index.html` directly or serve the folder with a simple static server.
- Desktop checks:
  - Page starts at the hero on reload.
  - Top nav scrolls to About, Projects, and Contact.
  - Hero panorama pans left/right on mouse drag without triggering zone clicks.
  - Hotspot indicators show on first visit and dismiss on zone interaction.
  - Hero zones show mouse-following hints; click and `E` key work while hovering.
  - Rain starts after ~1s and pauses/resumes on tab visibility changes.
  - About particles respond to mouse movement and skill card clicks; color spreads to all sections.
  - Settings popup opens, particle toggle and sliders apply immediately.
  - Project arrows and canvas click cycle through all three projects.
  - Scroll gate holds on projects until all 3 are seen; hint updates correctly.
  - Clicking an idle project canvas opens its live URL.
  - Bird flock appears in contact section and grows when social links are clicked.
  - Back-to-top button appears in contact and returns to hero.
  - Contact terminal validates each step and opens a mail client on submit.
- Mobile checks around 390px width:
  - No horizontal scroll.
  - Hero panorama is pannable; mobile hero card and nav buttons are visible.
  - About skill cards animate as a scroll-driven stack.
  - Mobile project showcase shows all three projects with images and links (no pixel canvas).
  - Mobile contact form (not terminal) is visible and submits via mailto.
  - Contact particles canvas is visible (no bird canvas).

## Current Git Context Notes
- This repository may have deleted legacy files such as `script.js`, `styles.css`, `favicon.svg`, `.gitattributes`, and `.DS_Store`.
- Do not restore or remove those changes unless the user explicitly asks.
