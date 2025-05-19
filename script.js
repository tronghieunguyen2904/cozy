window.addEventListener('load', function () {
    generateBubbles(45);

    const tl = gsap.timeline();

    // 👶 Tạo hiệu ứng "chibi" dễ thương cho text
    tl.fromTo('.splash-text', {
        opacity: 0,
        scale: 0.8,
        y: 20
    }, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.5)'
    });

    gsap.to('.splash-text', {
        y: -5,
        repeat: -1,
        yoyo: true,
        duration: 1,
        ease: 'sine.inOut'
    });

    tl.fromTo('.splash-logo img', {
        opacity: 0,
        scale: 0.9
    }, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'power2.out'
    }, "<");

    tl.to('.splash-screen', {
        delay: 2.5,
        opacity: 0,
        duration: 1,
        ease: 'power1.inOut',
        onComplete: function () {
            document.querySelector('.splash-screen').style.display = 'none';
            animateHomePage();
        }
    });
});

function initThree() {
  const heroImage = document.querySelector('.hero-image');
  if (!heroImage) return;

  // 1) Xoá placeholder image
  heroImage.innerHTML = '';

  // 2) Tạo canvas và append
  const canvas = document.createElement('canvas');
  canvas.id = 'modelCanvas';
  heroImage.appendChild(canvas);

  // 3) Scene / Camera / Renderer
  const scene = new THREE.Scene();
  // (Bạn có thể bật background nếu muốn)
//  scene.background = new THREE.Color(0xf8f9fe);

  const camera = new THREE.PerspectiveCamera(
    45,
    heroImage.clientWidth / heroImage.clientHeight,
    0.1,
    1000
  );
    camera.position.set(4, 3, 0); 
    camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(heroImage.clientWidth, heroImage.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0); // transparent

  // Ánh sáng
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);
  scene.add(new THREE.AmbientLight(0x404040));

  // 4) Load model và xử lý bounding box
  const loader = new THREE.GLTFLoader();
  let model, mixer;

  loader.load(
    '/assets/models/mobile_home.glb',
    gltf => {
      model = gltf.scene;

      // --- Tính bounding box ---
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const min  = box.min.clone();
      box.getSize(size);

      // 4a) Scale để fit canvas (dùng max của y hoặc x)
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale  = 4 / maxDim; // bạn có thể tăng lên 5 hoặc 6 nếu muốn to hơn
      model.scale.setScalar(scale);

      // 4b) Center chỉ X/Z, và dời model lên để đáy chạm y=0
      //    center = midpoint, nhưng ta chỉ shift x,z:
      const center = box.getCenter(new THREE.Vector3());
      model.position.x -= center.x * scale;
      model.position.z -= center.z * scale;
      // Dời lên: min.y * scale cho đáy nằm y=0 rồi cộng một tí margin
      model.position.y -= min.y * scale;
      model.position.y -= 1; // nâng thêm 0.1 nếu bạn muốn model "nổi" nhẹ

      scene.add(model);

      // 5) Animation nếu có
      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach(clip => {
          const action = mixer.clipAction(clip);
          action.play();
          action.setLoop(THREE.LoopRepeat, Infinity);
        });
      }

      // Bắt đầu render loop
      animate();
    },
    undefined,
    err => {
      console.error('Error loading model:', err);
      heroImage.innerHTML = '<img src="/api/placeholder/600/400" alt="Cozy World Metaverse">';
    }
  );

//   // 6) Interaction (giữ nguyên của bạn)
//   let isDragging = false;
//   let prevMouse = { x: 0, y: 0 };

//   const onPointerDown = e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; };
//   const onPointerUp   = () => { isDragging = false; };
//   const onPointerMove = e => {
//     if (!isDragging || !model) return;
//     const dx = e.clientX - prevMouse.x;
//     const dy = e.clientY - prevMouse.y;
//     model.rotation.y += dx * 0.01;
//     model.rotation.x += dy * 0.01;
//     prevMouse = { x: e.clientX, y: e.clientY };
//   };

//   canvas.addEventListener('mousedown',  onPointerDown);
//   canvas.addEventListener('mousemove',  onPointerMove);
//   canvas.addEventListener('mouseup',    onPointerUp);
//   canvas.addEventListener('mouseleave', onPointerUp);

//   canvas.addEventListener('touchstart', e => {
//     isDragging = true;
//     prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
//     e.preventDefault();
//   });
//   canvas.addEventListener('touchmove', e => {
//     if (!isDragging || !model) return;
//     const dx = e.touches[0].clientX - prevMouse.x;
//     const dy = e.touches[0].clientY - prevMouse.y;
//     model.rotation.y += dx * 0.01;
//     model.rotation.x += dy * 0.01;
//     prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
//     e.preventDefault();
//   });
//   canvas.addEventListener('touchend', onPointerUp);

//   // 7) Resize
//   window.addEventListener('resize', () => {
//     camera.aspect = heroImage.clientWidth / heroImage.clientHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(heroImage.clientWidth, heroImage.clientHeight);
//   });

  // 8) Render loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
  }
}


function generateBubbles(count) {
    const container = document.querySelector('.bubbles-container');
    for (let i = 0; i < count; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';

        // Random vị trí theo % viewport
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.top = `${Math.random() * 100}%`;
        bubble.style.zoom = (Math.random() * 0.5 + 0.3).toFixed(2);
        // Random animation delay (để bay đều khắp)
        bubble.style.animationDelay = `${(Math.random() * -8).toFixed(2)}s`;

        // Tạo 5 span bên trong
        for (let j = 0; j < 5; j++) {
            bubble.appendChild(document.createElement('span'));
        }

        container.appendChild(bubble);
    }
}

function animateHomePage() {
    // Animation cho tiêu đề header
    gsap.to('header', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
    });

    // Animation cho các thẻ card
    gsap.to('.card', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'back.out(1.7)'
    });

    // Animation cho Hero section: title và image
    const tlHero = gsap.timeline();

    tlHero.to('.hero-content', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
    });

    tlHero.fromTo('.hero-title', {
        opacity: 0,
        y: 30
    }, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'back.out(1.7)'
    }, "<"); // Start with previous

    tlHero.call(initThree, null, '<0.2');
}


const cards = Array.from(document.querySelectorAll('.card'));
let order = [0, 1, 2];
const positions = ['left', 'center', 'right'];
const duration = 0.8;

function updateLayout() {
    cards.forEach((card, i) => {
        const pos = positions[order.indexOf(i)];
        card.className = 'card ' + pos;
    });
}

function shift() {
    order.push(order.shift());
    cards.forEach((card, i) => {
        const pos = positions[order.indexOf(i)];
        const props = { duration: duration, ease: 'power2.inOut' };
        if (pos === 'left') {
            gsap.to(card, { left: 0, top: 15, scale: 1, zIndex: 1, ...props });
        } else if (pos === 'center') {
            gsap.to(card, { left: 160, top: 0, scale: 1.2, zIndex: 2, ...props });
        } else if (pos === 'right') {
            gsap.to(card, { left: 320, top: 15, scale: 1, zIndex: 1, ...props });
        }
    });
}

// init layout
cards.forEach((card, i) => {
    const pos = positions[order.indexOf(i)];
    gsap.set(card, { left: pos === 'left' ? 0 : pos === 'center' ? 160 : 320, top: pos === 'center' ? 0 : 15, scale: pos === 'center' ? 1.2 : 1, zIndex: pos === 'center' ? 2 : 1 });
    card.classList.add(pos);
    card.addEventListener('click', shift);
});

setInterval(shift, 3000);