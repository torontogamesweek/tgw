// Scene setup
const SceneController = {
  scene: new THREE.Scene(),
  camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000),
  renderer: new THREE.WebGLRenderer(),

  setup: function() {
      this.scene.background = new THREE.Color(0xd2dfea);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);

      window.addEventListener('resize', () => this.onWindowResize(), false);
  },

  onWindowResize: function() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
};

SceneController.setup();

// Add a container for the full-screen layered images
const layerContainer = document.createElement('div');
layerContainer.style.position = 'fixed';
layerContainer.style.top = '0';
layerContainer.style.left = '0';
layerContainer.style.width = '100%';
layerContainer.style.height = '100%';
layerContainer.style.zIndex = '-1'; // Put it behind other content
layerContainer.style.pointerEvents = 'none'; // Allow clicks to pass through to the canvas
document.body.appendChild(layerContainer);

// Sprite creation
const loader = new THREE.TextureLoader();
let objects = []; // This will store our sprites

// Array of image URLs
let imageUrls = [
  "images/creatures/1.png",
  "images/creatures/2.png",
  "images/creatures/3.png",
  // ... rest of your image URLs ...
];

const standardHeight = 0.85;
const minDistance = 1.4;
const maxDistance = 1.9;
const dampingFactor = 0.98;

function addSprite(url) {
  loader.load(
      url,
      function(texture) {
          const material = new THREE.SpriteMaterial({ map: texture });
          const imageAspect = texture.image.width / texture.image.height;
          const spriteWidth = standardHeight * imageAspect;
          const sprite = new THREE.Sprite(material);
          sprite.scale.set(spriteWidth, standardHeight, 1);

          sprite.initialScale = { x: spriteWidth, y: standardHeight, z: 1 };
          sprite.scale.set(sprite.initialScale.x, sprite.initialScale.y, sprite.initialScale.z);

          sprite.position.x = (Math.random() - 0.5) * 1.9;
          sprite.position.y = (Math.random() - 0.5) * 1.9;
          sprite.position.z = -(Math.random() * (maxDistance - minDistance) + minDistance);
          sprite.velocity = new THREE.Vector3(
              (Math.random() - 0.5) * 0.01,
              (Math.random() - 0.5) * 0.01,
              0
          );

          SceneController.scene.add(sprite);
          objects.push(sprite);
      },
      function(xhr) {
          // Progress callback
      },
      function(error) {
          console.error("An error occurred while loading the texture:", error);
      }
  );
}

// Initially load only the first 5 images
for (let i = 0; i < 2; i++) {
  addSprite(imageUrls[i]);
}

let loadedImagesCount = 2;

// Raycaster for click events
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', onClick);

function addSisterImage(spriteNumber) {
  const img = document.createElement('img');
  img.src = `images/creatures/${spriteNumber}full.png`;
  img.style.position = 'absolute';
  img.style.top = '0';
  img.style.left = '0';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'contain';
  img.style.opacity = '0';
  
  layerContainer.appendChild(img);
  
  new TWEEN.Tween({ opacity: 0 })
      .to({ opacity: 1 }, 500)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(obj => {
          img.style.opacity = obj.opacity;
      })
      .start();
}

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, SceneController.camera);
  const intersects = raycaster.intersectObjects(objects);
  
  if (intersects.length > 0) {
      const object = intersects[0].object;
      const spritePath = object.material.map.image.src;
      
      // Extract the number from the sprite path (e.g., "1" from "images/creatures/1.png")
      const matches = spritePath.match(/\/(\d+)\.png$/);
      if (matches) {
          const spriteNumber = matches[1];
          addSisterImage(spriteNumber);
      }

      // Existing animation code for the sprite
      object.material.transparent = true;
      new TWEEN.Tween(object.scale)
          .to({ x: object.scale.x * 1.8, y: object.scale.y * 1.8, z: object.scale.z * 1.8 }, 200)
          .easing(TWEEN.Easing.Elastic.Out)
          .onStart(() => {
              new TWEEN.Tween(object.rotation)
                  .to({ z: object.rotation.z + Math.PI * 2 }, 200)
                  .easing(TWEEN.Easing.Quadratic.Out)
                  .start();

              new TWEEN.Tween(object.material)
                  .to({ opacity: 0 }, 200)
                  .easing(TWEEN.Easing.Quadratic.Out)
                  .onComplete(() => {
                      SceneController.scene.remove(object);
                      objects = objects.filter(o => o !== object);
                      
                      // Load an additional image if available
                      if (loadedImagesCount < imageUrls.length) {
                          addSprite(imageUrls[loadedImagesCount]);
                          loadedImagesCount++;
                      }
                  })
                  .start();
          })
          .start();
  }
}

let originalSpeeds = new Map();
const rotationSpeed = 0.005;
const xBound = 2.3;
const yBound = 1;

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

const squashStretchConfig = {
  squashDuration: DURATION.SQUASH,
  stretchDuration: DURATION.STRETCH,
  scaleXOnBounceX: SCALE_FACTOR.BOUNCE_X.x,
  scaleYOnBounceX: SCALE_FACTOR.BOUNCE_X.y,
  scaleXOnBounceY: SCALE_FACTOR.BOUNCE_Y.x,
  scaleYOnBounceY: SCALE_FACTOR.BOUNCE_Y.y,
  scaleBothAxes: SCALE_FACTOR.BOTH_AXES,
  originalScale: ORIGINAL_SCALE,
};

function applyTween(target, to, duration, easing, onComplete = () => {}) {
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

  applyTween(
      sprite.scale,
      targetScale,
      squashStretchConfig.squashDuration,
      TWEEN.Easing.Quadratic.Out,
      () => applyTween(
          sprite.scale,
          sprite.initialScale,
          squashStretchConfig.stretchDuration,
          TWEEN.Easing.Elastic.Out
      )
  );
}

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();

  objects.forEach((sprite) => {
      if (!sprite || !sprite.position || !sprite.velocity) {
          return;
      }
      sprite.position.add(sprite.velocity);
      sprite.material.rotation += rotationSpeed;

      let bounced = false;
      let bounceAxis = null;

      if (sprite.position.x > xBound || sprite.position.x < -xBound) {
          sprite.velocity.x *= -1;
          bounced = true;
          bounceAxis = "x";
      }
      if (sprite.position.y > yBound || sprite.position.y < -yBound) {
          sprite.velocity.y *= -1;
          bounced = true;
          bounceAxis = bounceAxis ? "both" : "y";
      }

      if (bounced) {
          applySquashAndStretchEffect(sprite, bounceAxis);

          if (!originalSpeeds.has(sprite)) {
              originalSpeeds.set(sprite, sprite.velocity.length());
              sprite.velocity.multiplyScalar(dampingFactor);
              sprite.isDamping = true;
          }

          if (sprite.isDamping) {
              let originalSpeed = originalSpeeds.get(sprite);
              sprite.velocity.multiplyScalar(dampingFactor);
              if (Math.abs(sprite.velocity.length() - originalSpeed) < 0.001) {
                  sprite.isDamping = false;
                  sprite.velocity.setLength(originalSpeed);
              }
          }

          sprite.velocity.multiplyScalar(1.2);
          sprite.velocity.clampLength(0, 0.05);

          setTimeout(() => {
              if (originalSpeeds.has(sprite)) {
                  let originalSpeed = originalSpeeds.get(sprite);
                  sprite.velocity.setLength(originalSpeed);
              }
          }, 2000);
      }
  });

  SceneController.renderer.render(SceneController.scene, SceneController.camera);
}

animate();