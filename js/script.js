AOS.init();

// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const navList = document.getElementById('nav-list');
hamburger.addEventListener('click', () => {
    navList.classList.toggle('active');
});
// Close menu on link click (mobile UX)
document.querySelectorAll('#nav-list a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            navList.classList.remove('active');
        }
    });
});

// Scene setup
let scene, camera, renderer, particleSystem, particles = [];
let particleGeometry, particlePositions, particleColors, particleSizes;
const particleCount = 800;
const maxRadius = 4;
const spiralArms = 3;

function initGalaxyEffect() {
    // Create or get canvas container
    let container = document.getElementById('canvas-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'canvas-container';
        container.style.position = 'fixed';
        container.style.top = 0;
        container.style.left = 0;
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.zIndex = 0;
        container.style.pointerEvents = 'none';
        document.body.prepend(container);
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background

    // Remove any previous canvas
    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(renderer.domElement);

    // Mouse tracking
    const mouse = new THREE.Vector2();
    const mouseInfluence = new THREE.Vector3();
    let mouseActive = false;

    // Particle system setup
    particles = [];
    particleGeometry = new THREE.BufferGeometry();
    particlePositions = new Float32Array(particleCount * 3);
    particleColors = new Float32Array(particleCount * 3);
    particleSizes = new Float32Array(particleCount);

    // Create particles in galaxy-like circular formation
    for (let i = 0; i < particleCount; i++) {
        const t = i / particleCount;
        const radius = Math.pow(Math.random(), 0.5) * maxRadius;
        const spiralAngle = t * Math.PI * 1.5;
        const armOffset = Math.floor(Math.random() * spiralArms) * (2 * Math.PI / spiralArms);
        let angle = spiralAngle + armOffset;
        angle += (Math.random() - 0.5) * 0.5;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = (Math.random() - 0.5) * 0.3;

        const particle = {
            position: new THREE.Vector3(x, y, z),
            originalPosition: new THREE.Vector3(x, y, z),
            velocity: new THREE.Vector3(0, 0, 0),
            size: Math.random() * 0.3 + 0.02,
            radius: radius,
            angle: angle,
            spiralSpeed: 0.001 + Math.random() * 0.002
        };

        particles.push(particle);

        particlePositions[i * 3] = particle.position.x;
        particlePositions[i * 3 + 1] = particle.position.y;
        particlePositions[i * 3 + 2] = particle.position.z;
        particleSizes[i] = particle.size;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

    const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            void main() {
                float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                gl_FragColor = vec4(vColor, alpha * 0.9);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    camera.position.z = 8;

    document.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        mouseInfluence.x = mouse.x * 6;
        mouseInfluence.y = mouse.y * 6;
        mouseInfluence.z = 0;
        mouseActive = true;
    });

    document.addEventListener('mouseleave', () => {
        mouseActive = false;
    });

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        for (let i = 0; i < particleCount; i++) {
            const particle = particles[i];
            particle.angle += particle.spiralSpeed;
            const newX = Math.cos(particle.angle) * particle.radius;
            const newY = Math.sin(particle.angle) * particle.radius;
            particle.originalPosition.x = newX;
            particle.originalPosition.y = newY;

            if (mouseActive) {
                const distance = particle.position.distanceTo(mouseInfluence);
                if (distance < 3) {
                    const direction = new THREE.Vector3()
                        .subVectors(particle.position, mouseInfluence)
                        .normalize();
                    const force = direction.multiplyScalar(0.03 * (3 - distance) / 3);
                    particle.velocity.add(force);
                }
            }

            particle.position.add(particle.velocity);

            const returnForce = new THREE.Vector3()
                .subVectors(particle.originalPosition, particle.position)
                .multiplyScalar(0.015);
            particle.velocity.add(returnForce);

            particle.velocity.multiplyScalar(0.94);

            const normalizedRadius = particle.radius / maxRadius;
            const hue = 0.8 - normalizedRadius * 0.15;
            const saturation = 0.8 + normalizedRadius * 0.2;
            const lightness = 0.3 + (1 - normalizedRadius) * 0.4;
            const color = new THREE.Color().setHSL(hue, saturation, lightness);

            particlePositions[i * 3] = particle.position.x;
            particlePositions[i * 3 + 1] = particle.position.y;
            particlePositions[i * 3 + 2] = particle.position.z;

            particleColors[i * 3] = color.r;
            particleColors[i * 3 + 1] = color.g;
            particleColors[i * 3 + 2] = color.b;
        }

        particleGeometry.attributes.position.needsUpdate = true;
        particleGeometry.attributes.color.needsUpdate = true;

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

// Ensure effect is initialized after DOM is ready
window.addEventListener('DOMContentLoaded', initGalaxyEffect);

// --- Keep your fade-in and menu code as is below ---

document.addEventListener("DOMContentLoaded", function() {
    const faders = document.querySelectorAll('.fade-in');
    const appearOptions = {
        threshold: 0.15
    };
    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
            });
        });
    }
});
