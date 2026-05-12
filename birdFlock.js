class BirdFlock {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.dpr = 1;
    this.width = 0;
    this.height = 0;
    this.boids = [];
    this.count = 0;
    this.frame = 0;

    this.size = 9.6;
    this.maxSpeed = 1.15;
    this.minSpeed = 0.58;
    this.maxForce = 0.04;
    this.sepRadius = 18;
    this.alignRadius = 36;
    this.cohRadius = 50;
    this.sepRadiusSq = this.sepRadius * this.sepRadius;
    this.alignRadiusSq = this.alignRadius * this.alignRadius;
    this.cohRadiusSq = this.cohRadius * this.cohRadius;
    this.wSep = 1.6;
    this.wAlign = 1.0;
    this.wCoh = 0.9;
    this.wWander = 0.012;
    this.wBoundary = 1.4;
    this.boundaryMargin = 60;
    this.color = { r: 255, g: 255, b: 255 };
    this.targetColor = { r: 255, g: 255, b: 255 };
    this.colorAlpha = 0.35;

    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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

  setColor(hexColor) {
    const parsedColor = this.hexToRgb(hexColor);
    if (!parsedColor) return;

    this.targetColor = parsedColor;
    if (this.reducedMotion.matches) {
      this.color = { ...parsedColor };
      this.render();
    }
  }

  hexToRgb(hexColor) {
    const clean = String(hexColor || "").replace("#", "").trim();
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

  updateColor(delta = 1) {
    const colorEase = this.easeAmount(0.08, delta);
    this.color.r += (this.targetColor.r - this.color.r) * colorEase;
    this.color.g += (this.targetColor.g - this.color.g) * colorEase;
    this.color.b += (this.targetColor.b - this.color.b) * colorEase;
  }

  getCountForWidth() {
    if (this.reducedMotion.matches) return 2;
    return this.width <= 768 ? 3 : 8;
  }

  addBoids(n = 15) {
    if (this.reducedMotion.matches) return;
    const cap = this.width <= 768 ? 40 : 160;
    this.count = Math.min(this.count + n, cap);
    this.syncCount();
  }

  createBoid(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);
    return {
      x: x === undefined ? Math.random() * this.width : x,
      y: y === undefined ? Math.random() * this.height : y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      dirX: Math.cos(angle),
      dirY: Math.sin(angle),
      wanderAngle: Math.random() * Math.PI * 2,
      sepX: 0,
      sepY: 0,
      sepCount: 0,
      aliX: 0,
      aliY: 0,
      aliCount: 0,
      cohX: 0,
      cohY: 0,
      cohCount: 0
    };
  }

  syncCount() {
    while (this.boids.length < this.count) {
      this.boids.push(this.createBoid());
    }
    if (this.boids.length > this.count) {
      this.boids.length = this.count;
    }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    const scaleX = this.width ? nextWidth / this.width : 1;
    const scaleY = this.height ? nextHeight / this.height : 1;

    this.width = nextWidth;
    this.height = nextHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.count = this.getCountForWidth();

    if (this.boids.length === 0) {
      this.boids = Array.from({ length: this.count }, () => this.createBoid());
    } else {
      this.boids.forEach((b) => {
        b.x *= scaleX;
        b.y *= scaleY;
      });
      this.syncCount();
    }

    if (this.reducedMotion.matches) {
      this.render();
    }
  }

  step(delta = 1) {
    if (!this.ctx || this.width === 0 || this.height === 0) return;
    if (this.reducedMotion.matches) return;

    this.updateColor(delta);

    const boids = this.boids;
    const n = boids.length;
    const margin = this.boundaryMargin;

    for (let i = 0; i < n; i++) {
      const b = boids[i];
      b.sepX = 0;
      b.sepY = 0;
      b.sepCount = 0;
      b.aliX = 0;
      b.aliY = 0;
      b.aliCount = 0;
      b.cohX = 0;
      b.cohY = 0;
      b.cohCount = 0;
    }

    for (let i = 0; i < n - 1; i++) {
      const a = boids[i];
      for (let j = i + 1; j < n; j++) {
        const b = boids[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dSq = dx * dx + dy * dy;
        if (dSq > this.cohRadiusSq) continue;

        if (dSq < this.sepRadiusSq && dSq > 0.0001) {
          const invD = 1 / Math.sqrt(dSq);
          const sx = dx * invD;
          const sy = dy * invD;
          a.sepX += sx;
          a.sepY += sy;
          a.sepCount++;
          b.sepX -= sx;
          b.sepY -= sy;
          b.sepCount++;
        }

        if (dSq < this.alignRadiusSq) {
          a.aliX += b.vx;
          a.aliY += b.vy;
          a.aliCount++;
          b.aliX += a.vx;
          b.aliY += a.vy;
          b.aliCount++;
        }

        a.cohX += b.x;
        a.cohY += b.y;
        a.cohCount++;
        b.cohX += a.x;
        b.cohY += a.y;
        b.cohCount++;
      }
    }

    for (let i = 0; i < n; i++) {
      const b = boids[i];

      let ax = 0, ay = 0;

      if (b.sepCount > 0) {
        let sx = b.sepX / b.sepCount;
        let sy = b.sepY / b.sepCount;
        const sl = Math.sqrt(sx * sx + sy * sy);
        if (sl > 0) {
          sx = (sx / sl) * this.maxSpeed - b.vx;
          sy = (sy / sl) * this.maxSpeed - b.vy;
          const fl = Math.sqrt(sx * sx + sy * sy);
          if (fl > this.maxForce) {
            sx = (sx / fl) * this.maxForce;
            sy = (sy / fl) * this.maxForce;
          }
          ax += sx * this.wSep;
          ay += sy * this.wSep;
        }
      }

      if (b.aliCount > 0) {
        let avx = b.aliX / b.aliCount;
        let avy = b.aliY / b.aliCount;
        const al = Math.sqrt(avx * avx + avy * avy);
        if (al > 0) {
          avx = (avx / al) * this.maxSpeed - b.vx;
          avy = (avy / al) * this.maxSpeed - b.vy;
          const fl = Math.sqrt(avx * avx + avy * avy);
          if (fl > this.maxForce) {
            avx = (avx / fl) * this.maxForce;
            avy = (avy / fl) * this.maxForce;
          }
          ax += avx * this.wAlign;
          ay += avy * this.wAlign;
        }
      }

      if (b.cohCount > 0) {
        const tx = b.cohX / b.cohCount - b.x;
        const ty = b.cohY / b.cohCount - b.y;
        const tl = Math.sqrt(tx * tx + ty * ty);
        if (tl > 0) {
          let dx = (tx / tl) * this.maxSpeed - b.vx;
          let dy = (ty / tl) * this.maxSpeed - b.vy;
          const fl = Math.sqrt(dx * dx + dy * dy);
          if (fl > this.maxForce) {
            dx = (dx / fl) * this.maxForce;
            dy = (dy / fl) * this.maxForce;
          }
          ax += dx * this.wCoh;
          ay += dy * this.wCoh;
        }
      }

      // Boundary steering: push back toward center near edges
      if (b.x < margin) ax += this.wBoundary * this.maxForce * (1 - b.x / margin);
      else if (b.x > this.width - margin) ax -= this.wBoundary * this.maxForce * (1 - (this.width - b.x) / margin);
      if (b.y < margin) ay += this.wBoundary * this.maxForce * (1 - b.y / margin);
      else if (b.y > this.height - margin) ay -= this.wBoundary * this.maxForce * (1 - (this.height - b.y) / margin);

      b.wanderAngle += (Math.random() - 0.5) * 0.05 * delta;
      ax += Math.cos(b.wanderAngle) * this.wWander;
      ay += Math.sin(b.wanderAngle) * this.wWander;

      b.vx += ax * delta;
      b.vy += ay * delta;

      // Clamp speed
      const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      if (sp > this.maxSpeed) {
        b.vx = (b.vx / sp) * this.maxSpeed;
        b.vy = (b.vy / sp) * this.maxSpeed;
      } else if (sp < this.minSpeed && sp > 0) {
        b.vx = (b.vx / sp) * this.minSpeed;
        b.vy = (b.vy / sp) * this.minSpeed;
      } else if (sp === 0) {
        const a = Math.random() * Math.PI * 2;
        b.vx = Math.cos(a) * this.minSpeed;
        b.vy = Math.sin(a) * this.minSpeed;
      }

      const nextSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy) || 1;
      b.dirX = b.vx / nextSpeed;
      b.dirY = b.vy / nextSpeed;
      b.x += b.vx * delta;
      b.y += b.vy * delta;

      // Wrap as safety net
      if (b.x < -10) b.x = this.width + 10;
      else if (b.x > this.width + 10) b.x = -10;
      if (b.y < -10) b.y = this.height + 10;
      else if (b.y > this.height + 10) b.y = -10;
    }

    this.render();
  }

  render() {
    const ctx = this.ctx;
    const size = this.size;
    const r = Math.round(this.color.r);
    const g = Math.round(this.color.g);
    const b = Math.round(this.color.b);
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.colorAlpha})`;
    ctx.beginPath();

    for (let i = 0; i < this.boids.length; i++) {
      const b = this.boids[i];
      const fx = b.dirX;
      const fy = b.dirY;
      const px = -fy;
      const py = fx;

      const tipX = b.x + fx * size;
      const tipY = b.y + fy * size;
      const backX = b.x - fx * size * 0.6;
      const backY = b.y - fy * size * 0.6;
      const leftX = backX + px * size * 0.5;
      const leftY = backY + py * size * 0.5;
      const rightX = backX - px * size * 0.5;
      const rightY = backY - py * size * 0.5;

      ctx.moveTo(tipX, tipY);
      ctx.lineTo(leftX, leftY);
      ctx.lineTo(rightX, rightY);
      ctx.closePath();
    }

    ctx.fill();
  }
}

window.BirdFlock = BirdFlock;
