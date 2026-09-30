// Magura River Port & Industrial Zone (মাগুরা রিভার পোর্ট ও ইন্ডাস্ট্রিয়াল জোন)
// 3D Riverside Industrial Map for Battlezone Magura
// High-performance mobile-optimized Three.js environment featuring:
// Nabaganga River waterfront, cargo ghat & wooden boat piers, moored cargo trawlers,
// Jute & grain godown warehouses (playable interiors), BIWTA cargo transit shed (playable interior),
// shipping container freight yard, agro-industrial factory with steel silos and brick chimney (playable interior),
// maintenance workshop (playable interior), concrete culvert bridge with combat cover, transport trucks,
// worker quarters & tea stall.

const MaguraRiverPortBuilder = {
  colliders: [],
  waterMesh: null,
  waterMeshes: [],
  sharedGeos: {},
  sharedMats: {},

  // Player start spawn point (North-Central entrance road facing south toward port & river)
  playerSpawn: {
    x: 0,
    y: 1.72,
    z: -70,
    yaw: 0
  },

  // 6 Verified Safe Outdoor Player Spawns across key tactical zones
  playerSpawns: [
    { x: 0, y: 1.72, z: -70, yaw: 0, zone: "North Entrance Road" },
    { x: -28, y: 1.72, z: -25, yaw: Math.PI / 4, zone: "Warehouse West Yard" },
    { x: 25, y: 1.72, z: -25, yaw: -Math.PI / 4, zone: "Workshop Access Lane" },
    { x: 0, y: 1.72, z: 20, yaw: 0, zone: "Central Junction Crossing" },
    { x: -25, y: 1.72, z: 52, yaw: Math.PI / 2, zone: "Riverbank West Promenade" },
    { x: 30, y: 1.72, z: 52, yaw: -Math.PI / 2, zone: "Crane Dock Approach" }
  ],

  // Exactly 10 Tactical Enemy Patrol Bot configurations (Safe Spawns & Walkable Patrols)
  enemyConfigs: [
    {
      id: 1,
      name: "শত্রু ১ (রিভার কার্গো ঘাট ও নৌকা জেটি)",
      spawn: { x: -16, y: 0, z: 75 },
      waypoints: [
        { x: -16, z: 75 },
        { x: -28, z: 75 },
        { x: -28, z: 66 },
        { x: -16, z: 66 }
      ]
    },
    {
      id: 2,
      name: "শত্রু ২ (রিভারফ্রন্ট ক্রেন ও ডক ইয়ার্ড)",
      spawn: { x: 42, y: 0, z: 62 },
      waypoints: [
        { x: 42, z: 62 },
        { x: 55, z: 62 },
        { x: 55, z: 52 },
        { x: 42, z: 52 }
      ]
    },
    {
      id: 3,
      name: "শত্রু ৩ (কালভার্ট ব্রিজ ও সংযোগ সড়ক)",
      spawn: { x: 12, y: 0, z: 36 },
      waypoints: [
        { x: 12, z: 36 },
        { x: 22, z: 36 },
        { x: 12, z: 46 },
        { x: 2, z: 46 }
      ]
    },
    {
      id: 4,
      name: "শত্রু ৪ (পোর্ট সেন্ট্রাল কন্টেইনার ইয়ার্ড)",
      spawn: { x: -8, y: 0, z: 0 },
      waypoints: [
        { x: -8, z: 0 },
        { x: 6, z: 0 },
        { x: 6, z: 12 },
        { x: -8, z: 12 }
      ]
    },
    {
      id: 5,
      name: "শত্রু ৫ (মধুমতি জুট গোডাউন ১ - অভ্যন্তরীণ)",
      spawn: { x: -44, y: 0, z: -4 },
      waypoints: [
        { x: -44, z: -4 },
        { x: -56, z: -4 },
        { x: -56, z: 6 },
        { x: -44, z: 6 }
      ]
    },
    {
      id: 6,
      name: "শত্রু ৬ (বিআইডব্লিউটিএ কার্গো শেড - অভ্যন্তরীণ)",
      spawn: { x: 52, y: 0, z: 4 },
      waypoints: [
        { x: 52, z: 4 },
        { x: 62, z: 4 },
        { x: 62, z: -4 },
        { x: 52, z: -4 }
      ]
    },
    {
      id: 7,
      name: "শত্রু ৭ (রাইস মিল ফ্যাক্টরি হল - অভ্যন্তরীণ)",
      spawn: { x: -48, y: 0, z: -52 },
      waypoints: [
        { x: -48, z: -52 },
        { x: -48, z: -44 },
        { x: -40, z: -44 },
        { x: -40, z: -52 }
      ]
    },
    {
      id: 8,
      name: "শত্রু ৮ (হেভি ওয়ার্কশপ ও ফুয়েল ট্যাংক)",
      spawn: { x: 48, y: 0, z: -50 },
      waypoints: [
        { x: 48, z: -50 },
        { x: 48, z: -42 },
        { x: 40, z: -42 },
        { x: 40, z: -50 }
      ]
    },
    {
      id: 9,
      name: "শত্রু ৯ (নর্থ ওয়ার্কার্স কোয়ার্টার ও গলি)",
      spawn: { x: -28, y: 0, z: -78 },
      waypoints: [
        { x: -28, z: -78 },
        { x: -40, z: -78 },
        { x: -40, z: -72 },
        { x: -28, z: -72 }
      ]
    },
    {
      id: 10,
      name: "শত্রু ১০ (নর্থ হাইওয়ে চেকপোস্ট ও চায়ের দোকান)",
      spawn: { x: 26, y: 0, z: -82 },
      waypoints: [
        { x: 26, z: -82 },
        { x: 38, z: -82 },
        { x: 38, z: -72 },
        { x: 26, z: -72 }
      ]
    }
  ],

  // Procedural Canvas Texture Cache for High-Grade Mobile Visuals
  initTextures: function() {
    if (this.texturesInitialized) return;
    this.texturesInitialized = true;
    this.textures = {};

    // Helper: Create CanvasTexture
    const makeTex = (w, h, drawFn, repX = 1, repY = 1) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      drawFn(ctx, w, h);
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repX, repY);
      return tex;
    };

    // 1. East-West Asphalt Road: Bitumen with yellow dashed center & white edge lines
    this.textures.asphaltEW = makeTex(512, 128, (ctx, w, h) => {
      ctx.fillStyle = '#26282b';
      ctx.fillRect(0, 0, w, h);
      // Aggregate grain
      for (let i = 0; i < 1800; i++) {
        const gray = Math.floor(Math.random() * 35 + 30);
        ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, 0.5)`;
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
      // Tar repair patch
      ctx.fillStyle = '#1c1d20';
      ctx.fillRect(120, 20, 85, 30);
      ctx.fillRect(340, 70, 70, 25);
      // White edge solid lines
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 8, w, 4);
      ctx.fillRect(0, h - 12, w, 4);
      // Yellow dashed center line
      ctx.fillStyle = '#f59e0b';
      for (let x = 10; x < w; x += 48) {
        ctx.fillRect(x, h / 2 - 2.5, 28, 5);
      }
    }, 18, 1);

    // 2. North-South Asphalt Road: Vertical orientation along Z
    this.textures.asphaltNS = makeTex(128, 512, (ctx, w, h) => {
      ctx.fillStyle = '#26282b';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 1800; i++) {
        const gray = Math.floor(Math.random() * 35 + 30);
        ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, 0.5)`;
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(8, 0, 4, h);
      ctx.fillRect(w - 12, 0, 4, h);
      ctx.fillStyle = '#f59e0b';
      for (let y = 10; y < h; y += 48) {
        ctx.fillRect(w / 2 - 2.5, y, 5, 28);
      }
    }, 1, 14);

    // 3. Concrete Slabs (Aprons, Bridge, Yards)
    this.textures.concrete = makeTex(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#595d63';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 1500; i++) {
        const g = Math.floor(Math.random() * 40 + 75);
        ctx.fillStyle = `rgba(${g}, ${g}, ${g}, 0.35)`;
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
      // Tile expansion seams
      ctx.strokeStyle = '#383b40';
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, w - 4, h - 4);
      ctx.beginPath();
      ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
      ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
      ctx.stroke();
    }, 6, 6);

    // 4. Corrugated Tin Roof / Siding
    this.textures.tin = makeTex(128, 128, (ctx, w, h) => {
      ctx.fillStyle = '#505660';
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 8) {
        ctx.fillStyle = '#676e79';
        ctx.fillRect(x, 0, 4, h);
        ctx.fillStyle = '#3a3f47';
        ctx.fillRect(x + 4, 0, 4, h);
      }
      // Weathering rust streaks
      ctx.fillStyle = 'rgba(154, 52, 18, 0.25)';
      ctx.fillRect(15, 0, 16, h);
      ctx.fillRect(72, 0, 24, h);
    }, 8, 8);

    // 5. Bangladeshi Red Clay Brickwork
    this.textures.brick = makeTex(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#a8a29e'; // mortar gray
      ctx.fillRect(0, 0, w, h);
      const rowH = 16;
      const bW = 32;
      for (let y = 1; y < h; y += rowH) {
        const offset = (Math.floor(y / rowH) % 2) * (bW / 2);
        for (let x = -bW + offset; x < w + bW; x += bW) {
          const rTone = Math.floor(Math.random() * 25 + 130);
          const gTone = Math.floor(Math.random() * 15 + 45);
          const bTone = Math.floor(Math.random() * 12 + 35);
          ctx.fillStyle = `rgb(${rTone}, ${gTone}, ${bTone})`;
          ctx.fillRect(x + 1, y, bW - 2, rowH - 2);
        }
      }
    }, 6, 4);

    // 6. Yellow/Black Hazard Stripes
    this.textures.hazard = makeTex(128, 128, (ctx, w, h) => {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      for (let x = -w; x < w * 2; x += 32) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 16, 0);
        ctx.lineTo(x + 16 + h, h);
        ctx.lineTo(x + h, h);
      }
      ctx.fill();
    }, 4, 1);

    // 7. Weathered Timber Planks (Boats & Jetties)
    this.textures.wood = makeTex(256, 128, (ctx, w, h) => {
      ctx.fillStyle = '#453221';
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 16) {
        ctx.fillStyle = (y % 32 === 0) ? '#543d28' : '#3d2a1b';
        ctx.fillRect(0, y, w, 15);
        ctx.fillStyle = '#291c12';
        ctx.fillRect(0, y + 15, w, 1);
      }
    }, 4, 2);

    // 8. Industrial Metal Wall Panel
    this.textures.metalPanel = makeTex(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 126, w, 4);
      ctx.fillRect(126, 0, 4, h);
      // Rivets
      ctx.fillStyle = '#94a3b8';
      for (let i = 8; i < w; i += 32) {
        ctx.fillRect(i, 6, 3, 3);
        ctx.fillRect(i, h - 8, 3, 3);
        ctx.fillRect(6, i, 3, 3);
        ctx.fillRect(w - 8, i, 3, 3);
      }
    }, 4, 4);
  },

  // Main Builder
  buildWorld: function(scene) {
    this.initTextures();
    this.colliders = [];
    this.waterMeshes = [];
    this.waterMesh = null;

    const portGroup = new THREE.Group();
    portGroup.name = "MaguraRiverPortMapRoot";

    // 1. Terrain & Riverbed
    this.createPortTerrain(portGroup);

    // 2. Nabaganga River Water & Embankment Revetment
    this.createRiverWaterAndEmbankment(portGroup);

    // 3. Concrete Ghat Stairs, Wooden Piers & Moored Cargo Boats
    this.createRiverGhatAndBoats(portGroup);

    // 4. Heavy Cargo Derrick Cranes & Pier Docking Apron
    this.createCargoCranesAndPiers(portGroup);

    // 5. Road Network, Concrete Culvert Bridge & Weighbridge Checkpoint
    this.createRoadsAndCulvertBridge(portGroup);

    // 6. Large Jute & Grain Godown (Warehouse 1 - West) - Playable Interior
    this.createJuteWarehouse(portGroup);

    // 7. BIWTA Cargo Transit Shed (Warehouse 2 - East) - Playable Interior
    this.createBiwtaCargoShed(portGroup);

    // 8. Central Shipping Container Freight Yard (Tactical Container Stacks)
    this.createContainerYard(portGroup);

    // 9. Agro-Industrial Factory, Grain Silos & Brick Boiler Chimney - Playable Interior
    this.createAgroFactoryAndSilos(portGroup);

    // 10. Heavy Industrial Workshop, Diesel Tanks & Gantry Crane - Playable Interior
    this.createWorkshopAndFuelTanks(portGroup);

    // 11. North Worker Quarters, Tea Stall & Shops
    this.createWorkerQuartersAndShops(portGroup);

    // 12. Transport Trucks & Cargo Vans
    this.createTransportVehicles(portGroup);

    // 13. Palm Trees, Rain Trees & Industrial Pipes/Lamps
    this.createFoliageAndInfrastructure(portGroup);

    // 14. Perimeter Security Enclosure Walls
    this.createPerimeterEnclosure(portGroup);

    scene.add(portGroup);

    return {
      colliders: this.colliders,
      waterMesh: this.waterMesh,
      waterMeshes: this.waterMeshes,
      playerSpawn: this.playerSpawn,
      playerSpawns: this.playerSpawns,
      enemyConfigs: this.enemyConfigs
    };
  },

  // Helper: register Box3 collider
  addBoxCollider: function(minX, minY, minZ, maxX, maxY, maxZ) {
    const box = new THREE.Box3(
      new THREE.Vector3(minX, minY, minZ),
      new THREE.Vector3(maxX, maxY, maxZ)
    );
    this.colliders.push(box);
    return box;
  },

  // 1. Port Terrain & Ground Slabs
  createPortTerrain: function(parent) {
    // Large ground plane (240m x 240m)
    const groundGeo = new THREE.PlaneGeometry(240, 240, 4, 4);
    groundGeo.rotateX(-Math.PI / 2);

    // Industrial packed earth, crushed gravel, and pavement blend
    const terrainCanvas = document.createElement('canvas');
    terrainCanvas.width = 512;
    terrainCanvas.height = 512;
    const ctx = terrainCanvas.getContext('2d');

    // Base industrial dusty gray-earth
    ctx.fillStyle = '#42413a';
    ctx.fillRect(0, 0, 512, 512);

    // Noise speckles (crushed aggregate, dirt patches, gravel)
    for (let i = 0; i < 4500; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      const gray = Math.floor(Math.random() * 40 + 50);
      ctx.fillStyle = `rgba(${gray}, ${gray - 4}, ${gray - 10}, 0.45)`;
      ctx.fillRect(rx, ry, 2, 2);
    }

    // Occasional green weeds / moss on borders
    ctx.fillStyle = 'rgba(70, 85, 45, 0.35)';
    for (let i = 0; i < 200; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 6 + 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const groundTex = new THREE.CanvasTexture(terrainCanvas);
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(12, 12);

    const groundMat = new THREE.MeshLambertMaterial({ map: groundTex });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.01;
    parent.add(groundMesh);

    // Concrete industrial slabs for container yard & warehouse aprons with textured concrete
    const apronMat = new THREE.MeshLambertMaterial({
      map: this.textures ? this.textures.concrete : null,
      color: 0xd4d8dd
    });
    const apronGeo1 = new THREE.BoxGeometry(70, 0.12, 55);
    const apron1 = new THREE.Mesh(apronGeo1, apronMat);
    apron1.position.set(0, 0.05, 0); // Container yard concrete base
    parent.add(apron1);

    const apronGeo2 = new THREE.BoxGeometry(45, 0.12, 60);
    const apron2 = new THREE.Mesh(apronGeo2, apronMat);
    apron2.position.set(-50, 0.05, -5); // Warehouse 1 apron
    parent.add(apron2);

    const apronGeo3 = new THREE.BoxGeometry(45, 0.12, 60);
    const apron3 = new THREE.Mesh(apronGeo3, apronMat);
    apron3.position.set(55, 0.05, 5); // BIWTA Shed apron
    parent.add(apron3);
  },

  // 2. Nabaganga River Water & Embankment Revetment
  createRiverWaterAndEmbankment: function(parent) {
    // River runs along southern sector from Z = +68 to Z = +120 across full width (-120 to +120)
    const waterWidth = 240;
    const waterDepth = 55;
    const waterGeo = new THREE.PlaneGeometry(waterWidth, waterDepth, 16, 8);
    waterGeo.rotateX(-Math.PI / 2);

    const waterCanvas = document.createElement('canvas');
    waterCanvas.width = 256;
    waterCanvas.height = 256;
    const wCtx = waterCanvas.getContext('2d');

    // Rich South-Asian freshwater river gradient (Nabaganga silty turquoise-blue)
    const wGrad = wCtx.createLinearGradient(0, 0, 256, 256);
    wGrad.addColorStop(0, '#2d5a69');
    wGrad.addColorStop(0.5, '#204a57');
    wGrad.addColorStop(1, '#1b3f4c');
    wCtx.fillStyle = wGrad;
    wCtx.fillRect(0, 0, 256, 256);

    // Gentle flowing river wavelets
    wCtx.strokeStyle = 'rgba(160, 210, 225, 0.35)';
    wCtx.lineWidth = 2.0;
    for (let y = 10; y < 256; y += 22) {
      wCtx.beginPath();
      wCtx.moveTo(0, y);
      for (let x = 0; x < 256; x += 32) {
        wCtx.quadraticCurveTo(x + 16, y + (x % 64 === 0 ? 4 : -4), x + 32, y);
      }
      wCtx.stroke();
    }

    const waterTex = new THREE.CanvasTexture(waterCanvas);
    waterTex.wrapS = THREE.RepeatWrapping;
    waterTex.wrapT = THREE.RepeatWrapping;
    waterTex.repeat.set(8, 3);

    const waterMat = new THREE.MeshPhongMaterial({
      map: waterTex,
      color: 0x367a8c,
      specular: 0x88d5e8,
      shininess: 65,
      transparent: true,
      opacity: 0.88
    });

    const riverMesh = new THREE.Mesh(waterGeo, waterMat);
    riverMesh.position.set(0, -0.65, 95);
    parent.add(riverMesh);
    this.waterMesh = riverMesh;
    this.waterMeshes.push(riverMesh);

    // Embankment slope / revetment blocks (concrete armor blocks protecting riverbank)
    const blockMat = new THREE.MeshLambertMaterial({
      map: this.textures ? this.textures.concrete : null,
      color: 0x888e96
    });
    const blockGeo = new THREE.BoxGeometry(2.4, 0.45, 1.8);

    for (let x = -105; x <= 105; x += 4.5) {
      const b1 = new THREE.Mesh(blockGeo, blockMat);
      b1.position.set(x, -0.15, 68.2);
      b1.rotation.x = 0.28;
      parent.add(b1);

      const b2 = new THREE.Mesh(blockGeo, blockMat);
      b2.position.set(x + 2.2, -0.42, 69.8);
      b2.rotation.x = 0.32;
      parent.add(b2);
    }

    // Natural river stones along shoreline
    const stoneGeo = new THREE.DodecahedronGeometry(0.45, 0);
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x5a554a });
    for (let sx = -95; sx <= 95; sx += 12) {
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(sx + (Math.sin(sx) * 2), -0.35, 68.8);
      stone.scale.set(1.4, 0.6, 1.1);
      parent.add(stone);
    }

    // River embankment wall colliders along waterfront edge
    this.addBoxCollider(-110, -1, 67.5, -34, 1.2, 69.5);
    this.addBoxCollider(2, -1, 67.5, 30, 1.2, 69.5);
    this.addBoxCollider(68, -1, 67.5, 110, 1.2, 69.5);
  },

  // 3. Concrete Ghat Stairs, Wooden Piers, Moored Cargo Boats & Landmark Sign
  createRiverGhatAndBoats: function(parent) {
    const ghatMat = new THREE.MeshLambertMaterial({ color: 0x7c7e82 });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });
    const boatHullMat = new THREE.MeshLambertMaterial({ color: 0x2e2016 });
    const boatTrimMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 });
    const tarpMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const signMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });

    // Main River Ghat Entrance Arch with prominent "GHAT" signboard
    const archGroup = new THREE.Group();
    archGroup.position.set(-13, 0, 66);
    
    // Concrete arch pillars
    const archPillarGeo = new THREE.BoxGeometry(0.8, 3.8, 0.8);
    const pLeft = new THREE.Mesh(archPillarGeo, ghatMat);
    pLeft.position.set(-7.5, 1.9, 0);
    archGroup.add(pLeft);
    this.addBoxCollider(-21.0, 0, 65.5, -19.5, 4.0, 66.5);

    const pRight = new THREE.Mesh(archPillarGeo, ghatMat);
    pRight.position.set(7.5, 1.9, 0);
    archGroup.add(pRight);
    this.addBoxCollider(-6.0, 0, 65.5, -4.5, 4.0, 66.5);

    // Arch header beam
    const headerBeam = new THREE.Mesh(new THREE.BoxGeometry(16, 0.7, 0.9), ghatMat);
    headerBeam.position.set(0, 3.8, 0);
    archGroup.add(headerBeam);

    // Signboard: "মাগুরা রিভার ঘাট • GHAT"
    const ghatSign = new THREE.Mesh(new THREE.BoxGeometry(11, 1.1, 0.15), signMat);
    ghatSign.position.set(0, 3.8, 0.5);
    archGroup.add(ghatSign);

    parent.add(archGroup);

    // Main River Ghat (Central concrete steps descending into water) at X = -20 to -6, Z = 67 to 79
    const stepCount = 5;
    for (let i = 0; i < stepCount; i++) {
      const stepGeo = new THREE.BoxGeometry(14, 0.22, 2.2);
      const step = new THREE.Mesh(stepGeo, ghatMat);
      step.position.set(-13, -0.05 - (i * 0.14), 68 + (i * 2.1));
      parent.add(step);
    }

    // Heavy concrete side parapets for ghat
    for (let sx of [-20.2, -5.8]) {
      const parapetGeo = new THREE.BoxGeometry(0.55, 0.75, 11.5);
      const parapet = new THREE.Mesh(parapetGeo, ghatMat);
      parapet.position.set(sx, 0.22, 73);
      parent.add(parapet);
      this.addBoxCollider(sx - 0.3, -0.2, 67.5, sx + 0.3, 0.8, 78.5);
    }

    // Small Ghat Tea Stall & Benches on the landing apron
    const teaStallGroup = new THREE.Group();
    teaStallGroup.position.set(-6, 0, 64);
    const tsMat = new THREE.MeshLambertMaterial({ color: 0x166534 });
    const tsBody = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.4, 2.2), tsMat);
    tsBody.position.y = 1.2;
    teaStallGroup.add(tsBody);

    const tsBench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.55), woodMat);
    tsBench.position.set(0, 0.25, 1.8);
    teaStallGroup.add(tsBench);

    parent.add(teaStallGroup);
    this.addBoxCollider(-7.8, 0, 62.8, -4.2, 2.8, 65.5);

    // Parked local bicycle prop
    const bikeGroup = new THREE.Group();
    bikeGroup.position.set(-4.5, 0, 64.5);
    const bikeFrame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 1.6), new THREE.MeshLambertMaterial({ color: 0x111827 }));
    bikeFrame.position.y = 0.5;
    bikeGroup.add(bikeFrame);
    parent.add(bikeGroup);

    // Wooden Cargo Jetty 1 (West of Ghat) at X = -30, Z = 68 to 86
    const jetty1Geo = new THREE.BoxGeometry(3.6, 0.28, 18);
    const jetty1 = new THREE.Mesh(jetty1Geo, woodMat);
    jetty1.position.set(-30, -0.08, 77);
    parent.add(jetty1);
    this.addBoxCollider(-32, -0.5, 68, -28, 0.5, 86);

    // Wooden Jetty Pilings
    const pilingGeo = new THREE.CylinderGeometry(0.14, 0.16, 2.8, 8);
    for (let pz = 70; pz <= 85; pz += 3.5) {
      for (let px of [-31.6, -28.4]) {
        const piling = new THREE.Mesh(pilingGeo, woodMat);
        piling.position.set(px, -0.9, pz);
        parent.add(piling);
      }
    }

    // Wooden Cargo Jetty 2 (East of Ghat) at X = 20, Z = 68 to 86
    const jetty2 = new THREE.Mesh(jetty1Geo, woodMat);
    jetty2.position.set(20, -0.08, 77);
    parent.add(jetty2);
    this.addBoxCollider(18, -0.5, 68, 22, 0.5, 86);

    for (let pz = 70; pz <= 85; pz += 3.5) {
      for (let px of [18.4, 21.6]) {
        const piling = new THREE.Mesh(pilingGeo, woodMat);
        piling.position.set(px, -0.9, pz);
        parent.add(piling);
      }
    }

    // Moored Cargo Trawlers / Wooden Boats ("মালবাহী ট্রলার")
    const createCargoBoat = (bx, by, bz, rotY) => {
      const boatGroup = new THREE.Group();
      boatGroup.position.set(bx, by, bz);
      boatGroup.rotation.y = rotY;

      // Curved boat hull (lower keel)
      const hullGeo = new THREE.BoxGeometry(3.2, 1.4, 11);
      const hull = new THREE.Mesh(hullGeo, boatHullMat);
      boatGroup.add(hull);

      // Tapered bow wedge
      const bowGeo = new THREE.ConeGeometry(1.6, 3.2, 4);
      bowGeo.rotateX(Math.PI / 2);
      const bow = new THREE.Mesh(bowGeo, boatHullMat);
      bow.position.set(0, 0, 6.8);
      boatGroup.add(bow);

      // Top colored gunwale trim
      const trimGeo = new THREE.BoxGeometry(3.3, 0.18, 11.2);
      const trim = new THREE.Mesh(trimGeo, boatTrimMat);
      trim.position.y = 0.72;
      boatGroup.add(trim);

      // Middle cargo hold canopy / arched bamboo roof ("ছৈ / ছই")
      const roofGeo = new THREE.CylinderGeometry(1.5, 1.5, 6.0, 10, 1, false, 0, Math.PI);
      roofGeo.rotateZ(Math.PI / 2);
      const roof = new THREE.Mesh(roofGeo, tarpMat);
      roof.position.set(0, 0.75, -0.5);
      boatGroup.add(roof);

      // Rear wooden helm tiller post
      const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6);
      const post = new THREE.Mesh(postGeo, woodMat);
      post.position.set(0, 1.2, -4.8);
      boatGroup.add(post);

      parent.add(boatGroup);
      this.addBoxCollider(bx - 2.0, -0.8, bz - 6.5, bx + 2.0, 1.8, bz + 7.5);
    };

    createCargoBoat(-35.5, -0.35, 78, 0.08); // Moored by Jetty 1
    createCargoBoat(25.5, -0.35, 78, -0.06); // Moored by Jetty 2
    createCargoBoat(-3.0, -0.35, 83, 0.22);  // Moored off river ghat

    // Stacks of Jute Sacks on Ghat & Jetties (Tactical combat cover)
    const sackMat = new THREE.MeshLambertMaterial({ color: 0x9e8156 });
    const createSackStack = (sx, sy, sz) => {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 2; k++) {
          const sackGeo = new THREE.BoxGeometry(0.85, 0.38, 1.4);
          const sack = new THREE.Mesh(sackGeo, sackMat);
          sack.position.set(sx + (k * 0.9) - 0.45, sy + (j * 0.38) + 0.19, sz);
          parent.add(sack);
        }
      }
      this.addBoxCollider(sx - 0.9, sy, sz - 0.7, sx + 0.9, sy + 1.2, sz + 0.7);
    };

    createSackStack(-28.5, 0.05, 71);
    createSackStack(-13.0, 0.15, 66.5);
    createSackStack(18.5, 0.05, 72);
  },

  // 4. Heavy Cargo Derrick Cranes & Pier Docking Apron
  createCargoCranesAndPiers: function(parent) {
    const steelMat = new THREE.MeshLambertMaterial({ color: 0xca8a04 }); // Industrial safety yellow
    const darkSteelMat = new THREE.MeshLambertMaterial({ color: 0x22252a });
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    // Heavy Waterfront Derrick Crane at X = 48, Z = 60
    const craneGroup = new THREE.Group();
    craneGroup.position.set(48, 0, 60);

    const baseGeo = new THREE.BoxGeometry(4.5, 1.2, 4.5);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.6;
    craneGroup.add(base);

    const cabGeo = new THREE.BoxGeometry(2.4, 2.2, 2.8);
    const cab = new THREE.Mesh(cabGeo, steelMat);
    cab.position.set(0, 2.3, 0);
    craneGroup.add(cab);

    const glassMat = new THREE.MeshPhongMaterial({ color: 0x38bdf8, specular: 0xffffff, shininess: 80 });
    const win = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 0.1), glassMat);
    win.position.set(0, 2.4, 1.41);
    craneGroup.add(win);

    const boomGeo = new THREE.BoxGeometry(0.7, 14, 0.7);
    const boom = new THREE.Mesh(boomGeo, steelMat);
    boom.position.set(0, 7.2, 4.8);
    boom.rotation.x = -Math.PI / 4;
    craneGroup.add(boom);

    const hookLineGeo = new THREE.CylinderGeometry(0.025, 0.025, 6.5, 4);
    const hookLine = new THREE.Mesh(hookLineGeo, cableMat);
    hookLine.position.set(0, 8.5, 9.8);
    craneGroup.add(hookLine);

    const hookGeo = new THREE.TorusGeometry(0.35, 0.08, 6, 12, Math.PI * 1.5);
    const hook = new THREE.Mesh(hookGeo, darkSteelMat);
    hook.position.set(0, 5.2, 9.8);
    hook.rotation.z = Math.PI;
    craneGroup.add(hook);

    const cw = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 1.4), darkSteelMat);
    cw.position.set(0, 2.6, -1.8);
    craneGroup.add(cw);

    parent.add(craneGroup);
    this.addBoxCollider(45.5, 0, 57.5, 50.5, 4.5, 62.5);
  },

  // 5. Road Network, Concrete Culvert Bridge & Weighbridge Checkpoint
  createRoadsAndCulvertBridge: function(parent) {
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x33363a });
    const bridgeMat = new THREE.MeshLambertMaterial({ color: 0x5b616a });

    // 1. South Riverbank Road (Runs East-West along waterfront at Z = 50, X = -105 to +105)
    const riverRoad = new THREE.Mesh(new THREE.BoxGeometry(210, 0.06, 9.5), roadMat);
    riverRoad.position.set(0, 0.03, 50);
    parent.add(riverRoad);

    // 2. Main Central Transport Highway (Runs North-South from Z = -95 to Z = +50 at X = 0)
    const mainRoad = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.06, 145), roadMat);
    mainRoad.position.set(0, 0.03, -22.5);
    parent.add(mainRoad);

    // 3. North Access Road (Runs East-West across top at Z = -75, X = -105 to +105)
    const northRoad = new THREE.Mesh(new THREE.BoxGeometry(210, 0.06, 8.5), roadMat);
    northRoad.position.set(0, 0.03, -75);
    parent.add(northRoad);

    // 4. Industrial Branch Road (Connects central junction to West & East warehouses at Z = 0)
    const branchRoad = new THREE.Mesh(new THREE.BoxGeometry(180, 0.06, 8.5), roadMat);
    branchRoad.position.set(0, 0.03, 0);
    parent.add(branchRoad);

    // Concrete Culvert Bridge at X = 12, Z = 50
    const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(14, 0.45, 11.5), bridgeMat);
    bridgeDeck.position.set(12, 0.22, 50);
    parent.add(bridgeDeck);

    // Bridge Concrete Substructure / Piers beneath
    const pierMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    for (let px of [7.5, 16.5]) {
      const pierMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.5, 11), pierMat);
      pierMesh.position.set(px, -1.0, 50);
      parent.add(pierMesh);
    }

    // Concrete bridge guardrails with white & black safety stripes
    for (let bz of [44.5, 55.5]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(14, 0.85, 0.45), bridgeMat);
      rail.position.set(12, 0.85, bz);
      parent.add(rail);

      // Warning hazard stripes on bridge railings
      this.addBoxCollider(4.8, 0, bz - 0.35, 19.2, 1.4, bz + 0.35);
    }

    // Parked Green CNG Auto-Rickshaw on bridge shoulder (Tactical cover position)
    const cngGroup = new THREE.Group();
    cngGroup.position.set(8.5, 0.45, 47.5);
    cngGroup.rotation.y = 0.2;
    const cngBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 2.4), new THREE.MeshLambertMaterial({ color: 0x15803d }));
    cngBody.position.y = 0.7;
    cngGroup.add(cngBody);
    const cngRoof = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.2, 2.45), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
    cngRoof.position.y = 1.45;
    cngGroup.add(cngRoof);
    parent.add(cngGroup);
    this.addBoxCollider(7.2, 0.2, 46.0, 9.8, 2.0, 49.0);

    // Weighbridge Truck Scale Station (ওয়েব্রিজ চেকপোস্ট) at X = -18, Z = 38
    const scaleBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 3.0, 4.2),
      new THREE.MeshLambertMaterial({ color: 0x1e3a5f })
    );
    scaleBuilding.position.set(-18, 1.5, 38);
    parent.add(scaleBuilding);

    // Prominent Entrance Signboard: "RIVER PORT" / "মাগুরা রিভার পোর্ট • RIVER PORT"
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.85, 0.15),
      new THREE.MeshLambertMaterial({ color: 0xf59e0b })
    );
    sign.position.set(-18, 2.6, 40.15);
    parent.add(sign);

    // Steel Scale platform ramp on road
    const scalePlatform = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.18, 8.5),
      new THREE.MeshLambertMaterial({ color: 0x475569 })
    );
    scalePlatform.position.set(-10, 0.10, 38);
    parent.add(scalePlatform);

    this.addBoxCollider(-21, 0, 35.5, -15, 3.2, 40.5);
  },

  // 6. Large Jute & Grain Godown (Warehouse 1 - West) - Playable Interior
  createJuteWarehouse: function(parent) {
    const brickMat = new THREE.MeshLambertMaterial({ color: 0x8b3a2b });
    const tinRoofMat = new THREE.MeshLambertMaterial({ color: 0x5a636e });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x6b4f2c });
    const sackMat = new THREE.MeshLambertMaterial({ color: 0x9e8156 });
    const signMat = new THREE.MeshLambertMaterial({ color: 0x047857 });

    const whGroup = new THREE.Group();
    whGroup.position.set(-52, 0, -8);

    // Concrete interior floor (playable)
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(32, 0.1, 42),
      new THREE.MeshLambertMaterial({ color: 0x4b5563 })
    );
    floor.position.y = 0.05;
    whGroup.add(floor);

    // 1. West Solid Wall (X = -16, width 1m, depth 42m, height 6.5m)
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(1.0, 6.5, 42), brickMat);
    westWall.position.set(-15.5, 3.25, 0);
    whGroup.add(westWall);
    this.addBoxCollider(-68.5, 0, -29.5, -66.5, 7.0, 13.5);

    // 2. North Wall (Z = -21, width 32m, depth 1m, height 6.5m)
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(32, 6.5, 1.0), brickMat);
    northWall.position.set(0, 3.25, -20.5);
    whGroup.add(northWall);
    this.addBoxCollider(-68.5, 0, -29.5, -35.5, 7.0, -27.5);

    // 3. South Wall (Z = +21, width 32m, depth 1m, height 6.5m)
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(32, 6.5, 1.0), brickMat);
    southWall.position.set(0, 3.25, 20.5);
    whGroup.add(southWall);
    this.addBoxCollider(-68.5, 0, 11.5, -35.5, 7.0, 13.5);

    // 4. East Wall (Facing Central Road): Split into two wall segments with an 8m open loading door in the middle (Z = -4 to +4)
    // East-North Wall section: Z = -21 to -4
    const eastNorthWall = new THREE.Mesh(new THREE.BoxGeometry(1.0, 6.5, 17), brickMat);
    eastNorthWall.position.set(15.5, 3.25, -12.5);
    whGroup.add(eastNorthWall);
    this.addBoxCollider(-37.5, 0, -29.5, -35.5, 7.0, -4.0);

    // East-South Wall section: Z = +4 to +21
    const eastSouthWall = new THREE.Mesh(new THREE.BoxGeometry(1.0, 6.5, 17), brickMat);
    eastSouthWall.position.set(15.5, 3.25, 12.5);
    whGroup.add(eastSouthWall);
    this.addBoxCollider(-37.5, 0, 4.0, -35.5, 7.0, 13.5);

    // Lintel beam above open loading entrance
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 8.5), brickMat);
    lintel.position.set(15.5, 5.5, 0);
    whGroup.add(lintel);

    // Pitched Corrugated Metal Roof with skylight openings for natural daytime illumination
    const roofP1 = new THREE.Mesh(new THREE.BoxGeometry(17.5, 0.35, 43), tinRoofMat);
    roofP1.position.set(-7.5, 7.4, 0);
    roofP1.rotation.z = -0.22;
    whGroup.add(roofP1);

    const roofP2 = new THREE.Mesh(new THREE.BoxGeometry(17.5, 0.35, 43), tinRoofMat);
    roofP2.position.set(7.5, 7.4, 0);
    roofP2.rotation.z = 0.22;
    whGroup.add(roofP2);

    // Prominent Exterior Signboard: "WAREHOUSE" & "মেসার্স মধুমতি জুট গোডাউন ১ • WAREHOUSE"
    const whSign = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.4, 15), signMat);
    whSign.position.set(16.15, 5.8, 0);
    whGroup.add(whSign);

    // Interior Structural Steel Columns & Tactical Jute Sack Stacks inside
    for (let cz of [-12, 12]) {
      for (let cx of [-8, 6]) {
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.25, 0.25, 6.5, 8),
          new THREE.MeshLambertMaterial({ color: 0x334155 })
        );
        col.position.set(cx, 3.25, cz);
        whGroup.add(col);
        this.addBoxCollider(-52 + cx - 0.3, 0, -8 + cz - 0.3, -52 + cx + 0.3, 6.5, -8 + cz + 0.3);
      }
    }

    // Inside Tactical Cover Stacks: Stacks of Jute Bags & Pallets
    const createInteriorStack = (ix, iz) => {
      for (let j = 0; j < 3; j++) {
        const sMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 3.2), sackMat);
        sMesh.position.set(ix, 0.25 + j * 0.45, iz);
        whGroup.add(sMesh);
      }
      this.addBoxCollider(-52 + ix - 1.2, 0, -8 + iz - 1.7, -52 + ix + 1.2, 1.8, -8 + iz + 1.7);
    };

    createInteriorStack(-10, -12);
    createInteriorStack(-10, 10);
    createInteriorStack(8, -14);
    createInteriorStack(8, 14);

    // Pallet Jack / Forklift prop inside loading bay
    const pjMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 2.2), new THREE.MeshLambertMaterial({ color: 0xca8a04 }));
    pjMesh.position.set(5, 0.6, 4);
    whGroup.add(pjMesh);
    this.addBoxCollider(-52 + 5 - 0.9, 0, -8 + 4 - 1.2, -52 + 5 + 0.9, 1.4, -8 + 4 + 1.2);

    parent.add(whGroup);
  },

  // 7. BIWTA Cargo Transit Shed (Warehouse 2 - East) - Playable Interior
  createBiwtaCargoShed: function(parent) {
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x475569 }); // Slate steel
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const blueSignMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 });
    const crateMat = new THREE.MeshLambertMaterial({ color: 0x92400e });

    const shedGroup = new THREE.Group();
    shedGroup.position.set(54, 0, 4);

    // Concrete interior floor (playable)
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(28, 0.1, 38),
      new THREE.MeshLambertMaterial({ color: 0x334155 })
    );
    floor.position.y = 0.05;
    shedGroup.add(floor);

    // 1. East Solid Wall (X = +14, width 1m, depth 38m, height 5.8m)
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(1.0, 5.8, 38), wallMat);
    eastWall.position.set(13.5, 2.9, 0);
    shedGroup.add(eastWall);
    this.addBoxCollider(66.5, 0, -15.5, 68.5, 7.0, 23.5);

    // 2. North Solid Wall (Z = -19, width 28m, depth 1m, height 5.8m)
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(28, 5.8, 1.0), wallMat);
    northWall.position.set(0, 2.9, -18.5);
    shedGroup.add(northWall);
    this.addBoxCollider(39.5, 0, -15.5, 68.5, 7.0, -13.5);

    // 3. South Solid Wall (Z = +19, width 28m, depth 1m, height 5.8m)
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(28, 5.8, 1.0), wallMat);
    southWall.position.set(0, 2.9, 18.5);
    shedGroup.add(southWall);
    this.addBoxCollider(39.5, 0, 21.5, 68.5, 7.0, 23.5);

    // 4. West Wall (Facing Central Road): Has a wide open cargo transit bay (Z = -2 to +10 is OPEN!)
    // West-North section: Z = -19 to -2
    const westNorth = new THREE.Mesh(new THREE.BoxGeometry(1.0, 5.8, 17), wallMat);
    westNorth.position.set(-13.5, 2.9, -10.5);
    shedGroup.add(westNorth);
    this.addBoxCollider(39.5, 0, -15.5, 41.5, 7.0, -2.0);

    // West-South section: Z = 10 to 19
    const westSouth = new THREE.Mesh(new THREE.BoxGeometry(1.0, 5.8, 9), wallMat);
    westSouth.position.set(-13.5, 2.9, 14.5);
    shedGroup.add(westSouth);
    this.addBoxCollider(39.5, 0, 10.0, 41.5, 7.0, 23.5);

    // Lintel beam above West open bay
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 12), wallMat);
    lintel.position.set(-13.5, 5.0, 4);
    shedGroup.add(lintel);

    // Sloped Industrial Metal Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(30, 0.35, 40), roofMat);
    roof.position.set(0, 6.0, 0);
    roof.rotation.z = -0.06;
    shedGroup.add(roof);

    // Prominent Blue Signboard: "WAREHOUSE" & "বাংলাদেশ অভ্যন্তরীণ নৌ-পরিবহন কর্তৃপক্ষ • WAREHOUSE"
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.3, 16), blueSignMat);
    sign.position.set(-14.1, 5.2, 4);
    shedGroup.add(sign);

    // Inside Interior Cargo Racks & Crates
    for (let rz of [-10, 8]) {
      const rack = new THREE.Mesh(
        new THREE.BoxGeometry(6.0, 3.2, 1.8),
        new THREE.MeshLambertMaterial({ color: 0x1e293b })
      );
      rack.position.set(4, 1.6, rz);
      shedGroup.add(rack);
      this.addBoxCollider(54 + 4 - 3.2, 0, 4 + rz - 1.0, 54 + 4 + 3.2, 3.5, 4 + rz + 1.0);
    }

    // Inside Wooden Shipping Crates
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 2.0), crateMat);
    c1.position.set(-4, 1.0, -10);
    shedGroup.add(c1);
    this.addBoxCollider(54 - 4 - 1.1, 0, 4 - 10 - 1.1, 54 - 4 + 1.1, 2.2, 4 - 10 + 1.1);

    parent.add(shedGroup);
  },

  // 8. Central Shipping Container Freight Yard & Landmark Sign
  createContainerYard: function(parent) {
    const C_COLORS = [
      0x991b1b, // Rust Marine Red
      0x0e7490, // Port Cyan / Teal
      0x1e3a8a, // Deep Navy Blue
      0xb45309, // Safety Amber / Orange
      0x374151  // Weathered Charcoal Gray
    ];

    const createContainer = (cx, cz, rotY, is40ft, colorIdx, stackLevel = 0) => {
      const len = is40ft ? 12.0 : 6.2;
      const wid = 2.44;
      const hei = 2.60;
      const cy = 0.05 + stackLevel * 2.62 + (hei / 2);

      const mat = new THREE.MeshLambertMaterial({ color: C_COLORS[colorIdx % C_COLORS.length] });
      const cMesh = new THREE.Mesh(new THREE.BoxGeometry(wid, hei, len), mat);
      cMesh.position.set(cx, cy, cz);
      cMesh.rotation.y = rotY;
      parent.add(cMesh);

      const trimMat = new THREE.MeshLambertMaterial({ color: 0x111827 });
      const trim1 = new THREE.Mesh(new THREE.BoxGeometry(wid + 0.06, 0.12, len + 0.06), trimMat);
      trim1.position.set(cx, cy + hei / 2, cz);
      trim1.rotation.y = rotY;
      parent.add(trim1);

      const halfW = (rotY === 0) ? wid / 2 : len / 2;
      const halfL = (rotY === 0) ? len / 2 : wid / 2;
      this.addBoxCollider(cx - halfW, 0, cz - halfL, cx + halfW, cy + hei / 2, cz + halfL);
    };

    // Strategic tactical container stacks forming flanking corridors & chokepoints
    createContainer(-18, -12, 0, true, 0, 0);
    createContainer(-18, -12, 0, true, 1, 1);
    createContainer(-18, 6, 0, true, 2, 0);

    createContainer(18, -12, 0, true, 3, 0);
    createContainer(18, 6, 0, true, 4, 0);
    createContainer(18, 6, 0, true, 0, 1);

    createContainer(-7, -22, Math.PI / 2, false, 1, 0);
    createContainer(7, -22, Math.PI / 2, false, 2, 0);

    createContainer(-8, 22, Math.PI / 2, false, 3, 0);
    createContainer(8, 22, Math.PI / 2, false, 0, 0);

    createContainer(-26, 4, 0, false, 4, 0);
    createContainer(26, -4, 0, false, 1, 0);

    // Container Yard Entrance Sign Arch with visible "STORAGE" sign
    const archMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const signMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const yardArch = new THREE.Group();
    yardArch.position.set(0, 0, -25);

    const postL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.0, 0.5), archMat);
    postL.position.set(-6, 2.0, 0);
    yardArch.add(postL);
    this.addBoxCollider(-6.3, 0, -25.3, -5.7, 4.0, -24.7);

    const postR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.0, 0.5), archMat);
    postR.position.set(6, 2.0, 0);
    yardArch.add(postR);
    this.addBoxCollider(5.7, 0, -25.3, 6.3, 4.0, -24.7);

    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(13, 0.5, 0.5), archMat);
    topBeam.position.set(0, 4.0, 0);
    yardArch.add(topBeam);

    const storageSign = new THREE.Mesh(new THREE.BoxGeometry(8, 0.9, 0.15), signMat);
    storageSign.position.set(0, 4.0, 0.3);
    yardArch.add(storageSign);

    parent.add(yardArch);

    // Industrial Wooden Pallets & Metal Oil Drums
    const drumMat = new THREE.MeshLambertMaterial({ color: 0x1e3a8a });
    const createDrumTrio = (dx, dz) => {
      for (let i = 0; i < 3; i++) {
        const ang = (i / 3) * Math.PI * 2;
        const drum = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.4, 1.1, 10),
          drumMat
        );
        drum.position.set(dx + Math.cos(ang) * 0.45, 0.55, dz + Math.sin(ang) * 0.45);
        parent.add(drum);
      }
      this.addBoxCollider(dx - 0.8, 0, dz - 0.8, dx + 0.8, 1.2, dz + 0.8);
    };

    createDrumTrio(-12, 10);
    createDrumTrio(12, -4);
    createDrumTrio(0, 14);
  },

  // 9. Agro-Industrial Factory, Grain Silos & Brick Boiler Chimney - Playable Interior
  createAgroFactoryAndSilos: function(parent) {
    const factoryWallMat = new THREE.MeshLambertMaterial({ color: 0x4b5563 });
    const steelSiloMat = new THREE.MeshPhongMaterial({ color: 0x94a3b8, specular: 0xcccccc, shininess: 50 });
    const chimneyMat = new THREE.MeshLambertMaterial({ color: 0x7c2d12 }); // Red clay brick
    const signMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const machineMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });

    const facGroup = new THREE.Group();
    facGroup.position.set(-50, 0, -52);

    // Concrete Interior Floor (Playable)
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(30, 0.1, 26),
      new THREE.MeshLambertMaterial({ color: 0x374151 })
    );
    floor.position.y = 0.05;
    facGroup.add(floor);

    // 1. West Solid Wall (X = -15, width 1m, depth 26m, height 8m)
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(1.0, 8.0, 26), factoryWallMat);
    westWall.position.set(-14.5, 4.0, 0);
    facGroup.add(westWall);
    this.addBoxCollider(-65.5, 0, -65.5, -63.5, 8.5, -38.5);

    // 2. North Wall (Z = -13): Has Emergency Exit Doorway (X = -2 to +2 is OPEN!)
    // North-West section: X = -15 to -2
    const northWest = new THREE.Mesh(new THREE.BoxGeometry(13, 8.0, 1.0), factoryWallMat);
    northWest.position.set(-8.0, 4.0, -12.5);
    facGroup.add(northWest);
    this.addBoxCollider(-65.5, 0, -65.5, -52.0, 8.5, -63.5);

    // North-East section: X = +2 to +15
    const northEast = new THREE.Mesh(new THREE.BoxGeometry(13, 8.0, 1.0), factoryWallMat);
    northEast.position.set(8.0, 4.0, -12.5);
    facGroup.add(northEast);
    this.addBoxCollider(-48.0, 0, -65.5, -34.5, 8.5, -63.5);

    // Lintel above North exit
    const northLintel = new THREE.Mesh(new THREE.BoxGeometry(4.0, 4.5, 1.2), factoryWallMat);
    northLintel.position.set(0, 5.75, -12.5);
    facGroup.add(northLintel);

    // 3. East Wall (Facing Central Road): Has Side Entrance Doorway (Z = -2 to +2 is OPEN!)
    // East-North section: Z = -13 to -2
    const eastNorth = new THREE.Mesh(new THREE.BoxGeometry(1.0, 8.0, 11), factoryWallMat);
    eastNorth.position.set(14.5, 4.0, -7.5);
    facGroup.add(eastNorth);
    this.addBoxCollider(-36.5, 0, -65.5, -34.5, 8.5, -54.0);

    // East-South section: Z = +2 to +13
    const eastSouth = new THREE.Mesh(new THREE.BoxGeometry(1.0, 8.0, 11), factoryWallMat);
    eastSouth.position.set(14.5, 4.0, 7.5);
    facGroup.add(eastSouth);
    this.addBoxCollider(-36.5, 0, -50.0, -34.5, 8.5, -38.5);

    // Lintel above East side entrance
    const eastLintel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.5, 4.0), factoryWallMat);
    eastLintel.position.set(14.5, 5.75, 0);
    facGroup.add(eastLintel);

    // 4. South Wall (Facing Silos & Road): Has Wide Main Sliding Loading Entrance (X = -4 to +4 is OPEN!)
    // South-West section: X = -15 to -4
    const southWest = new THREE.Mesh(new THREE.BoxGeometry(11, 8.0, 1.0), factoryWallMat);
    southWest.position.set(-9.0, 4.0, 12.5);
    facGroup.add(southWest);
    this.addBoxCollider(-65.5, 0, -40.5, -54.0, 8.5, -38.5);

    // South-East section: X = +4 to +15
    const southEast = new THREE.Mesh(new THREE.BoxGeometry(11, 8.0, 1.0), factoryWallMat);
    southEast.position.set(9.0, 4.0, 12.5);
    facGroup.add(southEast);
    this.addBoxCollider(-44.0, 0, -40.5, -34.5, 8.5, -38.5);

    // Lintel above South main entrance
    const southLintel = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.5, 1.2), factoryWallMat);
    southLintel.position.set(0, 6.25, 12.5);
    facGroup.add(southLintel);

    // Factory Sloped Roof with translucent skylight panels for bright mobile FPS interior visibility
    const fRoof = new THREE.Mesh(
      new THREE.BoxGeometry(32, 0.4, 28),
      new THREE.MeshLambertMaterial({ color: 0x1f2937 })
    );
    fRoof.position.set(0, 8.2, 0);
    facGroup.add(fRoof);

    // Roof Vent Monitor
    const vent = new THREE.Mesh(
      new THREE.BoxGeometry(16, 1.2, 8),
      new THREE.MeshLambertMaterial({ color: 0x374151 })
    );
    vent.position.set(0, 9.0, 0);
    facGroup.add(vent);

    // Prominent Signboard on exterior East & South walls: "FACTORY"
    const signE = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.4, 12), signMat);
    signE.position.set(14.8, 6.5, 0);
    facGroup.add(signE);

    const signS = new THREE.Mesh(new THREE.BoxGeometry(10, 1.3, 0.15), signMat);
    signS.position.set(0, 6.8, 12.8);
    facGroup.add(signS);

    // Inside Factory Machinery & Tactical Cover
    // Large Rice Milling Processing Generator Machine (X = -58 to -54, Z = -58 to -54)
    const genMachine = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 4.2), machineMat);
    genMachine.position.set(-7, 1.6, -5);
    facGroup.add(genMachine);
    this.addBoxCollider(-50 - 7 - 2.2, 0, -52 - 5 - 2.2, -50 - 7 + 2.2, 3.5, -52 - 5 + 2.2);

    // Machinery caution stripes trim
    const stripeTrim = new THREE.Mesh(
      new THREE.BoxGeometry(4.3, 0.35, 4.3),
      new THREE.MeshLambertMaterial({ color: 0xf59e0b })
    );
    stripeTrim.position.set(-7, 3.1, -5);
    facGroup.add(stripeTrim);

    // Interior Metal Catwalk & Industrial Storage Crates
    const crateStack = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.8, 2.4),
      new THREE.MeshLambertMaterial({ color: 0x78350f })
    );
    crateStack.position.set(6, 0.9, 5);
    facGroup.add(crateStack);
    this.addBoxCollider(-50 + 6 - 1.3, 0, -52 + 5 - 1.3, -50 + 6 + 1.3, 2.0, -52 + 5 + 1.3);

    // 2. Tall Brick Boiler Chimney Stack ("ইটের চিমনি")
    const chimneyGeo = new THREE.CylinderGeometry(1.2, 1.8, 24, 12);
    const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
    chimney.position.set(13.5, 12.0, -10.5);
    facGroup.add(chimney);

    const cRimGeo = new THREE.CylinderGeometry(1.4, 1.3, 0.8, 12);
    const cRim = new THREE.Mesh(cRimGeo, new THREE.MeshLambertMaterial({ color: 0x1c1917 }));
    cRim.position.set(13.5, 24.2, -10.5);
    facGroup.add(cRim);
    this.addBoxCollider(-38.5, 0, -64.5, -34.5, 25.0, -60.5);

    // 3. Pair of Large Cylindrical Steel Grain / Feed Silos
    const siloGeo = new THREE.CylinderGeometry(3.5, 3.5, 12, 16);
    const siloCapGeo = new THREE.ConeGeometry(3.6, 2.4, 16);

    for (let sx of [-11, -3]) {
      const silo = new THREE.Mesh(siloGeo, steelSiloMat);
      silo.position.set(sx, 6.0, 18);
      facGroup.add(silo);

      const cap = new THREE.Mesh(siloCapGeo, steelSiloMat);
      cap.position.set(sx, 13.2, 18);
      facGroup.add(cap);

      this.addBoxCollider(-50 + sx - 2.6, 0, -52 + 18 - 2.6, -50 + sx + 2.6, 14.0, -52 + 18 + 2.6);
    }

    parent.add(facGroup);
  },

  // 10. Heavy Industrial Workshop, Diesel Tanks & Gantry Crane - Playable Interior
  createWorkshopAndFuelTanks: function(parent) {
    const wsMat = new THREE.MeshLambertMaterial({ color: 0x3f3f46 });
    const tankMat = new THREE.MeshPhongMaterial({ color: 0xd4d4d8, specular: 0x888888, shininess: 40 });
    const signMat = new THREE.MeshLambertMaterial({ color: 0xca8a04 });

    const wsGroup = new THREE.Group();
    wsGroup.position.set(48, 0, -50);

    // Concrete Interior Floor (Playable)
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(24, 0.1, 24),
      new THREE.MeshLambertMaterial({ color: 0x27272a })
    );
    floor.position.y = 0.05;
    wsGroup.add(floor);

    // 1. East Solid Wall (X = +12)
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(1.0, 6.0, 24), wsMat);
    eastWall.position.set(11.5, 3.0, 0);
    wsGroup.add(eastWall);
    this.addBoxCollider(58.5, 0, -62.5, 60.5, 7.0, -37.5);

    // 2. North Solid Wall (Z = -12)
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(24, 6.0, 1.0), wsMat);
    northWall.position.set(0, 3.0, -11.5);
    wsGroup.add(northWall);
    this.addBoxCollider(35.5, 0, -62.5, 60.5, 7.0, -60.5);

    // 3. South Solid Wall (Z = +12)
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(24, 6.0, 1.0), wsMat);
    southWall.position.set(0, 3.0, 11.5);
    wsGroup.add(southWall);
    this.addBoxCollider(35.5, 0, -39.5, 60.5, 7.0, -37.5);

    // 4. West Wall (Facing Access Lane): Has Wide Open Mechanic Bay Entrance (Z = -4 to +4 is OPEN!)
    // West-North section: Z = -12 to -4
    const westNorth = new THREE.Mesh(new THREE.BoxGeometry(1.0, 6.0, 8), wsMat);
    westNorth.position.set(-11.5, 3.0, -8);
    wsGroup.add(westNorth);
    this.addBoxCollider(35.5, 0, -62.5, 37.5, 7.0, -54.0);

    // West-South section: Z = +4 to +12
    const westSouth = new THREE.Mesh(new THREE.BoxGeometry(1.0, 6.0, 8), wsMat);
    westSouth.position.set(-11.5, 3.0, 8);
    wsGroup.add(westSouth);
    this.addBoxCollider(35.5, 0, -46.0, 37.5, 7.0, -37.5);

    // Lintel above West open bay
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 8.5), wsMat);
    lintel.position.set(-11.5, 5.1, 0);
    wsGroup.add(lintel);

    // Arched barrel vault corrugated roof
    const roofGeo = new THREE.CylinderGeometry(12.5, 12.5, 24.5, 12, 1, false, 0, Math.PI);
    roofGeo.rotateZ(Math.PI / 2);
    const roof = new THREE.Mesh(roofGeo, new THREE.MeshLambertMaterial({ color: 0x27272a }));
    roof.position.set(0, 5.8, 0);
    wsGroup.add(roof);

    // Visible Signboard: "WORKSHOP"
    const wsSign = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.1, 8.0), signMat);
    wsSign.position.set(-11.8, 5.2, 0);
    wsGroup.add(wsSign);

    // Inside Mechanic Workbenches & Engine Block Props
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.1, 5.5),
      new THREE.MeshLambertMaterial({ color: 0x52525b })
    );
    bench.position.set(8, 0.55, -6);
    wsGroup.add(bench);
    this.addBoxCollider(48 + 8 - 0.8, 0, -50 - 6 - 2.8, 48 + 8 + 0.8, 1.4, -50 - 6 + 2.8);

    // Large Horizontal Diesel Fuel Storage Tank at X = 48, Z = -32
    const tankGeo = new THREE.CylinderGeometry(2.0, 2.0, 7.5, 16);
    tankGeo.rotateZ(Math.PI / 2);
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(0, 2.4, 18);
    wsGroup.add(tank);

    const saddleGeo = new THREE.BoxGeometry(1.2, 1.4, 4.8);
    const saddleMat = new THREE.MeshLambertMaterial({ color: 0x71717a });
    for (let tx of [-2.5, 2.5]) {
      const saddle = new THREE.Mesh(saddleGeo, saddleMat);
      saddle.position.set(tx, 0.7, 18);
      wsGroup.add(saddle);
    }
    this.addBoxCollider(43, 0, -35, 53, 4.5, -29);

    parent.add(wsGroup);
  },

  // 11. North Worker Quarters, Tea Stall & Shops
  createWorkerQuartersAndShops: function(parent) {
    const tinMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    const woodWallMat = new THREE.MeshLambertMaterial({ color: 0x78563a });
    const stallMat = new THREE.MeshLambertMaterial({ color: 0x15803d });

    // Row of 3 Worker Tin Quarters along North-West road edge (X = -40, -28, -16; Z = -88)
    for (let i = 0; i < 3; i++) {
      const qx = -40 + (i * 12);
      const qz = -88;

      const qGroup = new THREE.Group();
      qGroup.position.set(qx, 0, qz);

      const hutBody = new THREE.Mesh(new THREE.BoxGeometry(9.5, 3.2, 7.5), tinMat);
      hutBody.position.y = 1.6;
      qGroup.add(hutBody);

      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(10.5, 0.25, 8.5),
        new THREE.MeshLambertMaterial({ color: 0x334155 })
      );
      roof.position.set(0, 3.4, 0);
      roof.rotation.z = -0.15;
      qGroup.add(roof);

      const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.1), woodWallMat);
      door.position.set(0, 1.1, 3.76);
      qGroup.add(door);

      parent.add(qGroup);
      this.addBoxCollider(qx - 5.0, 0, qz - 4.0, qx + 5.0, 4.0, qz + 4.0);
    }

    // Roadside Tea Stall & Snack Corner ("কালামের চায়ের দোকান") at X = 20, Z = -85
    const teaGroup = new THREE.Group();
    teaGroup.position.set(20, 0, -85);

    const stallBody = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.6, 4.2), stallMat);
    stallBody.position.y = 1.3;
    teaGroup.add(stallBody);

    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.15, 3.0),
      new THREE.MeshLambertMaterial({ color: 0xb45309 })
    );
    awning.position.set(0, 2.6, 2.0);
    awning.rotation.x = 0.22;
    teaGroup.add(awning);

    const benchGeo = new THREE.BoxGeometry(3.5, 0.45, 0.6);
    const benchMat = new THREE.MeshLambertMaterial({ color: 0x5c3d2e });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, 0.25, 3.5);
    teaGroup.add(bench);

    const kettle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 0.6, 8),
      new THREE.MeshLambertMaterial({ color: 0xd1d5db })
    );
    kettle.position.set(-1.2, 1.4, 2.0);
    teaGroup.add(kettle);

    parent.add(teaGroup);
    this.addBoxCollider(17, 0, -87.5, 23, 3.2, -81.5);
  },

  // 12. Transport Trucks & Cargo Vans
  createTransportVehicles: function(parent) {
    const createBanglaTruck = (tx, tz, rotY, cabColorHex) => {
      const truckGroup = new THREE.Group();
      truckGroup.position.set(tx, 0, tz);
      truckGroup.rotation.y = rotY;

      const chassisMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 8.5), chassisMat);
      chassis.position.y = 0.7;
      truckGroup.add(chassis);

      const cabMat = new THREE.MeshLambertMaterial({ color: cabColorHex });
      const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.4), cabMat);
      cab.position.set(0, 1.8, 2.8);
      truckGroup.add(cab);

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.9, 0.1),
        new THREE.MeshPhongMaterial({ color: 0x38bdf8, specular: 0xffffff, shininess: 80 })
      );
      glass.position.set(0, 2.0, 4.01);
      truckGroup.add(glass);

      const bedMat = new THREE.MeshLambertMaterial({ color: 0x15803d });
      const bed = new THREE.Mesh(new THREE.BoxGeometry(2.45, 1.8, 5.8), bedMat);
      bed.position.set(0, 1.8, -1.2);
      truckGroup.add(bed);

      const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.35, 12);
      wheelGeo.rotateZ(Math.PI / 2);
      const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

      for (let wz of [-3.2, -1.8, 2.8]) {
        for (let wx of [-1.2, 1.2]) {
          const wheel = new THREE.Mesh(wheelGeo, wheelMat);
          wheel.position.set(wx, 0.5, wz);
          truckGroup.add(wheel);
        }
      }

      parent.add(truckGroup);

      // Exact tight bounding box matching rotated truck dimensions:
      // Solid truck body has half-width ~1.15m and half-length ~4.0m.
      // With player radius 0.42m, collider extents of 0.85m laterally and 3.8m longitudinally
      // ensure the player can walk through natural passages beside the truck without clipping through solid body.
      const isRotated = Math.abs(Math.sin(rotY)) > 0.5;
      const extentX = isRotated ? 3.8 : 0.85;
      const extentZ = isRotated ? 0.85 : 3.8;
      this.addBoxCollider(tx - extentX, 0, tz - extentZ, tx + extentX, 2.8, tz + extentZ);
    };

    createBanglaTruck(-28, -6, Math.PI / 2, 0xd97706);
    createBanglaTruck(35, 14, 0, 0x2563eb);
    createBanglaTruck(30, -50, Math.PI / 2, 0xdc2626);
  },

  // 13. Palm Trees, Rain Trees & Industrial Pipes/Lamps
  createFoliageAndInfrastructure: function(parent) {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x452815 });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x1e3a1f });
    const pipeMat = new THREE.MeshLambertMaterial({ color: 0x64748b });

    const treePositions = [
      [-95, 45], [-85, 52], [-70, 60], [-55, 62],
      [-92, -60], [-88, -80], [-60, -92],
      [75, 52], [90, 48], [92, -40], [85, -75]
    ];

    treePositions.forEach(pos => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(pos[0], 0, pos[1]);

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.32, 9.5, 8),
        trunkMat
      );
      trunk.position.y = 4.75;
      trunk.rotation.z = (Math.random() - 0.5) * 0.12;
      treeGroup.add(trunk);

      const frondGeo = new THREE.ConeGeometry(3.2, 1.8, 6);
      const frond = new THREE.Mesh(frondGeo, leafMat);
      frond.position.y = 9.5;
      treeGroup.add(frond);

      parent.add(treeGroup);
      this.addBoxCollider(pos[0] - 0.4, 0, pos[1] - 0.4, pos[0] + 0.4, 8.0, pos[1] + 0.4);
    });

    // Elevated Industrial Pipe Rack running along factory side (Z = -52 to -22 at X = -32)
    for (let pz = -52; pz <= -24; pz += 7.0) {
      const stanchion = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 5.5, 0.35),
        pipeMat
      );
      stanchion.position.set(-32, 2.75, pz);
      parent.add(stanchion);

      const crossarm = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.25, 0.35),
        pipeMat
      );
      crossarm.position.set(-32, 5.2, pz);
      parent.add(crossarm);

      this.addBoxCollider(-32.3, 0, pz - 0.3, -31.7, 5.5, pz + 0.3);
    }

    // Horizontal Steel Pipes on rack
    for (let py of [5.0, 5.35]) {
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 30, 8),
        pipeMat
      );
      pipe.position.set(-32, py, -38);
      pipe.rotation.x = Math.PI / 2;
      parent.add(pipe);
    }

    // Street Lampposts along Main Road & Riverbank Road
    const lampMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const lampPositions = [
      [-6, 50], [6, 50], [40, 50], [-40, 50],
      [5.5, 20], [5.5, -10], [5.5, -45], [5.5, -75]
    ];

    lampPositions.forEach(lp => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, 6.5, 8),
        lampMat
      );
      pole.position.set(lp[0], 3.25, lp[1]);
      parent.add(pole);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.12), lampMat);
      arm.position.set(lp[0] > 0 ? lp[0] - 0.7 : lp[0] + 0.7, 6.4, lp[1]);
      parent.add(arm);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), bulbMat);
      bulb.position.set(lp[0] > 0 ? lp[0] - 1.2 : lp[0] + 1.2, 6.2, lp[1]);
      parent.add(bulb);

      this.addBoxCollider(lp[0] - 0.25, 0, lp[1] - 0.25, lp[0] + 0.25, 6.5, lp[1] + 0.25);
    });
  },

  // 14. Perimeter Security Enclosure Walls
  createPerimeterEnclosure: function(parent) {
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x475569 });

    // North Security Wall (-105 to +105 at Z = -102) with open road gateway at X = -6 to +6
    const nWall1 = new THREE.Mesh(new THREE.BoxGeometry(98, 3.2, 0.6), wallMat);
    nWall1.position.set(-56, 1.6, -102);
    parent.add(nWall1);
    this.addBoxCollider(-105, 0, -102.5, -7, 4.0, -101.5);

    const nWall2 = new THREE.Mesh(new THREE.BoxGeometry(98, 3.2, 0.6), wallMat);
    nWall2.position.set(56, 1.6, -102);
    parent.add(nWall2);
    this.addBoxCollider(7, 0, -102.5, 105, 4.0, -101.5);

    // West Security Wall (Z = -102 to +68 at X = -104)
    const wWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.2, 170), wallMat);
    wWall.position.set(-104, 1.6, -17);
    parent.add(wWall);
    this.addBoxCollider(-104.5, 0, -102, -103.5, 4.0, 68);

    // East Security Wall (Z = -102 to +68 at X = +104)
    const eWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.2, 170), wallMat);
    eWall.position.set(104, 1.6, -17);
    parent.add(eWall);
    this.addBoxCollider(103.5, 0, -102, 104.5, 4.0, 68);
  },

  // 15. Real-Time HUD Mini-Map Renderer
  drawMiniMap: function(ctx, width, height, fpsController) {
    if (!ctx) return;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 0.58;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Circular radar frame clipping
    ctx.beginPath();
    ctx.arc(centerX, centerY, width / 2 - 2, 0, Math.PI * 2);
    ctx.clip();

    // Map background: Industrial dark gray-green
    ctx.fillStyle = '#1e2422';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);

    // Rotate map with player yaw for tactical heading alignment
    const yaw = fpsController ? fpsController.yaw : 0;
    ctx.rotate(yaw);

    // Offset by player world position
    const px = fpsController ? fpsController.position.x : 0;
    const pz = fpsController ? fpsController.position.z : 0;
    ctx.translate(-px * scale, -pz * scale);

    // 1. South Nabaganga River (Turquoise blue water expanse)
    ctx.fillStyle = '#0891b2';
    ctx.fillRect(-115 * scale, 68 * scale, 230 * scale, 55 * scale);

    // Embankment shoreline
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-115 * scale, 68 * scale);
    ctx.lineTo(115 * scale, 68 * scale);
    ctx.stroke();

    // 2. Concrete Aprons & Yards
    ctx.fillStyle = '#334155';
    ctx.fillRect(-35 * scale, -28 * scale, 70 * scale, 55 * scale); // Container yard
    ctx.fillRect(-72 * scale, -35 * scale, 45 * scale, 60 * scale); // Warehouse 1 yard
    ctx.fillRect(32 * scale, -25 * scale, 45 * scale, 60 * scale);  // BIWTA yard

    // 3. Road Network (Dark asphalt bands)
    ctx.fillStyle = '#475569';
    // Riverbank Road
    ctx.fillRect(-105 * scale, 45 * scale, 210 * scale, 10 * scale);
    // Central Main Road
    ctx.fillRect(-5 * scale, -95 * scale, 10 * scale, 145 * scale);
    // North Road
    ctx.fillRect(-105 * scale, -79 * scale, 210 * scale, 9 * scale);
    // Central Branch Road
    ctx.fillRect(-90 * scale, -4 * scale, 180 * scale, 8 * scale);

    // Concrete Culvert Bridge (Brown deck)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(6 * scale, 45 * scale, 12 * scale, 10 * scale);

    // River Ghat & Jetties
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-32 * scale, 68 * scale, 4 * scale, 18 * scale); // Jetty 1
    ctx.fillRect(18 * scale, 68 * scale, 4 * scale, 18 * scale);  // Jetty 2
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-20 * scale, 68 * scale, 14 * scale, 10 * scale); // Ghat steps

    // Moored Cargo Boats (Navy ovals)
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-38 * scale, 72 * scale, 4 * scale, 12 * scale);
    ctx.fillRect(23 * scale, 72 * scale, 4 * scale, 12 * scale);
    ctx.fillRect(-6 * scale, 78 * scale, 4 * scale, 12 * scale);

    // 4. Industrial Buildings & Warehouses
    // Warehouse 1 (Reddish brown)
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-68 * scale, -29 * scale, 32 * scale, 42 * scale);

    // BIWTA Shed (Navy blue)
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(40 * scale, -15 * scale, 28 * scale, 38 * scale);

    // Factory Hall (Slate dark gray)
    ctx.fillStyle = '#374151';
    ctx.fillRect(-65 * scale, -65 * scale, 30 * scale, 26 * scale);

    // Silos (White circles)
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(-61 * scale, -41 * scale, 3.5 * scale, 0, Math.PI * 2);
    ctx.arc(-53 * scale, -41 * scale, 3.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Workshop (Zinc gray)
    ctx.fillStyle = '#52525b';
    ctx.fillRect(36 * scale, -62 * scale, 24 * scale, 24 * scale);

    // Worker Quarters & Tea Stall (Green)
    ctx.fillStyle = '#15803d';
    ctx.fillRect(-45 * scale, -92 * scale, 32 * scale, 8 * scale);
    ctx.fillRect(17 * scale, -87 * scale, 6 * scale, 5 * scale);

    // 5. Container Yard (Colored blocks)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-17 * scale, -18 * scale, 3 * scale, 12 * scale);
    ctx.fillStyle = '#0891b2';
    ctx.fillRect(15 * scale, -8 * scale, 3 * scale, 12 * scale);
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(15 * scale, 4 * scale, 3 * scale, 12 * scale);

    // 6. Tactical Medkit Pickups (Green cross beacons)
    const medkitLocs = [
      [-35, -15], [25, 20], [-10, 65], [45, -55], [0, -10]
    ];
    ctx.fillStyle = '#22c55e';
    medkitLocs.forEach(mk => {
      ctx.fillRect(mk[0] * scale - 2, mk[1] * scale - 2, 4, 4);
    });

    // 7. Active Enemy Bot Blips (Red dots)
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

    // 8. Player location center blip with heading radar cone
    ctx.save();
    ctx.translate(centerX, centerY);

    const coneGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 32);
    coneGrad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
    coneGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 32, -Math.PI / 2 - 0.45, -Math.PI / 2 + 0.45);
    ctx.closePath();
    ctx.fill();

    // Player arrow triangle (Cyan for River Port)
    ctx.fillStyle = '#06b6d4';
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
  window.MaguraRiverPortBuilder = MaguraRiverPortBuilder;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MaguraRiverPortBuilder };
}
