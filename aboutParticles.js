const mouseRadius = 500;
const lineRadius = 150;
const minParticleCount = 100;
const maxParticleCount = 250;
const minParticleArea = 390 * 844;
const maxParticleArea = 1440 * 900;

class AboutParticleSystem {
  constructor(canvas, section) {
    this.canvas = canvas;
    this.section = section;
    this.ctx = canvas.getContext("2d");
    this.dpr = 1;
    this.width = 0;
    this.height = 0;
    this.particles = [];
    this.particleCount = minParticleCount;
    this.mouse = { x: 0, y: 0 };
    this.cursorParticle = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      vx: 0,
      vy: 0,
      radius: 2.5,
      active: false
    };
    this.color = { r: 255, g: 255, b: 255 };
    this.targetColor = { r: 255, g: 255, b: 255 };
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    this.resize();
    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener("resize", () => this.resize());

    this.section.addEventListener("pointermove", (event) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = event.clientX - rect.left;
      this.mouse.y = event.clientY - rect.top;
      this.cursorParticle.targetX = this.mouse.x;
      this.cursorParticle.targetY = this.mouse.y;
      this.cursorParticle.active = true;
    });

    this.section.addEventListener("pointerleave", () => {
      this.cursorParticle.active = false;
    });
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    const scaleX = this.width ? nextWidth / this.width : 1;
    const scaleY = this.height ? nextHeight / this.height : 1;

    this.width = nextWidth;
    this.height = nextHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.mouse.x = this.mouse.x ? this.mouse.x * scaleX : this.width / 2;
    this.mouse.y = this.mouse.y ? this.mouse.y * scaleY : this.height / 2;
    this.cursorParticle.x = this.cursorParticle.x ? this.cursorParticle.x * scaleX : this.mouse.x;
    this.cursorParticle.y = this.cursorParticle.y ? this.cursorParticle.y * scaleY : this.mouse.y;
    this.cursorParticle.targetX = this.mouse.x;
    this.cursorParticle.targetY = this.mouse.y;

    this.particleCount = this.getParticleCountForArea();

    if (this.particles.length === 0) {
      this.createParticles(this.particleCount);
    } else {
      this.particles.forEach((particle) => {
        particle.x *= scaleX;
        particle.y *= scaleY;
      });
      this.syncParticleCount();
    }
  }

  getParticleCountForArea() {
    const area = this.width * this.height;
    const progress = (area - minParticleArea) / (maxParticleArea - minParticleArea);
    const clampedProgress = Math.max(0, Math.min(1, progress));
    return Math.round(minParticleCount + (maxParticleCount - minParticleCount) * clampedProgress);
  }

  createParticle(x = Math.random() * this.width, y = Math.random() * this.height) {
    const speed = 0.12 + Math.random() * 0.3;
    const angle = Math.random() * Math.PI * 2;

    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1.5,
      twinkle: Math.random() * Math.PI * 2
    };
  }

  createParticles(count) {
    this.particles = Array.from({ length: count }, () => this.createParticle());
  }

  syncParticleCount() {
    while (this.particles.length < this.particleCount) {
      this.particles.push(this.createParticle());
    }

    if (this.particles.length > this.particleCount) {
      this.particles.length = this.particleCount;
    }
  }

  setColor(hexColor) {
    const parsedColor = this.hexToRgb(hexColor);
    if (!parsedColor) return;
    this.targetColor = parsedColor;
  }

  hexToRgb(hexColor) {
    const clean = hexColor.replace("#", "").trim();
    if (clean.length !== 6) return null;

    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16)
    };
  }

  easeAmount(amount, delta) {
    return 1 - Math.pow(1 - amount, delta);
  }

  step(delta = 1) {
    if (!this.ctx || this.width === 0 || this.height === 0) return;

    const colorEase = this.easeAmount(0.08, delta);
    this.color.r += (this.targetColor.r - this.color.r) * colorEase;
    this.color.g += (this.targetColor.g - this.color.g) * colorEase;
    this.color.b += (this.targetColor.b - this.color.b) * colorEase;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.updateParticles(delta);
    this.updateCursorParticle(delta);
    this.applyCursorInfluence(delta);
    this.drawLines();
    this.drawParticles();
    this.drawCursorParticle();
  }

  updateParticles(delta = 1) {
    const motionScale = this.reducedMotion.matches ? 0.18 : 1;

    this.particles.forEach((particle) => {
      particle.x += particle.vx * motionScale * delta;
      particle.y += particle.vy * motionScale * delta;
      particle.twinkle += 0.014 * motionScale * delta;

      if (particle.x < 0) particle.x = this.width;
      if (particle.x > this.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.height;
      if (particle.y > this.height) particle.y = 0;
    });
  }

  updateCursorParticle(delta = 1) {
    const baseEase = this.reducedMotion.matches ? 0.22 : 0.16;
    const baseFriction = this.reducedMotion.matches ? 0.48 : 0.62;
    const ease = this.easeAmount(baseEase, delta);
    const friction = Math.pow(baseFriction, delta);

    this.cursorParticle.vx += (this.cursorParticle.targetX - this.cursorParticle.x) * ease;
    this.cursorParticle.vy += (this.cursorParticle.targetY - this.cursorParticle.y) * ease;
    this.cursorParticle.vx *= friction;
    this.cursorParticle.vy *= friction;
    this.cursorParticle.x += this.cursorParticle.vx * delta;
    this.cursorParticle.y += this.cursorParticle.vy * delta;
  }

  applyCursorInfluence(delta = 1) {
    if (!this.cursorParticle.active) return;

    const influenceRadius = 115;
    const force = this.reducedMotion.matches ? 0.0008 : 0.0024;

    this.particles.forEach((particle) => {
      const dx = particle.x - this.cursorParticle.x;
      const dy = particle.y - this.cursorParticle.y;
      const distance = Math.hypot(dx, dy);
      if (distance <= 0 || distance > influenceRadius) return;

      const strength = (1 - distance / influenceRadius) * force;
      particle.vx += (dx / distance) * strength * delta;
      particle.vy += (dy / distance) * strength * delta;
    });
  }

  particleMouseStrength(particle, radius) {
    const dx = particle.x - this.mouse.x;
    const dy = particle.y - this.mouse.y;
    const distance = Math.hypot(dx, dy);
    return {
      distance,
      strength: Math.max(0, 1 - distance / radius)
    };
  }

  drawLines() {
    const { r, g, b } = this.color;

    this.ctx.lineWidth = 1;

    if (this.cursorParticle.active) {
      this.drawCursorLines(lineRadius);
    }

    for (let i = 0; i < this.particles.length; i += 1) {
      const a = this.particles[i];
      const aMouse = this.particleMouseStrength(a, mouseRadius);
      if (aMouse.strength <= 0) continue;

      for (let j = i + 1; j < this.particles.length; j += 1) {
        const bParticle = this.particles[j];
        const bMouse = this.particleMouseStrength(bParticle, mouseRadius);
        if (bMouse.strength <= 0) continue;

        const dx = a.x - bParticle.x;
        const dy = a.y - bParticle.y;
        const distance = Math.hypot(dx, dy);
        if (distance > lineRadius) continue;

        const pairStrength = 1 - distance / lineRadius;
        const mouseStrength = Math.min(aMouse.strength, bMouse.strength);
        const alpha = Math.min(0.62, pairStrength * mouseStrength * 0.64);

        this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.moveTo(a.x, a.y);
        this.ctx.lineTo(bParticle.x, bParticle.y);
        this.ctx.stroke();
      }
    }
  }

  drawCursorLines(lineRadius) {
    const { r, g, b } = this.color;

    this.particles.forEach((particle) => {
      const mouse = this.particleMouseStrength(particle, mouseRadius);
      if (mouse.strength <= 0) return;

      const dx = particle.x - this.cursorParticle.x;
      const dy = particle.y - this.cursorParticle.y;
      const distance = Math.hypot(dx, dy);
      if (distance > lineRadius * 1.45) return;

      const pairStrength = 1 - distance / (lineRadius * 1.45);
      const alpha = Math.min(0.72, pairStrength * Math.max(0.35, mouse.strength) * 0.78);

      this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.moveTo(this.cursorParticle.x, this.cursorParticle.y);
      this.ctx.lineTo(particle.x, particle.y);
      this.ctx.stroke();
    });
  }

  drawParticles() {
    const visibilityRadius = 1800;
    const { r, g, b } = this.color;

    this.particles.forEach((particle) => {
      const mouse = this.particleMouseStrength(particle, visibilityRadius);
      const glow = mouse.strength * mouse.strength;
      const nearBoost = Math.max(0, 1 - mouse.distance / 500);
      const shimmer = 0.85 + Math.sin(particle.twinkle) * 0.15;
      const alpha = Math.min(0.84, (0.224 + glow * 0.68 + nearBoost * 0.12) * shimmer);
      const radius = particle.size + nearBoost * 0.9;

      this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${Math.min(0.62, alpha)})`;
      this.ctx.shadowBlur = 1.5 + nearBoost * 8;
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.shadowBlur = 0;
  }

  drawCursorParticle() {
    if (!this.cursorParticle.active) return;

    const { r, g, b } = this.color;
    const speedGlow = Math.min(1, Math.hypot(this.cursorParticle.vx, this.cursorParticle.vy) / 12);
    const radius = this.cursorParticle.radius + speedGlow * 1.6;

    this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.95)`;
    this.ctx.shadowBlur = 22 + speedGlow * 12;
    this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.96)`;
    this.ctx.beginPath();
    this.ctx.arc(this.cursorParticle.x, this.cursorParticle.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

  }
}
