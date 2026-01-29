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

      class FlingGame extends BaseGame {
        init() {
          super.init();
          this.state = {
            draggedBall: null,
            goldenOrbs: [],
            catchers: [],
            score: 0,
            lives: 5,
            gameTime: 0,
            lastCatcherSpawn: 0,
          };
          this.spawnBall();
          for (let i = 0; i < 3; i++) {
            this.state.goldenOrbs.push({
              x: 150 + Math.random() * (canvas.width - 300),
              y: 200 + Math.random() * (canvas.height - 400),
              radius: 25,
              pulse: Math.random() * Math.PI * 2,
            });
          }
          this.spawnCatcher();
          this.spawnCatcher();
        }

        spawnBall(animated) {
          const angle = Math.random() * Math.PI * 2;
          this.balls.push(
            this.createBall({
              x: canvas.width / 2 + (Math.random() - 0.5) * 200,
              y: canvas.height / 2 + (Math.random() - 0.5) * 200,
              vx: Math.cos(angle) * 0.5,
              vy: Math.sin(angle) * 0.5,
              radius: 30 + Math.random() * 20,
              isDragging: false,
              dragStartX: 0,
              dragStartY: 0,
              trail: [],
              glowTimer: 0,
              dying: false,
              deathProgress: 0,
              deathType: "explode",
              spawnProgress: animated ? 0 : 1,
              stretchAngle: 0,
              ballImage: ImageCounter.nextBestBall(),
              useBestBall: true,
            }),
          );
        }

        spawnCatcher() {
          let x, y;
          do {
            x = 100 + Math.random() * (canvas.width - 200);
            y = 100 + Math.random() * (canvas.height - 200);
          } while (Math.abs(x - canvas.width / 2) < 200 && Math.abs(y - canvas.height / 2) < 200);
          this.state.catchers.push({
            x: x,
            y: y,
            radius: 35,
            spawnProgress: 0,
            pulsePhase: Math.random() * Math.PI * 2,
            rotationPhase: Math.random() * Math.PI * 2,
          });
        }

        predictTrajectory(ball, vx, vy, power) {
          const points = [];
          let x = ball.x;
          let y = ball.y;
          let pvx = vx;
          let pvy = vy;
          let hasBounced = false;
          let stepsSinceBounce = 0;

          const totalSteps = Math.floor(40 + power * 3);

          for (let i = 0; i < totalSteps; i++) {
            pvx *= 0.995;
            pvy *= 0.995;
            x += pvx;
            y += pvy;

            let bounceThisFrame = false;
            if (x - ball.radius < 0) {
              x = ball.radius;
              pvx *= -0.95;
              bounceThisFrame = true;
            }
            if (x + ball.radius > canvas.width) {
              x = canvas.width - ball.radius;
              pvx *= -0.95;
              bounceThisFrame = true;
            }
            if (y - ball.radius < 0) {
              y = ball.radius;
              pvy *= -0.95;
              bounceThisFrame = true;
            }
            if (y + ball.radius > canvas.height) {
              y = canvas.height - ball.radius;
              pvy *= -0.95;
              bounceThisFrame = true;
            }

            if (bounceThisFrame && !hasBounced) {
              hasBounced = true;
              stepsSinceBounce = 0;
            }

            if (hasBounced) {
              stepsSinceBounce++;
              if (stepsSinceBounce > 30) break;
            }

            points.push({
              x,
              y,
              bounced: hasBounced,
              stepsSinceBounce: stepsSinceBounce,
              progress: i / totalSteps,
            });
          }
          return points;
        }

        update() {
          super.update();
          const s = this.state;
          s.gameTime++;

          if (s.catchers.length < 12 && s.gameTime - s.lastCatcherSpawn > 1200) {
            this.spawnCatcher();
            s.lastCatcherSpawn = s.gameTime;
          }

          s.goldenOrbs.forEach((o) => {
            o.pulse += 0.1;
          });

          s.catchers.forEach((c) => {
            if (c.spawnProgress < 1) c.spawnProgress += 0.01;
            c.pulsePhase += 0.08;
            c.rotationPhase += 0.02;
          });

          const self = this;
          for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];

            if (ball.spawnProgress < 1) {
              ball.spawnProgress += 0.05;
              ball.squashX = 0.3 + ball.spawnProgress * 0.7 + Math.sin(ball.spawnProgress * Math.PI) * 0.3;
              ball.squashY = 0.3 + ball.spawnProgress * 0.7 + Math.sin(ball.spawnProgress * Math.PI + Math.PI / 2) * 0.2;
              continue;
            }

            if (ball.dying) {
              ball.deathProgress += 0.06;
              ball.squashX = ball.deathType === "explode" ? 1 + ball.deathProgress * 1.5 : 1 + ball.deathProgress * 0.8;
              ball.squashY = ball.deathType === "explode" ? 1 - ball.deathProgress * 0.8 : 1 - ball.deathProgress * 0.9;
              if (ball.deathProgress >= 1) {
                this.balls.splice(i, 1);
                this.spawnBall(true);
              }
              continue;
            }

            if (ball.isDragging) {
              const pullDx = ball.dragStartX - ball.x;
              const pullDy = ball.dragStartY - ball.y;
              const pullDist = Math.sqrt(pullDx * pullDx + pullDy * pullDy);
              ball.stretchAngle = Math.atan2(pullDy, pullDx);

              const stretchAmount = Math.min(pullDist / 200, 0.25);
              ball.squashX = 1 - stretchAmount * 0.2;
              ball.squashY = 1 + stretchAmount * 0.25;
              continue;
            }

            if (ball.glowTimer > 0) ball.glowTimer--;

            ball.squashX += (1 - ball.squashX) * 0.15;
            ball.squashY += (1 - ball.squashY) * 0.15;

            const speed = Physics.getSpeed(ball);
            if (speed < 0.3) {
              const a = Math.atan2(ball.vy, ball.vx);
              ball.vx = Math.cos(a) * 0.5;
              ball.vy = Math.sin(a) * 0.5;
            }

            ball.vx *= 0.995;
            ball.vy *= 0.995;
            ball.x += ball.vx;
            ball.y += ball.vy;
            Physics.capSpeed(ball);
            ball.rotation += speed * 0.05;

            if (speed > 3) ball.trail.push({ x: ball.x, y: ball.y, life: 20 });
            ball.trail = ball.trail.filter((p) => p.life-- > 0);

            if (speed > 4) {
              for (let j = s.goldenOrbs.length - 1; j >= 0; j--) {
                const orb = s.goldenOrbs[j];
                if (Physics.distance(ball.x, ball.y, orb.x, orb.y) < ball.radius + orb.radius + 5) {
                  ball.glowTimer = 60;
                  s.score++;
                  self.particles.addBurst(orb.x, orb.y, 8, { speed: 4, life: 30, type: "star" });
                  orb.x = 150 + Math.random() * (canvas.width - 300);
                  orb.y = 200 + Math.random() * (canvas.height - 400);
                }
              }

              s.catchers.forEach((c) => {
                if (c.spawnProgress < 0.8) return;
                if (Physics.distance(ball.x, ball.y, c.x, c.y) < ball.radius + c.radius && !ball.dying) {
                  ball.dying = true;
                  ball.deathProgress = 0;
                  ball.deathType = Math.random() > 0.5 ? "explode" : "squish";
                  s.lives--;
                  ScreenShake.add(10);
                  for (let k = 0; k < 12; k++) {
                    const a = ((Math.PI * 2) / 12) * k;
                    self.particles.add({
                      x: ball.x,
                      y: ball.y,
                      vx: Math.cos(a) * (3 + Math.random() * 3),
                      vy: Math.sin(a) * (3 + Math.random() * 3),
                      life: 35,
                      maxLife: 35,
                      ballImage: ball.ballImage,
                      radius: ball.radius * 0.2,
                      rotation: Math.random() * Math.PI * 2,
                      spin: (Math.random() - 0.5) * 0.3,
                      gravity: 0.15,
                    });
                  }
                }
              });
            }

            if (ball.x - ball.radius < 0) {
              ball.x = ball.radius;
              ball.vx *= -0.95;
              ball.squashX = 0.7;
              ball.squashY = 1.2;
            }
            if (ball.x + ball.radius > canvas.width) {
              ball.x = canvas.width - ball.radius;
              ball.vx *= -0.95;
              ball.squashX = 0.7;
              ball.squashY = 1.2;
            }
            if (ball.y - ball.radius < 0) {
              ball.y = ball.radius;
              ball.vy *= -0.95;
              ball.squashX = 1.2;
              ball.squashY = 0.7;
            }
            if (ball.y + ball.radius > canvas.height) {
              ball.y = canvas.height - ball.radius;
              ball.vy *= -0.95;
              ball.squashX = 1.2;
              ball.squashY = 0.7;
            }
          }

          Physics.handleBallCollisions(this.balls);
        }

        draw() {
          const s = this.state;

          s.catchers.forEach((c) => {
            const op = Math.min(1, c.spawnProgress);
            const scale = 0.5 + c.spawnProgress * 0.5;
            ctx.save();
            ctx.globalAlpha = op;
            ctx.translate(c.x, c.y);
            ctx.scale(scale, scale);

            ctx.save();
            ctx.rotate(c.rotationPhase);
            Renderer.drawStarburst(0, 0, c.radius * 0.5, (c.radius + 18) * (1 + Math.sin(c.pulsePhase) * 0.15), 8, "rgba(255, 60, 60, 0.6)");
            ctx.restore();

            const dg = Renderer.createRadialGradient(0, 0, 0, c.radius * 1.2, [
              [0, "rgba(255, 0, 0, 0.25)"],
              [1, "rgba(255, 0, 0, 0)"],
            ]);
            ctx.beginPath();
            ctx.arc(0, 0, c.radius * 1.2, 0, Math.PI * 2);
            ctx.fillStyle = dg;
            ctx.fill();

            ctx.restore();
          });

          s.goldenOrbs.forEach((orb) => {
            const ps = 1 + Math.sin(orb.pulse) * 0.2;
            const g = Renderer.createRadialGradient(orb.x, orb.y, 0, orb.radius * ps * 2, [
              [0, "rgba(255, 215, 0, 0.8)"],
              [0.5, "rgba(255, 180, 0, 0.3)"],
              [1, "rgba(255, 150, 0, 0)"],
            ]);
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.radius * ps * 2, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.radius * ps, 0, Math.PI * 2);
            ctx.fillStyle = "#FFD700";
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 200, 0.8)";
            ctx.lineWidth = 3;
            ctx.stroke();
          });

          super.draw();

          this.balls.forEach((ball) => {
            ball.trail.forEach((p) => {
              const a = p.life / 25;
              ctx.beginPath();
              ctx.arc(p.x, p.y, ball.radius * a * 0.5, 0, Math.PI * 2);
              ctx.fillStyle = ball.glowTimer > 0 ? "rgba(255, 215, 0, " + a * 0.3 + ")" : "rgba(200, 150, 150, " + a * 0.2 + ")";
              ctx.fill();
            });

            if (ball.glowTimer > 0) {
              const g = Renderer.createRadialGradient(ball.x, ball.y, ball.radius * 0.5, ball.radius * 1.8, [
                [0, "rgba(255, 215, 0, " + ball.glowTimer / 120 + ")"],
                [1, "rgba(255, 215, 0, 0)"],
              ]);
              ctx.beginPath();
              ctx.arc(ball.x, ball.y, ball.radius * 1.8, 0, Math.PI * 2);
              ctx.fillStyle = g;
              ctx.fill();
            }

            const op = ball.dying ? 1 - ball.deathProgress : ball.spawnProgress < 1 ? ball.spawnProgress : ball.isDragging ? 0.8 : 1.0;

            if (ball.isDragging) {
              const vx = (ball.dragStartX - ball.x) * 0.45;
              const vy = (ball.dragStartY - ball.y) * 0.45;
              const power = Math.sqrt(vx * vx + vy * vy);

              if (power > 2) {
                const trajectory = this.predictTrajectory(ball, vx, vy, power);
                const dotSize = 18;

                for (let i = 2; i < trajectory.length; i += 2) {
                  const pt = trajectory[i];

                  const ballImageIndex = (i % Config.NUM_BALL_IMAGES) + 1;
                  const img = Assets.getBallImage(ballImageIndex);

                  let alpha;
                  if (!pt.bounced) {
                    alpha = 0.6 - pt.progress * 0.2;
                  } else {
                    alpha = Math.max(0, 0.45 - pt.stepsSinceBounce * 0.02);
                  }

                  if (alpha > 0.05 && Assets.isImageReady(img)) {
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.drawImage(img, pt.x - dotSize / 2, pt.y - dotSize / 2, dotSize, dotSize);
                    ctx.restore();
                  }
                }
              }

              const pullDist = Math.sqrt(
                (ball.dragStartX - ball.x) * (ball.dragStartX - ball.x) + (ball.dragStartY - ball.y) * (ball.dragStartY - ball.y),
              );
              const bandAlpha = Math.min(pullDist / 150, 0.5);
              ctx.beginPath();
              ctx.moveTo(ball.dragStartX, ball.dragStartY);
              ctx.lineTo(ball.x, ball.y);
              ctx.strokeStyle = `rgba(60, 60, 60, ${bandAlpha})`;
              ctx.lineWidth = 3;
              ctx.lineCap = "round";
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(ball.dragStartX, ball.dragStartY, 5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(50, 50, 50, ${bandAlpha + 0.15})`;
              ctx.fill();

              ctx.save();
              ctx.translate(ball.x, ball.y);
              ctx.rotate(ball.stretchAngle);
              ctx.scale(ball.squashY, ball.squashX);
              ctx.translate(-ball.x, -ball.y);

              const ballImg = Assets.getBestBallImage(ball.ballImage);
              if (Assets.isImageReady(ballImg)) {
                ctx.globalAlpha = op;
                ctx.drawImage(ballImg, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
              }
              ctx.restore();
            } else {
              const img = Assets.getBestBallImage(ball.ballImage);
              if (Assets.isImageReady(img)) {
  ctx.save();
  ctx.globalAlpha = op;
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.rotation);
  ctx.scale(ball.squashX, ball.squashY);
  ctx.drawImage(img, -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
  ctx.restore();
} else {
  // Fallback circle
  ctx.save();
  ctx.globalAlpha = op;
  ctx.translate(ball.x, ball.y);
  ctx.scale(ball.squashX, ball.squashY);
  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ff6b6b';
  ctx.fill();
  ctx.restore();
}
            }
          });
        }

        onPointerDown(x, y) {
          for (let i = this.balls.length - 1; i >= 0; i--) {
            if (Physics.contains(this.balls[i], x, y) && !this.balls[i].dying && this.balls[i].spawnProgress >= 1) {
              this.state.draggedBall = this.balls[i];
              this.balls[i].isDragging = true;
              this.balls[i].dragStartX = x;
              this.balls[i].dragStartY = y;
              break;
            }
          }
        }

        onPointerMove(x, y) {
          if (!this.state.draggedBall) return;
          const ball = this.state.draggedBall;
          const pad = ball.radius + 10;
          ball.x = Math.max(pad, Math.min(canvas.width - pad, x));
          ball.y = Math.max(pad, Math.min(canvas.height - pad, y));
        }

        onPointerUp() {
          if (!this.state.draggedBall) return;
          const ball = this.state.draggedBall;
          ball.vx = (ball.dragStartX - ball.x) * 0.45;
          ball.vy = (ball.dragStartY - ball.y) * 0.45;
          Physics.capSpeed(ball);
          ball.isDragging = false;

          ball.squashX = 1.2;
          ball.squashY = 0.8;

          this.state.draggedBall = null;
        }
      }

      class PaddleGame extends BaseGame {
        init() {
          super.init();
          this.state = {
            mouseX: canvas.width / 2,
            mouseY: canvas.height / 2,
            lastMouseX: canvas.width / 2,
            lastMouseY: canvas.height / 2,
            // personIndex: ImageCounter.nextPerson(),
            personIndex: 6,
            paddlePulse: 0,
            squashX: 1,
            squashY: 1,
          };
          const baseRadius = Config.isMobile ? 25 : 35,
            radiusVariance = Config.isMobile ? 15 : 20;
          for (let i = 0; i < 55; i++) {
            const a = Math.random() * Math.PI * 2,
              s = 2 + Math.random() * 2;
            this.balls.push(
              this.createBall({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                radius: baseRadius + Math.random() * radiusVariance,
                lastHitTime: Date.now(),
                sleepy: false,
                fadeProgress: 0,
                wallHitTimer: 0,
              }),
            );
          }
        }
        update() {
          super.update();
          this.state.paddlePulse += 0.05;
          this.state.squashX += (1 - this.state.squashX) * 0.2;
          this.state.squashY += (1 - this.state.squashY) * 0.2;

          const s = this.state,
            mVx = s.mouseX - s.lastMouseX,
            mVy = s.mouseY - s.lastMouseY;
          for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            ball.vy += 0.15;
            const speed = Physics.getSpeed(ball);
            ball.vx *= 0.995;
            ball.vy *= 0.995;
            ball.x += ball.vx;
            ball.y += ball.vy;
            ball.rotation += speed * 0.02;
            Physics.capSpeed(ball);
            if (ball.wallHitTimer > 0) ball.wallHitTimer--;
            else {
              ball.squashX += (1 - ball.squashX) * 0.3;
              ball.squashY += (1 - ball.squashY) * 0.3;
            }
            if (speed < 1.5 && Date.now() - ball.lastHitTime > 3000) {
              ball.sleepy = true;
              ball.fadeProgress += 0.008;
              if (ball.fadeProgress >= 1) {
                this.balls.splice(i, 1);
                this.spawnNewBall();
                continue;
              }
            } else {
              ball.sleepy = false;
              ball.fadeProgress = Math.max(0, ball.fadeProgress - 0.02);
              ball.lastHitTime = Date.now();
            }
            this.handleWalls(ball);
            this.handlePaddle(ball, mVx, mVy);
          }
          Physics.handleBallCollisions(this.balls);
          s.lastMouseX = s.mouseX;
          s.lastMouseY = s.mouseY;
        }
        handleWalls(ball) {
          if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.vx *= -0.9;
            if (ball.vx > 1) {
              ball.squashX = 0.85;
              ball.squashY = 1.15;
              ball.wallHitTimer = 3;
            }
          }
          if (ball.x + ball.radius > canvas.width) {
            ball.x = canvas.width - ball.radius;
            ball.vx *= -0.9;
            if (ball.vx < -1) {
              ball.squashX = 0.85;
              ball.squashY = 1.15;
              ball.wallHitTimer = 3;
            }
          }
          if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.vy *= -0.9;
            if (ball.vy > 1) {
              ball.squashX = 1.15;
              ball.squashY = 0.85;
              ball.wallHitTimer = 3;
            }
          }
          if (ball.y + ball.radius > canvas.height) {
            ball.y = canvas.height - ball.radius;
            ball.vy *= -0.7;
            if (ball.vy < -1) {
              ball.squashX = 1.15;
              ball.squashY = 0.85;
              ball.wallHitTimer = 3;
            }
          }
        }
        handlePaddle(ball, mVx, mVy) {
          const s = this.state,
            dx = ball.x - s.mouseX,
            dy = ball.y - s.mouseY,
            dist = Math.sqrt(dx * dx + dy * dy),
            padR = 55;
          if (dist < ball.radius + padR) {
            const mSpeed = Math.sqrt(mVx * mVx + mVy * mVy),
              force = Math.min(mSpeed * 0.5, 15),
              ang = Math.atan2(dy, dx);
            ball.vx += Math.cos(ang) * force;
            ball.vy += Math.sin(ang) * force;
            const overlap = ball.radius + padR - dist;
            ball.x += Math.cos(ang) * overlap;
            ball.y += Math.sin(ang) * overlap;
            ball.lastHitTime = Date.now();
            ball.sleepy = false;
            if (force > 3) {
              ScreenShake.add(force * 0.3);
              this.state.squashX = 1.06;
              this.state.squashY = 0.89;
            }
            Physics.capSpeed(ball);
          }
        }
        spawnNewBall() {
          const a = Math.random() * Math.PI * 2,
            ns = 3 + Math.random() * 2;
          this.balls.push(
            this.createBall({
              x: Math.random() * canvas.width,
              y: 100,
              vx: Math.cos(a) * ns,
              vy: Math.sin(a) * ns,
              radius: 35 + Math.random() * 20,
              lastHitTime: Date.now(),
              sleepy: false,
              fadeProgress: 0,
              wallHitTimer: 0,
            }),
          );
        }
        draw() {
          super.draw();
          const self = this;
          this.balls.forEach(function (ball) {
            const op = 1 - ball.fadeProgress;
            if (ball.sleepy) {
              ctx.fillStyle = "rgba(100, 100, 200, " + 0.3 * op + ")";
              ctx.font = "20px Arial";
              ctx.textAlign = "center";
              ctx.fillText("💤", ball.x, ball.y - ball.radius - 10);
            }
            Renderer.drawBallWithSquash(ball, op, ball.rotation, ball.squashX, ball.squashY);
          });
          const pulseSize = 80 + Math.sin(this.state.paddlePulse) * 8;
          const pulseAlpha = 0.4 + Math.sin(this.state.paddlePulse) * 0.15;
          ctx.beginPath();
          ctx.arc(this.state.mouseX, this.state.mouseY, pulseSize, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255, 220, 50, " + pulseAlpha + ")";
          ctx.lineWidth = 60;
          ctx.stroke();
          ctx.save();
          ctx.translate(this.state.mouseX, this.state.mouseY + 80);
          ctx.scale(this.state.squashX, this.state.squashY);
          ctx.translate(-this.state.mouseX, -(this.state.mouseY + 80));
          Renderer.drawPerson(this.state.mouseX, this.state.mouseY + 80, 180, this.state.personIndex);
          ctx.restore();
        }
        onPointerMove(x, y) {
          this.state.mouseX = x;
          this.state.mouseY = y;
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

      class VacuumGame extends BaseGame {
        init() {
          super.init();
          this.state = { mouseX: canvas.width / 2, mouseY: canvas.height / 2, isVacuuming: false, vacuumStrength: 0 };
          const baseRadius = Config.isMobile ? 20 : 30,
            radiusVariance = Config.isMobile ? 18 : 25;
          for (let i = 0; i < 30; i++)
            this.balls.push(
              this.createBall({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                radius: baseRadius + Math.random() * radiusVariance,
              }),
            );
        }
        update() {
          super.update();
          const s = this.state;
          if (s.isVacuuming) s.vacuumStrength = Math.min(s.vacuumStrength + 3, 100);
          this.balls.forEach(function (ball) {
            if (s.isVacuuming) {
              const dx = s.mouseX - ball.x,
                dy = s.mouseY - ball.y,
                dist = Math.sqrt(dx * dx + dy * dy),
                force = Math.min(s.vacuumStrength / (dist + 20), 8);
              ball.vx += (dx / dist) * force;
              ball.vy += (dy / dist) * force;
            }
            if (ball.x < canvas.width / 2) ball.vx -= 0.15;
            else ball.vx += 0.15;
            ball.vx *= 0.98;
            ball.vy *= 0.98;
            ball.x += ball.vx;
            ball.y += ball.vy;
            Physics.capSpeed(ball);
            ball.squashX += (1 - ball.squashX) * 0.1;
            ball.squashY += (1 - ball.squashY) * 0.1;
            if (ball.x - ball.radius < 0) {
              ball.x = ball.radius;
              ball.vx *= -0.9;
              ball.squashX = 0.92;
              ball.squashY = 1.08;
            }
            if (ball.x + ball.radius > canvas.width) {
              ball.x = canvas.width - ball.radius;
              ball.vx *= -0.9;
              ball.squashX = 0.92;
              ball.squashY = 1.08;
            }
            if (ball.y - ball.radius < 0) {
              ball.y = ball.radius;
              ball.vy *= -0.9;
              ball.squashX = 1.08;
              ball.squashY = 0.92;
            }
            if (ball.y + ball.radius > canvas.height) {
              ball.y = canvas.height - ball.radius;
              ball.vy *= -0.9;
              ball.squashX = 1.08;
              ball.squashY = 0.92;
            }
          });
          for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
              const b1 = this.balls[i],
                b2 = this.balls[j],
                dx = b2.x - b1.x,
                dy = b2.y - b1.y,
                dist = Math.sqrt(dx * dx + dy * dy),
                minDist = b1.radius + b2.radius;
              if (dist < minDist) {
                const ang = Math.atan2(dy, dx),
                  ax = (minDist - dist) * Math.cos(ang) * 0.05,
                  ay = (minDist - dist) * Math.sin(ang) * 0.05;
                b1.vx -= ax;
                b1.vy -= ay;
                b2.vx += ax;
                b2.vy += ay;
                b1.squashX = 0.94;
                b1.squashY = 1.06;
                b2.squashX = 0.94;
                b2.squashY = 1.06;
              }
            }
          }
        }
        draw() {
          super.draw();
          const s = this.state;
          if (s.isVacuuming) {
            const maxR = 150;
            for (let i = 0; i < 3; i++) {
              ctx.beginPath();
              const r = maxR * (1 - i * 0.3) * (s.vacuumStrength / 100);
              ctx.arc(s.mouseX, s.mouseY, r, 0, Math.PI * 2);
              ctx.strokeStyle = "rgba(100, 100, 100, " + (0.3 - i * 0.1) + ")";
              ctx.lineWidth = 3;
              ctx.stroke();
            }
            ctx.beginPath();
            ctx.arc(s.mouseX, s.mouseY, 10, 0, Math.PI * 2);
            ctx.fillStyle = "#666";
            ctx.fill();
          }
          this.balls.forEach(function (ball) {
            Renderer.drawBallWithSquash(ball, 1, 0, ball.squashX, ball.squashY);
          });
        }
        onPointerDown(x, y) {
          this.state.mouseX = x;
          this.state.mouseY = y;
          this.state.isVacuuming = true;
          this.state.vacuumStrength = 0;
        }
        onPointerMove(x, y) {
          this.state.mouseX = x;
          this.state.mouseY = y;
        }
        onPointerUp() {
          const s = this.state;
          if (s.isVacuuming) {
            ScreenShake.add(s.vacuumStrength * 0.1);
            this.balls.forEach(function (ball) {
              const dx = ball.x - s.mouseX,
                dy = ball.y - s.mouseY,
                dist = Math.sqrt(dx * dx + dy * dy),
                force = Math.min(5000 / (dist + 50), 20);
              ball.vx += (dx / dist) * force;
              ball.vy += (dy / dist) * force;
              ball.squashX = 0.85;
              ball.squashY = 1.15;
              Physics.capSpeed(ball);
            });
            s.isVacuuming = false;
            s.vacuumStrength = 0;
          }
        }
      }

      class GravityFlipGame extends BaseGame {
        init() {
          super.init();
          this.state = { gravityDir: 1, stars: [], score: 0 };
          for (let i = 0; i < 30; i++)
            this.balls.push(
              this.createBall({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: 25 + Math.random() * 20,
              }),
            );
          this.spawnStars();
        }
        spawnStars() {
          this.state.stars = [];
          for (let i = 0; i < 5; i++) {
            const onCeiling = Math.random() > 0.5;
            this.state.stars.push({
              x: 80 + Math.random() * (canvas.width - 160),
              y: onCeiling ? 40 + Math.random() * 30 : canvas.height - 40 - Math.random() * 30,
              radius: 20,
              onCeiling: onCeiling,
              pulse: Math.random() * Math.PI * 2,
              collected: false,
              respawnTimer: 0,
              starType: Math.floor(Math.random() * 3),
            });
          }
        }
        update() {
          super.update();
          const self = this;
          const s = this.state;

          s.stars.forEach((star) => {
            star.pulse += 0.08;
            if (star.collected) {
              star.respawnTimer--;
              if (star.respawnTimer <= 0) {
                star.collected = false;
                star.onCeiling = Math.random() > 0.5;
                star.x = 80 + Math.random() * (canvas.width - 160);
                star.y = star.onCeiling ? 40 + Math.random() * 30 : canvas.height - 40 - Math.random() * 30;
                star.starType = Math.floor(Math.random() * 3);
              }
            }
          });

          this.balls.forEach(function (ball) {
            ball.vy += 0.25 * self.state.gravityDir;
            ball.vx *= 0.98;
            ball.vy *= 0.98;
            ball.x += ball.vx;
            ball.y += ball.vy;
            Physics.capSpeed(ball);
            ball.squashX += (1 - ball.squashX) * 0.25;
            ball.squashY += (1 - ball.squashY) * 0.25;
            if (ball.x - ball.radius < 0) {
              ball.x = ball.radius;
              ball.vx *= -0.75;
              ball.squashX = 0.85;
              ball.squashY = 1.15;
            }
            if (ball.x + ball.radius > canvas.width) {
              ball.x = canvas.width - ball.radius;
              ball.vx *= -0.75;
              ball.squashX = 0.85;
              ball.squashY = 1.15;
            }
            if (ball.y - ball.radius < 0) {
              ball.y = ball.radius;
              ball.vy *= -0.75;
              ball.squashX = 1.15;
              ball.squashY = 0.85;
            }
            if (ball.y + ball.radius > canvas.height) {
              ball.y = canvas.height - ball.radius;
              ball.vy *= -0.75;
              ball.squashX = 1.15;
              ball.squashY = 0.85;
            }

            s.stars.forEach((star) => {
              if (star.collected) return;
              const dist = Physics.distance(ball.x, ball.y, star.x, star.y);
              if (dist < ball.radius + star.radius) {
                star.collected = true;
                star.respawnTimer = 180;
                s.score++;
                ScreenShake.add(6);
                self.particles.addBurst(star.x, star.y, 10, {
                  speed: 4,
                  speedVariance: 3,
                  life: 40,
                  size: 20,
                  sizeVariance: 15,
                  gravity: 0.1,
                  type: "star",
                });
              }
            });
          });
          for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
              const b1 = this.balls[i],
                b2 = this.balls[j],
                dx = b2.x - b1.x,
                dy = b2.y - b1.y,
                dist = Math.sqrt(dx * dx + dy * dy),
                minDist = b1.radius + b2.radius;
              if (dist < minDist) {
                const ang = Math.atan2(dy, dx),
                  ax = (minDist - dist) * Math.cos(ang) * 0.05,
                  ay = (minDist - dist) * Math.sin(ang) * 0.05;
                b1.vx -= ax;
                b1.vy -= ay;
                b2.vx += ax;
                b2.vy += ay;
                b1.squashX = 0.9;
                b1.squashY = 1.1;
                b2.squashX = 0.9;
                b2.squashY = 1.1;
              }
            }
          }
        }
        draw() {
          super.draw();
          const s = this.state;

          s.stars.forEach((star) => {
            if (star.collected) return;
            const pulseScale = 1 + Math.sin(star.pulse) * 0.15;
            const size = star.radius * 2 * pulseScale;

            const glow = Renderer.createRadialGradient(star.x, star.y, 0, size * 1.3, [
              [0, "rgba(255, 220, 100, 0.4)"],
              [1, "rgba(255, 220, 100, 0)"],
            ]);
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(star.x, star.y, size * 1.3, 0, Math.PI * 2);
            ctx.fill();

            const img = Assets.getStarImage(star.starType);
            if (Assets.isImageReady(img)) {
              ctx.save();
              ctx.translate(star.x, star.y);
              ctx.rotate(star.pulse * 0.1);
              ctx.drawImage(img, -size / 2, -size / 2, size, size);
              ctx.restore();
            }
          });

          this.balls.forEach(function (ball) {
            Renderer.drawBallWithSquash(ball, 1, 0, ball.squashX, ball.squashY);
          });
          const aY = this.state.gravityDir === 1 ? canvas.height - 30 : 30;
          ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
          ctx.font = "bold 24px Arial";
          ctx.textAlign = "center";
          ctx.fillText(this.state.gravityDir === 1 ? "↓" : "↑", canvas.width / 2, aY);
        }
        onPointerDown() {
          this.state.gravityDir *= -1;
          ScreenShake.add(4);
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
          this.spawnBall();
        }

        spawnBall() {
          const ballRadius = Config.isMobile ? 20 : 30;
          this.balls.push(
            this.createBall({
              x: 100 + Math.random() * (canvas.width - 200),
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

      class MagnetZonesGame extends BaseGame {
        init() {
          super.init();
          this.state = { magnets: [], shiftPressed: false, lastTapTime: 0, lastTapX: 0, lastTapY: 0 };
          for (let i = 0; i < 20; i++)
            this.balls.push(
              this.createBall({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                radius: 18 + Math.random() * 15,
              }),
            );
        }
        update() {
          super.update();
          const self = this;
          this.state.magnets = this.state.magnets.filter(function (m) {
            return Date.now() - m.created < 10000;
          });
          this.balls.forEach(function (ball) {
            ball.vy += 0.15;
            self.state.magnets.forEach(function (magnet) {
              const dx = magnet.x - ball.x,
                dy = magnet.y - ball.y,
                dist = Math.sqrt(dx * dx + dy * dy),
                force = (magnet.type === "attract" ? 1 : -1) * Math.min(200 / (dist + 20), 4);
              ball.vx += (dx / dist) * force;
              ball.vy += (dy / dist) * force;
            });
            ball.vx *= 0.98;
            ball.vy *= 0.98;
            ball.x += ball.vx;
            ball.y += ball.vy;
            Physics.capSpeed(ball);
            Physics.handleWallCollision(ball, canvas, 0.7, false);
          });
          Physics.handleBallCollisions(this.balls);
        }
        draw() {
          super.draw();
          const self = this;
          this.state.magnets.forEach(function (magnet) {
            const age = Date.now() - magnet.created,
              op = Math.max(0, 1 - age / 10000),
              isAttr = magnet.type === "attract",
              time = Date.now() * 0.0015;
            if (isAttr) {
              for (let i = 0; i < 4; i++) {
                const bR = 100 - ((time * 30 + i * 25) % 100);
                ctx.beginPath();
                ctx.arc(magnet.x, magnet.y, bR, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(50, 150, 255, " + op * (0.5 - i * 0.1) + ")";
                ctx.lineWidth = 3;
                ctx.stroke();
              }
            } else {
              for (let i = 0; i < 4; i++) {
                const bR = 20 + ((time * 30 + i * 25) % 100);
                ctx.beginPath();
                ctx.arc(magnet.x, magnet.y, bR, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(255, 80, 80, " + op * (0.5 - i * 0.1) + ")";
                ctx.lineWidth = 3;
                ctx.stroke();
              }
            }
            const g = Renderer.createRadialGradient(magnet.x, magnet.y, 0, 60, [
              [0, isAttr ? "rgba(50, 150, 255, " + op * 0.4 + ")" : "rgba(255, 80, 80, " + op * 0.4 + ")"],
              [1, isAttr ? "rgba(50, 150, 255, 0)" : "rgba(255, 80, 80, 0)"],
            ]);
            ctx.beginPath();
            ctx.arc(magnet.x, magnet.y, 60, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
            Renderer.drawPerson(magnet.x, magnet.y + 80, 55, magnet.personIndex, op);
            ctx.font = "bold 28px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = isAttr ? "rgba(50, 150, 255, " + op + ")" : "rgba(255, 80, 80, " + op + ")";
            ctx.fillText(isAttr ? "⊕" : "⊖", magnet.x, magnet.y - 5);
          });
          this.balls.forEach(function (ball) {
            Renderer.drawBall(ball);
          });
          ctx.fillStyle = "#666";
          ctx.font = "14px Arial";
          ctx.textAlign = "left";
          ctx.fillText(
            Config.isMobile
              ? this.state.shiftPressed
                ? "Mode: REPEL"
                : "Mode: ATTRACT [double-tap for repel]"
              : this.state.shiftPressed
                ? "Mode: REPEL"
                : "Mode: ATTRACT [hold SHIFT]",
            20,
            canvas.height - 80,
          );
        }
        onPointerDown(x, y) {
          const now = Date.now(),
            timeSinceLastTap = now - this.state.lastTapTime,
            distFromLastTap = Math.sqrt(
              (x - this.state.lastTapX) * (x - this.state.lastTapX) + (y - this.state.lastTapY) * (y - this.state.lastTapY),
            );
          const isDoubleTap = Config.isMobile && timeSinceLastTap < 300 && distFromLastTap < 50;
          const type = this.state.shiftPressed || isDoubleTap ? "repel" : "attract";
          this.state.magnets.push({ x: x, y: y, type: type, created: Date.now(), personIndex: ImageCounter.nextPerson() });
          this.state.lastTapTime = now;
          this.state.lastTapX = x;
          this.state.lastTapY = y;
        }
      }

      class ExplodeGame extends BaseGame {
        init() {
          super.init();
          this.state = { chargeStart: 0, charging: false, chargeX: 0, chargeY: 0 };
        }
        update() {
          super.update();
          for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            ball.vy += 0.2;
            ball.vx *= 0.99;
            ball.vy *= 0.99;
            ball.x += ball.vx;
            ball.y += ball.vy;
            Physics.capSpeed(ball);
            ball.life--;
            ball.opacity = Math.min(1, ball.life / 60);
            if (ball.life <= 0 || ball.y > canvas.height + 50) {
              this.balls.splice(i, 1);
              continue;
            }
            Physics.handleWallCollision(ball, canvas, 0.7, false);
          }
          Physics.handleBallCollisions(this.balls);
        }
        draw() {
          super.draw();
          const s = this.state;
          if (s.charging) {
            const cT = Date.now() - s.chargeStart,
              cA = Math.min(cT / 1000, 1),
              r = 20 + cA * 60,
              pulse = Math.sin(Date.now() * 0.02) * 5;
            ctx.beginPath();
            ctx.arc(s.chargeX, s.chargeY, r + pulse, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(100, 100, 100, " + (0.3 + cA * 0.4) + ")";
            ctx.lineWidth = 3 + cA * 3;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(s.chargeX, s.chargeY, r * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(80, 80, 80, " + (0.3 + cA * 0.5) + ")";
            ctx.fill();
            ctx.fillStyle = "#666";
            ctx.font = 'bold 16px "Courier New", Courier, monospace';
            ctx.textAlign = "center";
            ctx.fillText(Math.floor(cA * 100) + "%", s.chargeX, s.chargeY + r + 25);
          }
          this.balls.forEach(function (ball) {
            ctx.save();
            ctx.globalAlpha = ball.opacity;
            Renderer.drawBall(ball);
            ctx.restore();
          });
        }
        onPointerDown(x, y) {
          this.state.charging = true;
          this.state.chargeStart = Date.now();
          this.state.chargeX = x;
          this.state.chargeY = y;
        }
        onPointerUp() {
          const s = this.state;
          if (!s.charging) return;
          const cT = Date.now() - s.chargeStart,
            cA = Math.min(cT / 1000, 1),
            power = 5 + cA * 12,
            numBalls = Math.floor(8 + cA * 27);
          ScreenShake.add(cA * 10);
          for (let i = 0; i < numBalls; i++) {
            const ang = ((Math.PI * 2) / numBalls) * i + Math.random() * 0.2,
              sV = 0.7 + Math.random() * 0.6;
            this.balls.push(
              this.createBall({
                x: s.chargeX,
                y: s.chargeY,
                vx: Math.cos(ang) * power * sV,
                vy: Math.sin(ang) * power * sV,
                radius: 12 + Math.random() * 29,
                life: 150 + Math.random() * 100,
                opacity: 1,
              }),
            );
          }
          s.charging = false;
        }
      }



      
class ChargeGame extends BaseGame {
  init() {
    super.init();
    this.state = {
      forceStrength: 0.15,
      maxForceDistance: 250,
    };

    const baseRadius = Config.isMobile ? 25 : 35;
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      this.balls.push(
        this.createBall({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: baseRadius + Math.random() * 15,
          charge: Math.random() > 0.5 ? 1 : -1, // 1 = positive, -1 = negative
          pulsePhase: Math.random() * Math.PI * 2,
        })
      );
    }
  }

  update() {
    super.update();
    const s = this.state;

    // Apply charge forces between all balls
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const b1 = this.balls[i];
        const b2 = this.balls[j];

        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < s.maxForceDistance && dist > 0) {
          // Force falls off with distance squared (like real electromagnetism)
          const forceMagnitude = s.forceStrength * (1 - dist / s.maxForceDistance);
          
          // Same charge = repel (positive force), opposite = attract (negative force)
          const chargeProduct = b1.charge * b2.charge;
          const force = forceMagnitude * chargeProduct;

          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          // Apply forces (opposite directions)
          b1.vx -= fx;
          b1.vy -= fy;
          b2.vx += fx;
          b2.vy += fy;
        }
      }
    }

    // Update balls
    this.balls.forEach((ball) => {
      ball.pulsePhase += 0.08;

      ball.vx *= 0.98;
      ball.vy *= 0.98;

      // Minimum speed to keep things interesting
      const speed = Physics.getSpeed(ball);
      if (speed < 0.5) {
        const angle = Math.random() * Math.PI * 2;
        ball.vx += Math.cos(angle) * 0.3;
        ball.vy += Math.sin(angle) * 0.3;
      }

      ball.x += ball.vx;
      ball.y += ball.vy;
      Physics.capSpeed(ball);

      ball.squashX = ball.squashX || 1;
      ball.squashY = ball.squashY || 1;
      ball.squashX += (1 - ball.squashX) * 0.15;
      ball.squashY += (1 - ball.squashY) * 0.15;

      // Wall collisions
      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx *= -0.8;
        ball.squashX = 0.85;
        ball.squashY = 1.15;
      }
      if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx *= -0.8;
        ball.squashX = 0.85;
        ball.squashY = 1.15;
      }
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -0.8;
        ball.squashX = 1.15;
        ball.squashY = 0.85;
      }
      if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy *= -0.8;
        ball.squashX = 1.15;
        ball.squashY = 0.85;
      }
    });

    Physics.handleBallCollisions(this.balls);
  }

  draw() {
    super.draw();

    // Draw connection lines between nearby opposite charges
    ctx.lineWidth = 1;
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const b1 = this.balls[i];
        const b2 = this.balls[j];

        if (b1.charge !== b2.charge) {
          const dist = Physics.distance(b1.x, b1.y, b2.x, b2.y);
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.2;
            ctx.beginPath();
            ctx.moveTo(b1.x, b1.y);
            ctx.lineTo(b2.x, b2.y);
            ctx.strokeStyle = `rgba(150, 150, 150, ${alpha})`;
            ctx.stroke();
          }
        }
      }
    }

    // Draw balls with charge indicators
    this.balls.forEach((ball) => {
      const isPositive = ball.charge === 1;
      const color = isPositive ? "rgba(255, 100, 100," : "rgba(100, 150, 255,";
      const pulseSize = 1 + Math.sin(ball.pulsePhase) * 0.1;

      // Charge aura
      const auraRadius = ball.radius * 1.4 * pulseSize;
      const glow = Renderer.createRadialGradient(ball.x, ball.y, ball.radius * 0.5, auraRadius, [
        [0, color + " 0.25)"],
        [1, color + " 0)"],
      ]);
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, auraRadius, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Ball
      Renderer.drawBallWithSquash(ball, 1, 0, ball.squashX, ball.squashY);

      // Charge symbol
      ctx.fillStyle = isPositive ? "rgba(255, 80, 80, 0.9)" : "rgba(80, 130, 255, 0.9)";
      ctx.font = `bold ${ball.radius * 0.8}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(isPositive ? "+" : "−", ball.x, ball.y);
    });
  }

  onPointerDown(x, y) {
    // Flip charge of clicked ball
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      if (Physics.contains(ball, x, y)) {
        ball.charge *= -1;
        ball.pulsePhase = 0;
        
        // Visual feedback
        ball.squashX = 1.3;
        ball.squashY = 0.7;
        ScreenShake.add(3);
        
        this.particles.addBurst(ball.x, ball.y, 8, {
          speed: 3,
          speedVariance: 2,
          life: 25,
          size: 10,
          sizeVariance: 8,
          gravity: 0.05,
          type: "star",
        });
        
        break;
      }
    }
  }
}
      

      class OrbitalGame extends BaseGame {
        init() {
          super.init();
          this.state = { mouseX: canvas.width / 2, mouseY: canvas.height / 2 };
          for (let i = 0; i < 40; i++) {
            const ang = ((Math.PI * 2) / 40) * i,
              dist = 60 + Math.random() * 180;
            this.balls.push({
              angle: ang,
              distance: dist,
              angleSpeed: (0.02 + Math.random() * 0.04) * (Math.random() > 0.5 ? 1 : -1),
              radius: 45 + Math.random() * 18,
              orbiting: true,
              vx: 0,
              vy: 0,
              x: 0,
              y: 0,
              ballImage: ImageCounter.nextBall(),
              originalDistance: dist,
            });
          }
        }
        update() {
          super.update();
          const s = this.state;
          this.balls.forEach(function (ball) {
            if (ball.orbiting) {
              ball.angle += ball.angleSpeed;
              ball.x = s.mouseX + Math.cos(ball.angle) * ball.distance;
              ball.y = s.mouseY + Math.sin(ball.angle) * ball.distance;
            } else {
              ball.vy += 0.2;
              ball.vx *= 0.98;
              ball.vy *= 0.98;
              ball.x += ball.vx;
              ball.y += ball.vy;
              Physics.capSpeed(ball);
              Physics.handleWallCollision(ball, canvas, 0.7, false);
              const dx = s.mouseX - ball.x,
                dy = s.mouseY - ball.y,
                dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 0) {
                const pullStrength = 0.008; // Adjust: lower = slower pull
                ball.vx += (dx / dist) * pullStrength;
                ball.vy += (dy / dist) * pullStrength;

                // Recapture into orbit when close enough and moving slowly
                const speed = Physics.getSpeed(ball);
                const captureDistance = 80; // Adjust: higher = captures from further away
                const captureSpeed = 4; // Adjust: higher = captures faster-moving balls
                if (dist < ball.originalDistance + captureDistance && speed < captureSpeed) {
                  ball.orbiting = true;
                  ball.angle = Math.atan2(ball.y - s.mouseY, ball.x - s.mouseX);
                  ball.distance = dist;
                }
              }
            }
          });
          const freeBalls = this.balls.filter(function (b) {
            return !b.orbiting;
          });
          Physics.handleBallCollisions(freeBalls);
        }
        draw() {
          super.draw();
          const s = this.state;
          this.balls
            .filter(function (b) {
              return b.orbiting;
            })
            .forEach(function (ball) {
              ctx.beginPath();
              ctx.arc(s.mouseX, s.mouseY, ball.distance, 0, Math.PI * 2);
              ctx.strokeStyle = "rgba(200, 200, 200, 0.2)";
              ctx.lineWidth = 1;
              ctx.stroke();
            });
          this.balls.forEach(function (ball) {
            Renderer.drawBall(ball, ball.orbiting ? 0.8 : 1.0);
          });
          ctx.beginPath();
          ctx.arc(s.mouseX, s.mouseY, 5, 0, Math.PI * 2);
          ctx.fillStyle = "#999";
          ctx.fill();
        }
        onPointerMove(x, y) {
          this.state.mouseX = x;
          this.state.mouseY = y;
        }
        onPointerDown() {
          this.balls.forEach(function (ball) {
            if (ball.orbiting) {
              ball.orbiting = false;
              const tS = Math.abs(ball.angleSpeed) * ball.distance * 2;
              ball.vx = Math.cos(ball.angle + Math.PI / 2) * tS + Math.cos(ball.angle) * 8;
              ball.vy = Math.sin(ball.angle + Math.PI / 2) * tS + Math.sin(ball.angle) * 8;
              Physics.capSpeed(ball);
            }
          });
        }
      }

      class DefendGame extends BaseGame {
        init() {
          super.init();
          this.state = {
            centerRadius: 80,
            centerX: canvas.width / 2,
            centerY: canvas.height / 2,
            spawnTimer: 0,
            spawnDelay: 80,
            pulse: 0,
            targetRadius: 40,
            gameOver: false
          };
          for (let i = 0; i < 3; i++) this.spawnBall();
        }
        spawnBall() {
          const side = Math.floor(Math.random() * 4);
          let x, y, vx, vy;
          switch (side) {
            case 0:
              x = Math.random() * canvas.width;
              y = -30;
              vx = (Math.random() - 0.5) * 1.5;
              vy = 0.8 + Math.random() * 0.5;
              break;
            case 1:
              x = canvas.width + 30;
              y = Math.random() * canvas.height;
              vx = -0.8 - Math.random() * 0.5;
              vy = (Math.random() - 0.5) * 1.5;
              break;
            case 2:
              x = Math.random() * canvas.width;
              y = canvas.height + 30;
              vx = (Math.random() - 0.5) * 1.5;
              vy = -0.8 - Math.random() * 0.5;
              break;
            case 3:
              x = -30;
              y = Math.random() * canvas.height;
              vx = 0.8 + Math.random() * 0.5;
              vy = (Math.random() - 0.5) * 1.5;
              break;
          }
          this.balls.push(
            this.createBall({
              x: x,
              y: y,
              vx: vx,
              vy: vy,
              radius: 25 + Math.random() * 15,
              personImage: ImageCounter.nextPerson(),
              isGuard: false,
              breached: false,
              breachProgress: 0,
              originalRadius: 0,
              stretchAngle: 0,
            }),
          );
        }
        findNearestThreat(guard) {
          const s = this.state;
          let nearest = null,
            nearestDist = Infinity;
          for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            if (ball === guard || ball.isGuard || ball.breached) continue;
            const enemyDistToCenter = Physics.distance(ball.x, ball.y, s.centerX, s.centerY),
              urgency = Math.max(0, 300 - enemyDistToCenter),
              distToGuard = Physics.distance(ball.x, ball.y, guard.x, guard.y),
              score = distToGuard - urgency;
            if (score < nearestDist) {
              nearestDist = score;
              nearest = ball;
            }
          }
          return nearest;
        }
        update() {
          super.update();
          const s = this.state,
            self = this;
          s.spawnTimer++;
          s.pulse += 0.03;
          if (s.centerRadius < s.targetRadius) s.centerRadius += (s.targetRadius - s.centerRadius) * 0.08;
          const maxRadius = Math.min(canvas.width, canvas.height) * 0.48;
          if (s.centerRadius >= maxRadius && !s.gameOver) {
  s.gameOver = true;
  const self = this;
  setTimeout(function() {
    self.init();
  }, 2000); // 2 second delay
  return;
}
          if (this.balls.length < 12 && s.spawnTimer >= s.spawnDelay) {
            this.spawnBall();
            s.spawnTimer = 0;
          }
          for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i],
              dx = s.centerX - ball.x,
              dy = s.centerY - ball.y,
              dist = Math.sqrt(dx * dx + dy * dy);
            if (ball.isGuard) {
              const threat = this.findNearestThreat(ball);
              if (threat) {
                const threatDx = s.centerX - threat.x,
                  threatDy = s.centerY - threat.y,
                  threatDist = Math.sqrt(threatDx * threatDx + threatDy * threatDy);
                const interceptX = threat.x + (threatDx / threatDist) * (ball.radius + threat.radius + 20),
                  interceptY = threat.y + (threatDy / threatDist) * (ball.radius + threat.radius + 20);
                const toInterceptX = interceptX - ball.x,
                  toInterceptY = interceptY - ball.y,
                  toInterceptDist = Math.sqrt(toInterceptX * toInterceptX + toInterceptY * toInterceptY);
                if (toInterceptDist > 5) {
                  const chaseSpeed = 0.4;
                  ball.vx += (toInterceptX / toInterceptDist) * chaseSpeed;
                  ball.vy += (toInterceptY / toInterceptDist) * chaseSpeed;
                }
              } else {
                const patrolDist = s.centerRadius + 50;
                if (dist < patrolDist - 10) {
                  ball.vx -= (dx / dist) * 0.15;
                  ball.vy -= (dy / dist) * 0.15;
                } else if (dist > patrolDist + 10) {
                  ball.vx += (dx / dist) * 0.15;
                  ball.vy += (dy / dist) * 0.15;
                }
                const perpX = -dy / dist,
                  perpY = dx / dist;
                ball.vx += perpX * 0.08;
                ball.vy += perpY * 0.08;
              }
              ball.vx *= 0.94;
              ball.vy *= 0.94;
              ball.x += ball.vx;
              ball.y += ball.vy;
              for (let j = this.balls.length - 1; j >= 0; j--) {
                if (i === j || this.balls[j].isGuard || this.balls[j].breached) continue;
                const enemy = this.balls[j],
                  edx = enemy.x - ball.x,
                  edy = enemy.y - ball.y,
                  eDist = Math.sqrt(edx * edx + edy * edy),
                  hitDist = ball.radius + enemy.radius + 8;
                if (eDist < hitDist) {
                  const ang = Math.atan2(edy, edx),
                    enemyDistToCenter = Math.sqrt((enemy.x - s.centerX) * (enemy.x - s.centerX) + (enemy.y - s.centerY) * (enemy.y - s.centerY)),
                    urgency = Math.max(1, 3 - enemyDistToCenter / s.centerRadius),
                    deflectPower = 6 * urgency;
                  enemy.vx = Math.cos(ang) * deflectPower;
                  enemy.vy = Math.sin(ang) * deflectPower;
                  ScreenShake.add(4 * urgency);
                  this.particles.addBurst((ball.x + enemy.x) / 2, (ball.y + enemy.y) / 2, 6, { speed: 3, life: 20, size: 10, type: "star" });
                }
              }
            } else if (ball.breached) {
              ball.breachProgress += 0.025;
              const ease = ball.breachProgress * ball.breachProgress;
              ball.radius = ball.originalRadius * (1 - ease * 0.95);
              const pullStrength = 0.05 + ball.breachProgress * 0.15;
              ball.x += (s.centerX - ball.x) * pullStrength;
              ball.y += (s.centerY - ball.y) * pullStrength;
              if (ball.breachProgress >= 1) {
                const growthAmount = ball.originalRadius * 0.8;
                s.targetRadius += growthAmount;
                ScreenShake.add(8);
                this.balls.splice(i, 1);
                continue;
              }
            } else {
              const maxDist = 400,
                normalizedDist = Math.min(dist, maxDist) / maxDist,
                gravityStrength = 0.01 + (1 - normalizedDist) * 0.04;
              ball.vx += (dx / dist) * gravityStrength;
              ball.vy += (dy / dist) * gravityStrength;
              const spiralStrength = (1 - normalizedDist) * 0.008;
              ball.vx += (-dy / dist) * spiralStrength;
              ball.vy += (dx / dist) * spiralStrength;
              ball.vx *= 0.995;
              ball.vy *= 0.995;
              ball.x += ball.vx;
              ball.y += ball.vy;
              if (dist < s.centerRadius) {
                ball.breached = true;
                ball.breachProgress = 0;
                ball.originalRadius = ball.radius;
                ball.stretchAngle = Math.atan2(dy, dx);
                ScreenShake.add(10);
                continue;
              }
              if (ball.x < -100 || ball.x > canvas.width + 100 || ball.y < -100 || ball.y > canvas.height + 100) {
                this.balls.splice(i, 1);
                continue;
              }
            }
            if (!ball.breached) Physics.handleWallCollision(ball, canvas, 0.7, false);
          }
        }
      draw() {
  super.draw();
  const s = this.state,
    pulseSize = Math.sin(s.pulse) * 5,
    centerSize = s.centerRadius + pulseSize;

  const gradient = Renderer.createRadialGradient(s.centerX, s.centerY, s.centerRadius * 0.5, s.centerRadius * 1.8, [
    [0, "rgba(0, 0, 0, 0.3)"],
    [0.7, "rgba(20, 0, 30, 0.1)"],
    [1, "rgba(0, 0, 0, 0)"],
  ]);
  ctx.beginPath();
  ctx.arc(s.centerX, s.centerY, s.centerRadius * 1.8, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw black circle instead of PNG
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(s.centerX, s.centerY, centerSize, 0, Math.PI * 2);
  ctx.fillStyle = "#00e1ff";
  ctx.fill();
  ctx.restore();

  const self = this;
  this.balls.forEach(function (ball) {
    if (ball.isGuard) {
      Renderer.drawPerson(ball.x, ball.y + ball.radius * 0.8, ball.radius * 2.2, ball.personImage);
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius + 12, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(100, 220, 120, 0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (ball.breached) {
      ctx.save();
      ctx.translate(ball.x, ball.y);
      ctx.rotate(ball.stretchAngle + Math.PI);
      const stretch = 1 + ball.breachProgress * 1.5,
        squash = 1 / Math.sqrt(stretch);
      ctx.scale(squash, stretch);
      ctx.filter = "grayscale(" + ball.breachProgress * 100 + "%) brightness(" + (1 - ball.breachProgress * 0.5) + ")";
      ctx.globalAlpha = 1 - ball.breachProgress * 0.8;
      ctx.translate(-ball.x, -ball.y);
      Renderer.drawBall(ball);
      ctx.restore();
            } else {
              const distToCenter = Physics.distance(ball.x, ball.y, s.centerX, s.centerY),
                dangerZone = s.centerRadius * 2;
              if (distToCenter < dangerZone) {
                const danger = 1 - distToCenter / dangerZone;
                ctx.save();
                ctx.filter = "saturate(" + (1 + danger * 0.5) + ")";
                Renderer.drawBall(ball);
                ctx.restore();
              } else Renderer.drawBall(ball);
            }
          });
        }
        onPointerDown(x, y) {
          for (let i = this.balls.length - 1; i >= 0; i--) {
            if (!this.balls[i].breached && Physics.contains(this.balls[i], x, y)) {
              if (this.balls[i].isGuard) {
                this.balls[i].isGuard = false;
              } else {
                this.balls.forEach((b) => (b.isGuard = false));
                this.balls[i].isGuard = true;
              }
              break;
            }
          }
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
          // Bounce animation on both
          entity1.bounceAnim = 1;
          entity2.bounceAnim = 1;

          // Expanding ring from midpoint
          const cx = (entity1.x + entity2.x) / 2;
          const cy = (entity1.y + entity2.y) / 2;
          this.state.celebrationRings.push({
            x: cx,
            y: cy,
            radius: 0,
            maxRadius: 120,
            life: 1,
            color: `hsl(${Math.random() * 60 + 30}, 100%, 60%)`, // golden/orange range
          });

          // Hearts burst
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
          // Start shaking immediately
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

          // Immediate KOs
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

          // Star burst
          this.particles.addBurst(cx, cy, 12, {
            speed: 8,
            speedVariance: 4,
            life: 30,
            size: 20,
            sizeVariance: 15,
            gravity: 0.15,
            type: "star",
          });

          // Remove connections
          s.connections = s.connections.filter(
            (c) => c.entity1 !== dying.entity1 && c.entity2 !== dying.entity1 && c.entity1 !== dying.entity2 && c.entity2 !== dying.entity2,
          );

          // Remove entities
          const idx1 = this.balls.indexOf(dying.entity1);
          const idx2 = this.balls.indexOf(dying.entity2);
          if (idx1 > idx2) {
            this.balls.splice(idx1, 1);
            this.balls.splice(idx2, 1);
          } else {
            this.balls.splice(idx2, 1);
            this.balls.splice(idx1, 1);
          }

          // Respawn after delay
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

          // Update celebration rings
          s.celebrationRings = s.celebrationRings.filter((ring) => {
            ring.radius += 8;
            ring.life -= 0.04;
            return ring.life > 0;
          });

          // Update dying entities
          s.dyingEntities = s.dyingEntities.filter((dying) => {
            dying.timer--;

            // Keep shaking during shake phase
            if (dying.phase === "shake") {
              dying.entity1.shakeAnim = 1;
              dying.entity2.shakeAnim = 1;
              // Intensify shake as we approach explosion
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

          // Update spring connections
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

          // Update all entities
          this.balls.forEach((ball) => {
            const isDying = this.getDeathState(ball);

            // Bounce animation (celebration)
            if (ball.bounceAnim > 0) {
              ball.bounceAnim -= 0.08;
              if (ball.bounceAnim < 0) ball.bounceAnim = 0;
            }

            // Shake animation (bad match)
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

          // Draw connections
          s.connections.forEach((conn) => {
            if (!this.balls.includes(conn.entity1) || !this.balls.includes(conn.entity2)) return;
            ctx.beginPath();
            ctx.moveTo(conn.entity1.x, conn.entity1.y);
            ctx.lineTo(conn.entity2.x, conn.entity2.y);
            ctx.strokeStyle = "rgba(100, 200, 100, 0.6)";
            ctx.lineWidth = 3;
            ctx.stroke();
          });

          // Draw celebration rings
          s.celebrationRings.forEach((ring) => {
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = ring.color.replace(")", `, ${ring.life})`).replace("hsl", "hsla");
            ctx.lineWidth = 6 * ring.life;
            ctx.stroke();
          });

          // Draw drag line
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

          // Draw entities
          this.balls.forEach((entity) => {
            const isSel = s.firstEntity === entity;
            const deathState = this.getDeathState(entity);

            ctx.save();

            // Calculate position offset for shake
            let offsetX = 0,
              offsetY = 0;
            if (entity.shakeAnim > 0) {
              offsetX = (Math.random() - 0.5) * entity.shakeIntensity;
              offsetY = (Math.random() - 0.5) * entity.shakeIntensity;
            }

            // Calculate scale for bounce
            let bounceScale = 1;
            if (entity.bounceAnim > 0) {
              // Squash and stretch: starts big, squashes, then settles
              const t = entity.bounceAnim;
              bounceScale = 1 + Math.sin(t * Math.PI * 3) * 0.25 * t;
            }

            const scale = (entity.currentScale || 1) * bounceScale;
            const wiggle = entity.wiggleAmount * Math.sin(entity.wigglePhase) * 0.04;

            ctx.translate(entity.x + offsetX, entity.y + offsetY);
            ctx.scale(scale + wiggle, scale - wiggle);
            ctx.translate(-entity.x, -entity.y);

            // Red outline for dying entities
            if (deathState && deathState.phase === "shake") {
              const pulse = Math.sin(deathState.timer * 0.8) * 0.5 + 0.5;
              ctx.shadowColor = `rgba(255, 0, 0, ${0.8 + pulse * 0.2})`;
              ctx.shadowBlur = 15 + pulse * 10;

              // Draw red outline
              ctx.beginPath();
              ctx.arc(entity.x, entity.y, (entity.clickRadius || entity.radius) + 5, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(255, 50, 50, ${0.6 + pulse * 0.4})`;
              ctx.lineWidth = 4;
              ctx.stroke();
            }

            // Selection/hover highlight
            if ((isSel || entity.targetScale > 1) && !deathState) {
              ctx.shadowColor = "rgba(100, 200, 255, 0.8)";
              ctx.shadowBlur = 20;
            }

            // Celebration glow
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



      
     class TraceGame extends BaseGame {
  init() {
    super.init();
    this.state = {
      trails: [],
      trailLifetime: 90,
      minSpeedForTrail: 1,
      // Define two team colors
      teamColors: [
        { main: [255, 120, 100], glow: [255, 150, 130], inner: [255, 220, 210] }, // Red/orange team
        { main: [100, 180, 255], glow: [150, 200, 255], inner: [220, 240, 255] }, // Blue team
      ],
    };

    const baseRadius = Config.isMobile ? 25 : 35;
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 40;
      this.balls.push(
        this.createBall({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: baseRadius + Math.random() * 15,
          lastTrailX: null,
          lastTrailY: null,
          team: i % 2, // Alternate between team 0 and team 1
        }),
      );
    }
  }

  update() {
  super.update();
  const s = this.state;

  // Age and remove old trails
  s.trails = s.trails.filter((trail) => {
    trail.age++;
    return trail.age < s.trailLifetime;
  });

  // Update balls
  this.balls.forEach((ball) => {
    // No gravity, no friction - they move forever

    const speed = Physics.getSpeed(ball);

    // Leave trail if moving fast enough
    if (speed > s.minSpeedForTrail && ball.lastTrailX !== null) {
      const dist = Physics.distance(ball.x, ball.y, ball.lastTrailX, ball.lastTrailY);
      if (dist > 8) {
        s.trails.push({
          x1: ball.lastTrailX,
          y1: ball.lastTrailY,
          x2: ball.x,
          y2: ball.y,
          age: 0,
          ballImage: ball.ballImage,
          thickness: Math.min(ball.radius * 0.6, 15 + speed * 0.5),
          team: ball.team,
        });
        ball.lastTrailX = ball.x;
        ball.lastTrailY = ball.y;
      }
    } else {
      ball.lastTrailX = ball.x;
      ball.lastTrailY = ball.y;
    }

    ball.x += ball.vx;
    ball.y += ball.vy;
    Physics.capSpeed(ball);

    // Wall collisions
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx *= -0.9;
    }
    if (ball.x + ball.radius > canvas.width) {
      ball.x = canvas.width - ball.radius;
      ball.vx *= -0.9;
    }
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy *= -0.9;
    }
    if (ball.y + ball.radius > canvas.height) {
      ball.y = canvas.height - ball.radius;
      ball.vy *= -0.9;
    }

    // Collision with opposite team's trails only
    s.trails.forEach((trail) => {
      if (trail.age < 10) return;
      if (trail.team === ball.team) return;

      const result = Physics.lineCircleCollision(trail.x1, trail.y1, trail.x2, trail.y2, ball.x, ball.y, ball.radius + trail.thickness * 0.3);

      if (result.collides) {
        const trailDx = trail.x2 - trail.x1;
        const trailDy = trail.y2 - trail.y1;
        const trailLen = Math.sqrt(trailDx * trailDx + trailDy * trailDy);
        const nx = -trailDy / trailLen;
        const ny = trailDx / trailLen;

        const dot = ball.vx * nx + ball.vy * ny;
        ball.vx -= 2 * dot * nx * 0.8;
        ball.vy -= 2 * dot * ny * 0.8;

        ball.x = result.newX;
        ball.y = result.newY;

        const speed = Physics.getSpeed(ball);
        if (speed < 3) {
          ball.vx *= 1.5;
          ball.vy *= 1.5;
        }

        ScreenShake.add(2);
      }
    });
  });

  Physics.handleBallCollisions(this.balls);
}

  draw() {
    const s = this.state;

    // Draw trails with team colors
    s.trails.forEach((trail) => {
      const lifeRatio = 1 - trail.age / s.trailLifetime;
      const alpha = lifeRatio * 0.7;
      const thickness = trail.thickness * lifeRatio;
      const colors = s.teamColors[trail.team];

      // Glow effect
      ctx.beginPath();
      ctx.moveTo(trail.x1, trail.y1);
      ctx.lineTo(trail.x2, trail.y2);
      ctx.strokeStyle = `rgba(${colors.glow[0]}, ${colors.glow[1]}, ${colors.glow[2]}, ${alpha * 0.3})`;
      ctx.lineWidth = thickness + 8;
      ctx.lineCap = "round";
      ctx.stroke();

      // Main trail
      ctx.beginPath();
      ctx.moveTo(trail.x1, trail.y1);
      ctx.lineTo(trail.x2, trail.y2);
      ctx.strokeStyle = `rgba(${colors.main[0]}, ${colors.main[1]}, ${colors.main[2]}, ${alpha})`;
      ctx.lineWidth = thickness;
      ctx.lineCap = "round";
      ctx.stroke();

      // Inner bright line
      ctx.beginPath();
      ctx.moveTo(trail.x1, trail.y1);
      ctx.lineTo(trail.x2, trail.y2);
      ctx.strokeStyle = `rgba(${colors.inner[0]}, ${colors.inner[1]}, ${colors.inner[2]}, ${alpha * 0.8})`;
      ctx.lineWidth = thickness * 0.4;
      ctx.lineCap = "round";
      ctx.stroke();
    });

    // Draw balls with team-colored glow
    this.balls.forEach((ball) => {
      const speed = Physics.getSpeed(ball);
      const colors = s.teamColors[ball.team];

      if (speed > s.minSpeedForTrail) {
        const glowIntensity = Math.min((speed - s.minSpeedForTrail) / 10, 0.5);
        const glow = Renderer.createRadialGradient(ball.x, ball.y, ball.radius * 0.5, ball.radius * 1.5, [
          [0, `rgba(${colors.glow[0]}, ${colors.glow[1]}, ${colors.glow[2]}, ${glowIntensity})`],
          [1, `rgba(${colors.glow[0]}, ${colors.glow[1]}, ${colors.glow[2]}, 0)`],
        ]);
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      Renderer.drawBall(ball, 1, ball.rotation);
    });

    super.draw();

        }

        onPointerDown(x, y) {
          // Fling the nearest ball
          let nearest = null;
          let nearestDist = Infinity;

          this.balls.forEach((ball) => {
            const dist = Physics.distance(x, y, ball.x, ball.y);
            if (dist < nearestDist) {
              nearestDist = dist;
              nearest = ball;
            }
          });

          if (nearest && nearestDist < 150) {
            const angle = Math.atan2(nearest.y - y, nearest.x - x);
            const force = Math.min(150 - nearestDist, 100) * 0.15;
            nearest.vx += Math.cos(angle) * force;
            nearest.vy += Math.sin(angle) * force;
            Physics.capSpeed(nearest);
            ScreenShake.add(force * 0.3);
          }
        }
      }


      class MergeSplitGame extends BaseGame {
        init() {
          super.init();
          this.state = { mergingPairs: [], victory: false };
          const baseRadius = Config.isMobile ? 18 : 30;
          const radiusVariance = Config.isMobile ? 8 : 12;
          for (let i = 0; i < 25; i++) {
            const a = Math.random() * Math.PI * 2,
              s = 1 + Math.random() * 1.5;
            const ball = this.createBall({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              vx: Math.cos(a) * s,
              vy: Math.sin(a) * s,
              radius: baseRadius + Math.random() * radiusVariance,
              mass: 1,
              id: Date.now() + Math.random(),
              spinAngle: 0,
              merging: false,
              walkers: [],
            });
            ball.walkers.push({
              angle: Math.random() * Math.PI * 2,
              walkSpeed: 0.015 + Math.random() * 0.015,
              direction: Math.random() > 0.5 ? 1 : -1,
              personIndex: ImageCounter.nextPerson(),
            });
            this.balls.push(ball);
          }
        }

        update() {
          super.update();
          const s = this.state;
          if (this.balls.length === 1 && !s.victory) {
            s.victory = true;
            ScreenShake.add(15);
            this.particles.addBurst(this.balls[0].x, this.balls[0].y, 30, {
              speed: 4,
              speedVariance: 4,
              life: 40,
              size: 15,
              sizeVariance: 10,
              gravity: 0.05,
              type: "star",
            });
          }

          for (let p = s.mergingPairs.length - 1; p >= 0; p--) {
            const pair = s.mergingPairs[p];
            pair.progress += 0.025;
            const b1 = pair.ball1,
              b2 = pair.ball2;
            if (!this.balls.includes(b1) || !this.balls.includes(b2)) {
              s.mergingPairs.splice(p, 1);
              continue;
            }
            const dx = b2.x - b1.x,
              dy = b2.y - b1.y,
              dist = Math.sqrt(dx * dx + dy * dy),
              pullF = 0.4;
            b1.vx += (dx / dist) * pullF;
            b1.vy += (dy / dist) * pullF;
            b2.vx -= (dx / dist) * pullF;
            b2.vy -= (dy / dist) * pullF;
            b1.spinAngle += 0.15;
            b2.spinAngle -= 0.15;
            if (pair.progress >= 1 || dist < 20) {
              const tM = b1.mass + b2.mass,
                nR = Math.sqrt(b1.radius * b1.radius + b2.radius * b2.radius),
                cW = [...b1.walkers, ...b2.walkers];
              cW.forEach((w, idx) => {
                w.angle = ((Math.PI * 2) / cW.length) * idx;
              });
              const mergeX = (b1.x * b1.mass + b2.x * b2.mass) / tM,
                mergeY = (b1.y * b1.mass + b2.y * b2.mass) / tM;
              const newBall = this.createBall({
                x: mergeX,
                y: mergeY,
                vx: (b1.vx * b1.mass + b2.vx * b2.mass) / tM,
                vy: (b1.vy * b1.mass + b2.vy * b2.mass) / tM,
                radius: nR,
                mass: tM,
                id: Date.now() + Math.random(),
                spinAngle: 0,
                merging: false,
                walkers: cW,
              });
              const i1 = this.balls.indexOf(b1),
                i2 = this.balls.indexOf(b2);
              if (i1 > i2) {
                this.balls.splice(i1, 1);
                this.balls.splice(i2, 1);
              } else {
                this.balls.splice(i2, 1);
                this.balls.splice(i1, 1);
              }
              this.balls.push(newBall);
              this.particles.addBurst(mergeX, mergeY, 12, {
                speed: 3,
                speedVariance: 3,
                life: 30,
                size: 12,
                sizeVariance: 10,
                gravity: 0.05,
                type: "star",
              });
              ScreenShake.add(6);
              s.mergingPairs.splice(p, 1);
            }
          }

          this.balls.forEach((ball) => {
            if (ball.merging) return;
            ball.walkers.forEach((w) => {
              w.angle += w.walkSpeed * w.direction;
            });
            const speed = Physics.getSpeed(ball);
            if (speed < 0.4) {
              const a = Math.atan2(ball.vy, ball.vx);
              ball.vx = Math.cos(a) * 0.8;
              ball.vy = Math.sin(a) * 0.8;
            }
            ball.vx *= 0.99;
            ball.vy *= 0.99;
            ball.x += ball.vx;
            ball.y += ball.vy;
            Physics.capSpeed(ball);
            Physics.handleWallCollision(ball, canvas, 0.8, false);
          });

          for (let i = this.balls.length - 1; i >= 0; i--) {
            for (let j = i - 1; j >= 0; j--) {
              const b1 = this.balls[i],
                b2 = this.balls[j];
              if (b1.merging || b2.merging) continue;
              const dx = b2.x - b1.x,
                dy = b2.y - b1.y,
                dist = Math.sqrt(dx * dx + dy * dy),
                minDist = b1.radius + b2.radius;
              if (dist < minDist * 0.9) {
                const rVx = b2.vx - b1.vx,
                  rVy = b2.vy - b1.vy,
                  rS = Math.sqrt(rVx * rVx + rVy * rVy);
                if (rS < 2.5) {
                  b1.merging = true;
                  b2.merging = true;
                  s.mergingPairs.push({ ball1: b1, ball2: b2, progress: 0 });
                } else {
                  const ang = Math.atan2(dy, dx),
                    ax = (minDist - dist) * Math.cos(ang) * 0.1,
                    ay = (minDist - dist) * Math.sin(ang) * 0.1;
                  b1.vx -= ax;
                  b1.vy -= ay;
                  b2.vx += ax;
                  b2.vy += ay;
                }
              }
            }
          }
        }

        draw() {
          this.balls.forEach((ball) => {
            ctx.save();
            if (ball.merging) {
              ctx.translate(ball.x, ball.y);
              ctx.rotate(ball.spinAngle);
              ctx.translate(-ball.x, -ball.y);
            }
            Renderer.drawBall(ball);
            ctx.restore();
            const basePersonH = 40,
              sF = Math.sqrt(ball.mass),
              pH = Math.min(basePersonH * sF, ball.radius * 0.7);
            ball.walkers.forEach((w) => {
              const wX = ball.x + Math.cos(w.angle) * ball.radius,
                wY = ball.y + Math.sin(w.angle) * ball.radius,
                rot = w.angle + Math.PI / 2;
              Renderer.drawPerson(wX, wY, pH, w.personIndex, 1, rot);
            });
          });
          super.draw();
          if (this.state.victory) {
            ctx.fillStyle = "#4A4";
            ctx.font = "bold 32px Arial";
            ctx.textAlign = "center";
            ctx.fillText("yay", canvas.width / 2, 160);
          }
        }

        onPointerDown(x, y) {
          for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            if (Physics.contains(ball, x, y) && ball.mass > 1 && !ball.merging) {
              this.particles.addBurst(ball.x, ball.y, 15, {
                speed: 3,
                speedVariance: 3,
                life: 30,
                size: 12,
                sizeVariance: 10,
                gravity: 0.05,
                type: "star",
              });
              const numS = Math.min(ball.mass, 4),
                wPN = Math.floor(ball.walkers.length / numS);
              for (let j = 0; j < numS; j++) {
                const ang = ((Math.PI * 2) / numS) * j,
                  sp = 3 + Math.random() * 2;
                const nB = this.createBall({
                  x: ball.x,
                  y: ball.y,
                  vx: Math.cos(ang) * sp,
                  vy: Math.sin(ang) * sp,
                  radius: ball.radius / Math.sqrt(numS),
                  mass: 1,
                  id: Date.now() + Math.random() + j,
                  spinAngle: 0,
                  merging: false,
                  walkers: ball.walkers.slice(j * wPN, (j + 1) * wPN),
                });
                if (nB.walkers.length === 0)
                  nB.walkers.push({
                    angle: Math.random() * Math.PI * 2,
                    walkSpeed: 0.015 + Math.random() * 0.015,
                    direction: Math.random() > 0.5 ? 1 : -1,
                    personIndex: ImageCounter.nextPerson(),
                  });
                this.balls.push(nB);
              }
              this.balls.splice(i, 1);
              this.state.victory = false;
              ScreenShake.add(5);
              break;
            }
          }
        }
      }

   
      class InflateGame extends BaseGame {
  init() {
    super.init();
    this.state = { popEffects: [] };
    const baseRadius = Config.isMobile ? 25 : 35,
      maxRadius = Config.isMobile ? 130 : 180;
    for (let i = 0; i < 30; i++)
      this.balls.push(
        this.createBall({
          x: 100 + Math.random() * (canvas.width - 200),
          y: 100 + Math.random() * (canvas.height - 200),
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: baseRadius,
          baseRadius: baseRadius,
          maxRadius: maxRadius,
          inflateProgress: 0,
          inflateSpeed: 0.8 + Math.random() * 0.08,
          deflating: false,
          deflateTime: 0,
          deflateAngle: 0,
          deflateSpin: 0,
        }),
      );
  }
  update() {
    super.update();
    const self = this;
    this.state.popEffects = this.state.popEffects.filter(function (e) {
      e.progress += 0.06;
      e.rotation += e.spinSpeed;
      return e.progress < 1;
    });
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      if (ball.deflating) {
        ball.deflateTime++;
        // Erratic thrust like air escaping
        if (ball.deflateTime % 5 === 0) {
          ball.deflateAngle += (Math.random() - 0.5) * 1.5;
        }
        const thrust = 2 + Math.random() * 2;
        ball.vx += Math.cos(ball.deflateAngle) * thrust;
        ball.vy += Math.sin(ball.deflateAngle) * thrust;
        // Spin faster as it deflates
        ball.deflateSpin += (Math.random() - 0.5) * 0.1;
        // Much slower shrink
        ball.radius -= 0.8;
        if (ball.radius <= ball.baseRadius) {
          ball.radius = ball.baseRadius;
          ball.inflateProgress = 0;
          ball.deflating = false;
          ball.deflateTime = 0;
          ball.deflateSpin = 0;
        }
      } else {
        ball.inflateProgress += ball.inflateSpeed * 0.0006;
        const tR = ball.baseRadius + ball.inflateProgress * (ball.maxRadius - ball.baseRadius);
        ball.radius = Math.min(tR, ball.maxRadius);
      }
      ball.vx *= 0.92;
      ball.vy *= 0.92;
      ball.x += ball.vx;
      ball.y += ball.vy;
      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx *= -0.5;
      }
      if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx *= -0.5;
      }
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -0.5;
      }
      if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy *= -0.5;
      }
    }
    for (let iter = 0; iter < 6; iter++) {
      for (let i = 0; i < this.balls.length; i++) {
        let totalDx = 0,
          totalDy = 0;
        for (let j = 0; j < this.balls.length; j++) {
          if (i === j) continue;
          const b1 = this.balls[i],
            b2 = this.balls[j],
            dx = b1.x - b2.x,
            dy = b1.y - b2.y,
            dist = Math.sqrt(dx * dx + dy * dy),
            minDist = b1.radius + b2.radius;
          if (dist < minDist && dist > 0) {
            const overlap = minDist - dist,
              pushF = overlap * 0.15;
            totalDx += (dx / dist) * pushF;
            totalDy += (dy / dist) * pushF;
          }
        }
        const maxMove = 3,
          moveDist = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
        if (moveDist > maxMove) {
          totalDx = (totalDx / moveDist) * maxMove;
          totalDy = (totalDy / moveDist) * maxMove;
        }
        this.balls[i].x += totalDx;
        this.balls[i].y += totalDy;
      }
    }
    this.balls.forEach(function (ball) {
      if (ball.x - ball.radius < 0) ball.x = ball.radius;
      if (ball.x + ball.radius > canvas.width) ball.x = canvas.width - ball.radius;
      if (ball.y - ball.radius < 0) ball.y = ball.radius;
      if (ball.y + ball.radius > canvas.height) ball.y = canvas.height - ball.radius;
    });
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      if (ball.deflating) continue;
      if (ball.radius >= ball.maxRadius * 0.5) {
        let severeOverlap = false;
        for (let j = 0; j < this.balls.length; j++) {
          if (i === j) continue;
          const b2 = this.balls[j],
            dist = Physics.distance(ball.x, ball.y, b2.x, b2.y);
          if (dist < (ball.radius + b2.radius) * 0.9) {
            severeOverlap = true;
            break;
          }
        }
        if (
          ball.x < ball.radius * 0.5 ||
          ball.x > canvas.width - ball.radius * 0.5 ||
          ball.y < ball.radius * 0.5 ||
          ball.y > canvas.height - ball.radius * 0.5
        )
          severeOverlap = true;
        if (severeOverlap) self.popBall(ball);
      }
    }
  }
  popBall(ball) {
    if (ball.deflating) return;
    this.particles.addBurst(ball.x, ball.y, 12, {
      speed: 4,
      speedVariance: 5,
      life: 45,
      size: 20,
      sizeVariance: 15,
      gravity: 0.12,
      type: "star",
    });
    this.state.popEffects.push({
      x: ball.x,
      y: ball.y,
      radius: ball.radius,
      ballImage: ball.ballImage,
      progress: 0,
      rotation: 0,
      spinSpeed: (Math.random() - 0.5) * 0.5,
    });
    ball.deflating = true;
    ball.deflateTime = 0;
    ball.deflateAngle = Math.random() * Math.PI * 2;
    ball.deflateSpin = (Math.random() - 0.5) * 0.5;
    ScreenShake.add(8);
  }
  draw() {
    super.draw();
    const self = this;
    this.state.popEffects.forEach(function (e) {
      const img = Assets.getBallImage(e.ballImage);
      if (Assets.isImageReady(img)) {
        ctx.save();
        ctx.globalAlpha = (1 - e.progress) * 0.8;
        ctx.translate(e.x, e.y);
        ctx.rotate(e.rotation * 3);
        const scale = 1 + e.progress * 2;
        ctx.scale(scale, scale * (1 - e.progress * 0.5));
        ctx.drawImage(img, -e.radius / 2, -e.radius / 2, e.radius, e.radius);
        ctx.restore();
      }
    });
    this.balls.forEach(function (ball) {
      const pr = ball.radius / ball.maxRadius,
        wobble = pr > 0.8 ? Math.sin(Date.now() * 0.02) * (pr - 0.8) * 10 : 0;
      ctx.save();
      ctx.translate(ball.x, ball.y);
      if (ball.deflating) {
        ctx.rotate(ball.deflateSpin * ball.deflateTime * 0.1);
        const squash = 1 + Math.sin(ball.deflateTime * 0.3) * 0.3;
        ctx.scale(squash, 1 / squash);
      } else {
        ctx.scale(1 + wobble * 0.02, 1 - wobble * 0.02);
      }
      ctx.translate(-ball.x, -ball.y);
      Renderer.drawBall(ball);
      ctx.restore();
    });
  }
  onPointerDown(x, y) {
    const self = this;
    for (let i = this.balls.length - 1; i >= 0; i--) {
      if (Physics.contains(this.balls[i], x, y)) {
        this.popBall(this.balls[i]);
        break;
      }
    }
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
const availableColors = this.colors.filter(c => c !== this.state.currentColor);
this.state.currentColor = availableColors[Math.floor(Math.random() * availableColors.length)];  }
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
      class PortalsGame extends BaseGame {
        init() {
          super.init();
          const safeZoneRadius = Config.isMobile ? 100 : 150;
          this.state = {
            portals: [],
            safeZone: {
              x: canvas.width / 2,
              y: canvas.height / 2,
              radius: safeZoneRadius,
              jumpTimer: 0,
              jumpInterval: 900,
              minJumpInterval: 300,
              speedUpRate: 0.98,
            },
            spawnTimer: 0,
            spawnInterval: 300,
          };
          for (let i = 0; i < 6; i++) this.spawnBall();
        }
        spawnBall() {
          const padding = 50,
            baseRadius = Config.isMobile ? 18 : 25,
            radiusVariance = Config.isMobile ? 10 : 15;
          this.balls.push(
            this.createBall({
              x: padding + Math.random() * (canvas.width - padding * 2),
              y: padding + Math.random() * (canvas.height - padding * 2),
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              radius: baseRadius + Math.random() * radiusVariance,
              portalCooldown: 0,
              grayscale: 0,
              scale: 1,
            }),
          );
        }
        isInSafeZone(ball) {
          const sz = this.state.safeZone;
          return Physics.distance(ball.x, ball.y, sz.x, sz.y) < sz.radius - ball.radius;
        }
        isPointInSafeZone(x, y) {
          const sz = this.state.safeZone;
          return Physics.distance(x, y, sz.x, sz.y) < sz.radius;
        }
        update() {
          super.update();
          const s = this.state,
            sz = s.safeZone,
            self = this;
          sz.jumpTimer++;
          if (sz.jumpTimer >= sz.jumpInterval) {
            sz.jumpTimer = 0;
            const padding = sz.radius + 50;
            sz.x = padding + Math.random() * (canvas.width - padding * 2);
            sz.y = padding + Math.random() * (canvas.height - padding * 2);
            ScreenShake.add(8);
            sz.jumpInterval = Math.max(sz.minJumpInterval, sz.jumpInterval * sz.speedUpRate);
          }
          s.spawnTimer++;
          if (s.spawnTimer >= s.spawnInterval && this.balls.length < 10) {
            this.spawnBall();
            s.spawnTimer = 0;
          }
          for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i],
              inZone = this.isInSafeZone(ball);
            ball.vx *= 0.99;
            ball.vy *= 0.99;
            const speed = Physics.getSpeed(ball);
            if (speed < 0.5) {
              const a = Math.atan2(ball.vy, ball.vx);
              ball.vx = Math.cos(a) * 1;
              ball.vy = Math.sin(a) * 1;
            }
            ball.x += ball.vx;
            ball.y += ball.vy;
            Physics.capSpeed(ball);
            if (inZone) {
              const dx = ball.x - sz.x,
                dy = ball.y - sz.y,
                dist = Math.sqrt(dx * dx + dy * dy),
                maxDist = sz.radius - ball.radius - 5;
              if (dist > maxDist) {
                const nx = dx / dist,
                  ny = dy / dist;
                ball.x = sz.x + nx * maxDist;
                ball.y = sz.y + ny * maxDist;
                const dot = ball.vx * nx + ball.vy * ny;
                ball.vx -= 2 * dot * nx;
                ball.vy -= 2 * dot * ny;
                ball.vx *= 0.8;
                ball.vy *= 0.8;
              }
            }
            Physics.handleWallCollision(ball, canvas, 0.9, false);
            if (ball.portalCooldown > 0) ball.portalCooldown--;
            if (inZone) {
              ball.grayscale = Math.max(0, ball.grayscale - 0.05);
              ball.scale = Math.min(1, ball.scale + 0.03);
            } else {
              ball.grayscale = Math.min(1, ball.grayscale + 0.0015);
              ball.scale = Math.max(0, ball.scale - 0.0008);
            }
            if (ball.scale <= 0.1 && ball.grayscale >= 0.95) {
              this.balls.splice(i, 1);
              continue;
            }
            s.portals.forEach(function (portal) {
              if (!portal.exit) return;
              const dist = Physics.distance(ball.x, ball.y, portal.entrance.x, portal.entrance.y);
              if (dist < 45 && ball.portalCooldown === 0) {
                ball.x = portal.exit.x;
                ball.y = portal.exit.y;
                ball.portalCooldown = 60;
                ScreenShake.add(3);
              }
            });
          }
          Physics.handleBallCollisions(this.balls);
        }
        draw() {
          const s = this.state,
            sz = s.safeZone,
            time = Date.now() * 0.002,
            self = this;
          const warningTime = 120,
            timeUntilJump = sz.jumpInterval - sz.jumpTimer,
            isWarning = timeUntilJump < warningTime,
            warningIntensity = isWarning ? 1 - timeUntilJump / warningTime : 0;
          const grad = ctx.createRadialGradient(sz.x, sz.y, 0, sz.x, sz.y, sz.radius);
          if (isWarning) {
            const flash = Math.sin(time * 10 * (1 + warningIntensity)) * 0.5 + 0.5,
              r = 255,
              g = Math.floor(215 - warningIntensity * 150),
              b = Math.floor(warningIntensity * 100 * flash);
            grad.addColorStop(0, "rgba(" + r + ", " + g + ", " + b + ", " + (0.3 + warningIntensity * 0.2) + ")");
            grad.addColorStop(0.7, "rgba(" + r + ", " + g + ", " + b + ", 0.15)");
            grad.addColorStop(1, "rgba(" + r + ", " + g + ", " + b + ", 0.05)");
          } else {
            grad.addColorStop(0, "rgba(255, 215, 0, 0.3)");
            grad.addColorStop(0.7, "rgba(255, 215, 0, 0.15)");
            grad.addColorStop(1, "rgba(255, 215, 0, 0.05)");
          }
          ctx.beginPath();
          ctx.arc(sz.x, sz.y, sz.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.strokeStyle = isWarning
            ? "rgba(255, " + (150 - warningIntensity * 100) + ", 0, " + (0.6 + warningIntensity * 0.4) + ")"
            : "rgba(255, 200, 0, 0.6)";
          ctx.lineWidth = isWarning ? 4 + warningIntensity * 4 : 4;
          ctx.stroke();
          const pulse = 1 + Math.sin(time * 2) * 0.05;
          ctx.beginPath();
          ctx.arc(sz.x, sz.y, sz.radius * 0.8 * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = isWarning
            ? "rgba(255, " + (200 - warningIntensity * 150) + ", 100, " + (0.2 + warningIntensity * 0.3) + ")"
            : "rgba(255, 220, 100, 0.2)";
          ctx.lineWidth = 2;
          ctx.stroke();
          s.portals.forEach(function (portal) {
            const ent = portal.entrance,
              portalPulse = 1 + Math.sin(time) * 0.1,
              size = 70 * portalPulse;
            const entranceGrad = Renderer.createRadialGradient(ent.x, ent.y, 0, size, [
              [0, "rgba(255, 150, 100, 0.4)"],
              [1, "rgba(255, 150, 100, 0)"],
            ]);
            ctx.beginPath();
            ctx.arc(ent.x, ent.y, size, 0, Math.PI * 2);
            ctx.fillStyle = entranceGrad;
            ctx.fill();
            Renderer.drawImage(Assets.stars[1] || Assets.stars[0], ent.x - size / 2, ent.y - size / 2, size, size, 1, time * 0.5);
            if (portal.exit) {
              const exit = portal.exit,
                exitGrad = Renderer.createRadialGradient(exit.x, exit.y, 0, size, [
                  [0, "rgba(255, 215, 0, 0.4)"],
                  [1, "rgba(255, 215, 0, 0)"],
                ]);
              ctx.beginPath();
              ctx.arc(exit.x, exit.y, size, 0, Math.PI * 2);
              ctx.fillStyle = exitGrad;
              ctx.fill();
              Renderer.drawImage(Assets.stars[0], exit.x - size / 2, exit.y - size / 2, size, size, 1, -time * 0.5);
              ctx.beginPath();
              ctx.moveTo(ent.x, ent.y);
              ctx.lineTo(exit.x, exit.y);
              ctx.strokeStyle = "rgba(255, 200, 100, 0.2)";
              ctx.lineWidth = 2;
              ctx.setLineDash([10, 10]);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          });
          this.balls.forEach(function (ball) {
            const inZone = self.isInSafeZone(ball);
            ctx.save();
            if (ball.grayscale > 0) ctx.filter = "grayscale(" + ball.grayscale * 100 + "%) brightness(" + (1 - ball.grayscale * 0.3) + ")";
            ctx.globalAlpha = Math.max(0.1, ball.scale);
            ctx.translate(ball.x, ball.y);
            ctx.scale(ball.scale, ball.scale);
            ctx.translate(-ball.x, -ball.y);
            Renderer.drawBall(ball, inZone ? 1.0 : 0.7);
            ctx.filter = "none";
            ctx.globalAlpha = 1;
            ctx.restore();
          });
          super.draw();
        }
        onPointerDown(x, y) {
          const s = this.state,
            sz = s.safeZone;

          const tooClose = this.balls.some(function (ball) {
            return Physics.distance(x, y, ball.x, ball.y) < ball.radius + 20;
          });

          if (tooClose) return;

          s.portals = [];

          const exitX = sz.x + (Math.random() - 0.5) * sz.radius * 0.8;
          const exitY = sz.y + (Math.random() - 0.5) * sz.radius * 0.8;

          s.portals.push({
            entrance: { x: x, y: y },
            exit: { x: exitX, y: exitY },
          });
        }
      }

    
class WheelballGame extends BaseGame {
  init() {
    super.init();
    this.state = {
      wheels: [],
      stars: [],
      splats: [],
      bumpers: [],
      gravity: 0.06,
      score: 0,
      spawnTimer: 0,
    };
    this.createWheels();
    this.createStars();
    this.createBumpers();
  }

  createBumpers() {
    const bumperConfigs = [
      { x: 0.2, y: 0.35, type: "ball" },
      { x: 0.8, y: 0.35, type: "ball" },
      { x: 0.5, y: 0.25, type: "ball" },
      { x: 0.35, y: 0.55, type: "ball" },
      { x: 0.65, y: 0.55, type: "ball" },
      { x: 0.1, y: 0.25, type: "ball" },
      { x: 0.9, y: 0.25, type: "ball" },
      { x: 0.15, y: 0.5, type: "small" },
      { x: 0.85, y: 0.5, type: "small" },
      { x: 0.3, y: 0.15, type: "small" },
      { x: 0.7, y: 0.15, type: "small" },
    ];

    bumperConfigs.forEach((cfg) => {
      const bumper = {
        x: canvas.width * cfg.x,
        y: canvas.height * cfg.y,
        type: cfg.type,
        radius: cfg.type === "small" ? 18 : 25,
        bounceForce: cfg.type === "small" ? 10 : 8,
        flashTimer: 0,
        rotation: 0,
        pulse: Math.random() * Math.PI * 2,
        ballImage: ImageCounter.nextBestBall(),
      };

      if (cfg.type === "small") {
        bumper.rotation = cfg.x < 0.5 ? Math.PI / 6 : -Math.PI / 6;
      }

      this.state.bumpers.push(bumper);
    });
  }

  createWheels() {
    const screenWidth = canvas.width;
    const wheelMaxSize = 90 * 1.8;
    const wheelSpacing = wheelMaxSize * 3.1;
    const bottomWheelCount = Math.max(3, Math.floor(screenWidth / wheelSpacing));
    const bottomY = 0.88;

    const configs = [];

    // Bottom row - these are the LAUNCHERS (stronger upward bias)
    for (let i = 0; i < bottomWheelCount; i++) {
      const xPos = (i + 0.5) / bottomWheelCount;
      configs.push({ 
        x: xPos, 
        y: bottomY, 
        baseSize: 55, 
        spinDir: i % 2 === 0 ? 1 : -1,
        isLauncher: true,  // Bottom wheels are powerful launchers
      });
    }

    // Middle row
    const midWheelCount = Math.max(2, Math.floor(screenWidth / (wheelSpacing * 1.5)));
    for (let i = 0; i < midWheelCount; i++) {
      const xPos = (i + 0.5) / midWheelCount;
      if (Math.abs(xPos - 0.5) > 0.1 || midWheelCount <= 2) {
        configs.push({ 
          x: xPos, 
          y: 0.62, 
          baseSize: 80,  // Slightly smaller
          spinDir: i % 2 === 0 ? -1 : 1,
          isLauncher: false,
        });
      }
    }

    // NEW: Upper row - catch balls and redirect them
    const upperWheelCount = Math.max(2, Math.floor(screenWidth / (wheelSpacing * 2)));
    for (let i = 0; i < upperWheelCount; i++) {
      const xPos = (i + 0.5) / upperWheelCount;
      // Offset from center
      if (Math.abs(xPos - 0.5) > 0.15 || upperWheelCount <= 2) {
        configs.push({ 
          x: xPos, 
          y: 0.38,  // Upper area
          baseSize: 65, 
          spinDir: i % 2 === 0 ? 1 : -1,
          isLauncher: false,
        });
      }
    }

    configs.forEach((cfg) => {
      this.state.wheels.push({
        x: canvas.width * cfg.x,
        y: canvas.height * cfg.y,
        baseSize: cfg.baseSize,
        size: cfg.baseSize,
        maxSize: cfg.baseSize * 1.8,
        rotation: Math.random() * Math.PI * 2,
        spinDir: cfg.spinDir,
        baseSpinSpeed: 0.06 * cfg.spinDir,
        spinSpeed: 0.01 * cfg.spinDir,
        ballImage: ImageCounter.nextBestBall(),
        isHeld: false,
        holdTime: 0,
        maxHoldTime: 20,  // Even faster charge
        capturedBalls: [],
        catchRadius: cfg.baseSize * 1.2,
        launchPower: 0,
        flashTimer: 0,
        isLauncher: cfg.isLauncher || false,
        // NEW: Track tap state for instant response
        justTapped: false,
        tapExpandTimer: 0,
      });
    });
  }

  createStars() {
    const positions = [
      { x: 0.5, y: 0.08 },
      { x: 0.2, y: 0.12 },
      { x: 0.8, y: 0.12 },
      { x: 0.35, y: 0.22 },
      { x: 0.65, y: 0.22 },
      { x: 0.15, y: 0.42 },
      { x: 0.85, y: 0.42 },
      { x: 0.4, y: 0.38 },
      { x: 0.6, y: 0.38 },
      { x: 0.5, y: 0.5 },
    ];

    positions.forEach((pos) => {
      this.state.stars.push({
        x: canvas.width * pos.x,
        y: canvas.height * pos.y,
        radius: 22,
        starType: Math.floor(Math.random() * 3),
        pulse: Math.random() * Math.PI * 2,
        collected: false,
        respawnTimer: 0,
      });
    });
  }

  spawnBall() {
    const ballRadius = Config.isMobile ? 22 : 28;
    this.balls.push(
      this.createBall({
        x: canvas.width * 0.3 + Math.random() * canvas.width * 0.4,
        y: 50,
        vx: (Math.random() - 0.5) * 2,
        vy: 0.5,
        radius: ballRadius,
        captured: false,
        capturedBy: null,
        orbitAngle: 0,
        orbitSpeed: 0.08,
        useBestBall: true,
        ballImage: ImageCounter.nextBestBall(),
        isActive: true,
      }),
    );
  }

  launchBall(ball, wheel) {
    // Calculate base launch angle from orbit position
    let launchAngle = ball.orbitAngle + (Math.PI / 2) * wheel.spinDir;
    
    // =============================================
    // DRAMATIC LAUNCH SETTINGS
    // =============================================
    const BASE_LAUNCH_POWER = 12;     // Strong base power
    const CHARGE_MULTIPLIER = 0.5;    // Charge adds significant power
    const UPWARD_BIAS = wheel.isLauncher ? 0.6 : 0.3;  // Launchers shoot UP
    // =============================================

    const chargePower = (wheel.launchPower || 0) * CHARGE_MULTIPLIER;
    const power = BASE_LAUNCH_POWER + chargePower;

    // Calculate velocity with upward bias
    let vx = Math.cos(launchAngle) * power;
    let vy = Math.sin(launchAngle) * power;
    
    // Add strong upward bias - the pinball feel!
    // Launchers (bottom wheels) shoot more upward
    vy -= power * UPWARD_BIAS;
    
    // Ensure minimum upward velocity for launchers
    if (wheel.isLauncher && vy > -8) {
      vy = -8 - Math.random() * 4;  // Always shoot up strongly
    }

    ball.vx = vx;
    ball.vy = vy;
    ball.captured = false;
    ball.capturedBy = null;

    wheel.capturedBalls = wheel.capturedBalls.filter((b) => b !== ball);
    wheel.flashTimer = 1;
    
    // BIG screen shake for dramatic launches
    const shakeAmount = wheel.isLauncher ? power * 0.5 : power * 0.3;
    ScreenShake.add(shakeAmount);

    // More particles for drama!
    this.particles.addBurst(ball.x, ball.y, 12, {
      speed: 6,
      speedVariance: 4,
      life: 30,
      size: 18,
      sizeVariance: 12,
      gravity: 0.05,
      type: "star",
    });
    
    // Extra upward particle burst for launchers
    if (wheel.isLauncher) {
      for (let i = 0; i < 5; i++) {
        this.particles.add({
          x: ball.x + (Math.random() - 0.5) * 20,
          y: ball.y,
          vx: (Math.random() - 0.5) * 3,
          vy: -4 - Math.random() * 4,
          life: 25,
          maxLife: 25,
          size: 8 + Math.random() * 8,
          type: "star",
          starIndex: Math.floor(Math.random() * 3),
          rotation: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  update() {
    super.update();
    const s = this.state;

    s.splats = s.splats.filter((sp) => {
      sp.life--;
      return sp.life > 0;
    });

    s.bumpers.forEach((bumper) => {
      bumper.pulse += 0.05;
      if (bumper.flashTimer > 0) bumper.flashTimer -= 0.08;
    });

    if (this.balls.length === 0) {
      s.spawnTimer++;
      if (s.spawnTimer > 40) {
        this.spawnBall();
        s.spawnTimer = 0;
      }
    }

    s.wheels.forEach((wheel) => {
      // Handle tap expand animation
      if (wheel.tapExpandTimer > 0) {
        wheel.tapExpandTimer--;
      }
      
      if (wheel.isHeld) {
        // INSTANT expansion on tap, then continue growing
        if (wheel.justTapped) {
          wheel.holdTime = wheel.maxHoldTime * 0.5;  // Instant 50% charge on tap!
          wheel.justTapped = false;
          wheel.tapExpandTimer = 8;  // Visual "pop" duration
        }
        
        // Continue growing
        const growthRate = 2;
        wheel.holdTime = Math.min(wheel.holdTime + growthRate, wheel.maxHoldTime);
        wheel.size = wheel.baseSize + (wheel.maxSize - wheel.baseSize) * (wheel.holdTime / wheel.maxHoldTime);
        wheel.spinSpeed = wheel.baseSpinSpeed * (1 + (wheel.holdTime / wheel.maxHoldTime) * 1.5);
        wheel.launchPower = 20 + (wheel.holdTime / wheel.maxHoldTime) * 25;
        wheel.catchRadius = wheel.size * 1.4;  // Bigger catch radius
      } else {
        wheel.holdTime = Math.max(0, wheel.holdTime - 4);  // Fast shrink
        wheel.size = wheel.baseSize + (wheel.maxSize - wheel.baseSize) * (wheel.holdTime / wheel.maxHoldTime);
        wheel.spinSpeed = wheel.baseSpinSpeed;
        wheel.catchRadius = wheel.size * 0.8;
      }

      wheel.rotation += wheel.spinSpeed;
      if (wheel.flashTimer > 0) wheel.flashTimer -= 0.05;

      wheel.capturedBalls.forEach((ball) => {
        if (!this.balls.includes(ball)) return;
        ball.orbitAngle += ball.orbitSpeed * wheel.spinDir;
        const orbitDist = wheel.size * 0.7;
        ball.x = wheel.x + Math.cos(ball.orbitAngle) * orbitDist;
        ball.y = wheel.y + Math.sin(ball.orbitAngle) * orbitDist;
      });
    });

    s.stars.forEach((star) => {
      star.pulse += 0.06;
      if (star.collected) {
        star.respawnTimer--;
        if (star.respawnTimer <= 0) {
          star.collected = false;
          star.starType = Math.floor(Math.random() * 3);
        }
      }
    });

    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];

      if (ball.captured) continue;

      ball.vy += s.gravity;
      ball.x += ball.vx;
      ball.y += ball.vy;
      ball.vx *= 0.997;
      ball.vy *= 0.997;

      // Wall bounces - moderate
      const bumperBounce = 0.9;
      const bumperPush = 5;
      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx = Math.abs(ball.vx) * bumperBounce + bumperPush;
        ScreenShake.add(3);
      }
      if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx = -Math.abs(ball.vx) * bumperBounce - bumperPush;
        ScreenShake.add(3);
      }
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = Math.abs(ball.vy) * 0.8;
      }

      // Bumper collisions
      for (const bumper of s.bumpers) {
        const dx = ball.x - bumper.x;
        const dy = ball.y - bumper.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = ball.radius + bumper.radius;

        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          ball.x = bumper.x + nx * (minDist + 2);
          ball.y = bumper.y + ny * (minDist + 2);

          const force = bumper.bounceForce;
          ball.vx = nx * force + ball.vx * 0.2;
          ball.vy = ny * force + ball.vy * 0.2;

          bumper.flashTimer = 1;
          ScreenShake.add(force * 0.25);

          this.particles.addBurst(bumper.x + nx * bumper.radius, bumper.y + ny * bumper.radius, 5, {
            speed: 3,
            speedVariance: 2,
            life: 20,
            size: 10,
            sizeVariance: 6,
            gravity: 0.05,
            type: "star",
          });
        }
      }

      for (const wheel of s.wheels) {
        const dx = ball.x - wheel.x;
        const dy = ball.y - wheel.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (wheel.isHeld && dist < wheel.catchRadius + ball.radius && !ball.captured) {
          ball.captured = true;
          ball.capturedBy = wheel;
          ball.orbitAngle = Math.atan2(dy, dx);
          ball.orbitSpeed = 0.05 + Math.random() * 0.03;
          wheel.capturedBalls.push(ball);
          wheel.flashTimer = 1;
          ScreenShake.add(4);
          
          // Catch particles
          this.particles.addBurst(ball.x, ball.y, 6, {
            speed: 2,
            speedVariance: 2,
            life: 15,
            size: 10,
            sizeVariance: 5,
            gravity: 0.02,
            type: "star",
          });
          break;
        } else if (!wheel.isHeld && dist < wheel.size * 0.6 + ball.radius) {
          const nx = dx / dist;
          const ny = dy / dist;
          ball.x = wheel.x + nx * (wheel.size * 0.6 + ball.radius + 2);
          ball.y = wheel.y + ny * (wheel.size * 0.6 + ball.radius + 2);

          const tangentX = -ny * wheel.spinDir;
          const tangentY = nx * wheel.spinDir;
          const bounceForce = 8;
          const spinInfluence = Math.abs(wheel.spinSpeed) * 100;

          ball.vx = nx * bounceForce + tangentX * spinInfluence;
          ball.vy = ny * bounceForce + tangentY * spinInfluence;

          wheel.flashTimer = 0.5;
          ScreenShake.add(3);
        }
      }

      s.stars.forEach((star) => {
        if (star.collected) return;
        const dist = Physics.distance(ball.x, ball.y, star.x, star.y);
        if (dist < ball.radius + star.radius) {
          star.collected = true;
          star.respawnTimer = 180;
          s.score++;

          this.particles.add({
            x: star.x,
            y: star.y - 20,
            vx: 0,
            vy: -2,
            life: 40,
            maxLife: 40,
            type: "score",
            text: "+1",
          });

          this.particles.addBurst(star.x, star.y, 8, {
            speed: 3,
            speedVariance: 3,
            life: 35,
            size: 12,
            sizeVariance: 10,
            gravity: 0.08,
            type: "star",
          });

          ScreenShake.add(4);
        }
      });

      if (ball.y > canvas.height + ball.radius) {
        s.splats.push({
          x: ball.x,
          y: canvas.height,
          radius: ball.radius,
          life: 120,
          color: `hsl(${Math.random() * 360}, 60%, 50%)`,
        });

        this.balls.splice(i, 1);
        s.score = 0;
        ScreenShake.add(6);
        s.wheels.forEach((w) => {
          w.capturedBalls = w.capturedBalls.filter((b) => b !== ball);
        });
      }
    }
  }

  draw() {
    const s = this.state;

    ctx.fillStyle = "#FAFAFA";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(100, 150, 255, 0.15)";
    ctx.fillRect(0, 0, 12, canvas.height);
    ctx.fillRect(canvas.width - 12, 0, 12, canvas.height);

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

    // Draw bumpers
    s.bumpers.forEach((bumper) => {
      const pulseScale = 1 + Math.sin(bumper.pulse) * 0.05;

      ctx.save();
      ctx.translate(bumper.x, bumper.y);

      if (bumper.flashTimer > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, bumper.radius * 1.4 * (1 + bumper.flashTimer * 0.2), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 200, ${bumper.flashTimer * 0.4})`;
        ctx.fill();
      }

      const size = bumper.radius * 2 * pulseScale;
      const img = Assets.getBestBallImage(bumper.ballImage);
      if (Assets.isImageReady(img)) {
        if (bumper.type === "small") {
          ctx.rotate(bumper.rotation + bumper.pulse * 0.05);
        }
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
      }

      ctx.restore();
    });

    s.stars.forEach((star) => {
      if (star.collected) return;
      const pulseScale = 1 + Math.sin(star.pulse) * 0.12;
      const size = star.radius * 2 * pulseScale;

      const glow = Renderer.createRadialGradient(star.x, star.y, 0, size * 1.2, [
        [0, "rgba(255, 220, 100, 0.35)"],
        [1, "rgba(255, 220, 100, 0)"],
      ]);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(star.x, star.y, size * 1.2, 0, Math.PI * 2);
      ctx.fill();

      const img = Assets.getStarImage(star.starType);
      if (Assets.isImageReady(img)) {
        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.rotate(star.pulse * 0.1);
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
    });

    s.wheels.forEach((wheel) => {
      const powerRatio = wheel.holdTime / wheel.maxHoldTime;
      
      // "Pop" scale when just tapped
      const tapPop = wheel.tapExpandTimer > 0 ? 1 + (wheel.tapExpandTimer / 8) * 0.15 : 1;

      ctx.save();
      ctx.translate(wheel.x, wheel.y);
      ctx.scale(tapPop, tapPop);

      if (wheel.isHeld) {
        // Catch radius indicator
        ctx.beginPath();
        ctx.arc(0, 0, wheel.catchRadius / tapPop, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 180, 220, ${0.2 + powerRatio * 0.25})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Glow effect - stronger for launchers
        const glowIntensity = wheel.isLauncher ? 0.4 : 0.25;
        const glowRadius = wheel.size * (0.7 + powerRatio * 0.2) / tapPop;
        const glow = ctx.createRadialGradient(0, 0, glowRadius * 0.7, 0, 0, glowRadius * 1.3);
        glow.addColorStop(0, `rgba(180, 230, 255, ${powerRatio * glowIntensity})`);
        glow.addColorStop(0.5, `rgba(150, 210, 250, ${powerRatio * glowIntensity * 0.5})`);
        glow.addColorStop(1, "rgba(150, 210, 250, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius * 1.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Launcher indicator - subtle upward arrows/lines
        if (wheel.isLauncher && powerRatio > 0.3) {
          ctx.strokeStyle = `rgba(100, 200, 150, ${powerRatio * 0.4})`;
          ctx.lineWidth = 2;
          for (let i = 0; i < 3; i++) {
            const yOff = -wheel.size * 0.3 - i * 12 - (powerRatio * 10);
            const alpha = (1 - i * 0.3) * powerRatio;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(-8, yOff + 6);
            ctx.lineTo(0, yOff);
            ctx.lineTo(8, yOff + 6);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
      }

      if (wheel.flashTimer > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, wheel.size * 0.7 / tapPop, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 200, ${wheel.flashTimer * 0.5})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(0, 0, wheel.size * 0.6 / tapPop, 0, Math.PI * 2);
      ctx.strokeStyle = wheel.isHeld ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.25)";
      ctx.lineWidth = 3 + powerRatio * 2;
      ctx.stroke();

      ctx.rotate(wheel.rotation);
      ctx.strokeStyle = wheel.isHeld ? "rgba(0, 0, 0, 0.35)" : "rgba(0, 0, 0, 0.2)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i) / 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * wheel.size * 0.55 / tapPop, Math.sin(angle) * wheel.size * 0.55 / tapPop);
        ctx.stroke();
      }

      ctx.restore();

      const img = Assets.getBestBallImage(wheel.ballImage);
      const hubSize = wheel.size * 0.65 * tapPop;
      if (Assets.isImageReady(img)) {
        ctx.drawImage(img, wheel.x - hubSize / 2, wheel.y - hubSize / 2, hubSize, hubSize);
      }
    });

    this.particles.draw((p, alpha) => {
      if (p.type === "star" && p.starIndex !== undefined) {
        const img = Assets.getStarImage(p.starIndex);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (Assets.isImageReady(img)) {
          ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
      } else if (p.type === "score") {
        ctx.font = "bold 18px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = `rgba(50, 50, 50, ${alpha})`;
        ctx.fillText(p.text, p.x, p.y);
      }
    });

    this.balls.forEach((ball) => {
      const img = Assets.getBestBallImage(ball.ballImage);
      if (Assets.isImageReady(img)) {
        ctx.save();

        if (ball.isActive) {
          const glow = Renderer.createRadialGradient(ball.x, ball.y, ball.radius * 0.9, ball.radius * 1.3, [
            [0, "rgba(255, 220, 50, 0.4)"],
            [1, "rgba(255, 220, 50, 0)"],
          ]);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius * 1.3, 0, Math.PI * 2);
          ctx.fill();
        }

        if (ball.captured) {
          ctx.shadowColor = "rgba(100, 255, 100, 0.8)";
          ctx.shadowBlur = 15;
        }
        ctx.drawImage(img, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
        ctx.restore();
      }
    });
  }

  onPointerDown(x, y) {
    let closestWheel = null;
    let closestDist = Infinity;

    for (const wheel of this.state.wheels) {
      const dist = Physics.distance(x, y, wheel.x, wheel.y);
      if (dist < wheel.maxSize * 1.2 && dist < closestDist) {
        closestDist = dist;
        closestWheel = wheel;
      }
    }

    if (closestWheel) {
      closestWheel.isHeld = true;
      closestWheel.justTapped = true;  // Trigger instant expansion
      ScreenShake.add(2);  // Small feedback shake on tap
    }
  }

  onPointerUp() {
    this.state.wheels.forEach((wheel) => {
      if (wheel.isHeld) {
        wheel.capturedBalls.forEach((ball) => {
          this.launchBall(ball, wheel);
        });
        wheel.isHeld = false;
      }
    });
  }
}
      
      const GameManager = {
        games: {
          1: { name: "Fling", class: FlingGame },
          2: { name: "Paddle", class: PaddleGame },
          3: { name: "Pop", class: PopGame },
          4: { name: "Vacuum", class: VacuumGame },
          5: { name: "Gravity", class: GravityFlipGame },
          6: { name: "Bounce", class: BounceGame },
          7: { name: "Magnet", class: MagnetZonesGame },
          8: { name: "Explode", class: ExplodeGame },
          9: { name: "Orbital", class: OrbitalGame },
          10: { name: "Defend", class: DefendGame },
          11: { name: "Connect", class: ConnectionsGame },
          12: { name: "Merge", class: MergeSplitGame },
          13: { name: "Inflate", class: InflateGame },
          14: { name: "Brush", class: BrushGame },
          15: { name: "Portals", class: PortalsGame },
          16: { name: "Wheelball", class: WheelballGame },
          17: { name: "Trace", class: TraceGame }
        },
        currentGameNum: 14,
        currentGame: null,
        shiftPressed: false,
        init: function () {
          this.switchGame(14);
        },
        switchGame: function (gameNum) {
          if (gameNum < 1 || gameNum > 17) return;
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
            if (num >= 1 && num <= 9) GameManager.switchGame(num);
            if (e.key === "0") GameManager.switchGame(10);
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
