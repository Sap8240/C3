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

        // 3D Background Animation
        let scene, camera, renderer, particles, particleSystem;
        let mouseX = 0, mouseY = 0;
        let windowHalfX = window.innerWidth / 2;
        let windowHalfY = window.innerHeight / 2;

        function init() {
            // Create scene
            scene = new THREE.Scene();
            
            // Create camera
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 100;
            
            // Create renderer
            renderer = new THREE.WebGLRenderer({ 
                canvas: document.getElementById('bg-canvas'),
                alpha: true,
                antialias: true
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            
            // Create particles
            createParticles();
            
            // Create floating geometric shapes
            createFloatingShapes();
            
            // Add lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
            scene.add(ambientLight);
            
            const pointLight = new THREE.PointLight(0x00ff88, 1, 100);
            pointLight.position.set(10, 10, 10);
            scene.add(pointLight);
            
            // Mouse movement listener
            document.addEventListener('mousemove', onMouseMove, false);
            
            // Window resize listener
            window.addEventListener('resize', onWindowResize, false);
            
            // Start animation
            animate();
        }
        
        function createParticles() {
            const particleCount = 1000; // Restored original value
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);

            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 200;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

                // Green to cyan gradient
                const greenIntensity = Math.random();
                colors[i * 3] = greenIntensity * 0.0; // Red
                colors[i * 3 + 1] = 1.0; // Green
                colors[i * 3 + 2] = (1 - greenIntensity) * 0.5; // Blue
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: 2,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });

            particleSystem = new THREE.Points(geometry, material);
            scene.add(particleSystem);
        }

        function createFloatingShapes() {
            // Create blockchain-inspired hexagons
            const hexGeometry = new THREE.CylinderGeometry(15, 15, 5, 6);
            const hexMaterial = new THREE.MeshPhongMaterial({
                color: 0x00ff88,
                transparent: true,
                opacity: 0.3,
                wireframe: true
            });

            const hex1 = new THREE.Mesh(hexGeometry, hexMaterial);
            hex1.position.set(-50, 0, -50);
            hex1.rotation.x = Math.PI / 2;
            scene.add(hex1);

            const hex2 = new THREE.Mesh(hexGeometry, hexMaterial);
            hex2.position.set(50, 0, -50);
            hex2.rotation.x = Math.PI / 2;
            scene.add(hex2);

            // Create floating crypto-themed cubes
            for (let i = 0; i < 15; i++) { // Restored original value
                const cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
                const cubeMaterial = new THREE.MeshPhongMaterial({
                    color: Math.random() > 0.5 ? 0x00ff88 : 0x00d4ff,
                    transparent: true,
                    opacity: 0.6
                });

                const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                cube.position.set(
                    (Math.random() - 0.5) * 150,
                    (Math.random() - 0.5) * 150,
                    (Math.random() - 0.5) * 100
                );
                cube.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                scene.add(cube);
            }

            // Create blockchain connection lines
            const lineGeometry = new THREE.BufferGeometry();
            const linePositions = [];
            const lineColors = [];

            for (let i = 0; i < 60; i++) { // Restored original value
                const start = new THREE.Vector3(
                    (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 100
                );
                const end = new THREE.Vector3(
                    start.x + (Math.random() - 0.5) * 25,
                    start.y + (Math.random() - 0.5) * 25,
                    start.z + (Math.random() - 0.5) * 25
                );

                linePositions.push(start.x, start.y, start.z);
                linePositions.push(end.x, end.y, end.z);

                // Add colors for the line
                lineColors.push(0, 1, 0.5); // Green-cyan
                lineColors.push(0, 0.8, 1); // Cyan
            }

            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
            lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

            const lineMaterial = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending
            });

            const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
            scene.add(lines);
        }
        
        function onMouseMove(event) {
            mouseX = (event.clientX - windowHalfX) * 0.001;
            mouseY = (event.clientY - windowHalfY) * 0.001;
        }
        
        function onWindowResize() {
            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;
            
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        
        function animate() {
            requestAnimationFrame(animate);
            
            const time = Date.now() * 0.001;
            
            // Rotate particle system
            if (particleSystem) {
                particleSystem.rotation.x = time * 0.1 + mouseY;
                particleSystem.rotation.y = time * 0.05 + mouseX;
            }
            
            // Animate individual shapes
            scene.children.forEach((child, index) => {
                if (child.type === 'Mesh') {
                    child.rotation.x += 0.01;
                    child.rotation.y += 0.01;
                    child.position.y += Math.sin(time + index) * 0.1;
                }
            });
            
            // Camera movement based on mouse
            camera.position.x += (mouseX * 10 - camera.position.x) * 0.05;
            camera.position.y += (-mouseY * 10 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);
            
            renderer.render(scene, camera);
        }

        document.getElementById('contactForm').addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Thank you for contacting us!');
            this.reset();
        });
        
        // Initialize when page loads
        window.addEventListener('load', init);