// Main Game Engine for Battlezone Magura
// Initializes Three.js, lighting, realistic atmosphere, HUD mini-map & optimized loop

let scene, camera, renderer, fpsController, worldData, weaponSystem, enemyManager, medkitManager, remotePlayerManager;

// Tactical 3D Medkit Pickups distributed across Magura Town & Abalpur Village
class MedkitPickupManager {
  constructor(scene) {
    this.scene = scene;
    this.pickups = [];
    this.group = new THREE.Group();
    this.group.name = "MedkitPickupsGroup";
    this.scene.add(this.group);
  }

  clear() {
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m && m.dispose && m.dispose());
        else if (child.material.dispose) child.material.dispose();
      }
      this.group.remove(child);
    }
    this.pickups = [];
  }

  spawnPickups(mapId) {
    this.clear();
    const isRiverPort = (mapId === 'magura_river_port' || mapId === 'magura-river-port');
    const isAbalpur = (mapId === 'abalpur_village');
    const positions = isRiverPort ? [
      { x: -35, y: 0.25, z: -15, label: "মধুমতি জুট গোডাউন" },
      { x: 25, y: 0.25, z: 20, label: "কালভার্ট ব্রিজ অ্যাপ্রোচ" },
      { x: -10, y: 0.25, z: 65, label: "রিভার পোর্ট ঘাট" },
      { x: 45, y: 0.25, z: -55, label: "হেভি ওয়ার্কশপ ইয়ার্ড" },
      { x: 0, y: 0.25, z: -10, label: "সেন্ট্রাল কন্টেইনার টার্মিনাল" }
    ] : isAbalpur ? [
      { x: -26, y: 0.25, z: 32, label: "কমিউনিটি ক্লিনিক" },
      { x: 8, y: 0.25, z: -10, label: "আবালপুর চৌরাস্তা" },
      { x: -44, y: 0.25, z: 12, label: "পুকুরপাড় ঘাট" },
      { x: 0, y: 0.25, z: 24, label: "কালভার্ট ব্রিজ" },
      { x: 14, y: 0.25, z: -94, label: "মসজিদ প্রাঙ্গণ" }
    ] : [
      { x: -70, y: 0.25, z: -57, label: "মাগুরা সদর হাসপাতাল" },
      { x: 0, y: 0.25, z: -15, label: "সদর মোড় চত্বর" },
      { x: -50, y: 0.25, z: 12, label: "বড় বাজার স্কয়ার" },
      { x: 70, y: 0.25, z: -31, label: "মডেল স্কুল ও কলেজ" },
      { x: 5, y: 0.25, z: 68, label: "টাউন স্কয়ার মুক্তমঞ্চ" }
    ];

    positions.forEach((pos, idx) => {
      const medkitGroup = new THREE.Group();
      medkitGroup.position.set(pos.x, pos.y + 0.45, pos.z);

      // White Tactical First-Aid Case
      const caseGeo = new THREE.BoxGeometry(0.52, 0.34, 0.42);
      const caseMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
      const caseMesh = new THREE.Mesh(caseGeo, caseMat);
      medkitGroup.add(caseMesh);

      // Green Cross Symbol (Horizontal bar + Vertical bar)
      const crossMat = new THREE.MeshBasicMaterial({ color: 0x16a34a });
      const hBarGeo = new THREE.BoxGeometry(0.32, 0.09, 0.43);
      const hBar = new THREE.Mesh(hBarGeo, crossMat);
      medkitGroup.add(hBar);

      const vBarGeo = new THREE.BoxGeometry(0.09, 0.26, 0.43);
      const vBar = new THREE.Mesh(vBarGeo, crossMat);
      medkitGroup.add(vBar);

      // Gentle glowing beacon ring at base
      const ringGeo = new THREE.RingGeometry(0.32, 0.52, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -0.38;
      medkitGroup.add(ring);

      this.group.add(medkitGroup);

      this.pickups.push({
        id: idx + 1,
        pos: pos,
        group: medkitGroup,
        baseY: pos.y + 0.45,
        isAvailable: true,
        respawnTimer: 0
      });
    });
  }

  update(delta, playerPos, controller, time) {
    if (!playerPos) return;

    for (let i = 0; i < this.pickups.length; i++) {
      const p = this.pickups[i];
      if (!p.isAvailable) {
        p.respawnTimer -= delta;
        if (p.respawnTimer <= 0) {
          p.isAvailable = true;
          p.group.visible = true;
        }
        continue;
      }

      // Gentle floating hover & rotation
      p.group.rotation.y += delta * 1.6;
      p.group.position.y = p.baseY + Math.sin(time * 0.003 + i) * 0.08;

      // Distance check to player
      const dx = playerPos.x - p.pos.x;
      const dz = playerPos.z - p.pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 1.7) {
        // Collect medkit!
        if (controller) {
          controller.addMedkit(1);
        }
        p.isAvailable = false;
        p.group.visible = false;
        p.respawnTimer = 40; // respawn after 40 seconds
      }
    }
  }
}
let miniMapCanvas, miniMapCtx;
let lastTime = performance.now();
let frameCount = 0, lastFpsUpdate = 0, fpsElem;
let dirLight, hemiLight, ambientLight;
let lastMapUpdate = 0;
let lastCompassDeg = -1;
let isDevicePortrait = false;
let currentMap = 'abalpur_village';
let mapGroup = null;

// Time of Day Presets — Optimized for natural daytime atmosphere, clear silhouettes & readable combat spaces
const timePresets = {
  afternoon: {
    sky: 0x7aa5cb,
    fog: 0xc8dcee,
    fogDensity: 0.0022,
    sunColor: 0xfff7e8,
    sunIntensity: 1.35,
    sunPos: [65, 95, -50],
    hemiSky: 0xb5d8f6,
    hemiGround: 0x767064,
    hemiIntensity: 0.82,
    ambientIntensity: 0.32,
    label: 'বিকাল (Daylight / Sun)'
  },
  midday: {
    sky: 0x6ca4df,
    fog: 0xd0e2f2,
    fogDensity: 0.0018,
    sunColor: 0xffffff,
    sunIntensity: 1.45,
    sunPos: [25, 100, 20],
    hemiSky: 0xd2e5f8,
    hemiGround: 0x7e786e,
    hemiIntensity: 0.88,
    ambientIntensity: 0.36,
    label: 'দুপুর (Bright Clear Day)'
  },
  dusk: {
    sky: 0x484b68,
    fog: 0x58515c,
    fogDensity: 0.0035,
    sunColor: 0xf59e42,
    sunIntensity: 1.15,
    sunPos: [-70, 35, 45],
    hemiSky: 0x73637a,
    hemiGround: 0x3d383e,
    hemiIntensity: 0.62,
    ambientIntensity: 0.25,
    label: 'সন্ধ্যা (Dusk / Sunset)'
  }
};
let currentPreset = 'afternoon';

// Recursive disposal helper to prevent WebGL memory leaks when switching maps
function disposeHierarchy(root) {
  if (!root) return;
  root.traverse((node) => {
    if (node.geometry) {
      node.geometry.dispose();
    }
    if (node.material) {
      if (Array.isArray(node.material)) {
        for (let i = 0; i < node.material.length; i++) {
          const m = node.material[i];
          if (m) {
            if (m.map && m.map.dispose) m.map.dispose();
            if (m.dispose) m.dispose();
          }
        }
      } else {
        if (node.material.map && node.material.map.dispose) node.material.map.dispose();
        if (node.material.dispose) node.material.dispose();
      }
    }
  });
  while (root.children.length > 0) {
    const child = root.children[0];
    root.remove(child);
  }
}

function switchMap(mapId) {
  if (!scene) return;
  const isRiverPort = (mapId === 'magura_river_port' || mapId === 'magura-river-port');
  const isAbalpur = (mapId === 'abalpur_village');
  const targetMap = isRiverPort ? 'magura_river_port' : (isAbalpur ? 'abalpur_village' : 'magura_town');

  if (!mapGroup) {
    mapGroup = new THREE.Group();
    mapGroup.name = "ActiveMapContainer";
    scene.add(mapGroup);
  } else {
    // Thoroughly dispose previous map geometries, materials and textures
    disposeHierarchy(mapGroup);
  }

  currentMap = targetMap;

  // 5. Build Selected 3D Environment (Magura River Port, Abalpur Village or Magura Town)
  if ((currentMap === 'magura_river_port' || currentMap === 'magura-river-port') && typeof MaguraRiverPortBuilder !== 'undefined') {
    worldData = MaguraRiverPortBuilder.buildWorld(mapGroup);

    // Update location badge for Magura River Port
    const locSub = document.querySelector('.location-badge .location-sub');
    if (locSub) locSub.textContent = 'মাগুরা রিভার পোর্ট ও ইন্ডাস্ট্রিয়াল জোন';
    const locTitle = document.querySelector('.location-badge .location-title');
    if (locTitle) locTitle.innerHTML = '<span>⚓</span> MAGURA RIVER PORT';
  } else if (currentMap === 'abalpur_village' && typeof AbalpurVillageBuilder !== 'undefined') {
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
    fpsController.reset(worldData.playerSpawn);
  }

  // Reset Weapon System ammo and pools
  if (weaponSystem) {
    weaponSystem.reset();
  }

  // Update Enemy Bots with new map waypoints & colliders
  if (enemyManager) {
    enemyManager.resetEnemies(worldData.enemyConfigs, worldData.colliders);
  }

  // Spawn collectible 3D Medkits across the active map
  if (medkitManager) {
    medkitManager.spawnPickups(currentMap);
  }

  // Clear any existing remote player models
  if (remotePlayerManager) {
    remotePlayerManager.clear();
  }

  // Ensure victory overlay is dismissed
  const overlay = document.getElementById('victory-overlay');
  if (overlay && overlay.parentNode) {
    overlay.parentNode.removeChild(overlay);
  }

  lastMapUpdate = 0;
}

// Full Match Start / Restart lifecycle for all maps
function startMatch(mapId) {
  const isRiverPort = (mapId === 'magura_river_port' || mapId === 'magura-river-port');
  const isAbalpur = (mapId === 'abalpur_village');
  const targetMap = mapId ? (isRiverPort ? 'magura_river_port' : (isAbalpur ? 'abalpur_village' : 'magura_town')) : currentMap;

  if (targetMap !== currentMap || !worldData) {
    switchMap(targetMap);
  } else {
    // If same map, ensure fresh match state for player, weapon & enemies
    if (fpsController && worldData) {
      fpsController.colliders = worldData.colliders || [];
      fpsController.reset(worldData.playerSpawn);
    }
    if (weaponSystem) {
      weaponSystem.reset();
    }
    if (enemyManager && worldData) {
      enemyManager.resetEnemies(worldData.enemyConfigs, worldData.colliders);
    }
  }

  const overlay = document.getElementById('victory-overlay');
  if (overlay && overlay.parentNode) {
    overlay.parentNode.removeChild(overlay);
  }

  if (window.battlezoneHUD) {
    window.battlezoneHUD.setHUDState('GROUND_COMBAT');
    window.battlezoneHUD.matchStartTime = Date.now();
    if (fpsController) {
      window.battlezoneHUD.updateHP(fpsController.hp, fpsController.maxHp);
      window.battlezoneHUD.updateStamina(fpsController.stamina, fpsController.maxStamina);
    }
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
  renderer.toneMappingExposure = 1.16;

  container.appendChild(renderer.domElement);

  // 4. Realistic Atmosphere & Lighting
  setupLighting();
  createSkyDome();

  // Active Map Container Group
  mapGroup = new THREE.Group();
  mapGroup.name = "ActiveMapContainer";
  scene.add(mapGroup);

  // Initialize Collectible Medkit Manager
  medkitManager = new MedkitPickupManager(scene);

  // Read selected map from query parameter or default to abalpur_village
  const urlParams = new URLSearchParams(window.location.search);
  const initialMap = urlParams.get('map') || 'abalpur_village';

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
  weaponSystem = new WeaponSystem(
    camera,
    scene,
    () => fpsController ? fpsController.audioCtx : null,
    () => fpsController,
    () => worldData ? worldData.colliders : []
  );

  // 8. Initialize 7 Enemy AI Bots with Patrol & Combat
  enemyManager = new EnemyManager(
    scene,
    camera,
    worldData.colliders,
    () => fpsController ? fpsController.audioCtx : null,
    worldData.enemyConfigs
  );

  // Connect player shooting to enemy combat & multiplayer authoritative damage (Step 4)
  weaponSystem.onShoot = () => {
    const isMultiplayer = window.battlezoneNetwork && window.battlezoneNetwork.inMatch;

    if (isMultiplayer && remotePlayerManager) {
      const raycaster = new THREE.Raycaster();
      camera.updateMatrixWorld(true);
      raycaster.setFromCamera({ x: 0, y: 0 }, camera);

      const hitMeshes = remotePlayerManager.getRaycastMeshes();
      let hitTargetPlayerId = null;
      let isHeadshot = false;
      let hitPt = null;

      if (hitMeshes.length > 0) {
        const intersects = raycaster.intersectObjects(hitMeshes, false);
        if (intersects.length > 0) {
          const hit = intersects[0];
          const udata = hit.object.userData;
          if (udata && udata.remotePlayer && udata.playerId !== window.battlezoneNetwork.playerId) {
            hitTargetPlayerId = udata.playerId;
            isHeadshot = Boolean(udata.isHead);
            hitPt = hit.point;

            if (enemyManager) {
              enemyManager.showHitMarker(isHeadshot);
            }
          }
        }
      }

      // Send authoritative shoot request to server
      window.battlezoneNetwork.shoot(
        hitTargetPlayerId,
        isHeadshot,
        raycaster.ray.origin,
        raycaster.ray.direction,
        hitPt
      );

      if (hitTargetPlayerId) {
        return {
          type: 'multiplayer_player',
          targetPlayerId: hitTargetPlayerId,
          isHead: isHeadshot,
          point: hitPt
        };
      }
    }

    if (enemyManager) {
      return enemyManager.handlePlayerShot(camera);
    }
    return null;
  };

  // 9. Initialize Remote Player Manager for Multiplayer (Steps 3 - 5)
  if (typeof RemotePlayerManager !== 'undefined') {
    remotePlayerManager = new RemotePlayerManager(scene);
    if (window.battlezoneNetwork) {
      window.battlezoneNetwork.attachRemoteManager(remotePlayerManager);

      // STEP 4 & 5: Listen to server-authoritative combat events
      window.battlezoneNetwork.on('playerHit', (msg) => {
        if (!msg) return;
        if (msg.targetId === window.battlezoneNetwork.playerId && fpsController) {
          fpsController.hp = msg.targetHealth;
          fpsController.updateHealthHUD();
          fpsController.playHurtSound();
          if (fpsController.damageOverlay) {
            fpsController.damageOverlay.classList.add('flash');
            setTimeout(() => {
              if (fpsController && fpsController.damageOverlay) {
                fpsController.damageOverlay.classList.remove('flash');
              }
            }, 180);
          }
        }
      });

      window.battlezoneNetwork.on('playerDied', (msg) => {
        if (!msg) return;
        if (fpsController) {
          fpsController.showCombatToast(`☠ ${msg.killerName} ELIMINATED ${msg.victimName}`, true);
        }
        if (msg.playerId === window.battlezoneNetwork.playerId && fpsController) {
          fpsController.isDead = true;
          fpsController.hp = 0;
          fpsController.updateHealthHUD();
          fpsController.showCombatToast(`💀 KILLED BY ${msg.killerName} • RESPAWNING IN 3s...`, true);
        }
      });

      window.battlezoneNetwork.on('playerRespawned', (msg) => {
        if (!msg) return;
        if (msg.playerId === window.battlezoneNetwork.playerId && fpsController) {
          fpsController.isDead = false;
          fpsController.hp = msg.health || 100;
          if (msg.spawnPosition) {
            fpsController.position.set(msg.spawnPosition.x, msg.spawnPosition.y, msg.spawnPosition.z);
          }
          if (msg.spawnRotation && msg.spawnRotation.yaw !== undefined) {
            fpsController.yaw = msg.spawnRotation.yaw;
            fpsController.targetYaw = msg.spawnRotation.yaw;
          }
          fpsController.updateHealthHUD();
          fpsController.showCombatToast(`🛡 RESPAWNED • SPAWN PROTECTION ACTIVE (${msg.invulnerableDuration || 2.5}s)`);
        }
      });
    }
  }

  // 10. Setup HUD Interactions & Listeners
  setupHUD();

  let lastMatchSessionId = null;

  // Listen for map change & activation messages from parent app
  window.addEventListener('message', (e) => {
    if (e.data) {
      if (e.data.type === 'BATTLEZONE_LOAD_MAP') {
        if (e.data.map && e.data.map !== currentMap) {
          switchMap(e.data.map);
        }
        window.dispatchEvent(new Event('resize'));
      } else if (e.data.type === 'BATTLEZONE_ACTIVATE') {
        const targetMap = e.data.map || currentMap;
        const sessionId = e.data.matchId;

        // In single player activation, ensure multiplayer match flag is off
        if (window.battlezoneNetwork) {
          window.battlezoneNetwork.inMatch = false;
        }
        if (remotePlayerManager) {
          remotePlayerManager.clear();
        }

        // If match session ID changed or map changed or victory was completed
        if (sessionId !== lastMatchSessionId || targetMap !== currentMap || (enemyManager && enemyManager.hasWon)) {
          lastMatchSessionId = sessionId;
          startMatch(targetMap);
        }

        // Mission Mode activation
        if (e.data.mode === 'mission' && e.data.missionId && window.missionManager) {
          window.missionManager.startMission(e.data.missionId);
        } else if (window.missionManager && e.data.mode !== 'mission') {
          window.missionManager.exitMissionMode();
        }

        window.dispatchEvent(new Event('resize'));
      } else if (e.data.type === 'BATTLEZONE_START_MISSION') {
        if (window.battlezoneNetwork) {
          window.battlezoneNetwork.inMatch = false;
        }
        if (remotePlayerManager) {
          remotePlayerManager.clear();
        }
        const targetMap = e.data.map || currentMap;
        if (targetMap !== currentMap) {
          switchMap(targetMap);
        }
        startMatch(targetMap);
        if (window.missionManager && e.data.missionId) {
          window.missionManager.startMission(e.data.missionId);
        }
        window.dispatchEvent(new Event('resize'));
      } else if (e.data.type === 'BATTLEZONE_START_MULTIPLAYER') {
        const targetMap = e.data.map || currentMap;
        if (targetMap !== currentMap) {
          switchMap(targetMap);
        } else {
          startMatch(targetMap);
        }

        if (window.battlezoneNetwork) {
          window.battlezoneNetwork.inMatch = true;
          window.battlezoneNetwork.roomId = e.data.roomId;
          window.battlezoneNetwork.playerId = e.data.playerId;
          window.battlezoneNetwork.claimSession(e.data.roomId, e.data.playerId);
        }

        // Assign spawn for local player
        if (worldData && (worldData.playerSpawns || worldData.playerSpawn)) {
          const spawns = worldData.playerSpawns || [worldData.playerSpawn];
          const localSpawnInfo = e.data.playerSpawns && e.data.playerId ? e.data.playerSpawns[e.data.playerId] : null;
          const localIdx = localSpawnInfo ? localSpawnInfo.spawnIndex : 0;
          const mySpawn = spawns[localIdx % spawns.length];
          if (fpsController) {
            fpsController.reset(mySpawn);
          }

          // Initial spawn for other players in room
          if (remotePlayerManager && e.data.roomState && e.data.roomState.players) {
            remotePlayerManager.clear();
            e.data.roomState.players.forEach(p => {
              if (p.playerId !== e.data.playerId) {
                const spInfo = e.data.playerSpawns ? e.data.playerSpawns[p.playerId] : null;
                const spIdx = spInfo ? spInfo.spawnIndex : 1;
                const otherSpawn = spawns[spIdx % spawns.length];
                remotePlayerManager.addOrUpdatePlayer(p.playerId, p.displayName, otherSpawn, otherSpawn.yaw || 0);
              }
            });
          }
        }
        window.dispatchEvent(new Event('resize'));
      }
    }
  });

  window.startMatch = startMatch;
  window.switchMap = switchMap;

  // Check URL parameters for direct mission launch
  const initialMode = urlParams.get('mode');
  const initialMission = urlParams.get('mission');
  if (initialMode === 'mission' && initialMission && window.missionManager) {
    window.missionManager.startMission(initialMission);
  }

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

  // Hemispheric Ambient Light (Soft tropical sky & warm earth bounce)
  hemiLight = new THREE.HemisphereLight(p.hemiSky, p.hemiGround, p.hemiIntensity);
  scene.add(hemiLight);

  // Gentle ambient fill light (ensures alleys, porches, verandas & building interiors are never pitch black)
  ambientLight = new THREE.AmbientLight(0xfff8ee, p.ambientIntensity || 0.32);
  scene.add(ambientLight);

  // Directional Sunlight with Soft Contact Shadows
  dirLight = new THREE.DirectionalLight(p.sunColor, p.sunIntensity);
  dirLight.position.set(p.sunPos[0], p.sunPos[1], p.sunPos[2]);
  dirLight.castShadow = true;

  // Optimized Soft Shadow map with full tactical district coverage (mobile-friendly 1024 map)
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 10;
  dirLight.shadow.camera.far = 280;
  const d = 115; // Cleanly covers full Magura Town / Abalpur active combat zone
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  dirLight.shadow.bias = -0.0004;
  dirLight.shadow.radius = 1.5; // Soft shadow edges
  scene.add(dirLight);
}

function createSkyDome() {
  // Realistic sky hemisphere gradient (zenith tropical blue fading to warm natural horizon dust)
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 128;
  skyCanvas.height = 256;
  const sCtx = skyCanvas.getContext('2d');
  const skyGrad = sCtx.createLinearGradient(0, 0, 0, 256);
  skyGrad.addColorStop(0, '#3e74ab');   // deep zenith blue
  skyGrad.addColorStop(0.45, '#72a4ce'); // natural tropical sky
  skyGrad.addColorStop(0.8, '#b2d3eb'); // soft bright lower sky
  skyGrad.addColorStop(1, '#dfdbd2');   // warm horizon dust
  sCtx.fillStyle = skyGrad;
  sCtx.fillRect(0, 0, 128, 256);

  const skyTex = new THREE.CanvasTexture(skyCanvas);
  const skyGeo = new THREE.SphereGeometry(260, 24, 16);
  const skyMat = new THREE.MeshBasicMaterial({
    map: skyTex,
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

  if (ambientLight) {
    ambientLight.intensity = p.ambientIntensity || 0.32;
  }

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

  // Medkit Pickups on Mini-Map (Tactical Green Crosses)
  if (medkitManager && medkitManager.pickups) {
    miniMapCtx.fillStyle = '#22c55e';
    for (let i = 0; i < medkitManager.pickups.length; i++) {
      const p = medkitManager.pickups[i];
      if (p.isAvailable) {
        const mx = p.pos.x * scale;
        const mz = p.pos.z * scale;
        miniMapCtx.fillRect(mx - 2, mz - 0.7, 4, 1.4);
        miniMapCtx.fillRect(mx - 0.7, mz - 2, 1.4, 4);
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
      if ((currentMap === 'magura_river_port' || currentMap === 'magura-river-port') && typeof MaguraRiverPortBuilder !== 'undefined' && MaguraRiverPortBuilder.drawMiniMap) {
        MaguraRiverPortBuilder.drawMiniMap(miniMapCtx, miniMapCanvas.width, miniMapCanvas.height, fpsController);
      } else if (currentMap === 'abalpur_village' && typeof AbalpurVillageBuilder !== 'undefined' && AbalpurVillageBuilder.drawMiniMap) {
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

    // Update 10 Enemy AI Bots: Patrol, Turn, Chase, Aim & Shoot
    if (enemyManager) {
      enemyManager.update(delta, fpsController.position, fpsController);
    }

    // Update 3D World Medkit Pickups (Floating rotation & player distance collection)
    if (medkitManager && fpsController) {
      medkitManager.update(delta, fpsController.position, fpsController, time);
    }

    // Update Tactical Mission System (Objectives spatial triggers & 3D HUD compass marker)
    if (window.missionManager && fpsController) {
      window.missionManager.update(fpsController.position, camera, delta);
    }

    // STEP 3: Broadcast local player transform to multiplayer room at ~15 Hz
    if (window.battlezoneNetwork && window.battlezoneNetwork.inMatch) {
      const isMoving = fpsController.moveVector ? (fpsController.moveVector.length() > 0.05) : false;
      window.battlezoneNetwork.sendLocalTransform(
        fpsController.position,
        fpsController.yaw,
        fpsController.pitch,
        isMoving,
        fpsController.isSprinting
      );
    }
  }

  // STEP 3: Smooth interpolation for all remote players
  if (remotePlayerManager) {
    remotePlayerManager.update(delta);
  }

  // Animate Water ripples gently across all ponds and canal
  if (worldData && worldData.waterMeshes && worldData.waterMeshes.length > 0) {
    const ox = (time * 0.00008) % 1;
    const oy = (time * 0.00004) % 1;
    for (let i = 0; i < worldData.waterMeshes.length; i++) {
      const wm = worldData.waterMeshes[i];
      if (wm && wm.material && wm.material.map) {
        wm.material.map.offset.x = ox;
        wm.material.map.offset.y = oy;
      }
    }
  } else if (worldData && worldData.waterMesh && worldData.waterMesh.material && worldData.waterMesh.material.map) {
    worldData.waterMesh.material.map.offset.x = (time * 0.0001) % 1;
  }

  // Render Scene
  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init);
