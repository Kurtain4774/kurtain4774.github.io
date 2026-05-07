const GITHUB_URL = "https://github.com/Kurtain4774";
const CONTACT_EMAIL = "kurtismquant@gmail.com";

document.addEventListener("DOMContentLoaded", () => {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  const rainCanvas = document.getElementById("rain-canvas");
  const aboutCanvas = document.getElementById("about-particles");
  const aboutSection = document.getElementById("about");
  const pixelCanvas = document.getElementById("pixel-canvas");

  const titleEl = document.getElementById("project-title");
  const descEl  = document.getElementById("project-desc");
  const linkEl  = document.getElementById("project-link");
  const liveEl  = document.getElementById("project-live");
  const interiorEl = document.querySelector(".overlay-interior");
  const neonEl = document.querySelector(".overlay-neon");
  const contactForm = document.getElementById("contact-form");
  const contactStatus = document.getElementById("contact-status");

  const updateProjectMeta = (p) => {
    titleEl.textContent = p.title;
    descEl.textContent = p.description;
    linkEl.href = p.link;
    liveEl.href = p.liveUrl;
  };

  const hero = new HeroAnimator(rainCanvas);
  const aboutParticles = aboutCanvas && aboutSection
    ? new AboutParticleSystem(aboutCanvas, aboutSection)
    : null;
  const grid = new PixelGrid(pixelCanvas, projects, updateProjectMeta);
  let interiorCueTimer = null;
  let interiorFlickerTimer = null;
  let neonFlickerTimer = null;
  let activeNeonFlicker = null;
  let interiorReady = false;
  const interiorCueAt = performance.now() + 1800;
  const neonReflickerDelay = 31350;
  const neonReflickerInterval = 30000;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const navEntry = performance.getEntriesByType("navigation")[0];
  const isReload = navEntry
    ? navEntry.type === "reload"
    : performance.navigation?.type === performance.navigation?.TYPE_RELOAD;
  const resetToHome = window.location.hash && isReload;

  if (resetToHome) {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }

  if (!window.location.hash) {
    window.scrollTo({ top: 0, behavior: "auto" });
    document.body.scrollTo({ top: 0, behavior: "auto" });
    document.documentElement.scrollTo({ top: 0, behavior: "auto" });
  }

  const scrollSectionIntoView = (section, behavior) => {
    const currentTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const top = section.getBoundingClientRect().top + currentTop;

    window.scrollTo({ top, behavior });
    document.body.scrollTo({ top, behavior });
    document.documentElement.scrollTo({ top, behavior });
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (!section) return;

    const behavior = prefersReducedMotion.matches ? "auto" : "smooth";
    scrollSectionIntoView(section, behavior);
  };

  const scheduleInteriorFlicker = () => {
    window.clearTimeout(interiorFlickerTimer);
    if (!interiorReady || document.hidden || !interiorEl) return;

    interiorFlickerTimer = window.setTimeout(() => {
      if (document.hidden || !interiorEl) return;
      interiorEl.classList.add("is-flickering");
      window.setTimeout(() => interiorEl.classList.remove("is-flickering"), 170);
      scheduleInteriorFlicker();
    }, 4000 + Math.random() * 4000);
  };

  const scheduleInteriorCue = () => {
    window.clearTimeout(interiorCueTimer);
    if (document.hidden || !interiorEl || interiorReady) return;

    interiorCueTimer = window.setTimeout(() => {
      interiorReady = true;
      interiorEl.classList.add("is-ready");
      scheduleInteriorFlicker();
    }, Math.max(0, interiorCueAt - performance.now()));
  };

  scheduleInteriorCue();

  const triggerNameNeonFlicker = () => {
    if (!neonEl || document.hidden) return;

    if (activeNeonFlicker) activeNeonFlicker.cancel();
    activeNeonFlicker = neonEl.animate([
      { opacity: 1 },
      { opacity: 0.25 },
      { opacity: 1 },
      { opacity: 0 },
      { opacity: 0.9 },
      { opacity: 0.15 },
      { opacity: 1 },
      { opacity: 0.65 },
      { opacity: 1 }
    ], {
      duration: 750,
      easing: "steps(1, end)",
      fill: "none"
    });
    activeNeonFlicker.addEventListener("finish", () => {
      activeNeonFlicker = null;
    }, { once: true });
  };

  const scheduleNameNeonFlicker = (delay = neonReflickerInterval) => {
    window.clearTimeout(neonFlickerTimer);
    if (!neonEl || document.hidden) return;

    neonFlickerTimer = window.setTimeout(() => {
      triggerNameNeonFlicker();
      scheduleNameNeonFlicker();
    }, delay);
  };

  scheduleNameNeonFlicker(neonReflickerDelay);

  // shared rAF
  let running = false;
  let animationFrameId = null;
  let lastFrameTime = null;
  const targetFrameMs = 1000 / 60;
  const loop = (now) => {
    animationFrameId = null;
    if (!running) return;
    const elapsed = lastFrameTime === null ? targetFrameMs : now - lastFrameTime;
    const delta = Math.min(Math.max(elapsed / targetFrameMs, 0.25), 2.5);
    lastFrameTime = now;

    hero.step(delta);
    if (aboutParticles) aboutParticles.step(delta);
    grid.step(delta);
    animationFrameId = requestAnimationFrame(loop);
  };
  const startAnimationLoop = () => {
    if (running) return;
    running = true;
    lastFrameTime = null;
    if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(loop);
  };
  const stopAnimationLoop = () => {
    running = false;
    lastFrameTime = null;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };
  startAnimationLoop();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimationLoop();
      document.body.classList.add("animations-paused");
      window.clearTimeout(interiorCueTimer);
      window.clearTimeout(interiorFlickerTimer);
      window.clearTimeout(neonFlickerTimer);
      if (activeNeonFlicker) activeNeonFlicker.pause();
    } else {
      startAnimationLoop();
      document.body.classList.remove("animations-paused");
      scheduleInteriorCue();
      scheduleInteriorFlicker();
      if (activeNeonFlicker) activeNeonFlicker.play();
      scheduleNameNeonFlicker();
    }
  });

  // Mouse-following hint cards
  let activeZone = null;

  document.querySelectorAll(".zone").forEach(zone => {
    const hint = zone.querySelector(".zone-hint");
    if (!hint) return;

    zone.addEventListener("mouseenter", () => {
      activeZone = zone;
      hint.classList.add("visible");
    });
    zone.addEventListener("mouseleave", () => {
      activeZone = null;
      hint.classList.remove("visible");
    });
    zone.addEventListener("mousemove", (e) => {
      hint.style.left = (e.clientX + 18) + "px";
      hint.style.top  = (e.clientY - 14) + "px";
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "e" || e.key === "E") {
      if (activeZone) handleAction(activeZone.dataset.action);
    }
  });

  // Zone + button click wiring
  const handleAction = (action) => {
    if (action === "about") {
      scrollToSection("about");
    } else if (action === "projects") {
      scrollToSection("projects");
    } else if (action === "github") {
      window.open(GITHUB_URL, "_blank", "noopener");
    }
  };

  if (window.location.hash) {
    const hashTarget = window.location.hash.slice(1);
    const scrollToHashTarget = () => {
      const section = document.getElementById(hashTarget);
      if (!section) return;
      scrollSectionIntoView(section, "auto");
    };

    requestAnimationFrame(scrollToHashTarget);
    window.setTimeout(scrollToHashTarget, 80);
  }

  document.querySelectorAll("[data-action]").forEach(el => {
    el.addEventListener("click", () => handleAction(el.dataset.action));
  });

  document.querySelectorAll(".skill-card[data-particle-color]").forEach(card => {
    card.addEventListener("click", () => {
      if (!aboutParticles) return;

      document.querySelectorAll(".skill-card.is-active").forEach(activeCard => {
        activeCard.classList.remove("is-active");
      });
      card.classList.add("is-active");
      aboutParticles.setColor(card.dataset.particleColor);
    });
  });

  if (contactForm) {
    const terminalHistory = document.getElementById("terminal-history");
    const terminalConfirm = document.getElementById("terminal-confirm");
    const submitButton = document.getElementById("terminal-submit");
    const terminalSteps = [
      {
        key: "name",
        prompt: "ENTER YOUR NAME:",
        input: document.getElementById("contact-name"),
        invalid: "ERROR: NAME REQUIRED"
      },
      {
        key: "email",
        prompt: "ENTER YOUR EMAIL:",
        input: document.getElementById("contact-email"),
        invalid: "ERROR: VALID EMAIL REQUIRED"
      },
      {
        key: "subject",
        prompt: "ENTER SUBJECT:",
        input: document.getElementById("contact-subject"),
        invalid: "ERROR: SUBJECT REQUIRED"
      },
      {
        key: "message",
        prompt: "ENTER MESSAGE:",
        input: document.getElementById("contact-message"),
        invalid: "ERROR: MESSAGE REQUIRED"
      }
    ];
    const terminalFields = terminalSteps.map(step => document.querySelector(`[data-terminal-step="${step.key}"]`));
    let currentContactStep = 0;
    let contactReadyToSend = false;
    let sendingContact = false;

    const appendTerminalLine = (text, type = "system") => {
      if (!terminalHistory) return null;

      const line = document.createElement("p");
      line.className = `terminal-line terminal-line-${type}`;
      line.textContent = `> ${text}`;
      terminalHistory.appendChild(line);
      line.scrollIntoView({ block: "nearest" });
      return line;
    };

    const setContactStatus = (message, isError = false) => {
      if (!contactStatus) return;

      contactStatus.textContent = message;
      contactStatus.classList.toggle("is-error", isError);
    };

    const setActiveContactStep = (stepIndex) => {
      terminalFields.forEach((field, index) => {
        if (!field) return;

        const isActive = index === stepIndex;
        field.hidden = !isActive;
        field.classList.toggle("is-active", isActive);
      });

      const activeInput = terminalSteps[stepIndex]?.input;
      if (activeInput) {
        window.setTimeout(() => activeInput.focus(), prefersReducedMotion.matches ? 0 : 80);
      }
    };

    const maskTerminalValue = (step, value) => {
      if (step.key === "message") {
        return value
          .split(/\r?\n/)
          .map((line, index) => `${index === 0 ? "MESSAGE" : "       "}: ${line}`)
          .join("\n> ");
      }

      return `${step.key.toUpperCase()}: ${value}`;
    };

    const validateTerminalStep = (step) => {
      const value = String(step.input?.value || "").trim();
      if (step.input) step.input.value = value;
      if (!value) return false;
      if (step.key === "email" && !step.input.validity.valid) return false;

      return true;
    };

    const showTerminalError = (message) => {
      appendTerminalLine(message, "error");
      setContactStatus(message, true);
    };

    const advanceTerminalStep = () => {
      const step = terminalSteps[currentContactStep];
      if (!step || !step.input || sendingContact) return;

      if (!validateTerminalStep(step)) {
        showTerminalError(step.invalid);
        step.input.focus();
        return;
      }

      const value = String(step.input.value || "").trim();
      step.input.value = value;
      appendTerminalLine(maskTerminalValue(step, value), "answer");
      setContactStatus("");

      currentContactStep += 1;
      if (currentContactStep < terminalSteps.length) {
        appendTerminalLine(terminalSteps[currentContactStep].prompt, "system");
        setActiveContactStep(currentContactStep);
        return;
      }

      terminalFields.forEach(field => {
        if (!field) return;
        field.hidden = true;
        field.classList.remove("is-active");
      });
      contactReadyToSend = true;
      if (terminalConfirm) terminalConfirm.hidden = false;
      if (submitButton) submitButton.focus();
    };

    const validateFullContactForm = () => {
      const invalidStep = terminalSteps.find(step => !validateTerminalStep(step));
      if (!invalidStep) return true;

      currentContactStep = terminalSteps.indexOf(invalidStep);
      contactReadyToSend = false;
      if (terminalConfirm) terminalConfirm.hidden = true;
      setActiveContactStep(currentContactStep);
      showTerminalError(invalidStep.invalid);
      return false;
    };

    const resetContactSubmission = () => {
      sendingContact = false;
      if (submitButton) submitButton.disabled = false;
    };

    terminalSteps.forEach((step) => {
      if (!step.input) return;

      step.input.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        if (step.key === "message" && e.shiftKey) return;

        e.preventDefault();
        advanceTerminalStep();
      });
    });

    contactForm.addEventListener("keydown", (e) => {
      if (!contactReadyToSend || sendingContact) return;

      if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        contactForm.requestSubmit();
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        appendTerminalLine("SEND ABORTED. EDIT MESSAGE COMMAND AVAILABLE", "system");
        currentContactStep = terminalSteps.length - 1;
        contactReadyToSend = false;
        if (terminalConfirm) terminalConfirm.hidden = true;
        setActiveContactStep(currentContactStep);
        setContactStatus("Send aborted. Edit the message, then press Enter to continue.", false);
      }
    });

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (sendingContact) return;
      if (!validateFullContactForm()) return;

      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const subjectValue = String(formData.get("subject") || "").trim();
      const message = String(formData.get("message") || "").trim();

      const subject = subjectValue || `Portfolio contact from ${name}`;
      const body = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        "",
        message
      ].join("\n");

      try {
        sendingContact = true;
        if (submitButton) submitButton.disabled = true;
        appendTerminalLine("TRANSMITTING MESSAGE...", "system");
        appendTerminalLine("MESSAGE SENT SUCCESSFULLY", "success");
        appendTerminalLine("CONNECTION CLOSED", "system");
        setContactStatus("Opening your email app with the message ready to send.", false);

        const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.setTimeout(() => {
          window.location.href = mailtoUrl;
          resetContactSubmission();
        }, prefersReducedMotion.matches ? 0 : 650);
      } catch (error) {
        showTerminalError("ERROR: MESSAGE FAILED TO SEND");
        appendTerminalLine("RETRY COMMAND AVAILABLE", "system");
        resetContactSubmission();
      }
    });
  }

  // Trigger explosion / speed up if animating
  document.getElementById("arrow-trigger").addEventListener("click", () => grid.explode(1));
  document.getElementById("arrow-trigger-left").addEventListener("click", () => grid.explode(-1));
  document.getElementById("next-btn").addEventListener("click", () => grid.explode(1));
  document.getElementById("prev-btn").addEventListener("click", () => grid.explode(-1));
  pixelCanvas.addEventListener("click", () => {
    if (grid.state !== 0) {
      grid.speed = 4;
    } else {
      window.open(projects[grid.currentIndex].liveUrl, "_blank", "noopener");
    }
  });
});
