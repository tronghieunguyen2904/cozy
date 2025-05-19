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
  // Thêm một ambient light mạnh hơn để tránh các vùng quá tối
  scene.add(new THREE.AmbientLight(0xffffff, 1.0)); // Tăng cường độ ánh sáng xung quanh

  const camera = new THREE.PerspectiveCamera(
    45,
    heroImage.clientWidth / heroImage.clientHeight,
    0.1,
    1000
  );
  camera.position.set(4, 2, 2); 
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(heroImage.clientWidth, heroImage.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0); // transparent
  
  // Bật tính năng physically correct lighting để cải thiện hiệu ứng ánh sáng
  renderer.physicallyCorrectLights = true;
  // Bật shadows nếu cần (không bắt buộc nhưng giúp cải thiện chất lượng hình ảnh)
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Ánh sáng - Cấu hình lại hoàn toàn với màu sắc tươi sáng hơn
  // 1. Ánh sáng chính từ phía trước (tăng cường độ)
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
  keyLight.position.set(0, 2, 5); // Đặt phía trước model
  keyLight.castShadow = true;
  scene.add(keyLight);
  
  // 2. Ánh sáng từ phía sau để highlight các cạnh
  const backLight = new THREE.DirectionalLight(0xffffcc, 1.2); // Ánh sáng vàng nhạt để tăng độ ấm
  backLight.position.set(0, 3, -5);
  scene.add(backLight);
  
  // 3. Ánh sáng từ bên trái - ánh sáng xanh nhạt
  const leftLight = new THREE.DirectionalLight(0xccffff, 1.2);
  leftLight.position.set(-5, 2, 0);
  scene.add(leftLight);
  
  // 4. Ánh sáng từ bên phải - ánh sáng hồng nhạt
  const rightLight = new THREE.DirectionalLight(0xffccff, 1.2);
  rightLight.position.set(5, 2, 0);
  scene.add(rightLight);
  
  // 5. Thêm ánh sáng đặc biệt cho vòng trên đầu - màu hơi đỏ để làm nổi bật màu máu
  const haloLight = new THREE.SpotLight(0xff3333, 2.0, 15, Math.PI/4, 0.5);
  haloLight.position.set(0, 6, 0); // Đặt trên đỉnh đầu
  haloLight.target.position.set(0, 3, 0);
  scene.add(haloLight);
  scene.add(haloLight.target);
  
  // 6. Thêm một số point light xung quanh để tạo highlight cho vật liệu trong suốt
  const pointLight1 = new THREE.PointLight(0xffffff, 1.5, 10);
  pointLight1.position.set(0, 2, 0); // Đặt giữa model
  scene.add(pointLight1);
  
  // Ánh sáng điểm màu đỏ để làm nổi bật màu máu ở các góc
  const redLight1 = new THREE.PointLight(0xff0000, 2.0, 5);
  redLight1.position.set(2, 0, 2); // Vị trí tay phải
  scene.add(redLight1);
  
  const redLight2 = new THREE.PointLight(0xff0000, 2.0, 5);
  redLight2.position.set(-2, 0, 2); // Vị trí tay trái
  scene.add(redLight2);
  
  // Thêm ánh sáng xanh nhạt để làm nổi bật phần thân trong suốt
  const blueLight = new THREE.PointLight(0x00ccff, 1.5, 8);
  blueLight.position.set(0, 1, 0); // Đặt giữa thân
  scene.add(blueLight);

  // 4) Load model và xử lý bounding box
  const loader = new THREE.GLTFLoader();
  let model, mixer;

  loader.load(
    '/assets/models/angel.glb',
    gltf => {
      model = gltf.scene;
      
      // Tùy chỉnh materials để cải thiện hiển thị với ánh sáng mới
      model.traverse(function(node) {
        if (node.isMesh) {
          // Nếu là vật liệu trong suốt hoặc glass
          if (node.material && node.material.transparent) {
            node.material.roughness = 0.05;     // Giảm roughness để tăng độ bóng
            node.material.metalness = 1.0;     // Tăng metalness tối đa để thêm phản xạ
            node.material.envMapIntensity = 2.0; // Tăng cường độ phản xạ môi trường
            
            // Tăng độ sáng cho các vật liệu trong suốt
            if (node.material.color) {
              // Làm sáng lên các màu sẵn có
              node.material.color.r = Math.min(1, node.material.color.r * 1.2);
              node.material.color.g = Math.min(1, node.material.color.g * 1.2);
              node.material.color.b = Math.min(1, node.material.color.b * 1.2);
              node.material.emissive = new THREE.Color(0x222222); // Thêm phát sáng nhẹ
            }
          }
          
          // Đặc biệt cho các phần có màu máu (đỏ)
          if (node.material && node.material.name && 
             (node.material.name.includes('blood') || 
              node.material.name.includes('red') || 
              (node.material.color && node.material.color.r > 0.7 && node.material.color.g < 0.3))) {
            // Tăng cường màu đỏ và thêm phát sáng
            node.material.emissive = new THREE.Color(0x330000);
            node.material.emissiveIntensity = 0.5;
            if (node.material.color) {
              node.material.color.setRGB(1.0, 0.1, 0.1); // Màu đỏ tươi
            }
          }
          
            if (node.name && (node.name.includes('halo') || node.name.includes('ring') || node.position.y > 3)) {
                node.material.emissive = new THREE.Color(0x330000); // Phát sáng đỏ đậm
                node.material.emissiveIntensity = 1.2; // Tăng cường độ phát sáng
                if (node.material.color) {
                    node.material.color.setRGB(0.1, 0.0, 0.0); // Màu đỏ đậm hơn
                }
            }
          
          // Đảm bảo các mesh nhận shadows
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      // --- Tính bounding box ---
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const min  = box.min.clone();
      box.getSize(size);

      // 4a) Scale để fit canvas (dùng max của y hoặc x)
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale  = 3 / maxDim; // có thể tăng lên 5 hoặc 6 nếu muốn to hơn
      model.scale.setScalar(scale);

      // 4b) Center chỉ X/Z, và dời model lên để đáy chạm y=0
      //     center = midpoint, nhưng ta chỉ shift x,z:
      const center = box.getCenter(new THREE.Vector3());
      model.position.x -= center.x * scale;
      model.position.z -= center.z * scale;
      // Dời lên: min.y * scale cho đáy nằm y=0 rồi cộng một tí margin
      model.position.y -= min.y * scale;
      model.position.y -= 1; // nâng thêm nếu bạn muốn model "nổi" nhẹ
      model.rotation.y = 1.2;
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

      // Bắt đầu render loop với hiệu ứng xoay nhẹ
      animate();
    },
    undefined,
    err => {
      console.error('Error loading model:', err);
      heroImage.innerHTML = '<img src="/api/placeholder/600/400" alt="Cozy World Metaverse">';
    }
  );

  // Thêm hiệu ứng tự động xoay nhẹ nhàng
  let autoRotate = true;
  const autoRotateSpeed = 0.005;

  // 8) Render loop cải tiến
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    
    // Cập nhật animation nếu có
    if (mixer) mixer.update(delta);
    
    // Tự động xoay model
    if (model && autoRotate) {
      model.rotation.y += autoRotateSpeed;
    }
    
    // Cập nhật vị trí đèn để theo camera
    keyLight.position.copy(camera.position);
    
    renderer.render(scene, camera);
  }
  
  // Xử lý resize
  window.addEventListener('resize', () => {
    camera.aspect = heroImage.clientWidth / heroImage.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(heroImage.clientWidth, heroImage.clientHeight);
  });
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