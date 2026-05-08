class HeroAnimator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.drops = [];
    this.isMobile = window.innerWidth < 768;
    this.dropCount = this.isMobile ? 50 : 200;
    this.startTime = performance.now() + 1000;
    this._resizeScheduled = false;

    this.resize();
    this.initDrops();

    const handleResize = () => {
      if (this._resizeScheduled) return;
      this._resizeScheduled = true;
      requestAnimationFrame(() => {
        this._resizeScheduled = false;
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 768;
        this.dropCount = this.isMobile ? 50 : 200;
        this.resize();
        if (wasMobile !== this.isMobile || this.drops.length !== this.dropCount) {
          this.initDrops();
        }
      });
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("load", () => {
      this.resize();
      this.initDrops();
    });
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = this.canvas.getBoundingClientRect();
    const width = this.canvas.clientWidth || rect.width;
    const height = this.canvas.clientHeight || rect.height;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = width;
    this.h = height;
  }

  initDrops() {
    this.drops = [];
    for (let i = 0; i < this.dropCount; i++) {
      this.drops.push(this.makeDrop(true));
    }
  }

  makeDrop(initial = false) {
    return {
      x: Math.random() * this.w,
      y: initial ? Math.random() * this.h : -40,
      length: 18 + Math.random() * 24,
      speed: 12 + Math.random() * 12,
      opacity: 0.22 + Math.random() * 0.35,
      width: 0.5 + Math.random() * 0.8,
      angle: -(0.05 + Math.random() * 0.08),
      drift: 0.4 + Math.random() * 0.5
    };
  }



  drawRain(delta = 1) {
    const ctx = this.ctx;
    // Single solid stroke style — vary alpha per drop instead of building
    // a fresh LinearGradient per drop per frame.
    ctx.strokeStyle = "rgb(215, 230, 255)";
    ctx.lineCap = "round";
    for (const d of this.drops) {
      const x0 = d.x;
      const y0 = d.y;
      const x1 = d.x - d.length * d.angle;
      const y1 = d.y + d.length;
      ctx.globalAlpha = d.opacity;
      ctx.lineWidth = d.width;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      d.y += d.speed * delta;
      d.x += d.drift * delta;
      if (d.y > this.h + 40 || d.x > this.w + 40) {
        Object.assign(d, this.makeDrop(false));
      }
    }
    ctx.globalAlpha = 1;
  }


  step(delta = 1) {
    this.ctx.clearRect(0, 0, this.w, this.h);
    if (performance.now() < this.startTime) return;
    this.drawRain(delta);
  }
}
