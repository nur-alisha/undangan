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
            window.addEventListener('click', onClick);

            updateBackground();
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

            const canvas = document.getElementById('starCanvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    

            class Star {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.twinkleOffset = Math.random() * Math.PI * 2;
      }
      
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.size = Math.random() * 1.5 + 0.5;
        this.baseOpacity = Math.random() * 0.5 + 0.5;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.speed = this.size * 0.5;
      }
      
      update() {
        this.x -= this.speed * 0.3;
        this.y += this.speed * 0.5;
        
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.y > canvas.height + 10) this.y = -10;
      }
      
      draw(time, opacity) {
        const twinkle = Math.sin(time * this.twinkleSpeed + this.twinkleOffset) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.baseOpacity * twinkle * opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
          class Meteorite {
      constructor() {
        this.x = Math.random() * canvas.width + canvas.width * 0.3;
        this.y = Math.random() * canvas.height * 0.3;
        this.vx = -(Math.random() * 3 + 5);
        this.vy = Math.random() * 2 + 3;
        this.length = Math.random() * 60 + 40;
        this.opacity = 1;
        this.life = 0;
        this.maxLife = Math.random() * 60 + 40;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        this.opacity = 1 - (this.life / this.maxLife);
      }
      
      draw(opacity) {
        const gradient = ctx.createLinearGradient(
          this.x, this.y,
          this.x - this.vx * 10, this.y - this.vy * 10
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * opacity})`);
        gradient.addColorStop(0.3, `rgba(200, 220, 255, ${this.opacity * 0.6 * opacity})`);
        gradient.addColorStop(1, `rgba(150, 180, 255, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 10, this.y - this.vy * 10);
        ctx.stroke();
      }
      
      isDead() {
        return this.life >= this.maxLife || this.x < -100 || this.y > canvas.height + 100;
      }
    }
    
    // Create stars
    const stars = [];
    for (let i = 0; i < 300; i++) {
      stars.push(new Star());
    }
    
    // Meteorites
    const meteorites = [];
    let lastMeteorTime = 0;
    
    // Color stops for day cycle
    const colorStops = [
      { hour: 0, name: 'Night', colors: [[15, 32, 39], [32, 58, 67], [44, 83, 100]] },
      { hour: 5, name: 'Pre-Dawn', colors: [[15, 32, 39], [32, 58, 67], [44, 83, 100]] },
      // { hour: 6, name: 'Dawn', colors: [[255, 107, 107], [254, 202, 87], [72, 219, 251]] },
      { hour: 7, name: 'Early Morning', colors: [[189, 212, 214], [100, 150, 200], [2, 81, 250]] },
      { hour: 10, name: 'Morning', colors: [[189, 212, 214], [2, 81, 250], [0, 50, 200]] },
      { hour: 14, name: 'Afternoon', colors: [[135, 206, 235], [74, 144, 226], [50, 120, 200]] },
      { hour: 17, name: 'Late Afternoon', colors: [[135, 206, 235], [255, 150, 100], [74, 144, 226]] },
      { hour: 18, name: 'Golden Hour', colors: [[255, 107, 107], [255, 140, 66], [238, 90, 111]] },
      { hour: 19, name: 'Sunset', colors: [[255, 107, 107], [255, 100, 80], [100, 50, 80]] },
      { hour: 20, name: 'Dusk', colors: [[67, 67, 67], [30, 30, 50], [0, 0, 0]] },
      { hour: 21, name: 'Night', colors: [[15, 32, 39], [32, 58, 67], [44, 83, 100]] },
      { hour: 24, name: 'Night', colors: [[15, 32, 39], [32, 58, 67], [44, 83, 100]] }
    ];
    
    // Initialize with device's real time
    const now = new Date();
    let currentHour = now.getHours();
    let currentMinute = now.getMinutes();
    let baseSpeed = 0.5; // Normal speed (0.5 minutes per frame)
    let speedMultiplier = 1;
    let animationTime = 0;
    
    // Keyboard controls
    let rightKeyPressed = false;
    
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        rightKeyPressed = true;
        speedMultiplier = 20; // 20x faster when holding right arrow
      }
    });
    
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowRight') {
        rightKeyPressed = false;
        speedMultiplier = 1;
      }
    });
    
    function lerp(a, b, t) {
      return a + (b - a) * t;
    }
    
    function lerpColor(color1, color2, t) {
      return [
        lerp(color1[0], color2[0], t),
        lerp(color1[1], color2[1], t),
        lerp(color1[2], color2[2], t)
      ];
    }
    
    function rgbToHex(r, g, b) {
      return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    }
        
            function getInterpolatedGradient(decimalHour) {
      let startStop, endStop;
      
      for (let i = 0; i < colorStops.length - 1; i++) {
        if (decimalHour >= colorStops[i].hour && decimalHour < colorStops[i + 1].hour) {
          startStop = colorStops[i];
          endStop = colorStops[i + 1];
          break;
        }
      }
      
      if (!startStop || !endStop) {
        startStop = colorStops[colorStops.length - 1];
        endStop = colorStops[0];
      }
      
      const totalDuration = endStop.hour - startStop.hour;
      const elapsed = decimalHour - startStop.hour;
      const t = totalDuration > 0 ? elapsed / totalDuration : 0;
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      
      const color1 = lerpColor(startStop.colors[0], endStop.colors[0], eased);
      const color2 = lerpColor(startStop.colors[1], endStop.colors[1], eased);
      const color3 = lerpColor(startStop.colors[2], endStop.colors[2], eased);
      
      const hex1 = rgbToHex(color1[0], color1[1], color1[2]);
      const hex2 = rgbToHex(color2[0], color2[1], color2[2]);
      const hex3 = rgbToHex(color3[0], color3[1], color3[2]);
      
      return {
        gradient: `linear-gradient(135deg, ${hex1} 0%, ${hex2} 50%, ${hex3} 100%)`,
        name: t < 0.5 ? startStop.name : endStop.name
      };
    }

            function getStarOpacity(decimalHour) {
      if (decimalHour >= 21 || decimalHour < 5) return 1;
      if (decimalHour >= 5 && decimalHour < 7) return 1 - (decimalHour - 5) / 2;
      if (decimalHour >= 19 && decimalHour < 21) return (decimalHour - 19) / 2;
      return 0;
    }
    
            function updateBackground() {
      const decimalHour = currentHour + (currentMinute / 60);
      const result = getInterpolatedGradient(decimalHour);
      document.body.style.background = result.gradient;
    }
    
        function advanceTime() {
      currentMinute += baseSpeed * speedMultiplier;
      
      if (currentMinute >= 60) {
        currentMinute = currentMinute % 60;
        currentHour++;
        
        if (currentHour >= 24) {
          currentHour = 0;
        }
      }
      
      updateBackground();
    }

        function animate() {
            requestAnimationFrame(animate);

            advanceTime();
 
            const decimalHour = currentHour + (currentMinute / 60);
            const starOpacity = getStarOpacity(decimalHour);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (starOpacity > 0) {
                animationTime += 0.1;
                stars.forEach(star => {
                star.update();
                star.draw(animationTime, starOpacity);
                });
                
                if (starOpacity > 0.5 && Math.random() < 0.1 && Date.now() - lastMeteorTime > 3000) {
                    meteorites.push(new Meteorite());
                    lastMeteorTime = Date.now();
                }
                
                for (let i = meteorites.length - 1; i >= 0; i--) {
                    meteorites[i].update();
                    meteorites[i].draw(starOpacity);
                    
                    if (meteorites[i].isDead()) {
                        meteorites.splice(i, 1);
                    }
                }
            }

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