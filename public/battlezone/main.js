// Main Game Engine for Battlezone Magura
// Initializes Three.js, lighting, realistic atmosphere, HUD mini-map & optimized loop

let scene, camera, renderer, fpsController, worldData, weaponSystem, enemyManager;
let miniMapCanvas, miniMapCtx;
let lastTime = performance.now();
let frameCount = 0, lastFpsUpdate = 0, fpsElem;
let dirLight, hemiLight;
let lastMapUpdate = 0;
let lastCompassDeg = -1;
let isDevicePortrait = false;
let currentMap = 'magura_town';
let mapGroup = null;

// Time of Day Presets
const timePresets = {
  afternoon: {
    sky: 0x8faec7,
    fog: 0xd6ccba,
    fogDensity: 0.007,
    sunColor: 0xfff3db,
    sunIntensity: 1.3,
    sunPos: [50, 65, -40],
    hemiSky: 0xa4c2db,
    hemiGround: 0x5a5142,
    hemiIntensity: 0.65,
    label: 'বিকাল (Golden Sun)'
  },
  midday: {
    sky: 0x6ca0dc,
    fog: 0xcfd6dc,
    fogDensity: 0.0055,
    sunColor: 0xffffff,
    sunIntensity: 1.5,
    sunPos: [15, 80, 10],
    hemiSky: 0xc8ddf2,
    hemiGround: 0x635e55,
    hemiIntensity: 0.75,
    label: 'দুপুর (Bright Day)'
  },
  dusk: {
    sky: 0x3d415b,
    fog: 0x4a434c,
    fogDensity: 0.0085,
    sunColor: 0xf28e2b,
    sunIntensity: 1.0,
    sunPos: [-70, 25, 40],
    hemiSky: 0x5c4d61,
    hemiGround: 0x221f24,
    hemiIntensity: 0.45,
    label: 'সন্ধ্যা (Dusk / Sunset)'
  }
};
let currentPreset = 'afternoon';

function switchMap(mapId) {
  if (!scene) return;
  const targetMap = mapId === 'abalpur_village' ? 'abalpur_village' : 'magura_town';

  if (!mapGroup) {
    mapGroup = new THREE.Group();
    mapGroup.name = "ActiveMapContainer";
    scene.add(mapGroup);
  } else {
    // Clear previous map objects from mapGroup
    while (mapGroup.children.length > 0) {
      const child = mapGroup.children[0];
      mapGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m && m.dispose && m.dispose());
        } else if (child.material.dispose) {
          child.material.dispose();
        }
      }
    }
  }

  currentMap = targetMap;

  // 5. Build Selected 3D Environment (Abalpur Village or Magura Town)
  if (currentMap === 'abalpur_village' && typeof AbalpurVillageBuilder !== 'undefined') {
    worldData = AbalpurVillageBuilder.buildWorld(mapGroup);

    // Update location badge for Abalpur Village
    const locSub = document.querySelector('.location-badge .location-sub');
    if (locSub) locSub.textContent = 'আবালপুর গ্রাম • মাগুরা (Abalpur Village)';
    const locTitle = document.querySelector('.location-badge .location-title');
    if (locTitle) locTitle.innerHTML = '<span>🌾</span> BATTLEZONE ABALPUR';
  } else {
    worldData = WorldBuilder.buildWorld(mapGroup);

    // Update location badge for Magura Town
    const locSub = document.querySelector('.location-badge .location-sub');
    if (locSub) locSub.textContent = 'মাগুরা টাউন • সেক্টর ১ (সদর মোড়)';
    const locTitle = document.querySelector('.location-badge .location-title');
    if (locTitle) locTitle.innerHTML = '<span>🎯</span> BATTLEZONE MAGURA';
  }

  // Update Colliders on FPS Controller & Spawn
  if (fpsController) {
    fpsController.colliders = worldData.colliders || [];
    if (worldData && worldData.playerSpawn) {
      fpsController.position.set(worldData.playerSpawn.x, worldData.playerSpawn.y, worldData.playerSpawn.z);
      if (worldData.playerSpawn.yaw !== undefined) {
        fpsController.yaw = worldData.playerSpawn.yaw;
        fpsController.targetYaw = worldData.playerSpawn.yaw;
      }
    } else {
      fpsController.position.set(0, 1.8, 0);
      fpsController.yaw = Math.PI;
      fpsController.targetYaw = Math.PI;
    }
    if (fpsController.velocity) fpsController.velocity.set(0, 0, 0);
  }

  // Update Enemy Bots with new map waypoints & colliders
  if (enemyManager) {
    enemyManager.resetEnemies(worldData.enemyConfigs, worldData.colliders);
  }

  lastMapUpdate = 0;
}

function init() {
  const container = document.getElementById('webgl-container');
  fpsElem = document.getElementById('fps-display');
  miniMapCanvas = document.getElementById('minimap-canvas');
  if (miniMapCanvas) miniMapCtx = miniMapCanvas.getContext('2d');

  // 1. Check & Enforce Landscape Viewport
  checkOrientation();
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('orientationchange', () => {
    setTimeout(onWindowResize, 150);
  });

  // 2. Three.js Scene & Camera
  scene = new THREE.Scene();
  scene.background = new THREE.Color(timePresets[currentPreset].sky);
  scene.fog = new THREE.FogExp2(timePresets[currentPreset].fog, timePresets[currentPreset].fogDensity);

  const aspect = window.innerWidth / (window.innerHeight || 1);
  camera = new THREE.PerspectiveCamera(
    65, // Natural FPS field of view
    aspect,
    0.2,
    300
  );

  // 3. WebGL Renderer with Mobile Optimizations & Robust Fallbacks
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'default',
      precision: 'mediump',
      alpha: false,
      depth: true,
      stencil: false,
      failIfMajorPerformanceCaveat: false
    });
  } catch (err) {
    console.warn("Retrying WebGLRenderer with basic configuration:", err);
    renderer = new THREE.WebGLRenderer({
      antialias: false,
      failIfMajorPerformanceCaveat: false
    });
  }
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    console.warn('WebGL context lost - preventing default');
  }, false);

  renderer.domElement.addEventListener('webglcontextrestored', () => {
    console.info('WebGL context restored');
  }, false);

  // Use mobile-friendly pixel ratio (prevents 3x / 4x supersampling on high-DPI phones)
  const mobileDPR = Math.min(window.devicePixelRatio || 1, 1.25);
  renderer.setPixelRatio(mobileDPR);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  container.appendChild(renderer.domElement);

  // 4. Realistic Atmosphere & Lighting
  setupLighting();
  createSkyDome();

  // Active Map Container Group
  mapGroup = new THREE.Group();
  mapGroup.name = "ActiveMapContainer";
  scene.add(mapGroup);

  // Read selected map from query parameter or default to magura_town
  const urlParams = new URLSearchParams(window.location.search);
  const initialMap = urlParams.get('map') || 'magura_town';

  // 5. Build Selected 3D Environment (Abalpur Village or Magura Town)
  switchMap(initialMap);

  // 6. Initialize First-Person FPS Controller
  fpsController = new FPSController(camera, renderer.domElement, worldData.colliders);

  // Set custom player spawn if provided by world builder
  if (worldData && worldData.playerSpawn) {
    fpsController.position.set(worldData.playerSpawn.x, worldData.playerSpawn.y, worldData.playerSpawn.z);
    if (worldData.playerSpawn.yaw !== undefined) {
      fpsController.yaw = worldData.playerSpawn.yaw;
      fpsController.targetYaw = worldData.playerSpawn.yaw;
    }
  }

  // 7. Initialize First-Person Weapon & Shooting System
  weaponSystem = new WeaponSystem(camera, scene, () => fpsController ? fpsController.audioCtx : null);

  // 8. Initialize 7 Enemy AI Bots with Patrol & Combat
  enemyManager = new EnemyManager(
    scene,
    camera,
    worldData.colliders,
    () => fpsController ? fpsController.audioCtx : null,
    worldData.enemyConfigs
  );

  // Connect player shooting to enemy combat damage
  weaponSystem.onShoot = () => {
    if (enemyManager) {
      enemyManager.handlePlayerShot(camera);
    }
  };

  // 9. Setup HUD Interactions & Listeners
  setupHUD();

  // Listen for map change & activation messages from parent app
  window.addEventListener('message', (e) => {
    if (e.data) {
      if (e.data.type === 'BATTLEZONE_LOAD_MAP' || e.data.type === 'BATTLEZONE_ACTIVATE') {
        if (e.data.map && e.data.map !== currentMap) {
          switchMap(e.data.map);
        }
        window.dispatchEvent(new Event('resize'));
      }
    }
  });

  // 10. Start Animation Loop
  requestAnimationFrame(animate);
}

// Check orientation and show/hide landscape prompt
function checkOrientation() {
  const isPortrait = window.innerHeight > window.innerWidth;
  isDevicePortrait = isPortrait;

  const warningElem = document.getElementById('portrait-warning');
  if (warningElem) {
    warningElem.style.display = isPortrait ? 'flex' : 'none';
  }

  document.body.classList.toggle('is-portrait', isPortrait);
  document.body.classList.toggle('is-landscape', !isPortrait);
}

function setupLighting() {
  const p = timePresets[currentPreset];

  // Hemispheric Ambient Light
  hemiLight = new THREE.HemisphereLight(p.hemiSky, p.hemiGround, p.hemiIntensity);
  scene.add(hemiLight);

  // Directional Sunlight with Shadows
  dirLight = new THREE.DirectionalLight(p.sunColor, p.sunIntensity);
  dirLight.position.set(p.sunPos[0], p.sunPos[1], p.sunPos[2]);
  dirLight.castShadow = true;

  // Optimized Shadow map resolution for 30-60 FPS mobile target
  dirLight.shadow.mapSize.width = 512;
  dirLight.shadow.mapSize.height = 512;
  dirLight.shadow.camera.near = 15;
  dirLight.shadow.camera.far = 160;
  const d = 42;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  dirLight.shadow.bias = -0.0008;
  scene.add(dirLight);
}

function createSkyDome() {
  const skyGeo = new THREE.SphereGeometry(250, 16, 12);
  const skyMat = new THREE.MeshBasicMaterial({
    color: 0x8faec7,
    side: THREE.BackSide
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyMesh);
}

function setTimeOfDay(presetKey) {
  if (!timePresets[presetKey]) return;
  currentPreset = presetKey;
  const p = timePresets[presetKey];

  scene.background.setHex(p.sky);
  scene.fog.color.setHex(p.fog);
  scene.fog.density = p.fogDensity;

  dirLight.color.setHex(p.sunColor);
  dirLight.intensity = p.sunIntensity;
  dirLight.position.set(p.sunPos[0], p.sunPos[1], p.sunPos[2]);

  hemiLight.color.setHex(p.hemiSky);
  hemiLight.groundColor.setHex(p.hemiGround);
  hemiLight.intensity = p.hemiIntensity;

  const btnLabel = document.getElementById('time-btn-label');
  if (btnLabel) btnLabel.innerText = p.label;
}

function setupHUD() {
  // Time of Day Toggle
  const timeBtn = document.getElementById('btn-time');
  if (timeBtn) {
    timeBtn.addEventListener('click', () => {
      const keys = ['afternoon', 'midday', 'dusk'];
      const nextIdx = (keys.indexOf(currentPreset) + 1) % keys.length;
      setTimeOfDay(keys[nextIdx]);
    });
  }

  // Back to Lobby button if present
  const backToLobbyBtn = document.getElementById('btn-back-lobby');
  if (backToLobbyBtn) {
    backToLobbyBtn.addEventListener('click', () => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'BATTLEZONE_EXIT_TO_LOBBY' }, '*');
      }
    });
  }
}

// Throttled Mini-Map drawing
function updateMiniMap() {
  if (!miniMapCtx || !fpsController) return;
  const w = miniMapCanvas.width;
  const h = miniMapCanvas.height;

  miniMapCtx.clearRect(0, 0, w, h);

  // Background map radar circle
  miniMapCtx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  miniMapCtx.beginPath();
  miniMapCtx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
  miniMapCtx.fill();

  miniMapCtx.save();
  miniMapCtx.beginPath();
  miniMapCtx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2);
  miniMapCtx.clip();

  const scale = 0.85;
  const centerX = w / 2;
  const centerY = h / 2;

  // Translate map relative to player position
  miniMapCtx.translate(centerX, centerY);
  // Heading-up rotation
  miniMapCtx.rotate(fpsController.yaw - Math.PI);
  miniMapCtx.translate(-fpsController.position.x * scale, -fpsController.position.z * scale);

  // Canal Water
  miniMapCtx.fillStyle = '#1e3a8a';
  miniMapCtx.fillRect(-100 * scale, 73 * scale, 200 * scale, 24 * scale);

  // Main Highway Road
  miniMapCtx.fillStyle = '#334155';
  miniMapCtx.fillRect(-8 * scale, -130 * scale, 16 * scale, 260 * scale);

  // Side streets
  miniMapCtx.fillStyle = '#78350f';
  miniMapCtx.fillRect(8 * scale, 20 * scale, 40 * scale, 10 * scale);
  miniMapCtx.fillRect(-48 * scale, -40 * scale, 40 * scale, 9 * scale);

  // Bridge deck
  miniMapCtx.fillStyle = '#64748b';
  miniMapCtx.fillRect(-9 * scale, 73 * scale, 18 * scale, 24 * scale);

  // Buildings blocks
  miniMapCtx.fillStyle = 'rgba(100, 116, 139, 0.85)';
  const bList = [
    [-28, -88, 14, 16], [-27.5, -65.5, 13, 15], [-28.5, -21, 15, 18],
    [-27.5, 0, 13, 16], [-28, 20, 14, 16], [-27.5, 40.5, 13, 15],
    [14, -90, 14, 16], [14, -68, 14, 16], [14.5, -45.5, 13, 15],
    [13.5, -25, 15, 18], [14, 37.5, 14, 17]
  ];
  bList.forEach(b => {
    miniMapCtx.fillRect(b[0] * scale, b[1] * scale, b[2] * scale, b[3] * scale);
  });

  // Enemy Blips on Mini-Map (Tactical Red Dots)
  if (enemyManager && enemyManager.enemies) {
    miniMapCtx.fillStyle = '#ef4444';
    for (let i = 0; i < enemyManager.enemies.length; i++) {
      const e = enemyManager.enemies[i];
      if (e.isAlive) {
        miniMapCtx.beginPath();
        miniMapCtx.arc(e.group.position.x * scale, e.group.position.z * scale, 3, 0, Math.PI * 2);
        miniMapCtx.fill();
      }
    }
  }

  miniMapCtx.restore();

  // Player Indicator
  miniMapCtx.fillStyle = '#22c55e';
  miniMapCtx.beginPath();
  miniMapCtx.arc(centerX, centerY, 4, 0, Math.PI * 2);
  miniMapCtx.fill();

  // Player Vision Cone
  miniMapCtx.fillStyle = 'rgba(34, 197, 94, 0.25)';
  miniMapCtx.beginPath();
  miniMapCtx.moveTo(centerX, centerY);
  miniMapCtx.arc(centerX, centerY, 20, -Math.PI / 2 - 0.4, -Math.PI / 2 + 0.4);
  miniMapCtx.closePath();
  miniMapCtx.fill();

  // Radar ring border
  miniMapCtx.strokeStyle = '#22c55e';
  miniMapCtx.lineWidth = 1.5;
  miniMapCtx.beginPath();
  miniMapCtx.arc(centerX, centerY, w / 2 - 2, 0, Math.PI * 2);
  miniMapCtx.stroke();
}

function updateCompass() {
  if (!fpsController) return;
  const compassDeg = document.getElementById('compass-degrees');
  const compassTape = document.getElementById('compass-tape');
  if (!compassDeg || !compassTape) return;

  let deg = Math.round((-fpsController.yaw * (180 / Math.PI)) % 360);
  if (deg < 0) deg += 360;

  if (deg !== lastCompassDeg) {
    lastCompassDeg = deg;
    compassDeg.innerText = `${deg}°`;
    const offset = -(deg * 2.8);
    compassTape.style.transform = `translateX(${offset}px)`;
  }
}

function onWindowResize() {
  checkOrientation();
  if (!camera || !renderer) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / (height || 1);
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

function animate(time) {
  requestAnimationFrame(animate);

  const delta = (time - lastTime) / 1000;
  lastTime = time;

  // FPS Counter calculation
  frameCount++;
  if (time - lastFpsUpdate > 500) {
    const fps = Math.round((frameCount * 1000) / (time - lastFpsUpdate));
    if (fpsElem) fpsElem.innerText = `${fps} FPS`;
    frameCount = 0;
    lastFpsUpdate = time;
  }

  // Update Controls & Physics
  if (fpsController) {
    fpsController.update(delta);
    updateCompass();

    // Throttle minimap update to ~15 FPS (every 66ms)
    if (time - lastMapUpdate >= 66) {
      if (currentMap === 'abalpur_village' && typeof AbalpurVillageBuilder !== 'undefined' && AbalpurVillageBuilder.drawMiniMap) {
        AbalpurVillageBuilder.drawMiniMap(miniMapCtx, miniMapCanvas.width, miniMapCanvas.height, fpsController);
      } else {
        updateMiniMap();
      }
      lastMapUpdate = time;
    }

    // Update First-Person Weapon Sway, Idle Breathing, Recoil & Reload
    if (weaponSystem) {
      const moveLen = fpsController.moveVector ? fpsController.moveVector.length() : 0;
      weaponSystem.update(delta, moveLen, fpsController.isSprinting);
    }

    // Update 7 Enemy AI Bots: Patrol, Turn, Chase, Aim & Shoot
    if (enemyManager) {
      enemyManager.update(delta, fpsController.position, fpsController);
    }
  }

  // Animate Water ripples gently
  if (worldData && worldData.waterMesh) {
    worldData.waterMesh.material.map.offset.x = (time * 0.0001) % 1;
  }

  // Render Scene
  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init);
