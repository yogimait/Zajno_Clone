import * as THREE from 'three';
import LocomotiveScroll from 'locomotive-scroll';
import vertexShader from './shaders/vertexShader.glsl';
import fragmentShader from './shaders/fragmentShader.glsl';
import gsap from 'gsap';


const locomotiveScroll = new LocomotiveScroll();

// Add these lines after creating the renderer
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Add this event listener after your other event listeners



// Create a scene
const scene = new THREE.Scene();
const distance = 100;
// Create a camera
const fov = Math.atan((window.innerHeight / 2) / distance) * 2 * (180 / Math.PI);
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = distance;

// Create a renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const images = document.querySelectorAll('img');
const planes = [];
images.forEach(function (img) {
  const imgbounds = img.getBoundingClientRect();
  const texture = new THREE.TextureLoader().load(img.src);
  const geometry = new THREE.PlaneGeometry(imgbounds.width, imgbounds.height);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: {
        value: texture,
      },
      umouse: {
        value: new THREE.Vector2(0.5, 0.5)
      },
      uHover:{
        value: 0
      }

    },
    vertexShader,
    fragmentShader,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.position.set(imgbounds.left - window.innerWidth / 2 + imgbounds.width / 2, -imgbounds.top + window.innerHeight / 2 - imgbounds.height / 2, 0);
  planes.push(plane);
  scene.add(plane);
});



// Create a cube geometry
// const geometry = new THREE.PlaneGeometry(100, 100);

// // Create a material
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// // Create a cube mesh
// const plane = new THREE.Mesh(geometry, material);
// scene.add(plane);

function updatePlanesPosition() {
  planes.forEach((plane, index) => {
    const image = images[index];
    const imgbounds = image.getBoundingClientRect();
    plane.position.set(imgbounds.left - window.innerWidth / 2 + imgbounds.width / 2, -imgbounds.top + window.innerHeight / 2 - imgbounds.height / 2, 0);
  })
}



// Render the scene
function animate() {
  requestAnimationFrame(animate);
  updatePlanesPosition(); // animate the planes
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Update plane positions
  updatePlanesPosition();
});


window.addEventListener('mousemove', (event) => {
  // Update mouse coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections with planes
  const intersects = raycaster.intersectObjects(planes);

  // Reset all planes' uniforms
  planes.forEach(plane => {
    plane.material.uniforms.umouse.value = new THREE.Vector2(0.5, 0.5);
    plane.material.uniforms.uHover.value = 0; // Reset hover state for all planes
  gsap.to(plane.material.uniforms.uHover, {
    value: 0,
    duration: 0.5,
    ease: "power2.out"
  });
  });

  // Update umouse uniform for intersected plane
  if (intersects.length > 0) {
    const intersectedPlane = intersects[0];
    intersectedPlane.object.material.uniforms.umouse.value = new THREE.Vector2(
      intersectedPlane.uv.x,
      intersectedPlane.uv.y
    );
    gsap.to(intersectedPlane.object.material.uniforms.uHover, {
      value: 1,
      duration: 0.5,
      ease: "power2.out"
    });
  }
});