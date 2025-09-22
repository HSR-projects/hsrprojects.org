let scene, camera, renderer, laptop, mixer, action;
let container = document.getElementById('threedlid');
let scrollTimeout;
let lastScrollTop = 0;

// Initialize Three.js scene
function init() {
    // Hide the fallback image and proceed with 3D animation for desktops
    document.getElementById('noscriptmobile').style.display = 'none';

    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    container.appendChild(renderer.domElement);

    // Tone mapping and exposure
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    // Load the 3D model
    const loader = new THREE.GLTFLoader();
    loader.load('./img/3dlid.gltf', function (gltf) {
        laptop = gltf.scene;
        scene.add(laptop);

        // Apply texture filtering for all materials in the scene
        laptop.traverse(function (child) {
            if (child.isMesh && child.material.map) {
                // Set texture filtering for the diffuse map (color texture)
                //child.material.map.minFilter = THREE.NearestMipmapNearestFilter;
                //child.material.map.magFilter = THREE.NearestFilter;
                //child.material.map.minFilter = THREE.NearestFilter;
                child.material.map.needsUpdate = true;  // Apply the changes

            }
        })
        // Extract and set the camera from the GLB file
        if (gltf.cameras && gltf.cameras.length > 0) {
            camera = gltf.cameras[0];
        } else {
            // Fallback to a default camera if no camera is found in the GLB
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 5;
        }

        // Check if animations are available
        const animations = gltf.animations;
        if (animations && animations.length > 0) {
            mixer = new THREE.AnimationMixer(laptop);
            action = mixer.clipAction(animations[0]);  // Assume the first animation controls the lid
            action.play();  // Play the animation continuously

            // Make the animation loop for debugging
            action.setLoop(THREE.LoopRepeat);  // Allow it to loop for testing purposes
        } else {
            console.error('No animations found in the GLTF file.');
        }

        // Adjust aspect ratio and renderer size
        const box = new THREE.Box3().setFromObject(laptop);
        const size = box.getSize(new THREE.Vector3());
        setRendererSize();

        // Start the render loop
        animate();
        handleScroll(); //trigger on load for /#download
    });
}

// Set renderer size based on aspect ratio
function setRendererSize() {
    // nominal size of the scene is 900x354px. Oversample to avoid mipmap jaggies

    let containerWidth = 900;
    let containerHeight = 354;

    renderer.setSize(containerWidth * 4, containerHeight * 4, false);

    if (camera) {
        camera.aspect = containerWidth / containerHeight;
        camera.updateProjectionMatrix();
    }
}

// Modify the animate function
function animate() {
    renderer.render(scene, camera);
}

// Add new function to update animation progress
function updateAnimationProgress() {
    if (action) {
        const scrollProgress = getScrollProgress();
        action.time = action.getClip().duration * scrollProgress;
        mixer.update(0);
    }
    animate();
}

// Optimize the scroll event listener
function handleScroll() {
    if (!scrollTimeout) { //render some frames on scroll
        scrollTimeout = setTimeout(() => {
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (Math.abs(currentScrollTop - lastScrollTop) > 3) { // only update on 3px scroll delta
                requestAnimationFrame(updateAnimationProgress);
                lastScrollTop = currentScrollTop;
            }
            scrollTimeout = null;
        }, 8); // ~120fps
    }
}

// Update the getScrollProgress function
function getScrollProgress() {
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Start the animation when the element's bottom enters the viewport
    // and end it when the element's top leaves the viewport
    const start = windowHeight;
    const end = -rect.height;
    
    const current = rect.top;
    
    // Calculate the progress
    const progress = (start - current) / (start - end);
    
    return Math.min(Math.max(progress, 0), 1); // Ensure the value is between 0 and 1
}

// Initialize the scene and animation
// Utility function to detect mobile devices
function isMobileDevice() {
    return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
}

// Initialize only on non-mobile
if (!isMobileDevice()) {
    // Modify the event listeners
    window.addEventListener('resize', setRendererSize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    init();
}

