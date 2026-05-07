class HeroAnimator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.drops = [];
    this.isMobile = window.innerWidth < 768;
    this.dropCount = this.isMobile ? 60 : 250;
    this.startTime = performance.now() + 1000;

    this.resize();
    this.initDrops();

    window.addEventListener("resize", () => {
      this.resize();
      this.isMobile = window.innerWidth < 768;
      this.dropCount = this.isMobile ? 60 : 250;
      this.initDrops();
    });

    window.addEventListener("load", () => {
      this.resize();
      this.initDrops();
    });
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const width = this.canvas.clientWidth || rect.width;
    const height = this.canvas.clientHeight || rect.height;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
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
      length: 15 + Math.random() * 20,
      speed: 10 + Math.random() * 10,
      opacity: 0.2 + Math.random() * 0.3,
      width: 0.5 + Math.random() * 0.7,
      angle: 0 + Math.random() * 0,
      drift: 0 + Math.random() * 0
    };
  }



  drawRain(delta = 1) {
    const ctx = this.ctx;
    for (const d of this.drops) {
      const x0 = d.x;
      const y0 = d.y;
      const x1 = d.x - d.length * d.angle;
      const y1 = d.y + d.length;
      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      grad.addColorStop(0, `rgba(200,220,255,0)`);
      grad.addColorStop(0.4, `rgba(200,220,255,${d.opacity * 0.6})`);
      grad.addColorStop(1, `rgba(220,235,255,${d.opacity})`);
      ctx.strokeStyle = grad;
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
  }


  step(delta = 1) {
    this.ctx.clearRect(0, 0, this.w, this.h);
    if (performance.now() < this.startTime) return;
    this.drawRain(delta);
  }
}
