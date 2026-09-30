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

  // Player start spawn point (Village entrance dirt road facing south into the village)
  playerSpawn: {
    x: 0,
    y: 1.72,
    z: -70,
    yaw: 0
  },

  // 7 Enemy Patrol Bot tactical configurations for Abalpur Village
  enemyConfigs: [
    {
      id: 1,
      name: "শত্রু ১ (আবালপুর মোড়)",
      spawn: { x: 6, y: 0, z: -12 },
      waypoints: [
        { x: 6, z: -12 },
        { x: 18, z: -12 },
        { x: 18, z: 2 },
        { x: 6, z: 2 }
      ]
    },
    {
      id: 2,
      name: "শত্রু ২ (ধানক্ষেত আইল)",
      spawn: { x: 42, y: 0, z: 25 },
      waypoints: [
        { x: 42, z: 25 },
        { x: 72, z: 25 },
        { x: 72, z: 58 },
        { x: 42, z: 58 }
      ]
    },
    {
      id: 3,
      name: "শত্রু ৩ (পুকুরপাড় ও ঘাট)",
      spawn: { x: -44, y: 0, z: 12 },
      waypoints: [
        { x: -44, z: 12 },
        { x: -44, z: 32 },
        { x: -65, z: 36 },
        { x: -65, z: 12 }
      ]
    },
    {
      id: 4,
      name: "শত্রু ৪ (দক্ষিণ উঠান ও খড়ের গাদা)",
      spawn: { x: -22, y: 0, z: 46 },
      waypoints: [
        { x: -22, z: 46 },
        { x: -35, z: 46 },
        { x: -35, z: 62 },
        { x: -22, z: 62 }
      ]
    },
    {
      id: 5,
      name: "শত্রু ৫ (কালভার্ট ব্রিজ মোড়)",
      spawn: { x: 0, y: 0, z: 30 },
      waypoints: [
        { x: 0, z: 22 },
        { x: -14, z: 28 },
        { x: 0, z: 36 },
        { x: 14, z: 28 }
      ]
    },
    {
      id: 6,
      name: "শত্রু ৬ (বাঁশঝাড় গলি)",
      spawn: { x: 32, y: 0, z: -35 },
      waypoints: [
        { x: 32, z: -35 },
        { x: 50, z: -35 },
        { x: 50, z: -16 },
        { x: 32, z: -16 }
      ]
    },
    {
      id: 7,
      name: "শত্রু ৭ (উত্তর-পশ্চিম বাড়ি)",
      spawn: { x: -32, y: 0, z: -48 },
      waypoints: [
        { x: -32, z: -48 },
        { x: -48, z: -48 },
        { x: -48, z: -32 },
        { x: -32, z: -32 }
      ]
    }
  ],

  // Initialize shared geometries to minimize GPU allocation
  initSharedGeometries: function() {
    // Betel nut palm (tall slender cylinder)
    this.sharedGeos.betelTrunk = new THREE.CylinderGeometry(0.14, 0.18, 12, 6);
    this.sharedGeos.betelTrunk.translate(0, 6, 0);

    // Coconut palm trunk
    this.sharedGeos.palmTrunk = new THREE.CylinderGeometry(0.24, 0.38, 9.5, 7);
    this.sharedGeos.palmTrunk.translate(0, 4.75, 0);

    // Palm / Betel frond leaf
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.35, 1.6, 0.08, 3.2);
    leafShape.quadraticCurveTo(-0.35, 1.6, 0, 0);
    this.sharedGeos.frondLeaf = new THREE.ShapeGeometry(leafShape);

    // Banana leaf (broad curved blade)
    const bananaShape = new THREE.Shape();
    bananaShape.moveTo(0, 0);
    bananaShape.quadraticCurveTo(0.65, 1.3, 0.3, 2.6);
    bananaShape.quadraticCurveTo(-0.65, 1.3, 0, 0);
    this.sharedGeos.bananaLeaf = new THREE.ShapeGeometry(bananaShape);

    // Bamboo culm
    this.sharedGeos.bambooPole = new THREE.CylinderGeometry(0.06, 0.08, 8, 5);
    this.sharedGeos.bambooPole.translate(0, 4, 0);

    // Haystack (conical dome)
    this.sharedGeos.haystack = new THREE.ConeGeometry(2.8, 4.2, 10);
    this.sharedGeos.haystack.translate(0, 2.1, 0);

    // Utility pole
    this.sharedGeos.utilityPole = new THREE.CylinderGeometry(0.12, 0.16, 8.5, 6);
    this.sharedGeos.utilityPole.translate(0, 4.25, 0);
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

    // 11. Boundary Enclosure (Dense bamboo & hedge tree line to keep combat enclosed)
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
  createPaddyFields: function(parent) {
    // Canvas Paddy Rice Texture (Bright green rows of rice seedlings)
    const paddyCanvas = document.createElement('canvas');
    paddyCanvas.width = 256;
    paddyCanvas.height = 256;
    const pCtx = paddyCanvas.getContext('2d');

    // Wet rich brown/dark mud soil base
    pCtx.fillStyle = '#22381e';
    pCtx.fillRect(0, 0, 256, 256);

    // Rows of vibrant green rice seedlings (ধানের চারা)
    for (let y = 6; y < 256; y += 14) {
      // Water gleam line between rows
      pCtx.fillStyle = 'rgba(74, 120, 90, 0.35)';
      pCtx.fillRect(0, y - 2, 256, 3);

      for (let x = 4; x < 256; x += 12) {
        // Individual rice clump tuft
        pCtx.fillStyle = '#3eb02a';
        pCtx.beginPath();
        pCtx.ellipse(x, y + 4, 3.5, 5.5, 0, 0, Math.PI * 2);
        pCtx.fill();

        pCtx.fillStyle = '#65d64f';
        pCtx.beginPath();
        pCtx.ellipse(x + 1, y + 3, 2, 3.5, 0.2, 0, Math.PI * 2);
        pCtx.fill();
      }
    }

    const paddyTex = new THREE.CanvasTexture(paddyCanvas);
    paddyTex.wrapS = THREE.RepeatWrapping;
    paddyTex.wrapT = THREE.RepeatWrapping;

    // Field 1: Large Northeast Paddy Field (ধানক্ষেত ১)
    this.createFieldQuad(parent, 55, 48, 52, 56, paddyTex);

    // Field 2: East Paddy Field along road (ধানক্ষেত ২)
    this.createFieldQuad(parent, 58, -48, 50, 48, paddyTex);

    // Field 3: Northwest Small Seedbed (ধানের বীজতলা)
    this.createFieldQuad(parent, -65, -55, 42, 38, paddyTex);

    // Tactical: Irrigation Pump Shed (শ্যালোর ঘর) in Northeast Field
    this.createIrrigationPumpShed(parent, 35, 22);

    // Scarecrow (কাকতাড়ুয়া) in East Field
    this.createScarecrow(parent, 54, -42);
  },

  createFieldQuad: function(parent, cx, cz, w, d, tex) {
    const fieldMat = new THREE.MeshLambertMaterial({
      map: tex.clone(),
      color: 0xe8ffea
    });
    fieldMat.map.repeat.set(w / 8, d / 8);

    // Sunken field basin
    const fieldMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), fieldMat);
    fieldMesh.rotation.x = -Math.PI / 2;
    fieldMesh.position.set(cx, -0.06, cz);
    fieldMesh.receiveShadow = true;
    parent.add(fieldMesh);

    // Raised Earthen Ridges (আইল - mud footpaths between fields)
    const ridgeMat = new THREE.MeshLambertMaterial({ color: 0x5a432e });
    const ridgeH = 0.22;
    const ridgeW = 0.75;

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

    // Add low step colliders for ridges so players can walk atop them
    // (low height allows step-over in controls.js while providing tactile collision)
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

    // HOMESTEAD 2 (Northwest Compound - আধা-পাকা বাড়ি ও গোয়ালঘর)
    this.createRuralHouse(parent, {
      x: -36, z: -52, w: 11, d: 8, h: 3.6,
      wallTex: ruralBrickTex,
      roofType: 'tin_gable',
      hasVeranda: true,
      doorSide: 'south'
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

    // E. Mango / Banyan Shade Trees (বট ও আম গাছ)
    this.createShadeTree(parent, 14, 2, 3.8);
    this.createShadeTree(parent, -28, -12, 3.2);
    this.createShadeTree(parent, 40, 52, 3.5);
  },

  // Betel Nut Palm (সুপারি গাছ)
  createBetelNutPalm: function(parent, x, z) {
    const palm = new THREE.Group();
    palm.position.set(x, 0, z);

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x736355 });
    const trunk = new THREE.Mesh(this.sharedGeos.betelTrunk, trunkMat);
    trunk.castShadow = true;
    palm.add(trunk);

    // Compact cluster of fronds at top (12m height)
    const frondMat = new THREE.MeshLambertMaterial({
      color: 0x226b38,
      side: THREE.DoubleSide
    });
    const numFronds = 7;
    for (let i = 0; i < numFronds; i++) {
      const frond = new THREE.Group();
      frond.position.set(0, 11.8, 0);
      frond.rotation.y = (i / numFronds) * Math.PI * 2;
      frond.rotation.z = 0.45;

      const leaf = new THREE.Mesh(this.sharedGeos.frondLeaf, frondMat);
      leaf.position.set(0, 0.4, 0);
      frond.add(leaf);
      palm.add(frond);
    }

    parent.add(palm);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.35, 0, z - 0.35),
      new THREE.Vector3(x + 0.35, 12, z + 0.35)
    ));
  },

  // Coconut Palm (নারিকেল গাছ)
  createCoconutPalm: function(parent, x, z) {
    const palm = new THREE.Group();
    palm.position.set(x, 0, z);

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x615243 });
    const trunk = new THREE.Mesh(this.sharedGeos.palmTrunk, trunkMat);
    trunk.castShadow = true;
    palm.add(trunk);

    const frondMat = new THREE.MeshLambertMaterial({
      color: 0x2d7338,
      side: THREE.DoubleSide
    });
    for (let i = 0; i < 8; i++) {
      const frond = new THREE.Group();
      frond.position.set(0, 9.4, 0);
      frond.rotation.y = (i / 8) * Math.PI * 2;
      frond.rotation.z = 0.55;

      const leaf = new THREE.Mesh(this.sharedGeos.frondLeaf, frondMat);
      leaf.position.set(0, 0.6, 0);
      frond.add(leaf);
      palm.add(frond);
    }

    parent.add(palm);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.45, 0, z - 0.45),
      new THREE.Vector3(x + 0.45, 10, z + 0.45)
    ));
  },

  // Banana Cluster (কলা গাছ)
  createBananaCluster: function(parent, x, z) {
    const cluster = new THREE.Group();
    cluster.position.set(x, 0, z);

    const stemMat = new THREE.MeshLambertMaterial({ color: 0x6da848 });
    const leafMat = new THREE.MeshLambertMaterial({
      color: 0x388a2a,
      side: THREE.DoubleSide
    });

    for (let b = 0; b < 3; b++) {
      const ang = (b / 3) * Math.PI * 2;
      const bx = Math.cos(ang) * 0.4;
      const bz = Math.sin(ang) * 0.4;
      const bh = 3.2 + Math.random() * 0.6;

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, bh, 5), stemMat);
      stem.position.set(bx, bh / 2, bz);
      cluster.add(stem);

      // Broad fan-like banana leaves
      for (let l = 0; l < 5; l++) {
        const leaf = new THREE.Mesh(this.sharedGeos.bananaLeaf, leafMat);
        leaf.position.set(bx, bh - 0.2, bz);
        leaf.rotation.y = (l / 5) * Math.PI * 2;
        leaf.rotation.x = 0.45;
        cluster.add(leaf);
      }
    }

    parent.add(cluster);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.7, 0, z - 0.7),
      new THREE.Vector3(x + 0.7, 3.8, z + 0.7)
    ));
  },

  // Bamboo Grove Thicket (বাঁশঝাড়)
  createBambooGrove: function(parent, x, z) {
    const grove = new THREE.Group();
    grove.position.set(x, 0, z);

    const bambooMat = new THREE.MeshLambertMaterial({ color: 0x7ea846 });
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x2e6628 });

    const numCulms = 12;
    for (let i = 0; i < numCulms; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.random() * 2.2;
      const px = Math.cos(ang) * rad;
      const pz = Math.sin(ang) * rad;

      const culm = new THREE.Mesh(this.sharedGeos.bambooPole, bambooMat);
      culm.position.set(px, 0, pz);
      culm.rotation.z = (Math.random() - 0.5) * 0.14;
      culm.rotation.x = (Math.random() - 0.5) * 0.14;
      grove.add(culm);

      // Top leafy canopy ball
      if (i % 2 === 0) {
        const topLeaf = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 0), foliageMat);
        topLeaf.position.set(px, 7.5, pz);
        grove.add(topLeaf);
      }
    }

    parent.add(grove);

    // Natural visual & cover obstacle
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 2.0, 0, z - 2.0),
      new THREE.Vector3(x + 2.0, 7.5, z + 2.0)
    ));
  },

  // Mango / Banyan Shade Tree (আম ও বট গাছ)
  createShadeTree: function(parent, x, z, radius = 3.5) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x483a2b });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.75, 4.5, 7), trunkMat);
    trunk.position.set(0, 2.25, 0);
    trunk.castShadow = true;
    tree.add(trunk);

    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x224a20 });
    const mainCanopy = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 1), foliageMat);
    mainCanopy.position.set(0, 4.8, 0);
    tree.add(mainCanopy);

    parent.add(tree);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.7, 0, z - 0.7),
      new THREE.Vector3(x + 0.7, 6.5, z + 0.7)
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

  // ================= 11. PERIMETER BOUNDARY ENCLOSURE =================
  createPerimeterEnclosure: function(parent) {
    // Keep combat contained within the 240x240 village battleground
    const boundHalf = 115;
    const boundH = 6;
    const boundThickness = 6;

    // 4 invisible perimeter boundary walls
    const nBound = new THREE.Box3(
      new THREE.Vector3(-boundHalf, 0, -boundHalf - boundThickness),
      new THREE.Vector3(boundHalf, boundH, -boundHalf)
    );
    const sBound = new THREE.Box3(
      new THREE.Vector3(-boundHalf, 0, boundHalf),
      new THREE.Vector3(boundHalf, boundH, boundHalf + boundThickness)
    );
    const wBound = new THREE.Box3(
      new THREE.Vector3(-boundHalf - boundThickness, 0, -boundHalf),
      new THREE.Vector3(-boundHalf, boundH, boundHalf)
    );
    const eBound = new THREE.Box3(
      new THREE.Vector3(boundHalf, 0, -boundHalf),
      new THREE.Vector3(boundHalf + boundThickness, boundH, boundHalf)
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

    // 1. Green Rice Paddy Fields (ধানক্ষেত)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
    ctx.fillRect(29 * scale, 20 * scale, 52 * scale, 56 * scale);
    ctx.fillRect(33 * scale, -72 * scale, 50 * scale, 48 * scale);
    ctx.fillRect(-86 * scale, -74 * scale, 42 * scale, 38 * scale);

    // 2. Village Pond (পুকুর)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-82 * scale, 8 * scale, 34 * scale, 24 * scale);

    // 3. Roads (East-West & North-South dirt & brick)
    ctx.fillStyle = '#b45309'; // Brick chowrasta
    ctx.fillRect(-22 * scale, -13 * scale, 44 * scale, 6.5 * scale);
    ctx.fillStyle = '#78350f'; // Dirt road
    ctx.fillRect(-110 * scale, -13 * scale, 88 * scale, 6.2 * scale);
    ctx.fillRect(22 * scale, -13 * scale, 88 * scale, 5.8 * scale);
    ctx.fillRect(-2.6 * scale, -80 * scale, 5.2 * scale, 70 * scale);
    ctx.fillRect(-2.6 * scale, 12 * scale, 5.2 * scale, 65 * scale);

    // 4. Culvert Bridge
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-3.2 * scale, 13.8 * scale, 6.4 * scale, 4.5 * scale);

    // 5. Buildings / Homesteads blocks
    ctx.fillStyle = 'rgba(203, 213, 225, 0.9)';
    const villageBuildings = [
      [-30, 50, 10, 8],   // Homestead 1
      [-41, -56, 11, 8],  // Homestead 2
      [41, -60, 9.5, 7.5],// Homestead 3
      [47, 41, 11, 10],   // Homestead 4
      [7.2, -22.4, 5.5, 4.8], // Shop 1
      [-14.6, -22.3, 5.2, 4.6] // Shop 3
    ];
    villageBuildings.forEach(b => {
      ctx.fillRect(b[0] * scale, b[1] * scale, b[2] * scale, b[3] * scale);
    });

    // 6. Haystacks (yellow circles)
    ctx.fillStyle = '#facc15';
    const haystacks = [[-16, 46], [-23, -42], [36, -56]];
    haystacks.forEach(h => {
      ctx.beginPath();
      ctx.arc(h[0] * scale, h[1] * scale, 2.8 * scale, 0, Math.PI * 2);
      ctx.fill();
    });

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
