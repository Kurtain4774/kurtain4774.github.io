const STATE = { IDLE: 0, SCRAMBLING: 1, REFORMING: 2 };
const TILE = 10;
const GAP = 0;

class PixelGrid {
  constructor(canvas, projects, onProjectChange) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.projects = projects;
    this.onProjectChange = onProjectChange;
    this.state = STATE.IDLE;
    this.currentIndex = 0;
    this.frame = 0;
    this.speed = 1;
    this.tiles = [];
    this.images = [];

    this.idleDirty = true;
    this._resizeScheduled = false;

    this.preloadImages().then(() => {
      this.resize();
      this.buildTiles(this.images[this.currentIndex]);
      this.placeAtHome();
      this.idleDirty = true;
      this.onProjectChange(this.projects[this.currentIndex]);
    });

    window.addEventListener("resize", () => {
      if (this._resizeScheduled) return;
      this._resizeScheduled = true;
      requestAnimationFrame(() => {
        this._resizeScheduled = false;
        if (this.state !== STATE.IDLE || !this.images[this.currentIndex]) return;
        this.resize();
        this.buildTiles(this.images[this.currentIndex]);
        this.placeAtHome();
        this.idleDirty = true;
      });
    });
  }

  preloadImages() {
    return Promise.all(
      this.projects.map(p => new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        img.src = p.image;
      }))
    ).then(imgs => { this.images = imgs; });
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = rect.width;
    this.h = rect.height;
  }

  sampleColors(img) {
    if (!this.w || !this.h || !img || !img.width || !img.height) {
      return { cols: 0, rows: 0, colors: [] };
    }

    // Step 1: downsample source to 1500x938 so we never read pixels from the full 2K image.
    const SW = 1500, SH = 938;
    const pre = document.createElement("canvas");
    pre.width = SW; pre.height = SH;
    const pctx = pre.getContext("2d");
    pctx.fillStyle = "#000";
    pctx.fillRect(0, 0, SW, SH);
    const ps = Math.min(SW / img.width, SH / img.height);
    pctx.drawImage(img, (SW - img.width * ps) / 2, (SH - img.height * ps) / 2, img.width * ps, img.height * ps);

    // Step 2: draw the downscaled intermediate into display-size offscreen canvas for sampling.
    const off = document.createElement("canvas");
    off.width = this.w;
    off.height = this.h;
    const octx = off.getContext("2d");
    octx.fillStyle = "#000";
    octx.fillRect(0, 0, this.w, this.h);
    octx.drawImage(pre, 0, 0, this.w, this.h);

    const data = octx.getImageData(0, 0, this.w, this.h).data;
    const step = TILE + GAP;
    const cols = Math.floor(this.w / step);
    const rows = Math.floor(this.h / step);
    const colors = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = Math.floor(c * step + TILE / 2);
        const py = Math.floor(r * step + TILE / 2);
        const idx = (py * this.w + px) * 4;
        const R = data[idx], G = data[idx + 1], B = data[idx + 2];
        colors.push({ c, r, cr: R, cg: G, cb: B });
      }
    }
    return { cols, rows, colors };
  }

  buildTiles(img) {
    const { cols, rows, colors } = this.sampleColors(img);
    this.cols = cols;
    this.rows = rows;
    const step = TILE + GAP;
    this.tiles = colors.map(({ c, r, cr, cg, cb }) => ({
      homeX: c * step,
      homeY: r * step,
      x: c * step,
      y: r * step,
      sx: c * step,
      sy: r * step,
      pr: cr, pg: cg, pb: cb,
      tr: cr, tg: cg, tb: cb,
      opacity: 1
    }));
  }

  placeAtHome() {
    for (const t of this.tiles) {
      t.x = t.homeX;
      t.y = t.homeY;
      t.sx = t.homeX;
      t.sy = t.homeY;
      t.pr = t.tr; t.pg = t.tg; t.pb = t.tb;
      t.opacity = 1;
    }
  }

  explode(direction = 1) {
    if (this.state !== STATE.IDLE) {
      this.speed = 4;
      return;
    }
    this.speed = 1;
    this.nextDirection = direction;
    this.nextIndex = (this.currentIndex + direction + this.projects.length) % this.projects.length;
    this.buildTiles(this.images[this.currentIndex]);
    this.placeAtHome();

    // Pre-load target colors from the next image so color shift starts immediately.
    const nextImg = this.images[this.nextIndex];
    if (nextImg) {
      const { colors } = this.sampleColors(nextImg);
      const minLen = Math.min(this.tiles.length, colors.length);
      for (let i = 0; i < minLen; i++) {
        this.tiles[i].tr = colors[i].cr;
        this.tiles[i].tg = colors[i].cg;
        this.tiles[i].tb = colors[i].cb;
      }
    }

    this.state = STATE.SCRAMBLING;
    this.frame = 0;
    this.idleDirty = true;
    for (const t of this.tiles) {
      t.sx = this.w * 0.15 + Math.random() * this.w * 0.7;
      t.sy = this.h * 0.15 + Math.random() * this.h * 0.7;
    }
  }

  startReform() {
    this.currentIndex = this.nextIndex;
    const nextImg = this.images[this.currentIndex];
    if (nextImg) {
      // Colors already target the next image — only update home positions.
      const { colors } = this.sampleColors(nextImg);
      const step = TILE + GAP;
      const minLen = Math.min(this.tiles.length, colors.length);
      for (let i = 0; i < minLen; i++) {
        this.tiles[i].homeX = colors[i].c * step;
        this.tiles[i].homeY = colors[i].r * step;
      }
    }
    this.state = STATE.REFORMING;
    this.frame = 0;
    this.onProjectChange(this.projects[this.currentIndex]);
  }

  drawImage(img) {
    if (!this.w || !this.h || !img || !img.width || !img.height) return;

    const ctx = this.ctx;
    const scale = Math.min(this.w / img.width, this.h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, (this.w - dw) / 2, (this.h - dh) / 2, dw, dh);
  }

  easeAmount(amount, delta) {
    return 1 - Math.pow(1 - amount, delta);
  }

  step(delta = 1) {
    const ctx = this.ctx;

    if (this.state === STATE.IDLE) {
      // Idle: only redraw the still image when something invalidates it
      // (initial load, resize, end of transition).
      if (!this.idleDirty) return;
      ctx.clearRect(0, 0, this.w, this.h);
      const img = this.images[this.currentIndex];
      if (img && img.complete) this.drawImage(img);
      this.idleDirty = false;
      return;
    }

    ctx.clearRect(0, 0, this.w, this.h);

    if (this.state === STATE.SCRAMBLING) {
      let allSettled = true;
      const moveEase = this.easeAmount(0.05, delta);
      const colorEase = this.easeAmount(0.05, delta);
      for (const t of this.tiles) {
        t.x += (t.sx - t.x) * moveEase;
        t.y += (t.sy - t.y) * moveEase;
        t.pr += (t.tr - t.pr) * colorEase;
        t.pg += (t.tg - t.pg) * colorEase;
        t.pb += (t.tb - t.pb) * colorEase;
        if (Math.abs(t.sx - t.x) > 1 || Math.abs(t.sy - t.y) > 1) allSettled = false;
      }
      this.frame += delta;
      if (this.frame > 60 || allSettled) this.startReform();
    } else if (this.state === STATE.REFORMING) {
      let settled = true;
      const moveEase = this.easeAmount(0.05, delta);
      const colorEase = this.easeAmount(0.05, delta);
      for (const t of this.tiles) {
        t.x += (t.homeX - t.x) * moveEase;
        t.y += (t.homeY - t.y) * moveEase;
        t.pr += (t.tr - t.pr) * colorEase;
        t.pg += (t.tg - t.pg) * colorEase;
        t.pb += (t.tb - t.pb) * colorEase;
        t.opacity = Math.min(1, t.opacity + 0.01 * delta);
        if (Math.abs(t.x - t.homeX) > 2 || Math.abs(t.y - t.homeY) >2 || t.opacity < 0.95) {
          settled = false;
        }
      }
      if (settled) {
        this.placeAtHome();
        this.state = STATE.IDLE;
        this.idleDirty = true;
        return;
      }
    }

    // render tiles (SCRAMBLING or REFORMING only)
    for (const t of this.tiles) {
      if (t.opacity <= 0.01) continue;
      ctx.globalAlpha = t.opacity;
      ctx.fillStyle = `rgb(${t.pr|0},${t.pg|0},${t.pb|0})`;
      ctx.fillRect(t.x, t.y, TILE, TILE);
    }
    ctx.globalAlpha = 1;
  }
}
