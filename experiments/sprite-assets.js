
//   1. Indexed sheets  (balls, ppl, stars, etc.) — accessed by number
//   2. Named sheets    (particles, special)      — accessed by name string
//   3. Separate images (logos)                    — individual files


const Assets = {
  _sheets: {},      
  _named: {},       
  _separate: {},    
  _manifest: null,
  _loaded: false,


async load() {
    const tier = Config.isMobile ? "mobile" : "desktop";
    this._manifest = SpriteManifest[tier];
    // Don't load everything — just init the manifest.
    // Individual sheets are loaded on demand via loadSheets().
    this._loaded = true;
    console.log(`Assets manifest ready (${tier} tier)`);
  },

  async loadSheets(sheetNames) {
    if (!this._manifest) return;
    const promises = [];

    for (const name of sheetNames) {
      // Skip if already loaded
      if (this._sheets[name] || this._named[name]) continue;

      const sheetInfo = this._manifest.sheets[name];
      if (sheetInfo) {
        promises.push(this._loadImage(sheetInfo.file, (img) => {
          this._sheets[name] = img;
        }, name));
        continue;
      }

      const namedInfo = (this._manifest.named || {})[name];
      if (namedInfo) {
        promises.push(this._loadImage(namedInfo.file, (img) => {
          this._named[name] = img;
        }, name));
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
      console.log(`Loaded sheets: ${sheetNames.filter(n => !this._sheets[n] || promises.length).join(", ")}`);
    }
  },

  _loadImage(src, onLoad, label) {
    const img = new Image();
    return new Promise((resolve) => {
      img.onload = () => {
        onLoad(img);
        console.log(`  Loaded: ${label}`);
        resolve();
      };
      img.onerror = () => {
        console.error(`  FAILED: ${label} (${src})`);
        resolve(); // don't block other assets
      };
      img.src = src;
    });
  },

  isReady() {
    return this._loaded;
  },


  _getFrame(sheetName, index) {
    const info = this._manifest.sheets[sheetName];
    if (!info) return null;

    const img = this._sheets[sheetName];
    if (!img || !img.complete || img.naturalWidth === 0) return null;

    const wrappedIndex = index % info.count;
    const frame = info.frames[wrappedIndex];
    if (!frame || frame.w === 0) return null;

    return {
      img: img,
      sx: frame.x + frame.ox,
      sy: frame.y + frame.oy,
      sw: frame.w,
      sh: frame.h,
      cellSize: info.cellSize,
      aspectRatio: frame.w / (frame.h || 1),
    };
  },


  _getNamedFrame(sheetCategory, name) {
    const info = (this._manifest.named || {})[sheetCategory];
    if (!info || !info.nameMap) return null;

    const idx = info.nameMap[name];
    if (idx === undefined) return null;

    const img = this._named[sheetCategory];
    if (!img || !img.complete || img.naturalWidth === 0) return null;

    const frame = info.frames[idx];
    if (!frame || frame.w === 0) return null;

    return {
      img: img,
      sx: frame.x + frame.ox,
      sy: frame.y + frame.oy,
      sw: frame.w,
      sh: frame.h,
      cellSize: info.cellSize,
      aspectRatio: frame.w / (frame.h || 1),
    };
  },

  getBallImage(index) {
    return this._getFrame("balls", index - 1);
  },

  getPersonImage(index) {
    return this._getFrame("ppl", index - 1);
  },

  getBestBallImage(index) {
    return this._getFrame("bestballs", index - 1);
  },

  /** Best person image. index is 0-based (ppl_0 = 0). */
  getBestPersonImage(index) {
    return this._getFrame("bestppl", index);
  },

  /** Other image. index is 0-based (passed as posterData.img - 1 in game code). */
  getOtherImage(index) {
    return this._getFrame("other", index);
  },

  /** Star particle image. index is 0-based. */
  getStarImage(index) {
    return this._getFrame("stars", index);
  },

  // Named lookups

  /** Get a particle by name: "heart" or "ko" */
  getParticle(name) {
    return this._getNamedFrame("particles", name);
  },

  /** Get a special image by name: "baddie", "cat", "trees", etc. */
  getSpecial(name) {
    return this._getNamedFrame("special", name);
  },

  getSeparate(name) {
    const info = (this._manifest.separate || {})[name];
    if (!info) return null;

    const img = this._separate[name];
    if (!img || !img.complete || img.naturalWidth === 0) return null;

    return {
      img: img,
      sx: 0,
      sy: 0,
      sw: img.naturalWidth,
      sh: img.naturalHeight,
      aspectRatio: img.naturalWidth / (img.naturalHeight || 1),
    };
  },

 
  isImageReady(frameOrImg) {
    if (!frameOrImg) return false;
    // Sprite frame
    if (frameOrImg.sw !== undefined) return frameOrImg.sw > 0;
    // Raw Image element (poster image, etc.)
    return frameOrImg.complete && frameOrImg.naturalWidth > 0;
  },
};

const SpriteRenderer = {

  drawFrame(frame, dx, dy, dw, dh, opacity = 1, rotation = 0) {
    if (!frame || frame.sw === 0) return false;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(dx + dw / 2, dy + dh / 2);
    ctx.rotate(rotation);
    ctx.drawImage(
      frame.img,
      frame.sx, frame.sy, frame.sw, frame.sh,
      -dw / 2, -dh / 2, dw, dh
    );
    ctx.restore();
    return true;
  },

  drawBall(ball, opacity = 1, rotation = 0) {
    const frame = Assets.getBallImage(ball.ballImage);
    if (!frame) {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(ball.x, ball.y);
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#333";
      ctx.fill();
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(ball.x, ball.y);
    ctx.rotate(rotation);
    if (ball.squishX !== undefined) ctx.scale(ball.squishX, ball.squishY);
    ctx.drawImage(
      frame.img,
      frame.sx, frame.sy, frame.sw, frame.sh,
      -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2
    );
    ctx.restore();
  },

  drawBallWithSquash(ball, opacity = 1, rotation = 0, squashX = 1, squashY = 1) {
    const frame = Assets.getBallImage(ball.ballImage);
    if (!frame) return;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(ball.x, ball.y);
    ctx.rotate(rotation);
    if (ball.squishX !== undefined) ctx.scale(ball.squishX, ball.squishY);
    ctx.scale(squashX, squashY);
    ctx.drawImage(
      frame.img,
      frame.sx, frame.sy, frame.sw, frame.sh,
      -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2
    );
    ctx.restore();
  },

  drawPerson(x, y, height, imageIndex, opacity = 1, rotation = 0) {
    const frame = Assets.getPersonImage(imageIndex);
    if (!frame) return;
    const width = height * frame.aspectRatio;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(
      frame.img,
      frame.sx, frame.sy, frame.sw, frame.sh,
      -width / 2, -height, width, height
    );
    ctx.restore();
  },

  drawBestBall(ball, opacity = 1, rotation = 0) {
    const frame = Assets.getBestBallImage(ball.ballImage);
    if (!frame) return;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(ball.x, ball.y);
    ctx.rotate(rotation);
    ctx.drawImage(
      frame.img,
      frame.sx, frame.sy, frame.sw, frame.sh,
      -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2
    );
    ctx.restore();
  },

  drawBestPerson(x, y, height, imageIndex, opacity = 1, rotation = 0) {
    const frame = Assets.getBestPersonImage(imageIndex);
    if (!frame) return;
    const width = height * frame.aspectRatio;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(
      frame.img,
      frame.sx, frame.sy, frame.sw, frame.sh,
      -width / 2, -height, width, height
    );
    ctx.restore();
  },

  drawOther(x, y, size, imageIndex, opacity = 1, rotation = 0) {
    const frame = Assets.getOtherImage(imageIndex);
    if (!frame) return false;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(
      frame.img,
      frame.sx, frame.sy, frame.sw, frame.sh,
      -size / 2, -size / 2, size, size
    );
    ctx.restore();
    return true;
  },


  drawOutline(frame, x, y, w, h, outlineWidth = 3, outlineColor = "rgba(255, 220, 100, 0.9)") {
    if (!frame || frame.sw === 0) return;

    if (!this._outlineCanvas) {
      this._outlineCanvas = document.createElement("canvas");
      this._outlineCtx = this._outlineCanvas.getContext("2d");
    }
    const oc = this._outlineCanvas;
    const octx = this._outlineCtx;

    const pad = outlineWidth + 2;
    oc.width = w + pad * 2;
    oc.height = h + pad * 2;
    octx.clearRect(0, 0, oc.width, oc.height);

    octx.globalCompositeOperation = "source-over";
    for (let dx = -outlineWidth; dx <= outlineWidth; dx++) {
      for (let dy = -outlineWidth; dy <= outlineWidth; dy++) {
        if (dx * dx + dy * dy <= outlineWidth * outlineWidth) {
          octx.drawImage(
            frame.img,
            frame.sx, frame.sy, frame.sw, frame.sh,
            pad + dx, pad + dy, w, h
          );
        }
      }
    }

    octx.globalCompositeOperation = "source-in";
    octx.fillStyle = outlineColor;
    octx.fillRect(0, 0, oc.width, oc.height);

    octx.globalCompositeOperation = "destination-out";
    octx.drawImage(
      frame.img,
      frame.sx, frame.sy, frame.sw, frame.sh,
      pad, pad, w, h
    );

    ctx.drawImage(oc, x - pad, y - pad);
  },


  drawImage(frame, x, y, w, h, opacity = 1, rotation = 0) {
    return this.drawFrame(frame, x, y, w, h, opacity, rotation);
  },
};

