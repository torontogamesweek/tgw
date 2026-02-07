const Config = {
  MAX_SPEED: 25,
  NUM_BALL_IMAGES: 35,
  NUM_BEST_BALL_IMAGES: 15,
  NUM_PEOPLE_IMAGES: 19,
  SCREEN_SHAKE_DECAY: 0.85,
  SCREEN_SHAKE_MAX: 5,
  SCREEN_SHAKE_MIN_THRESHOLD: 0.3,
  isMobile: "ontouchstart" in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768,
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const Assets = {
  balls: [],
  bestballs: [],
  people: [],
  stars: [],
  special: {},

  load() {
    for (let i = 1; i <= Config.NUM_BALL_IMAGES; i++) {
      const img = new Image();
      img.src = "balls/ball_" + i + ".png";
      this.balls.push(img);
    }
    for (let i = 1; i <= Config.NUM_BEST_BALL_IMAGES; i++) {
      const img = new Image();
      img.src = "bestballs/ball_" + i + ".png";
      this.bestballs.push(img);
    }
    for (let i = 1; i <= Config.NUM_PEOPLE_IMAGES; i++) {
      const img = new Image();
      img.src = "ppl/ppl_" + i + ".png";
      this.people.push(img);
    }
    for (let i = 1; i <= 3; i++) {
      const img = new Image();
      img.src = "particles/stars/star_" + i + ".png";
      this.stars.push(img);
    }
    this.special.point = this._loadImage("special/point.png");
    this.special.baddie = this._loadImage("special/baddie.png");
    this.special.heart = this._loadImage("particles/hot/heart.png");
    this.special.ko = this._loadImage("particles/hot/ko.png");
    this.special.blackCircle = this._loadImage("special/black-circle.png");
  },
  _loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
  },
  getBallImage(index) {
    return this.balls[(index - 1) % this.balls.length];
  },
  getBestBallImage(index) {
    return this.bestballs[(index - 1) % this.bestballs.length];
  },
  getPersonImage(index) {
    return this.people[index % this.people.length];
  },
  getStarImage(index) {
    return this.stars[index % this.stars.length];
  },
  isImageReady(img) {
    return img && img.complete && img.naturalWidth > 0;
  },
};

const ImageCounter = {
  ball: 0,
  bestball: 0,
  person: 0,
  nextBall() {
    this.ball = (this.ball + 1) % Config.NUM_BALL_IMAGES;
    return this.ball + 1;
  },
  nextBestBall() {
    this.bestball = (this.bestball + 1) % Config.NUM_BEST_BALL_IMAGES;
    return this.bestball + 1;
  },
  nextPerson() {
    const idx = this.person;
    this.person = (this.person + 1) % Config.NUM_PEOPLE_IMAGES;
    return idx;
  },
};

const ScreenShake = {
  x: 0,
  y: 0,
  intensity: 0,
  add(amount) {
    this.intensity = Math.min(Math.max(this.intensity, amount * 0.4), Config.SCREEN_SHAKE_MAX);
  },
  update() {
    if (this.intensity > 0) {
      this.x = (Math.random() - 0.5) * this.intensity;
      this.y = (Math.random() - 0.5) * this.intensity;
      this.intensity *= Config.SCREEN_SHAKE_DECAY;
      if (this.intensity < Config.SCREEN_SHAKE_MIN_THRESHOLD) this.intensity = 0;
    } else {
      this.x = 0;
      this.y = 0;
    }
  },
  reset() {
    this.x = 0;
    this.y = 0;
    this.intensity = 0;
  },
};

const Physics = {
  capSpeed(ball) {
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (speed > Config.MAX_SPEED) {
      const scale = Config.MAX_SPEED / speed;
      ball.vx *= scale;
      ball.vy *= scale;
    }
  },
  getSpeed(ball) {
    return Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  },
  distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  },
  contains(ball, x, y) {
    return this.distance(ball.x, ball.y, x, y) < ball.radius;
  },
  handleWallCollision(ball, canvasRef, bounce, squash) {
    if (bounce === undefined) bounce = 0.9;
    if (squash === undefined) squash = true;
    let hit = false;
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx *= -bounce;
      if (squash && ball.squashX !== undefined) {
        ball.squashX = 0.85;
        ball.squashY = 1.15;
      }
      hit = true;
    }
    if (ball.x + ball.radius > canvasRef.width) {
      ball.x = canvasRef.width - ball.radius;
      ball.vx *= -bounce;
      if (squash && ball.squashX !== undefined) {
        ball.squashX = 0.85;
        ball.squashY = 1.15;
      }
      hit = true;
    }
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy *= -bounce;
      if (squash && ball.squashX !== undefined) {
        ball.squashX = 1.15;
        ball.squashY = 0.85;
      }
      hit = true;
    }
    if (ball.y + ball.radius > canvasRef.height) {
      ball.y = canvasRef.height - ball.radius;
      ball.vy *= -bounce;
      if (squash && ball.squashX !== undefined) {
        ball.squashX = 1.15;
        ball.squashY = 0.85;
      }
      hit = true;
    }
    return hit;
  },
  handleBallCollisions(balls, options) {
    if (!options) options = {};
    const skipCondition =
      options.skipCondition ||
      function (b) {
        return b.popping || b.orbiting || b.frozen || b.merging;
      };
    const pushFactor = options.pushFactor || 0.05;
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const b1 = balls[i],
          b2 = balls[j];
        if (skipCondition(b1) || skipCondition(b2)) continue;
        const dx = b2.x - b1.x,
          dy = b2.y - b1.y,
          dist = Math.sqrt(dx * dx + dy * dy),
          minDist = b1.radius + b2.radius;
        if (dist < minDist && dist > 0) {
          const ang = Math.atan2(dy, dx),
            ax = (minDist - dist) * Math.cos(ang) * pushFactor,
            ay = (minDist - dist) * Math.sin(ang) * pushFactor;
          b1.vx -= ax;
          b1.vy -= ay;
          b2.vx += ax;
          b2.vy += ay;
        }
      }
    }
  },
  lineCircleCollision(x1, y1, x2, y2, cx, cy, radius) {
    const dx = x2 - x1,
      dy = y2 - y1,
      fx = x1 - cx,
      fy = y1 - cy;
    const a = dx * dx + dy * dy,
      b = 2 * (fx * dx + fy * dy),
      c = fx * fx + fy * fy - radius * radius;
    let disc = b * b - 4 * a * c;
    if (disc < 0) return { collides: false };
    disc = Math.sqrt(disc);
    const t1 = (-b - disc) / (2 * a),
      t2 = (-b + disc) / (2 * a);
    if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) {
      const t = Math.max(0, Math.min(1, -b / (2 * a)));
      const closestX = x1 + t * dx,
        closestY = y1 + t * dy;
      const distX = cx - closestX,
        distY = cy - closestY,
        dist = Math.sqrt(distX * distX + distY * distY);
      if (dist < radius) {
        const pushDist = radius - dist;
        return { collides: true, newX: cx + (distX / dist) * pushDist, newY: cy + (distY / dist) * pushDist };
      }
    }
    return { collides: false };
  },
};

const Renderer = {
  drawImage(img, x, y, w, h, opacity, rotation) {
    if (!Assets.isImageReady(img)) return false;
    if (opacity === undefined) opacity = 1;
    if (rotation === undefined) rotation = 0;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(rotation);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  },
  drawBall(ball, opacity, rotation) {
    this.drawBallWithSquash(ball, opacity, rotation, 1, 1);
  },
  drawBallWithSquash(ball, opacity, rotation, squashX, squashY) {
    if (opacity === undefined) opacity = 1;
    if (rotation === undefined) rotation = 0;
    if (squashX === undefined) squashX = 1;
    if (squashY === undefined) squashY = 1;
    const img = Assets.getBallImage(ball.ballImage);
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(ball.x, ball.y);
    ctx.rotate(rotation);
    ctx.scale(squashX, squashY);
    if (Assets.isImageReady(img)) {
      ctx.drawImage(img, -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#333";
      ctx.fill();
    }
    ctx.restore();
  },
  drawPerson(x, y, height, imageIndex, opacity, rotation) {
    if (opacity === undefined) opacity = 1;
    if (rotation === undefined) rotation = 0;
    const img = Assets.getPersonImage(imageIndex);
    if (Assets.isImageReady(img)) {
      const aspectRatio = img.naturalWidth / img.naturalHeight,
        width = height * aspectRatio;
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.drawImage(img, -width / 2, -height, width, height);
      ctx.restore();
    }
  },
  drawStarburst(x, y, innerRadius, outerRadius, points, color) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = ((Math.PI * 2) / (points * 2)) * i - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      if (i === 0) ctx.moveTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      else ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  },
  createRadialGradient(x, y, r1, r2, stops) {
    const gradient = ctx.createRadialGradient(x, y, r1, x, y, r2);
    stops.forEach(function (s) {
      gradient.addColorStop(s[0], s[1]);
    });
    return gradient;
  },
};

class ParticleSystem {
  constructor() {
    this.particles = [];
  }
  add(particle) {
    this.particles.push({
      life: 30,
      maxLife: 30,
      gravity: 0,
      spin: 0,
      rotation: 0,
      x: particle.x,
      y: particle.y,
      vx: particle.vx || 0,
      vy: particle.vy || 0,
      size: particle.size,
      type: particle.type,
      starIndex: particle.starIndex,
      ballImage: particle.ballImage,
      radius: particle.radius,
      text: particle.text,
      big: particle.big,
      life: particle.life || 30,
      maxLife: particle.maxLife || particle.life || 30,
      gravity: particle.gravity || 0,
      spin: particle.spin || 0,
      rotation: particle.rotation || 0,
    });
  }
  addBurst(x, y, count, config) {
    if (!config) config = {};
    const speed = config.speed || 4,
      speedVariance = config.speedVariance || 2,
      life = config.life || 30;
    const size = config.size || 15,
      sizeVariance = config.sizeVariance || 10,
      gravity = config.gravity || 0.1,
      type = config.type || "star";
    for (let i = 0; i < count; i++) {
      const angle = ((Math.PI * 2) / count) * i + Math.random() * 0.3;
      const particleSpeed = speed + Math.random() * speedVariance;
      this.add({
        x: x,
        y: y,
        vx: Math.cos(angle) * particleSpeed,
        vy: Math.sin(angle) * particleSpeed,
        life: life,
        maxLife: life,
        size: size + Math.random() * sizeVariance,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
        gravity: gravity,
        type: type,
        starIndex: Math.floor(Math.random() * 3),
      });
    }
  }
  update() {
    this.particles = this.particles.filter(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity || 0;
      p.life--;
      p.rotation = (p.rotation || 0) + (p.spin || 0);
      return p.life > 0;
    });
  }
  draw(customDrawer) {
    const self = this;
    this.particles.forEach(function (p) {
      const alpha = p.life / (p.maxLife || 30);
      if (customDrawer) {
        customDrawer(p, alpha);
        return;
      }
      if (p.type === "star" && p.starIndex !== undefined) {
        const img = Assets.getStarImage(p.starIndex);
        Renderer.drawImage(img, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size, alpha, p.rotation);
      } else if (p.type === "heart") {
        Renderer.drawImage(Assets.special.heart, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size, alpha, p.rotation);
      } else if (p.type === "ko") {
        Renderer.drawImage(Assets.special.ko, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size, alpha, p.rotation);
      } else if (p.ballImage) {
        const img = Assets.getBallImage(p.ballImage);
        if (Assets.isImageReady(img)) {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.drawImage(img, -p.radius, -p.radius, p.radius * 2, p.radius * 2);
          ctx.restore();
        }
      }
    });
  }
  clear() {
    this.particles = [];
  }
}

class BaseGame {
  constructor() {
    this.balls = [];
    this.state = {};
    this.particles = new ParticleSystem();
  }
  init() {
    this.balls = [];
    this.state = {};
    this.particles.clear();
  }
  update() {
    this.particles.update();
  }
  draw() {
    this.particles.draw();
  }
  onPointerDown(x, y) {}
  onPointerMove(x, y) {}
  onPointerUp() {}
  createBall(options) {
    if (!options) options = {};
    return {
      x: options.x !== undefined ? options.x : Math.random() * canvas.width,
      y: options.y !== undefined ? options.y : Math.random() * canvas.height,
      vx: options.vx || 0,
      vy: options.vy || 0,
      radius: options.radius || 30,
      ballImage: options.ballImage || ImageCounter.nextBall(),
      rotation: options.rotation || 0,
      squashX: 1,
      squashY: 1,
      ...options,
    };
  }
  updateBallPhysics(ball, options) {
    if (!options) options = {};
    const gravity = options.gravity || 0,
      friction = options.friction || 0.99;
    const minSpeed = options.minSpeed || 0,
      bounce = options.bounce || 0.9,
      squashRecovery = options.squashRecovery || 0.15;
    ball.vy += gravity;
    ball.vx *= friction;
    ball.vy *= friction;
    if (minSpeed > 0) {
      const speed = Physics.getSpeed(ball);
      if (speed < minSpeed && speed > 0) {
        const angle = Math.atan2(ball.vy, ball.vx);
        ball.vx = Math.cos(angle) * minSpeed;
        ball.vy = Math.sin(angle) * minSpeed;
      }
    }
    ball.x += ball.vx;
    ball.y += ball.vy;
    Physics.capSpeed(ball);
    if (ball.squashX !== undefined) {
      ball.squashX += (1 - ball.squashX) * squashRecovery;
      ball.squashY += (1 - ball.squashY) * squashRecovery;
    }
    if (ball.rotation !== undefined) {
      const speed = Physics.getSpeed(ball);
      ball.rotation += speed * 0.02;
    }
    Physics.handleWallCollision(ball, canvas, bounce);
  }
}

class PopGame extends BaseGame {
  init() {
    super.init();
    const baseRadius = Config.isMobile ? 50 : 90,
      radiusVariance = Config.isMobile ? 20 : 30;
    for (let i = 0; i < 20; i++) {
      const a = Math.random() * Math.PI * 2,
        s = 0.8 + Math.random() * 0.8;
      this.balls.push(
        this.createBall({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          radius: baseRadius + Math.random() * radiusVariance,
          popping: false,
          popProgress: 0,
          opacity: 1,
        }),
      );
    }
  }
  update() {
    super.update();
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      if (ball.popping) {
        ball.popProgress += 0.12;
        ball.opacity = 1 - ball.popProgress;
        if (ball.popProgress >= 1) this.balls.splice(i, 1);
        continue;
      }
      this.updateBallPhysics(ball, { friction: 0.98, minSpeed: 0.5, bounce: 0.9 });
    }
    Physics.handleBallCollisions(this.balls);
  }
  draw() {
    this.particles.draw(function (p, alpha) {
      const img = Assets.getBallImage(p.ballImage);
      if (Assets.isImageReady(img)) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });
    this.balls.forEach(function (ball) {
      ctx.save();
      ctx.globalAlpha = ball.opacity;
      if (ball.popping) {
        const sc = 1 + ball.popProgress * 0.8;
        ctx.translate(ball.x, ball.y);
        ctx.scale(sc, sc);
        ctx.rotate(ball.popProgress * 0.5);
        ctx.translate(-ball.x, -ball.y);
      }
      Renderer.drawBall(ball, 1, ball.rotation);
      ctx.restore();
    });
  }
  onPointerDown(x, y) {
    const self = this;
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      if (!ball.popping && Physics.contains(ball, x, y)) {
        ball.popping = true;
        ScreenShake.add(ball.radius * 0.08);
        const nP = Math.floor(ball.radius * 0.25);
        for (let j = 0; j < nP; j++) {
          const a = Math.random() * Math.PI * 2,
            sp = 3 + Math.random() * 5;
          this.particles.add({
            x: ball.x,
            y: ball.y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp - 2,
            size: 8 + Math.random() * 15,
            life: 40,
            maxLife: 40,
            rotation: Math.random() * Math.PI,
            spin: (Math.random() - 0.5) * 0.2,
            gravity: 0.15,
            ballImage: ball.ballImage,
          });
        }
        if (ball.radius > 25) {
          const cR = ball.radius * 0.55,
            nC = 2 + Math.floor(Math.random() * 2);
          for (let j = 0; j < nC; j++) {
            const a = ((Math.PI * 2) / nC) * j + Math.random() * 0.5,
              sp = 4 + Math.random() * 4;
            this.balls.push(
              this.createBall({
                x: ball.x,
                y: ball.y,
                vx: Math.cos(a) * sp,
                vy: Math.sin(a) * sp,
                radius: cR,
                popping: false,
                popProgress: 0,
                opacity: 1,
              }),
            );
          }
        }
        break;
      }
    }
  }
}

class BounceGame extends BaseGame {
  init() {
    super.init();
    const targetRadius = Config.isMobile ? 30 : 50;
    const maxLineLength = Config.isMobile ? 120 : 200;
    this.state = {
      barriers: [],
      drawing: false,
      drawStart: null,
      drawEnd: null,
      maxBarriers: 3,
      maxLineLength: maxLineLength,
      barrierLifetime: 8000,
      splats: [],
      score: 0,
      target: { x: canvas.width / 2, y: canvas.height / 2, radius: targetRadius, pulse: 0, rotation: 0 },
    };
    this.isFirstBall = true;
    this.spawnBall();
  }

  spawnBall(animated) {
    const ballRadius = Config.isMobile ? 20 : 30;

    let spawnX;
    if (this.isFirstBall) {
      spawnX = this.state.target.x;
      this.isFirstBall = false;
    } else {
      spawnX = 100 + Math.random() * (canvas.width - 200);
    }

    this.balls.push(
      this.createBall({
        x: spawnX,
        y: 100,
        vx: (Math.random() - 0.5) * 2,
        vy: 1,
        radius: ballRadius,
        growScale: 1,
        squishX: 1,
        squishY: 1,
        squishRecovery: 0.15,
        dying: false,
        deathProgress: 0,
      }),
    );
  }

  update() {
    super.update();
    const s = this.state;
    s.barriers = s.barriers.filter((b) => Date.now() - b.created < s.barrierLifetime);
    s.splats = s.splats.filter((sp) => sp.life > 0);
    s.splats.forEach((sp) => sp.life--);
    s.target.pulse += 0.08;
    s.target.rotation += 0.02;

    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      if (ball.dying) {
        ball.deathProgress += 0.08;
        if (ball.deathProgress >= 1) {
          this.balls.splice(i, 1);
          setTimeout(() => this.spawnBall(), 500);
        }
        continue;
      }
      ball.vy += 0.08;
      ball.vx *= 0.995;
      ball.vy *= 0.995;
      ball.x += ball.vx;
      ball.y += ball.vy;
      ball.squishX += (1 - ball.squishX) * ball.squishRecovery;
      ball.squishY += (1 - ball.squishY) * ball.squishRecovery;
      Physics.capSpeed(ball);

      const dx = ball.x - s.target.x,
        dy = ball.y - s.target.y,
        dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ball.radius * ball.growScale + s.target.radius) {
        s.score++;
        ball.growScale += 0.15;
        ScreenShake.add(12);
        this.particles.addBurst(s.target.x, s.target.y, 12, {
          speed: 4,
          speedVariance: 4,
          life: 50,
          size: 30,
          sizeVariance: 25,
          gravity: 0.12,
          type: "star",
        });
        s.target.x = 150 + Math.random() * (canvas.width - 300);
        s.target.y = 250 + Math.random() * (canvas.height - 400);
        const ang = Math.atan2(dy, dx);
        ball.vx = Math.cos(ang) * 5;
        ball.vy = Math.sin(ang) * 5;
      }

      if (ball.y + ball.radius * ball.growScale >= canvas.height - 5 && !ball.dying) {
        ball.dying = true;
        ball.deathProgress = 0;
        ScreenShake.add(5);
        s.splats.push({
          x: ball.x,
          y: canvas.height,
          radius: ball.radius * ball.growScale,
          life: 120,
          color: `hsl(${Math.random() * 360}, 60%, 50%)`,
        });
        continue;
      }

      if (ball.x - ball.radius * ball.growScale < 0) {
        ball.x = ball.radius * ball.growScale;
        ball.vx *= -0.9;
        ball.squishX = 0.7;
        ball.squishY = 1.3;
      }
      if (ball.x + ball.radius * ball.growScale > canvas.width) {
        ball.x = canvas.width - ball.radius * ball.growScale;
        ball.vx *= -0.9;
        ball.squishX = 0.7;
        ball.squishY = 1.3;
      }
      if (ball.y - ball.radius * ball.growScale < 0) {
        ball.y = ball.radius * ball.growScale;
        ball.vy *= -0.9;
        ball.squishX = 1.4;
        ball.squishY = 0.6;
      }

      s.barriers.forEach((barrier) => {
        const result = Physics.lineCircleCollision(barrier.x1, barrier.y1, barrier.x2, barrier.y2, ball.x, ball.y, ball.radius * ball.growScale);
        if (result.collides) {
          ball.x = result.newX;
          ball.y = result.newY;
          const ang = Math.atan2(barrier.y2 - barrier.y1, barrier.x2 - barrier.x1),
            nAng = ang + Math.PI / 2,
            dot = ball.vx * Math.cos(nAng) + ball.vy * Math.sin(nAng);
          ball.vx -= 2 * dot * Math.cos(nAng) * 1.1;
          ball.vy -= 2 * dot * Math.sin(nAng) * 1.1;
          ball.squishX = 0.75;
          ball.squishY = 1.25;
          Physics.capSpeed(ball);
        }
      });
    }
  }

  draw() {
    const s = this.state,
      t = s.target,
      pulseScale = 1 + Math.sin(t.pulse) * 0.15;
    const glowGrad = Renderer.createRadialGradient(t.x, t.y, t.radius * 0.3, t.radius * 2.5, [
      [0, "rgba(255, 220, 100, 0.6)"],
      [1, "rgba(255, 180, 50, 0)"],
    ]);
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.radius * 2.5 * pulseScale, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();
    const size = t.radius * 2.5 * pulseScale,
      starImg = Assets.stars[0];
    if (Assets.isImageReady(starImg)) {
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(t.rotation);
      ctx.drawImage(starImg, -size / 2, -size / 2, size, size);
      ctx.restore();
    }
    super.draw();
    s.splats.forEach((splat) => {
      const a = splat.life / 120,
        sq = 1 + (1 - a) * 2;
      ctx.save();
      ctx.globalAlpha = a * 0.6;
      ctx.translate(splat.x, splat.y);
      ctx.scale(sq, 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, splat.radius, 0, Math.PI * 2);
      ctx.fillStyle = splat.color;
      ctx.fill();
      ctx.restore();
    });
    this.balls.forEach((ball) => {
      const img = Assets.getBallImage(ball.ballImage),
        r = ball.radius * ball.growScale;
      if (Assets.isImageReady(img)) {
        if (ball.dying) {
          ctx.save();
          const sqY = 1 - ball.deathProgress * 0.8,
            sqX = 1 + ball.deathProgress * 0.5;
          ctx.translate(ball.x, canvas.height);
          ctx.scale(sqX, sqY);
          ctx.globalAlpha = 1 - ball.deathProgress;
          ctx.drawImage(img, -r, -r * 2, r * 2, r * 2);
          ctx.restore();
        } else {
          ctx.save();
          ctx.translate(ball.x, ball.y);
          ctx.scale(ball.squishX, ball.squishY);
          ctx.drawImage(img, -r, -r, r * 2, r * 2);
          ctx.restore();
        }
      }
    });
    s.barriers.forEach((barrier) => {
      const age = Date.now() - barrier.created,
        op = Math.max(0, 1 - age / s.barrierLifetime);
      ctx.save();
      ctx.shadowColor = "rgba(100, 180, 255, 0.8)";
      ctx.shadowBlur = 15 * op;
      ctx.beginPath();
      ctx.moveTo(barrier.x1, barrier.y1);
      ctx.lineTo(barrier.x2, barrier.y2);
      ctx.strokeStyle = `rgba(80, 150, 220, ${op})`;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(barrier.x1, barrier.y1);
      ctx.lineTo(barrier.x2, barrier.y2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${op * 0.9})`;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();
    });
    if (s.drawing && s.drawStart) {
      let dx = s.drawEnd.x - s.drawStart.x,
        dy = s.drawEnd.y - s.drawStart.y,
        len = Math.sqrt(dx * dx + dy * dy);
      if (len > s.maxLineLength) {
        dx = (dx / len) * s.maxLineLength;
        dy = (dy / len) * s.maxLineLength;
      }
      const endX = s.drawStart.x + dx,
        endY = s.drawStart.y + dy;
      ctx.save();
      ctx.shadowColor = "rgba(100, 180, 255, 0.5)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(s.drawStart.x, s.drawStart.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = len > s.maxLineLength ? "rgba(255, 100, 100, 0.5)" : "rgba(80, 150, 220, 0.5)";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();
    }
  }

  onPointerDown(x, y) {
    if (this.state.barriers.length >= this.state.maxBarriers) return;
    this.state.drawing = true;
    this.state.drawStart = { x, y };
    this.state.drawEnd = { x, y };
  }
  onPointerMove(x, y) {
    if (this.state.drawing) this.state.drawEnd = { x, y };
  }
  onPointerUp() {
    const s = this.state;
    if (s.drawing && s.drawStart && s.drawEnd) {
      let dx = s.drawEnd.x - s.drawStart.x,
        dy = s.drawEnd.y - s.drawStart.y,
        len = Math.sqrt(dx * dx + dy * dy);
      if (len > 20) {
        if (len > s.maxLineLength) {
          dx = (dx / len) * s.maxLineLength;
          dy = (dy / len) * s.maxLineLength;
        }
        s.barriers.push({ x1: s.drawStart.x, y1: s.drawStart.y, x2: s.drawStart.x + dx, y2: s.drawStart.y + dy, created: Date.now() });
      }
    }
    s.drawing = false;
    s.drawStart = null;
    s.drawEnd = null;
  }
}

class ConnectionsGame extends BaseGame {
  init() {
    super.init();
    const baseRadius = Config.isMobile ? 35 : 45;
    const personHeight = Config.isMobile ? 65 : 80;
    this.state = {
      connections: [],
      firstEntity: null,
      hoveredEntity: null,
      score: 0,
      exploded: 0,
      dyingEntities: [],
      isDragging: false,
      dragStart: null,
      dragEnd: null,
      celebrationRings: [],
    };
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2,
        s = 1.5 + Math.random() * 1.5;
      this.balls.push(
        this.createBall({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          radius: baseRadius + Math.random() * 15,
          type: "ball",
          rotationSpeed: (Math.random() - 0.5) * 0.03,
          scale: 1,
          targetScale: 1,
          currentScale: 1,
          wigglePhase: Math.random() * Math.PI * 2,
          wiggleAmount: 0,
          targetWiggle: 0,
          bounceAnim: 0,
          shakeAnim: 0,
          shakeIntensity: 0,
        }),
      );
    }
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2,
        s = 1 + Math.random();
      this.balls.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        radius: baseRadius + 10,
        clickRadius: baseRadius + 20,
        personImage: ImageCounter.nextPerson(),
        personHeight: personHeight,
        type: "person",
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        scale: 1,
        targetScale: 1,
        currentScale: 1,
        wigglePhase: Math.random() * Math.PI * 2,
        wiggleAmount: 0,
        targetWiggle: 0,
        bounceAnim: 0,
        shakeAnim: 0,
        shakeIntensity: 0,
      });
    }
  }

  getDeathState(entity) {
    for (const dying of this.state.dyingEntities) {
      if (dying.entity1 === entity || dying.entity2 === entity) return dying;
    }
    return null;
  }

  triggerCelebration(entity1, entity2) {
    entity1.bounceAnim = 1;
    entity2.bounceAnim = 1;

    const cx = (entity1.x + entity2.x) / 2;
    const cy = (entity1.y + entity2.y) / 2;
    this.state.celebrationRings.push({
      x: cx,
      y: cy,
      radius: 0,
      maxRadius: 120,
      life: 1,
      color: `hsl(${Math.random() * 60 + 30}, 100%, 60%)`,
    });

    this.particles.addBurst(cx, cy, 15, {
      speed: 6,
      speedVariance: 4,
      life: 50,
      size: 35,
      sizeVariance: 20,
      gravity: 0.08,
      type: "heart",
    });

    ScreenShake.add(6);
  }

  triggerBadMatch(entity1, entity2) {
    entity1.shakeAnim = 1;
    entity1.shakeIntensity = 8;
    entity2.shakeAnim = 1;
    entity2.shakeIntensity = 8;

    this.state.dyingEntities.push({
      entity1: entity1,
      entity2: entity2,
      phase: "shake",
      timer: 5,
    });

    ScreenShake.add(5);
  }

  explodeEntities(dying) {
    const s = this.state;
    const cx = (dying.entity1.x + dying.entity2.x) / 2;
    const cy = (dying.entity1.y + dying.entity2.y) / 2;

    ScreenShake.add(20);

    for (let j = 0; j < 5; j++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      const sp = 4 + Math.random() * 5;
      this.particles.add({
        x: cx,
        y: cy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 4,
        size: 55 + Math.random() * 35,
        life: 50,
        maxLife: 50,
        type: "ko",
        gravity: 0.12,
        spin: (Math.random() - 0.5) * 0.3,
        rotation: Math.random() * Math.PI * 2,
      });
    }

    this.particles.addBurst(cx, cy, 12, {
      speed: 8,
      speedVariance: 4,
      life: 30,
      size: 20,
      sizeVariance: 15,
      gravity: 0.15,
      type: "star",
    });

    s.connections = s.connections.filter(
      (c) => c.entity1 !== dying.entity1 && c.entity2 !== dying.entity1 && c.entity1 !== dying.entity2 && c.entity2 !== dying.entity2,
    );

    const idx1 = this.balls.indexOf(dying.entity1);
    const idx2 = this.balls.indexOf(dying.entity2);
    if (idx1 > idx2) {
      this.balls.splice(idx1, 1);
      this.balls.splice(idx2, 1);
    } else {
      this.balls.splice(idx2, 1);
      this.balls.splice(idx1, 1);
    }

    const baseRadius = Config.isMobile ? 35 : 45;
    const personHeight = Config.isMobile ? 65 : 80;
    setTimeout(() => {
      const a1 = Math.random() * Math.PI * 2;
      const a2 = Math.random() * Math.PI * 2;
      this.balls.push(
        this.createBall({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: Math.cos(a1) * 2,
          vy: Math.sin(a1) * 2,
          radius: baseRadius + Math.random() * 15,
          type: "ball",
          rotationSpeed: (Math.random() - 0.5) * 0.03,
          scale: 1,
          targetScale: 1,
          currentScale: 1,
          wigglePhase: Math.random() * Math.PI * 2,
          wiggleAmount: 0,
          targetWiggle: 0,
          bounceAnim: 0,
          shakeAnim: 0,
          shakeIntensity: 0,
        }),
      );
      this.balls.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Math.cos(a2) * 1.5,
        vy: Math.sin(a2) * 1.5,
        radius: baseRadius + 10,
        clickRadius: baseRadius + 20,
        personImage: ImageCounter.nextPerson(),
        personHeight: personHeight,
        type: "person",
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        scale: 1,
        targetScale: 1,
        currentScale: 1,
        wigglePhase: Math.random() * Math.PI * 2,
        wiggleAmount: 0,
        targetWiggle: 0,
        bounceAnim: 0,
        shakeAnim: 0,
        shakeIntensity: 0,
      });
    }, 400);
  }

  connectEntities(entity1, entity2) {
    const s = this.state;
    if (entity1.type === entity2.type) {
      s.exploded++;
      this.triggerBadMatch(entity1, entity2);
    } else {
      const existingConn = s.connections.find(
        (c) => (c.entity1 === entity1 && c.entity2 === entity2) || (c.entity2 === entity1 && c.entity1 === entity2),
      );
      if (!existingConn) {
        const dx = entity2.x - entity1.x;
        const dy = entity2.y - entity1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        s.connections.push({ entity1, entity2, restLength: Math.min(dist, 150) });
        s.score++;
        this.triggerCelebration(entity1, entity2);
      }
    }
  }

  update() {
    super.update();
    const s = this.state;

    s.celebrationRings = s.celebrationRings.filter((ring) => {
      ring.radius += 8;
      ring.life -= 0.04;
      return ring.life > 0;
    });

    s.dyingEntities = s.dyingEntities.filter((dying) => {
      dying.timer--;

      if (dying.phase === "shake") {
        dying.entity1.shakeAnim = 1;
        dying.entity2.shakeAnim = 1;
        const intensity = 6 + (1 - dying.timer / 25) * 10;
        dying.entity1.shakeIntensity = intensity;
        dying.entity2.shakeIntensity = intensity;
      }

      if (dying.timer <= 0) {
        this.explodeEntities(dying);
        return false;
      }
      return true;
    });

    s.connections.forEach((conn) => {
      const b1 = conn.entity1,
        b2 = conn.entity2;
      if (!this.balls.includes(b1) || !this.balls.includes(b2)) return;
      const dx = b2.x - b1.x,
        dy = b2.y - b1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const stretch = dist - conn.restLength;
      const force = stretch * 0.02;
      const fx = (dx / dist) * force,
        fy = (dy / dist) * force;
      b1.vx += fx;
      b1.vy += fy;
      b2.vx -= fx;
      b2.vy -= fy;
    });

    this.balls.forEach((ball) => {
      const isDying = this.getDeathState(ball);

      if (ball.bounceAnim > 0) {
        ball.bounceAnim -= 0.08;
        if (ball.bounceAnim < 0) ball.bounceAnim = 0;
      }

      if (ball.shakeAnim > 0 && !isDying) {
        ball.shakeAnim -= 0.05;
        if (ball.shakeAnim < 0) {
          ball.shakeAnim = 0;
          ball.shakeIntensity = 0;
        }
      }

      if (!isDying) {
        ball.currentScale += (ball.targetScale - ball.currentScale) * 0.12;
        ball.wiggleAmount += (ball.targetWiggle - ball.wiggleAmount) * 0.15;
        ball.rotation += ball.rotationSpeed;
        ball.wigglePhase += 0.2;
      }

      const speed = Physics.getSpeed(ball);
      if (speed < 0.3) {
        const a = Math.atan2(ball.vy, ball.vx);
        ball.vx = Math.cos(a) * 0.8;
        ball.vy = Math.sin(a) * 0.8;
      }
      ball.vx *= 0.98;
      ball.vy *= 0.98;
      ball.x += ball.vx;
      ball.y += ball.vy;
      Physics.capSpeed(ball);
      Physics.handleWallCollision(ball, canvas, 0.8, false);
    });

    Physics.handleBallCollisions(this.balls);
  }

  draw() {
    const s = this.state;
    super.draw();

    s.connections.forEach((conn) => {
      if (!this.balls.includes(conn.entity1) || !this.balls.includes(conn.entity2)) return;
      ctx.beginPath();
      ctx.moveTo(conn.entity1.x, conn.entity1.y);
      ctx.lineTo(conn.entity2.x, conn.entity2.y);
      ctx.strokeStyle = "rgba(100, 200, 100, 0.6)";
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    s.celebrationRings.forEach((ring) => {
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.strokeStyle = ring.color.replace(")", `, ${ring.life})`).replace("hsl", "hsla");
      ctx.lineWidth = 6 * ring.life;
      ctx.stroke();
    });

    if (s.isDragging && s.dragStart && s.dragEnd) {
      ctx.beginPath();
      ctx.moveTo(s.dragStart.x, s.dragStart.y);
      ctx.lineTo(s.dragEnd.x, s.dragEnd.y);
      ctx.strokeStyle = "rgba(150, 200, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    this.balls.forEach((entity) => {
      const isSel = s.firstEntity === entity;
      const deathState = this.getDeathState(entity);

      ctx.save();

      let offsetX = 0,
        offsetY = 0;
      if (entity.shakeAnim > 0) {
        offsetX = (Math.random() - 0.5) * entity.shakeIntensity;
        offsetY = (Math.random() - 0.5) * entity.shakeIntensity;
      }

      let bounceScale = 1;
      if (entity.bounceAnim > 0) {
        const t = entity.bounceAnim;
        bounceScale = 1 + Math.sin(t * Math.PI * 3) * 0.25 * t;
      }

      const scale = (entity.currentScale || 1) * bounceScale;
      const wiggle = entity.wiggleAmount * Math.sin(entity.wigglePhase) * 0.04;

      ctx.translate(entity.x + offsetX, entity.y + offsetY);
      ctx.scale(scale + wiggle, scale - wiggle);
      ctx.translate(-entity.x, -entity.y);

      if (deathState && deathState.phase === "shake") {
        const pulse = Math.sin(deathState.timer * 0.8) * 0.5 + 0.5;
        ctx.shadowColor = `rgba(255, 0, 0, ${0.8 + pulse * 0.2})`;
        ctx.shadowBlur = 15 + pulse * 10;

        ctx.beginPath();
        ctx.arc(entity.x, entity.y, (entity.clickRadius || entity.radius) + 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 50, 50, ${0.6 + pulse * 0.4})`;
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      if ((isSel || entity.targetScale > 1) && !deathState) {
        ctx.shadowColor = "rgba(100, 200, 255, 0.8)";
        ctx.shadowBlur = 20;
      }

      if (entity.bounceAnim > 0.3) {
        ctx.shadowColor = "rgba(255, 220, 100, 0.9)";
        ctx.shadowBlur = 25;
      }

      if (entity.type === "person") {
        const height = entity.personHeight || (Config.isMobile ? 65 : 80);
        Renderer.drawPerson(entity.x, entity.y + 15, height, entity.personImage);
      } else {
        Renderer.drawBall(entity);
      }

      ctx.restore();
    });
  }

  findEntityAt(x, y) {
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const entity = this.balls[i];
      if (this.getDeathState(entity)) continue;
      const clickR = entity.clickRadius || entity.radius;
      const dx = x - entity.x,
        dy = y - entity.y;
      if (Math.sqrt(dx * dx + dy * dy) < clickR + 10) {
        return entity;
      }
    }
    return null;
  }

  onPointerMove(x, y) {
    const s = this.state;

    if (s.isDragging && s.firstEntity) {
      s.dragEnd = { x, y };
      s.dragStart = { x: s.firstEntity.x, y: s.firstEntity.y };
    }

    this.balls.forEach((entity) => {
      if (s.firstEntity !== entity) {
        entity.targetScale = 1;
        entity.targetWiggle = 0;
      }
    });
    s.hoveredEntity = null;

    const entity = this.findEntityAt(x, y);
    if (entity) {
      s.hoveredEntity = entity;
      entity.targetScale = 1.15;
      entity.targetWiggle = 1;
    }
  }

  onPointerDown(x, y) {
    const s = this.state;
    const entity = this.findEntityAt(x, y);

    if (entity) {
      if (!s.firstEntity) {
        s.firstEntity = entity;
        entity.targetScale = 1.2;
        entity.targetWiggle = 1;
        s.isDragging = true;
        s.dragStart = { x: entity.x, y: entity.y };
        s.dragEnd = { x, y };
      } else if (s.firstEntity !== entity) {
        this.connectEntities(s.firstEntity, entity);
        s.firstEntity.targetScale = 1;
        s.firstEntity.targetWiggle = 0;
        s.firstEntity = null;
        s.isDragging = false;
        s.dragStart = null;
        s.dragEnd = null;
      }
    } else {
      if (s.firstEntity) {
        s.firstEntity.targetScale = 1;
        s.firstEntity.targetWiggle = 0;
      }
      s.firstEntity = null;
      s.isDragging = false;
      s.dragStart = null;
      s.dragEnd = null;
    }
  }

  onPointerUp() {
    const s = this.state;
    if (s.isDragging && s.dragEnd && s.firstEntity) {
      const entity = this.findEntityAt(s.dragEnd.x, s.dragEnd.y);
      if (entity && entity !== s.firstEntity) {
        this.connectEntities(s.firstEntity, entity);
        s.firstEntity.targetScale = 1;
        s.firstEntity.targetWiggle = 0;
        s.firstEntity = null;
      }
    }
    s.isDragging = false;
    s.dragStart = null;
    s.dragEnd = null;
  }
}

class BrushGame extends BaseGame {
  init() {
    super.init();
    this.state = { paths: [], drawing: false, currentPath: [], currentColor: null };
    this.colors = ["#64B5F6", "#81C784", "#FFB74D", "#F06292", "#BA68C8", "#4DD0E1"];
    for (let i = 0; i < 20; i++)
      this.balls.push(
        this.createBall({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          radius: 30 + Math.random() * 15,
          followingPath: null,
          pathProgress: 0,
          pathDirection: 1,
          driftAngle: Math.random() * Math.PI * 2,
          pathSpeed: 0.003 + Math.random() * 0.001,
          speedPhase: Math.random() * Math.PI * 2,
        }),
      );
  }
  update() {
    super.update();
    const self = this;
    this.state.paths = this.state.paths.filter(function (path) {
      return Date.now() - path.created < 12000;
    });
    this.balls.forEach(function (ball) {
      if (ball.followingPath && ball.followingPath.points) {
        const path = ball.followingPath;
        if (!self.state.paths.includes(path)) {
          ball.followingPath = null;
          ball.pathProgress = 0;
          return;
        }
        ball.speedPhase += 0.05;
        const oscillation = Math.sin(ball.speedPhase) * 0.003,
          totalPoints = path.isLoop ? path.points.length : path.points.length - 1;
        const dynamicSpeed = ball.pathSpeed + oscillation;
        ball.pathProgress += dynamicSpeed * ball.pathDirection;
        if (path.isLoop) {
          if (ball.pathProgress >= 1) ball.pathProgress -= 1;
          else if (ball.pathProgress < 0) ball.pathProgress += 1;
        } else {
          if (ball.pathProgress >= 1) {
            ball.pathProgress = 1;
            ball.pathDirection = -1;
          } else if (ball.pathProgress <= 0) {
            ball.pathProgress = 0;
            ball.pathDirection = 1;
          }
        }
        const idx = Math.floor(ball.pathProgress * totalPoints),
          clampedIdx = Math.max(0, Math.min(path.points.length - 1, idx));
        const nextIdx = path.isLoop ? (clampedIdx + 1) % path.points.length : Math.min(clampedIdx + 1, path.points.length - 1);
        const t = ball.pathProgress * totalPoints - idx;
        ball.x = path.points[clampedIdx].x + (path.points[nextIdx].x - path.points[clampedIdx].x) * t;
        ball.y = path.points[clampedIdx].y + (path.points[nextIdx].y - path.points[clampedIdx].y) * t;
        ball.rotation += (ball.pathDirection > 0 ? 1 : -1) * dynamicSpeed * 8;
      } else {
        for (let p = 0; p < self.state.paths.length; p++) {
          const path = self.state.paths[p];
          if (path.points.length < 2) continue;
          for (let i = 0; i < path.points.length; i++) {
            const pt = path.points[i],
              dist = Physics.distance(ball.x, ball.y, pt.x, pt.y);
            if (dist < ball.radius + 20) {
              ball.followingPath = path;
              ball.pathProgress = i / (path.points.length - 1);
              ball.pathDirection = 1;
              ball.speedPhase = Math.random() * Math.PI * 2;
              break;
            }
          }
          if (ball.followingPath) break;
        }
        if (!ball.followingPath) {
          ball.driftAngle += (Math.random() - 0.5) * 0.02;
          ball.vx += Math.cos(ball.driftAngle) * 0.003;
          ball.vy += Math.sin(ball.driftAngle) * 0.003;
          const speed = Physics.getSpeed(ball);
          if (speed > 0.2) {
            ball.vx *= 0.2 / speed;
            ball.vy *= 0.2 / speed;
          }
          ball.rotation += 0.002;
        }
        ball.vx *= 0.99;
        ball.vy *= 0.99;
        ball.x += ball.vx;
        ball.y += ball.vy;
        Physics.capSpeed(ball);
        if (ball.x - ball.radius < 0) {
          ball.x = ball.radius;
          ball.vx *= -0.8;
          ball.driftAngle = Math.PI - ball.driftAngle;
        }
        if (ball.x + ball.radius > canvas.width) {
          ball.x = canvas.width - ball.radius;
          ball.vx *= -0.8;
          ball.driftAngle = Math.PI - ball.driftAngle;
        }
        if (ball.y - ball.radius < 0) {
          ball.y = ball.radius;
          ball.vy *= -0.8;
          ball.driftAngle = -ball.driftAngle;
        }
        if (ball.y + ball.radius > canvas.height) {
          ball.y = canvas.height - ball.radius;
          ball.vy *= -0.8;
          ball.driftAngle = -ball.driftAngle;
        }
      }
    });
    Physics.handleBallCollisions(this.balls);
  }
  catmullRomPoint(p0, p1, p2, p3, t) {
    const t2 = t * t,
      t3 = t2 * t;
    return {
      x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    };
  }
  drawSmoothPath(points, opacity, color) {
    if (points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity * 0.6;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    if (points.length === 2) {
      ctx.lineTo(points[1].x, points[1].y);
    } else {
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)],
          p1 = points[i],
          p2 = points[Math.min(points.length - 1, i + 1)],
          p3 = points[Math.min(points.length - 1, i + 2)];
        const segments = 10;
        for (let j = 1; j <= segments; j++) {
          const t = j / segments,
            pt = this.catmullRomPoint(p0, p1, p2, p3, t);
          ctx.lineTo(pt.x, pt.y);
        }
      }
    }
    ctx.stroke();
    ctx.restore();
  }
  draw() {
    const self = this;
    this.state.paths.forEach(function (path) {
      if (path.points.length < 1) return;
      const age = Date.now() - path.created,
        op = Math.max(0, 1 - age / 12000);
      if (path.points.length === 1) {
        ctx.beginPath();
        ctx.arc(path.points[0].x, path.points[0].y, 6, 0, Math.PI * 2);
        ctx.fillStyle = path.color;
        ctx.globalAlpha = op * 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        self.drawSmoothPath(path.points, op, path.color);
      }
    });
    if (this.state.drawing && this.state.currentPath.length >= 1) {
      ctx.save();
      if (this.state.currentPath.length === 1) {
        ctx.beginPath();
        ctx.arc(this.state.currentPath[0].x, this.state.currentPath[0].y, 6, 0, Math.PI * 2);
        ctx.fillStyle = this.state.currentColor;
        ctx.globalAlpha = 0.9;
        ctx.fill();
      } else {
        this.drawSmoothPath(this.state.currentPath, 1.5, this.state.currentColor);
      }
      ctx.restore();
    }
    this.balls.forEach(function (ball) {
      Renderer.drawBall(ball, 1, ball.rotation);
    });
    super.draw();
  }
  onPointerDown(x, y) {
    this.state.drawing = true;
    this.state.currentPath = [{ x: x, y: y }];
    const availableColors = this.colors.filter((c) => c !== this.state.currentColor);
    this.state.currentColor = availableColors[Math.floor(Math.random() * availableColors.length)];
  }
  onPointerMove(x, y) {
    if (this.state.drawing) {
      const lastPt = this.state.currentPath[this.state.currentPath.length - 1];
      if (Math.abs(x - lastPt.x) > 5 || Math.abs(y - lastPt.y) > 5) this.state.currentPath.push({ x: x, y: y });
    }
  }
  onPointerUp() {
    if (this.state.drawing && this.state.currentPath.length >= 1) {
      const startPt = this.state.currentPath[0],
        endPt = this.state.currentPath[this.state.currentPath.length - 1];
      const dist = this.state.currentPath.length > 1 ? Physics.distance(startPt.x, startPt.y, endPt.x, endPt.y) : 0,
        isLoop = this.state.currentPath.length > 3 && dist < 50;
      this.state.paths.push({ points: this.state.currentPath.slice(), created: Date.now(), isLoop: isLoop, color: this.state.currentColor });
    }
    this.state.drawing = false;
    this.state.currentPath = [];
  }
}

const GameManager = {
  games: {
    1: { name: "Connect", class: ConnectionsGame },
    2: { name: "Pop", class: PopGame },
    3: { name: "Brush", class: BrushGame },
    4: { name: "Bounce", class: BounceGame },
  },
  currentGameNum: 1,
  currentGame: null,
  shiftPressed: false,
  init: function () {
    this.switchGame(1);
  },
  switchGame: function (gameNum) {
    if (gameNum < 1 || gameNum > 4) return;
    this.currentGameNum = gameNum;
    ScreenShake.reset();
    document.querySelectorAll(".nav-item").forEach(function (item) {
      item.classList.remove("active");
      if (parseInt(item.dataset.game) === gameNum) item.classList.add("active");
    });
    const GameClass = this.games[gameNum].class;
    this.currentGame = new GameClass();
    this.currentGame.init();
  },
  update: function () {
    if (this.currentGame) this.currentGame.update();
  },
  draw: function () {
    if (this.currentGame) this.currentGame.draw();
  },
  onPointerDown: function (x, y) {
    if (this.currentGame && this.currentGame.onPointerDown) this.currentGame.onPointerDown(x, y);
  },
  onPointerMove: function (x, y) {
    if (this.currentGame && this.currentGame.onPointerMove) this.currentGame.onPointerMove(x, y);
  },
  onPointerUp: function () {
    if (this.currentGame && this.currentGame.onPointerUp) this.currentGame.onPointerUp();
  },
};

const Input = {
  mouseX: 0,
  mouseY: 0,
  isMouseDown: false,
  init: function () {
    this.setupMouseEvents();
    this.setupTouchEvents();
    this.setupKeyboardEvents();
    this.setupNavigation();
    this.setupResize();
  },
  getPointer: function (e) {
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX, y: touch.clientY };
  },
  setupMouseEvents: function () {
    const self = this;
    canvas.addEventListener("mousedown", function (e) {
      e.preventDefault();
      self.isMouseDown = true;
      const p = self.getPointer(e);
      GameManager.onPointerDown(p.x, p.y);
    });
    canvas.addEventListener("mousemove", function (e) {
      const p = self.getPointer(e);
      self.mouseX = p.x;
      self.mouseY = p.y;
      GameManager.onPointerMove(p.x, p.y);
    });
    canvas.addEventListener("mouseup", function (e) {
      e.preventDefault();
      self.isMouseDown = false;
      GameManager.onPointerUp();
    });
    canvas.addEventListener("mouseleave", function () {
      if (self.isMouseDown) GameManager.onPointerUp();
    });
    window.addEventListener("mouseup", function () {
      if (self.isMouseDown) {
        self.isMouseDown = false;
        GameManager.onPointerUp();
      }
    });
    window.addEventListener("blur", function () {
      if (self.isMouseDown) {
        self.isMouseDown = false;
        GameManager.onPointerUp();
      }
    });
  },
  setupTouchEvents: function () {
    const self = this;
    canvas.addEventListener("touchstart", function (e) {
      e.preventDefault();
      const p = self.getPointer(e);
      GameManager.onPointerDown(p.x, p.y);
    });
    canvas.addEventListener("touchmove", function (e) {
      e.preventDefault();
      const p = self.getPointer(e);
      self.mouseX = p.x;
      self.mouseY = p.y;
      GameManager.onPointerMove(p.x, p.y);
    });
    canvas.addEventListener("touchend", function (e) {
      e.preventDefault();
      GameManager.onPointerUp();
    });
  },
  setupKeyboardEvents: function () {
    document.addEventListener("keydown", function (e) {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 4) GameManager.switchGame(num);
      if (e.key === "Shift") {
        GameManager.shiftPressed = true;
        if (GameManager.currentGame && GameManager.currentGame.state && GameManager.currentGame.state.shiftPressed !== undefined)
          GameManager.currentGame.state.shiftPressed = true;
      }
    });
    document.addEventListener("keyup", function (e) {
      if (e.key === "Shift") {
        GameManager.shiftPressed = false;
        if (GameManager.currentGame && GameManager.currentGame.state && GameManager.currentGame.state.shiftPressed !== undefined)
          GameManager.currentGame.state.shiftPressed = false;
      }
    });
  },
  setupNavigation: function () {
    document.querySelectorAll(".nav-item").forEach(function (item) {
      item.addEventListener("click", function () {
        GameManager.switchGame(parseInt(item.dataset.game));
      });
    });
  },
  setupResize: function () {
    window.addEventListener("resize", function () {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  },
};

function animate() {
  ScreenShake.update();
  ctx.save();
  ctx.translate(ScreenShake.x, ScreenShake.y);
  ctx.clearRect(-10, -10, canvas.width + 20, canvas.height + 20);
  GameManager.update();
  GameManager.draw();
  ctx.restore();
  requestAnimationFrame(animate);
}

Assets.load();
Input.init();
GameManager.init();
animate();