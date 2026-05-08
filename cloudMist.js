const cloudMinPuffs = 10;
const cloudMaxPuffs = 28;
const cloudMinArea = 390 * 700;
const cloudMaxArea = 1600 * 1000;

class CloudMistAnimator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.dpr = 1;
    this.width = 0;
    this.height = 0;
    this.puffs = [];
    this.puffCount = cloudMinPuffs;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    this.spriteCanvas = document.createElement("canvas");
    this.spriteCanvas.width = 256;
    this.spriteCanvas.height = 256;
    this.spriteCtx = this.spriteCanvas.getContext("2d");
    this.buildSprite();

    this.resize();
    let resizeScheduled = false;
    this.handleResize = () => {
      if (resizeScheduled) return;
      resizeScheduled = true;
      requestAnimationFrame(() => {
        resizeScheduled = false;
        this.resize();
      });
    };
    window.addEventListener("resize", this.handleResize);
  }

  buildSprite() {
    const ctx = this.spriteCtx;
    const size = this.spriteCanvas.width;
    const c = size / 2;
    ctx.clearRect(0, 0, size, size);
    const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
    grad.addColorStop(0, "rgba(156, 175, 220, 0.42)");
    grad.addColorStop(0.45, "rgba(96, 116, 168, 0.18)");
    grad.addColorStop(1, "rgba(96, 116, 168, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    const scaleX = this.width ? nextWidth / this.width : 1;
    const scaleY = this.height ? nextHeight / this.height : 1;

    this.width = nextWidth;
    this.height = nextHeight;
    this.dpr = 1;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.puffCount = this.getPuffCountForArea();

    if (this.puffs.length === 0) {
      this.createPuffs(this.puffCount);
    } else {
      for (let i = 0; i < this.puffs.length; i++) {
        const p = this.puffs[i];
        p.x *= scaleX;
        p.y *= scaleY;
      }
      this.syncPuffCount();
    }

    this.render();
  }

  getPuffCountForArea() {
    const area = this.width * this.height;
    const progress = (area - cloudMinArea) / (cloudMaxArea - cloudMinArea);
    const clamped = Math.max(0, Math.min(1, progress));
    return Math.round(cloudMinPuffs + (cloudMaxPuffs - cloudMinPuffs) * clamped);
  }

  createPuff(x, y) {
    const baseSize = 120 + Math.random() * 170;
    return {
      x: x === undefined ? Math.random() * this.width : x,
      y: y === undefined ? Math.random() * this.height : y,
      size: baseSize,
      vx: 0.12 + Math.random() * 0.28,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.0035 + Math.random() * 0.005,
      swayAmp: 0.18 + Math.random() * 0.35,
      alpha: 0.18 + Math.random() * 0.32
    };
  }

  createPuffs(count) {
    this.puffs = Array.from({ length: count }, () => this.createPuff());
  }

  syncPuffCount() {
    while (this.puffs.length < this.puffCount) {
      this.puffs.push(this.createPuff());
    }
    if (this.puffs.length > this.puffCount) {
      this.puffs.length = this.puffCount;
    }
  }

  step(delta = 1) {
    if (!this.ctx || this.width === 0 || this.height === 0) return;

    const motionScale = this.reducedMotion.matches ? 0 : 1;
    if (motionScale === 0) return;

    for (let i = 0; i < this.puffs.length; i++) {
      const p = this.puffs[i];
      p.x += p.vx * motionScale * delta;
      p.sway += p.swaySpeed * delta;
      const wrapMargin = p.size;
      if (p.x - wrapMargin > this.width) {
        p.x = -wrapMargin;
        p.y = Math.random() * this.height;
      }
    }

    this.render();
  }

  render() {
    if (!this.ctx || this.width === 0 || this.height === 0) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    const sprite = this.spriteCanvas;
    this.ctx.save();

    for (let i = 0; i < this.puffs.length; i++) {
      const p = this.puffs[i];
      const drawSize = p.size;
      const ySway = Math.sin(p.sway) * p.swayAmp * 14;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.drawImage(
        sprite,
        p.x - drawSize / 2,
        p.y + ySway - drawSize / 2,
        drawSize,
        drawSize
      );
    }

    this.ctx.restore();
  }
}

window.CloudMistAnimator = CloudMistAnimator;
