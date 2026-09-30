// Abalpur Village — Magura (আবালপুর গ্রাম • মাগুরা)
// 3D Rural Bangladesh Village Map for Battlezone Magura
// High-performance mobile-optimized Three.js environment featuring:
// Dirt & brick roads, green rice paddy fields, village pond & ghat, tin & mud houses,
// bamboo clusters, coconut & betel nut palms, banana trees, haystacks, rural shops,
// culverts, utility poles, and parked CNG/van/bike vehicles.

const AbalpurVillageBuilder = {
  colliders: [],
  waterMesh: null,
  waterMeshes: [],
  sharedGeos: {},
  sharedMats: {},

  // Player start spawn point (Village entrance dirt road facing south into the village)
  playerSpawn: {
    x: 0,
    y: 1.72,
    z: -70,
    yaw: 0
  },

  // 10 Tactical Enemy Patrol Bot configurations for Abalpur Village distributed across Chowrasta, Fields, Pond, Mosque, School, Rice Mill, Riverside, and Clinic
  enemyConfigs: [
    {
      id: 1,
      name: "শত্রু ১ (আবালপুর চৌরাস্তা)",
      spawn: { x: 8, y: 0, z: -10 },
      waypoints: [
        { x: 8, z: -10 },
        { x: 18, z: -10 },
        { x: 18, z: 0 },
        { x: 8, z: 0 }
      ]
    },
    {
      id: 2,
      name: "শত্রু ২ (পূর্ব ধানক্ষেত আইল)",
      spawn: { x: 50, y: 0, z: 22 },
      waypoints: [
        { x: 50, z: 22 },
        { x: 74, z: 22 },
        { x: 74, z: 38 },
        { x: 50, z: 38 }
      ]
    },
    {
      id: 3,
      name: "শত্রু ৩ (পুকুরপাড় ও ঘাট)",
      spawn: { x: -44, y: 0, z: 12 },
      waypoints: [
        { x: -44, z: 12 },
        { x: -44, z: 30 },
        { x: -35, z: 30 },
        { x: -35, z: 12 }
      ]
    },
    {
      id: 4,
      name: "শত্রু ৪ (দক্ষিণ মেঠোপথ)",
      spawn: { x: -2, y: 0, z: 54 },
      waypoints: [
        { x: -2, z: 54 },
        { x: -2, z: 68 },
        { x: 6, z: 68 },
        { x: 6, z: 54 }
      ]
    },
    {
      id: 5,
      name: "শত্রু ৫ (কালভার্ট ব্রিজ ও খালপাড়)",
      spawn: { x: 0, y: 0, z: 24 },
      waypoints: [
        { x: 0, z: 20 },
        { x: 12, z: 20 },
        { x: 12, z: 32 },
        { x: 0, z: 32 }
      ]
    },
    {
      id: 6,
      name: "শত্রু ৬ (আবালপুর জামে মসজিদ প্রাঙ্গণ)",
      spawn: { x: 14, y: 0, z: -94 },
      waypoints: [
        { x: 14, z: -94 },
        { x: 21, z: -94 },
        { x: 24, z: -97 },
        { x: 16, z: -94 }
      ]
    },
    {
      id: 7,
      name: "শত্রু ৭ (প্রাথমিক বিদ্যালয় খেলার মাঠ)",
      spawn: { x: -60, y: 0, z: -88 },
      waypoints: [
        { x: -60, z: -88 },
        { x: -48, z: -88 },
        { x: -48, z: -96 },
        { x: -60, z: -96 }
      ]
    },
    {
      id: 8,
      name: "শত্রু ৮ (অটো রাইস মিল ও চাতাল)",
      spawn: { x: 72, y: 0, z: 18 },
      waypoints: [
        { x: 72, z: 18 },
        { x: 80, z: 18 },
        { x: 80, z: 28 },
        { x: 72, z: 28 }
      ]
    },
    {
      id: 9,
      name: "শত্রু ৯ (নদী রক্ষা বাঁধ ও নৌকা ঘাট)",
      spawn: { x: 0, y: 0, z: 92 },
      waypoints: [
        { x: 0, z: 92 },
        { x: 18, z: 92 },
        { x: 18, z: 96 },
        { x: 0, z: 96 }
      ]
    },
    {
      id: 10,
      name: "শত্রু ১০ (কমিউনিটি ক্লিনিক আঙিনা)",
      spawn: { x: -26, y: 0, z: 32 },
      waypoints: [
        { x: -26, z: 32 },
        { x: -34, z: 32 },
        { x: -34, z: 38 },
        { x: -26, z: 38 }
      ]
    }
  ],

  // Initialize shared geometries to minimize GPU allocation
  initSharedGeometries: function() {
    // Arching coconut frond (2-segment natural curve: ascending rachis + drooping tip)
    const frondPos = [
      -0.28, 0.4, 1.0,   0.28, 0.4, 1.0,   0, 0.65, 2.1,
      -0.28, 0.4, 1.0,   0, 0.65, 2.1,     0, 0, 0,
      0.28, 0.4, 1.0,    0, 0, 0,          0, 0.65, 2.1,
      -0.20, 0.35, 3.0,  0.20, 0.35, 3.0,  0, -0.45, 3.9,
      -0.20, 0.35, 3.0,  0, -0.45, 3.9,    0, 0.65, 2.1,
      0.20, 0.35, 3.0,   0, 0.65, 2.1,     0, -0.45, 3.9
    ];
    this.sharedGeos.frondCurved = new THREE.BufferGeometry();
    this.sharedGeos.frondCurved.setAttribute('position', new THREE.BufferAttribute(new Float32Array(frondPos), 3));
    this.sharedGeos.frondCurved.computeVertexNormals();

    // Compact upright betel-nut frond (slender arching curve)
    const betelFrondPos = [
      -0.18, 0.35, 0.8,   0.18, 0.35, 0.8,   0, 0.55, 1.6,
      -0.18, 0.35, 0.8,   0, 0.55, 1.6,      0, 0, 0,
      0.18, 0.35, 0.8,    0, 0, 0,           0, 0.55, 1.6,
      -0.14, 0.28, 2.3,   0.14, 0.28, 2.3,   0, -0.32, 3.0,
      -0.14, 0.28, 2.3,   0, -0.32, 3.0,     0, 0.55, 1.6,
      0.14, 0.28, 2.3,    0, 0.55, 1.6,      0, -0.32, 3.0
    ];
    this.sharedGeos.betelFrondCurved = new THREE.BufferGeometry();
    this.sharedGeos.betelFrondCurved.setAttribute('position', new THREE.BufferAttribute(new Float32Array(betelFrondPos), 3));
    this.sharedGeos.betelFrondCurved.computeVertexNormals();

    // Broad curved banana leaf blade (natural upward arch and distal droop)
    const bananaPos = [
      0, 0, 0,                      -0.28, 0.35, 0.7,     0, 0.48, 1.4,
      0, 0, 0,                      0, 0.48, 1.4,         0.28, 0.35, 0.7,
      0, 0.48, 1.4,                 -0.22, 0.22, 2.0,     0, -0.35, 2.6,
      0, 0.48, 1.4,                 0, -0.35, 2.6,        0.22, 0.22, 2.0
    ];
    this.sharedGeos.bananaCurved = new THREE.BufferGeometry();
    this.sharedGeos.bananaCurved.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bananaPos), 3));
    this.sharedGeos.bananaCurved.computeVertexNormals();

    // Ground weed / grass tuft (low-poly cone)
    this.sharedGeos.grassTuft = new THREE.ConeGeometry(0.35, 0.45, 4);

    // Bamboo culm
    this.sharedGeos.bambooPole = new THREE.CylinderGeometry(0.06, 0.08, 8, 5);
    this.sharedGeos.bambooPole.translate(0, 4, 0);

    // Haystack (conical dome)
    this.sharedGeos.haystack = new THREE.ConeGeometry(2.8, 4.2, 10);
    this.sharedGeos.haystack.translate(0, 2.1, 0);

    // Utility pole
    this.sharedGeos.utilityPole = new THREE.CylinderGeometry(0.12, 0.16, 8.5, 6);
    this.sharedGeos.utilityPole.translate(0, 4.25, 0);

    // Shared Foliage & Bark Materials for low-overhead rendering
    this.sharedMats = {
      trunkBark: new THREE.MeshLambertMaterial({ color: 0x5a4533 }),
      palmTrunk: new THREE.MeshLambertMaterial({ color: 0x6e5845 }),
      betelTrunk: new THREE.MeshLambertMaterial({ color: 0x8a7a6a }),
      crownshaft: new THREE.MeshLambertMaterial({ color: 0x5ea83c }),
      palmFrond: new THREE.MeshLambertMaterial({ color: 0x2e7535, side: THREE.DoubleSide }),
      palmFrondSun: new THREE.MeshLambertMaterial({ color: 0x429249, side: THREE.DoubleSide }),
      deadFrond: new THREE.MeshLambertMaterial({ color: 0x7a5b3a, side: THREE.DoubleSide }),
      coconut: new THREE.MeshLambertMaterial({ color: 0x548a35 }),
      betelNut: new THREE.MeshLambertMaterial({ color: 0xc4943e }),
      bananaStem: new THREE.MeshLambertMaterial({ color: 0x76b54d }),
      bananaSheath: new THREE.MeshLambertMaterial({ color: 0x644b30 }),
      bananaLeaf: new THREE.MeshLambertMaterial({ color: 0x3d8d2b, side: THREE.DoubleSide }),
      bananaShoot: new THREE.MeshLambertMaterial({ color: 0x8ce438, side: THREE.DoubleSide }),
      bambooStem: new THREE.MeshLambertMaterial({ color: 0x80b048 }),
      bambooLeaf1: new THREE.MeshLambertMaterial({ color: 0x326e25 }),
      bambooLeaf2: new THREE.MeshLambertMaterial({ color: 0x428232 }),
      mulchBed: new THREE.MeshLambertMaterial({ color: 0x6e573e }),
      shadeLeafDark: new THREE.MeshLambertMaterial({ color: 0x2a5223 }),
      shadeLeafMid: new THREE.MeshLambertMaterial({ color: 0x3a6d2c }),
      shadeLeafBright: new THREE.MeshLambertMaterial({ color: 0x4e8a38 }),
      groundGrass: new THREE.MeshLambertMaterial({ color: 0x4e8529 }),
      cementPlatform: new THREE.MeshLambertMaterial({ color: 0x8a8f94 }),
      tubeWellGreen: new THREE.MeshLambertMaterial({ color: 0x245e38 }),
      tubeWellIron: new THREE.MeshLambertMaterial({ color: 0x2b3338 }),
      redBrick: new THREE.MeshLambertMaterial({ color: 0x8e3d2f }),
      earthenDirt: new THREE.MeshLambertMaterial({ color: 0x5e4834 }),
      earthenYard: new THREE.MeshLambertMaterial({ color: 0x6e573e }),
      creeperLeaf: new THREE.MeshLambertMaterial({ color: 0x3d702e }),
      trellisBamboo: new THREE.MeshLambertMaterial({ color: 0x7a6344 })
    };
  },

  // Main build method
  buildWorld: function(scene) {
    this.colliders = [];
    this.waterMeshes = [];
    this.initSharedGeometries();

    const villageGroup = new THREE.Group();
    villageGroup.name = "AbalpurVillageWorld";

    // 1. Terrain & Base Earth Ground
    this.createVillageTerrain(villageGroup);

    // 2. Village Dirt & Paved Roads
    this.createRoadNetwork(villageGroup);

    // 3. Green Rice Paddy Fields (ধানক্ষেত)
    this.createPaddyFields(villageGroup);

    // 4. Village Pond & Bamboo Ghat (পুকুর ও ঘাট)
    this.createVillagePond(villageGroup);

    // 5. Rural Homesteads (মাটির ঘর, টিনের চাল ও উঠান)
    this.createHomesteads(villageGroup);

    // 5b. Village Homestead Surroundings (উঠান, টিউবওয়েল, খড়ের গাদা, বাঁশের বেড়া ও আলপথ)
    this.createVillageSurroundings(villageGroup);

    // 6. Abalpur Chowrasta & Village Shops (মুদি ও চায়ের দোকান)
    this.createVillageShops(villageGroup);

    // 7. Small Bridge / Concrete Culvert (কালভার্ট)
    this.createCulvert(villageGroup);

    // 8. Utility Electric Poles & Overhead Wires (পল্লী বিদ্যুৎ)
    this.createUtilityGrid(villageGroup);

    // 9. Rural Trees & Bamboo Groves (বাঁশঝাড়, সুপারি, কলা ও নারিকেল গাছ)
    this.createVegetation(villageGroup);

    // 10. Parked Rural Vehicles (ভ্যান গাড়ি, সিএনজি ও সাইকেল)
    this.createRuralVehicles(villageGroup);

    // 11. Expanded Village Roads & Connecting Paths (বর্ধিত সড়ক ও সংযোগকারী আলপথ)
    this.createExpandedRoadsAndPaths(villageGroup);

    // 12. Abalpur Jame Mosque & Courtyard (আবালপুর জামে মসজিদ ও প্রাঙ্গণ)
    this.createAbalpurMosque(villageGroup);

    // 13. Abalpur Govt Primary School & Playground (আবালপুর সরকারি প্রাথমিক বিদ্যালয় ও খেলার মাঠ)
    this.createPrimarySchool(villageGroup);

    // 14. Auto Rice Mill & Industrial Chatal Yard (আবালপুর অটো রাইস মিল ও চাতাল)
    this.createRiceMillAndChatal(villageGroup);

    // 15. South Riverside Embankment, Boat Ghat & Creek (নদী রক্ষা বাঁধ, নৌকা ঘাট ও বাঁশের সাঁকো)
    this.createRiversideArea(villageGroup);

    // 16. Abalpur Community Health Clinic (আবালপুর কমিউনিটি ক্লিনিক)
    this.createCommunityClinic(villageGroup);

    // 17. Boundary Enclosure (Dense bamboo & hedge tree line to keep combat enclosed)
    this.createPerimeterEnclosure(villageGroup);

    scene.add(villageGroup);

    return {
      colliders: this.colliders,
      waterMesh: this.waterMesh,
      waterMeshes: this.waterMeshes,
      playerSpawn: this.playerSpawn,
      enemyConfigs: this.enemyConfigs
    };
  },

  // ================= 1. TERRAIN =================
  createVillageTerrain: function(parent) {
    // Large earthen grass terrain
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 512;
    groundCanvas.height = 512;
    const gCtx = groundCanvas.getContext('2d');

    // Rich rural Bengal soil & grass blend
    gCtx.fillStyle = '#4a5b32';
    gCtx.fillRect(0, 0, 512, 512);

    // Patchy variations (clay soil, lush grass, dry earth)
    for (let i = 0; i < 3000; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      const r = Math.random() * 8 + 3;
      const col = Math.random() > 0.4 ? 'rgba(78, 102, 53, 0.4)' : 'rgba(102, 80, 52, 0.35)';
      gCtx.fillStyle = col;
      gCtx.beginPath();
      gCtx.arc(rx, ry, r, 0, Math.PI * 2);
      gCtx.fill();
    }

    const groundTex = new THREE.CanvasTexture(groundCanvas);
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(16, 16);

    const groundMat = new THREE.MeshLambertMaterial({
      map: groundTex,
      color: 0xffffff
    });

    const groundGeo = new THREE.PlaneGeometry(260, 260);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    parent.add(ground);
  },

  // ================= 2. ROAD NETWORK =================
  createRoadNetwork: function(parent) {
    // Canvas Dirt Road Texture (Beaten earth with wheel ruts & dried dust)
    const dirtCanvas = document.createElement('canvas');
    dirtCanvas.width = 256;
    dirtCanvas.height = 256;
    const dCtx = dirtCanvas.getContext('2d');

    dCtx.fillStyle = '#6b4f35';
    dCtx.fillRect(0, 0, 256, 256);

    // Two parallel darker wheel ruts
    dCtx.fillStyle = 'rgba(68, 48, 30, 0.55)';
    dCtx.fillRect(40, 0, 48, 256);
    dCtx.fillRect(168, 0, 48, 256);

    // Small pebbles and footprints
    for (let i = 0; i < 1500; i++) {
      const px = Math.random() * 256;
      const py = Math.random() * 256;
      dCtx.fillStyle = Math.random() > 0.5 ? 'rgba(140, 110, 80, 0.4)' : 'rgba(45, 32, 20, 0.5)';
      dCtx.fillRect(px, py, 2, 2);
    }

    const dirtTex = new THREE.CanvasTexture(dirtCanvas);
    dirtTex.wrapS = THREE.RepeatWrapping;
    dirtTex.wrapT = THREE.RepeatWrapping;
    dirtTex.repeat.set(1, 14);

    const dirtMat = new THREE.MeshLambertMaterial({ map: dirtTex });

    // Brick Pavement Texture (হেরিংবোন ইট বিছানো সোলিং রাস্তা)
    const brickCanvas = document.createElement('canvas');
    brickCanvas.width = 256;
    brickCanvas.height = 256;
    const bCtx = brickCanvas.getContext('2d');
    bCtx.fillStyle = '#8f4333';
    bCtx.fillRect(0, 0, 256, 256);
    bCtx.strokeStyle = '#5a2a20';
    bCtx.lineWidth = 1.5;
    for (let y = 0; y < 256; y += 16) {
      bCtx.beginPath();
      bCtx.moveTo(0, y);
      bCtx.lineTo(256, y);
      bCtx.stroke();
      const offset = (y / 16) % 2 === 0 ? 0 : 16;
      for (let x = offset; x < 256; x += 32) {
        bCtx.beginPath();
        bCtx.moveTo(x, y);
        bCtx.lineTo(x, y + 16);
        bCtx.stroke();
      }
    }
    const brickTex = new THREE.CanvasTexture(brickCanvas);
    brickTex.wrapS = THREE.RepeatWrapping;
    brickTex.wrapT = THREE.RepeatWrapping;
    brickTex.repeat.set(1, 10);
    const brickRoadMat = new THREE.MeshLambertMaterial({ map: brickTex });

    // A. Main East-West Village Road (Passing through chowrasta)
    // Western dirt section
    const westRoad = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 90), dirtMat);
    westRoad.rotation.x = -Math.PI / 2;
    westRoad.rotation.z = Math.PI / 2;
    westRoad.position.set(-60, 0.02, -10);
    westRoad.receiveShadow = true;
    parent.add(westRoad);

    // Central Chowrasta Brick-Paved section
    const centerRoad = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 45), brickRoadMat);
    centerRoad.rotation.x = -Math.PI / 2;
    centerRoad.rotation.z = Math.PI / 2;
    centerRoad.position.set(0, 0.025, -10);
    centerRoad.receiveShadow = true;
    parent.add(centerRoad);

    // Eastern dirt section
    const eastRoad = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 90), dirtMat);
    eastRoad.rotation.x = -Math.PI / 2;
    eastRoad.rotation.z = Math.PI / 2;
    eastRoad.position.set(60, 0.02, -10);
    eastRoad.receiveShadow = true;
    parent.add(eastRoad);

    // B. North-South Road (Linking village entrance to Culvert & Homesteads)
    const northRoad = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 70), dirtMat);
    northRoad.rotation.x = -Math.PI / 2;
    northRoad.position.set(0, 0.02, -45);
    northRoad.receiveShadow = true;
    parent.add(northRoad);

    const southRoad = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 65), dirtMat);
    southRoad.rotation.x = -Math.PI / 2;
    southRoad.position.set(0, 0.02, 45);
    southRoad.receiveShadow = true;
    parent.add(southRoad);

    // C. Narrow Mud Alleyway to Homestead 1 (উঠানের মেঠো পথ)
    const homesteadAlley = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 40), dirtMat);
    homesteadAlley.rotation.x = -Math.PI / 2;
    homesteadAlley.rotation.z = Math.PI / 2;
    homesteadAlley.position.set(-20, 0.02, 48);
    homesteadAlley.receiveShadow = true;
    parent.add(homesteadAlley);

    // D. Mud Alleyway to Village Pond (পুকুরপাড়ের পথ)
    const pondAlley = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 35), dirtMat);
    pondAlley.rotation.x = -Math.PI / 2;
    pondAlley.position.set(-35, 0.02, 5);
    pondAlley.receiveShadow = true;
    parent.add(pondAlley);
  },

  // ================= 3. GREEN RICE PADDY FIELDS (ধানক্ষেত) =================
  // Authentic rural Bangladesh rice paddy fields featuring:
  // - Subdivided rectangular and irregular plots (আলাদা আলাদা কিয়ার / জমি)
  // - Muddy wetland soil with standing water sheen (জলমগ্ন নরম কাদা ও পানি)
  // - 3D visible young green rice seedling rows (ধানের চারা)
  // - Elevated earthen walking ridges (আইল - mud footpaths between fields)
  // - Rural irrigation ditch / channel (সেচ নালা) from shallow pump shed
  createPaddyFields: function(parent) {
    // 1. Natural Transplanted Flooded Paddy Texture (কাদাপানি ও ধানের রোপা চারা)
    const floodedCanvas = document.createElement('canvas');
    floodedCanvas.width = 256;
    floodedCanvas.height = 256;
    const fCtx = floodedCanvas.getContext('2d');

    // Rich alluvial silt & dark wetland loam base (পলল মাটি ও কাদা)
    fCtx.fillStyle = '#261c14';
    fCtx.fillRect(0, 0, 256, 256);

    // Subtle natural soil mottling / roughness variation (নরম কাদার দানা ও ছোপ)
    for (let i = 0; i < 900; i++) {
      const sx = Math.random() * 256;
      const sy = Math.random() * 256;
      const sr = Math.random() * 6 + 2;
      const mudTone = Math.random();
      fCtx.fillStyle = mudTone > 0.6 ? 'rgba(56, 42, 28, 0.35)' :
                       mudTone > 0.3 ? 'rgba(28, 20, 14, 0.45)' : 'rgba(42, 33, 22, 0.3)';
      fCtx.beginPath();
      fCtx.arc(sx, sy, sr, 0, Math.PI * 2);
      fCtx.fill();
    }

    // Organic standing water sheen & subtle wet streaks between crop rows
    for (let y = 3; y < 256; y += 16) {
      // Diffuse murky water sheen with soft edges
      const grad = fCtx.createLinearGradient(0, y - 4, 0, y + 5);
      grad.addColorStop(0, 'rgba(40, 56, 42, 0.05)');
      grad.addColorStop(0.5, 'rgba(48, 66, 52, 0.32)');
      grad.addColorStop(1, 'rgba(40, 56, 42, 0.05)');
      fCtx.fillStyle = grad;
      fCtx.fillRect(0, y - 4, 256, 9);

      // Transplanted young rice clumps with natural spacing irregularities
      for (let x = 6; x < 256; x += 14) {
        const jitterX = (Math.sin(x * 12.3 + y * 4.7) * 1.6);
        const jitterY = (Math.cos(x * 7.1 + y * 9.2) * 1.4);
        const px = x + jitterX;
        const py = y + jitterY;

        // Dark damp mud root collar (ভেজা কাদার গোড়া)
        fCtx.fillStyle = 'rgba(18, 14, 10, 0.65)';
        fCtx.beginPath();
        fCtx.ellipse(px, py + 4.5, 3.8, 1.8, 0, 0, Math.PI * 2);
        fCtx.fill();

        // Natural olive/forest base shoot blades
        fCtx.fillStyle = '#3a6620';
        fCtx.beginPath();
        fCtx.ellipse(px - 1.2, py + 3.2, 1.8, 4.8, -0.22, 0, Math.PI * 2);
        fCtx.fill();

        fCtx.fillStyle = '#488028';
        fCtx.beginPath();
        fCtx.ellipse(px + 0.8, py + 3.0, 2.0, 5.0, 0.18, 0, Math.PI * 2);
        fCtx.fill();

        // Tender sunlit green center leaf blade
        fCtx.fillStyle = '#5c9632';
        fCtx.beginPath();
        fCtx.ellipse(px, py + 2.2, 1.5, 4.2, 0.02, 0, Math.PI * 2);
        fCtx.fill();

        // Subtle warm golden-green leaf tip highlight
        fCtx.fillStyle = '#7ca83c';
        fCtx.beginPath();
        fCtx.ellipse(px + 0.3, py + 0.8, 1.0, 2.4, 0.08, 0, Math.PI * 2);
        fCtx.fill();
      }
    }

    const floodedTex = new THREE.CanvasTexture(floodedCanvas);
    floodedTex.wrapS = THREE.RepeatWrapping;
    floodedTex.wrapT = THREE.RepeatWrapping;

    // 2. Natural Dense Seedbed Nursery Texture (ঘন ধানের বীজতলা)
    const seedbedCanvas = document.createElement('canvas');
    seedbedCanvas.width = 256;
    seedbedCanvas.height = 256;
    const sCtx = seedbedCanvas.getContext('2d');

    // Rich damp alluvial soil underbed
    sCtx.fillStyle = '#221911';
    sCtx.fillRect(0, 0, 256, 256);

    // Layered seedling tufts in realistic natural agricultural greens
    const bladeColors = [
      '#37611e', '#437525', '#4f852b', '#5c9632',
      '#6ba539', '#78ab3d', '#86b542'
    ];
    for (let i = 0; i < 2800; i++) {
      const bx = Math.random() * 256;
      const by = Math.random() * 256;
      const bw = Math.random() * 1.8 + 1.0;
      const bh = Math.random() * 4.5 + 2.0;
      const colorIdx = Math.floor(Math.random() * bladeColors.length);
      sCtx.fillStyle = bladeColors[colorIdx];
      sCtx.fillRect(bx, by, bw, bh);
    }

    // Soft organic damp soil patches peeking through the seedling canopy
    for (let j = 0; j < 30; j++) {
      const px = Math.random() * 256;
      const py = Math.random() * 256;
      sCtx.fillStyle = 'rgba(28, 20, 14, 0.22)';
      sCtx.beginPath();
      sCtx.arc(px, py, Math.random() * 10 + 4, 0, Math.PI * 2);
      sCtx.fill();
    }
    const seedbedTex = new THREE.CanvasTexture(seedbedCanvas);
    seedbedTex.wrapS = THREE.RepeatWrapping;
    seedbedTex.wrapT = THREE.RepeatWrapping;

    // 3. Cutout Rice Plant Silhouette Texture for 3D Rows (প্রাকৃতিক ধানের চারা)
    const rowCanvas = document.createElement('canvas');
    rowCanvas.width = 256;
    rowCanvas.height = 48;
    const rCtx = rowCanvas.getContext('2d');
    rCtx.clearRect(0, 0, 256, 48);

    for (let rx = 3; rx < 256; rx += 7) {
      const clumpH = 26 + (Math.sin(rx * 0.8) * 8) + (Math.cos(rx * 1.7) * 6);
      const slant = (Math.sin(rx * 0.45) * 2.8);

      // Damp root stalk base
      rCtx.fillStyle = '#263b18';
      rCtx.beginPath();
      rCtx.moveTo(rx - 1.2, 48);
      rCtx.lineTo(rx - 1.8, 48 - clumpH * 0.4);
      rCtx.lineTo(rx + 1.8, 48 - clumpH * 0.4);
      rCtx.lineTo(rx + 1.2, 48);
      rCtx.closePath();
      rCtx.fill();

      // Deep green main rice blade
      rCtx.fillStyle = '#3c6b22';
      rCtx.beginPath();
      rCtx.moveTo(rx - 1.5, 48 - clumpH * 0.35);
      rCtx.lineTo(rx - 2.8 + slant, 48 - clumpH * 0.75);
      rCtx.lineTo(rx + slant, 48 - clumpH);
      rCtx.lineTo(rx + 2.8 + slant, 48 - clumpH * 0.7);
      rCtx.lineTo(rx + 1.5, 48 - clumpH * 0.35);
      rCtx.closePath();
      rCtx.fill();

      // Mid-green leaf blade body
      rCtx.fillStyle = '#4f852c';
      rCtx.beginPath();
      rCtx.moveTo(rx - 0.8, 48 - clumpH * 0.3);
      rCtx.lineTo(rx - 1.5 + slant * 0.8, 48 - clumpH * 0.8);
      rCtx.lineTo(rx + slant * 0.9, 48 - clumpH * 0.95);
      rCtx.lineTo(rx + 1.2 + slant * 0.8, 48 - clumpH * 0.75);
      rCtx.closePath();
      rCtx.fill();

      // Sunlit tender warm green leaf tip
      rCtx.fillStyle = '#7caa3a';
      rCtx.beginPath();
      rCtx.moveTo(rx, 48 - clumpH * 0.7);
      rCtx.lineTo(rx - 0.8 + slant, 48 - clumpH * 0.9);
      rCtx.lineTo(rx + slant, 48 - clumpH);
      rCtx.lineTo(rx + 0.8 + slant, 48 - clumpH * 0.88);
      rCtx.closePath();
      rCtx.fill();
    }
    const rowTex = new THREE.CanvasTexture(rowCanvas);
    rowTex.wrapS = THREE.RepeatWrapping;
    rowTex.wrapT = THREE.ClampToEdgeWrapping;

    // Shared base materials
    const rowMat = new THREE.MeshLambertMaterial({
      map: rowTex,
      transparent: true,
      alphaTest: 0.15,
      side: THREE.DoubleSide
    });

    this.paddyMats = {
      floodedTex,
      seedbedTex,
      rowMat
    };

    // --- ZONE 1: NORTHEAST PADDY SECTOR (উত্তর-পূর্ব ধানের মাঠ) ---
    // Plot 1: Northeast Seedbed (বীজতলা)
    this.createFieldPlot(parent, 68, -62, 22, 18, 'seedbed', 4, 0);
    // Plot 2: Northeast Flooded Plot
    this.createFieldPlot(parent, 90, -60, 18, 22, 'flooded', 5, 1);
    // Plot 3: East Central Plot (with Scarecrow)
    this.createFieldPlot(parent, 66, -38, 24, 22, 'flooded', 5, 2);
    // Plot 4: East Outer Plot
    this.createFieldPlot(parent, 90, -36, 18, 22, 'flooded', 5, 3);
    // Plot 5: East Roadside Plot
    this.createFieldPlot(parent, 60, -18, 20, 10, 'flooded', 3, 4);

    // --- ZONE 2: SOUTHEAST PADDY SECTOR (দক্ষিণ-পূর্ব ধানক্ষেত ও সেচ নালা) ---
    // Plot 6: Shallow Pump Plot (শ্যালোর সামনের জমি)
    this.createFieldPlot(parent, 48, 29, 20, 14, 'flooded', 4, 5);
    // Plot 7: Southeast Central Plot
    this.createFieldPlot(parent, 74, 29, 24, 14, 'flooded', 4, 6);
    // Plot 8: Southeast Deep Plot
    this.createFieldPlot(parent, 74, 52, 24, 24, 'flooded', 6, 7);
    // Plot 9: Southeast South Boundary Seedbed
    this.createFieldPlot(parent, 74, 76, 24, 18, 'seedbed', 5, 8);

    // --- ZONE 3: NORTHWEST PADDY SECTOR (উত্তর-পশ্চিম পাড়া ধানের জমি) ---
    // Plot 10: Northwest Dense Seedbed (বীজতলা)
    this.createFieldPlot(parent, -74, -62, 22, 18, 'seedbed', 4, 9);
    // Plot 11: Northwest Flooded Outer Plot
    this.createFieldPlot(parent, -96, -58, 18, 22, 'flooded', 5, 10);
    // Plot 12: Northwest Marsh Plot (পুকুরের উত্তরের নিচু ধানজমি)
    this.createFieldPlot(parent, -74, -38, 22, 20, 'flooded', 5, 11);

    // --- ZONE 4: SOUTHWEST PADDY SECTOR (দক্ষিণ-পশ্চিম মাঠ - পুকুরের দক্ষিণে) ---
    // Plot 13: Pond South Lowland Field (পুকুরের দক্ষিণের জমি)
    this.createFieldPlot(parent, -72, 46, 22, 18, 'flooded', 5, 12);
    // Plot 14: Southwest Corner Plot
    this.createFieldPlot(parent, -74, 70, 22, 22, 'flooded', 5, 13);

    // Tactical: Irrigation Pump Shed (শ্যালোর ঘর) in Southeast Field
    this.createIrrigationPumpShed(parent, 35, 22);

    // Irrigation Channel (সেচ নালা) distributing water from pump through the fields
    this.createIrrigationChannel(parent, 36, 22, 86, 22);

    // Scarecrows (কাকতাড়ুয়া) standing in the fields
    this.createScarecrow(parent, 66, -38);
    this.createScarecrow(parent, 74, 52);
  },

  // Individual Rice Paddy Plot with water, 3D crop rows, and walking ridges (আইল)
  createFieldPlot: function(parent, cx, cz, w, d, type = 'flooded', numRows = 5, plotIndex = 0) {
    const mats = this.paddyMats;
    const plotTex = type === 'seedbed' ? mats.seedbedTex : mats.floodedTex;

    // Natural color & moisture variation between neighboring plots
    const plotProfiles = [
      { groundColor: 0xdde6d4, waterColor: 0x223528, waterOpacity: 0.58, ridgeColor: 0x56422f }, // Plot 1 (Seedbed)
      { groundColor: 0xd2d7c5, waterColor: 0x1f3024, waterOpacity: 0.65, ridgeColor: 0x513d2b }, // Plot 2 (Flooded)
      { groundColor: 0xd9e3ce, waterColor: 0x243729, waterOpacity: 0.56, ridgeColor: 0x584431 }, // Plot 3 (Flooded Scarecrow)
      { groundColor: 0xcfd5c3, waterColor: 0x203226, waterOpacity: 0.62, ridgeColor: 0x4f3c2a }, // Plot 4 (Outer Plot)
      { groundColor: 0xd6dbc8, waterColor: 0x263a2b, waterOpacity: 0.52, ridgeColor: 0x55412e }, // Plot 5 (Roadside)
      { groundColor: 0xd0dfcc, waterColor: 0x1d3224, waterOpacity: 0.68, ridgeColor: 0x4e3b29 }, // Plot 6 (Near Pump)
      { groundColor: 0xdde4ce, waterColor: 0x25382a, waterOpacity: 0.55, ridgeColor: 0x594532 }, // Plot 7 (SE Central)
      { groundColor: 0xd6e0c7, waterColor: 0x213325, waterOpacity: 0.60, ridgeColor: 0x533f2d }, // Plot 8 (SE Deep)
      { groundColor: 0xe0e9d2, waterColor: 0x273b2c, waterOpacity: 0.54, ridgeColor: 0x574330 }, // Plot 9 (SE Seedbed)
      { groundColor: 0xdbe4cc, waterColor: 0x233628, waterOpacity: 0.56, ridgeColor: 0x54402d }, // Plot 10 (NW Seedbed)
      { groundColor: 0xd4dac7, waterColor: 0x1f3125, waterOpacity: 0.64, ridgeColor: 0x503d2b }, // Plot 11 (NW Outer)
      { groundColor: 0xcdd6c4, waterColor: 0x1e3023, waterOpacity: 0.66, ridgeColor: 0x4e3c29 }, // Plot 12 (NW Marsh)
      { groundColor: 0xd5dec9, waterColor: 0x223427, waterOpacity: 0.60, ridgeColor: 0x523e2c }, // Plot 13 (SW Pondside)
      { groundColor: 0xd9e2cc, waterColor: 0x253729, waterOpacity: 0.57, ridgeColor: 0x56422f }  // Plot 14 (SW Corner)
    ];
    const profile = plotProfiles[plotIndex % plotProfiles.length];

    const groundMat = new THREE.MeshLambertMaterial({
      map: plotTex.clone(),
      color: profile.groundColor
    });
    groundMat.map.repeat.set(w / 7, d / 7);

    // 1. Sunken muddy field basin (কাদার তলদেশ)
    const basinMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), groundMat);
    basinMesh.rotation.x = -Math.PI / 2;
    basinMesh.position.set(cx, -0.05, cz);
    basinMesh.receiveShadow = true;
    parent.add(basinMesh);

    // 2. Standing water layer (স্বচ্ছ কাদাপানি) with subtle depth/opacity variation
    if (type === 'flooded') {
      const waterMat = new THREE.MeshLambertMaterial({
        color: profile.waterColor,
        transparent: true,
        opacity: profile.waterOpacity
      });
      const waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.2, d - 0.2), waterMat);
      waterMesh.rotation.x = -Math.PI / 2;
      waterMesh.position.set(cx, 0.01, cz);
      waterMesh.receiveShadow = true;
      parent.add(waterMesh);
    }

    // 3. 3D Rice Seedling Rows standing in the water (চোখে পড়ার মতো ধানের চারা)
    const rowCount = Math.max(3, numRows);
    const rowSpacing = (d - 2.0) / (rowCount + 1);
    const rowLen = w - 1.2;

    for (let r = 1; r <= rowCount; r++) {
      const rz = cz - d / 2 + 1.0 + r * rowSpacing;
      const rowMesh = new THREE.Mesh(new THREE.PlaneGeometry(rowLen, 0.32), mats.rowMat);
      rowMesh.position.set(cx, 0.16, rz);
      rowMesh.receiveShadow = true;
      parent.add(rowMesh);
    }

    // 4. Raised Earthen Ridges (আইল - mud footpaths between fields)
    const ridgeH = 0.22;
    const ridgeW = 0.75;
    const ridgeMat = new THREE.MeshLambertMaterial({ color: profile.ridgeColor });

    // North & South ridges
    const nsGeo = new THREE.BoxGeometry(w + ridgeW, ridgeH, ridgeW);
    const nRidge = new THREE.Mesh(nsGeo, ridgeMat);
    nRidge.position.set(cx, ridgeH / 2, cz - d / 2);
    nRidge.receiveShadow = true;
    parent.add(nRidge);

    const sRidge = new THREE.Mesh(nsGeo, ridgeMat);
    sRidge.position.set(cx, ridgeH / 2, cz + d / 2);
    sRidge.receiveShadow = true;
    parent.add(sRidge);

    // East & West ridges
    const ewGeo = new THREE.BoxGeometry(ridgeW, ridgeH, d);
    const wRidge = new THREE.Mesh(ewGeo, ridgeMat);
    wRidge.position.set(cx - w / 2, ridgeH / 2, cz);
    wRidge.receiveShadow = true;
    parent.add(wRidge);

    const eRidge = new THREE.Mesh(ewGeo, ridgeMat);
    eRidge.position.set(cx + w / 2, ridgeH / 2, cz);
    eRidge.receiveShadow = true;
    parent.add(eRidge);
  },

  // Simple Rural Irrigation Channel (পানির সেচ নালা)
  createIrrigationChannel: function(parent, x1, z1, x2, z2) {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const cx = (x1 + x2) / 2;
    const cz = (z1 + z2) / 2;
    const angle = Math.atan2(x2 - x1, z2 - z1);

    const channelGroup = new THREE.Group();
    channelGroup.position.set(cx, 0, cz);
    channelGroup.rotation.y = angle - Math.PI / 2;

    const ditchMat = new THREE.MeshLambertMaterial({ color: 0x423120 });
    const canalWaterMat = new THREE.MeshLambertMaterial({ color: 0x18483c });

    // Ditch earthen banks (দুপাশের মাটির পাড়)
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(len, 0.16, 0.25), ditchMat);
    b1.position.set(0, 0.08, -0.5);
    channelGroup.add(b1);

    const b2 = new THREE.Mesh(new THREE.BoxGeometry(len, 0.16, 0.25), ditchMat);
    b2.position.set(0, 0.08, 0.5);
    channelGroup.add(b2);

    // Water flowing inside channel (নালার পানি)
    const water = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.75), canalWaterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0.02, 0);
    channelGroup.add(water);

    // Wooden crossing plank so player can cross smoothly (বাঁশ বা কাঠের সাঁকো/পাটাতন)
    const plankMat = new THREE.MeshLambertMaterial({ color: 0x3d2b1c });
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.4), plankMat);
    plank.position.set(12, 0.12, 0);
    channelGroup.add(plank);

    parent.add(channelGroup);
  },

  // Irrigation Pump Shed (শ্যালোর ঘর)
  createIrrigationPumpShed: function(parent, x, z) {
    const shed = new THREE.Group();
    shed.position.set(x, 0, z);

    // Concrete base
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x6e6e66 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 3.2), baseMat);
    base.position.set(0, 0.2, 0);
    shed.add(base);

    // Timber posts
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x4a3525 });
    const postGeo = new THREE.BoxGeometry(0.18, 2.2, 0.18);
    for (let px of [-1.5, 1.5]) {
      for (let pz of [-1.3, 1.3]) {
        const post = new THREE.Mesh(postGeo, woodMat);
        post.position.set(px, 1.3, pz);
        shed.add(post);
      }
    }

    // Half brick-slat walls for tactical cover
    const brickWallMat = new THREE.MeshLambertMaterial({ color: 0x8a4535 });
    const halfWall1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.1, 0.15), brickWallMat);
    halfWall1.position.set(0, 0.75, -1.3);
    shed.add(halfWall1);

    const halfWall2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.1, 2.6), brickWallMat);
    halfWall2.position.set(1.5, 0.75, 0);
    shed.add(halfWall2);

    // Tin pitched roof
    const tinMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createTinRoofTexture()
    });
    const roof1 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 1.9), tinMat);
    roof1.position.set(0, 2.5, -0.7);
    roof1.rotation.x = 0.22;
    shed.add(roof1);

    const roof2 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 1.9), tinMat);
    roof2.position.set(0, 2.5, 0.7);
    roof2.rotation.x = -0.22;
    shed.add(roof2);

    // Diesel Shallow Pump Motor (মটোর ইঞ্জিন)
    const motorMat = new THREE.MeshLambertMaterial({ color: 0x24422e });
    const engine = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 1.2), motorMat);
    engine.position.set(0, 0.8, 0);
    shed.add(engine);

    // Flywheel
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1f1f1f });
    const flywheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 10), wheelMat);
    flywheel.rotation.z = Math.PI / 2;
    flywheel.position.set(0.6, 0.8, 0.2);
    shed.add(flywheel);

    // Blue water discharge pipe
    const pipeMat = new THREE.MeshLambertMaterial({ color: 0x005b96 });
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.5, 8), pipeMat);
    pipe.rotation.z = Math.PI / 3;
    pipe.position.set(1.4, 0.6, -0.4);
    shed.add(pipe);

    parent.add(shed);

    // Solid Collider
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.9, 0, z - 1.7),
      new THREE.Vector3(x + 1.9, 2.8, z + 1.7)
    ));
  },

  // Scarecrow (কাকতাড়ুয়া)
  createScarecrow: function(parent, x, z) {
    const scarecrow = new THREE.Group();
    scarecrow.position.set(x, 0, z);

    // Wooden cross poles
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x5a4325 });
    const vertPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 5), poleMat);
    vertPole.position.set(0, 1.2, 0);
    scarecrow.add(vertPole);

    const crossPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 5), poleMat);
    crossPole.rotation.z = Math.PI / 2;
    crossPole.position.set(0, 1.7, 0);
    scarecrow.add(crossPole);

    // Shirt (checkered/red cloth)
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0xb53525 });
    const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.8, 0.25), shirtMat);
    shirt.position.set(0, 1.45, 0);
    scarecrow.add(shirt);

    // Earthen pot head with face (মাটির হাঁড়ি)
    const potMat = new THREE.MeshLambertMaterial({ color: 0x824424 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), potMat);
    head.position.set(0, 2.05, 0);
    scarecrow.add(head);

    // Straw hat
    const hatMat = new THREE.MeshLambertMaterial({ color: 0xd6ae5a });
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.25, 8), hatMat);
    hat.position.set(0, 2.3, 0);
    scarecrow.add(hat);

    parent.add(scarecrow);

    // Low obstacle collider
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.4, 0, z - 0.4),
      new THREE.Vector3(x + 0.4, 2.4, z + 0.4)
    ));
  },

  // ================= 4. VILLAGE POND & GHAT (পুকুর ও ঘাট) =================
  createVillagePond: function(parent) {
    const pondX = -65;
    const pondZ = 20;
    const pondW = 34;
    const pondD = 24;

    const pondGroup = new THREE.Group();
    pondGroup.position.set(pondX, 0, pondZ);

    // Pond Water
    const waterTex = TextureFactory.createWaterTexture();
    waterTex.repeat.set(4, 3);
    const waterMat = new THREE.MeshPhongMaterial({
      map: waterTex,
      color: 0x2e6b52,
      shininess: 60,
      transparent: true,
      opacity: 0.92
    });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(pondW, pondD), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -1.1, 0);
    pondGroup.add(water);

    this.waterMesh = water;
    this.waterMeshes.push(water);

    // Pond Earthen Sloped Banks
    const bankMat = new THREE.MeshLambertMaterial({ color: 0x3d3022 });
    const bankH = 1.3;

    // 4 Bank Slopes
    const nBank = new THREE.Mesh(new THREE.BoxGeometry(pondW + 4, bankH, 2.5), bankMat);
    nBank.position.set(0, -0.6, -pondD / 2 - 1.2);
    pondGroup.add(nBank);

    const sBank = new THREE.Mesh(new THREE.BoxGeometry(pondW + 4, bankH, 2.5), bankMat);
    sBank.position.set(0, -0.6, pondD / 2 + 1.2);
    pondGroup.add(sBank);

    const wBank = new THREE.Mesh(new THREE.BoxGeometry(2.5, bankH, pondD), bankMat);
    wBank.position.set(-pondW / 2 - 1.2, -0.6, 0);
    pondGroup.add(wBank);

    const eBank = new THREE.Mesh(new THREE.BoxGeometry(2.5, bankH, pondD), bankMat);
    eBank.position.set(pondW / 2 + 1.2, -0.6, 0);
    pondGroup.add(eBank);

    // Wooden/Bamboo Village Ghat (পুকুর ঘাট) on East bank
    const ghatMat = new THREE.MeshLambertMaterial({ color: 0x6e5238 });
    const ghatGroup = new THREE.Group();
    ghatGroup.position.set(pondW / 2 - 2, 0, 0);

    // 4 Stepped Slabs
    for (let i = 0; i < 4; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.25, 4.2), ghatMat);
      step.position.set(-i * 1.1, -i * 0.28, 0);
      step.receiveShadow = true;
      ghatGroup.add(step);
    }

    // Bamboo guard poles at ghat sides
    const poleMat = new THREE.MeshLambertMaterial({ color: 0xa89356 });
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 5);
    for (let pz of [-2.0, 2.0]) {
      const pole1 = new THREE.Mesh(poleGeo, poleMat);
      pole1.position.set(0.5, 0.8, pz);
      ghatGroup.add(pole1);

      const pole2 = new THREE.Mesh(poleGeo, poleMat);
      pole2.position.set(-3.2, 0.2, pz);
      ghatGroup.add(pole2);
    }

    pondGroup.add(ghatGroup);

    // Green Lily Pad clusters (শাপলা পাতা)
    const lilyMat = new THREE.MeshLambertMaterial({ color: 0x22733c });
    for (let l = 0; l < 8; l++) {
      const lx = (Math.random() - 0.5) * (pondW - 6);
      const lz = (Math.random() - 0.5) * (pondD - 6);
      const lily = new THREE.Mesh(new THREE.CircleGeometry(0.7, 7), lilyMat);
      lily.rotation.x = -Math.PI / 2;
      lily.position.set(lx, -1.06, lz);
      pondGroup.add(lily);
    }

    parent.add(pondGroup);

    // Colliders to prevent falling into deep water basin boundaries
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(pondX - pondW / 2, -2, pondZ - pondD / 2),
      new THREE.Vector3(pondX + pondW / 2 - 4, 0.2, pondZ + pondD / 2)
    ));
  },

  // ================= 5. RURAL HOMESTEADS (গ্রামের বাড়ি ও উঠান) =================
  createHomesteads: function(parent) {
    // Canvas Mud Wall Texture with authentic clay/straw texture (মাটির দেয়াল)
    const mudCanvas = document.createElement('canvas');
    mudCanvas.width = 256;
    mudCanvas.height = 256;
    const mCtx = mudCanvas.getContext('2d');
    mCtx.fillStyle = '#a68f76';
    mCtx.fillRect(0, 0, 256, 256);
    // Mud texture grain
    for (let i = 0; i < 2000; i++) {
      const mx = Math.random() * 256;
      const my = Math.random() * 256;
      mCtx.fillStyle = Math.random() > 0.5 ? 'rgba(120, 95, 75, 0.3)' : 'rgba(195, 175, 150, 0.4)';
      mCtx.fillRect(mx, my, 3, 3);
    }
    // Straw fibers
    mCtx.strokeStyle = 'rgba(215, 185, 120, 0.4)';
    mCtx.lineWidth = 1;
    for (let j = 0; j < 30; j++) {
      mCtx.beginPath();
      const sx = Math.random() * 256;
      const sy = Math.random() * 256;
      mCtx.moveTo(sx, sy);
      mCtx.lineTo(sx + (Math.random() - 0.5) * 20, sy + Math.random() * 15);
      mCtx.stroke();
    }
    const mudTex = new THREE.CanvasTexture(mudCanvas);

    // Weathered Red Brick Wall Texture for half-brick houses
    const brickCanvas = document.createElement('canvas');
    brickCanvas.width = 256;
    brickCanvas.height = 256;
    const brCtx = brickCanvas.getContext('2d');
    brCtx.fillStyle = '#9e4b38';
    brCtx.fillRect(0, 0, 256, 256);
    brCtx.strokeStyle = '#632e22';
    brCtx.lineWidth = 1.5;
    for (let y = 0; y < 256; y += 14) {
      brCtx.beginPath();
      brCtx.moveTo(0, y);
      brCtx.lineTo(256, y);
      brCtx.stroke();
      const off = (y / 14) % 2 === 0 ? 0 : 16;
      for (let x = off; x < 256; x += 32) {
        brCtx.beginPath();
        brCtx.moveTo(x, y);
        brCtx.lineTo(x, y + 14);
        brCtx.stroke();
      }
    }
    const ruralBrickTex = new THREE.CanvasTexture(brickCanvas);

    // HOMESTEAD 1 (South Village Compound - মাটির দেয়াল ও চারচালা টিনের চাল)
    this.createRuralHouse(parent, {
      x: -25, z: 54, w: 10, d: 8, h: 3.5,
      wallTex: mudTex,
      roofType: 'tin_4chala',
      hasVeranda: true,
      doorSide: 'north'
    });
    // Courtyard haystack
    this.createHaystack(parent, -16, 46, 1.1);
    // Bamboo Granary (ধানের গোলা)
    this.createGrainSilo(parent, -34, 46);
    // Woven Bamboo Fence around yard
    this.createBambooFence(parent, -38, 40, 22, 'z');
    this.createBambooFence(parent, -27, 30, 22, 'x');

    // HOMESTEAD 2 (Northwest Compound - উন্নত গ্রামীণ বাড়ি - IMPROVED AUTHENTIC RURAL HOUSE)
    this.createAuthenticRuralHouse(parent, {
      x: -36, z: -52, w: 10.6, d: 7.8, h: 3.4,
      hasCourtyard: true
    });
    // Cattle Shed (গোয়ালঘর)
    this.createCowshed(parent, -24, -54);
    // Yard haystack
    this.createHaystack(parent, -23, -42, 0.95);
    // Brick boundary wall
    this.createBrickBoundaryWall(parent, -44, -38, 16, 'x');

    // HOMESTEAD 3 (East Compound - ঐতিহ্যবাহী মাটির বাড়ি)
    this.createRuralHouse(parent, {
      x: 46, z: -56, w: 9.5, d: 7.5, h: 3.4,
      wallTex: mudTex,
      roofType: 'tin_gable',
      hasVeranda: true,
      doorSide: 'south'
    });
    this.createHaystack(parent, 36, -56, 1.0);
    this.createBambooFence(parent, 34, -46, 18, 'x');

    // HOMESTEAD 4 (Southeast Pucca Brick House - দোতলা পাকা বাড়ি)
    this.createPuccaBrickHouse(parent, 52, 46, 11, 10, 5.8);

    // ================= 14 ADDITIONAL RURAL BANGLADESH HOUSES (নতুন গ্রামীণ বসতবাড়ি) =================
    // Naturally distributed along village roads and clustered in homesteads

    // NORTH VILLAGE ENTRANCE (উত্তর পাড়া মেঠো সড়কপাড়ের বাড়ি)
    // House 1: West of North Road (Facing East towards entrance road)
    this.createAuthenticRuralHouse(parent, {
      x: -16, z: -56, w: 8.5, d: 6.2, h: 3.2, rotY: Math.PI / 2, wallType: 'mud'
    });
    // House 2: West of North Road closer to Chowrasta
    this.createAuthenticRuralHouse(parent, {
      x: -22, z: -32, w: 7.8, d: 5.8, h: 3.1, rotY: Math.PI / 2, wallType: 'brick'
    });
    // House 3: East of North Road (Facing West towards entrance road)
    this.createAuthenticRuralHouse(parent, {
      x: 18, z: -54, w: 8.8, d: 6.4, h: 3.3, rotY: -Math.PI / 2, wallType: 'mud'
    });
    // House 4: East of North Road, roadside dwelling
    this.createAuthenticRuralHouse(parent, {
      x: 24, z: -38, w: 7.5, d: 5.6, h: 3.0, rotY: -Math.PI / 2, wallType: 'brick'
    });

    // NORTHWEST HOMESTEAD 2 EXTENSION (উত্তর-পশ্চিম যৌথ বাড়ি)
    // House 5: North annex house forming the extended family courtyard
    this.createAuthenticRuralHouse(parent, {
      x: -26, z: -66, w: 7.5, d: 5.6, h: 3.0, rotY: 0, wallType: 'mud'
    });
    // House 6: West dwelling facing the central courtyard
    this.createAuthenticRuralHouse(parent, {
      x: -48, z: -42, w: 8.0, d: 6.0, h: 3.1, rotY: -Math.PI / 2, wallType: 'brick'
    });

    // WEST VILLAGE & PONDSIDE SETTLEMENT (পশ্চিম আবালপুর ও পুকুরপাড়)
    // House 7: West Road North side (Facing South towards road)
    this.createAuthenticRuralHouse(parent, {
      x: -36, z: -22, w: 8.4, d: 6.2, h: 3.2, rotY: 0, wallType: 'mud'
    });
    // House 8: West Road South side (Facing North towards road)
    this.createAuthenticRuralHouse(parent, {
      x: -38, z: -2, w: 8.2, d: 6.0, h: 3.1, rotY: Math.PI, wallType: 'brick'
    });
    // House 9: North bank of pond, rural dwelling
    this.createAuthenticRuralHouse(parent, {
      x: -58, z: -2, w: 7.8, d: 5.8, h: 3.0, rotY: Math.PI, wallType: 'mud'
    });

    // SOUTH VILLAGE ROAD & CULVERT SECTOR (দক্ষিণ সড়ক ও কালভার্ট পাড়া)
    // House 10: West of South Road near culvert crossing
    this.createAuthenticRuralHouse(parent, {
      x: -16, z: 8, w: 8.2, d: 6.2, h: 3.2, rotY: Math.PI / 2, wallType: 'mud'
    });
    // House 11: East of South Road near culvert crossing
    this.createAuthenticRuralHouse(parent, {
      x: 22, z: 6, w: 8.6, d: 6.4, h: 3.2, rotY: -Math.PI / 2, wallType: 'brick'
    });
    // House 12: East of South Road, southern homestead
    this.createAuthenticRuralHouse(parent, {
      x: 26, z: 32, w: 8.0, d: 6.0, h: 3.1, rotY: -Math.PI / 2, wallType: 'mud'
    });

    // SOUTHWEST HOMESTEAD 1 EXTENSION (দক্ষিণ মাটির বাড়ির উঠান)
    // House 13: Secondary family house forming courtyard with Homestead 1
    this.createAuthenticRuralHouse(parent, {
      x: -38, z: 62, w: 8.0, d: 6.0, h: 3.1, rotY: 0, wallType: 'brick'
    });

    // EAST VILLAGE ROAD SECTOR (পূর্ব আবালপুর মেঠো পথ)
    // House 14: South of East Road
    this.createAuthenticRuralHouse(parent, {
      x: 36, z: 2, w: 8.2, d: 6.0, h: 3.1, rotY: Math.PI, wallType: 'mud'
    });
  },

  // ================= 5b. VILLAGE SURROUNDINGS & COURTYARD DETAILS =================
  // Classic rural Bangladesh details: Tube wells, brick piles, bamboo trellises,
  // earthen courtyards, haystacks, fences, palms, banana clusters, and beaten footpaths.

  // Authentic Rural Tube Well (নলকূপ / চাপকল)
  createTubeWell: function(parent, x, z) {
    const twGroup = new THREE.Group();
    twGroup.position.set(x, 0, z);

    // 1. Raised concrete platform base (পাকা পাটাতন)
    const baseGeo = new THREE.BoxGeometry(2.0, 0.16, 2.0);
    const baseMesh = new THREE.Mesh(baseGeo, this.sharedMats.cementPlatform);
    baseMesh.position.set(0, 0.08, 0);
    baseMesh.receiveShadow = true;
    twGroup.add(baseMesh);

    // Wet puddle stain on platform
    const wetMat = new THREE.MeshLambertMaterial({ color: 0x223d2b });
    const wetPatch = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), wetMat);
    wetPatch.rotation.x = -Math.PI / 2;
    wetPatch.position.set(0, 0.165, 0.2);
    twGroup.add(wetPatch);

    // 2. Cast-iron vertical cylinder pump body (সবুজ রঙের চাপকলের বডি)
    const bodyGeo = new THREE.CylinderGeometry(0.1, 0.11, 1.05, 8);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.sharedMats.tubeWellGreen);
    bodyMesh.position.set(0, 0.68, 0);
    bodyMesh.castShadow = true;
    twGroup.add(bodyMesh);

    // Pump head cap
    const capGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.14, 8);
    const capMesh = new THREE.Mesh(capGeo, this.sharedMats.tubeWellGreen);
    capMesh.position.set(0, 1.25, 0);
    twGroup.add(capMesh);

    // 3. Iron pump lever arm & wooden grip (চাপকলের হাতল)
    const handleArm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.72), this.sharedMats.tubeWellIron);
    handleArm.position.set(0, 1.15, -0.36);
    handleArm.rotation.x = 0.28;
    twGroup.add(handleArm);

    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 6), this.sharedMats.trellisBamboo);
    grip.position.set(0, 1.25, -0.7);
    grip.rotation.z = Math.PI / 2;
    twGroup.add(grip);

    // 4. Water Spout (পানি পড়ার নল)
    const spoutGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.32, 6);
    const spoutMesh = new THREE.Mesh(spoutGeo, this.sharedMats.tubeWellIron);
    spoutMesh.rotation.x = Math.PI / 2;
    spoutMesh.position.set(0, 0.62, 0.22);
    twGroup.add(spoutMesh);

    parent.add(twGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.0, 0, z - 1.0),
      new THREE.Vector3(x + 1.0, 1.4, z + 1.0)
    ));
  },

  // Small Rural Brick Pile (ইটের স্তূপ / গাঁথুনির ইট)
  createBrickPile: function(parent, x, z, rotY = 0) {
    const bpGroup = new THREE.Group();
    bpGroup.position.set(x, 0, z);
    bpGroup.rotation.y = rotY;

    // Stack base
    const baseGeo = new THREE.BoxGeometry(1.5, 0.55, 1.1);
    const baseMesh = new THREE.Mesh(baseGeo, this.sharedMats.redBrick);
    baseMesh.position.set(0, 0.275, 0);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    bpGroup.add(baseMesh);

    // Stepped upper layer
    const topGeo = new THREE.BoxGeometry(1.0, 0.22, 0.8);
    const topMesh = new THREE.Mesh(topGeo, this.sharedMats.redBrick);
    topMesh.position.set(-0.15, 0.66, 0.05);
    topMesh.castShadow = true;
    bpGroup.add(topMesh);

    parent.add(bpGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.8, 0, z - 0.6),
      new THREE.Vector3(x + 0.8, 0.8, z + 0.6)
    ));
  },

  // Bamboo Vegetable Trellis & Drying Rack (শাকসবজির মাচা / বাঁশের খুঁটি)
  createBambooTrellis: function(parent, x, z, rotY = 0) {
    const trGroup = new THREE.Group();
    trGroup.position.set(x, 0, z);
    trGroup.rotation.y = rotY;

    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 5);
    const postPositions = [[-0.8, -0.6], [0.8, -0.6], [-0.8, 0.6], [0.8, 0.6]];
    postPositions.forEach(([px, pz]) => {
      const post = new THREE.Mesh(postGeo, this.sharedMats.trellisBamboo);
      post.position.set(px, 0.8, pz);
      trGroup.add(post);
    });

    // Horizontal bamboo framing
    const rackGeo = new THREE.BoxGeometry(1.7, 0.06, 1.3);
    const rack = new THREE.Mesh(rackGeo, this.sharedMats.trellisBamboo);
    rack.position.set(0, 1.55, 0);
    trGroup.add(rack);

    // Green creeper vines / gourd leaves on trellis (লাউ/কুমড়ার মাচা)
    const foliageGeo = new THREE.BoxGeometry(1.65, 0.18, 1.25);
    const foliage = new THREE.Mesh(foliageGeo, this.sharedMats.creeperLeaf);
    foliage.position.set(0, 1.65, 0);
    foliage.castShadow = true;
    trGroup.add(foliage);

    parent.add(trGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.9, 0, z - 0.7),
      new THREE.Vector3(x + 0.9, 1.8, z + 0.7)
    ));
  },

  // Smoothed Earthen Courtyard Ground Patch (লেপা মাটির উঠান)
  createEarthenCourtyardPatch: function(parent, x, z, w, d) {
    const yardMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.sharedMats.earthenYard);
    yardMesh.rotation.x = -Math.PI / 2;
    yardMesh.position.set(x, 0.012, z);
    yardMesh.receiveShadow = true;
    parent.add(yardMesh);
  },

  // Narrow Earthen Connecting Footpath (মেঠো আলপথ)
  createEarthenPath: function(parent, x1, z1, x2, z2, width = 1.6) {
    const cx = (x1 + x2) / 2;
    const cz = (z1 + z2) / 2;
    const len = Math.hypot(x2 - x1, z2 - z1);
    const angle = Math.atan2(x2 - x1, z2 - z1);

    const pathMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, len), this.sharedMats.earthenDirt);
    pathMesh.rotation.x = -Math.PI / 2;
    pathMesh.rotation.z = angle;
    pathMesh.position.set(cx, 0.015, cz);
    pathMesh.receiveShadow = true;
    parent.add(pathMesh);
  },

  // Traditional Rural Paddy Granary on Stilts (ধানের গোলা)
  createFarmGranary: function(parent, x, z) {
    const granaryGroup = new THREE.Group();
    granaryGroup.position.set(x, 0, z);

    // 4 Concrete / Timber Stilt Posts
    const stiltMat = new THREE.MeshLambertMaterial({ color: 0x6e6255 });
    const stiltGeo = new THREE.CylinderGeometry(0.12, 0.14, 1.2, 6);
    const postCoords = [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]];
    postCoords.forEach(([px, pz]) => {
      const post = new THREE.Mesh(stiltGeo, stiltMat);
      post.position.set(px, 0.6, pz);
      post.castShadow = true;
      granaryGroup.add(post);
    });

    // Circular Bamboo-woven Storehouse Body
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x9b7a48 });
    const bodyGeo = new THREE.CylinderGeometry(1.35, 1.1, 2.2, 10);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 2.3, 0);
    body.castShadow = true;
    granaryGroup.add(body);

    // Conical Thatched / Tin Roof
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x7c5e38 });
    const roofGeo = new THREE.ConeGeometry(1.8, 1.4, 10);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 4.1, 0);
    roof.castShadow = true;
    granaryGroup.add(roof);

    parent.add(granaryGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.2, 0, z - 1.2),
      new THREE.Vector3(x + 1.2, 4.6, z + 1.2)
    ));
  },

  // Agricultural Irrigation Shallow-Pump Hut (স্যালো মেশিন ঘর)
  createIrrigationPumpHut: function(parent, x, z) {
    const hutGroup = new THREE.Group();
    hutGroup.position.set(x, 0, z);

    // 4 Bamboo Corner Posts
    const postMat = new THREE.MeshLambertMaterial({ color: 0x8a7248 });
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 5);
    const postPositions = [[-1.2, -1.0], [1.2, -1.0], [-1.2, 1.0], [1.2, 1.0]];
    postPositions.forEach(([px, pz]) => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(px, 1.1, pz);
      hutGroup.add(post);
    });

    // Low Half-wall corrugated tin skirt
    const tinMat = new THREE.MeshLambertMaterial({ color: 0x6e7880 });
    const skirtGeo = new THREE.BoxGeometry(2.5, 0.9, 2.1);
    const skirt = new THREE.Mesh(skirtGeo, tinMat);
    skirt.position.set(0, 0.45, 0);
    skirt.castShadow = true;
    hutGroup.add(skirt);

    // Slanted Tin Roof
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x805445 });
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.4), roofMat);
    roof.rotation.x = -Math.PI / 2 + 0.18;
    roof.position.set(0, 2.2, 0);
    roof.castShadow = true;
    hutGroup.add(roof);

    // Cast-iron Diesel Pump Engine Block inside
    const engineMat = new THREE.MeshLambertMaterial({ color: 0x24422e });
    const engine = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.6), engineMat);
    engine.position.set(0, 0.6, 0);
    hutGroup.add(engine);

    // Irrigation PVC discharge pipe leading into rice field
    const pipeMat = new THREE.MeshLambertMaterial({ color: 0x225588 });
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 6), pipeMat);
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(0, 0.35, 1.8);
    hutGroup.add(pipe);

    parent.add(hutGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.3, 0, z - 1.1),
      new THREE.Vector3(x + 1.3, 2.3, z + 1.1)
    ));
  },

  // Secondary Farm Doba / Duck Pond with Crossing Plank (ছোট ডোবা ও সাঁকো)
  createFarmDoba: function(parent, x, z, w = 18, d = 14) {
    const dobaGroup = new THREE.Group();
    dobaGroup.position.set(x, 0, z);

    // Water Surface
    const waterMat = new THREE.MeshPhongMaterial({
      color: 0x285942,
      shininess: 40,
      transparent: true,
      opacity: 0.88
    });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(w, d), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.65, 0);
    dobaGroup.add(water);
    this.waterMeshes.push(water);

    // Earthen Sloped Banks
    const bankMat = new THREE.MeshLambertMaterial({ color: 0x483a2a });
    const bankH = 0.9;
    const nBank = new THREE.Mesh(new THREE.BoxGeometry(w + 2, bankH, 1.8), bankMat);
    nBank.position.set(0, -0.4, -d / 2 - 0.9);
    dobaGroup.add(nBank);
    const sBank = new THREE.Mesh(new THREE.BoxGeometry(w + 2, bankH, 1.8), bankMat);
    sBank.position.set(0, -0.4, d / 2 + 0.9);
    dobaGroup.add(sBank);
    const wBank = new THREE.Mesh(new THREE.BoxGeometry(1.8, bankH, d), bankMat);
    wBank.position.set(-w / 2 - 0.9, -0.4, 0);
    dobaGroup.add(wBank);
    const eBank = new THREE.Mesh(new THREE.BoxGeometry(1.8, bankH, d), bankMat);
    eBank.position.set(w / 2 + 0.9, -0.4, 0);
    dobaGroup.add(eBank);

    // Duckweed / Water Hyacinth Lilies (কচুরিপানা)
    const hyacinthMat = new THREE.MeshLambertMaterial({ color: 0x2f7a38 });
    for (let h = 0; h < 6; h++) {
      const hx = (Math.sin(h * 3.7) * 0.4) * (w - 4);
      const hz = (Math.cos(h * 2.3) * 0.4) * (d - 4);
      const pad = new THREE.Mesh(new THREE.CircleGeometry(0.75, 6), hyacinthMat);
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(hx, -0.62, hz);
      dobaGroup.add(pad);
    }

    // Wooden Crossing Foot-Plank (কাঠের সাঁকো)
    const plankMat = new THREE.MeshLambertMaterial({ color: 0x6e5238 });
    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.14, d + 2), plankMat);
    plank.position.set(0, 0.1, 0);
    plank.castShadow = true;
    dobaGroup.add(plank);

    parent.add(dobaGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - w / 2, -1.5, z - d / 2),
      new THREE.Vector3(x + w / 2, 0.1, z + d / 2)
    ));
  },

  // Master surrounding environment populator for village homesteads
  createVillageSurroundings: function(parent) {
    // 1. SIMPLE TUBE WELLS (টিউবওয়েল / চাপকল) in village courtyards
    this.createTubeWell(parent, -28, -40); // Northwest Bari common yard
    this.createTubeWell(parent, 12, -47);  // North Road East courtyard
    this.createTubeWell(parent, -18, 42);  // Homestead 1 South courtyard
    this.createTubeWell(parent, -48, -4);  // West Road & Pondside courtyard
    this.createTubeWell(parent, -10, 18);  // South Road Culvert courtyard
    this.createTubeWell(parent, 38, -62);  // Homestead 3 courtyard
    this.createTubeWell(parent, 32, 28);   // South Para courtyard

    // 2. SMALL BRICK PILES (ইটের স্তূপ) near houses under repair/construction
    this.createBrickPile(parent, -20, -27, 0.2);   // Near House 2
    this.createBrickPile(parent, 22, -44, -0.3);   // Near House 4
    this.createBrickPile(parent, -42, -60, 0.1);   // Northwest Bari
    this.createBrickPile(parent, -32, -4, 0.4);    // West Road House
    this.createBrickPile(parent, 44, 42, -0.2);    // Southeast Pucca House
    this.createBrickPile(parent, -32, 64, 0);      // Homestead 1
    this.createBrickPile(parent, 36, -52, 0.15);   // Homestead 3
    this.createBrickPile(parent, -14, 28, -0.2);   // South Road
    this.createBrickPile(parent, 62, -18, 0.3);    // East path

    // 3. BAMBOO VEGETABLE TRELLISES & POLES (শাকসবজির মাচা ও বাঁশের খুঁটি)
    this.createBambooTrellis(parent, -20, -50, 0);     // North Para West
    this.createBambooTrellis(parent, 32, 7, 0.3);      // East Roadside House
    this.createBambooTrellis(parent, 44, -48, -0.2);   // Homestead 3
    this.createBambooTrellis(parent, 24, 26, 0.1);     // South Para

    // 4. BAMBOO FENCES AROUND COURTYARDS (বাঁশের বেড়া)
    this.createBambooFence(parent, -24, -62, 12, 'z'); // North Para West backyard fence
    this.createBambooFence(parent, 25, -60, 14, 'z');  // North Para East lot fence
    this.createBambooFence(parent, -53, -50, 14, 'z'); // Northwest Bari rear compound fence
    this.createBambooFence(parent, -65, -8, 16, 'x');  // Behind West Road houses
    this.createBambooFence(parent, 28, 24, 10, 'z');   // Beside South Road House 12
    this.createBambooFence(parent, 45, 52, 14, 'x');   // Behind Homestead 4
    this.createBambooFence(parent, 52, -44, 12, 'x');  // Homestead 3 lot boundary
    this.createBambooFence(parent, -20, 36, 10, 'z');  // South lane cover fence
    this.createBambooFence(parent, 70, -20, 14, 'z');  // East fields boundary fence

    // 5. HAY & STRAW STACKS (খড়ের গাদা)
    this.createHaystack(parent, -16, -68, 0.85); // Near North Road House 1
    this.createHaystack(parent, 25, -62, 0.85);  // Near North Road House 3
    this.createHaystack(parent, -44, -64, 0.8);  // In Northwest Bari
    this.createHaystack(parent, 28, 40, 0.9);    // Near South Para House 12
    this.createHaystack(parent, -46, -18, 0.85); // West Road Dwelling
    this.createHaystack(parent, 48, -58, 0.9);   // Near Homestead 3
    this.createHaystack(parent, -36, 68, 0.85);  // Near Homestead 1
    this.createHaystack(parent, 68, -12, 0.85);  // Near East Fields

    // 5B. RURAL PADDY GRANARIES (ধানের গোলা)
    this.createFarmGranary(parent, -40, -68); // Northwest Bari Granary
    this.createFarmGranary(parent, 30, -58);  // North Para East Granary
    this.createFarmGranary(parent, -22, 62);  // Homestead 1 Granary

    // 5C. IRRIGATION SHALLOW-PUMP HUTS (স্যালো মেশিন ঘর)
    this.createIrrigationPumpHut(parent, 74, -28); // East Paddy Fields Pump Hut
    this.createIrrigationPumpHut(parent, 28, 56);  // South Fields Pump Hut

    // 5D. SECONDARY DUCK POND / DOBA (ছোট ডোবা ও সাঁকো)
    this.createFarmDoba(parent, 58, -26, 16, 12); // East Field Doba with plank bridge

    // 6. BANANA PLANTS NEAR HOUSES (বাড়ির পাশের কলা গাছ)
    this.createBananaCluster(parent, -22, -60); // Beside House 1
    this.createBananaCluster(parent, -26, -34); // Behind House 2
    this.createBananaCluster(parent, 27, -42);  // Behind House 4
    this.createBananaCluster(parent, -53, -40); // Behind Northwest House 6
    this.createBananaCluster(parent, -42, -18); // Behind West Road House
    this.createBananaCluster(parent, -20, 4);   // Beside South Road House
    this.createBananaCluster(parent, -42, 66);  // Near Homestead 1

    // 7. COCONUT & PALM TREES NEAR HOUSES (বাড়ির নারিকেল গাছ)
    this.createCoconutPalm(parent, -18, -66); // Garden north of House 1 (clear of cowshed)
    this.createCoconutPalm(parent, 26, -50);  // Beside East North Para House
    this.createCoconutPalm(parent, -32, -72); // Behind Northwest Bari
    this.createCoconutPalm(parent, 28, 12);   // Near South Para House
    this.createCoconutPalm(parent, 42, 4);    // Behind East Roadside House

    // 8. SMALL DIRT COURTYARDS (লেপা মাটির উঠান)
    this.createEarthenCourtyardPatch(parent, -13, -56, 6, 8);   // North Para West Yard
    this.createEarthenCourtyardPatch(parent, 15, -54, 6, 8);    // North Para East Yard
    this.createEarthenCourtyardPatch(parent, -36, -58, 12, 12); // Northwest Bari Common Yard
    this.createEarthenCourtyardPatch(parent, -36, -18, 8, 6);   // West Village Yard
    this.createEarthenCourtyardPatch(parent, -56, 4, 8, 6);     // Pondside Dwelling Yard
    this.createEarthenCourtyardPatch(parent, 20, 8, 8, 7);      // South Road Para Yard
    this.createEarthenCourtyardPatch(parent, -30, 58, 10, 10);  // Southwest Homestead 1 Yard
    this.createEarthenCourtyardPatch(parent, 36, 6, 8, 6);      // East Roadside Yard

    // 9. NARROW EARTHEN FOOTPATHS (মেঠো আলপথ) connecting houses to village roads
    this.createEarthenPath(parent, -12, -56, -3.2, -56, 1.5); // North West House to North Road
    this.createEarthenPath(parent, 14, -54, 3.2, -54, 1.5);   // North East House to North Road
    this.createEarthenPath(parent, -26, -48, -3.2, -48, 1.6); // Northwest Bari to North Road
    this.createEarthenPath(parent, -36, -18, -36, -13, 1.6);  // West Road House to West Road
    this.createEarthenPath(parent, -58, 4, -50, 5, 1.5);      // Pondside Dwelling to Pond Alley
    this.createEarthenPath(parent, -12, 8, -3.2, 8, 1.5);     // South West House to South Road
    this.createEarthenPath(parent, 18, 6, 3.2, 6, 1.5);       // South East House to South Road
    this.createEarthenPath(parent, -22, 54, -20, 48, 1.6);    // Homestead 1 to Alley

    // 10. PATCHES OF GRASS TUFTS around house bases and fences
    const grassSpots = [
      [-19, -58], [-13, -53], [16, -57], [22, -36],
      [-38, -64], [-46, -40], [-34, -24], [-40, 0],
      [-56, 1], [-18, 10], [24, 4], [24, 34],
      [-36, 60], [38, 0], [44, -54], [50, 44]
    ];
    grassSpots.forEach(([gx, gz]) => {
      const tuft = new THREE.Mesh(this.sharedGeos.grassTuft, this.sharedMats.groundGrass);
      tuft.position.set(gx, 0.22, gz);
      tuft.scale.set(1.1, 1.2, 1.1);
      parent.add(tuft);
    });
  },

  // Generic Rural House with 4-Chala or Gable Corrugated Tin Roof & Veranda
  createRuralHouse: function(parent, config) {
    const house = new THREE.Group();
    house.position.set(config.x, 0, config.z);

    const wallMat = new THREE.MeshLambertMaterial({ map: config.wallTex });
    const tinMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createTinRoofTexture()
    });

    // Main structural box (Plinth & walls)
    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(config.w, config.h, config.d), wallMat);
    bMesh.position.set(0, config.h / 2, 0);
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    house.add(bMesh);

    // Front Veranda (বারান্দা)
    if (config.hasVeranda) {
      const vDepth = 2.4;
      const vZ = config.doorSide === 'north' ? -config.d / 2 - vDepth / 2 : config.d / 2 + vDepth / 2;
      const vBase = new THREE.Mesh(new THREE.BoxGeometry(config.w, 0.4, vDepth), wallMat);
      vBase.position.set(0, 0.2, vZ);
      house.add(vBase);

      // Veranda Wooden Posts
      const postMat = new THREE.MeshLambertMaterial({ color: 0x4a3424 });
      const postGeo = new THREE.BoxGeometry(0.18, config.h * 0.85, 0.18);
      const numPosts = 4;
      for (let i = 0; i < numPosts; i++) {
        const px = -config.w / 2 + 0.3 + (i / (numPosts - 1)) * (config.w - 0.6);
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(px, config.h * 0.45, vZ + (config.doorSide === 'north' ? -vDepth / 2 + 0.15 : vDepth / 2 - 0.15));
        house.add(post);
      }

      // Veranda low wooden bench
      const bench = new THREE.Mesh(new THREE.BoxGeometry(config.w * 0.65, 0.45, 0.6), postMat);
      bench.position.set(0, 0.4, vZ);
      house.add(bench);
    }

    // Corrugated Tin Roof
    const roofOverhang = 1.4;
    const rw = config.w + roofOverhang;
    const rd = config.d + (config.hasVeranda ? 3.8 : roofOverhang);

    if (config.roofType === 'tin_4chala') {
      // 4-chala Bengali pitched roof (চারচালা)
      const roofPeakH = 2.2;
      const roofMat = tinMat;

      // North & South main pitches
      const pitchZ = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.08, rd * 0.58), roofMat);
      pitchZ.position.set(0, config.h + roofPeakH * 0.45, -rd * 0.22);
      pitchZ.rotation.x = 0.38;
      house.add(pitchZ);

      const pitchZ2 = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.08, rd * 0.58), roofMat);
      pitchZ2.position.set(0, config.h + roofPeakH * 0.45, rd * 0.22);
      pitchZ2.rotation.x = -0.38;
      house.add(pitchZ2);
    } else {
      // Classic 2-chala Gable Tin Roof
      const rPitch1 = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.08, rd * 0.58), tinMat);
      rPitch1.position.set(0, config.h + 1.1, -rd * 0.24);
      rPitch1.rotation.x = 0.35;
      house.add(rPitch1);

      const rPitch2 = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.08, rd * 0.58), tinMat);
      rPitch2.position.set(0, config.h + 1.1, rd * 0.24);
      rPitch2.rotation.x = -0.35;
      house.add(rPitch2);
    }

    // Wooden Doors and Windows
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x3d2817 });
    const doorGeo = new THREE.BoxGeometry(1.4, 2.4, 0.1);
    const door = new THREE.Mesh(doorGeo, woodMat);
    const doorZ = config.doorSide === 'north' ? -config.d / 2 - 0.05 : config.d / 2 + 0.05;
    door.position.set(0, 1.2, doorZ);
    house.add(door);

    parent.add(house);

    // Box Collider
    const totalD = config.d + (config.hasVeranda ? 3.0 : 1.0);
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(config.x - config.w / 2 - 0.5, 0, config.z - totalD / 2),
      new THREE.Vector3(config.x + config.w / 2 + 0.5, config.h + 2.5, config.z + totalD / 2)
    ));
  },

  // Shared materials & procedural textures for rural village houses (মাটির ও ইটের দেয়াল এবং টিনের চাল)
  getHouseMaterials: function() {
    if (this._sharedHouseMats) return this._sharedHouseMats;

    // 1. Procedural Weathered Brick & Mud-Plaster Wall Texture (মাটির দেয়াল ও ইটের ভিত)
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 512;
    wallCanvas.height = 512;
    const wCtx = wallCanvas.getContext('2d');

    const mudGrad = wCtx.createLinearGradient(0, 0, 0, 368);
    mudGrad.addColorStop(0, '#856d53');
    mudGrad.addColorStop(0.5, '#785f46');
    mudGrad.addColorStop(1, '#695138');
    wCtx.fillStyle = mudGrad;
    wCtx.fillRect(0, 0, 512, 368);

    for (let i = 0; i < 2500; i++) {
      const mx = Math.random() * 512;
      const my = Math.random() * 368;
      wCtx.fillStyle = Math.random() > 0.5 ? 'rgba(150, 125, 100, 0.35)' : 'rgba(65, 45, 28, 0.4)';
      wCtx.fillRect(mx, my, Math.random() * 2 + 1, Math.random() * 2 + 1);
    }

    wCtx.lineWidth = 1.2;
    wCtx.strokeStyle = 'rgba(220, 190, 120, 0.45)';
    for (let s = 0; s < 80; s++) {
      const sx = Math.random() * 512;
      const sy = Math.random() * 360;
      wCtx.beginPath();
      wCtx.moveTo(sx, sy);
      wCtx.lineTo(sx + (Math.random() - 0.5) * 24, sy + (Math.random() - 0.2) * 14);
      wCtx.stroke();
    }

    wCtx.fillStyle = 'rgba(95, 70, 45, 0.08)';
    for (let p = 0; p < 20; p++) {
      wCtx.beginPath();
      wCtx.ellipse(Math.random() * 512, Math.random() * 360, 45 + Math.random() * 35, 10 + Math.random() * 10, Math.random() * 0.4 - 0.2, 0, Math.PI * 2);
      wCtx.fill();
    }

    const brGrad = wCtx.createLinearGradient(0, 368, 0, 512);
    brGrad.addColorStop(0, '#7a4232');
    brGrad.addColorStop(1, '#5c2f22');
    wCtx.fillStyle = brGrad;
    wCtx.fillRect(0, 368, 512, 144);

    wCtx.strokeStyle = '#857766';
    wCtx.lineWidth = 1.8;
    const brickRowH = 18;
    for (let by = 368; by < 512; by += brickRowH) {
      wCtx.beginPath();
      wCtx.moveTo(0, by);
      wCtx.lineTo(512, by);
      wCtx.stroke();
      const shift = ((by - 368) / brickRowH) % 2 === 0 ? 0 : 20;
      for (let bx = shift; bx < 512; bx += 40) {
        wCtx.beginPath();
        wCtx.moveTo(bx, by);
        wCtx.lineTo(bx, by + brickRowH);
        wCtx.stroke();
      }
    }
    const wallTex = new THREE.CanvasTexture(wallCanvas);
    const mudMat = new THREE.MeshLambertMaterial({ map: wallTex });

    // Weathered Red Brick Wall Texture for brick houses
    const brickWallCanvas = document.createElement('canvas');
    brickWallCanvas.width = 256;
    brickWallCanvas.height = 256;
    const bwCtx = brickWallCanvas.getContext('2d');
    bwCtx.fillStyle = '#8f4433';
    bwCtx.fillRect(0, 0, 256, 256);
    bwCtx.strokeStyle = '#5a271c';
    bwCtx.lineWidth = 1.6;
    for (let y = 0; y < 256; y += 14) {
      bwCtx.beginPath();
      bwCtx.moveTo(0, y);
      bwCtx.lineTo(256, y);
      bwCtx.stroke();
      const off = (y / 14) % 2 === 0 ? 0 : 16;
      for (let x = off; x < 256; x += 32) {
        bwCtx.beginPath();
        bwCtx.moveTo(x, y);
        bwCtx.lineTo(x, y + 14);
        bwCtx.stroke();
      }
    }
    const brickTex = new THREE.CanvasTexture(brickWallCanvas);
    const brickMat = new THREE.MeshLambertMaterial({ map: brickTex });

    // 2. Procedural Corrugated Tin Texture (ঢেউটিন)
    const tinCanvas = document.createElement('canvas');
    tinCanvas.width = 256;
    tinCanvas.height = 256;
    const tCtx = tinCanvas.getContext('2d');
    tCtx.fillStyle = '#7a858e';
    tCtx.fillRect(0, 0, 256, 256);

    for (let x = 0; x < 256; x++) {
      const sinVal = Math.sin((x / 16) * Math.PI * 2);
      if (sinVal > 0) {
        tCtx.fillStyle = `rgba(225, 235, 245, ${sinVal * 0.38})`;
      } else {
        tCtx.fillStyle = `rgba(18, 25, 32, ${-sinVal * 0.42})`;
      }
      tCtx.fillRect(x, 0, 1, 256);
    }

    for (let y = 64; y < 256; y += 64) {
      tCtx.fillStyle = 'rgba(20, 26, 32, 0.55)';
      tCtx.fillRect(0, y, 256, 3);
      tCtx.fillStyle = 'rgba(240, 245, 252, 0.3)';
      tCtx.fillRect(0, y + 3, 256, 1);
      for (let x = 8; x < 256; x += 16) {
        tCtx.fillStyle = '#2f373d';
        tCtx.beginPath();
        tCtx.arc(x, y - 2, 2.2, 0, Math.PI * 2);
        tCtx.fill();
        tCtx.fillStyle = 'rgba(135, 70, 35, 0.32)';
        tCtx.fillRect(x - 1, y, 2, 5);
      }
    }
    const tinTex = new THREE.CanvasTexture(tinCanvas);
    tinTex.wrapS = THREE.RepeatWrapping;
    tinTex.wrapT = THREE.RepeatWrapping;
    const tinMat = new THREE.MeshLambertMaterial({ map: tinTex, side: THREE.DoubleSide });

    // 3. Earthen Courtyard Texture (লেপা উঠান)
    const yardCanvas = document.createElement('canvas');
    yardCanvas.width = 256;
    yardCanvas.height = 256;
    const yCtx = yardCanvas.getContext('2d');
    yCtx.fillStyle = '#7a6047';
    yCtx.fillRect(0, 0, 256, 256);
    yCtx.strokeStyle = 'rgba(92, 70, 48, 0.35)';
    yCtx.lineWidth = 1;
    for (let i = 0; i < 40; i++) {
      yCtx.beginPath();
      const y = Math.random() * 256;
      yCtx.moveTo(0, y);
      yCtx.bezierCurveTo(80, y + Math.random() * 8 - 4, 170, y + Math.random() * 8 - 4, 256, y);
      yCtx.stroke();
    }
    const yardTex = new THREE.CanvasTexture(yardCanvas);
    const yardMat = new THREE.MeshLambertMaterial({ map: yardTex });

    this._sharedHouseMats = {
      mudMat,
      brickMat,
      tinMat,
      yardMat,
      woodMat: new THREE.MeshLambertMaterial({ color: 0x3d2716 }),
      darkWoodMat: new THREE.MeshLambertMaterial({ color: 0x2b1b10 }),
      bambooMat: new THREE.MeshLambertMaterial({ color: 0x6e5234 }),
      latchMat: new THREE.MeshLambertMaterial({ color: 0x1f2428 })
    };
    return this._sharedHouseMats;
  },

  // Authentically Detailed Rural Bangladesh House (ঐতিহ্যবাহী চারচালা মাটির ও ইটের ঘর)
  createAuthenticRuralHouse: function(parent, config) {
    const mats = this.getHouseMaterials();
    const house = new THREE.Group();
    house.position.set(config.x, 0, config.z);
    if (config.rotY) {
      house.rotation.y = config.rotY;
    }

    const wallMat = config.wallType === 'brick' ? mats.brickMat : mats.mudMat;
    const tinMat = mats.tinMat;
    const yardMat = mats.yardMat;
    const woodMat = mats.woodMat;
    const darkWoodMat = mats.darkWoodMat;
    const bambooMat = mats.bambooMat;
    const latchMat = mats.latchMat;

    // --- A. Slightly Raised Earthen Courtyard (উঁচু উঠান) ---
    if (config.hasCourtyard) {
      const yardGeo = new THREE.BoxGeometry(18, 0.22, 16);
      const yardMesh = new THREE.Mesh(yardGeo, yardMat);
      yardMesh.position.set(0.8, 0.11, 2.0);
      yardMesh.receiveShadow = true;
      house.add(yardMesh);
    }

    // --- B. Weathered Brick Foundation Plinth (ভিটি) ---
    const plinthH = 0.42;
    const plinthGeo = new THREE.BoxGeometry(config.w + 0.3, plinthH, config.d + 0.3);
    const plinthMesh = new THREE.Mesh(plinthGeo, wallMat);
    plinthMesh.position.set(0, plinthH / 2, 0);
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    house.add(plinthMesh);

    // --- C. Main Mud-Plaster Body (মূল মাটির ঘর) ---
    const wallH = config.h - 0.4;
    const bodyGeo = new THREE.BoxGeometry(config.w, wallH, config.d);
    const bodyMesh = new THREE.Mesh(bodyGeo, wallMat);
    bodyMesh.position.set(0, plinthH + wallH / 2, 0);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    house.add(bodyMesh);

    // --- D. Front Veranda (খোলা বারান্দা ও দাওয়া) ---
    const vDepth = 2.2;
    const vFloorGeo = new THREE.BoxGeometry(config.w + 0.3, plinthH, vDepth);
    const vFloor = new THREE.Mesh(vFloorGeo, wallMat);
    vFloor.position.set(0, plinthH / 2, config.d / 2 + vDepth / 2);
    vFloor.receiveShadow = true;
    house.add(vFloor);

    // Veranda Bamboo / Wooden Support Posts (খুঁটি)
    const numPosts = 4;
    const postZ = config.d / 2 + vDepth - 0.15;
    const postGeo = new THREE.CylinderGeometry(0.08, 0.09, wallH - 0.2, 8);
    for (let i = 0; i < numPosts; i++) {
      const px = -config.w / 2 + 0.5 + (i / (numPosts - 1)) * (config.w - 1.0);
      const post = new THREE.Mesh(postGeo, bambooMat);
      post.position.set(px, plinthH + (wallH - 0.2) / 2, postZ);
      post.castShadow = true;
      house.add(post);

      // Bamboo ring nodes (বাঁশের গিট)
      for (let k = 0; k < 3; k++) {
        const ringGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.04, 8);
        const ring = new THREE.Mesh(ringGeo, darkWoodMat);
        ring.position.set(px, plinthH + 0.6 + k * 0.7, postZ);
        house.add(ring);
      }
    }

    // Veranda Wooden Header Lintel Beam (চালের কড়ি)
    const lintelGeo = new THREE.BoxGeometry(config.w + 0.4, 0.14, 0.16);
    const lintel = new THREE.Mesh(lintelGeo, woodMat);
    lintel.position.set(0, plinthH + wallH - 0.25, postZ);
    lintel.castShadow = true;
    house.add(lintel);

    // Veranda Traditional Wooden Bench / Ledge (দাওয়া)
    const benchGeo = new THREE.BoxGeometry(config.w * 0.75, 0.44, 0.55);
    const bench = new THREE.Mesh(benchGeo, woodMat);
    bench.position.set(0, plinthH + 0.22, config.d / 2 + vDepth * 0.7);
    bench.castShadow = true;
    bench.receiveShadow = true;
    house.add(bench);

    // --- E. Simple Wooden Plank Door (কাঠের দরজা) ---
    const doorW = 1.35;
    const doorH = 2.25;
    const doorFrontZ = config.d / 2 + 0.06;

    // Doorframe (চৌকাঠ)
    const frameGeo = new THREE.BoxGeometry(doorW + 0.2, doorH + 0.12, 0.14);
    const frame = new THREE.Mesh(frameGeo, darkWoodMat);
    frame.position.set(0, plinthH + doorH / 2, doorFrontZ - 0.02);
    house.add(frame);

    // Door Panel (পাল্লা)
    const doorGeo = new THREE.BoxGeometry(doorW, doorH, 0.08);
    const door = new THREE.Mesh(doorGeo, woodMat);
    door.position.set(0, plinthH + doorH / 2, doorFrontZ + 0.01);
    door.castShadow = true;
    house.add(door);

    // Door iron latch (খিল ও ছিটকিনি)
    const latchGeo = new THREE.BoxGeometry(0.3, 0.06, 0.04);
    const latch = new THREE.Mesh(latchGeo, latchMat);
    latch.position.set(0.18, plinthH + doorH * 0.48, doorFrontZ + 0.06);
    house.add(latch);

    // --- F. 2 Realistic Windows with Wooden Bars & Open Shutters (কাঠের জানালা) ---
    const winW = 1.15;
    const winH = 1.15;
    const winY = plinthH + 1.55;
    const winOffsets = [-config.w * 0.28, config.w * 0.28];

    winOffsets.forEach((wx) => {
      // Window frame
      const wFrameGeo = new THREE.BoxGeometry(winW + 0.18, winH + 0.18, 0.14);
      const wFrame = new THREE.Mesh(wFrameGeo, darkWoodMat);
      wFrame.position.set(wx, winY, doorFrontZ - 0.02);
      house.add(wFrame);

      // Window dark recess
      const wBackGeo = new THREE.BoxGeometry(winW, winH, 0.08);
      const wBack = new THREE.Mesh(wBackGeo, darkWoodMat);
      wBack.position.set(wx, winY, doorFrontZ - 0.01);
      house.add(wBack);

      // Wooden safety bars (কাঠের শিক / গরাদ)
      const barGeo = new THREE.CylinderGeometry(0.018, 0.018, winH - 0.1, 6);
      for (let bx = -winW / 2 + 0.22; bx <= winW / 2 - 0.2; bx += 0.24) {
        const bar = new THREE.Mesh(barGeo, woodMat);
        bar.position.set(wx + bx, winY, doorFrontZ + 0.02);
        house.add(bar);
      }

      // Open outward shutters (খোলা কাঠের পাল্লা)
      const shutterW = winW * 0.52;
      const shutterGeo = new THREE.BoxGeometry(shutterW, winH, 0.035);

      const shutterLeft = new THREE.Mesh(shutterGeo, woodMat);
      shutterLeft.position.set(wx - winW / 2 - shutterW * 0.35, winY, doorFrontZ + 0.18);
      shutterLeft.rotation.y = -0.55;
      shutterLeft.castShadow = true;
      house.add(shutterLeft);

      const shutterRight = new THREE.Mesh(shutterGeo, woodMat);
      shutterRight.position.set(wx + winW / 2 + shutterW * 0.35, winY, doorFrontZ + 0.18);
      shutterRight.rotation.y = 0.55;
      shutterRight.castShadow = true;
      house.add(shutterRight);
    });

    // --- G. Corrugated Four-Slope Tin Roof with Ridge Detail (চারচালা টিনের চাল) ---
    const roofOverhang = 0.85;
    const rW = config.w + roofOverhang * 2;
    const rD = config.d + roofOverhang * 2;
    const rPeakH = 2.0;
    const ridgeL = Math.max(2.2, config.w * 0.38); // Horizontal top ridge length along X
    const baseY = plinthH + wallH;

    const hw = rW / 2;
    const hd = rD / 2;
    const hl = ridgeL / 2;

    // 6 Roof Vertex Coordinates
    const vSW = [-hw, baseY, hd];
    const vSE = [hw, baseY, hd];
    const vNE = [hw, baseY, -hd];
    const vNW = [-hw, baseY, -hd];
    const vRL = [-hl, baseY + rPeakH, 0];
    const vRR = [hl, baseY + rPeakH, 0];

    // 4-Chala Roof Vertices (12 Triangles = 6 faces for DoubleSide)
    const positions = new Float32Array([
      // South Pitch (Front Slope facing veranda)
      ...vSW, ...vSE, ...vRR,
      ...vSW, ...vRR, ...vRL,
      // North Pitch (Rear Slope)
      ...vNE, ...vNW, ...vRL,
      ...vNE, ...vRL, ...vRR,
      // West Hip (Triangular Slope)
      ...vNW, ...vSW, ...vRL,
      // East Hip (Triangular Slope)
      ...vSE, ...vNE, ...vRR
    ]);

    const uvs = new Float32Array([
      0, 0,   3.5, 0,   2.5, 1,
      0, 0,   2.5, 1,   1.0, 1,
      0, 0,   3.5, 0,   2.5, 1,
      0, 0,   2.5, 1,   1.0, 1,
      0, 0,   2.5, 0,   1.25, 1,
      0, 0,   2.5, 0,   1.25, 1
    ]);

    const roofGeo = new THREE.BufferGeometry();
    roofGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    roofGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    roofGeo.computeVertexNormals();

    const roofMesh = new THREE.Mesh(roofGeo, tinMat);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    house.add(roofMesh);

    // Main Horizontal Ridge Cap along peak (টিনের মটকা / Ridge roll)
    const ridgeCapGeo = new THREE.BoxGeometry(ridgeL + 0.4, 0.16, 0.28);
    const ridgeCap = new THREE.Mesh(ridgeCapGeo, tinMat);
    ridgeCap.position.set(0, baseY + rPeakH + 0.05, 0);
    ridgeCap.castShadow = true;
    house.add(ridgeCap);

    // 4 Corner Hip Ridge Caps (চার কোণার মটকা)
    const createHipRidgeCap = (p1, p2) => {
      const dir = new THREE.Vector3().subVectors(p2, p1);
      const len = dir.length();
      const capGeo = new THREE.CylinderGeometry(0.08, 0.08, len, 6);
      const capMesh = new THREE.Mesh(capGeo, tinMat);
      capMesh.position.copy(p1).addScaledVector(dir, 0.5);
      capMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      capMesh.castShadow = true;
      return capMesh;
    };

    const pRL = new THREE.Vector3(-hl, baseY + rPeakH, 0);
    const pRR = new THREE.Vector3(hl, baseY + rPeakH, 0);
    const pSW = new THREE.Vector3(-hw, baseY, hd);
    const pSE = new THREE.Vector3(hw, baseY, hd);
    const pNW = new THREE.Vector3(-hw, baseY, -hd);
    const pNE = new THREE.Vector3(hw, baseY, -hd);

    house.add(createHipRidgeCap(pRL, pNW));
    house.add(createHipRidgeCap(pRL, pSW));
    house.add(createHipRidgeCap(pRR, pNE));
    house.add(createHipRidgeCap(pRR, pSE));

    // Veranda Awning Tin Roof (বারান্দার ছাদ)
    const vRoofGeo = new THREE.BoxGeometry(rW, 0.08, vDepth + 0.6);
    const vRoof = new THREE.Mesh(vRoofGeo, tinMat);
    vRoof.position.set(0, baseY - 0.18, config.d / 2 + vDepth / 2 + 0.15);
    vRoof.rotation.x = 0.26;
    vRoof.castShadow = true;
    house.add(vRoof);

    parent.add(house);

    // Accurate Box Collider accounting for rotation
    const rotY = config.rotY || 0;
    const cos = Math.abs(Math.cos(rotY));
    const sin = Math.abs(Math.sin(rotY));
    const totalD = config.d + vDepth;
    const rx = (config.w * cos + totalD * sin) / 2 + 0.3;
    const rz = (config.w * sin + totalD * cos) / 2 + 0.3;

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(config.x - rx, 0, config.z - rz),
      new THREE.Vector3(config.x + rx, config.h + 2.4, config.z + rz)
    ));
  },

  // Pucca Brick House (পাকা বাড়ি)
  createPuccaBrickHouse: function(parent, x, z, w, d, h) {
    const house = new THREE.Group();
    house.position.set(x, h / 2, z);

    const brickMat = new THREE.MeshLambertMaterial({ color: 0xb57865 });
    const mainBox = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), brickMat);
    mainBox.castShadow = true;
    mainBox.receiveShadow = true;
    house.add(mainBox);

    // Roof Parapet Wall
    const parapetMat = new THREE.MeshLambertMaterial({ color: 0x8a5b4c });
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(w, 0.8, d), parapetMat);
    parapet.position.set(0, h / 2 + 0.4, 0);
    house.add(parapet);

    // Windows with green shutters
    const greenMat = new THREE.MeshLambertMaterial({ color: 0x1f5936 });
    for (let floor = 0; floor < 2; floor++) {
      const fy = -h / 2 + 1.6 + floor * 2.8;
      for (let wx of [-w / 3, w / 3]) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 0.1), greenMat);
        win.position.set(wx, fy, -d / 2 - 0.06);
        house.add(win);
      }
    }

    parent.add(house);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - w / 2 - 0.5, 0, z - d / 2 - 0.5),
      new THREE.Vector3(x + w / 2 + 0.5, h + 1.5, z + d / 2 + 0.5)
    ));
  },

  // Golden Conical Haystack (খড়ের গাদা)
  createHaystack: function(parent, x, z, scale = 1.0) {
    const hayGroup = new THREE.Group();
    hayGroup.position.set(x, 0, z);
    hayGroup.scale.set(scale, scale, scale);

    const hayMat = new THREE.MeshLambertMaterial({ color: 0xd4a54c });
    const cone = new THREE.Mesh(this.sharedGeos.haystack, hayMat);
    cone.castShadow = true;
    cone.receiveShadow = true;
    hayGroup.add(cone);

    // Bamboo pole poking out top
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x8a723e });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 5.2, 5), poleMat);
    pole.position.set(0, 2.6, 0);
    hayGroup.add(pole);

    parent.add(hayGroup);

    // Cylindrical/Box Collider
    const r = 2.6 * scale;
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - r, 0, z - r),
      new THREE.Vector3(x + r, 4.2 * scale, z + r)
    ));
  },

  // Bamboo Granary / Silo (ধানের গোলা)
  createGrainSilo: function(parent, x, z) {
    const silo = new THREE.Group();
    silo.position.set(x, 0, z);

    // Wooden stilts / legs to prevent rodents
    const legMat = new THREE.MeshLambertMaterial({ color: 0x4a3424 });
    for (let a = 0; a < 4; a++) {
      const ang = (a / 4) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), legMat);
      leg.position.set(Math.cos(ang) * 1.3, 0.6, Math.sin(ang) * 1.3);
      silo.add(leg);
    }

    // Cylindrical woven bamboo drum
    const drumMat = new THREE.MeshLambertMaterial({ color: 0xb59b67 });
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.2, 10), drumMat);
    drum.position.set(0, 2.2, 0);
    silo.add(drum);

    // Conical thatched roof
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x947844 });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.6, 10), roofMat);
    roof.position.set(0, 3.9, 0);
    silo.add(roof);

    parent.add(silo);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.8, 0, z - 1.8),
      new THREE.Vector3(x + 1.8, 4.5, z + 1.8)
    ));
  },

  // Cowshed / Cattle Shed (গোয়ালঘর)
  createCowshed: function(parent, x, z) {
    const shed = new THREE.Group();
    shed.position.set(x, 0, z);

    const postMat = new THREE.MeshLambertMaterial({ color: 0x4a3420 });
    const postGeo = new THREE.BoxGeometry(0.18, 2.2, 0.18);
    for (let px of [-2.8, 0, 2.8]) {
      for (let pz of [-1.8, 1.8]) {
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(px, 1.1, pz);
        shed.add(post);
      }
    }

    // Wooden feeding mangers (চারি)
    const mangerMat = new THREE.MeshLambertMaterial({ color: 0x5a422a });
    const manger = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.6, 0.8), mangerMat);
    manger.position.set(0, 0.3, -1.2);
    shed.add(manger);

    // Tin sloped roof
    const tinMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createTinRoofTexture()
    });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.06, 4.4), tinMat);
    roof.position.set(0, 2.4, 0);
    roof.rotation.x = 0.12;
    shed.add(roof);

    parent.add(shed);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 3.2, 0, z - 2.0),
      new THREE.Vector3(x + 3.2, 2.6, z + 2.0)
    ));
  },

  // Woven Bamboo Fence (বাশের বেড়া)
  createBambooFence: function(parent, x, z, len, axis = 'x') {
    const fenceMat = new THREE.MeshLambertMaterial({ color: 0xbdb08a });
    const postMat = new THREE.MeshLambertMaterial({ color: 0x6e5c3c });

    const fenceGroup = new THREE.Group();
    fenceGroup.position.set(x, 0, z);

    const h = 1.3;
    const isX = axis === 'x';

    // Screen mesh
    const screenGeo = isX ? new THREE.BoxGeometry(len, h, 0.08) : new THREE.BoxGeometry(0.08, h, len);
    const screen = new THREE.Mesh(screenGeo, fenceMat);
    screen.position.set(isX ? len / 2 : 0, h / 2, isX ? 0 : len / 2);
    fenceGroup.add(screen);

    // Bamboo posts along fence
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, h + 0.3, 5);
    const step = 3.0;
    for (let p = 0; p <= len; p += step) {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(isX ? p : 0, (h + 0.3) / 2, isX ? 0 : p);
      fenceGroup.add(post);
    }

    parent.add(fenceGroup);

    // Waist-high tactical cover collider
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(isX ? x - 0.2 : x - 0.3, 0, isX ? z - 0.3 : z - 0.2),
      new THREE.Vector3(isX ? x + len + 0.2 : x + 0.3, h, isX ? z + 0.3 : z + len + 0.2)
    ));
  },

  // Brick Boundary Wall (ইটের দেয়াল)
  createBrickBoundaryWall: function(parent, x, z, len, axis = 'x') {
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x8a4538 });
    const capMat = new THREE.MeshLambertMaterial({ color: 0x663328 });

    const wallGroup = new THREE.Group();
    wallGroup.position.set(x, 0, z);

    const h = 1.25;
    const isX = axis === 'x';

    const wallGeo = isX ? new THREE.BoxGeometry(len, h, 0.35) : new THREE.BoxGeometry(0.35, h, len);
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(isX ? len / 2 : 0, h / 2, isX ? 0 : len / 2);
    wall.castShadow = true;
    wall.receiveShadow = true;
    wallGroup.add(wall);

    // Concrete top cap with moss
    const capGeo = isX ? new THREE.BoxGeometry(len + 0.2, 0.08, 0.42) : new THREE.BoxGeometry(0.42, 0.08, len + 0.2);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(isX ? len / 2 : 0, h + 0.04, isX ? 0 : len / 2);
    wallGroup.add(cap);

    parent.add(wallGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(isX ? x - 0.2 : x - 0.35, 0, isX ? z - 0.35 : z - 0.2),
      new THREE.Vector3(isX ? x + len + 0.2 : x + 0.35, h + 0.1, isX ? z + 0.35 : z + len + 0.2)
    ));
  },

  // ================= 6. ABALPUR CHOWRASTA & VILLAGE SHOPS =================
  createVillageShops: function(parent) {
    // Shop 1: "আবালপুর মোড় মুদি ভাণ্ডার" (Grocery) at Chowrasta
    this.createSingleVillageShop(parent, {
      x: 10, z: -20, w: 5.5, d: 4.8, h: 3.2,
      shopName: 'আবালপুর মুদি ভাণ্ডার',
      subText: 'নিত্য প্রয়োজনীয় সকল সামগ্রী ও রিচার্জ',
      phone: '০১৭৫২-৯৯৮৮৭৭',
      theme: 'red'
    });

    // Shop 2: "মায়ের দোয়া চা স্টল" (Village Tea Stall)
    this.createVillageTeaStall(parent, 18, -19);

    // Shop 3: "বিশ্বাস ফার্মেসী ও বিকাশ পয়েন্ট"
    this.createSingleVillageShop(parent, {
      x: -12, z: -20, w: 5.2, d: 4.6, h: 3.2,
      shopName: 'বিশ্বাস ফার্মেসী ও বিকাশ',
      subText: 'জরুরী ঔষধ, ক্যাশ ইন-আউট ও লোড',
      phone: '০১৯১১-৬৬৫৫৪৪',
      theme: 'bkash'
    });

    // Chowrasta Milestone / KM Post (সাদা-হলুদ মাইলফলক)
    this.createMilestone(parent, 3.8, -14.5);
  },

  createMilestone: function(parent, x, z) {
    const postGroup = new THREE.Group();
    postGroup.position.set(x, 0, z);

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0xf3f4f6 });
    const yellowMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x18181b });

    // Base rectangular concrete pillar
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.28), stoneMat);
    base.position.set(0, 0.325, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    postGroup.add(base);

    // Domed yellow milestone top
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.28, 10), yellowMat);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(0, 0.65, 0);
    postGroup.add(cap);

    // Black text line markings
    const line1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.02), blackMat);
    line1.position.set(0, 0.42, 0.145);
    postGroup.add(line1);

    const line2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.02), blackMat);
    line2.position.set(0, 0.26, 0.145);
    postGroup.add(line2);

    parent.add(postGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.3, 0, z - 0.2),
      new THREE.Vector3(x + 0.3, 0.85, z + 0.2)
    ));
  },

  createSingleVillageShop: function(parent, config) {
    const shop = new THREE.Group();
    shop.position.set(config.x, 0, config.z);

    const wallMat = new THREE.MeshLambertMaterial({ color: 0x8a7a6b });
    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(config.w, config.h, config.d), wallMat);
    bMesh.position.set(0, config.h / 2, 0);
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    shop.add(bMesh);

    // Slanted tin roof overhang
    const tinMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createTinRoofTexture()
    });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(config.w + 0.8, 0.06, config.d + 1.8), tinMat);
    roof.position.set(0, config.h + 0.2, 0.4);
    roof.rotation.x = 0.16;
    shop.add(roof);

    // Bengali Shop Signboard
    const signTex = TextureFactory.createBengaliSignTexture(config.shopName, config.subText, config.phone, config.theme);
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(config.w * 0.85, 0.85, 0.12),
      new THREE.MeshLambertMaterial({ map: signTex })
    );
    signBoard.position.set(0, config.h - 0.2, config.d / 2 + 0.1);
    shop.add(signBoard);

    // Open counter with display shelves
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5a3d24 });
    const counter = new THREE.Mesh(new THREE.BoxGeometry(config.w * 0.7, 1.0, 0.8), woodMat);
    counter.position.set(0, 0.5, config.d / 2 + 0.2);
    shop.add(counter);

    // Small display jars on counter
    const glassMat = new THREE.MeshLambertMaterial({ color: 0xc8d6e5 });
    for (let j = 0; j < 3; j++) {
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 6), glassMat);
      jar.position.set(-0.8 + j * 0.8, 1.18, config.d / 2 + 0.2);
      shop.add(jar);
    }

    parent.add(shop);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(config.x - config.w / 2 - 0.3, 0, config.z - config.d / 2 - 0.3),
      new THREE.Vector3(config.x + config.w / 2 + 0.3, config.h + 1.0, config.z + config.d / 2 + 0.8)
    ));
  },

  createVillageTeaStall: function(parent, x, z) {
    const stall = new THREE.Group();
    stall.position.set(x, 0, z);

    // Timber posts & wooden counter
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x4a321e });
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.0, 1.4), woodMat);
    counter.position.set(0, 0.5, 0);
    stall.add(counter);

    // Customer benches
    const bench1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 0.5), woodMat);
    bench1.position.set(0, 0.22, 1.4);
    stall.add(bench1);

    // Bamboo posts supporting tin roof
    const bambooMat = new THREE.MeshLambertMaterial({ color: 0xb59e69 });
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.5, 5);
    for (let px of [-1.4, 1.4]) {
      for (let pz of [-0.8, 1.6]) {
        const post = new THREE.Mesh(postGeo, bambooMat);
        post.position.set(px, 1.25, pz);
        stall.add(post);
      }
    }

    // Slanted tin roof
    const tinMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createTinRoofTexture()
    });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.05, 3.2), tinMat);
    roof.position.set(0, 2.5, 0.4);
    roof.rotation.x = 0.12;
    stall.add(roof);

    // Aluminum Tea Kettle
    const kettleMat = new THREE.MeshPhongMaterial({ color: 0xd9e2ec, shininess: 80 });
    const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.38, 8), kettleMat);
    kettle.position.set(-0.6, 1.19, 0);
    stall.add(kettle);

    // Red clay water pitcher / Matka (মাটির কলসি) on counter
    const potMat = new THREE.MeshLambertMaterial({ color: 0x8a4528 });
    const waterPot = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), potMat);
    waterPot.position.set(0.65, 1.22, 0);
    stall.add(waterPot);

    // Hanging banana bunch from roof beam (কলা কাঁদি)
    const bananaBunchMat = new THREE.MeshLambertMaterial({ color: 0xd4a812 });
    const bunch = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 6), bananaBunchMat);
    bunch.rotation.x = Math.PI;
    bunch.position.set(-0.8, 2.1, 1.2);
    stall.add(bunch);

    // Tea stall signboard
    const signTex = TextureFactory.createBengaliSignTexture('মায়ের দোয়া চা স্টল', 'দুধ চা, লাল চা ও বিস্কুট', '০১৮২১-৪৪৫৫৬৬', 'red');
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.6, 0.08),
      new THREE.MeshLambertMaterial({ map: signTex })
    );
    sign.position.set(0, 2.2, 1.6);
    stall.add(sign);

    parent.add(stall);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.8, 0, z - 1.2),
      new THREE.Vector3(x + 1.8, 2.6, z + 1.8)
    ));
  },

  // ================= 7. CONCRETE CULVERT BRIDGE (কালভার্ট) =================
  createCulvert: function(parent) {
    const culvertZ = 16;
    const culvertX = 0;

    const culvertGroup = new THREE.Group();
    culvertGroup.position.set(culvertX, 0, culvertZ);

    // Drainage ditch under road
    const ditchMat = new THREE.MeshLambertMaterial({ color: 0x362c20 });
    const ditchGeo = new THREE.BoxGeometry(16, 1.4, 4.5);
    const ditch = new THREE.Mesh(ditchGeo, ditchMat);
    ditch.position.set(0, -0.7, 0);
    culvertGroup.add(ditch);

    // Concrete Culvert Road Deck Slab
    const deckMat = new THREE.MeshLambertMaterial({ color: 0x7a7975 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.35, 4.5), deckMat);
    deck.position.set(0, 0.08, 0);
    deck.receiveShadow = true;
    culvertGroup.add(deck);

    // White and Red striped concrete side railings with reflectors
    const railMat = new THREE.MeshLambertMaterial({ color: 0xe8e6e1 });
    const redMat = new THREE.MeshLambertMaterial({ color: 0xb8281d });

    for (let side of [-1, 1]) {
      const rx = side * 3.1;
      // Railing beam
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 4.5), railMat);
      beam.position.set(rx, 0.9, 0);
      culvertGroup.add(beam);

      // Red striped posts
      for (let pz of [-1.8, -0.6, 0.6, 1.8]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.35), (pz === -0.6 || pz === 1.8) ? redMat : railMat);
        post.position.set(rx, 0.45, pz);
        culvertGroup.add(post);
      }

      // Railing colliders for cover
      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(culvertX + rx - 0.4, 0, culvertZ - 2.5),
        new THREE.Vector3(culvertX + rx + 0.4, 1.2, culvertZ + 2.5)
      ));
    }

    parent.add(culvertGroup);
  },

  // ================= 8. UTILITY ELECTRIC POLES & OVERHEAD WIRES (পল্লী বিদ্যুৎ) =================
  createUtilityGrid: function(parent) {
    const polePositions = [
      { x: -3.5, z: -60 },
      { x: -3.5, z: -25 },
      { x: -3.5, z: 5 },
      { x: -3.5, z: 40 },
      { x: 22, z: -13 },
      { x: 55, z: -13 }
    ];

    const poleMat = new THREE.MeshLambertMaterial({ color: 0x8a877f });
    const crossMat = new THREE.MeshLambertMaterial({ color: 0x4a3424 });
    const wireMat = new THREE.LineBasicMaterial({ color: 0x111111, linewidth: 1 });

    const poleTops = [];

    polePositions.forEach(pos => {
      const pole = new THREE.Group();
      pole.position.set(pos.x, 0, pos.z);

      const shaft = new THREE.Mesh(this.sharedGeos.utilityPole, poleMat);
      pole.add(shaft);

      // Crossarm (কাঠের টানা ক্রসার্ম)
      const crossarm = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.12), crossMat);
      crossarm.position.set(0, 8.0, 0);
      pole.add(crossarm);

      parent.add(pole);

      poleTops.push(new THREE.Vector3(pos.x, 8.0, pos.z));

      // Pole Collider
      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(pos.x - 0.35, 0, pos.z - 0.35),
        new THREE.Vector3(pos.x + 0.35, 8.5, pos.z + 0.35)
      ));
    });

    // Connect wires sequentially
    for (let i = 0; i < 4; i++) {
      const p1 = poleTops[i];
      const p2 = poleTops[i + 1];
      const wirePoints = [];
      const steps = 10;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = p1.x + (p2.x - p1.x) * t;
        const z = p1.z + (p2.z - p1.z) * t;
        // Catenary sag curve
        const sag = Math.sin(t * Math.PI) * 0.6;
        const y = p1.y + (p2.y - p1.y) * t - sag;
        wirePoints.push(new THREE.Vector3(x, y, z));
      }
      const wireGeo = new THREE.BufferGeometry().setFromPoints(wirePoints);
      const wireLine = new THREE.Line(wireGeo, wireMat);
      parent.add(wireLine);
    }
  },

  // ================= 9. RURAL TREES, BAMBOO & PALMS =================
  createVegetation: function(parent) {
    // A. Betel Nut Palms (সুপারি গাছ) - Tall, slender, quintessential rural Magura landscape
    const betelPositions = [
      { x: -14, z: -35 }, { x: -16, z: -42 }, { x: -15, z: -48 },
      { x: 14, z: -40 }, { x: 15, z: -46 },
      { x: -45, z: 4 }, { x: -48, z: 12 }, { x: -46, z: 20 },
      { x: -14, z: 32 }, { x: -15, z: 38 },
      { x: 30, z: -50 }, { x: 32, z: -56 }
    ];
    betelPositions.forEach(p => {
      this.createBetelNutPalm(parent, p.x, p.z);
    });

    // B. Coconut Palms (নারিকেল গাছ) - Around pond and village borders
    const coconutPositions = [
      { x: -84, z: 16 }, { x: -84, z: 28 }, { x: -50, z: 34 },
      { x: 18, z: 16 }, { x: 22, z: 24 },
      { x: -18, z: 66 }, { x: 38, z: -25 }
    ];
    coconutPositions.forEach(p => {
      this.createCoconutPalm(parent, p.x, p.z);
    });

    // C. Banana Plant Clusters (কলা বাগান)
    const bananaClusters = [
      { x: -18, z: 18 }, { x: -26, z: 28 },
      { x: 18, z: -30 }, { x: 25, z: -32 },
      { x: -46, z: -28 }, { x: 35, z: 12 }
    ];
    bananaClusters.forEach(b => {
      this.createBananaCluster(parent, b.x, b.z);
    });

    // D. Bamboo Groves (বাঁশঝাড়) - Dense tactical thickets
    const bambooGroves = [
      { x: 28, z: -28 },
      { x: 32, z: -42 },
      { x: -52, z: -18 },
      { x: -12, z: 68 },
      { x: 32, z: 64 },
      { x: 74, z: -10 }
    ];
    bambooGroves.forEach(bg => {
      this.createBambooGrove(parent, bg.x, bg.z);
    });

    // E. Mango / Banyan Shade Trees (বট ও আম গাছ) - Positioned safely away from road corridors
    this.createShadeTree(parent, 14, 2, 3.8);
    this.createShadeTree(parent, -24, -18, 3.2); // Green verge south of House 7, clear of West Road
    this.createShadeTree(parent, 40, 52, 3.5);
  },

  // Betel Nut Palm (সুপারি গাছ) - Tall, slender, upright pencil trunk with lime crownshaft & arching fronds
  createBetelNutPalm: function(parent, x, z) {
    const palm = new THREE.Group();
    palm.position.set(x, 0, z);

    // Individual variation seed
    const s = Math.abs(Math.sin(x * 12.9898 + z * 78.233));
    const totalH = 10.5 + (s * 1.8);
    const trunkH = totalH - 1.3;

    // Slender upright tapering pencil trunk with base at y = 0
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, trunkH, 7);
    trunkGeo.translate(0, trunkH / 2, 0);
    const trunk = new THREE.Mesh(trunkGeo, this.sharedMats.betelTrunk);
    trunk.rotation.z = (s - 0.5) * 0.025; // Gentle upright natural posture
    trunk.rotation.x = (((s * 13) % 1) - 0.5) * 0.025;
    trunk.castShadow = true;
    palm.add(trunk);

    // Basal root flare ring touching ground
    const baseFlare = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.35, 7), this.sharedMats.betelTrunk);
    baseFlare.position.set(0, 0.175, 0);
    palm.add(baseFlare);

    // Top green crownshaft (সবুজ খোল) attached directly inside trunk at trunk apex
    const shaftGeo = new THREE.CylinderGeometry(0.11, 0.12, 1.3, 7);
    shaftGeo.translate(0, 0.65, 0);
    const shaft = new THREE.Mesh(shaftGeo, this.sharedMats.crownshaft);
    shaft.position.set(0, trunkH, 0);
    shaft.castShadow = true;
    trunk.add(shaft);

    // Upright-arching frond crown attached directly to trunk apex
    const crownGroup = new THREE.Group();
    crownGroup.position.set(0, totalH, 0);
    trunk.add(crownGroup);

    const numFronds = 10;
    for (let i = 0; i < numFronds; i++) {
      const frond = new THREE.Group();
      frond.rotation.y = (i / numFronds) * Math.PI * 2 + s * 0.5;
      frond.rotation.x = 0.28 + (i % 2) * 0.1;
      const fMat = i % 2 === 0 ? this.sharedMats.palmFrond : this.sharedMats.palmFrondSun;
      const leafMesh = new THREE.Mesh(this.sharedGeos.betelFrondCurved, fMat);
      leafMesh.castShadow = true;
      frond.add(leafMesh);
      crownGroup.add(frond);
    }

    // 2 Drooping older dry fronds (শুকনো পাতা)
    for (let d = 0; d < 2; d++) {
      const deadFrond = new THREE.Group();
      deadFrond.position.set(0, -0.2, 0);
      deadFrond.rotation.y = d * Math.PI + s;
      deadFrond.rotation.x = 0.75;
      const dMesh = new THREE.Mesh(this.sharedGeos.betelFrondCurved, this.sharedMats.deadFrond);
      dMesh.scale.set(0.85, 0.85, 0.85);
      deadFrond.add(dMesh);
      crownGroup.add(deadFrond);
    }

    // Betel nut berry cluster (সুপারির ছড়া)
    const nutGeo = new THREE.DodecahedronGeometry(0.16, 0);
    for (let b = 0; b < 3; b++) {
      const bang = (b / 3) * Math.PI * 2;
      const nut = new THREE.Mesh(nutGeo, this.sharedMats.betelNut);
      nut.position.set(Math.cos(bang) * 0.16, trunkH + 0.1, Math.sin(bang) * 0.16);
      trunk.add(nut);
    }

    // Small ground vegetation around base
    for (let g = 0; g < 3; g++) {
      const gang = (g / 3) * Math.PI * 2 + s;
      const grass = new THREE.Mesh(this.sharedGeos.grassTuft, this.sharedMats.groundGrass);
      grass.position.set(Math.cos(gang) * 0.45, 0.2, Math.sin(gang) * 0.45);
      palm.add(grass);
    }

    parent.add(palm);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.35, 0, z - 0.35),
      new THREE.Vector3(x + 0.35, totalH, z + 0.35)
    ));
  },

  // Coconut Palm (নারিকেল গাছ) - Naturally upright, gracefully curved rural palm
  createCoconutPalm: function(parent, x, z) {
    const palm = new THREE.Group();
    palm.position.set(x, 0, z);

    // Unique organic variation seed
    const s = Math.abs(Math.sin(x * 23.41 + z * 47.89));
    const leanDir = s * Math.PI * 2;
    const trunkH = 8.6 + s * 1.5;

    // Upright solid tapering trunk with base firmly at ground y = 0
    const trunkGeo = new THREE.CylinderGeometry(0.24, 0.42, trunkH, 8);
    trunkGeo.translate(0, trunkH / 2, 0);
    const trunk = new THREE.Mesh(trunkGeo, this.sharedMats.palmTrunk);
    trunk.rotation.z = Math.cos(leanDir) * 0.045; // Gentle, authentic upright curvature
    trunk.rotation.x = Math.sin(leanDir) * 0.045;
    trunk.castShadow = true;
    palm.add(trunk);

    // Root flare collar at ground level
    const baseFlare = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.55, 0.45, 8), this.sharedMats.palmTrunk);
    baseFlare.position.set(0, 0.22, 0);
    palm.add(baseFlare);

    // Leaf Crown Group attached directly at trunk apex
    const crownGroup = new THREE.Group();
    crownGroup.position.set(0, trunkH, 0);
    trunk.add(crownGroup);

    // Arching Fronds (১২টি স্বাভাবিক ও সুন্দর পাতা)
    const numFronds = 12;
    for (let i = 0; i < numFronds; i++) {
      const frond = new THREE.Group();
      frond.rotation.y = (i / numFronds) * Math.PI * 2 + s * 0.6;
      frond.rotation.x = 0.22 + (i % 3) * 0.06;
      const fMat = i % 2 === 0 ? this.sharedMats.palmFrond : this.sharedMats.palmFrondSun;
      const fMesh = new THREE.Mesh(this.sharedGeos.frondCurved, fMat);
      fMesh.castShadow = true;
      frond.add(fMesh);
      crownGroup.add(frond);
    }

    // 3 Hanging dry/dead brown fronds (শুকনো পাতা)
    for (let d = 0; d < 3; d++) {
      const deadFrond = new THREE.Group();
      deadFrond.position.set(0, -0.25, 0);
      deadFrond.rotation.y = (d / 3) * Math.PI * 2 + s * 2;
      deadFrond.rotation.x = 0.85;
      const dMesh = new THREE.Mesh(this.sharedGeos.frondCurved, this.sharedMats.deadFrond);
      dMesh.scale.set(0.85, 0.85, 0.85);
      deadFrond.add(dMesh);
      crownGroup.add(deadFrond);
    }

    // Coconuts cluster (গাছের ডাব/নারিকেল) attached directly under crown
    const nutGeo = new THREE.DodecahedronGeometry(0.24, 0);
    for (let n = 0; n < 4; n++) {
      const nang = (n / 4) * Math.PI * 2 + 0.3;
      const nut = new THREE.Mesh(nutGeo, this.sharedMats.coconut);
      nut.position.set(Math.cos(nang) * 0.32, -0.3, Math.sin(nang) * 0.32);
      nut.castShadow = true;
      crownGroup.add(nut);
    }

    // Base ground grass tufts
    for (let g = 0; g < 4; g++) {
      const gang = (g / 4) * Math.PI * 2 + s;
      const grass = new THREE.Mesh(this.sharedGeos.grassTuft, this.sharedMats.groundGrass);
      grass.position.set(Math.cos(gang) * 0.65, 0.22, Math.sin(gang) * 0.65);
      palm.add(grass);
    }

    parent.add(palm);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.45, 0, z - 0.45),
      new THREE.Vector3(x + 0.45, trunkH + 2.0, z + 0.45)
    ));
  },

  // Banana Plant Cluster (কলা বাগান) - Multi-stem clump with broad curved drooping leaves
  createBananaCluster: function(parent, x, z) {
    const cluster = new THREE.Group();
    cluster.position.set(x, 0, z);

    const s = Math.abs(Math.sin(x * 19.3 + z * 37.7));

    // Clump: mature plant, medium daughter, sucker shoot
    const stems = [
      { rad: 0.16, h: 3.4, ox: 0, oz: 0, numLeaves: 7, rotZ: 0.04, mature: true },
      { rad: 0.13, h: 2.5, ox: 0.5, oz: -0.2, numLeaves: 5, rotZ: -0.06, mature: false },
      { rad: 0.09, h: 1.5, ox: -0.35, oz: 0.3, numLeaves: 4, rotZ: 0.08, mature: false }
    ];

    stems.forEach(stemData => {
      const stemGroup = new THREE.Group();
      stemGroup.position.set(stemData.ox, 0, stemData.oz);
      stemGroup.rotation.z = stemData.rotZ;
      stemGroup.rotation.x = stemData.rotZ * 0.4;
      cluster.add(stemGroup);

      // Pseudostem (কলা গাছের থোড়)
      const stemGeo = new THREE.CylinderGeometry(stemData.rad * 0.75, stemData.rad, stemData.h, 6);
      stemGeo.translate(0, stemData.h / 2, 0);
      const stemMesh = new THREE.Mesh(stemGeo, this.sharedMats.bananaStem);
      stemMesh.castShadow = true;
      stemGroup.add(stemMesh);

      // Base dried sheath wrap
      const sheathGeo = new THREE.CylinderGeometry(stemData.rad * 1.05, stemData.rad * 1.15, 0.6, 6);
      sheathGeo.translate(0, 0.3, 0);
      const sheath = new THREE.Mesh(sheathGeo, this.sharedMats.bananaSheath);
      stemGroup.add(sheath);

      // Broad curved leaves with realistic downward droop attached to stem top
      const leafTop = stemData.h - 0.15;
      for (let l = 0; l < stemData.numLeaves; l++) {
        const leafGroup = new THREE.Group();
        leafGroup.position.set(0, leafTop, 0);
        leafGroup.rotation.y = (l / stemData.numLeaves) * Math.PI * 2 + s;
        leafGroup.rotation.x = 0.25 + (l % 2) * 0.12;
        const leafMesh = new THREE.Mesh(this.sharedGeos.bananaCurved, this.sharedMats.bananaLeaf);
        const leafScale = stemData.h / 3.4;
        leafMesh.scale.set(leafScale, leafScale, leafScale);
        leafMesh.castShadow = true;
        leafGroup.add(leafMesh);
        stemGroup.add(leafGroup);
      }

      // Fresh unfurling upright leaf shoot on mature plant
      if (stemData.mature) {
        const shootGeo = new THREE.CylinderGeometry(0.04, 0.06, 1.3, 5);
        shootGeo.translate(0, 0.65, 0);
        const shoot = new THREE.Mesh(shootGeo, this.sharedMats.bananaShoot);
        shoot.position.set(0, stemData.h, 0);
        stemGroup.add(shoot);
      }
    });

    // Ground mulch bed & wild grass
    const mulchGeo = new THREE.CircleGeometry(1.2, 8);
    const mulch = new THREE.Mesh(mulchGeo, this.sharedMats.mulchBed);
    mulch.rotation.x = -Math.PI / 2;
    mulch.position.set(0, 0.03, 0);
    cluster.add(mulch);

    for (let g = 0; g < 3; g++) {
      const gang = (g / 3) * Math.PI * 2 + s;
      const grass = new THREE.Mesh(this.sharedGeos.grassTuft, this.sharedMats.groundGrass);
      grass.position.set(Math.cos(gang) * 0.85, 0.22, Math.sin(gang) * 0.85);
      cluster.add(grass);
    }

    parent.add(cluster);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.7, 0, z - 0.7),
      new THREE.Vector3(x + 0.7, 4.0, z + 0.7)
    ));
  },

  // Bamboo Grove Thicket (বাঁশঝাড়) - Clump of splayed culms with layered feathery foliage
  createBambooGrove: function(parent, x, z) {
    const grove = new THREE.Group();
    grove.position.set(x, 0, z);

    // Ground mulch of dry fallen bamboo leaves
    const mulchGeo = new THREE.CircleGeometry(2.4, 8);
    const mulch = new THREE.Mesh(mulchGeo, this.sharedMats.mulchBed);
    mulch.rotation.x = -Math.PI / 2;
    mulch.position.set(0, 0.03, 0);
    grove.add(mulch);

    // Radiating clump of 12 culms (বাঁশের নলা)
    const numCulms = 12;
    for (let i = 0; i < numCulms; i++) {
      const ang = (i / numCulms) * Math.PI * 2 + ((i * 1.7) % 0.5);
      const rad = 0.3 + (i % 3) * 0.45;
      const px = Math.cos(ang) * rad;
      const pz = Math.sin(ang) * rad;

      const culm = new THREE.Mesh(this.sharedGeos.bambooPole, this.sharedMats.bambooStem);
      culm.position.set(px, 0, pz);
      // Gentle natural outward splay
      const splayZ = Math.cos(ang) * (0.04 + (i % 3) * 0.025);
      const splayX = Math.sin(ang) * (0.04 + (i % 3) * 0.025);
      culm.rotation.z = splayZ;
      culm.rotation.x = splayX;
      culm.castShadow = true;
      grove.add(culm);

      // Layered feathery foliage tufts directly attached to upper culm
      if (i % 2 === 0) {
        const fMat = (i / 2) % 2 === 0 ? this.sharedMats.bambooLeaf1 : this.sharedMats.bambooLeaf2;
        const leafTuft = new THREE.Mesh(new THREE.DodecahedronGeometry(1.05, 0), fMat);
        const tuftY = 6.2 + (i % 3) * 0.7;
        leafTuft.position.set(px - splayZ * tuftY, tuftY, pz + splayX * tuftY);
        leafTuft.scale.set(1.3, 0.65, 1.15);
        leafTuft.castShadow = true;
        grove.add(leafTuft);
      }
    }

    // Top central crown canopy
    const topCanopy = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 0), this.sharedMats.bambooLeaf2);
    topCanopy.position.set(0, 7.8, 0);
    topCanopy.scale.set(1.4, 0.75, 1.3);
    topCanopy.castShadow = true;
    grove.add(topCanopy);

    parent.add(grove);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.6, 0, z - 1.6),
      new THREE.Vector3(x + 1.6, 8.2, z + 1.6)
    ));
  },

  // Mango / Banyan Shade Tree (আম ও বট গাছ) - Gnarled upright trunk, buttress roots, layered canopy
  createShadeTree: function(parent, x, z, radius = 3.5) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    const s = Math.abs(Math.sin(x * 14.17 + z * 37.89));
    const scaleFactor = 0.95 + s * 0.15;
    tree.scale.set(scaleFactor, scaleFactor, scaleFactor);
    tree.rotation.y = s * Math.PI * 2;

    // 1. Lower upright trunk resting securely on ground
    const trunkH = 3.0;
    const lowerTrunkGeo = new THREE.CylinderGeometry(0.65, 0.92, trunkH, 8);
    lowerTrunkGeo.translate(0, trunkH / 2, 0);
    const lowerTrunk = new THREE.Mesh(lowerTrunkGeo, this.sharedMats.trunkBark);
    lowerTrunk.castShadow = true;
    tree.add(lowerTrunk);

    // 2. Buttress root flares radiating firmly into earth (বটের ঝুরি ও শিকড়)
    for (let r = 0; r < 4; r++) {
      const rang = (r / 4) * Math.PI * 2 + 0.35;
      const rootGeo = new THREE.BoxGeometry(0.3, 0.45, 0.85);
      rootGeo.translate(0, 0.22, 0.42);
      const root = new THREE.Mesh(rootGeo, this.sharedMats.trunkBark);
      root.position.set(Math.cos(rang) * 0.55, 0, Math.sin(rang) * 0.55);
      root.rotation.y = -rang;
      root.castShadow = true;
      tree.add(root);
    }

    // 3. Spreading limbs emerging from trunk top
    const branches = [
      { len: 2.2, rT: 0.32, rB: 0.48, rx: 0.28, rz: 0.26, px: 0.3, py: 2.8, pz: 0.3 },
      { len: 2.4, rT: 0.30, rB: 0.45, rx: -0.32, rz: -0.24, px: -0.3, py: 2.8, pz: -0.3 },
      { len: 2.1, rT: 0.28, rB: 0.42, rx: 0.14, rz: -0.32, px: -0.25, py: 2.8, pz: 0.35 }
    ];

    branches.forEach(b => {
      const bGeo = new THREE.CylinderGeometry(b.rT, b.rB, b.len, 6);
      bGeo.translate(0, b.len / 2, 0);
      const bMesh = new THREE.Mesh(bGeo, this.sharedMats.trunkBark);
      bMesh.position.set(b.px, b.py, b.pz);
      bMesh.rotation.x = b.rx;
      bMesh.rotation.z = b.rz;
      bMesh.castShadow = true;
      tree.add(bMesh);
    });

    // 4. Layered Asymmetric Foliage Clusters enveloping all branch ends
    const clusterGeo = new THREE.DodecahedronGeometry(radius * 0.45, 0);
    const clusters = [
      { x: 1.4, y: 4.0, z: 0.9, sx: 1.4, sy: 0.8, sz: 1.3, mat: this.sharedMats.shadeLeafMid },
      { x: -1.5, y: 4.1, z: -1.0, sx: 1.5, sy: 0.85, sz: 1.3, mat: this.sharedMats.shadeLeafDark },
      { x: -1.1, y: 3.9, z: 1.2, sx: 1.3, sy: 0.75, sz: 1.2, mat: this.sharedMats.shadeLeafMid },
      { x: 0.1, y: 4.9, z: 0.1, sx: 1.6, sy: 0.9, sz: 1.5, mat: this.sharedMats.shadeLeafBright },
      { x: 0.8, y: 5.2, z: -0.6, sx: 1.25, sy: 0.75, sz: 1.2, mat: this.sharedMats.shadeLeafBright },
      { x: -0.6, y: 4.8, z: -0.8, sx: 1.3, sy: 0.8, sz: 1.25, mat: this.sharedMats.shadeLeafMid }
    ];

    clusters.forEach(c => {
      const cl = new THREE.Mesh(clusterGeo, c.mat);
      cl.position.set(c.x, c.y, c.z);
      cl.scale.set(c.sx, c.sy, c.sz);
      cl.castShadow = true;
      tree.add(cl);
    });

    // 5. Small ground weed vegetation around base
    for (let g = 0; g < 4; g++) {
      const gang = (g / 4) * Math.PI * 2 + 0.2;
      const grass = new THREE.Mesh(this.sharedGeos.grassTuft, this.sharedMats.groundGrass);
      grass.position.set(Math.cos(gang) * 1.1, 0.22, Math.sin(gang) * 1.1);
      tree.add(grass);
    }

    parent.add(tree);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.9, 0, z - 0.9),
      new THREE.Vector3(x + 0.9, 6.5 * scaleFactor, z + 0.9)
    ));
  },

  // ================= 10. PARKED RURAL VEHICLES (যানবাহন) =================
  createRuralVehicles: function(parent) {
    // 1. Flatbed Rickshaw Cargo Van (গ্রাম্য ভ্যান গাড়ি) near Chowrasta
    this.createRickshawCargoVan(parent, 4.5, -16, 0.35);

    // 2. Green CNG Auto-Rickshaw parked under tree shade
    this.createVillageCNG(parent, 12, 5, -0.4);

    // 3. Local Bicycle (সাইকেল) propped against shop wall
    this.createBicycle(parent, -9.0, -18, Math.PI / 2);

    // 4. Motorcycle parked near medicine shop
    this.createMotorbike(parent, -8.5, -21.5, 0.15);
  },

  // Flatbed Rickshaw Cargo Van (ভ্যান গাড়ি)
  createRickshawCargoVan: function(parent, x, z, rotY) {
    const van = new THREE.Group();
    van.position.set(x, 0, z);
    van.rotation.y = rotY || 0;

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5a4325 });
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x1f1f1f });

    // Wooden flatbed deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 2.5), woodMat);
    deck.position.set(0, 0.85, 0.2);
    deck.castShadow = true;
    van.add(deck);

    // 2 Rear wheels
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 10);
    wheelGeo.rotateZ(Math.PI / 2);
    const w1 = new THREE.Mesh(wheelGeo, metalMat);
    w1.position.set(-0.85, 0.42, 0.6);
    van.add(w1);
    const w2 = new THREE.Mesh(wheelGeo, metalMat);
    w2.position.set(0.85, 0.42, 0.6);
    van.add(w2);

    // Front fork & wheel
    const w3 = new THREE.Mesh(wheelGeo, metalMat);
    w3.position.set(0, 0.42, -1.3);
    van.add(w3);

    // Cargo sacks on flatbed (বস্তা)
    const sackMat = new THREE.MeshLambertMaterial({ color: 0x948259 });
    for (let s = 0; s < 3; s++) {
      const sack = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.4, 0.9), sackMat);
      sack.position.set((s - 1) * 0.45, 1.15, 0.2);
      van.add(sack);
    }

    parent.add(van);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.0, 0, z - 1.5),
      new THREE.Vector3(x + 1.0, 1.4, z + 1.5)
    ));
  },

  // Green CNG Auto-Rickshaw
  createVillageCNG: function(parent, x, z, rotY) {
    const cng = new THREE.Group();
    cng.position.set(x, 0, z);
    cng.rotation.y = rotY || 0;

    const greenMat = new THREE.MeshPhongMaterial({ color: 0x0e6b38, shininess: 40 });
    const yellowMat = new THREE.MeshLambertMaterial({ color: 0xf5b700 });
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });

    // Chassis
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 2.5), greenMat);
    lowerBody.position.set(0, 0.55, 0);
    lowerBody.castShadow = true;
    cng.add(lowerBody);

    // Yellow Canopy Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.9, 2.3), yellowMat);
    roof.position.set(0, 1.35, 0.05);
    cng.add(roof);

    // Black wheels
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.16, 8);
    wheelGeo.rotateZ(Math.PI / 2);
    const w1 = new THREE.Mesh(wheelGeo, blackMat);
    w1.position.set(-0.7, 0.3, 0.7);
    cng.add(w1);
    const w2 = new THREE.Mesh(wheelGeo, blackMat);
    w2.position.set(0.7, 0.3, 0.7);
    cng.add(w2);
    const w3 = new THREE.Mesh(wheelGeo, blackMat);
    w3.position.set(0, 0.3, -0.9);
    cng.add(w3);

    parent.add(cng);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.9, 0, z - 1.4),
      new THREE.Vector3(x + 0.9, 1.9, z + 1.4)
    ));
  },

  // Bicycle (বাইসাইকেল)
  createBicycle: function(parent, x, z, rotY) {
    const bike = new THREE.Group();
    bike.position.set(x, 0, z);
    bike.rotation.y = rotY || 0;

    const metalMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const wheelGeo = new THREE.TorusGeometry(0.35, 0.03, 5, 10);

    const w1 = new THREE.Mesh(wheelGeo, metalMat);
    w1.position.set(0, 0.35, -0.65);
    bike.add(w1);

    const w2 = new THREE.Mesh(wheelGeo, metalMat);
    w2.position.set(0, 0.35, 0.65);
    bike.add(w2);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 1.1), metalMat);
    frame.position.set(0, 0.55, 0);
    bike.add(frame);

    parent.add(bike);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.3, 0, z - 0.8),
      new THREE.Vector3(x + 0.3, 1.0, z + 0.8)
    ));
  },

  // Motorbike (মোটরসাইকেল)
  createMotorbike: function(parent, x, z, rotY) {
    const bike = new THREE.Group();
    bike.position.set(x, 0, z);
    bike.rotation.y = rotY || 0;

    const redMat = new THREE.MeshLambertMaterial({ color: 0xb51d1d });
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 1.8), redMat);
    body.position.set(0, 0.6, 0);
    bike.add(body);

    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.12, 8);
    wheelGeo.rotateZ(Math.PI / 2);
    const w1 = new THREE.Mesh(wheelGeo, blackMat);
    w1.position.set(0, 0.3, -0.7);
    bike.add(w1);
    const w2 = new THREE.Mesh(wheelGeo, blackMat);
    w2.position.set(0, 0.3, 0.7);
    bike.add(w2);

    parent.add(bike);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.4, 0, z - 1.0),
      new THREE.Vector3(x + 0.4, 1.1, z + 1.0)
    ));
  },

  // ================= 11b. EXPANDED VILLAGE ROADS & CONNECTING PATHS =================
  createExpandedRoadsAndPaths: function(parent) {
    const dirtCanvas = document.createElement('canvas');
    dirtCanvas.width = 256;
    dirtCanvas.height = 256;
    const dCtx = dirtCanvas.getContext('2d');
    dCtx.fillStyle = '#6b4f35';
    dCtx.fillRect(0, 0, 256, 256);
    dCtx.fillStyle = 'rgba(68, 48, 30, 0.55)';
    dCtx.fillRect(40, 0, 48, 256);
    dCtx.fillRect(168, 0, 48, 256);
    for (let i = 0; i < 1200; i++) {
      const px = Math.random() * 256;
      const py = Math.random() * 256;
      dCtx.fillStyle = Math.random() > 0.5 ? 'rgba(140, 110, 80, 0.4)' : 'rgba(45, 32, 20, 0.5)';
      dCtx.fillRect(px, py, 2, 2);
    }
    const dirtTex = new THREE.CanvasTexture(dirtCanvas);
    dirtTex.wrapS = THREE.RepeatWrapping;
    dirtTex.wrapT = THREE.RepeatWrapping;
    dirtTex.repeat.set(1, 10);
    const dirtMat = new THREE.MeshLambertMaterial({ map: dirtTex });

    // Brick Pavement Texture for Mosque Road
    const brickCanvas = document.createElement('canvas');
    brickCanvas.width = 256;
    brickCanvas.height = 256;
    const bCtx = brickCanvas.getContext('2d');
    bCtx.fillStyle = '#8f4333';
    bCtx.fillRect(0, 0, 256, 256);
    bCtx.strokeStyle = '#5a2a20';
    bCtx.lineWidth = 1.5;
    for (let y = 0; y < 256; y += 16) {
      bCtx.beginPath();
      bCtx.moveTo(0, y);
      bCtx.lineTo(256, y);
      bCtx.stroke();
      const offset = (y / 16) % 2 === 0 ? 0 : 16;
      for (let x = offset; x < 256; x += 32) {
        bCtx.beginPath();
        bCtx.moveTo(x, y);
        bCtx.lineTo(x, y + 16);
        bCtx.stroke();
      }
    }
    const brickTex = new THREE.CanvasTexture(brickCanvas);
    brickTex.wrapS = THREE.RepeatWrapping;
    brickTex.wrapT = THREE.RepeatWrapping;
    brickTex.repeat.set(1, 8);
    const brickRoadMat = new THREE.MeshLambertMaterial({ map: brickTex });

    // 1. North Road Extension (connecting village entrance north to Mosque & School junction)
    const northRoadExt = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 28), dirtMat);
    northRoadExt.rotation.x = -Math.PI / 2;
    northRoadExt.position.set(0, 0.02, -94);
    northRoadExt.receiveShadow = true;
    parent.add(northRoadExt);

    // 2. Mosque Road (Brick soling path branching northeast towards Mosque courtyard)
    const mosqueRoad = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 28), brickRoadMat);
    mosqueRoad.rotation.x = -Math.PI / 2;
    mosqueRoad.rotation.z = Math.PI / 2;
    mosqueRoad.position.set(12, 0.025, -94);
    mosqueRoad.receiveShadow = true;
    parent.add(mosqueRoad);

    // 3. School Lane (Dirt avenue branching northwest towards School campus & gate)
    const schoolLane = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 40), dirtMat);
    schoolLane.rotation.x = -Math.PI / 2;
    schoolLane.rotation.z = Math.PI / 2;
    schoolLane.position.set(-20, 0.02, -84);
    schoolLane.receiveShadow = true;
    parent.add(schoolLane);

    const schoolApproach = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 16), dirtMat);
    schoolApproach.rotation.x = -Math.PI / 2;
    schoolApproach.position.set(-40, 0.02, -90);
    schoolApproach.receiveShadow = true;
    parent.add(schoolApproach);

    // 4. South Road Extension to Riverside
    const southRoadExt = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 18), dirtMat);
    southRoadExt.rotation.x = -Math.PI / 2;
    southRoadExt.position.set(0, 0.02, 85);
    southRoadExt.receiveShadow = true;
    parent.add(southRoadExt);

    // 5. South Riverside Embankment Dyke Road (নদী রক্ষা বেরিবাঁধ সড়ক)
    const riverEmbankment = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 172), dirtMat);
    riverEmbankment.rotation.x = -Math.PI / 2;
    riverEmbankment.rotation.z = Math.PI / 2;
    riverEmbankment.position.set(0, 0.03, 93);
    riverEmbankment.receiveShadow = true;
    parent.add(riverEmbankment);

    // 6. Factory / Auto Rice Mill Access Road
    const millRoad = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 18), dirtMat);
    millRoad.rotation.x = -Math.PI / 2;
    millRoad.position.set(70, 0.02, 0);
    millRoad.receiveShadow = true;
    parent.add(millRoad);

    // 7. Connecting Inter-Village Earthen Paths (মেঠো আলপথ)
    // Homestead 1 to Riverside
    this.createEarthenPath(parent, -25, 66, -25, 93, 2.2);
    // East Pucca House to Riverside
    this.createEarthenPath(parent, 52, 54, 52, 93, 2.2);
    // West Village Road to Pond & Northwest Homestead
    this.createEarthenPath(parent, -60, -10, -60, -45, 2.2);
    // Mosque to Northeast Fields
    this.createEarthenPath(parent, 35, -84, 55, -72, 1.8);
    // School to Northwest Rice Fields
    this.createEarthenPath(parent, -72, -88, -74, -72, 1.8);
  },

  // ================= 12. ABALPUR JAME MOSQUE & COURTYARD (আবালপুর জামে মসজিদ) =================
  createAbalpurMosque: function(parent) {
    const mosqueGroup = new THREE.Group();
    mosqueGroup.name = "AbalpurJameMosque";

    // Common materials
    const whitePlasterMat = new THREE.MeshLambertMaterial({ color: 0xf5f8f5 });
    const greenTrimMat = new THREE.MeshLambertMaterial({ color: 0x1b6837 });
    const goldFinialMat = new THREE.MeshLambertMaterial({ color: 0xd4af37 });
    const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x422d1b });
    const terracottaMat = new THREE.MeshLambertMaterial({ color: 0x9c4e36 });
    const concreteMat = this.sharedMats.cementPlatform || new THREE.MeshLambertMaterial({ color: 0x8a8f94 });

    const cx = 35;
    const cz = -98;

    // A. Raised Plinth (চাতাল / বেদি)
    const plinthMesh = new THREE.Mesh(new THREE.BoxGeometry(15.5, 0.6, 12.5), concreteMat);
    plinthMesh.position.set(cx, 0.3, cz);
    plinthMesh.receiveShadow = true;
    mosqueGroup.add(plinthMesh);

    // Entrance Steps on West face (facing courtyard)
    for (let s = 0; s < 3; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 5.0), terracottaMat);
      step.position.set(cx - 7.8 - s * 0.4, 0.5 - s * 0.18, cz);
      step.receiveShadow = true;
      mosqueGroup.add(step);
    }

    // B. Main Prayer Hall Structure (নামাজ ঘর)
    const hallMesh = new THREE.Mesh(new THREE.BoxGeometry(14.0, 5.2, 11.0), whitePlasterMat);
    hallMesh.position.set(cx, 3.2, cz);
    hallMesh.castShadow = true;
    hallMesh.receiveShadow = true;
    mosqueGroup.add(hallMesh);

    // Green frieze band along roofline
    const friezeMesh = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.45, 11.2), greenTrimMat);
    friezeMesh.position.set(cx, 5.7, cz);
    mosqueGroup.add(friezeMesh);

    // Low Roof Parapet with Islamic Crenellations
    const parapetGeo = new THREE.BoxGeometry(14.1, 0.5, 11.1);
    const parapetMesh = new THREE.Mesh(parapetGeo, whitePlasterMat);
    parapetMesh.position.set(cx, 6.05, cz);
    mosqueGroup.add(parapetMesh);

    // C. Arched Entrance Veranda (পশ্চিমমুখী বারান্দা)
    // 4 square columns supporting the entrance arches
    const pillarGeo = new THREE.BoxGeometry(0.45, 4.0, 0.45);
    for (let pz of [-4.2, -1.4, 1.4, 4.2]) {
      const pillar = new THREE.Mesh(pillarGeo, whitePlasterMat);
      pillar.position.set(cx - 6.8, 2.6, cz + pz);
      pillar.castShadow = true;
      mosqueGroup.add(pillar);
    }
    // Veranda roof canopy
    const verandaRoof = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 11.2), greenTrimMat);
    verandaRoof.position.set(cx - 6.0, 4.8, cz);
    mosqueGroup.add(verandaRoof);

    // Double Wooden Entrance Doors (West wall)
    const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.2, 2.2), darkWoodMat);
    doorMesh.position.set(cx - 7.02, 2.2, cz);
    mosqueGroup.add(doorMesh);

    // Arched Windows on North and South sides
    const winGeo = new THREE.BoxGeometry(0.08, 2.0, 1.4);
    for (let wx of [-3.5, 0, 3.5]) {
      // North windows
      const nWin = new THREE.Mesh(winGeo, greenTrimMat);
      nWin.position.set(cx + wx, 3.2, cz - 5.52);
      mosqueGroup.add(nWin);
      // South windows
      const sWin = new THREE.Mesh(winGeo, greenTrimMat);
      sWin.position.set(cx + wx, 3.2, cz + 5.52);
      mosqueGroup.add(sWin);
    }

    // D. Central Green Dome (সবুজ গম্বুজ)
    // Octagonal Tambour Drum
    const drumGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.9, 8);
    const drumMesh = new THREE.Mesh(drumGeo, whitePlasterMat);
    drumMesh.position.set(cx, 6.7, cz);
    mosqueGroup.add(drumMesh);

    // Main Dome
    const domeGeo = new THREE.SphereGeometry(3.0, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const domeMat = new THREE.MeshPhongMaterial({
      color: 0x15733d,
      shininess: 45
    });
    const domeMesh = new THREE.Mesh(domeGeo, domeMat);
    domeMesh.position.set(cx, 7.15, cz);
    domeMesh.castShadow = true;
    mosqueGroup.add(domeMesh);

    // Golden Spire & Crescent Finial (চাঁদ-তারা ও কলস)
    const spireGeo = new THREE.CylinderGeometry(0.08, 0.14, 1.8, 6);
    const spireMesh = new THREE.Mesh(spireGeo, goldFinialMat);
    spireMesh.position.set(cx, 10.5, cz);
    mosqueGroup.add(spireMesh);

    const crescentGeo = new THREE.TorusGeometry(0.35, 0.06, 6, 12, Math.PI * 1.5);
    const crescentMesh = new THREE.Mesh(crescentGeo, goldFinialMat);
    crescentMesh.position.set(cx, 11.3, cz);
    crescentMesh.rotation.y = Math.PI / 4;
    mosqueGroup.add(crescentMesh);

    // E. Slender Corner Minaret Tower (মিনার)
    const mx = cx - 8.0; // x = 27
    const mz = cz - 6.0; // z = -104

    // Square base plinth
    const mBase = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 2.6), whitePlasterMat);
    mBase.position.set(mx, 1.3, mz);
    mosqueGroup.add(mBase);

    // Tall Octagonal Shaft
    const mShaftGeo = new THREE.CylinderGeometry(1.0, 1.25, 9.8, 8);
    const mShaft = new THREE.Mesh(mShaftGeo, whitePlasterMat);
    mShaft.position.set(mx, 7.5, mz);
    mShaft.castShadow = true;
    mosqueGroup.add(mShaft);

    // Balcony Gallery with green railing
    const mBalcony = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.35, 10), greenTrimMat);
    mBalcony.position.set(mx, 12.5, mz);
    mosqueGroup.add(mBalcony);

    // 4 Loudspeaker Horns (মাইক) pointing in 4 cardinal directions
    const speakerGeo = new THREE.ConeGeometry(0.28, 0.7, 6);
    const speakerMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
    const dirs = [
      { r: [0, 0, Math.PI / 2], o: [-0.9, 0, 0] },
      { r: [0, 0, -Math.PI / 2], o: [0.9, 0, 0] },
      { r: [Math.PI / 2, 0, 0], o: [0, 0, -0.9] },
      { r: [-Math.PI / 2, 0, 0], o: [0, 0, 0.9] }
    ];
    dirs.forEach(d => {
      const sp = new THREE.Mesh(speakerGeo, speakerMat);
      sp.rotation.set(d.r[0], d.r[1], d.r[2]);
      sp.position.set(mx + d.o[0], 12.0, mz + d.o[2]);
      mosqueGroup.add(sp);
    });

    // Upper Minaret Shaft & Domelet
    const mUpperGeo = new THREE.CylinderGeometry(0.7, 0.85, 2.2, 8);
    const mUpper = new THREE.Mesh(mUpperGeo, whitePlasterMat);
    mUpper.position.set(mx, 13.8, mz);
    mosqueGroup.add(mUpper);

    const mDomeletGeo = new THREE.SphereGeometry(0.85, 10, 8);
    const mDomelet = new THREE.Mesh(mDomeletGeo, domeMat);
    mDomelet.position.set(mx, 15.0, mz);
    mosqueGroup.add(mDomelet);

    const mFinial = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 1.2, 6), goldFinialMat);
    mFinial.position.set(mx, 16.0, mz);
    mosqueGroup.add(mFinial);

    // F. Mosque Courtyard & Boundary Wall (সাহান ও প্রাচীর)
    // Courtyard paved ground
    const yardGeo = new THREE.PlaneGeometry(26, 22);
    const yardMesh = new THREE.Mesh(yardGeo, concreteMat);
    yardMesh.rotation.x = -Math.PI / 2;
    yardMesh.position.set(31, 0.018, -97);
    yardMesh.receiveShadow = true;
    mosqueGroup.add(yardMesh);

    // Boundary walls around courtyard
    const wallH = 1.15;
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf2f4f2 });
    const copingMat = greenTrimMat;

    // North Wall: x = 18 to 44 at z = -108
    const nWall = new THREE.Mesh(new THREE.BoxGeometry(26, wallH, 0.35), wallMat);
    nWall.position.set(31, wallH / 2, -108);
    mosqueGroup.add(nWall);
    const nCoping = new THREE.Mesh(new THREE.BoxGeometry(26.2, 0.08, 0.45), copingMat);
    nCoping.position.set(31, wallH + 0.04, -108);
    mosqueGroup.add(nCoping);

    // South Wall: x = 18 to 44 at z = -86
    const sWall = new THREE.Mesh(new THREE.BoxGeometry(26, wallH, 0.35), wallMat);
    sWall.position.set(31, wallH / 2, -86);
    mosqueGroup.add(sWall);
    const sCoping = new THREE.Mesh(new THREE.BoxGeometry(26.2, 0.08, 0.45), copingMat);
    sCoping.position.set(31, wallH + 0.04, -86);
    mosqueGroup.add(sCoping);

    // West Wall with Entrance Gateway: x = 18 from z = -108 to -96 and -92 to -86
    const wWallN = new THREE.Mesh(new THREE.BoxGeometry(0.35, wallH, 12), wallMat);
    wWallN.position.set(18, wallH / 2, -102);
    mosqueGroup.add(wWallN);

    const wWallS = new THREE.Mesh(new THREE.BoxGeometry(0.35, wallH, 6), wallMat);
    wWallS.position.set(18, wallH / 2, -89);
    mosqueGroup.add(wWallS);

    // Entrance Gateway Arch (তোরণ) at x = 18, z = -94
    const gatePillarGeo = new THREE.BoxGeometry(0.65, 3.2, 0.65);
    const gp1 = new THREE.Mesh(gatePillarGeo, whitePlasterMat);
    gp1.position.set(18, 1.6, -96.2);
    mosqueGroup.add(gp1);
    const gp2 = new THREE.Mesh(gatePillarGeo, whitePlasterMat);
    gp2.position.set(18, 1.6, -91.8);
    mosqueGroup.add(gp2);

    const archBeam = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 5.0), greenTrimMat);
    archBeam.position.set(18, 3.4, -94);
    mosqueGroup.add(archBeam);

    // Bangla Mosque Signboard over the gate
    if (typeof TextureFactory !== 'undefined' && TextureFactory.createBengaliSignTexture) {
      const signTex = TextureFactory.createBengaliSignTexture(
        "আবালপুর জামে মসজিদ", "স্থাপিত: ১৯৮৫ ইং", "মাগুরা সদর", "green"
      );
      const signMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, 1.1),
        new THREE.MeshLambertMaterial({ map: signTex })
      );
      signMesh.rotation.y = -Math.PI / 2;
      signMesh.position.set(17.6, 4.2, -94);
      mosqueGroup.add(signMesh);
    }

    // G. Ablution Area / Ojur Khana (অজুখানা)
    const ojuGroup = new THREE.Group();
    ojuGroup.position.set(23, 0, -88);
    // Concrete basin platform
    const ojuBase = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.35, 2.6), concreteMat);
    ojuBase.position.set(0, 0.18, 0);
    ojuGroup.add(ojuBase);
    // Water trough
    const ojuTrough = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 0.8), new THREE.MeshLambertMaterial({ color: 0x4a7c59 }));
    ojuTrough.position.set(0, 0.45, -0.6);
    ojuGroup.add(ojuTrough);
    // 4 Brass Taps
    const tapMat = new THREE.MeshLambertMaterial({ color: 0xc49a45 });
    for (let tx of [-1.2, -0.4, 0.4, 1.2]) {
      const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 5), tapMat);
      tap.position.set(tx, 0.75, -0.2);
      ojuGroup.add(tap);
      // Sitting stool
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 8), terracottaMat);
      stool.position.set(tx, 0.3, 0.5);
      ojuGroup.add(stool);
    }
    // Covered Tin Canopy on 4 slim posts
    const postMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    for (let cpx of [-1.9, 1.9]) {
      for (let cpz of [-1.1, 1.1]) {
        const cp = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 5), postMat);
        cp.position.set(cpx, 1.2, cpz);
        ojuGroup.add(cp);
      }
    }
    const ojuRoof = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.8), greenTrimMat);
    ojuRoof.rotation.x = -Math.PI / 2;
    ojuRoof.position.set(0, 2.4, 0);
    ojuGroup.add(ojuRoof);

    // Large clay water pitcher (মাটির বড় কলস) beside Ojur Khana
    const clayMat = new THREE.MeshLambertMaterial({ color: 0x8a482b });
    const ojuPot = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), clayMat);
    ojuPot.position.set(2.4, 0.45, -0.4);
    ojuGroup.add(ojuPot);

    mosqueGroup.add(ojuGroup);

    // Wooden Shoe Rack (জুতার তাক) on Mosque entrance veranda
    const shoeRackMat = new THREE.MeshLambertMaterial({ color: 0x422d1b });
    const shoeRack = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 1.8), shoeRackMat);
    shoeRack.position.set(cx - 6.8, 0.45, cz + 3.2);
    shoeRack.castShadow = true;
    mosqueGroup.add(shoeRack);

    // Palms inside courtyard
    this.createBetelNutPalm(mosqueGroup, 20, -105);
    this.createBetelNutPalm(mosqueGroup, 42, -105);
    this.createCoconutPalm(mosqueGroup, 42, -88);

    parent.add(mosqueGroup);

    // Colliders
    this.colliders.push(
      // Main prayer hall building
      new THREE.Box3(new THREE.Vector3(cx - 7.5, 0, cz - 6.0), new THREE.Vector3(cx + 7.5, 6.2, cz + 6.0)),
      // Minaret tower
      new THREE.Box3(new THREE.Vector3(mx - 1.5, 0, mz - 1.5), new THREE.Vector3(mx + 1.5, 16.5, mz + 1.5)),
      // Courtyard North Wall
      new THREE.Box3(new THREE.Vector3(18, 0, -108.3), new THREE.Vector3(44, 1.4, -107.7)),
      // Courtyard South Wall
      new THREE.Box3(new THREE.Vector3(18, 0, -86.3), new THREE.Vector3(44, 1.4, -85.7)),
      // Courtyard West Wall North section
      new THREE.Box3(new THREE.Vector3(17.7, 0, -108), new THREE.Vector3(18.3, 1.4, -96.2)),
      // Courtyard West Wall South section
      new THREE.Box3(new THREE.Vector3(17.7, 0, -91.8), new THREE.Vector3(18.3, 1.4, -86)),
      // Ojur Khana tank
      new THREE.Box3(new THREE.Vector3(21.0, 0, -89.5), new THREE.Vector3(25.0, 1.5, -86.5))
    );
  },

  // ================= 13. ABALPUR PRIMARY SCHOOL & PLAYGROUND (সরকারি প্রাথমিক বিদ্যালয়) =================
  createPrimarySchool: function(parent) {
    const schoolGroup = new THREE.Group();
    schoolGroup.name = "AbalpurPrimarySchool";

    const sx = -54;
    const sz = -106;

    // Materials
    const schoolWallMat = new THREE.MeshLambertMaterial({ color: 0xf4f1ea });
    const blueBaseMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 });
    const redTinMat = new THREE.MeshLambertMaterial({ color: 0x991b1b });
    const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x3d2714 });
    const ironBarMat = new THREE.MeshLambertMaterial({ color: 0x242424 });
    const whiteGoalMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const concreteMat = this.sharedMats.cementPlatform || new THREE.MeshLambertMaterial({ color: 0x8a8f94 });

    // A. School Base Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(26.5, 0.45, 10.5), concreteMat);
    plinth.position.set(sx, 0.22, sz + 1.5);
    plinth.receiveShadow = true;
    schoolGroup.add(plinth);

    // Front veranda steps
    for (let st = 0; st < 2; st++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.15, 0.6), concreteMat);
      step.position.set(sx, 0.3 - st * 0.15, sz + 6.8 + st * 0.5);
      schoolGroup.add(step);
    }

    // B. School Building Main Structure (Facing South onto playground)
    const schoolBuilding = new THREE.Mesh(new THREE.BoxGeometry(25.0, 3.4, 7.0), schoolWallMat);
    schoolBuilding.position.set(sx, 1.95, sz);
    schoolBuilding.castShadow = true;
    schoolBuilding.receiveShadow = true;
    schoolGroup.add(schoolBuilding);

    // Blue lower wainscoting dado band (1.0m tall around base)
    const blueDado = new THREE.Mesh(new THREE.BoxGeometry(25.1, 1.0, 7.1), blueBaseMat);
    blueDado.position.set(sx, 0.75, sz);
    schoolGroup.add(blueDado);

    // C. Corrugated Red Tin Gable Roof (টিনের দোচালা চাল)
    const roofLeft = new THREE.Mesh(new THREE.PlaneGeometry(26.2, 4.6), redTinMat);
    roofLeft.rotation.x = 0.42;
    roofLeft.position.set(sx, 4.4, sz - 1.8);
    schoolGroup.add(roofLeft);

    const roofRight = new THREE.Mesh(new THREE.PlaneGeometry(26.2, 4.6), redTinMat);
    roofRight.rotation.x = -0.42;
    roofRight.position.set(sx, 4.4, sz + 1.8);
    schoolGroup.add(roofRight);

    // D. Front Corridor Veranda (দক্ষিণমুখী খোলা বারান্দা)
    // 6 square brick columns supporting the veranda roof
    const colGeo = new THREE.BoxGeometry(0.45, 3.2, 0.45);
    for (let cx = -11.5; cx <= 11.5; cx += 4.6) {
      const col = new THREE.Mesh(colGeo, schoolWallMat);
      col.position.set(sx + cx, 1.85, sz + 5.8);
      col.castShadow = true;
      schoolGroup.add(col);

      // Blue base for column
      const colBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.5), blueBaseMat);
      colBase.position.set(sx + cx, 0.7, sz + 5.8);
      schoolGroup.add(colBase);
    }

    // Veranda overhang roof
    const vRoof = new THREE.Mesh(new THREE.PlaneGeometry(26.0, 3.2), redTinMat);
    vRoof.rotation.x = -0.22;
    vRoof.position.set(sx, 3.75, sz + 4.6);
    schoolGroup.add(vRoof);

    // 3 Classroom Doors
    const doorGeo = new THREE.BoxGeometry(1.4, 2.6, 0.08);
    for (let dx of [-7.0, 0, 7.0]) {
      const door = new THREE.Mesh(doorGeo, darkWoodMat);
      door.position.set(sx + dx, 1.55, sz + 3.52);
      schoolGroup.add(door);
    }

    // 6 Windows with Security Grill Bars
    const winGeo = new THREE.BoxGeometry(1.6, 1.6, 0.08);
    for (let wx of [-10.5, -3.5, 3.5, 10.5]) {
      const win = new THREE.Mesh(winGeo, ironBarMat);
      win.position.set(sx + wx, 2.0, sz + 3.52);
      schoolGroup.add(win);
    }

    // Official Bangla Signboard on Veranda Roof
    if (typeof TextureFactory !== 'undefined' && TextureFactory.createBengaliSignTexture) {
      const signTex = TextureFactory.createBengaliSignTexture(
        "আবালপুর সপ্রাবি", "সরকারি প্রাথমিক বিদ্যালয়", "স্থাপিত: ১৯৭৮ ইং", "red"
      );
      const signMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(4.8, 1.2),
        new THREE.MeshLambertMaterial({ map: signTex })
      );
      signMesh.position.set(sx, 4.3, sz + 5.85);
      schoolGroup.add(signMesh);
    }

    // E. Grassy Playground (বিদ্যালয়ের খেলার মাঠ)
    const fieldGeo = new THREE.PlaneGeometry(38, 24);
    const fieldMat = new THREE.MeshLambertMaterial({ color: 0x3d6e2e });
    const fieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
    fieldMesh.rotation.x = -Math.PI / 2;
    fieldMesh.position.set(-54, 0.018, -90);
    fieldMesh.receiveShadow = true;
    schoolGroup.add(fieldMesh);

    // F. Two Rustic Football Goalposts (খেলার মাঠের গোলপোস্ট)
    // Goalpost function (posts + crossbar + ground frame)
    const createGoalpost = (gx, gz, rotY) => {
      const gpGroup = new THREE.Group();
      gpGroup.position.set(gx, 0, gz);
      gpGroup.rotation.y = rotY;

      const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6);
      const crossGeo = new THREE.CylinderGeometry(0.07, 0.07, 4.2, 6);
      crossGeo.rotateZ(Math.PI / 2);

      // 2 upright posts
      const p1 = new THREE.Mesh(postGeo, whiteGoalMat);
      p1.position.set(-2.0, 1.1, 0);
      gpGroup.add(p1);
      const p2 = new THREE.Mesh(postGeo, whiteGoalMat);
      p2.position.set(2.0, 1.1, 0);
      gpGroup.add(p2);

      // Crossbar
      const cross = new THREE.Mesh(crossGeo, whiteGoalMat);
      cross.position.set(0, 2.2, 0);
      gpGroup.add(cross);

      // Back stays (rustic wooden supports)
      const stayGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 5);
      const s1 = new THREE.Mesh(stayGeo, whiteGoalMat);
      s1.rotation.x = -0.55;
      s1.position.set(-2.0, 1.0, -0.6);
      gpGroup.add(s1);
      const s2 = new THREE.Mesh(stayGeo, whiteGoalMat);
      s2.rotation.x = -0.55;
      s2.position.set(2.0, 1.0, -0.6);
      gpGroup.add(s2);

      schoolGroup.add(gpGroup);
    };

    // East Goalpost (facing west)
    createGoalpost(-37, -90, -Math.PI / 2);
    // West Goalpost (facing east)
    createGoalpost(-71, -90, Math.PI / 2);

    // G. National Flagstand (জাতীয় পতাকার বেদি ও পতাকা)
    const flagGroup = new THREE.Group();
    flagGroup.position.set(-54, 0, -92);

    // 3-tier stepped circular concrete plinth
    const plinth1 = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.25, 12), concreteMat);
    plinth1.position.set(0, 0.125, 0);
    flagGroup.add(plinth1);
    const plinth2 = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.25, 12), concreteMat);
    plinth2.position.set(0, 0.375, 0);
    flagGroup.add(plinth2);
    const plinth3 = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.25, 12), concreteMat);
    plinth3.position.set(0, 0.625, 0);
    flagGroup.add(plinth3);

    // Steel Flagpole
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.07, 7.8, 8);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0xd1d5db });
    const poleMesh = new THREE.Mesh(poleGeo, poleMat);
    poleMesh.position.set(0, 4.65, 0);
    flagGroup.add(poleMesh);

    // Bangladesh Flag Canvas
    const flagCanvas = document.createElement('canvas');
    flagCanvas.width = 128;
    flagCanvas.height = 76;
    const flCtx = flagCanvas.getContext('2d');
    flCtx.fillStyle = '#006a4e'; // Bottle green
    flCtx.fillRect(0, 0, 128, 76);
    flCtx.fillStyle = '#f42a41'; // Red circle
    flCtx.beginPath();
    flCtx.arc(58, 38, 24, 0, Math.PI * 2);
    flCtx.fill();

    const flagTex = new THREE.CanvasTexture(flagCanvas);
    const flagMat = new THREE.MeshLambertMaterial({
      map: flagTex,
      side: THREE.DoubleSide
    });
    const flagCloth = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1), flagMat);
    flagCloth.position.set(0.95, 7.8, 0);
    flagGroup.add(flagCloth);

    schoolGroup.add(flagGroup);

    // H. Historic Banyan Tree with Circular Sitting Platform (বটতলা চত্বর)
    const banyanX = -44;
    const banyanZ = -84;
    // Circular sitting bench
    const benchGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.55, 14);
    const benchMesh = new THREE.Mesh(benchGeo, new THREE.MeshLambertMaterial({ color: 0xf1f5f9 }));
    benchMesh.position.set(banyanX, 0.275, banyanZ);
    schoolGroup.add(benchMesh);
    // Tree
    this.createShadeTree(schoolGroup, banyanX, banyanZ, 5.2);

    // I. School Tube Well
    this.createTubeWell(schoolGroup, -68, -102);

    // J. Boundary Wall & Main Entrance Gate
    const bWallMat = new THREE.MeshLambertMaterial({ color: 0x993d2d });
    // East wall: x = -36 from z = -110 to -80
    const eWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.3, 30), bWallMat);
    eWall.position.set(-36, 0.65, -95);
    schoolGroup.add(eWall);
    // West wall: x = -72 from z = -110 to -80
    const wWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.3, 30), bWallMat);
    wWall.position.set(-72, 0.65, -95);
    schoolGroup.add(wWall);
    // South wall with entrance gate opening at x = -40
    const sWall1 = new THREE.Mesh(new THREE.BoxGeometry(28, 1.3, 0.35), bWallMat);
    sWall1.position.set(-58, 0.65, -80);
    schoolGroup.add(sWall1);

    // Gate pillars
    const gpGeo = new THREE.BoxGeometry(0.7, 2.2, 0.7);
    const gPillar1 = new THREE.Mesh(gpGeo, bWallMat);
    gPillar1.position.set(-42.5, 1.1, -80);
    schoolGroup.add(gPillar1);
    const gPillar2 = new THREE.Mesh(gpGeo, bWallMat);
    gPillar2.position.set(-37.5, 1.1, -80);
    schoolGroup.add(gPillar2);

    // School Notice Board on wooden posts (নোটিশ বোর্ড) near main entrance
    const noticeBoardGroup = new THREE.Group();
    noticeBoardGroup.position.set(-35.5, 0, -82.5);
    const nbPostMat = new THREE.MeshLambertMaterial({ color: 0x4a3424 });
    const nbP1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 5), nbPostMat);
    nbP1.position.set(-0.8, 1.0, 0);
    noticeBoardGroup.add(nbP1);
    const nbP2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 5), nbPostMat);
    nbP2.position.set(0.8, 1.0, 0);
    noticeBoardGroup.add(nbP2);
    const nbBoardMat = new THREE.MeshLambertMaterial({ color: 0x1e3a8a });
    const nbBoard = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.06), nbBoardMat);
    nbBoard.position.set(0, 1.45, 0);
    noticeBoardGroup.add(nbBoard);
    schoolGroup.add(noticeBoardGroup);

    // 2 Rustic Wooden Benches along the school playground perimeter
    const benchMat = new THREE.MeshLambertMaterial({ color: 0x5a3d24 });
    const bench1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.6), benchMat);
    bench1.position.set(-66, 0.22, -81.5);
    schoolGroup.add(bench1);

    const bench2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.6), benchMat);
    bench2.position.set(-48, 0.22, -81.5);
    schoolGroup.add(bench2);

    parent.add(schoolGroup);

    // Colliders
    this.colliders.push(
      // School building
      new THREE.Box3(new THREE.Vector3(sx - 13.0, 0, sz - 4.0), new THREE.Vector3(sx + 13.0, 5.2, sz + 6.2)),
      // East Boundary Wall
      new THREE.Box3(new THREE.Vector3(-36.3, 0, -110), new THREE.Vector3(-35.7, 1.4, -80)),
      // West Boundary Wall
      new THREE.Box3(new THREE.Vector3(-72.3, 0, -110), new THREE.Vector3(-71.7, 1.4, -80)),
      // South Boundary Wall (leaves gate opening from -42.5 to -37.5)
      new THREE.Box3(new THREE.Vector3(-72.0, 0, -80.3), new THREE.Vector3(-42.5, 1.4, -79.7)),
      // Notice board
      new THREE.Box3(new THREE.Vector3(-36.5, 0, -82.8), new THREE.Vector3(-34.5, 2.0, -82.2)),
      // Flagstand
      new THREE.Box3(new THREE.Vector3(-55.6, 0, -93.6), new THREE.Vector3(-52.4, 1.0, -90.4)),
      // Banyan Bench
      new THREE.Box3(new THREE.Vector3(banyanX - 2.4, 0, banyanZ - 2.4), new THREE.Vector3(banyanX + 2.4, 0.7, banyanZ + 2.4)),
      // East Goalpost
      new THREE.Box3(new THREE.Vector3(-38.5, 0, -92.2), new THREE.Vector3(-36.5, 2.3, -87.8)),
      // West Goalpost
      new THREE.Box3(new THREE.Vector3(-71.5, 0, -92.2), new THREE.Vector3(-69.5, 2.3, -87.8))
    );
  },

  // ================= 14. AUTO RICE MILL & INDUSTRIAL CHATAL YARD (অটো রাইস মিল ও চাতাল) =================
  createRiceMillAndChatal: function(parent) {
    const millGroup = new THREE.Group();
    millGroup.name = "AbalpurAutoRiceMill";

    const rx = 76;
    const rz = 2;

    // Materials
    const zincTinMat = new THREE.MeshLambertMaterial({ color: 0x8a959e });
    const darkMetalMat = new THREE.MeshLambertMaterial({ color: 0x374151 });
    const redBrickMat = new THREE.MeshLambertMaterial({ color: 0x944131 });
    const juteSackMat = new THREE.MeshLambertMaterial({ color: 0xa88d61 });
    const chatalFloorMat = new THREE.MeshLambertMaterial({ color: 0xd6d3cb });
    const yellowPaddyMat = new THREE.MeshLambertMaterial({ color: 0xd4a037 });
    const concreteMat = this.sharedMats.cementPlatform || new THREE.MeshLambertMaterial({ color: 0x8a8f94 });

    // A. Main Mill Warehouse Shed (রাইস মিল শেড)
    const shedMesh = new THREE.Mesh(new THREE.BoxGeometry(20.0, 6.2, 12.0), zincTinMat);
    shedMesh.position.set(rx, 3.1, rz);
    shedMesh.castShadow = true;
    shedMesh.receiveShadow = true;
    millGroup.add(shedMesh);

    // Industrial Pitched Roof with ventilation lantern monitor
    const roofLeft = new THREE.Mesh(new THREE.PlaneGeometry(21.0, 7.2), darkMetalMat);
    roofLeft.rotation.x = 0.44;
    roofLeft.position.set(rx, 7.2, rz - 3.2);
    millGroup.add(roofLeft);

    const roofRight = new THREE.Mesh(new THREE.PlaneGeometry(21.0, 7.2), darkMetalMat);
    roofRight.rotation.x = -0.44;
    roofRight.position.set(rx, 7.2, rz + 3.2);
    millGroup.add(roofRight);

    // Roof ventilation ridge lantern
    const ventMesh = new THREE.Mesh(new THREE.BoxGeometry(16.0, 1.0, 2.4), darkMetalMat);
    ventMesh.position.set(rx, 8.4, rz);
    millGroup.add(ventMesh);

    // Large Sliding Cargo Doors on South wall
    const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.8, 0.15), darkMetalMat);
    doorMesh.position.set(rx, 1.9, rz + 6.05);
    millGroup.add(doorMesh);

    // Raised Loading Dock Platform
    const dockMesh = new THREE.Mesh(new THREE.BoxGeometry(8.0, 1.0, 3.5), concreteMat);
    dockMesh.position.set(rx, 0.5, rz + 7.7);
    dockMesh.receiveShadow = true;
    millGroup.add(dockMesh);

    // B. Tall Boiler Chimney Stack (বয়লারের চিমনি)
    const chimX = rx + 9.0; // x = 85
    const chimZ = rz - 5.0; // z = -3
    const chimMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 14.0, 2.4), redBrickMat);
    chimMesh.position.set(chimX, 7.0, chimZ);
    chimMesh.castShadow = true;
    millGroup.add(chimMesh);

    // Black soot cap at chimney rim
    const chimRim = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.6, 2.6), darkMetalMat);
    chimRim.position.set(chimX, 14.1, chimZ);
    millGroup.add(chimRim);

    // C. Chatal Concrete Drying Yard (ধান শুকানোর চাতাল)
    const chatalMesh = new THREE.Mesh(new THREE.PlaneGeometry(26, 22), chatalFloorMat);
    chatalMesh.rotation.x = -Math.PI / 2;
    chatalMesh.position.set(72, 0.04, 24);
    chatalMesh.receiveShadow = true;
    millGroup.add(chatalMesh);

    // Low brick perimeter kerb around drying floor
    const kerbMat = redBrickMat;
    const k1 = new THREE.Mesh(new THREE.BoxGeometry(26.4, 0.35, 0.3), kerbMat);
    k1.position.set(72, 0.18, 13);
    millGroup.add(k1);
    const k2 = new THREE.Mesh(new THREE.BoxGeometry(26.4, 0.35, 0.3), kerbMat);
    k2.position.set(72, 0.18, 35);
    millGroup.add(k2);
    const k3 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 22), kerbMat);
    k3.position.set(59, 0.18, 24);
    millGroup.add(k3);
    const k4 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 22), kerbMat);
    k4.position.set(85, 0.18, 24);
    millGroup.add(k4);

    // Raked Golden Paddy Rice Strips on Chatal (শুকনো ধানের শাড়ি)
    for (let rz_i = 16; rz_i <= 32; rz_i += 3.5) {
      const paddyStrip = new THREE.Mesh(new THREE.BoxGeometry(22, 0.12, 1.8), yellowPaddyMat);
      paddyStrip.position.set(72, 0.1, rz_i);
      millGroup.add(paddyStrip);
    }

    // D. Jute Burlap Grain Sack Stacks (পাটের ধানের বস্তার স্তূপ - High Tactical FPS Cover)
    const createSackStack = (bx, bz, cols, rows, layers) => {
      const sackGeo = new THREE.BoxGeometry(1.0, 0.45, 0.65);
      for (let l = 0; l < layers; l++) {
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            const sack = new THREE.Mesh(sackGeo, juteSackMat);
            sack.position.set(
              bx + (c - cols / 2 + 0.5) * 1.05 + (Math.random() - 0.5) * 0.06,
              0.23 + l * 0.46,
              bz + (r - rows / 2 + 0.5) * 0.7 + (Math.random() - 0.5) * 0.06
            );
            sack.rotation.y = (Math.random() - 0.5) * 0.12;
            sack.castShadow = true;
            millGroup.add(sack);
          }
        }
      }
    };

    // Stack 1: Tall 5-layer stack (h = 2.3m) at x = 63, z = 18
    createSackStack(63, 18, 3, 2, 5);
    // Stack 2: Medium 3-layer stack (h = 1.4m) at x = 69, z = 28
    createSackStack(69, 28, 2, 2, 3);
    // Stack 3: Loading dock sack pile at x = 74, z = 10
    createSackStack(74, 10, 2, 1, 2);

    // Wooden Grain Scrapers / Levelers (ধান টানার কাঠের কুলা / মুগুর) leaning against chatal kerb
    const scraperMat = new THREE.MeshLambertMaterial({ color: 0x5a3d24 });
    const createScraper = (sx, sz, rotY) => {
      const scrGroup = new THREE.Group();
      scrGroup.position.set(sx, 0.2, sz);
      scrGroup.rotation.y = rotY;
      scrGroup.rotation.z = -0.35; // leaning
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.6, 5), scraperMat);
      handle.position.set(0, 0.8, 0);
      scrGroup.add(handle);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.04), scraperMat);
      blade.position.set(0, 0.06, 0);
      scrGroup.add(blade);
      millGroup.add(scrGroup);
    };
    createScraper(59.4, 20, 0);
    createScraper(84.6, 26, Math.PI);

    // E. Parked Rural Cargo Carrier / Nosimon (মালবাহী ভটভটি / নসিমন)
    const nosimonGroup = new THREE.Group();
    nosimonGroup.position.set(64, 0, 8);

    // Wooden flatbed
    const bedMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 3.2), new THREE.MeshLambertMaterial({ color: 0x5a3d24 }));
    bedMesh.position.set(0, 0.75, 0);
    nosimonGroup.add(bedMesh);

    // Slat sides
    const slatMesh = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 0.1), new THREE.MeshLambertMaterial({ color: 0x3d7042 }));
    slatMesh.position.set(0, 1.1, 1.55);
    nosimonGroup.add(slatMesh);

    // Shallow horizontal diesel engine at front
    const engMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), darkMetalMat);
    engMesh.position.set(0, 0.8, -1.8);
    nosimonGroup.add(engMesh);

    // Rugged wheels
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.22, 10);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
    for (let wx of [-1.1, 1.1]) {
      const rw = new THREE.Mesh(wheelGeo, wheelMat);
      rw.position.set(wx, 0.42, 0.8);
      nosimonGroup.add(rw);
    }
    const fw = new THREE.Mesh(wheelGeo, wheelMat);
    fw.position.set(0, 0.42, -1.8);
    nosimonGroup.add(fw);

    millGroup.add(nosimonGroup);

    // F. Machinery & Fuel Shed Annex (যন্ত্রপাতি ও জ্বালানি শেড)
    const annexMesh = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.2, 4.5), zincTinMat);
    annexMesh.position.set(87, 1.6, 9);
    millGroup.add(annexMesh);

    // Fuel oil drums
    const drumGeo = new THREE.CylinderGeometry(0.38, 0.38, 1.0, 10);
    const blueDrumMat = new THREE.MeshLambertMaterial({ color: 0x1e3a8a });
    const redDrumMat = new THREE.MeshLambertMaterial({ color: 0x991b1b });
    const d1 = new THREE.Mesh(drumGeo, blueDrumMat);
    d1.position.set(84.5, 0.5, 12);
    millGroup.add(d1);
    const d2 = new THREE.Mesh(drumGeo, redDrumMat);
    d2.position.set(85.4, 0.5, 12);
    millGroup.add(d2);

    // Official Bangla Signboard on Mill Shed
    if (typeof TextureFactory !== 'undefined' && TextureFactory.createBengaliSignTexture) {
      const signTex = TextureFactory.createBengaliSignTexture(
        "আবালপুর অটো রাইস মিল", "পাইকারি ধান ও চাল ব্যবসায়ী", "প্রোঃ মোঃ রফিকুল ইসলাম", "blue"
      );
      const signMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(5.2, 1.3),
        new THREE.MeshLambertMaterial({ map: signTex })
      );
      signMesh.position.set(rx, 4.6, rz + 6.06);
      millGroup.add(signMesh);
    }

    parent.add(millGroup);

    // Colliders
    this.colliders.push(
      // Main Mill Warehouse
      new THREE.Box3(new THREE.Vector3(rx - 10.2, 0, rz - 6.2), new THREE.Vector3(rx + 10.2, 7.5, rz + 6.2)),
      // Boiler Chimney
      new THREE.Box3(new THREE.Vector3(chimX - 1.4, 0, chimZ - 1.4), new THREE.Vector3(chimX + 1.4, 14.5, chimZ + 1.4)),
      // Loading Dock
      new THREE.Box3(new THREE.Vector3(rx - 4.2, 0, rz + 6.0), new THREE.Vector3(rx + 4.2, 1.1, rz + 9.5)),
      // Tall Sack Stack
      new THREE.Box3(new THREE.Vector3(61.2, 0, 16.8), new THREE.Vector3(64.8, 2.4, 19.2)),
      // Medium Sack Stack
      new THREE.Box3(new THREE.Vector3(67.8, 0, 26.8), new THREE.Vector3(70.2, 1.5, 29.2)),
      // Parked Nosimon vehicle
      new THREE.Box3(new THREE.Vector3(62.5, 0, 6.2), new THREE.Vector3(65.5, 1.8, 9.8)),
      // Annex Shed
      new THREE.Box3(new THREE.Vector3(84.0, 0, 6.5), new THREE.Vector3(90.0, 3.5, 11.5))
    );
  },

  // ================= 15. SOUTH RIVERSIDE EMBANKMENT, BOAT GHAT & CREEK (নদী রক্ষা বাঁধ ও নৌকা ঘাট) =================
  createRiversideArea: function(parent) {
    const riverGroup = new THREE.Group();
    riverGroup.name = "AbalpurRiversideArea";

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5a3d24 });
    const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x3d2714 });
    const bambooMat = new THREE.MeshLambertMaterial({ color: 0x9e8749 });
    const siltMat = new THREE.MeshLambertMaterial({ color: 0x3d3122 });
    const reedMat = new THREE.MeshLambertMaterial({ color: 0x4a7a2c });
    const netMat = new THREE.MeshLambertMaterial({ color: 0x222222, transparent: true, opacity: 0.75, side: THREE.DoubleSide });

    // A. Flowing River Water Body (নদীর জলধারা)
    const riverW = 180;
    const riverD = 24;
    const waterTex = (typeof TextureFactory !== 'undefined' && TextureFactory.createWaterTexture)
      ? TextureFactory.createWaterTexture()
      : null;
    if (waterTex) waterTex.repeat.set(12, 2);

    const riverWaterMat = new THREE.MeshPhongMaterial({
      map: waterTex,
      color: 0x1d5e4b,
      shininess: 70,
      transparent: true,
      opacity: 0.92
    });
    const riverWater = new THREE.Mesh(new THREE.PlaneGeometry(riverW, riverD), riverWaterMat);
    riverWater.rotation.x = -Math.PI / 2;
    riverWater.position.set(0, -0.9, 110);
    riverGroup.add(riverWater);

    this.waterMeshes.push(riverWater);

    // Sloped Muddy Riverbank (নদীর নরম মাটির পাড়)
    const bankGeo = new THREE.PlaneGeometry(riverW, 6);
    const bankMesh = new THREE.Mesh(bankGeo, siltMat);
    bankMesh.rotation.x = -Math.PI / 2 + 0.28;
    bankMesh.position.set(0, -0.4, 96.5);
    bankMesh.receiveShadow = true;
    riverGroup.add(bankMesh);

    // B. Main River Landing Ghat (নৌকা ঘাট)
    const ghatGroup = new THREE.Group();
    ghatGroup.position.set(0, 0, 95);

    // 5 Descending Stepped Slabs into the river
    for (let i = 0; i < 5; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.25, 1.8), woodMat);
      step.position.set(0, 0.1 - i * 0.24, i * 1.6);
      step.receiveShadow = true;
      ghatGroup.add(step);
    }

    // 4 Sturdy Mooring Poles (নৌকা বাঁধার বাঁশের/কাঠের খুঁটি)
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.12, 2.6, 6);
    for (let px of [-2.8, 2.8]) {
      const p1 = new THREE.Mesh(poleGeo, darkWoodMat);
      p1.position.set(px, 0.8, 1.5);
      ghatGroup.add(p1);

      const p2 = new THREE.Mesh(poleGeo, darkWoodMat);
      p2.position.set(px, 0.2, 5.5);
      ghatGroup.add(p2);
    }
    riverGroup.add(ghatGroup);

    // C. Traditional Wooden Dinghy Boats (ডিঙ্গি নৌকা)
    const createDinghy = (bx, bz, rotY, hasHood = false) => {
      const boat = new THREE.Group();
      boat.position.set(bx, -0.85, bz);
      boat.rotation.y = rotY;

      // Curved wooden hull
      const hullGeo = new THREE.BoxGeometry(1.5, 0.55, 6.2);
      const hull = new THREE.Mesh(hullGeo, woodMat);
      hull.position.set(0, 0.2, 0);
      boat.add(hull);

      // Tapered prow and stern blocks
      const prowGeo = new THREE.ConeGeometry(0.75, 1.4, 5);
      prowGeo.rotateX(Math.PI / 2);
      const prow = new THREE.Mesh(prowGeo, darkWoodMat);
      prow.position.set(0, 0.25, 3.6);
      boat.add(prow);

      const stern = new THREE.Mesh(prowGeo, darkWoodMat);
      stern.rotation.x = Math.PI;
      stern.position.set(0, 0.25, -3.6);
      boat.add(stern);

      // Arched Woven Bamboo Hood (নৌকার ছই)
      if (hasHood) {
        const hoodGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.6, 8, 1, true, 0, Math.PI);
        hoodGeo.rotateZ(Math.PI / 2);
        const hoodMat = new THREE.MeshLambertMaterial({ color: 0x947847, side: THREE.DoubleSide });
        const hood = new THREE.Mesh(hoodGeo, hoodMat);
        hood.position.set(0, 0.6, 0);
        boat.add(hood);
      }

      // Wooden Oar (বৈঠা)
      const oarShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 5), darkWoodMat);
      oarShaft.rotation.x = 0.5;
      oarShaft.position.set(0.65, 0.5, -0.5);
      boat.add(oarShaft);

      riverGroup.add(boat);
    };

    // Boat 1 (Ghat Dinghy with arched hood)
    createDinghy(-3.6, 102.5, 0.15, true);
    // Boat 2 (Open Fishing Dinghy on East bank)
    createDinghy(22.0, 102.0, -0.22, false);
    // Boat 3 (West Bank Dinghy near footbridge)
    createDinghy(-42.0, 102.0, 0.1, false);

    // D. Bamboo Fishing Net Drying Racks (মাছের জাল শুকানোর মাচা)
    const createNetRack = (rx, rz) => {
      const rackGroup = new THREE.Group();
      rackGroup.position.set(rx, 0, rz);

      const pGeo = new THREE.CylinderGeometry(0.06, 0.08, 2.4, 5);
      for (let px of [-3.5, 0, 3.5]) {
        const post = new THREE.Mesh(pGeo, bambooMat);
        post.position.set(px, 1.2, 0);
        rackGroup.add(post);
      }
      // Horizontal bamboo crossbars
      const crossGeo = new THREE.CylinderGeometry(0.05, 0.05, 7.4, 5);
      crossGeo.rotateZ(Math.PI / 2);
      const topBar = new THREE.Mesh(crossGeo, bambooMat);
      topBar.position.set(0, 2.2, 0);
      rackGroup.add(topBar);

      // Draped fishing net mesh (tactical soft cover)
      const net = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.8), netMat);
      net.position.set(0, 1.3, 0);
      rackGroup.add(net);

      riverGroup.add(rackGroup);
    };

    createNetRack(-16, 94.5);
    createNetRack(28, 94.5);

    // Bamboo Fishing Traps / Polo (মাছের পলো / চাঁই) on riverbank
    const createPoloTrap = (px, pz) => {
      const trap = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.75, 7), bambooMat);
      trap.position.set(px, 0.35, pz);
      trap.castShadow = true;
      riverGroup.add(trap);
    };
    createPoloTrap(-20.5, 95.5);
    createPoloTrap(24.5, 95.5);

    // E. Bamboo Footbridge across marshy creek inlet (বাঁশের সাঁকো)
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(-48, 0, 93.5);

    // Bridge walkway deck (bamboo poles tied together)
    const deckGeo = new THREE.BoxGeometry(8.5, 0.22, 1.4);
    const deck = new THREE.Mesh(deckGeo, bambooMat);
    deck.position.set(0, 0.45, 0);
    deck.receiveShadow = true;
    bridgeGroup.add(deck);

    // Stilts / diagonal bracing poles
    const stiltGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.6, 5);
    for (let sx of [-3.2, 0, 3.2]) {
      for (let sz of [-0.6, 0.6]) {
        const stilt = new THREE.Mesh(stiltGeo, bambooMat);
        stilt.position.set(sx, -0.2, sz);
        bridgeGroup.add(stilt);
      }
    }

    // Upright handrail posts and rope rail
    const hrPostGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.1, 5);
    const hrBarGeo = new THREE.CylinderGeometry(0.035, 0.035, 8.5, 5);
    hrBarGeo.rotateZ(Math.PI / 2);

    for (let sx of [-3.8, -1.2, 1.2, 3.8]) {
      const hrP = new THREE.Mesh(hrPostGeo, bambooMat);
      hrP.position.set(sx, 1.0, 0.65);
      bridgeGroup.add(hrP);
    }
    const hrBar = new THREE.Mesh(hrBarGeo, bambooMat);
    hrBar.position.set(0, 1.5, 0.65);
    bridgeGroup.add(hrBar);

    riverGroup.add(bridgeGroup);

    // F. Riverside Shade Trees & Kashful Reeds (হিজল গাছ ও কাশফুল) - Grassy verges & banks
    this.createShadeTree(riverGroup, -28, 85.5, 3.8); // North grassy verge
    this.createShadeTree(riverGroup, 40, 85.5, 3.8);  // North grassy verge
    this.createCoconutPalm(riverGroup, -12, 85.0);    // North roadside border
    this.createCoconutPalm(riverGroup, 14, 96.2);     // Waterfront bank
    this.createBetelNutPalm(riverGroup, -60, 85.0);   // North embankment verge

    // Reeds along water line
    const reedGeo = new THREE.ConeGeometry(0.35, 1.6, 4);
    for (let rx = -70; rx <= 70; rx += 8) {
      const reed = new THREE.Mesh(reedGeo, reedMat);
      reed.position.set(rx + (Math.random() - 0.5) * 3, 0.1, 98.2);
      riverGroup.add(reed);
    }

    parent.add(riverGroup);

    // Colliders
    this.colliders.push(
      // River deep water edge barrier
      new THREE.Box3(new THREE.Vector3(-90, -2.5, 104), new THREE.Vector3(90, 0.5, 122)),
      // Boat 1
      new THREE.Box3(new THREE.Vector3(-5.2, -1.0, 100.5), new THREE.Vector3(-2.0, 0.8, 104.5)),
      // Boat 2
      new THREE.Box3(new THREE.Vector3(20.4, -1.0, 100.0), new THREE.Vector3(23.6, 0.8, 104.0)),
      // Net Rack 1
      new THREE.Box3(new THREE.Vector3(-19.8, 0, 94.0), new THREE.Vector3(-12.2, 2.3, 95.0)),
      // Net Rack 2
      new THREE.Box3(new THREE.Vector3(24.2, 0, 94.0), new THREE.Vector3(31.8, 2.3, 95.0)),
      // Mooring poles at ghat
      new THREE.Box3(new THREE.Vector3(-3.2, 0, 99.5), new THREE.Vector3(-2.4, 1.8, 101.5)),
      new THREE.Box3(new THREE.Vector3(2.4, 0, 99.5), new THREE.Vector3(3.2, 1.8, 101.5))
    );
  },

  // ================= 16. ABALPUR COMMUNITY HEALTH CLINIC (কমিউনিটি ক্লিনিক) =================
  createCommunityClinic: function(parent) {
    const clinicGroup = new THREE.Group();
    clinicGroup.name = "AbalpurCommunityClinic";

    const cx = -26;
    const cz = 24;

    // Materials
    const clinicWallMat = new THREE.MeshLambertMaterial({ color: 0xe6f4ea });
    const greenPlinthMat = new THREE.MeshLambertMaterial({ color: 0x166534 });
    const darkTrimMat = new THREE.MeshLambertMaterial({ color: 0x14532d });
    const darkGlassMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const concreteMat = this.sharedMats.cementPlatform || new THREE.MeshLambertMaterial({ color: 0x8a8f94 });

    // A. Concrete Plinth with dark green base
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.45, 8.8), greenPlinthMat);
    plinth.position.set(cx, 0.22, cz);
    plinth.receiveShadow = true;
    clinicGroup.add(plinth);

    // B. Main 1-Story Pucca Clinic Building
    const buildingMesh = new THREE.Mesh(new THREE.BoxGeometry(11.0, 3.4, 8.0), clinicWallMat);
    buildingMesh.position.set(cx, 1.95, cz);
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    clinicGroup.add(buildingMesh);

    // Flat roof with parapet
    const roofParapet = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.4, 8.2), darkTrimMat);
    roofParapet.position.set(cx, 3.8, cz);
    clinicGroup.add(roofParapet);

    // White Water Tank on Roof
    const tankGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.4, 10);
    const tankMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(cx + 3.5, 4.7, cz + 2.0);
    clinicGroup.add(tank);

    // C. Entrance Portico / Porch (North face towards alley)
    const porchGroup = new THREE.Group();
    porchGroup.position.set(cx, 0, cz - 4.2);

    // 2 square concrete pillars
    const pilGeo = new THREE.BoxGeometry(0.4, 3.0, 0.4);
    const pil1 = new THREE.Mesh(pilGeo, clinicWallMat);
    pil1.position.set(-1.6, 1.5, -1.2);
    porchGroup.add(pil1);
    const pil2 = new THREE.Mesh(pilGeo, clinicWallMat);
    pil2.position.set(1.6, 1.5, -1.2);
    porchGroup.add(pil2);

    // Porch roof slab
    const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.3, 2.6), darkTrimMat);
    porchRoof.position.set(0, 3.1, -0.6);
    porchGroup.add(porchRoof);

    // Entrance steps and ramp
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.22, 1.2), concreteMat);
    ramp.position.set(0, 0.11, -1.6);
    porchGroup.add(ramp);

    // Double entrance glass doors
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 0.08), darkGlassMat);
    door.position.set(0, 1.45, 0.15);
    porchGroup.add(door);

    // Medicine Dispensary Counter Window on veranda
    const dispWin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 0.08), darkGlassMat);
    dispWin.position.set(3.2, 1.6, 0.15);
    porchGroup.add(dispWin);

    clinicGroup.add(porchGroup);

    // Official Bangla Signboard over the Entrance
    if (typeof TextureFactory !== 'undefined' && TextureFactory.createBengaliSignTexture) {
      const signTex = TextureFactory.createBengaliSignTexture(
        "আবালপুর কমিউনিটি ক্লিনিক", "স্বাস্থ্য ও পরিবার কল্যাণ কেন্দ্র", "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার", "green"
      );
      const signMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, 0.95),
        new THREE.MeshLambertMaterial({ map: signTex })
      );
      signMesh.position.set(cx, 3.7, cz - 4.85);
      clinicGroup.add(signMesh);
    }

    // D. Waiting Bench in Courtyard
    const benchMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.6), concreteMat);
    benchMesh.position.set(cx - 3.8, 0.23, cz - 2.8);
    clinicGroup.add(benchMesh);

    // E. Front Low Brick Fence & Flowerbed
    const fenceMat = new THREE.MeshLambertMaterial({ color: 0x8a3c2e });
    const f1 = new THREE.Mesh(new THREE.BoxGeometry(14.0, 1.0, 0.25), fenceMat);
    f1.position.set(cx, 0.5, cz - 6.5);
    clinicGroup.add(f1);

    parent.add(clinicGroup);

    // Colliders
    this.colliders.push(
      // Main Clinic Building
      new THREE.Box3(new THREE.Vector3(cx - 5.8, 0, cz - 4.2), new THREE.Vector3(cx + 5.8, 4.2, cz + 4.2)),
      // Entrance Porch
      new THREE.Box3(new THREE.Vector3(cx - 2.2, 0, cz - 5.6), new THREE.Vector3(cx + 2.2, 3.2, cz - 4.2)),
      // Waiting Bench
      new THREE.Box3(new THREE.Vector3(cx - 5.1, 0, cz - 3.2), new THREE.Vector3(cx - 2.5, 0.6, cz - 2.4)),
      // Front boundary fence (leaving entrance gap)
      new THREE.Box3(new THREE.Vector3(cx - 7.0, 0, cz - 6.7), new THREE.Vector3(cx - 2.2, 1.1, cz - 6.3)),
      new THREE.Box3(new THREE.Vector3(cx + 2.2, 0, cz - 6.7), new THREE.Vector3(cx + 7.0, 1.1, cz - 6.3))
    );
  },
  createPerimeterEnclosure: function(parent) {
    // Keep combat contained within the expanded village battleground
    const boundX = 94;
    const boundZ = 120;
    const boundH = 6;
    const boundThickness = 6;

    // 4 invisible perimeter boundary walls
    const nBound = new THREE.Box3(
      new THREE.Vector3(-boundX, 0, -boundZ - boundThickness),
      new THREE.Vector3(boundX, boundH, -boundZ)
    );
    const sBound = new THREE.Box3(
      new THREE.Vector3(-boundX, 0, boundZ),
      new THREE.Vector3(boundX, boundH, boundZ + boundThickness)
    );
    const wBound = new THREE.Box3(
      new THREE.Vector3(-boundX - boundThickness, 0, -boundZ),
      new THREE.Vector3(-boundX, boundH, boundZ)
    );
    const eBound = new THREE.Box3(
      new THREE.Vector3(boundX, 0, -boundZ),
      new THREE.Vector3(boundX + boundThickness, boundH, boundZ)
    );

    this.colliders.push(nBound, sBound, wBound, eBound);
  },

  // ================= 12. MINIMAP RADAR RENDERING =================
  drawMiniMap: function(ctx, w, h, fpsController) {
    if (!ctx || !fpsController) return;

    ctx.clearRect(0, 0, w, h);

    // Radar circular viewport mask
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2);
    ctx.clip();

    const scale = 0.85;
    const centerX = w / 2;
    const centerY = h / 2;

    // Heading-up rotation relative to player orientation
    ctx.translate(centerX, centerY);
    ctx.rotate(fpsController.yaw - Math.PI);
    ctx.translate(-fpsController.position.x * scale, -fpsController.position.z * scale);

    // 1. Green Rice Paddy Fields (ধানক্ষেত - subdivided plots & walking ails)
    ctx.fillStyle = 'rgba(42, 175, 75, 0.45)';
    const radarPaddyPlots = [
      // Northeast Plots
      [57, -71, 22, 18], [81, -71, 18, 22], [54, -49, 24, 22], [81, -47, 18, 22], [50, -23, 20, 10],
      // Southeast Plots
      [38, 22, 20, 14], [62, 22, 24, 14], [62, 40, 24, 24], [62, 67, 24, 18],
      // Northwest Plots
      [-85, -71, 22, 18], [-105, -69, 18, 22], [-85, -48, 22, 20],
      // Southwest Plots
      [-83, 37, 22, 18], [-85, 59, 22, 22]
    ];
    radarPaddyPlots.forEach(([px, pz, pw, pd]) => {
      ctx.fillRect(px * scale, pz * scale, pw * scale, pd * scale);
    });

    // 2. Village Pond (পুকুর)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-82 * scale, 8 * scale, 34 * scale, 24 * scale);

    // 2c. East Farm Doba / Pond (ছোট ডোবা)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(50 * scale, -32 * scale, 16 * scale, 12 * scale);

    // 2b. South River (প্রবাহমান নদী ও ঘাট)
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(-90 * scale, 98 * scale, 180 * scale, 24 * scale);
    ctx.fillStyle = '#64748b'; // Ghat stepped pier
    ctx.fillRect(-3 * scale, 93 * scale, 6 * scale, 9 * scale);

    // 3. Roads & Embankment
    ctx.fillStyle = '#b45309'; // Brick chowrasta
    ctx.fillRect(-22 * scale, -13 * scale, 44 * scale, 6.5 * scale);
    ctx.fillStyle = '#78350f'; // Dirt road
    ctx.fillRect(-110 * scale, -13 * scale, 88 * scale, 6.2 * scale);
    ctx.fillRect(22 * scale, -13 * scale, 88 * scale, 5.8 * scale);
    ctx.fillRect(-2.6 * scale, -80 * scale, 5.2 * scale, 70 * scale);
    ctx.fillRect(-2.6 * scale, 12 * scale, 5.2 * scale, 65 * scale);

    // Expanded Roads
    ctx.fillRect(-2.6 * scale, -108 * scale, 5.2 * scale, 28 * scale); // North road ext
    ctx.fillRect(-40 * scale, -86.1 * scale, 40 * scale, 4.2 * scale);  // School lane
    ctx.fillStyle = '#b45309'; // Mosque brick road
    ctx.fillRect(0 * scale, -96.1 * scale, 25 * scale, 4.2 * scale);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(67.5 * scale, -10 * scale, 5.0 * scale, 18 * scale);  // Rice mill road
    ctx.fillRect(-2.6 * scale, 77 * scale, 5.2 * scale, 16 * scale);   // South road ext
    ctx.fillRect(-85 * scale, 90.5 * scale, 170 * scale, 5.5 * scale); // Riverside embankment

    // 4. Culvert Bridge
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-3.2 * scale, 13.8 * scale, 6.4 * scale, 4.5 * scale);

    // 5. Buildings / Homesteads & Landmarks
    ctx.fillStyle = 'rgba(203, 213, 225, 0.9)';
    const villageBuildings = [
      [-30, 50, 10, 8],   // Homestead 1
      [-41, -56, 11, 8],  // Homestead 2
      [41, -60, 9.5, 7.5],// Homestead 3
      [47, 41, 11, 10],   // Homestead 4
      [7.2, -22.4, 5.5, 4.8], // Shop 1
      [-14.6, -22.3, 5.2, 4.6], // Shop 3
      // 14 Additional Village Houses
      [-20, -60, 8.5, 6.2],
      [-26, -36, 7.8, 5.8],
      [14, -58, 8.8, 6.4],
      [20, -42, 7.5, 5.6],
      [-30, -70, 7.5, 5.6],
      [-52, -46, 8.0, 6.0],
      [-40, -26, 8.4, 6.2],
      [-42, -6, 8.2, 6.0],
      [-62, -6, 7.8, 5.8],
      [-20, 4, 8.2, 6.2],
      [18, 2, 8.6, 6.4],
      [22, 28, 8.0, 6.0],
      [-42, 58, 8.0, 6.0],
      [32, -2, 8.2, 6.0]
    ];
    villageBuildings.forEach(b => {
      ctx.fillRect(b[0] * scale, b[1] * scale, b[2] * scale, b[3] * scale);
    });

    // 5b. Major Landmarks Icons on Radar
    // Abalpur Jame Mosque (Green building + Dome)
    ctx.fillStyle = '#10b981';
    ctx.fillRect(28 * scale, -104 * scale, 14 * scale, 11 * scale);
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.arc(35 * scale, -98 * scale, 3.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Primary School (Red roof + playground boundary)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-67 * scale, -110 * scale, 25 * scale, 7.5 * scale);
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-72 * scale, -102 * scale, 36 * scale, 22 * scale);

    // Auto Rice Mill (Industrial Shed + Drying Chatal)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(66 * scale, -4 * scale, 20 * scale, 12 * scale);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(59 * scale, 13 * scale, 26 * scale, 22 * scale);

    // Community Health Clinic (Mint building)
    ctx.fillStyle = '#34d399';
    ctx.fillRect(-31.5 * scale, 20 * scale, 11 * scale, 8 * scale);

    // 6. Haystacks (yellow circles)
    ctx.fillStyle = '#facc15';
    const haystacks = [
      [-16, 46], [-23, -42], [36, -56],
      [-16, -68], [25, -62], [-44, -64], [28, 40], [-46, -18],
      [48, -58], [-36, 68], [68, -12]
    ];
    haystacks.forEach(h => {
      ctx.beginPath();
      ctx.arc(h[0] * scale, h[1] * scale, 2.8 * scale, 0, Math.PI * 2);
      ctx.fill();
    });

    // Enemy Blips on Village Mini-Map (Tactical Red Dots for Active Enemies)
    if (typeof enemyManager !== 'undefined' && enemyManager && enemyManager.enemies) {
      ctx.fillStyle = '#ef4444';
      for (let i = 0; i < enemyManager.enemies.length; i++) {
        const e = enemyManager.enemies[i];
        if (e && e.isAlive && e.group) {
          ctx.beginPath();
          ctx.arc(e.group.position.x * scale, e.group.position.z * scale, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();

    // 7. Player position center blip with forward heading cone
    ctx.save();
    ctx.translate(centerX, centerY);

    // Forward radar vision cone
    const coneGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 32);
    coneGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    coneGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 32, -Math.PI / 2 - 0.45, -Math.PI / 2 + 0.45);
    ctx.closePath();
    ctx.fill();

    // Player arrow triangle
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(-5, 5);
    ctx.lineTo(0, 3);
    ctx.lineTo(5, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
};

if (typeof window !== 'undefined') {
  window.AbalpurVillageBuilder = AbalpurVillageBuilder;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AbalpurVillageBuilder };
}

