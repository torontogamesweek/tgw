// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd2dfea);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sprite creation
const loader = new THREE.TextureLoader();
let objects = []; // This will store our sprites


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

  // Add more images as needed
];

imageUrls.forEach((url) => {
  loader.load(url, function (texture) {
    const material = new THREE.SpriteMaterial({ map: texture });

    // Create the sprite and set its scale to maintain aspect ratio
    const sprite = new THREE.Sprite(material);
    const imageAspect = texture.image.width / texture.image.height;
    sprite.scale.set(imageAspect, 1, 1); // This keeps the sprite's aspect ratio

    sprite.position.x = Math.random() * 10 - 5;
    sprite.position.y = Math.random() * 10 - 5;
    sprite.position.z = Math.random() * 10 - 5;
    sprite.velocity = new THREE.Vector3(Math.random() * 0.01 - 0.005, Math.random() * 0.01 - 0.005, 0);
    scene.add(sprite);
    objects.push(sprite);
  });
});

// Raycaster for click events
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", onClick);

function onClick(event) {
  // clickSound.play();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objects);
  if (intersects.length > 0) {
    const sound = new Audio("images/hit.mp3");
    sound.play();
    
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
            scene.remove(object);
            objects = objects.filter((o) => o !== object); // Remove object from the array
          })
          .start();
      })
      .start();
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

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  TWEEN.update(); // Add this to update TWEEN animations

  objects.forEach((sprite) => {
    sprite.position.add(sprite.velocity);
    sprite.material.rotation += 0.005; // Adjusted for slower rotation

    if (sprite.position.x > 5 || sprite.position.x < -5) {
      sprite.velocity.x *= -1;
    }
    if (sprite.position.y > 5 || sprite.position.y < -5) {
      sprite.velocity.y *= -1;
    }
  });

  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
