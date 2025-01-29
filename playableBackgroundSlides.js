// Configuration variables for easy tweaking
const config = {
    maxHeight: 0.45,
    maxWidth: 0.25,
    minDistance: 1.4,
    maxDistance: 1.9,
    dampingFactor: 0.98,
    velocityMultiplier: 0.005,
    rotationSpeedMultiplier: 0.005,
    particleCount: 10,
    particleSize: 0.009,
    particleLifetime: 100,
    velocityDecreaseFactor: 0.9,
    tailLength: 2000, // Number of tail particles
    maxSpeed: 0.02, // Maximum speed of sprites
  };
  
  const particleColors = [
    // 0xff0000, // Red
    0x00ff00, // Green
    // 0x0000ff, // Blue
    0xffff00, // Yellow
    // 0xff00ff, // Magenta
    0x00ffff, // Cyan
    0xffffff, // White
  ];
  
  // Scene setup
  const SceneController = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000),
    renderer: new THREE.WebGLRenderer(),
  
    setup: function () {
      this.scene.background = new THREE.Color(0xd2dfea);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);
  
      window.addEventListener("resize", () => this.onWindowResize(), false);
    },
  
    onWindowResize: function () {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },
  };
  
  SceneController.setup();
  
  // Sprite creation
  const loader = new THREE.TextureLoader();
  let objects = []; // This will store our sprites
  let particles = []; // This will store particles
  
  // Array of image URLs
  let imageUrls = [
    "images/creatures/1.png",
    "images/creatures/2.png",
    "images/creatures/3.png",
    "images/creatures/4.png",
    "images/creatures/5.png",
    "images/creatures/6.png",
    "images/creatures/7.png",
    "images/creatures/8.png",
    "images/creatures/9.png",
    "images/creatures/10.png",
    "images/creatures/11.png",
    "images/creatures/12.png",
    "images/creatures/13.png",
    "images/creatures/14.png",
    "images/creatures/15.png",
    "images/creatures/16.png",
    "images/creatures/17.png",
    "images/creatures/18.png",
    "images/creatures/19.png",
    "images/creatures/20.png",
    "images/creatures/21.png",
    "images/creatures/22.png",
    "images/creatures/23.png",
    "images/creatures/24.png",
    "images/creatures/25.png",
    "images/creatures/26.png",
    "images/creatures/27.png",
    "images/creatures/28.png",
    "images/creatures/29.png",
    "images/creatures/30.png",
    "images/creatures/31.png",
    "images/creatures/32.png",
    "images/creatures/33.png",
    "images/creatures/34.png",
    "images/creatures/35.png",
    "images/creatures/36.png",
    "images/creatures/37.png",
    "images/creatures/38.png",
    "images/creatures/39.png",
    "images/creatures/40.png",
    // "images/creatures/41.png",
    // "images/creatures/42.png",
    // "images/creatures/43.png",
    // "images/creatures/44.png",
    // "images/creatures/45.png",
    // "images/creatures/46.png",
    // "images/creatures/47.png",
  ];
  
  function addSprite(url) {
    loader.load(
      url,
      function (texture) {
        const material = new THREE.SpriteMaterial({ map: texture });
        const imageAspect = texture.image.width / texture.image.height;
  
        // Calculate appropriate width and height to maintain aspect ratio within bounds
        let spriteWidth, spriteHeight;
        const scaleFactor = Math.min(config.maxWidth / texture.image.width, config.maxHeight / texture.image.height);
  
        spriteWidth = texture.image.width * scaleFactor;
        spriteHeight = texture.image.height * scaleFactor;
  
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(spriteWidth, spriteHeight, 1);
  
        // Set and store the initial scale
        sprite.initialScale = { x: spriteWidth, y: spriteHeight, z: 1 };
        sprite.scale.set(sprite.initialScale.x, sprite.initialScale.y, sprite.initialScale.z);
  
        sprite.position.x = (Math.random() - 0.5) * 1.95; // Adjust so it's less likely to immediately bounce
        sprite.position.y = (Math.random() - 0.5) * 1.95;
        sprite.position.z = -1.5;
  
        // Use config variables for speed and rotation
        sprite.velocity = new THREE.Vector3((Math.random() - 0.5) * config.velocityMultiplier, (Math.random() - 0.5) * config.velocityMultiplier, 0);
        sprite.rotationSpeed = (Math.random() - 0.5) * config.rotationSpeedMultiplier;
  
        SceneController.scene.add(sprite);
        objects.push(sprite);
      },
      function (xhr) {
        // Progress callback
      },
      function (error) {
        // Error callback
        console.error("An error occurred while loading the texture:", error);
      }
    );
  }

  
  // Particle creation
function createParticles(position) {
    for (let i = 0; i < config.particleCount; i++) {
        const color = particleColors[Math.floor(Math.random() * particleColors.length)];
        const particleMaterial = new THREE.PointsMaterial({
            color: color,
            size: config.particleSize,
            transparent: true,
            opacity: 1.0
        });
        const particleGeometry = new THREE.BufferGeometry();
        const positions = [];
        const opacities = [];

        for (let j = 0; j < config.tailLength; j++) {
            positions.push(position.x, position.y, position.z); // Ensure particles are at the collision point
            opacities.push(1.0 - j / config.tailLength); // Gradually decrease opacity
        }

        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        particleGeometry.setAttribute('opacity', new THREE.Float32BufferAttribute(opacities, 1));

        const particle = new THREE.Points(particleGeometry, particleMaterial);
        particle.tail = positions;
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * config.velocityMultiplier,
            (Math.random() - 0.5) * config.velocityMultiplier,
            0
        );

        particle.position.copy(position); // Correctly set the initial position of the particle
        console.log("Particle created at:", particle.position);

        particles.push(particle);
        SceneController.scene.add(particle);

        // Animate particle tail
        const animateTail = () => {
            const positions = particle.geometry.attributes.position.array;
            for (let k = positions.length - 3; k >= 3; k -= 3) {
                positions[k] = positions[k - 3];
                positions[k + 1] = positions[k - 2];
                positions[k + 2] = positions[k - 1];
            }
            positions[0] = particle.position.x;
            positions[1] = particle.position.y;
            positions[2] = particle.position.z; // Ensure particles are on the same z-plane as the collision point
            particle.geometry.attributes.position.needsUpdate = true;
        };

        const tailInterval = setInterval(animateTail, 1000 / 60);

        // Fade out
        const fadeOut = new TWEEN.Tween(particle.material)
            .to({ opacity: 0 }, config.particleLifetime)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(() => {
                clearInterval(tailInterval);
                SceneController.scene.remove(particle);
                particles = particles.filter(p => p !== particle);
            })
            .start();
    }
}


  // Initially load only the first 5 images
  for (let i = 0; i < imageUrls.length; i++) {
    addSprite(imageUrls[i]);
  }
  
  // Keep track of how many images have been loaded
  let loadedImagesCount = 2;
  
  // Raycaster for click events
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  window.addEventListener("click", onClick);
  
  function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, SceneController.camera);
    const intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
      const sound = new Audio("images/hit.mp3");
      // sound.play();
  
      const object = intersects[0].object;
      object.material.transparent = true;
  
      // Start the scale tween
      new TWEEN.Tween(object.scale)
        .to({ x: object.scale.x * 1.8, y: object.scale.y * 1.8, z: object.scale.z * 1.8 }, 200)
        .easing(TWEEN.Easing.Elastic.Out)
        .onStart(() => {
          // Start rotation and fade-out tweens simultaneously as soon as scale begins
          // Add a quick rotation effect
          new TWEEN.Tween(object.rotation)
            .to({ z: object.rotation.z + Math.PI * 2 }, 200) // Adjusted for quicker rotation
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
  
          // Start fade out at the same time as rotation
          new TWEEN.Tween(object.material)
            .to({ opacity: 0 }, 200) // Matched duration for simultaneous effect
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(() => {
              // Actions after fade-out, like removing the object and adding to inventory
              addToInventory(object.material.map.image.src); // Add to inventory after the effect
              object.material.dispose();
              SceneController.scene.remove(object);
              objects = objects.filter((o) => o !== object); // Remove object from the array
            })
            .start();
        })
        .start();
  
      // Load an additional image if available
      if (loadedImagesCount < imageUrls.length) {
        addSprite(imageUrls[loadedImagesCount]);
        loadedImagesCount++; // Increment the counter
      }
    }
  }
  
  function addToInventory(imageSrc) {
    const inventory = document.getElementById("inventory");
    const img = document.createElement("img");
    img.src = imageSrc;
    img.style.height = "50px"; // Tiny version
    img.style.width = "auto";
    inventory.appendChild(img);
  }
  
  let originalSpeeds = new Map();
  const xBound = 2.3;
  const yBound = 1;
  const squashDuration = 80; // milliseconds
  const stretchBackDuration = 100; // milliseconds
  const velocityIncreaseFactor = 1.2;
  const maxSpeed = config.maxSpeed;
  const slowDownDelay = 2000; // milliseconds
  const minVelocityDifference = 0.001;
  const originalScale = { x: 1, y: 1, z: 1 };
  
  function animate() {
    requestAnimationFrame(animate);
    TWEEN.update(); // Update TWEEN animations
  
    objects.forEach((sprite, index) => {
      if (!sprite || !sprite.position || !sprite.velocity) {
        console.warn(`Sprite at index ${index} is missing or destroyed.`);
        return; // Skip this iteration if the sprite is missing or destroyed
      }
      sprite.position.add(sprite.velocity);
      sprite.material.rotation += sprite.rotationSpeed;
  
      // Keep z position constant
      sprite.position.z = -1.5;
  
   // Check for collisions with other sprites
for (let i = 0; i < objects.length; i++) {
    if (i !== index) {
        const otherSprite = objects[i];
        const distance = sprite.position.distanceTo(otherSprite.position);
        const minDistance = (sprite.scale.x + otherSprite.scale.x) / 2;

        if (distance < minDistance) {
            // Handle collision
            const normal = sprite.position.clone().sub(otherSprite.position).normalize();
            const relativeVelocity = sprite.velocity.clone().sub(otherSprite.velocity);
            const velocityAlongNormal = relativeVelocity.dot(normal);

            if (velocityAlongNormal > 0) continue;

            const restitution = 1; // Perfectly elastic collision
            const impulse = (-(1 + restitution) * velocityAlongNormal) / 2;

            sprite.velocity.add(normal.clone().multiplyScalar(impulse));
            otherSprite.velocity.sub(normal.clone().multiplyScalar(impulse));

            // Reduce velocity after collision
            sprite.velocity.multiplyScalar(config.velocityDecreaseFactor);
            otherSprite.velocity.multiplyScalar(config.velocityDecreaseFactor);

            // Create particles at collision point
            createParticles(sprite.position.clone());
            createParticles(otherSprite.position.clone());
            console.log("Collision at sprite position:", sprite.position.clone());
            console.log("Collision at otherSprite position:", otherSprite.position.clone());

            // Apply collision animation
            applyCollisionAnimation(sprite);
            applyCollisionAnimation(otherSprite);
        }
    }
}


  
      let bounced = false;
      let bounceAxis = null;
  
      // Boundary checks
      if (sprite.position.x > xBound || sprite.position.x < -xBound) {
        sprite.velocity.x *= -1;
        bounced = true;
        bounceAxis = "x";
        // playSound('path/to/bounceSound.mp3'); // Play bounce sound if not already played
      }
      if (sprite.position.y > yBound || sprite.position.y < -yBound) {
        sprite.velocity.y *= -1;
        bounced = true;
        bounceAxis = bounceAxis ? "both" : "y";
        // playSound('path/to/bounceSound.mp3'); // Play bounce sound if not already played
      }
  
      if (bounced) {
        applySquashAndStretchEffect(sprite, bounceAxis);
  
        if (!originalSpeeds.has(sprite)) {
          originalSpeeds.set(sprite, sprite.velocity.length());
        //   console.log(`Before applying damping. Velocity: x=${sprite.velocity.x}, y=${sprite.velocity.y}, z=${sprite.velocity.z}`);
          sprite.velocity.multiplyScalar(config.dampingFactor);
        //   console.log(`After applying damping. Velocity: x=${sprite.velocity.x}, y=${sprite.velocity.y}, z=${sprite.velocity.z}`);
  
          sprite.isDamping = true;
        //   console.log(`Before applying damping. Velocity: x=${sprite.velocity.x}, y=${sprite.velocity.y}, z=${sprite.velocity.z}`);
          sprite.velocity.multiplyScalar(config.dampingFactor);
        //   console.log(`After applying damping. Velocity: x=${sprite.velocity.x}, y=${sprite.velocity.y}, z=${sprite.velocity.z}`);
        }
  
        if (sprite.isDamping) {
          let originalSpeed = originalSpeeds.get(sprite);
        //   console.log(`Sprite ${sprite} Before damping, Velocity: ${sprite.velocity.length()}, Original Speed: ${originalSpeed}`);
          sprite.velocity.multiplyScalar(config.dampingFactor);
        //   console.log(`Sprite ${sprite} After damping, Velocity: ${sprite.velocity.length()}`);
          if (Math.abs(sprite.velocity.length() - originalSpeed) < minVelocityDifference) {
            sprite.isDamping = false;
            sprite.velocity.setLength(originalSpeed);
          }
        }
  
        // console.log(`Sprite ${sprite} Before bounce velocity change, Velocity: x=${sprite.velocity.x}, y=${sprite.velocity.y}`);
        sprite.velocity.multiplyScalar(velocityIncreaseFactor);
        // console.log(`Sprite ${sprite} After bounce velocity change, New Velocity: x=${sprite.velocity.x}, y=${sprite.velocity.y}`);
  
        sprite.velocity.multiplyScalar(velocityIncreaseFactor);
        sprite.velocity.clampLength(0, maxSpeed);
  
        setTimeout(() => {
          if (originalSpeeds.has(sprite)) {
            let originalSpeed = originalSpeeds.get(sprite);
            sprite.velocity.setLength(originalSpeed);
          }
        }, slowDownDelay);
      }
    });
  
    // Update particles
    particles.forEach(particle => {
      particle.position.add(particle.velocity);
      // Keep particles on the same z-plane
      particle.position.z = -2; // Ensure particles stay behind the sprites
    });
  
    SceneController.renderer.render(SceneController.scene, SceneController.camera); // Call render method from SceneController
  }
  
  // Constants for magic numbers
  const DURATION = {
    SQUASH: 160,
    STRETCH: 310,
  };
  
  const SCALE_FACTOR = {
    BOUNCE_X: { x: 0.99, y: 1.1 },
    BOUNCE_Y: { x: 1.1, y: 0.99 },
    BOTH_AXES: 0.9,
  };
  
  const ORIGINAL_SCALE = { x: 1, y: 1, z: 1 };
  
  // Configuration for squash and stretch animation
  const squashStretchConfig = {
    squashDuration: DURATION.SQUASH,
    stretchDuration: DURATION.STRETCH,
    scaleXOnBounceX: SCALE_FACTOR.BOUNCE_X.x,
    scaleYOnBounceX: SCALE_FACTOR.BOUNCE_Y.y,
    scaleXOnBounceY: SCALE_FACTOR.BOUNCE_Y.x,
    scaleYOnBounceY: SCALE_FACTOR.BOUNCE_Y.y,
    scaleBothAxes: SCALE_FACTOR.BOTH_AXES,
    originalScale: ORIGINAL_SCALE,
  };
  
  // Utility function for applying tween
  function applyTween(target, to, duration, easing, onComplete = () => { }) {
    return new TWEEN.Tween(target)
      .to(to, duration)
      .easing(easing)
      .onComplete(onComplete)
      .start();
  }
  
  function applySquashAndStretchEffect(sprite, bounceAxis) {
    if (!sprite || !sprite.scale || !sprite.initialScale || !sprite.velocity) {
      console.warn("Attempted to apply squash and stretch to a missing or destroyed sprite.");
      return;
    }
  
    const { scaleXOnBounceX, scaleYOnBounceX, scaleXOnBounceY, scaleYOnBounceY, scaleBothAxes } = squashStretchConfig;
    let targetScale = { ...sprite.initialScale };
  
    switch (bounceAxis) {
      case "x":
        targetScale.x *= scaleXOnBounceX;
        targetScale.y *= scaleYOnBounceY;
        break;
      case "y":
        targetScale.x *= scaleXOnBounceY;
        targetScale.y *= scaleYOnBounceX;
        break;
      case "both":
        targetScale.x *= scaleBothAxes;
        targetScale.y *= scaleBothAxes;
        break;
      default:
        console.warn(`Invalid bounce axis: ${bounceAxis}`);
        return;
    }
  
    // console.log(`Applying squash and stretch. Axis: ${bounceAxis}, Target Scale:`, targetScale);
  
    // Now apply the tween animation using targetScale
    applyTween(sprite.scale, targetScale, squashStretchConfig.squashDuration, TWEEN.Easing.Quadratic.Out, () =>
      applyTween(sprite.scale, sprite.initialScale, squashStretchConfig.stretchDuration, TWEEN.Easing.Elastic.Out)
    );
  }
  
  // Apply collision animation without destroying the sprite
  function applyCollisionAnimation(sprite) {
    new TWEEN.Tween(sprite.scale)
      .to({ x: sprite.scale.x * 1.2, y: sprite.scale.y * 1.2, z: sprite.scale.z * 1.2 }, 200)
      .easing(TWEEN.Easing.Elastic.Out)
      .onStart(() => {
        // Add a quick rotation effect
        new TWEEN.Tween(sprite.rotation)
          .to({ z: sprite.rotation.z + Math.PI * 2 }, 200)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
      })
      .to({ x: sprite.initialScale.x, y: sprite.initialScale.y, z: sprite.initialScale.z }, 200)
      .easing(TWEEN.Easing.Elastic.Out)
      .start();
  }
  
  animate();
  