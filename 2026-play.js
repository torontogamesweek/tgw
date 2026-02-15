      const Config = {
        MAX_SPEED: 25,
        NUM_BALL_IMAGES: 39,
        NUM_BESTBALL_IMAGES: 15,
        NUM_PEOPLE_IMAGES: 29,
        NUM_BESTPPL_IMAGES: 21,
        NUM_OTHER_IMAGES: 14,
        SCREEN_SHAKE_DECAY: 0.85,
        SCREEN_SHAKE_MAX: 5,
        SCREEN_SHAKE_MIN_THRESHOLD: 0.3,
        isMobile: "ontouchstart" in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768,

        posterBalls: [
          { x: 62.9, y: 66.69, size: 5.59, img: 1 },
          { x: 2.79, y: 78.73, size: 5.66, img: 2 },
          { x: 6.52, y: 57.48, size: 3.22, img: 3 },
          { x: 70.13, y: 3.12, size: 5.59, img: 4 },
          { x: 38.61, y: 11.73, size: 13.54, img: 5 },
          { x: 2.15, y: 51.7, size: 3.22, img: 6 },
          { x: 3.8, y: 48.82, size: 3.22, img: 7 },
          { x: 36.25, y: 42.08, size: 29.94, img: 8 },
          { x: 5.99, y: 51.75, size: 3.3, img: 9 },
          { x: 2.72, y: 90.02, size: 6.16, img: 10 },
          { x: 18.84, y: 23.38, size: 15.54, img: 11 },
          { x: 85.56, y: 0.69, size: 5.44, img: 12 },
          { x: 35.38, y: 30.05, size: 16.12, img: 13 },
          { x: 31.59, y: 67.64, size: 17.48, img: 15 },
          { x: 11.17, y: 54.55, size: 3.44, img: 16 },
          { x: 76.65, y: 5.67, size: 5.59, img: 17 },
          { x: 65.19, y: 86.85, size: 5.52, img: 18 },
          { x: 7.38, y: 24.0, size: 5.58, img: 19 },
          { x: 0.86, y: 16.71, size: 5.8, img: 20 },
          { x: 54.36, y: 87.75, size: 5.38, img: 21 },
          { x: 4.23, y: 2.43, size: 12.18, img: 22 },
          { x: 79.8, y: 2.19, size: 3.08, img: 23 },
          { x: 88.23, y: 21.64, size: 10.82, img: 24 },
          { x: 83.74, y: 4.37, size: 2.72, img: 25 },
          { x: 35.53, y: 1.05, size: 7.02, img: 26 },
          { x: 64.54, y: 12.03, size: 9.81, img: 27 },
          { x: 0.43, y: 62.28, size: 15.76, img: 28 },
          { x: 13.69, y: 86.28, size: 10.67, img: 29 },
          { x: 70.99, y: 64.4, size: 28.58, img: 30 },
          { x: 73.57, y: 42.95, size: 10.82, img: 31 },
          { x: 86.53, y: 34.67, size: 10.6, img: 32 },
          { x: 23.78, y: 80.48, size: 13.47, img: 33 },
          { x: 51.36, y: 66.73, size: 14.47, img: 34 },
          { x: 59.81, y: 83.83, size: 5.59, img: 35 },
          { x: 9.46, y: 57.54, size: 3.22, img: 36 },
          { x: 92.4, y: 3.56, size: 5.52, img: 37 },
          { x: 70.49, y: 11.84, size: 22.21, img: 38 },
          { x: 7.88, y: 54.72, size: 3.18, img: 39 },
        ],

        posterPeople: [
          { x: 0, y: 0, size: 0, img: 0 },
          { x: 68.33, y: 48.51, size: 6.23, img: 1 },
          { x: 46.63, y: 78.35, size: 7.59, img: 2 },
          { x: 69.56, y: 63.4, size: 4.3, img: 3 },
          { x: 34.24, y: 91.84, size: 4.58, img: 4 },
          { x: 56.59, y: 39.25, size: 5.66, img: 5 },
          { x: 58.81, y: 18.08, size: 5.66, img: 6 },
          { x: 40.27, y: 4.3, size: 7.74, img: 7 },
          { x: 21.92, y: 61.38, size: 14.9, img: 8 },
          { x: 79.63, y: 90.93, size: 5.66, img: 9 },
          { x: 84.82, y: 90.32, size: 6.38, img: 10 },
          { x: 50.63, y: 20.23, size: 5.95, img: 11 },
          { x: 23.42, y: 12.49, size: 9.03, img: 12 },
          { x: 34.81, y: 41.83, size: 4.8, img: 13 },
          { x: 26.58, y: 37.84, size: 5.23, img: 14 },
          { x: 56.09, y: 9.23, size: 6.66, img: 15 },
          { x: 17.41, y: 5.05, size: 6.02, img: 16 },
          { x: 54.87, y: 29.42, size: 5.52, img: 17 },
          { x: 19.55, y: 59.58, size: 7.09, img: 18 },
          { x: 45.77, y: 86.59, size: 9.89, img: 19 },
          { x: 36.46, y: 24.13, size: 5.53, img: 20 },
          { x: 32.88, y: 7.8, size: 7.38, img: 21 },
          { x: 90.04, y: 88.78, size: 6.3, img: 22 },
          { x: 75.5, y: 34.85, size: 5.52, img: 23 },
          { x: 74.02, y: 89.27, size: 5.73, img: 24 },
          { x: 39.04, y: 83.36, size: 8.81, img: 26 },
          { x: 47.13, y: 1.75, size: 6.45, img: 27 },
          { x: 85.39, y: 43.64, size: 12.32, img: 28 },
        ],
        posterObjects: [
          { x: -1.07, y: 27.11, size: 37.17, img: 1 },
          { x: 2.08, y: 68.2, size: 24.57, img: 2 },
          { x: 85.24, y: 30.05, size: 15.4, img: 3 },
          { x: 77.27, y: 54.51, size: 10.0, img: 4 },
          { x: 49.64, y: 22.69, size: 28.58, img: 5 },
          { x: 29.66, y: 15.52, size: 12.1, img: 6 },
          { x: 19, y: 1.09, size: 11.5, img: 7 },
          { x: 39.26, y: 6.31, size: 5.37, img: 8 },
          { x: 51.8, y: -0.87, size: 15.33, img: 9 },
          { x: 87.18, y: 7.43, size: 15.97, img: 10 },
          { x: 6.52, y: 11.42, size: 16.69, img: 11 },
          { x: 53.58, y: 16.65, size: 6.94, img: 12 },
          { x: 38.97, y: 91.99, size: 3.87, img: 13 },
          { x: 53.8, y: 82.14, size: 5.16, img: 14 },
        ],
      };

      Config.OUTLINE_WIDTH = Config.isMobile ? 6 : 5;

      const CoordinateSystem = {
        posterWidth: 0,
        posterHeight: 0,

        update() {
          const posterImg = document.getElementById("posterImage");
          if (!posterImg || !posterImg.complete) return false;

          this.posterWidth = posterImg.width || posterImg.naturalWidth || 1396;
          this.posterHeight = posterImg.height || posterImg.naturalHeight || 1606;

          console.log("CoordinateSystem updated:", {
            poster: `${this.posterWidth}x${this.posterHeight}`,
          });

          return true;
        },

        posterToCanvas(xPercent, yPercent, sizePercent = null) {
          const x = (xPercent / 100) * this.posterWidth;
          const y = (yPercent / 100) * this.posterHeight;

          let size = 50;
          if (sizePercent !== null) {
            size = (sizePercent / 100) * this.posterWidth;
          }

          return { x, y, size };
        },
      };

      const PosterTransition = {
        active: true,
        fadeProgress: 0,
        startTime: null,
        pauseDuration: 100,
        fadeDuration: 1000,
        ready: false,

        init() {
          const posterImg = document.getElementById("posterImage");
          const posterContainer = document.getElementById("posterContainer");

          if (!posterImg || !posterContainer) {
            console.error("Poster elements not found");
            return;
          }
          const onPosterReady = () => {
            setTimeout(async () => {
              if (!CoordinateSystem.update()) {
                console.error("Failed to update coordinate system");
                return;
              }
              resizeCanvas();

              await Assets.load();
              await GameManager.init();
              this.ready = true;

              this.startTime = Date.now();
              posterContainer.classList.add("fade-out");
              console.log("Starting poster fade");
            }, 100);
          };

          if (posterImg.complete && posterImg.naturalWidth > 0) {
            console.log("Poster already loaded");
            onPosterReady();
          } else {
            console.log("Waiting for poster to load");
            posterImg.addEventListener("load", onPosterReady);
            posterImg.addEventListener("error", () => {
              console.error("Poster failed to load");
            });
          }
        },

        update() {
          if (!this.active || !this.startTime) return;

          const elapsed = Date.now() - this.startTime;
          const progress = Math.min(elapsed / this.fadeDuration, 1);

          this.fadeProgress = progress;

          if (progress >= 1) {
            this.active = false;
            console.log("Poster fade complete");
          }
        },
      };

      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");

      function resizeCanvas() {
        const posterImg = document.getElementById("posterImage");
        if (posterImg && posterImg.complete) {
          const posterWidth = posterImg.width || posterImg.naturalWidth || 1396;
          const posterHeight = posterImg.height || posterImg.naturalHeight || 1606;

          // Store poster area dimensions for games that need it
          canvas.posterAreaWidth = posterWidth;
          canvas.posterAreaHeight = posterHeight;

          // Extend canvas to cover full scrollable content
          const mainEl = document.querySelector("main");
          const totalHeight = mainEl ? mainEl.offsetTop + mainEl.offsetHeight : posterHeight;

          canvas.width = posterWidth;
          canvas.height = Math.max(posterHeight, totalHeight);
          canvas.style.width = posterWidth + "px";
          canvas.style.height = Math.max(posterHeight, totalHeight) + "px";
        }
      }

      resizeCanvas();

      const ImageCounter = {
        ball: 0,
        person: 0,
        nextBall() {
          this.ball = (this.ball + 1) % Config.NUM_BALL_IMAGES;
          return this.ball + 1;
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
        handleWallCollision(ball, canvasRef, bounce = 0.9, squash = true) {
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
        handleBallCollisions(balls, options = {}) {
          const skipCondition = options.skipCondition || ((b) => b.popping || b.orbiting || b.frozen || b.merging);
          const pushFactor = options.pushFactor || 0.3;

          for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
              const b1 = balls[i],
                b2 = balls[j];
              if (skipCondition(b1) || skipCondition(b2)) continue;

              const dx = b2.x - b1.x;
              const dy = b2.y - b1.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const minDist = b1.radius + b2.radius;

              if (dist < minDist && dist > 0) {
                const ang = Math.atan2(dy, dx);
                const overlap = minDist - dist;
                const ax = overlap * Math.cos(ang) * pushFactor;
                const ay = overlap * Math.sin(ang) * pushFactor;
                b1.vx -= ax;
                b1.vy -= ay;
                b2.vx += ax;
                b2.vy += ay;
              }
            }
          }
        },
        lineCircleCollision(x1, y1, x2, y2, cx, cy, radius) {
          const dx = x2 - x1;
          const dy = y2 - y1;
          const fx = x1 - cx;
          const fy = y1 - cy;
          const a = dx * dx + dy * dy;
          const b = 2 * (fx * dx + fy * dy);
          const c = fx * fx + fy * fy - radius * radius;
          let disc = b * b - 4 * a * c;

          if (disc < 0) return { collides: false };

          disc = Math.sqrt(disc);
          const t1 = (-b - disc) / (2 * a);
          const t2 = (-b + disc) / (2 * a);

          if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) {
            const t = Math.max(0, Math.min(1, -b / (2 * a)));
            const closestX = x1 + t * dx;
            const closestY = y1 + t * dy;
            const distX = cx - closestX;
            const distY = cy - closestY;
            const dist = Math.sqrt(distX * distX + distY * distY);

            if (dist < radius) {
              const pushDist = radius - dist;
              return {
                collides: true,
                newX: cx + (distX / dist) * pushDist,
                newY: cy + (distY / dist) * pushDist,
              };
            }
          }
          return { collides: false };
        },
      };

      const Renderer = {
        createRadialGradient(x, y, r1, r2, stops) {
          const gradient = ctx.createRadialGradient(x, y, r1, x, y, r2);
          stops.forEach((s) => gradient.addColorStop(s[0], s[1]));
          return gradient;
        },
      };

      class ParticleSystem {
        constructor() {
          this.particles = [];
        }
        add(particle) {
          this.particles.push({
            x: particle.x,
            y: particle.y,
            vx: particle.vx || 0,
            vy: particle.vy || 0,
            size: particle.size,
            type: particle.type,
            starIndex: particle.starIndex,
            ballImage: particle.ballImage,
            radius: particle.radius,
            life: particle.life || 30,
            maxLife: particle.maxLife || particle.life || 30,
            gravity: particle.gravity || 0,
            spin: particle.spin || 0,
            rotation: particle.rotation || 0,
          });
        }
        addBurst(x, y, count, config = {}) {
          const speed = config.speed || 4;
          const speedVariance = config.speedVariance || 2;
          const life = config.life || 30;
          const size = config.size || 15;
          const sizeVariance = config.sizeVariance || 10;
          const gravity = config.gravity || 0.1;
          const type = config.type || "star";

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
          this.particles = this.particles.filter((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity || 0;
            p.life--;
            p.rotation = (p.rotation || 0) + (p.spin || 0);
            return p.life > 0;
          });
        }

        draw(customDrawer) {
          this.particles.forEach((p) => {
            const alpha = p.life / (p.maxLife || 30);
            if (customDrawer) {
              customDrawer(p, alpha);
              return;
            }
            if (p.type === "star" && p.starIndex !== undefined) {
              const frame = Assets.getStarImage(p.starIndex);
              if (frame) SpriteRenderer.drawFrame(frame, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size, alpha, p.rotation);
            } else if (p.type === "heart") {
              const frame = Assets.getParticle("heart");
              if (frame) SpriteRenderer.drawFrame(frame, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size, alpha, p.rotation);
            } else if (p.type === "ko") {
              const frame = Assets.getParticle("ko");
              if (frame) SpriteRenderer.drawFrame(frame, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size, alpha, p.rotation);
            } else if (p.ballImage) {
              const frame = Assets.getBallImage(p.ballImage);
              if (Assets.isImageReady(frame)) {
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.drawImage(frame.img, frame.sx, frame.sy, frame.sw, frame.sh, -p.radius, -p.radius, p.radius * 2, p.radius * 2);
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
        createBall(options = {}) {
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
        updateBallPhysics(ball, options = {}) {
          const gravity = options.gravity || 0;
          const friction = options.friction || 0.99;
          const minSpeed = options.minSpeed || 0;
          const bounce = options.bounce || 0.9;
          const squashRecovery = options.squashRecovery || 0.15;

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
            ball.rotation += speed * 0.005;
          }

          Physics.handleWallCollision(ball, canvas, bounce);
        }
      }

      // Pop Game
      class PopGame extends BaseGame {
        init() {
          super.init();
          const screenSize = Math.min(canvas.width, canvas.height);
          const baseRadius = Config.isMobile ? Math.max(35, screenSize * 0.08) : Math.max(40, screenSize * 0.08);
          const radiusVariance = Config.isMobile ? Math.max(15, screenSize * 0.03) : Math.max(15, screenSize * 0.03);

          // Use all ball images and fill up the canvas
          const screenArea = canvas.width * canvas.height;
          const bigBallChance = Config.isMobile ? 0.2 : 0;
          const bigBallRadius = baseRadius * 2 + radiusVariance / 2;
          const normalBallRadius = baseRadius + radiusVariance / 2;
          const effectiveAvgRadius = bigBallChance * bigBallRadius + (1 - bigBallChance) * normalBallRadius;
          const averageBallArea = Math.PI * Math.pow(effectiveAvgRadius, 2);
          const numBalls = Math.max(Config.NUM_BALL_IMAGES, Math.floor((screenArea * 0.85) / averageBallArea));

          for (let i = 0; i < numBalls; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = 0.8 + Math.random() * 0.8;
            this.balls.push(
              this.createBall({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                radius:
                  Config.isMobile && Math.random() < 0.2
                    ? baseRadius * 2 + Math.random() * radiusVariance
                    : baseRadius + Math.random() * radiusVariance,
                ballImage: (i % Config.NUM_BALL_IMAGES) + 1,
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
          this.particles.draw((p) => {
            const frame = Assets.getBallImage(p.ballImage);
            if (Assets.isImageReady(frame)) {
              ctx.save();
              ctx.globalAlpha = p.life / p.maxLife;
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rotation);
              ctx.drawImage(frame.img, frame.sx, frame.sy, frame.sw, frame.sh, -p.size / 2, -p.size / 2, p.size, p.size);
              ctx.restore();
            }
          });
          this.balls.forEach((ball) => {
            ctx.save();
            ctx.globalAlpha = ball.opacity;
            if (ball.popping) {
              const sc = 1 + ball.popProgress * 0.8;
              ctx.translate(ball.x, ball.y);
              ctx.scale(sc, sc);
              ctx.rotate(ball.popProgress * 0.5);
              ctx.translate(-ball.x, -ball.y);
            }
            SpriteRenderer.drawBall(ball, 1, ball.rotation);
            ctx.restore();
          });
        }

        onPointerDown(x, y) {
          for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            if (!ball.popping && Physics.contains(ball, x, y)) {
              ball.popping = true;
              ScreenShake.add(ball.radius * 0.08);
              const nP = Math.floor(ball.radius * 0.25);
              for (let j = 0; j < nP; j++) {
                const a = Math.random() * Math.PI * 2;
                const sp = 3 + Math.random() * 5;
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
                  radius: (8 + Math.random() * 15) / 2,
                });
              }
              if (ball.radius > 25) {
                const cR = ball.radius * 0.55;
                const nC = 2 + Math.floor(Math.random() * 2);
                for (let j = 0; j < nC; j++) {
                  const a = ((Math.PI * 2) / nC) * j + Math.random() * 0.5;
                  const sp = 4 + Math.random() * 4;
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

      // Bounce Game
      class BounceGame extends BaseGame {
        init() {
          super.init();
          const isMobileVertical = Config.isMobile && window.innerHeight > window.innerWidth;
          const targetRadius = isMobileVertical ? 15 : Config.isMobile ? 30 : 50;

          const maxLineLength = isMobileVertical ? 70 : Config.isMobile ? 18 : 200;
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
            posterFadeProgress: 0,
            posterFadeStart: Date.now(),
            target: {
              x: canvas.width / 2,
              y: Math.min(300, document.documentElement.clientHeight * (isMobileVertical ? 0.4 : 0.6)),
              radius: targetRadius,
              pulse: 0,
              rotation: 0,
            },
          };
this.playZoneHeight = window.innerHeight;
          this.isFirstBall = true;          this.spawnBall();
        }

        spawnBall() {
          const ballRadius = Config.isMobile ? 20 : 30;
          let spawnX = this.isFirstBall ? this.state.target.x : 100 + Math.random() * (canvas.width - 200);
          this.isFirstBall = false;

          this.balls.push(
            this.createBall({
              x: spawnX,
              rotation: 0,
              rotationSpeed: 0,
              y: -ballRadius,
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

          // Handle poster fade
          const fadeElapsed = Date.now() - s.posterFadeStart;
          const fadeDuration = 1000;
          s.posterFadeProgress = Math.min(fadeElapsed / fadeDuration, 1);

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
            ball.rotationSpeed += ball.vx * 0.0005;
            ball.rotationSpeed *= 0.98;
            ball.rotation += ball.rotationSpeed;
            Physics.capSpeed(ball);

            const dx = ball.x - s.target.x;
            const dy = ball.y - s.target.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < ball.radius * ball.growScale + s.target.radius) {
              s.score++;
              ball.growScale += 0.05;
              ScreenShake.add(12);
              const isMobileVertical = Config.isMobile && window.innerHeight > window.innerWidth;
              const burstSize = isMobileVertical ? 15 : Config.isMobile ? 20 : 30;
              const burstSizeVariance = isMobileVertical ? 12 : Config.isMobile ? 18 : 25;

              this.particles.addBurst(s.target.x, s.target.y, 12, {
                speed: 4,
                speedVariance: 4,
                life: 50,
                size: burstSize,
                sizeVariance: burstSizeVariance,
                gravity: 0.12,
                type: "star",
              });
            s.target.x = 150 + Math.random() * (canvas.width - 300);

              const topBound = this.playZoneHeight * 0.10;
              const bottomBound = this.playZoneHeight * 0.50;
              s.target.y = topBound + Math.random() * (bottomBound - topBound);
               const ang = Math.atan2(dy, dx);
              ball.vx = Math.cos(ang) * 5;
              ball.vy = Math.sin(ang) * 5;
            }

            const groundY = window.innerHeight + window.scrollY;
            if (ball.y + ball.radius * ball.growScale >= groundY - 5 && !ball.dying) {
              ball.dying = true;
              ball.deathProgress = 0;
              ScreenShake.add(5);
              s.splats.push({
                x: ball.x,
                y: window.innerHeight + window.scrollY,
                radius: ball.radius * ball.growScale,
                life: 120,
                colour: `hsl(${Math.random() * 360}, 60%, 50%)`,
              });
              continue;
            }

            if (ball.x - ball.radius * ball.growScale < 0) {
              ball.x = ball.radius * ball.growScale;
              ball.vx *= -0.9;
              ball.squishX = 0.7;
              ball.squishY = 1.3;
              ball.rotationSpeed += ball.vy * 0.004;
            }
            if (ball.x + ball.radius * ball.growScale > canvas.width) {
              ball.x = canvas.width - ball.radius * ball.growScale;
              ball.vx *= -0.9;
              ball.squishX = 0.7;
              ball.squishY = 1.3;
              ball.rotationSpeed += ball.vy * 0.004;
            }
            if (ball.y - ball.radius * ball.growScale < 0) {
              ball.y = ball.radius * ball.growScale;
              ball.vy *= -0.9;
              ball.squishX = 1.4;
              ball.squishY = 0.6;
              ball.rotationSpeed += ball.vx * 0.004;
            }

            s.barriers.forEach((barrier) => {
              const result = Physics.lineCircleCollision(
                barrier.x1,
                barrier.y1,
                barrier.x2,
                barrier.y2,
                ball.x,
                ball.y,
                ball.radius * ball.growScale,
              );
              if (result.collides) {
                ball.x = result.newX;
                ball.y = result.newY;
                const ang = Math.atan2(barrier.y2 - barrier.y1, barrier.x2 - barrier.x1);
                const nAng = ang + Math.PI / 2;
                const dot = ball.vx * Math.cos(nAng) + ball.vy * Math.sin(nAng);
                ball.vx -= 2 * dot * Math.cos(nAng) * 1.1;
                ball.vy -= 2 * dot * Math.sin(nAng) * 1.1;
                ball.squishX = 0.75;
                ball.squishY = 1.25;
                Physics.capSpeed(ball);
                ball.rotationSpeed += (ball.vx + ball.vy) * 0.003;
              }
            });
          }
        }

        draw() {
          const s = this.state;

          const posterImg = document.getElementById("posterImage");
          if (posterImg && Assets.isImageReady(posterImg)) {
            const fadeProgress = s.posterFadeProgress;
            const opacity = 0.07 + (1 - fadeProgress) * 0.9; // Fade from 1 to 0.1
            const grayscale = fadeProgress; // 0 to 1

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.filter = `grayscale(${grayscale * 100}%)`;
            const drawW = canvas.posterAreaWidth || canvas.width;
            const drawH = canvas.posterAreaHeight || canvas.height;
            ctx.drawImage(posterImg, 0, 0, drawW, drawH);
            ctx.restore();
            ctx.filter = "none";
          }

          const t = s.target;
          const pulseScale = 1 + Math.sin(t.pulse) * 0.15;
          const glowGrad = Renderer.createRadialGradient(t.x, t.y, t.radius * 0.3, t.radius * 2.5, [
            [0, "rgba(255, 220, 100, 0.6)"],
            [1, "rgba(255, 180, 50, 0)"],
          ]);
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.radius * 2.5 * pulseScale, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();

          const size = t.radius * 2.5 * pulseScale;
          const starFrame = Assets.getStarImage(0); // ← Changed from Assets.stars[0]
          if (Assets.isImageReady(starFrame)) {
            ctx.save();
            ctx.translate(t.x, t.y);
            ctx.rotate(t.rotation);
            ctx.drawImage(starFrame.img, starFrame.sx, starFrame.sy, starFrame.sw, starFrame.sh, -size / 2, -size / 2, size, size);
            ctx.restore();
          }

          super.draw();

          s.splats.forEach((splat) => {
            const a = splat.life / 120;
            const sq = 1 + (1 - a) * 2;
            ctx.save();
            ctx.globalAlpha = a * 0.6;
            ctx.translate(splat.x, splat.y);
            ctx.scale(sq, 0.3);
            ctx.beginPath();
            ctx.arc(0, 0, splat.radius, 0, Math.PI * 2);
            ctx.fillStyle = splat.colour;
            ctx.fill();
            ctx.restore();
          });

          this.balls.forEach((ball) => {
            const frame = Assets.getBallImage(ball.ballImage);
            const r = ball.radius * ball.growScale;
            if (Assets.isImageReady(frame)) {
              if (ball.dying) {
                ctx.save();
                const sqY = 1 - ball.deathProgress * 0.8;
                const sqX = 1 + ball.deathProgress * 0.5;
                ctx.translate(ball.x, window.innerHeight + window.scrollY);
                ctx.scale(sqX, sqY);
                ctx.globalAlpha = 1 - ball.deathProgress;
                ctx.drawImage(frame.img, frame.sx, frame.sy, frame.sw, frame.sh, -r, -r * 2, r * 2, r * 2);
                ctx.restore();
              } else {
                ctx.save();
                ctx.translate(ball.x, ball.y);
                ctx.rotate(ball.rotation);
                ctx.scale(ball.squishX, ball.squishY);
                ctx.drawImage(frame.img, frame.sx, frame.sy, frame.sw, frame.sh, -r, -r, r * 2, r * 2);
                ctx.restore();
              }
            }
          });
          s.barriers.forEach((barrier) => {
            const age = Date.now() - barrier.created;
            const op = Math.max(0, 1 - age / s.barrierLifetime);
            ctx.save();
            ctx.shadowColour = "rgba(100, 180, 255, 0.8)";
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
            let dx = s.drawEnd.x - s.drawStart.x;
            let dy = s.drawEnd.y - s.drawStart.y;
            let len = Math.sqrt(dx * dx + dy * dy);
            if (len > s.maxLineLength) {
              dx = (dx / len) * s.maxLineLength;
              dy = (dy / len) * s.maxLineLength;
            }
            const endX = s.drawStart.x + dx;
            const endY = s.drawStart.y + dy;
            ctx.save();
            ctx.shadowColour = "rgba(100, 180, 255, 0.5)";
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
            let dx = s.drawEnd.x - s.drawStart.x;
            let dy = s.drawEnd.y - s.drawStart.y;
            let len = Math.sqrt(dx * dx + dy * dy);
            if (len > 20) {
              if (len > s.maxLineLength) {
                dx = (dx / len) * s.maxLineLength;
                dy = (dy / len) * s.maxLineLength;
              }
              s.barriers.push({
                x1: s.drawStart.x,
                y1: s.drawStart.y,
                x2: s.drawStart.x + dx,
                y2: s.drawStart.y + dy,
                created: Date.now(),
              });
            }
          }
          s.drawing = false;
          s.drawStart = null;
          s.drawEnd = null;
        }
      }

      // Connections
      class ConnectionsGame extends BaseGame {
        init() {
          super.init();
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
            clickSpinEntities: [],
          };

          // Calculate responsive sizes
          const screenSize = Math.min(canvas.width, canvas.height);
          const standardBallRadius = Config.isMobile ? Math.max(20, screenSize * 0.035) : Math.max(30, screenSize * 0.05);
          const standardPersonHeight = Config.isMobile ? Math.max(45, screenSize * 0.055) : Math.max(60, screenSize * 0.08);
          if (CoordinateSystem.posterWidth && Config.posterBalls && Config.posterPeople) {
            console.log("Using poster positions for ConnectionsGame");

            Config.posterBalls.forEach((posterData, i) => {
              const coords = CoordinateSystem.posterToCanvas(posterData.x, posterData.y, posterData.size);
              const originalRadius = coords.size / 2;
              const centerX = coords.x + originalRadius;
              const centerY = coords.y + originalRadius;

              this.balls.push(
                this.createBall({
                  x: centerX,
                  y: centerY,
                  vx: 0,
                  vy: 0,
                  radius: originalRadius,
                  originalRadius: originalRadius,
                  targetRadius: originalRadius * 0.5 + standardBallRadius * 0.5,
                  ballImage: posterData.img,
                  // useBest: true,
                  type: "ball",
                  rotationSpeed: (Math.random() - 0.5) * 0.02,
                  rotation: 0,
                  scale: 1,
                  targetScale: 1,
                  currentScale: 1,
                  wigglePhase: Math.random() * Math.PI * 2,
                  wiggleAmount: 0,
                  targetWiggle: 0,
                  bounceAnim: 0,
                  shakeAnim: 0,
                  shakeIntensity: 0,
                  spawnTime: Date.now(),
                  transitionStarted: false,
                }),
              );
            });

            Config.posterPeople.forEach((posterData, i) => {
              const coords = CoordinateSystem.posterToCanvas(posterData.x, posterData.y, posterData.size);
              const originalHeight = coords.size;
              const originalRadius = originalHeight / 2;
              const centerX = coords.x + coords.size * 0.5; // Assumes aspect ratio ~1:1
              const bottomY = coords.y + coords.size;

              this.balls.push({
                x: centerX,
                y: bottomY,
                vx: 0,
                vy: 0,
                radius: originalRadius,
                originalRadius: originalRadius,
                targetPersonHeight: originalHeight * 0.5 + standardPersonHeight * 0.5,
                clickRadius: originalRadius + (Config.isMobile ? 8 : 20),
                personImage: posterData.img,
                // useBest: true,
                personHeight: originalHeight,
                originalPersonHeight: originalHeight,
                targetPersonHeight: standardPersonHeight,
                type: "person",
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.015,
                scale: 1,
                targetScale: 1,
                currentScale: 1,
                wigglePhase: Math.random() * Math.PI * 2,
                wiggleAmount: 0,
                targetWiggle: 0,
                bounceAnim: 0,
                shakeAnim: 0,
                shakeIntensity: 0,
                spawnTime: Date.now(),
                transitionStarted: false,
              });
            });

            Config.posterObjects.forEach((posterData, i) => {
              const coords = CoordinateSystem.posterToCanvas(posterData.x, posterData.y, posterData.size);
              const radius = coords.size / 2;
              const centerX = coords.x + radius;
              const centerY = coords.y + radius;

              const distToLeft = centerX;
              const distToRight = canvas.width - centerX;
              const distToTop = centerY;
              const distToBottom = canvas.height - centerY;
              const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

              let exitAngle;
              if (minDist === distToLeft) exitAngle = Math.PI;
              else if (minDist === distToRight) exitAngle = 0;
              else if (minDist === distToTop) exitAngle = -Math.PI / 2;
              else exitAngle = Math.PI / 2;
              exitAngle += (Math.random() - 0.5) * 0.5;

              this.balls.push({
                x: centerX,
                y: centerY,
                vx: 0,
                vy: 0,
                radius: radius,
                clickRadius: 0,
                otherImage: posterData.img - 1,
                type: "other",
                rotation: 0,
                rotationSpeed: (Math.random() - 0.3) * 0.004,
                spinAngle: exitAngle,
                spinSpeed: 0,
                spinDistance: 0,
                originalX: centerX,
                originalY: centerY,
                scale: 1,
                currentScale: 1,
                targetScale: 0,
                wigglePhase: 0,
                wiggleAmount: 0,
                targetWiggle: 0,
                bounceAnim: 0,
                shakeAnim: 0,
                spawnTime: Date.now(),
                opacity: 1,
                fadeOutStart: Date.now() + 100,
                isStaticObject: true,
              });
            });
          } else {
            console.warn("Poster not ready, using fallback positions");
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
            colour: `hsl(${Math.random() * 60 + 30}, 100%, 60%)`,
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
            timer: 25,
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

          const deadEntity1 = dying.entity1;
          const deadEntity2 = dying.entity2;
          const idx1 = this.balls.indexOf(deadEntity1);
          const idx2 = this.balls.indexOf(deadEntity2);
          if (idx1 > idx2) {
            this.balls.splice(idx1, 1);
            this.balls.splice(idx2, 1);
          } else {
            this.balls.splice(idx2, 1);
            this.balls.splice(idx1, 1);
          }

          const screenSize = Math.min(canvas.width, canvas.height);
          const baseRadius = Math.max(30, screenSize * 0.04);
          const personHeight = Math.max(60, screenSize * 0.07);

          const replaceExploded = true; // do want to replace exploded balls or pppl

          if (replaceExploded) {
            setTimeout(() => {
              [deadEntity1, deadEntity2].forEach((dead) => {
                const a = Math.random() * Math.PI * 2;
                const s = 1 + Math.random() * 1.5;
                if (dead.type === "ball") {
                  this.balls.push(
                    this.createBall({
                      x: Math.random() * canvas.width,
                      y: Math.random() * canvas.height,
                      vx: Math.cos(a) * s,
                      vy: Math.sin(a) * s,
                      radius: dead.targetRadius || dead.radius,
                      ballImage: dead.ballImage,
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
                      spawnTime: Date.now(),
                    }),
                  );
                } else if (dead.type === "person") {
                  this.balls.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: Math.cos(a) * s,
                    vy: Math.sin(a) * s,
                    radius: dead.targetRadius || dead.radius,
                    clickRadius: baseRadius + 20,
                    personImage: dead.personImage,
                    personHeight: dead.targetPersonHeight || dead.personHeight,
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
                    spawnTime: Date.now(),
                  });
                }
              });
            }, 400);
          }
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

          s.clickSpinEntities = s.clickSpinEntities.filter((spinData) => {
            spinData.progress += 0.035;
            if (spinData.progress >= 1) return false;

            const easeOut = 1 - Math.pow(1 - spinData.progress, 3);
            spinData.entity.rotation = spinData.startRotation + easeOut * spinData.targetSpin;
            return true;
          });

          s.connections.forEach((conn) => {
            const b1 = conn.entity1;
            const b2 = conn.entity2;
            if (!this.balls.includes(b1) || !this.balls.includes(b2)) return;

            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const stretch = dist - conn.restLength;
            const force = stretch * 0.02;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            b1.vx += fx;
            b1.vy += fy;
            b2.vx -= fx;
            b2.vy -= fy;
          });

          const currentTime = Date.now();

          this.balls.forEach((ball) => {
            const isDying = this.getDeathState(ball);

            if (ball.isStaticObject) {
              const timeSinceFade = currentTime - ball.fadeOutStart;

              if (timeSinceFade <= 0) {
                ball.currentScale = 1;
                ball.opacity = 1;
                ball.x = ball.originalX;
                ball.y = ball.originalY;
                return;
              }

              const fadeDuration = 2000;
              const progress = Math.min(timeSinceFade / fadeDuration, 1);
              const easeProgress = progress * progress;

              ball.opacity = 1 - progress;

              if (progress >= 1) {
                const idx = this.balls.indexOf(ball);
                if (idx !== -1) this.balls.splice(idx, 1);
                return;
              }

              if (progress > 0.7) {
                const shrinkProgress = (progress - 0.7) / 0.3;
                ball.currentScale = 1 - shrinkProgress * 0.3;
              } else {
                ball.currentScale = 1;
              }

              ball.rotation += ball.rotationSpeed * 0.5;
              ball.spinSpeed = easeProgress * 0.5;
              ball.spinDistance += ball.spinSpeed;
              ball.x = ball.originalX + Math.cos(ball.spinAngle) * ball.spinDistance;
              ball.y = ball.originalY + Math.sin(ball.spinAngle) * ball.spinDistance;
              return;
            }

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

              const timeSinceSpawn = currentTime - (ball.spawnTime || 0);
              if (timeSinceSpawn > 800 && !ball.isStaticObject) {
                if (!ball.transitionStarted) {
                  ball.transitionStarted = true;
                }

                if (ball.targetRadius !== undefined) {
                  const transitionSpeed = 0.02;
                  ball.radius += (ball.targetRadius - ball.radius) * transitionSpeed;
                  if (ball.type === "person" && ball.clickRadius) {
                    ball.clickRadius = ball.radius + (Config.isMobile ? 8 : 20);
                  }
                }

                if (ball.targetPersonHeight !== undefined) {
                  const transitionSpeed = 0.02;
                  ball.personHeight += (ball.targetPersonHeight - ball.personHeight) * transitionSpeed;
                }

                if (Math.random() < 0.04) {
                  const angle = Math.random() * Math.PI * 2;
                  const speed = 0.8 + Math.random() * 1.2;
                  ball.vx += Math.cos(angle) * speed * 0.15;
                  ball.vy += Math.sin(angle) * speed * 0.15;
                }

                ball.vx *= 0.985;
                ball.vy *= 0.985;
                ball.x += ball.vx;
                ball.y += ball.vy;
                Physics.capSpeed(ball);
                Physics.handleWallCollision(ball, canvas, 0.9, false);
              }
            }
          });

          if (currentTime - (this.balls[0]?.spawnTime || 0) > 2000) {
            Physics.handleBallCollisions(this.balls, {
              skipCondition: (b) => b.popping || b.orbiting || b.frozen || b.merging || b.isStaticObject,
            });
          }
        }

        draw() {
          const s = this.state;

          // Draw poster background for testing
          // const posterImg = document.getElementById("posterImage");
          // if (posterImg && Assets.isImageReady(posterImg)) {
          //   ctx.save();
          //   ctx.globalAlpha = 0.3;
          //   const drawW = canvas.posterAreaWidth || canvas.width;
          //   const drawH = canvas.posterAreaHeight || canvas.height;
          //   ctx.drawImage(posterImg, 0, 0, drawW, drawH);
          //   ctx.restore();
          // }
          super.draw();

          s.connections.forEach((conn) => {
            if (!this.balls.includes(conn.entity1) || !this.balls.includes(conn.entity2)) return;
            ctx.beginPath();
            ctx.moveTo(conn.entity1.x, conn.entity1.y);
            ctx.lineTo(conn.entity2.x, conn.entity2.y);
            ctx.strokeStyle = "rgba(100, 200, 100, 0.6)";
            ctx.lineWidth = 8;
            ctx.stroke();
          });

          s.celebrationRings.forEach((ring) => {
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = ring.colour.replace(")", `, ${ring.life})`).replace("hsl", "hsla");
            ctx.lineWidth = 6 * ring.life;
            ctx.stroke();
          });

          this.balls.forEach((entity) => {
            if (entity.type === "other") {
              const frame = Assets.getOtherImage(entity.otherImage);
              if (!Assets.isImageReady(frame)) return;

              const opacity = entity.opacity || 1;
              const scale = entity.currentScale || 1;

              ctx.save();
              ctx.globalAlpha = opacity;
              ctx.translate(entity.x, entity.y);
              ctx.rotate(entity.rotation);

              const aspectRatio = frame.aspectRatio; // ← Changed
              const displayWidth = entity.radius * 2 * scale * aspectRatio;
              const displayHeight = entity.radius * 2 * scale;

              ctx.drawImage(frame.img, frame.sx, frame.sy, frame.sw, frame.sh, -displayWidth / 2, -displayHeight / 2, displayWidth, displayHeight);
              ctx.restore();
              return;
            }
          });

          this.balls.forEach((entity) => {
            if (entity.type === "other") return;

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
              const bounceStrength = Config.isMobile ? 0.4 : 0.25;
              bounceScale = 1 + Math.sin(t * Math.PI * 3) * bounceStrength * t;
            }

            const scale = (entity.currentScale || 1) * bounceScale;
            const wiggle = entity.wiggleAmount * Math.sin(entity.wigglePhase) * 0.04;

            ctx.translate(entity.x + offsetX, entity.y + offsetY);
            ctx.scale(scale + wiggle, scale - wiggle);
            ctx.translate(-entity.x, -entity.y);

            const getEntityOutlineInfo = (entity) => {
              if (entity.type === "person") {
                const frame = Assets.getPersonImage(entity.personImage);
                const height = entity.personHeight || (Config.isMobile ? 40 : 80);
                if (!Assets.isImageReady(frame)) return null;
                const width = height * frame.aspectRatio;
                return { frame, x: entity.x - width / 2, y: entity.y + 15 - height, w: width, h: height };
              } else {
                const frame = Assets.getBallImage(entity.ballImage);
                const r = entity.radius;
                if (!Assets.isImageReady(frame)) return null;
                return { frame, x: entity.x - r, y: entity.y - r, w: r * 2, h: r * 2 };
              }
            };

            // Death state outline (red pulsing)
            if (deathState && deathState.phase === "shake") {
              const pulse = Math.sin(deathState.timer * 0.8) * 0.5 + 0.5;
              const deathOutlineWidth = Math.round(Config.OUTLINE_WIDTH + pulse * 3);
              const alpha = 0.6 + pulse * 0.4;
              const deathOutlineColour = `rgba(255, 50, 50, ${alpha})`;
              const info = getEntityOutlineInfo(entity);
              if (info) {
                SpriteRenderer.drawOutline(info.frame, info.x, info.y, info.w, info.h, deathOutlineWidth, deathOutlineColour);
              }
            }

            // Hover/selection outline (yellow)
            if ((isSel || entity.targetScale > 1) && !deathState) {
              const hoverOutlineWidth = Config.OUTLINE_WIDTH;
              const hoverOutlineColour = "rgba(255, 220, 100, 0.9)";
              const info = getEntityOutlineInfo(entity); // ← Use "info" here
              if (info) {
                SpriteRenderer.drawOutline(info.frame, info.x, info.y, info.w, info.h, hoverOutlineWidth, hoverOutlineColour);
              }
            }

            // Bounce celebration outline (yellow glow)
            if (entity.bounceAnim > 0.3) {
              const bounceOutlineWidth = Math.round(Config.OUTLINE_WIDTH + entity.bounceAnim * 4);
              const bounceAlpha = Math.min(1, entity.bounceAnim * 1.2);
              const bounceOutlineColour = `rgba(255, 220, 100, ${bounceAlpha})`;
              const info = getEntityOutlineInfo(entity); // ← Use "info" here
              if (info) {
                SpriteRenderer.drawOutline(info.frame, info.x, info.y, info.w, info.h, bounceOutlineWidth, bounceOutlineColour);
              }
            }

            // Draw the actual entity
            if (entity.type === "person") {
              const height = entity.personHeight || (Config.isMobile ? 40 : 80);
              SpriteRenderer.drawPerson(entity.x, entity.y + 15, height, entity.personImage);
            } else {
              SpriteRenderer.drawBall(entity);
            }

            ctx.restore();
          });

          if (s.isDragging && s.dragStart && s.dragEnd) {
            ctx.beginPath();
            ctx.moveTo(s.dragStart.x, s.dragStart.y);
            ctx.lineTo(s.dragEnd.x, s.dragEnd.y);
            ctx.strokeStyle = "rgba(100, 200, 100, 0.8)";
            ctx.lineWidth = 7;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        findEntityAt(x, y) {
          let bestEntity = null;
          let bestDist = Infinity;
          for (let i = this.balls.length - 1; i >= 0; i--) {
            const entity = this.balls[i];
            if (this.getDeathState(entity) || entity.isStaticObject) continue;
            const clickR = entity.clickRadius || entity.radius;
            const hitY = entity.type === "person" ? entity.y + 15 - (entity.personHeight || 60) / 2 : entity.y;
            const dx = x - entity.x;
            const dy = y - hitY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < clickR + 10 && dist < bestDist) {
              bestDist = dist;
              bestEntity = entity;
            }
          }
          return bestEntity;
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
            entity.targetScale = 1.18;
            entity.targetWiggle = 1.2;
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
            } else {
              const spinDirection = Math.random() < 0.5 ? 1 : -1;
              const targetSpin = spinDirection * (Math.PI * 0.5 + Math.random() * Math.PI * 0.3);

              s.clickSpinEntities.push({
                entity: entity,
                startRotation: entity.rotation,
                targetSpin: targetSpin,
                progress: 0,
              });

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
          this.stars = [];
          this.spawnStars(12);
          this.state = {
            paths: [],
            drawing: false,
            currentPath: [],
            currentColour: null,
            pathLifetime: 10000,
          };
          this.colours = ["#64B5F6", "#81C784", "#FFB74D", "#F06292", "#BA68C8", "#4DD0E1"];

          const brushBallCount = Config.NUM_BALL_IMAGES * 3;
          for (let i = 0; i < brushBallCount; i++) {
            this.balls.push(
              this.createBall({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1,
                radius: Config.isMobile ? 20 + Math.random() * 15 : 50 + Math.random() * 30,
                ballImage: (i % Config.NUM_BALL_IMAGES) + 1,
                // useBest: true,
                followingPath: null,
                pathProgress: 0,
                pathDirection: 1,
                driftAngle: Math.random() * Math.PI * 2,
                pathSpeed: 0.003 + Math.random() * 0.001,
                speedPhase: Math.random() * Math.PI * 2,
                magnetTarget: null,
                magnetProgress: 0,
              }),
            );
          }
          const midY = (Config.isMobile ? window.innerHeight : canvas.height) * 0.15;          const pathPoints = [];
          const numPoints = 10;
          for (let i = 0; i < numPoints; i++) {
            pathPoints.push({
              x: canvas.width * 0.35 + canvas.width * 0.3 * (i / (numPoints - 1)),
              y: midY,
            });
          }
          this.state.paths.push({
            points: pathPoints,
            created: Date.now(),
            isLoop: false,
            colour: this.colours[Math.floor(Math.random() * this.colours.length)],
          });
        }

        update() {
          super.update();
          const self = this;
          this.state.paths = this.state.paths.filter((path) => Date.now() - path.created < this.state.pathLifetime);

          this.balls.forEach((ball) => {
            // --- Magnetic snap animation ---
            if (ball.magnetTarget && ball.magnetTarget.points) {
              const path = ball.magnetTarget;
              if (!self.state.paths.includes(path)) {
                ball.magnetTarget = null;
                ball.magnetProgress = 0;
                return;
              }

              ball.magnetProgress += 0.08;

              let closestIdx = 0;
              let closestDist = Infinity;
              for (let i = 0; i < path.points.length; i++) {
                const d = Physics.distance(ball.x, ball.y, path.points[i].x, path.points[i].y);
                if (d < closestDist) {
                  closestDist = d;
                  closestIdx = i;
                }
              }

              const targetPt = path.points[closestIdx];
              const ease = ball.magnetProgress * ball.magnetProgress;
              ball.x += (targetPt.x - ball.x) * ease * 0.3;
              ball.y += (targetPt.y - ball.y) * ease * 0.3;

              if (ball.magnetProgress >= 1) {
                ball.followingPath = path;
                ball.pathProgress = closestIdx / Math.max(1, path.points.length - 1);
                ball.pathDirection = 1;
                ball.speedPhase = Math.random() * Math.PI * 2;
                ball.magnetTarget = null;
                ball.magnetProgress = 0;
              }
              return;
            }

            if (ball.followingPath && ball.followingPath.points) {
              const path = ball.followingPath;
              if (!self.state.paths.includes(path)) {
                ball.followingPath = null;
                ball.pathProgress = 0;
                return;
              }

              ball.speedPhase += 0.05;
              const oscillation = Math.sin(ball.speedPhase) * 0.003;
              const totalPoints = path.isLoop ? path.points.length : path.points.length - 1;
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

              const idx = Math.floor(ball.pathProgress * totalPoints);
              const clampedIdx = Math.max(0, Math.min(path.points.length - 1, idx));
              const nextIdx = path.isLoop ? (clampedIdx + 1) % path.points.length : Math.min(clampedIdx + 1, path.points.length - 1);
              const t = ball.pathProgress * totalPoints - idx;
              ball.x = path.points[clampedIdx].x + (path.points[nextIdx].x - path.points[clampedIdx].x) * t;
              ball.y = path.points[clampedIdx].y + (path.points[nextIdx].y - path.points[clampedIdx].y) * t;
              ball.rotation += (ball.pathDirection > 0 ? 1 : -1) * dynamicSpeed * 8;
            } else {
              // Check for nearby paths — magnet snap
              for (let p = 0; p < self.state.paths.length; p++) {
                const path = self.state.paths[p];
                if (path.points.length < 2) continue;
                for (let i = 0; i < path.points.length; i++) {
                  const pt = path.points[i];
                  const dist = Physics.distance(ball.x, ball.y, pt.x, pt.y);
                  if (dist < ball.radius + 20) {
                    ball.magnetTarget = path;
                    ball.magnetProgress = 0;
                    break;
                  }
                }
                if (ball.magnetTarget) break;
              }

              if (!ball.magnetTarget) {
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

          this.stars.forEach((star) => {
            star.rotation += star.spin;
            if (star.fadeIn) {
              star.opacity = Math.min(1, star.opacity + 0.02);
              if (star.opacity >= 1) star.fadeIn = false;
            }
          });

          // Check ball-star collisions
          this.balls.forEach((ball) => {
            for (let i = this.stars.length - 1; i >= 0; i--) {
              const star = this.stars[i];
              if (!star.alive) continue;
              const dist = Physics.distance(ball.x, ball.y, star.x, star.y);
              if (dist < ball.radius + star.size * 0.4) {
                star.alive = false;
                // Burst of tiny star particles
                const count = 4 + Math.floor(Math.random() * 4);
                for (let j = 0; j < count; j++) {
                  const angle = ((Math.PI * 2) / count) * j + Math.random() * 0.5;
                  const speed = 1.5 + Math.random() * 2.5;
                  this.particles.add({
                    x: star.x,
                    y: star.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: 4 + Math.random() * 6,
                    life: 30 + Math.floor(Math.random() * 20),
                    maxLife: 50,
                    type: "star",
                    starIndex: Math.floor(Math.random() * 3),
                    gravity: 0.02,
                    spin: (Math.random() - 0.5) * 0.2,
                    rotation: Math.random() * Math.PI * 2,
                  });
                }
              }
            }
          });

          // Remove dead stars and replenish
          this.stars = this.stars.filter((s) => s.alive);
          while (this.stars.length < 8) {
            this.spawnStar();
          }

          Physics.handleBallCollisions(this.balls, {
            skipCondition: (b) => b.popping || b.orbiting || b.frozen || b.merging,
            pushFactor: 0.02,
          });
        }

        catmullRomPoint(p0, p1, p2, p3, t) {
          const t2 = t * t;
          const t3 = t2 * t;
          return {
            x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
            y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
          };
        }

        spawnStar() {
          this.stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            rotation: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.03,
            size: 20 + Math.random() * 20,
            starIndex: Math.floor(Math.random() * 3),
            opacity: 0,
            fadeIn: true,
            alive: true,
          });
        }

        spawnStars(count) {
          for (let i = 0; i < count; i++) this.spawnStar();
        }

        drawSmoothPath(points, opacity, colour) {
          if (points.length < 2) return;
          ctx.save();
          ctx.strokeStyle = colour;
          ctx.globalAlpha = opacity * 0.9;
          ctx.lineWidth = 15;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);

          if (points.length === 2) {
            ctx.lineTo(points[1].x, points[1].y);
          } else {
            for (let i = 0; i < points.length - 1; i++) {
              const p0 = points[Math.max(0, i - 1)];
              const p1 = points[i];
              const p2 = points[Math.min(points.length - 1, i + 1)];
              const p3 = points[Math.min(points.length - 1, i + 2)];
              const segments = 10;
              for (let j = 1; j <= segments; j++) {
                const t = j / segments;
                const pt = this.catmullRomPoint(p0, p1, p2, p3, t);
                ctx.lineTo(pt.x, pt.y);
              }
            }
          }
          ctx.stroke();
          ctx.restore();
        }

        draw() {
          const self = this;
          this.state.paths.forEach((path) => {
            if (path.points.length < 1) return;
            const age = Date.now() - path.created;
            const op = Math.max(0, 1 - age / self.state.pathLifetime);
            if (path.points.length === 1) {
              ctx.beginPath();
              ctx.arc(path.points[0].x, path.points[0].y, 6, 0, Math.PI * 2);
              ctx.fillStyle = path.colour;
              ctx.globalAlpha = op * 0.6;
              ctx.fill();
              ctx.globalAlpha = 1;
            } else {
              self.drawSmoothPath(path.points, op, path.colour);
            }
          });

          this.stars.forEach((star) => {
            const frame = Assets.getStarImage(star.starIndex);
            if (frame) {
              SpriteRenderer.drawFrame(
                frame,
                star.x - star.size / 2,
                star.y - star.size / 2,
                star.size,
                star.size,
                star.opacity * 0.7,
                star.rotation,
              );
            }
          });

          if (this.state.drawing && this.state.currentPath.length >= 1) {
            ctx.save();
            if (this.state.currentPath.length === 1) {
              ctx.beginPath();
              ctx.arc(this.state.currentPath[0].x, this.state.currentPath[0].y, 6, 0, Math.PI * 2);
              ctx.fillStyle = this.state.currentColour;
              ctx.globalAlpha = 0.9;
              ctx.fill();
            } else {
              this.drawSmoothPath(this.state.currentPath, 1.5, this.state.currentColour);
            }
            ctx.restore();
          }

          // Magnetic snap ring
          this.balls.forEach((ball) => {
            if (ball.magnetTarget && ball.magnetProgress > 0) {
              const progress = ball.magnetProgress;
              ctx.save();
              ctx.beginPath();
              ctx.arc(ball.x, ball.y, ball.radius + 8 * (1 - progress), 0, Math.PI * 2);
              ctx.strokeStyle = ball.magnetTarget.colour || "#fff";
              ctx.globalAlpha = 0.3 * (1 - progress);
              ctx.lineWidth = 2;
              ctx.stroke();
              ctx.restore();
            }
          });

          this.balls.forEach((ball) => {
            if (ball.useBest) {
              SpriteRenderer.drawBestBall(ball, 1, ball.rotation);
            } else {
              SpriteRenderer.drawBall(ball, 1, ball.rotation);
            }
          });
          super.draw();
        }

        onPointerDown(x, y) {
          this.state.drawing = true;
          this.state.currentPath = [{ x: x, y: y }];
          const availableColours = this.colours.filter((c) => c !== this.state.currentColour);
          this.state.currentColour = availableColours[Math.floor(Math.random() * availableColours.length)];
        }

        onPointerMove(x, y) {
          if (this.state.drawing) {
            const lastPt = this.state.currentPath[this.state.currentPath.length - 1];
            if (Math.abs(x - lastPt.x) > 5 || Math.abs(y - lastPt.y) > 5) {
              this.state.currentPath.push({ x: x, y: y });
            }
          }
        }

        onPointerUp() {
          if (this.state.drawing && this.state.currentPath.length >= 1) {
            const startPt = this.state.currentPath[0];
            const endPt = this.state.currentPath[this.state.currentPath.length - 1];
            const dist = this.state.currentPath.length > 1 ? Physics.distance(startPt.x, startPt.y, endPt.x, endPt.y) : 0;
            const isLoop = this.state.currentPath.length > 3 && dist < 50;
            this.state.paths.push({
              points: this.state.currentPath.slice(),
              created: Date.now(),
              isLoop: isLoop,
              colour: this.state.currentColour,
            });
          }
          this.state.drawing = false;
          this.state.currentPath = [];
        }
      }
      
      
      // Game Manager
      const GAME_ASSETS = {
        1: ["balls", "ppl", "other", "stars", "particles"], // Connections
        2: ["balls"], // Pop
        3: ["balls", "stars"], // Bounce
        4: ["balls", "stars"], // Brush
      };

      const GameManager = {
        games: {
          1: { name: "Connect", class: ConnectionsGame },
          2: { name: "Pop", class: PopGame },
          3: { name: "Bounce", class: BounceGame },
          4: { name: "Brush", class: BrushGame },
        },
        currentGameNum: 1,
        currentGame: null,

        async init() {
          await this.switchGame(1);
        },
        async switchGame(gameNum) {
          if (gameNum < 1 || gameNum > 4) return;
          this.currentGameNum = gameNum;
          ScreenShake.reset();

          // Update logo button highlights
          document.querySelectorAll(".logo-game-btn").forEach((btn) => {
            btn.classList.toggle("active", parseInt(btn.dataset.game) === gameNum);
          });

          // Load only the sheets this game needs (already-loaded ones are skipped)
          await Assets.loadSheets(GAME_ASSETS[gameNum]);

          const GameClass = this.games[gameNum].class;
          this.currentGame = new GameClass();
          this.currentGame.init();
        },

        update() {
          if (this.currentGame) this.currentGame.update();
        },

        draw() {
          if (this.currentGame) this.currentGame.draw();
        },

        onPointerDown(x, y) {
          if (this.currentGame && this.currentGame.onPointerDown) {
            this.currentGame.onPointerDown(x, y);
          }
        },

        onPointerMove(x, y) {
          if (this.currentGame && this.currentGame.onPointerMove) {
            this.currentGame.onPointerMove(x, y);
          }
        },

        onPointerUp() {
          if (this.currentGame && this.currentGame.onPointerUp) {
            this.currentGame.onPointerUp();
          }
        },
      };

      // Input Handler
      const Input = {
        mouseX: 0,
        mouseY: 0,
        isMouseDown: false,

        init() {
          this.setupMouseEvents();
          this.setupTouchEvents();
          this.setupKeyboardEvents();
          this.setupEasterEggs();
          this.setupResize();
        },

        getPointer(e) {
          const touch = e.touches ? e.touches[0] : e;
          const rect = canvas.getBoundingClientRect();
          return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
          };
        },

        setupMouseEvents() {
          const self = this;
          canvas.addEventListener("mousedown", (e) => {
            e.preventDefault();
            self.isMouseDown = true;
            const p = self.getPointer(e);
            GameManager.onPointerDown(p.x, p.y);
          });

          window.addEventListener("mousemove", (e) => {
            const p = self.getPointer(e);
            self.mouseX = p.x;
            self.mouseY = p.y;
            GameManager.onPointerMove(p.x, p.y);
          });

          window.addEventListener("mouseup", (e) => {
            if (self.isMouseDown) {
              self.isMouseDown = false;
              GameManager.onPointerUp();
            }
          });

          canvas.addEventListener("mouseleave", () => {
            // no longer stopping on leave
          });

          window.addEventListener("blur", () => {
            if (self.isMouseDown) {
              self.isMouseDown = false;
              GameManager.onPointerUp();
            }
          });
        },

        setupTouchEvents() {
          const self = this;
          canvas.addEventListener(
            "touchstart",
            (e) => {
              // Don't preventDefault here - let scrolling work by default
              const p = self.getPointer(e);

              // Only capture the touch if the user tapped on something interactive
              const game = GameManager.currentGame;
              let hitSomething = false;

              if (game instanceof ConnectionsGame) {
                hitSomething = game.findEntityAt(p.x, p.y) !== null;
              } else if (game instanceof PopGame) {
                hitSomething = game.balls.some((b) => !b.popping && Physics.contains(b, p.x, p.y));
              } else if (game instanceof BounceGame || game instanceof BrushGame) {
                hitSomething = true; // these games use draw gestures
              }

              if (hitSomething) {
                e.preventDefault();
                self.isMouseDown = true;
                GameManager.onPointerDown(p.x, p.y);
              }
            },
            { passive: false },
          );

          window.addEventListener(
            "touchmove",
            (e) => {
              if (self.isMouseDown) {
                e.preventDefault();
                const p = self.getPointer(e);
                self.mouseX = p.x;
                self.mouseY = p.y;
                GameManager.onPointerMove(p.x, p.y);
              }
            },
            { passive: false },
          );

          window.addEventListener("touchend", (e) => {
            if (self.isMouseDown) {
              self.isMouseDown = false;
              GameManager.onPointerUp();
            }
          });
        },

        setupKeyboardEvents() {
          document.addEventListener("keydown", (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 4) {
              GameManager.switchGame(num);
            }
          });
        },

        setupEasterEggs() {
          document.querySelectorAll(".logo-ball-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              const gameNum = parseInt(btn.dataset.game);
              GameManager.switchGame(gameNum);
              // Update active state
              document.querySelectorAll(".logo-ball-btn").forEach((b) => b.classList.remove("active"));
              btn.classList.add("active");
            });
          });
        },
        setupResize() {
          window.addEventListener("resize", () => {
            CoordinateSystem.update();
            resizeCanvas();
            if (GameManager.currentGame) {
              GameManager.currentGame.init();
            }
          });
        },
      };

      // Animation Loop
      function animate() {
        PosterTransition.update();
        ScreenShake.update();

        ctx.save();
        ctx.translate(ScreenShake.x, ScreenShake.y);
        ctx.clearRect(-10, -10, canvas.width + 20, canvas.height + 20);
        GameManager.update();
        GameManager.draw();
        ctx.restore();

        requestAnimationFrame(animate);
      }

      Input.init();
      PosterTransition.init();
      animate();
