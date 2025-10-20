   let audio = new Audio();
        let isPlaying = false;
        
        audio.src = 'assets/music/wedding-song.mp3';
        audio.loop = true;
        audio.volume = 0.5;

        const musicToggle = document.getElementById('musicToggle');
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');

        musicToggle.addEventListener('click', toggleMusic);

        function toggleMusic() {
            if (isPlaying) {
                audio.pause();
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                musicToggle.classList.remove('playing');
            } else {
                audio.play().catch(err => {
                    console.log('Audio play failed:', err);
                });
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
                musicToggle.classList.add('playing');
            }
            isPlaying = !isPlaying;
        }

        document.body.addEventListener('click', function autoPlay() {
            if (!isPlaying) {
                toggleMusic();
            }
            document.body.removeEventListener('click', autoPlay);
        }, { once: true });

        // Three.js Setup
        let scene, camera, renderer;
        let mouse = { x: 0, y: 0 };
        let particles = [];

        function init() {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 30;

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.getElementById('canvas-container').appendChild(renderer.domElement);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 5, 5);
            scene.add(directionalLight);

            const pointLight = new THREE.PointLight(0x667eea, 0.6, 100);
            pointLight.position.set(0, 0, 20);
            scene.add(pointLight);

            window.addEventListener('resize', onResize);
            window.addEventListener('mousemove', onClick);
            window.addEventListener('touchmove', onClick);
            window.addEventListener('click', onClick);

            animate();
        }

        function onClick(e) {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;

            const vector = new THREE.Vector3(x, y, 0.5);
            vector.unproject(camera);
            const dir = vector.sub(camera.position).normalize();
            const distance = -camera.position.z / dir.z;
            const pos = camera.position.clone().add(dir.multiplyScalar(distance));

            explodeStar(pos);
        }

        function explodeStar(pos) {
            const heartShape = new THREE.Shape();
            heartShape.moveTo(0, 0);
            heartShape.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0);
            heartShape.bezierCurveTo(-0.6, 0.3, 0, 0.6, 0, 1);
            heartShape.bezierCurveTo(0, 0.6, 0.6, 0.3, 0.6, 0);
            heartShape.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0);

            const extrudeSettings = {
                depth: 0.03,
                bevelEnabled: true,
                bevelThickness: 0.05,
                bevelSize: 0.05,
                bevelSegments: 2
            };

            const colors = [0xFFFFFF, 0xF0F0F0, 0xE8E8E8, 0xE0E0E0];
            
            // Array of your emoji PNG paths
            const emojiPaths = [
                'assets/emojis/emoji1.png',
                'assets/emojis/emoji2.png',
                'assets/emojis/emoji3.png',
                'assets/emojis/emoji4.png',
                'assets/emojis/emoji5.png'
                // Add more emoji paths here
            ];

            for (let i = 0; i < 5; i++) {
                let particle;
                
                // 50% chance for heart, 50% chance for emoji
                if (Math.random() > 0.7) {
                    // Create 3D heart
                    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
                    const material = new THREE.MeshPhongMaterial({ 
                        color: colors[Math.floor(Math.random() * colors.length)]
                    });
                    particle = new THREE.Mesh(geometry, material);
                } else {
                    // Create emoji as 3D plane
                    const textureLoader = new THREE.TextureLoader();
                    const randomEmoji = emojiPaths[Math.floor(Math.random() * emojiPaths.length)];
                    const texture = textureLoader.load(randomEmoji);
                    
                    const planeGeometry = new THREE.PlaneGeometry(1, 1);
                    const planeMaterial = new THREE.MeshBasicMaterial({ 
                        map: texture,
                        transparent: true,
                        side: THREE.DoubleSide // Show both sides of the plane
                    });
                    particle = new THREE.Mesh(planeGeometry, planeMaterial);
                }
                
                particle.position.copy(pos);
                
                const speed = Math.random() * 0.5 + 0.3;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                
                particle.velocity = new THREE.Vector3(
                    Math.sin(phi) * Math.cos(theta) * speed,
                    Math.sin(phi) * Math.sin(theta) * speed,
                    Math.cos(phi) * speed
                );
                
                particle.rotation.x = Math.random() * Math.PI * 2;
                particle.rotation.y = Math.random() * Math.PI * 2;
                particle.rotation.z = Math.random() * Math.PI * 2;
                
                particle.rotationSpeed = {
                    x: (Math.random() - 0.5) * 0.1,
                    y: (Math.random() - 0.5) * 0.1,
                    z: (Math.random() - 0.5) * 0.1
                };
                
                particle.life = 3.0;
                particle.decay = Math.random() * 0.01 + 0.015;
                
                scene.add(particle);
                particles.push(particle);
            }
        }

        function animate() {
            requestAnimationFrame(animate);

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.position.add(p.velocity);
                p.velocity.multiplyScalar(0.97);
                p.velocity.z += 0.01;
                
                p.rotation.x += p.rotationSpeed.x;
                p.rotation.y += p.rotationSpeed.y;
                p.rotation.z += p.rotationSpeed.z;
                
                p.life -= p.decay;
                p.material.opacity = p.life;
                p.material.transparent = true;
                p.scale.setScalar(p.life);

                if (p.life <= 0) {
                    scene.remove(p);
                    particles.splice(i, 1);
                }
            }

            renderer.render(scene, camera);
        }

        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        init();

        document.querySelector('.rsvp-form').addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Terima kasih atas konfirmasi Anda! 🎉');
        });

        // Carousel functionality
        const track = document.getElementById('carouselTrack');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const indicatorsContainer = document.getElementById('indicators');
        const slides = document.querySelectorAll('.carousel-slide');
        
        let currentSlide = 0;
        const totalSlides = slides.length;

        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (i === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => goToSlide(i));
            indicatorsContainer.appendChild(indicator);
        }

        const indicators = document.querySelectorAll('.indicator');

        function updateCarousel() {
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentSlide);
            });
        }

        function goToSlide(index) {
            currentSlide = index;
            updateCarousel();
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        }

        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);

        setInterval(nextSlide, 4000);

        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            if (touchStartX - touchEndX > 50) {
                nextSlide();
            } else if (touchEndX - touchStartX > 50) {
                prevSlide();
            }
        }