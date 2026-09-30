// World Builder for Battlezone Magura
// Builds high-detail, optimized 3D Bangladeshi town environment for mobile FPS

const WorldBuilder = {
  colliders: [],
  interactiveObjects: [],
  waterMesh: null,

  // Player start spawn point (dynamically selected from verified safe outdoor playerSpawns on build)
  playerSpawn: {
    x: 0,
    y: 1.72,
    z: -15,
    yaw: 0
  },

  // 8 Verified Safe Outdoor Player Spawns distributed across distinct tactical combat zones
  playerSpawns: [
    // Zone 1: Town Center Crossroads (South of Culvert Bridge on Main Highway)
    { x: 0, y: 1.72, z: -15, yaw: 0, zone: "Town Center Crossroads" },
    // Zone 2: School & College Road (Paved sidewalk approaching campus)
    { x: 25, y: 1.72, z: -48, yaw: Math.PI / 2, zone: "College Road Approach" },
    // Zone 3: Hospital Avenue (Open road median facing Hospital Gate)
    { x: -40, y: 1.72, z: -68, yaw: -Math.PI / 2, zone: "Hospital Avenue Island" },
    // Zone 4: Boro Bazar Commercial Gateway (Grand brick avenue entrance)
    { x: -25, y: 1.72, z: 18, yaw: -Math.PI / 2, zone: "Boro Bazar Gateway Avenue" },
    // Zone 5: Police Lines Approach (Stadium Road outside main checkpoint)
    { x: 26, y: 1.72, z: 22, yaw: Math.PI / 2, zone: "Police Lines Approach" },
    // Zone 6: Town Square Plaza (North entrance plaza sidewalk)
    { x: 0, y: 1.72, z: 42, yaw: 0, zone: "Town Square North Plaza" },
    // Zone 7: Nabaganga Riverside Promenade (Open riverside walkway)
    { x: 0, y: 1.72, z: 98, yaw: 0, zone: "Nabaganga Riverside Promenade" },
    // Zone 8: North Residential Streets (Model Town Avenue corridor)
    { x: 42, y: 1.72, z: -66, yaw: Math.PI, zone: "North Residential Avenue" }
  ],

  // 10 Tactical Enemy Patrol Bot configurations spanning all connected districts of Magura Town
  enemyConfigs: [
    {
      id: 1,
      name: "শত্রু ১ (ভায়নার মোড় চত্বর • Vaynar Mor)",
      spawn: { x: 0, y: 0, z: -95 },
      waypoints: [
        { x: 0, z: -95 },
        { x: 12, z: -95 },
        { x: 0, z: -108 },
        { x: -12, z: -95 }
      ]
    },
    {
      id: 2,
      name: "শত্রু ২ (মডেল স্কুল ও কলেজ ক্যাম্পাস • School Campus)",
      spawn: { x: 70, y: 0, z: -31 },
      waypoints: [
        { x: 70, z: -31 },
        { x: 76, z: -31 },
        { x: 76, z: -36 },
        { x: 70, z: -36 }
      ]
    },
    {
      id: 3,
      name: "শত্রু ৩ (মাগুরা সদর হাসপাতাল ইয়ার্ড • Sadar Hospital)",
      spawn: { x: -70, y: 0, z: -57 },
      waypoints: [
        { x: -70, z: -57 },
        { x: -76, z: -57 },
        { x: -76, z: -61 },
        { x: -70, z: -61 }
      ]
    },
    {
      id: 4,
      name: "শত্রু ৪ (কাঁচা বাজার আড়ত ইয়ার্ড • Kacha Bazar)",
      spawn: { x: -76, y: 0, z: -20 },
      waypoints: [
        { x: -76, z: -20 },
        { x: -84, z: -20 },
        { x: -84, z: -14 },
        { x: -76, z: -14 }
      ]
    },
    {
      id: 5,
      name: "শত্রু ৫ (বড় বাজার হাট স্কয়ার • Boro Bazar)",
      spawn: { x: -50, y: 0, z: 12 },
      waypoints: [
        { x: -50, z: 12 },
        { x: -60, z: 12 },
        { x: -60, z: 14 },
        { x: -50, z: 14 }
      ]
    },
    {
      id: 6,
      name: "শত্রু ৬ (পুলিশ লাইনস প্যারেড গ্রাউন্ড • Police Lines)",
      spawn: { x: 54, y: 0, z: 30 },
      waypoints: [
        { x: 54, z: 30 },
        { x: 60, z: 30 },
        { x: 60, z: 25 },
        { x: 54, z: 25 }
      ]
    },
    {
      id: 7,
      name: "শত্রু ৭ (পুলিশ পূর্ব চেকপোস্ট ও এভিনিউ • East Checkpoint)",
      spawn: { x: 89, y: 0, z: 10 },
      waypoints: [
        { x: 89, z: 10 },
        { x: 89, z: 0 },
        { x: 89, z: 22 },
        { x: 89, z: 10 }
      ]
    },
    {
      id: 8,
      name: "শত্রু ৮ (টাউন স্কয়ার মুক্তমঞ্চ চত্বর • Town Square)",
      spawn: { x: 5, y: 0, z: 68 },
      waypoints: [
        { x: 5, z: 68 },
        { x: -8, z: 68 },
        { x: 0, z: 78 },
        { x: 12, z: 78 }
      ]
    },
    {
      id: 9,
      name: "শত্রু ৯ (নবগঙ্গা রিভার ঘাট ও ওয়াকওয়ে • River Ghat)",
      spawn: { x: -18, y: 0, z: 105 },
      waypoints: [
        { x: -18, z: 105 },
        { x: 8, z: 105 },
        { x: 26, z: 105 },
        { x: -18, z: 105 }
      ]
    },
    {
      id: 10,
      name: "শত্রু ১০ (মডেল টাউন ক্লিনিক স্কয়ার • Model Town)",
      spawn: { x: 58, y: 0, z: -70 },
      waypoints: [
        { x: 58, z: -70 },
        { x: 58, z: -84 },
        { x: 40, z: -84 },
        { x: 45, z: -70 }
      ]
    }
  ],

  buildWorld: function(scene, mapId) {
    if ((mapId === 'abalpur_village' || (typeof currentMap !== 'undefined' && currentMap === 'abalpur_village')) && typeof AbalpurVillageBuilder !== 'undefined') {
      return AbalpurVillageBuilder.buildWorld(scene);
    }
    this.colliders = [];
    // Dynamically pick one of the verified safe outdoor player spawns
    const spawnIdx = Math.floor(Math.random() * this.playerSpawns.length);
    this.playerSpawn = Object.assign({}, this.playerSpawns[spawnIdx]);

    const worldGroup = new THREE.Group();
    worldGroup.name = "MaguraTownWorld";
    scene.add(worldGroup);

    // 1. Terrain / Base Ground
    this.createGround(worldGroup);

    // 2. Main Highway & Connected Streets
    this.createRoadNetwork(worldGroup);

    // 3. Canal & Culvert Bridge
    this.createCulvertBridge(worldGroup);

    // 4. Buildings & Bengali Shops
    this.createTownBuildings(worldGroup);

    // 5. Parked Bangladeshi Vehicles (CNG, Bus, Microbus, Cargo Van)
    this.createVehicles(worldGroup);

    // 6. Utility Poles & Tangled Overhead Cables
    this.createUtilityPoles(worldGroup);

    // 7. Vegetation (Coconut Palms, Roadside Trees)
    this.createVegetation(worldGroup);

    // 8. Roadside Details & Street Furniture (Milestone, Poster Wall)
    this.createStreetFurniture(worldGroup);

    // 9. Vaynar Mor Road Junction & Landmark (ভায়না মোড়)
    this.createVaynarMor(worldGroup);

    // 10. Magura Police Lines Compound (মাগুরা পুলিশ লাইনস)
    this.createPoliceLines(worldGroup);

    // 11. Town Expansion (Connecting roads, roadside shops, houses & details)
    this.createTownExpansion(worldGroup);

    // 12. Expanded Road Network & Urban Suburbs (Wider avenues, T-junctions, side streets, quiet residential suburbs)
    this.createExpandedRoadNetworkAndSuburbs(worldGroup);

    // 13. Magura Boro Bazar Commercial District (মাগুরা বড় বাজার ও বাণিজ্যিক এলাকা)
    this.createMaguraBoroBazar(worldGroup);

    // 14. Magura Town Square & Public Open Ground (মাগুরা টাউন স্কয়ার ও উন্মুক্ত মাঠ)
    this.createTownSquare(worldGroup);

    // 15. Nabaganga Riverside & Boat Ghat Transport Area (নবগঙ্গা রিভার ঘাট ও নৌ-পরিবহন এলাকা)
    this.createRiversideTransportArea(worldGroup);

    // 16. Magura Sadar Hospital & Emergency Clinic (মাগুরা সদর হাসপাতাল ও ট্রমা সেন্টার)
    this.createHospitalArea(worldGroup);

    // 17. Magura Model School & College Campus (মাগুরা মডেল স্কুল ও কলেজ ক্যাম্পাস)
    this.createSchoolCampusArea(worldGroup);

    // 18. Magura Town Complete Interconnections, FPS Routes & Tactical Spawns (টাউন সংযোগ, ট্যাকটিক্যাল রুট ও কাভার)
    this.createTownInterconnectionsAndPolish(worldGroup);

    return {
      colliders: this.colliders,
      waterMesh: this.waterMesh,
      playerSpawn: this.playerSpawn,
      playerSpawns: this.playerSpawns,
      enemyConfigs: this.enemyConfigs
    };
  },

  // 1. Base Ground
  createGround: function(parent) {
    const groundGeo = new THREE.PlaneGeometry(300, 300, 4, 4);
    const groundMat = new THREE.MeshLambertMaterial({
      color: 0x5a6048
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    parent.add(ground);
  },

  // 2. Main Highway & Connected Streets
  createRoadNetwork: function(parent) {
    const roadTexture = TextureFactory.createRoadTexture();
    roadTexture.repeat.set(1, 16);

    // Main Road (Width 16m, Length 240m along Z axis)
    const mainRoadGeo = new THREE.PlaneGeometry(16, 240);
    const mainRoadMat = new THREE.MeshLambertMaterial({
      map: roadTexture
    });
    const mainRoad = new THREE.Mesh(mainRoadGeo, mainRoadMat);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.02, 0);
    mainRoad.receiveShadow = true;
    parent.add(mainRoad);

    // Pedestrian Zebra Crossings
    const crosswalkTex = TextureFactory.createCrosswalkTexture();
    const crosswalkGeo = new THREE.PlaneGeometry(16, 5);
    const crosswalkMat = new THREE.MeshLambertMaterial({
      map: crosswalkTex,
      transparent: true
    });

    const crosswalk1 = new THREE.Mesh(crosswalkGeo, crosswalkMat);
    crosswalk1.rotation.x = -Math.PI / 2;
    crosswalk1.position.set(0, 0.03, 15);
    parent.add(crosswalk1);

    const crosswalk2 = new THREE.Mesh(crosswalkGeo, crosswalkMat);
    crosswalk2.rotation.x = -Math.PI / 2;
    crosswalk2.position.set(0, 0.03, -45);
    parent.add(crosswalk2);

    // Sidewalks along Main Road
    const sidewalkTex = TextureFactory.createSidewalkTexture();
    sidewalkTex.repeat.set(1, 40);
    const sidewalkMat = new THREE.MeshLambertMaterial({
      map: sidewalkTex
    });

    const westSidewalkGeo = new THREE.BoxGeometry(3.5, 0.22, 240);
    const westSidewalk = new THREE.Mesh(westSidewalkGeo, sidewalkMat);
    westSidewalk.position.set(-9.75, 0.1, 0);
    westSidewalk.receiveShadow = true;
    parent.add(westSidewalk);

    const eastSidewalkGeo = new THREE.BoxGeometry(3.5, 0.22, 240);
    const eastSidewalk = new THREE.Mesh(eastSidewalkGeo, sidewalkMat);
    eastSidewalk.position.set(9.75, 0.1, 0);
    eastSidewalk.receiveShadow = true;
    parent.add(eastSidewalk);

    // Curbs with striped warning paint
    const curbTex = TextureFactory.createCurbTexture();
    curbTex.repeat.set(60, 1);
    const curbMat = new THREE.MeshLambertMaterial({
      map: curbTex
    });

    const curbGeo = new THREE.BoxGeometry(0.3, 0.25, 240);
    const westCurb = new THREE.Mesh(curbGeo, curbMat);
    westCurb.position.set(-8.15, 0.12, 0);
    parent.add(westCurb);

    const eastCurb = new THREE.Mesh(curbGeo, curbMat);
    eastCurb.position.set(8.15, 0.12, 0);
    parent.add(eastCurb);

    // Side Street 1: "স্টেডিয়াম রোড" (Stadium Road - East at Z = 25)
    const sideStreetMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createBrickPavementTexture()
    });
    sideStreetMat.map.repeat.set(8, 2);

    const sideStreetEast = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 10),
      sideStreetMat
    );
    sideStreetEast.rotation.x = -Math.PI / 2;
    sideStreetEast.position.set(33, 0.02, 25);
    sideStreetEast.receiveShadow = true;
    parent.add(sideStreetEast);

    // Side Street 2: "পুরাতন বাজার গলি" (Puran Bazar Goli - West at Z = -35)
    const sideStreetWest = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 9),
      sideStreetMat
    );
    sideStreetWest.rotation.x = -Math.PI / 2;
    sideStreetWest.position.set(-33, 0.02, -35);
    sideStreetWest.receiveShadow = true;
    parent.add(sideStreetWest);
  },

  // 3. Canal & Culvert Bridge (নবগঙ্গা ক্যানেল কালভার্ট)
  createCulvertBridge: function(parent) {
    const canalZ = 85;
    const canalWidth = 24;

    // Canal Water basin
    const waterTex = TextureFactory.createWaterTexture();
    waterTex.repeat.set(6, 1);
    const waterMat = new THREE.MeshPhongMaterial({
      map: waterTex,
      shininess: 60,
      transparent: true,
      opacity: 0.92
    });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(240, canalWidth), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -1.8, canalZ);
    parent.add(water);
    this.waterMesh = water;

    // Canal concrete/mud banks
    const bankMat = new THREE.MeshLambertMaterial({ color: 0x3d352e });
    const bankGeo = new THREE.BoxGeometry(240, 2.5, 3);
    const nBank = new THREE.Mesh(bankGeo, bankMat);
    nBank.position.set(0, -1.0, canalZ - canalWidth / 2 - 1.5);
    parent.add(nBank);

    const sBank = new THREE.Mesh(bankGeo, bankMat);
    sBank.position.set(0, -1.0, canalZ + canalWidth / 2 + 1.5);
    parent.add(sBank);

    // Concrete Culvert Bridge Deck
    const bridgeMat = new THREE.MeshLambertMaterial({ color: 0x7a7f85 });
    const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(23, 1.2, canalWidth + 4), bridgeMat);
    bridgeDeck.position.set(0, -0.6, canalZ);
    bridgeDeck.receiveShadow = true;
    parent.add(bridgeDeck);

    // Bridge piers / pillars underneath
    const pierMat = new THREE.MeshLambertMaterial({ color: 0x5a5f65 });
    const pierGeo = new THREE.CylinderGeometry(1.2, 1.5, 3.2, 8);
    for (let x of [-7, 0, 7]) {
      const pier = new THREE.Mesh(pierGeo, pierMat);
      pier.position.set(x, -1.6, canalZ);
      parent.add(pier);
    }

    // Concrete Bridge Railings with Posts
    const railingMat = new THREE.MeshLambertMaterial({ color: 0xe8e5df });
    const reflectorMat = new THREE.MeshLambertMaterial({ color: 0xffaa00 });

    const topRailGeo = new THREE.BoxGeometry(0.35, 0.3, canalWidth + 4);
    const midRailGeo = new THREE.BoxGeometry(0.25, 0.2, canalWidth + 4);
    const postGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const reflGeo = new THREE.BoxGeometry(0.1, 0.25, 0.25);

    for (let side of [-1, 1]) {
      const railX = side * 8.6;
      const topRail = new THREE.Mesh(topRailGeo, railingMat);
      topRail.position.set(railX, 1.1, canalZ);
      parent.add(topRail);

      const midRail = new THREE.Mesh(midRailGeo, railingMat);
      midRail.position.set(railX, 0.6, canalZ);
      parent.add(midRail);

      for (let z = canalZ - canalWidth / 2 - 1; z <= canalZ + canalWidth / 2 + 1; z += 2.4) {
        const post = new THREE.Mesh(postGeo, railingMat);
        post.position.set(railX, 0.6, z);
        parent.add(post);

        const refl = new THREE.Mesh(reflGeo, reflectorMat);
        refl.position.set(railX - side * 0.18, 0.8, z);
        parent.add(refl);
      }

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(railX - 0.5, -2, canalZ - canalWidth / 2 - 2),
        new THREE.Vector3(railX + 0.5, 4, canalZ + canalWidth / 2 + 2)
      ));
    }
  },

  // 4. Buildings & Bengali Shops
  createTownBuildings: function(parent) {
    const buildingList = [
      // WEST SIDE BUILDINGS
      {
        x: -21, z: -80, w: 14, d: 16, floors: 3, color: '#d1c7b8',
        shopName: 'মাগুরা হার্ডওয়্যার', shopSub: 'রড, সিমেন্ট ও স্যানিটারি সামগ্রী', phone: '০১৭২২-৪৫৬৭৮৯', theme: 'blue', shutterOpen: true
      },
      {
        x: -21, z: -58, w: 13, d: 15, floors: 2, color: '#b8c4c2',
        shopName: 'মায়ের দোয়া ফার্মেসী', shopSub: 'দেশী-বিদেশী সকল প্রকার ঔষধ', phone: '০১৯১১-২২৩৩৪৪', theme: 'green', shutterOpen: true
      },
      {
        x: -21, z: -12, w: 15, d: 18, floors: 4, color: '#e5dacf',
        shopName: 'মাগুরা ডিজিটাল ফটো স্টুডিও', shopSub: 'কালার ছবি ও কম্পিউটার ট্রেনিং', phone: '০১৮১৫-৯৮৭৬৫৪', theme: 'orange', shutterOpen: true
      },
      {
        x: -21, z: 8, w: 13, d: 16, floors: 3, color: '#c9bfa8',
        shopName: 'বিকাশ ও নগদ পয়েন্ট', shopSub: 'মোবাইল রিচার্জ, ক্যাশ ইন-আউট', phone: '০১৭৫২-৩৩১১৪৪', theme: 'bkash', shutterOpen: true
      },
      {
        x: -21, z: 28, w: 14, d: 16, floors: 3, color: '#bcc3cb',
        shopName: 'জনতা ইলেকট্রনিক্স', shopSub: 'টিভি, ফ্রিজ ও মোবাইল রিপেয়ারিং', phone: '০১৬৭৮-৫৫۶৬৭৭', theme: 'blue', shutterOpen: false
      },
      {
        x: -21, z: 48, w: 13, d: 15, floors: 2, color: '#cbb6a3',
        shopName: 'বিসমিল্লাহ হোটেল', shopSub: 'স্পেশাল কাচ্চি বিরিয়ানি ও পরোটা', phone: '০১৭৯৯-৮৮৭৭৬৬', theme: 'red', shutterOpen: true
      },

      // EAST SIDE BUILDINGS
      {
        x: 21, z: -82, w: 14, d: 16, floors: 3, color: '#c7bcb0',
        shopName: 'সোনার বাংলা মিষ্টান্ন', shopSub: 'খাঁটি ছানার রসগোল্লা ও চমচম', phone: '০১৭৩৩-৬৬৯৯৮৮', theme: 'orange', shutterOpen: true
      },
      {
        x: 21, z: -60, w: 14, d: 16, floors: 4, color: '#cfd2d6',
        shopName: 'নিউ ঢাকা টেইলার্স', shopSub: 'প্যান্ট শার্ট ও পাঞ্জাবি প্রস্তুতকারক', phone: '০১৮২০-১১২২৩৩', theme: 'blue', shutterOpen: false
      },
      {
        x: 21, z: -38, w: 13, d: 15, floors: 2, color: '#e0d6c3',
        shopName: 'মাগুরা ফল ভাণ্ডার', shopSub: 'টাটকা দেশী ও বিদেশী ফল', phone: '০১৯৫০-৪৪৫৫৬৬', theme: 'green', shutterOpen: true
      },
      {
        x: 21, z: -16, w: 15, d: 18, floors: 3, color: '#bebcb7',
        shopName: 'ভাই ভাই মোটরস পার্টস', shopSub: 'মটরসাইকেল ও সিএনজি পার্টস', phone: '০১৭۶৬-৮৮৯৯০০', theme: 'red', shutterOpen: true
      },
      {
        x: 21, z: 46, w: 14, d: 17, floors: 3, color: '#d8cbbd',
        shopName: 'মাগুরা সেন্ট্রাল ব্যাংক', shopSub: 'আমানত ও রেমিট্যান্স সেবা', phone: '০২৪৭৭-৭৩২১০০', theme: 'blue', shutterOpen: false
      }
    ];

    buildingList.forEach(bld => {
      this.createBangladeshiBuilding(parent, bld);
    });

    // Special: Roadside Tea Stall (টং দোকান) at Z = -2
    this.createRoadsideTeaStall(parent, -11.8, -2);
  },

  createBangladeshiBuilding: function(parent, data) {
    const floorHeight = 3.6;
    const totalHeight = data.floors * floorHeight;
    const bGroup = new THREE.Group();
    bGroup.position.set(data.x, totalHeight / 2, data.z);

    // Facade texture
    const facadeTex = TextureFactory.createBuildingFacadeTexture(data.color, 4, data.floors);
    const wallMat = new THREE.MeshLambertMaterial({
      map: facadeTex
    });

    // Main structural box (Casts shadow for landmark presence)
    const bGeo = new THREE.BoxGeometry(data.w, totalHeight, data.d);
    const bMesh = new THREE.Mesh(bGeo, wallMat);
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    bGroup.add(bMesh);

    // Front facade orientation
    const isWest = data.facing ? (data.facing === 'east') : (data.x < 0);
    const frontOffset = isWest ? data.w / 2 + 0.05 : -data.w / 2 - 0.05;
    const frontRotationY = isWest ? Math.PI / 2 : -Math.PI / 2;

    // Ground floor shop shutter
    const shutterTex = TextureFactory.createShutterTexture('#2b4c59', data.shutterOpen);
    const shutterGeo = new THREE.PlaneGeometry(data.d * 0.65, 3.0);
    const shutterMat = new THREE.MeshLambertMaterial({
      map: shutterTex
    });
    const shutter = new THREE.Mesh(shutterGeo, shutterMat);
    shutter.position.set(frontOffset, -totalHeight / 2 + 1.5, 0);
    shutter.rotation.y = frontRotationY;
    bGroup.add(shutter);

    // Bengali Shop Signboard
    const signTex = TextureFactory.createBengaliSignTexture(data.shopName, data.shopSub, data.phone, data.theme);
    const signGeo = new THREE.BoxGeometry(data.d * 0.75, 1.2, 0.15);
    const signMat = new THREE.MeshLambertMaterial({
      map: signTex
    });
    const signBoard = new THREE.Mesh(signGeo, signMat);
    signBoard.position.set(isWest ? frontOffset + 0.15 : frontOffset - 0.15, -totalHeight / 2 + 3.6, 0);
    signBoard.rotation.y = frontRotationY;
    bGroup.add(signBoard);

    // Canvas Canopy / Fabric Awning
    const awningGeo = new THREE.BoxGeometry(data.d * 0.8, 0.08, 1.8);
    const awningMat = new THREE.MeshLambertMaterial({
      color: data.theme === 'red' ? 0xb32400 : (data.theme === 'green' ? 0x0f6937 : 0x005596)
    });
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(isWest ? frontOffset + 0.9 : frontOffset - 0.9, -totalHeight / 2 + 3.05, 0);
    awning.rotation.y = frontRotationY;
    awning.rotation.x = isWest ? 0.2 : -0.2;
    bGroup.add(awning);

    // Balconies on Upper Floors
    const balconyMat = new THREE.MeshLambertMaterial({ color: 0x8a8e94 });
    const bSlabGeo = new THREE.BoxGeometry(data.d * 0.6, 0.2, 1.2);
    const bRailGeo = new THREE.BoxGeometry(data.d * 0.6, 0.9, 0.05);

    for (let f = 1; f < data.floors; f++) {
      const by = -totalHeight / 2 + f * floorHeight + 0.4;
      const bSlab = new THREE.Mesh(bSlabGeo, balconyMat);
      bSlab.position.set(isWest ? frontOffset + 0.6 : frontOffset - 0.6, by, 0);
      bSlab.rotation.y = frontRotationY;
      bGroup.add(bSlab);

      const bRail = new THREE.Mesh(bRailGeo, balconyMat);
      bRail.position.set(isWest ? frontOffset + 1.15 : frontOffset - 1.15, by + 0.5, 0);
      bRail.rotation.y = frontRotationY;
      bGroup.add(bRail);
    }

    // Rooftop Features
    const parapetMat = new THREE.MeshLambertMaterial({ color: 0x8d8a82 });
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(data.w, 0.8, data.d), parapetMat);
    parapet.position.set(0, totalHeight / 2 + 0.4, 0);
    bGroup.add(parapet);

    // Rooftop Stair Cabin (চিলেকোঠা)
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(4, 2.6, 4), parapetMat);
    cabin.position.set(isWest ? -2 : 2, totalHeight / 2 + 1.3, -2);
    bGroup.add(cabin);

    // Corrugated Tin Roof over Cabin
    const tinMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createTinRoofTexture()
    });
    const tinRoof = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.1, 4.6), tinMat);
    tinRoof.position.set(isWest ? -2 : 2, totalHeight / 2 + 2.65, -2);
    tinRoof.rotation.z = isWest ? -0.15 : 0.15;
    bGroup.add(tinRoof);

    // Blue Cylindrical Water Storage Tank
    const tankMat = new THREE.MeshLambertMaterial({ color: 0x0047ab });
    const waterTank = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.8, 10), tankMat);
    waterTank.position.set(isWest ? 2 : -2, totalHeight / 2 + 1.2, 2);
    bGroup.add(waterTank);

    // TV Antenna Mast
    const mastMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.5, 5), mastMat);
    mast.position.set(0, totalHeight / 2 + 2, 0);
    bGroup.add(mast);

    parent.add(bGroup);

    // Add building box collider
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(data.x - data.w / 2 - 0.5, 0, data.z - data.d / 2 - 0.5),
      new THREE.Vector3(data.x + data.w / 2 + 0.5, totalHeight + 2, data.z + data.d / 2 + 0.5)
    ));
  },

  // Roadside Tea Stall (টং দোকান)
  createRoadsideTeaStall: function(parent, x, z) {
    const stallGroup = new THREE.Group();
    stallGroup.position.set(x, 0, z);

    // Wooden stall counter
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });
    const counter = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 3.2), woodMat);
    counter.position.set(0, 0.5, 0);
    stallGroup.add(counter);

    // Wooden benches for customers
    const bench1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 3.0), woodMat);
    bench1.position.set(1.4, 0.22, 0);
    stallGroup.add(bench1);

    // Slanted Tin Roof
    const tinMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createTinRoofTexture()
    });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.05, 3.8), tinMat);
    roof.position.set(0.4, 2.4, 0);
    roof.rotation.x = 0.1;
    stallGroup.add(roof);

    // Bamboo posts
    const bambooMat = new THREE.MeshLambertMaterial({ color: 0xb59e69 });
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6);
    for (let px of [-0.9, 1.7]) {
      for (let pz of [-1.7, 1.7]) {
        const post = new THREE.Mesh(postGeo, bambooMat);
        post.position.set(px, 1.2, pz);
        stallGroup.add(post);
      }
    }

    // Aluminum Tea Kettle
    const kettleMat = new THREE.MeshPhongMaterial({ color: 0xd9e2ec, shininess: 80 });
    const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.35, 8), kettleMat);
    kettle.position.set(0, 1.18, -0.6);
    stallGroup.add(kettle);

    // Small Bengali sign board
    const signTex = TextureFactory.createBengaliSignTexture('হাজী চা স্টল', 'দুধ চা ও গরম পরোটা', '০১৭১১-৯৯৮৮৭৭', 'red');
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.5, 1.8),
      new THREE.MeshLambertMaterial({ map: signTex })
    );
    sign.position.set(1.5, 2.1, 0);
    stallGroup.add(sign);

    parent.add(stallGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.2, 0, z - 2.0),
      new THREE.Vector3(x + 2.0, 3.0, z + 2.0)
    ));
  },

  // 5. Parked Bangladeshi Vehicles
  createVehicles: function(parent) {
    // 3 CNG Auto-Rickshaws
    this.createCNGAutoRickshaw(parent, -6.2, 0, -18, -0.1);
    this.createCNGAutoRickshaw(parent, -6.5, 0, 12, 0.05);
    this.createCNGAutoRickshaw(parent, 6.2, 0, -50, Math.PI - 0.15);

    // Bangladeshi Local Town Bus ("মাগুরা এক্সপ্রেস")
    this.createBangladeshiBus(parent, 5.8, 0, 52, Math.PI);

    // Microbus (Toyota Hiace style)
    this.createMicrobus(parent, -6.2, 0, -66, 0);

    // Flatbed Rickshaw Cargo Van (ভ্যান গাড়ি)
    this.createRickshawVan(parent, 11.2, 0.22, -30, -0.3);
  },

  // Iconic Bangladeshi CNG Auto-Rickshaw
  createCNGAutoRickshaw: function(parent, x, y, z, rotY) {
    const cng = new THREE.Group();
    cng.position.set(x, y, z);
    cng.rotation.y = rotY || 0;

    const greenMat = new THREE.MeshPhongMaterial({ color: 0x0e6b38, shininess: 40 });
    const yellowMat = new THREE.MeshLambertMaterial({ color: 0xf5b700 });
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x4a758c, transparent: true, opacity: 0.7 });

    // Lower Chassis (Casts shadow)
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 2.6), greenMat);
    lowerBody.position.set(0, 0.55, 0);
    lowerBody.castShadow = true;
    cng.add(lowerBody);

    // Yellow waist band stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.12, 2.62), yellowMat);
    stripe.position.set(0, 0.7, 0);
    cng.add(stripe);

    // Front sloping cabin
    const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 0.8, 8), greenMat);
    nose.position.set(0, 0.6, 1.1);
    cng.add(nose);

    // Black Canvas Canopy Hood
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.9, 1.9), blackMat);
    hood.position.set(0, 1.35, -0.2);
    cng.add(hood);

    // Windshield
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.6), glassMat);
    windshield.position.set(0, 1.25, 0.76);
    windshield.rotation.x = -0.2;
    cng.add(windshield);

    // Side protective cage
    const grillMat = new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true });
    const leftGrill = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), grillMat);
    leftGrill.position.set(-0.69, 1.15, -0.2);
    leftGrill.rotation.y = Math.PI / 2;
    cng.add(leftGrill);

    const rightGrill = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), grillMat);
    rightGrill.position.set(0.69, 1.15, -0.2);
    rightGrill.rotation.y = -Math.PI / 2;
    cng.add(rightGrill);

    // Headlight
    const headlight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    headlight.rotation.x = Math.PI / 2;
    headlight.position.set(0, 0.7, 1.48);
    cng.add(headlight);

    // Wheels
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x282828 });
    const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 8);

    const fWheel = new THREE.Mesh(wheelGeo, tireMat);
    fWheel.rotation.z = Math.PI / 2;
    fWheel.position.set(0, 0.24, 1.1);
    cng.add(fWheel);

    const rlWheel = new THREE.Mesh(wheelGeo, tireMat);
    rlWheel.rotation.z = Math.PI / 2;
    rlWheel.position.set(-0.65, 0.24, -0.8);
    cng.add(rlWheel);

    const rrWheel = new THREE.Mesh(wheelGeo, tireMat);
    rrWheel.rotation.z = Math.PI / 2;
    rrWheel.position.set(0.65, 0.24, -0.8);
    cng.add(rrWheel);

    parent.add(cng);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.9, y, z - 1.5),
      new THREE.Vector3(x + 0.9, y + 2.0, z + 1.5)
    ));
  },

  // Colorful Bangladeshi Local Town Bus ("মাগুরা এক্সপ্রেস")
  createBangladeshiBus: function(parent, x, y, z, rotY) {
    const bus = new THREE.Group();
    bus.position.set(x, y, z);
    bus.rotation.y = rotY || 0;

    const busLength = 10.5;
    const busWidth = 2.6;
    const busHeight = 3.2;

    // Bus body (casts shadow)
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x004b93, shininess: 50 });
    const busMesh = new THREE.Mesh(new THREE.BoxGeometry(busWidth, busHeight, busLength), bodyMat);
    busMesh.position.set(0, busHeight / 2 + 0.5, 0);
    busMesh.castShadow = true;
    bus.add(busMesh);

    // Red & Yellow speed stripes
    const yellowStripe = new THREE.Mesh(
      new THREE.BoxGeometry(busWidth + 0.05, 0.3, busLength * 0.95),
      new THREE.MeshLambertMaterial({ color: 0xffcc00 })
    );
    yellowStripe.position.set(0, 1.4, 0);
    bus.add(yellowStripe);

    const redStripe = new THREE.Mesh(
      new THREE.BoxGeometry(busWidth + 0.05, 0.2, busLength * 0.95),
      new THREE.MeshLambertMaterial({ color: 0xcc1111 })
    );
    redStripe.position.set(0, 1.8, 0);
    bus.add(redStripe);

    // Front Windshield
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x22384a, transparent: true, opacity: 0.75 });
    const fWindow = new THREE.Mesh(new THREE.PlaneGeometry(busWidth * 0.85, 1.1), glassMat);
    fWindow.position.set(0, 2.5, busLength / 2 + 0.02);
    bus.add(fWindow);

    // Destination Banner: "মাগুরা - ঢাকা এক্সপ্রেস"
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 256; bannerCanvas.height = 64;
    const bCtx = bannerCanvas.getContext('2d');
    bCtx.fillStyle = '#b31217';
    bCtx.fillRect(0, 0, 256, 64);
    bCtx.fillStyle = '#ffde59';
    bCtx.font = 'bold 20px sans-serif';
    bCtx.textAlign = 'center';
    bCtx.fillText('মাগুরা — ঢাকা এক্সপ্রেস', 128, 42);
    const bannerTex = new THREE.CanvasTexture(bannerCanvas);

    const destBanner = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.45, 0.1),
      new THREE.MeshLambertMaterial({ map: bannerTex })
    );
    destBanner.position.set(0, 3.35, busLength / 2 + 0.05);
    bus.add(destBanner);

    // Passenger Side Windows
    const winGeo = new THREE.PlaneGeometry(0.95, 0.75);
    for (let side of [-1, 1]) {
      for (let wz = -3.5; wz <= 3.5; wz += 1.4) {
        const win = new THREE.Mesh(winGeo, glassMat);
        win.position.set(side * (busWidth / 2 + 0.02), 2.5, wz);
        win.rotation.y = side * Math.PI / 2;
        bus.add(win);
      }
    }

    // Heavy front steel bumper
    const bumperMat = new THREE.MeshLambertMaterial({ color: 0xd0d0d0 });
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(busWidth + 0.2, 0.4, 0.3), bumperMat);
    bumper.position.set(0, 0.7, busLength / 2 + 0.15);
    bus.add(bumper);

    // Roof Luggage Rack
    const rackMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const rack = new THREE.Mesh(new THREE.BoxGeometry(busWidth * 0.85, 0.3, busLength * 0.7), rackMat);
    rack.position.set(0, busHeight + 0.65, -0.5);
    bus.add(rack);

    // Roof cargo luggage boxes
    for (let i = 0; i < 5; i++) {
      const boxMat = new THREE.MeshLambertMaterial({
        color: [0x5c4033, 0x1f487e, 0x8b3a3a, 0x3d5a80][i % 4]
      });
      const luggage = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.9), boxMat);
      luggage.position.set((Math.random() - 0.5) * 1.0, busHeight + 0.9, -2.5 + i * 1.2);
      bus.add(luggage);
    }

    // Wheels
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x282828 });
    const busWheelGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.32, 10);
    for (let xSide of [-busWidth / 2, busWidth / 2]) {
      for (let zPos of [busLength * 0.3, -busLength * 0.28]) {
        const wheel = new THREE.Mesh(busWheelGeo, tireMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(xSide, 0.52, zPos);
        bus.add(wheel);
      }
    }

    parent.add(bus);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - busWidth / 2 - 0.3, y, z - busLength / 2 - 0.3),
      new THREE.Vector3(x + busWidth / 2 + 0.3, y + 4.2, z + busLength / 2 + 0.3)
    ));
  },

  // White Toyota Hiace Style Microbus
  createMicrobus: function(parent, x, y, z, rotY) {
    const van = new THREE.Group();
    van.position.set(x, y, z);
    van.rotation.y = rotY || 0;

    const vanMat = new THREE.MeshPhongMaterial({ color: 0xf0f2f5, shininess: 50 });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x1c2b36, transparent: true, opacity: 0.8 });

    // Body (casts shadow)
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 4.6), vanMat);
    body.position.set(0, 1.0, 0);
    body.castShadow = true;
    van.add(body);

    // Front Windshield
    const frontWindshield = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.8), glassMat);
    frontWindshield.position.set(0, 1.35, 2.31);
    frontWindshield.rotation.x = -0.3;
    van.add(frontWindshield);

    // Wheels
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x282828 });
    const vanWheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 10);
    for (let xs of [-0.9, 0.9]) {
      for (let zs of [1.3, -1.3]) {
        const w = new THREE.Mesh(vanWheelGeo, tireMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(xs, 0.32, zs);
        van.add(w);
      }
    }

    parent.add(van);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.1, y, z - 2.5),
      new THREE.Vector3(x + 1.1, y + 2.0, z + 2.5)
    ));
  },

  // Flatbed Rickshaw Cargo Van (ভ্যান গাড়ি)
  createRickshawVan: function(parent, x, y, z, rotY) {
    const van = new THREE.Group();
    van.position.set(x, y, z);
    van.rotation.y = rotY || 0;

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x6e4a2d });
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x2e3338 });

    // Wooden flatbed platform
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 2.0), woodMat);
    bed.position.set(0, 0.5, 0);
    van.add(bed);

    // Wooden railing
    const rail = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.25, 2.0), woodMat);
    rail.position.set(0, 0.65, 0);
    van.add(rail);

    // Handlebar
    const frame = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 5), metalMat);
    frame.position.set(0, 0.65, 1.3);
    van.add(frame);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), metalMat);
    handle.position.set(0, 1.05, 1.3);
    van.add(handle);

    // Bicycle wheels
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x282828 });
    const rickWheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.06, 10);

    const fWheel = new THREE.Mesh(rickWheelGeo, wheelMat);
    fWheel.rotation.z = Math.PI / 2;
    fWheel.position.set(0, 0.35, 1.4);
    van.add(fWheel);

    const r1 = new THREE.Mesh(rickWheelGeo, wheelMat);
    r1.rotation.z = Math.PI / 2;
    r1.position.set(-0.7, 0.35, -0.6);
    van.add(r1);

    const r2 = new THREE.Mesh(rickWheelGeo, wheelMat);
    r2.rotation.z = Math.PI / 2;
    r2.position.set(0.7, 0.35, -0.6);
    van.add(r2);

    parent.add(van);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.8, y, z - 1.2),
      new THREE.Vector3(x + 0.8, y + 1.2, z + 1.6)
    ));
  },

  // 6. Concrete Utility Poles & Tangled Overhead Cables
  createUtilityPoles: function(parent) {
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x8a8882 });
    const crossMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const cableMat = new THREE.LineBasicMaterial({ color: 0x111111 });

    const polePositions = [
      { x: -9.5, z: -90 },
      { x: -9.5, z: -40 },
      { x: -9.5, z: 10 },
      { x: -9.5, z: 60 },
      { x: 9.5, z: -70 },
      { x: 9.5, z: -20 },
      { x: 9.5, z: 30 }
    ];

    const poleGeo = new THREE.CylinderGeometry(0.2, 0.26, 9, 8);
    const crossGeo = new THREE.BoxGeometry(2.2, 0.12, 0.12);

    polePositions.forEach(pos => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(pos.x, 4.5, pos.z);
      parent.add(pole);

      const cross = new THREE.Mesh(crossGeo, crossMat);
      cross.position.set(pos.x, 8.2, pos.z);
      parent.add(cross);

      // Add pole collider
      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(pos.x - 0.4, 0, pos.z - 0.4),
        new THREE.Vector3(pos.x + 0.4, 9, pos.z + 0.4)
      ));
    });

    // Overhead drooping cables between poles
    for (let i = 0; i < polePositions.length - 1; i++) {
      const p1 = polePositions[i];
      const p2 = polePositions[i + 1];

      for (let c = 0; c < 2; c++) {
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(p1.x, 8.1 - c * 0.3, p1.z),
          new THREE.Vector3((p1.x + p2.x) / 2, 6.8 - c * 0.4, (p1.z + p2.z) / 2),
          new THREE.Vector3(p2.x, 8.1 - c * 0.3, p2.z)
        );
        const points = curve.getPoints(8);
        const cableGeo = new THREE.BufferGeometry().setFromPoints(points);
        const cableLine = new THREE.Line(cableGeo, cableMat);
        parent.add(cableLine);
      }
    }
  },

  // 7. Vegetation (Coconut Palms & Roadside Shade Trees)
  createVegetation: function(parent) {
    // Shared Trunk Geometry & Frond Geometry
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.2, 3, 0.1),
      new THREE.Vector3(0.5, 6, 0.3),
      new THREE.Vector3(0.8, 9, 0.5)
    ]);
    this.sharedPalmTrunkGeo = new THREE.TubeGeometry(trunkCurve, 8, 0.28, 6, false);
    this.sharedLeafGeo = new THREE.PlaneGeometry(0.7, 3.2);

    const palmPositions = [
      { x: -14, z: -70 },
      { x: -13, z: 2 },
      { x: -13.5, z: 42 },
      { x: 14, z: -50 },
      { x: 13.5, z: -5 },
      { x: 14, z: 62 },
      { x: -15, z: 76 },
      { x: 15, z: 76 },
      { x: -16, z: 96 },
      { x: 16, z: 96 }
    ];

    palmPositions.forEach(pos => {
      this.createCoconutPalm(parent, pos.x, pos.z);
    });

    const treePositions = [
      { x: -14, z: -25 },
      { x: 14, z: 5 },
      { x: 14, z: -75 },
      { x: -15, z: 68 },
      { x: 15, z: 68 }
    ];

    treePositions.forEach(pos => {
      this.createShadeTree(parent, pos.x, pos.z);
    });
  },

  createCoconutPalm: function(parent, x, z) {
    const palm = new THREE.Group();
    palm.position.set(x, 0, z);

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6e5d4f });
    const trunkMesh = new THREE.Mesh(this.sharedPalmTrunkGeo, trunkMat);
    trunkMesh.castShadow = true;
    palm.add(trunkMesh);

    // Crown of Fronds
    const frondMat = new THREE.MeshLambertMaterial({
      color: 0x3b8048,
      side: THREE.DoubleSide
    });

    const numFronds = 8;
    for (let i = 0; i < numFronds; i++) {
      const angle = (i / numFronds) * Math.PI * 2;
      const frond = new THREE.Group();
      frond.position.set(0.8, 9, 0.5);
      frond.rotation.y = angle;

      const leaf = new THREE.Mesh(this.sharedLeafGeo, frondMat);
      leaf.rotation.x = Math.PI / 3;
      leaf.position.set(0, 0.8, 1.4);
      frond.add(leaf);

      palm.add(frond);
    }

    // Cluster of green coconuts
    const cocoMat = new THREE.MeshLambertMaterial({ color: 0x4a7c36 });
    const cocoGeo = new THREE.SphereGeometry(0.22, 6, 6);
    for (let c = 0; c < 3; c++) {
      const coco = new THREE.Mesh(cocoGeo, cocoMat);
      coco.position.set(0.8 + (c - 1) * 0.25, 8.8, 0.5 + (c - 1) * 0.2);
      palm.add(coco);
    }

    parent.add(palm);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.4, 0, z - 0.4),
      new THREE.Vector3(x + 0.4, 9, z + 0.4)
    ));
  },

  createShadeTree: function(parent, x, z) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    // Trunk
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3c31 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 5.5, 6), trunkMat);
    trunk.position.set(0, 2.75, 0);
    trunk.castShadow = true;
    tree.add(trunk);

    // Foliage Canopy Clusters
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x3d7339 });
    const canopyPositions = [
      { x: 0, y: 5.5, z: 0, r: 2.4 },
      { x: 1.2, y: 6.2, z: 0.8, r: 1.9 },
      { x: -1.0, y: 6.0, z: -0.9, r: 1.8 },
      { x: 0.8, y: 6.5, z: -1.1, r: 1.7 }
    ];

    canopyPositions.forEach(c => {
      const ball = new THREE.Mesh(new THREE.DodecahedronGeometry(c.r, 0), foliageMat);
      ball.position.set(c.x, c.y, c.z);
      tree.add(ball);
    });

    parent.add(tree);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.6, 0, z - 0.6),
      new THREE.Vector3(x + 0.6, 7, z + 0.6)
    ));
  },

  // 8. Roadside Details & Street Furniture
  createStreetFurniture: function(parent) {
    // Concrete Kilometer Milestone Post (মাইলফলক)
    const stoneCanvas = document.createElement('canvas');
    stoneCanvas.width = 128; stoneCanvas.height = 128;
    const sCtx = stoneCanvas.getContext('2d');
    sCtx.fillStyle = '#f5f5f0';
    sCtx.fillRect(0, 0, 128, 128);
    sCtx.fillStyle = '#ffbb00';
    sCtx.beginPath();
    sCtx.arc(64, 40, 36, Math.PI, 0);
    sCtx.fill();
    sCtx.fillStyle = '#111111';
    sCtx.font = 'bold 15px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.fillText('মাগুরা', 64, 70);
    sCtx.font = 'bold 18px sans-serif';
    sCtx.fillText('০ কিমি', 64, 95);
    sCtx.font = 'bold 9px sans-serif';
    sCtx.fillText('N7 HIGHWAY', 64, 115);
    const stoneTex = new THREE.CanvasTexture(stoneCanvas);

    const milestone = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.1, 0.4),
      new THREE.MeshLambertMaterial({ map: stoneTex })
    );
    milestone.position.set(-8.6, 0.65, -10);
    milestone.rotation.y = Math.PI / 2;
    parent.add(milestone);

    // Wall with posters at corner of Stadium Road
    const wallTex = TextureFactory.createWallPosterTexture();
    const posterWall = new THREE.Mesh(
      new THREE.BoxGeometry(16, 2.5, 0.4),
      new THREE.MeshLambertMaterial({ map: wallTex })
    );
    posterWall.position.set(16, 1.25, 30.5);
    parent.add(posterWall);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(8, 0, 30.2),
      new THREE.Vector3(24, 3, 30.8)
    ));
  },

  // =========================================================
  // 9. VAYNAR MOR (ভায়না মোড়) - Iconic Urban Road Junction & Landmark
  // =========================================================
  createVaynarMor: function(parent) {
    const junctionZ = -102;
    const roadTexture = TextureFactory.createRoadTexture();
    roadTexture.repeat.set(8, 1);

    // 1. East-West Crossroad ("ঝিনাইদহ-ফরিদপুর লিংক রোড")
    // Width 16m, Length 108m from X = -54 to X = 54
    const crossRoadGeo = new THREE.PlaneGeometry(108, 16);
    const crossRoadMat = new THREE.MeshLambertMaterial({ map: roadTexture });
    const crossRoad = new THREE.Mesh(crossRoadGeo, crossRoadMat);
    crossRoad.rotation.x = -Math.PI / 2;
    crossRoad.position.set(0, 0.022, junctionZ);
    crossRoad.receiveShadow = true;
    parent.add(crossRoad);

    // 2. Pedestrian Zebra Crossings on all four junction arms
    const crosswalkTex = TextureFactory.createCrosswalkTexture();
    const crosswalkMat = new THREE.MeshLambertMaterial({ map: crosswalkTex, transparent: true });

    // North & South Crosswalks across Main Highway
    const cwNorth = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.5), crosswalkMat);
    cwNorth.rotation.x = -Math.PI / 2;
    cwNorth.position.set(0, 0.03, junctionZ - 11.5);
    parent.add(cwNorth);

    const cwSouth = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.5), crosswalkMat);
    cwSouth.rotation.x = -Math.PI / 2;
    cwSouth.position.set(0, 0.03, junctionZ + 11.5);
    parent.add(cwSouth);

    // East & West Crosswalks across Crossroad
    const cwWest = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 16), crosswalkMat);
    cwWest.rotation.x = -Math.PI / 2;
    cwWest.position.set(-11.5, 0.03, junctionZ);
    parent.add(cwWest);

    const cwEast = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 16), crosswalkMat);
    cwEast.rotation.x = -Math.PI / 2;
    cwEast.position.set(11.5, 0.03, junctionZ);
    parent.add(cwEast);

    // 3. Sidewalks & Curbs on the 4 Junction Quadrants
    const sidewalkTex = TextureFactory.createSidewalkTexture();
    sidewalkTex.repeat.set(6, 3);
    const sidewalkMat = new THREE.MeshLambertMaterial({ map: sidewalkTex });

    const curbTex = TextureFactory.createCurbTexture();
    curbTex.repeat.set(20, 1);
    const curbMat = new THREE.MeshLambertMaterial({ map: curbTex });

    const cornerSidewalkConfigs = [
      { x: -33, z: junctionZ - 15.5, w: 42, d: 15 }, // Northwest
      { x: 33, z: junctionZ - 15.5, w: 42, d: 15 },  // Northeast
      { x: -33, z: junctionZ + 15.5, w: 42, d: 15 }, // Southwest
      { x: 33, z: junctionZ + 15.5, w: 42, d: 15 }   // Southeast
    ];

    cornerSidewalkConfigs.forEach(cfg => {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(cfg.w, 0.22, cfg.d), sidewalkMat);
      sw.position.set(cfg.x, 0.1, cfg.z);
      sw.receiveShadow = true;
      parent.add(sw);
    });

    // Outer Curbs along junction sidewalks
    const curbGeoEW = new THREE.BoxGeometry(42, 0.25, 0.3);
    const curbGeoNS = new THREE.BoxGeometry(0.3, 0.25, 15);

    // NW & NE South-facing curbs
    const curbNW_S = new THREE.Mesh(curbGeoEW, curbMat); curbNW_S.position.set(-33, 0.12, junctionZ - 8.15); parent.add(curbNW_S);
    const curbNE_S = new THREE.Mesh(curbGeoEW, curbMat); curbNE_S.position.set(33, 0.12, junctionZ - 8.15); parent.add(curbNE_S);

    // SW & SE North-facing curbs
    const curbSW_N = new THREE.Mesh(curbGeoEW, curbMat); curbSW_N.position.set(-33, 0.12, junctionZ + 8.15); parent.add(curbSW_N);
    const curbSE_N = new THREE.Mesh(curbGeoEW, curbMat); curbSE_N.position.set(33, 0.12, junctionZ + 8.15); parent.add(curbSE_N);

    // Inner Corner NS Curbs
    const curbNW_E = new THREE.Mesh(curbGeoNS, curbMat); curbNW_E.position.set(-8.15, 0.12, junctionZ - 15.5); parent.add(curbNW_E);
    const curbNE_W = new THREE.Mesh(curbGeoNS, curbMat); curbNE_W.position.set(8.15, 0.12, junctionZ - 15.5); parent.add(curbNE_W);
    const curbSW_E = new THREE.Mesh(curbGeoNS, curbMat); curbSW_E.position.set(-8.15, 0.12, junctionZ + 15.5); parent.add(curbSW_E);
    const curbSE_W = new THREE.Mesh(curbGeoNS, curbMat); curbSE_W.position.set(8.15, 0.12, junctionZ + 15.5); parent.add(curbSE_W);

    // 4. Central Roundabout Traffic Island & VAYNAR MOR Landmark
    this.createVaynarMorLandmark(parent, 0, junctionZ);

    // 5. Commercial Buildings & Roadside Shops around Vaynar Mor
    // NW: Bus Ticket Counter & Passenger Shed ("ভায়না মোড় পরিবহন কাউন্টার")
    this.createBangladeshiBuilding(parent, {
      x: -24, z: junctionZ - 18, w: 14, d: 13, floors: 2, color: '#c2cbd2',
      shopName: 'ভায়না মোড় পরিবহন কাউন্টার', shopSub: 'ঢাকা, চট্টগ্রাম, খুলনা ও বরিশাল সরাসরি', phone: '০১৭১১-২২৩৩৪৪', theme: 'green', shutterOpen: true
    });

    // NE: Commercial Market ("গ্রীন প্লাজা শপিং সেন্টার")
    this.createBangladeshiBuilding(parent, {
      x: 24, z: junctionZ - 18, w: 14, d: 13, floors: 3, color: '#d8cfc4',
      shopName: 'গ্রীন প্লাজা শপিং কমপ্লেক্স', shopSub: 'বস্ত্রালয়, জুয়েলার্স ও কসমেটিক্স', phone: '০১৭২২-৯৯৮৮৭৭', theme: 'orange', shutterOpen: true
    });

    // SW: Pharmacy & Diagnostics ("জনসেবা ফার্মেসী ও ডায়াগনস্টিক")
    this.createBangladeshiBuilding(parent, {
      x: -24, z: junctionZ + 18, w: 14, d: 13, floors: 2, color: '#b9c7b8',
      shopName: 'জনসেবা ফার্মেসী ও ডায়াগনস্টিক', shopSub: '২৪ ঘণ্টা জরুরী ঔষধ ও প্যাথলজি', phone: '০১৮১৮-৫৫৬৬৭৭', theme: 'blue', shutterOpen: true
    });

    // SE: Restaurant & Sweets ("হোটেল আল-মদিনা ও মিষ্টি মেলা")
    this.createBangladeshiBuilding(parent, {
      x: 24, z: junctionZ + 18, w: 14, d: 13, floors: 2, color: '#cbbaa7',
      shopName: 'হোটেল আল-মদিনা ও মিষ্টি মেলা', shopSub: 'স্পেশাল বিরিয়ানি, মিষ্টি ও দই', phone: '০১৯১১-৪৪৫৫৬৬', theme: 'red', shutterOpen: true
    });

    // Further West: Roadside Auto Parts
    this.createBangladeshiBuilding(parent, {
      x: -44, z: junctionZ - 18, w: 13, d: 13, floors: 2, color: '#bcc3cb',
      shopName: 'মাগুরা অটো পার্টস ও গ্যারেজ', shopSub: 'ট্রাক, বাস ও মাইক্রোবাস পার্টস', phone: '০১৬৭৭-১১২২৩৩', theme: 'blue', shutterOpen: false
    });

    // Further East: Electronics & Mobile Center
    this.createBangladeshiBuilding(parent, {
      x: 44, z: junctionZ - 18, w: 13, d: 13, floors: 2, color: '#d4ccbf',
      shopName: 'মাগুরা টেলিকম ও ইলেকট্রনিক্স', shopSub: 'মোবাইল বিক্রয় ও সার্ভিসিং সেন্টার', phone: '০১৭৮৮-৩৩৪৪৫৫', theme: 'bkash', shutterOpen: true
    });

    // 6. Utility Poles & Tangled Cables around Junction
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x8a8882 });
    const crossMat = new THREE.MeshLambertMaterial({ color: 0x3d3d3d });
    const cableMat = new THREE.LineBasicMaterial({ color: 0x111111 });

    const vPoles = [
      { x: -9.5, z: junctionZ - 12 },
      { x: 9.5, z: junctionZ - 12 },
      { x: -9.5, z: junctionZ + 12 },
      { x: 9.5, z: junctionZ + 12 }
    ];

    const poleGeo = new THREE.CylinderGeometry(0.2, 0.26, 9.5, 8);
    const crossGeo = new THREE.BoxGeometry(2.4, 0.12, 0.12);

    vPoles.forEach(p => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(p.x, 4.75, p.z);
      parent.add(pole);

      const cross = new THREE.Mesh(crossGeo, crossMat);
      cross.position.set(p.x, 8.6, p.z);
      parent.add(cross);

      // Streetlight fixture on pole
      const lampArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.2), crossMat);
      lampArm.position.set(p.x, 8.8, p.z + (p.z < junctionZ ? 0.6 : -0.6));
      parent.add(lampArm);

      const lampHead = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.5), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      lampHead.position.set(p.x, 8.7, p.z + (p.z < junctionZ ? 1.1 : -1.1));
      parent.add(lampHead);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(p.x - 0.4, 0, p.z - 0.4),
        new THREE.Vector3(p.x + 0.4, 9.5, p.z + 0.4)
      ));
    });

    // Tangled cables across the junction poles
    const cablePairs = [
      [vPoles[0], vPoles[1]],
      [vPoles[2], vPoles[3]],
      [vPoles[0], vPoles[2]],
      [vPoles[1], vPoles[3]]
    ];

    cablePairs.forEach(([p1, p2]) => {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(p1.x, 8.5, p1.z),
        new THREE.Vector3((p1.x + p2.x) / 2, 7.3, (p1.z + p2.z) / 2),
        new THREE.Vector3(p2.x, 8.5, p2.z)
      );
      const points = curve.getPoints(8);
      const cableLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), cableMat);
      parent.add(cableLine);
    });

    // 7. Scattered Vehicles around Vaynar Mor for combat cover
    // Parked Green CNG Auto-Rickshaw waiting by SE corner
    this.createCNGAutoRickshaw(parent, 10.2, 0.02, junctionZ + 14, Math.PI * 0.1);

    // Parked Flatbed Cargo Rickshaw Van by SW corner
    this.createRickshawVan(parent, -10.5, 0.22, junctionZ + 13.5, -Math.PI * 0.2);

    // Parked Motorbike outside Pharmacy
    this.createMotorbike(parent, -17.5, 0.22, junctionZ + 11.5, Math.PI * 0.4);

    // Small Passenger Hauler / Tempo (লেগুনা) parked near Bus Counter
    this.createPassengerTempo(parent, -10.2, 0.02, junctionZ - 13.5, Math.PI * 0.95);
  },

  // Central Roundabout Traffic Island & VAYNAR MOR Landmark Monument
  createVaynarMorLandmark: function(parent, x, z) {
    const landmarkGroup = new THREE.Group();
    landmarkGroup.position.set(x, 0, z);

    // 1. Raised Circular Concrete Curb Island (Radius 4.6m)
    const islandCurbMat = new THREE.MeshLambertMaterial({ color: 0x9e9a91 });
    const islandCurb = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.8, 0.35, 18), islandCurbMat);
    islandCurb.position.y = 0.175;
    islandCurb.receiveShadow = true;
    landmarkGroup.add(islandCurb);

    // Striped Warning Rim on Curb
    const rimMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const yellowRimMat = new THREE.MeshLambertMaterial({ color: 0xf5b700 });
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const rim = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.36, 0.25),
        i % 2 === 0 ? yellowRimMat : rimMat
      );
      rim.position.set(Math.cos(angle) * 4.65, 0.18, Math.sin(angle) * 4.65);
      rim.rotation.y = -angle;
      landmarkGroup.add(rim);
    }

    // 2. Inner Landscaped Grass Turf
    const turfMat = new THREE.MeshLambertMaterial({ color: 0x3d6e35 });
    const turf = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, 0.05, 18), turfMat);
    turf.position.y = 0.36;
    landmarkGroup.add(turf);

    // 3. Central Tiered Monument Pedestal
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0xded9cf });
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.45, 4.0), stoneMat);
    step1.position.y = 0.6;
    step1.castShadow = true;
    landmarkGroup.add(step1);

    const step2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.45, 3.2), stoneMat);
    step2.position.y = 1.05;
    step2.castShadow = true;
    landmarkGroup.add(step2);

    // 4. Monument Tower Column (Architectural Pylon)
    const towerMat = new THREE.MeshLambertMaterial({ color: 0x1f364d });
    const tower = new THREE.Mesh(new THREE.BoxGeometry(2.0, 4.2, 2.0), towerMat);
    tower.position.y = 3.35;
    tower.castShadow = true;
    landmarkGroup.add(tower);

    // Top Decorative Finial Crown
    const finialMat = new THREE.MeshLambertMaterial({ color: 0xd4af37 });
    const finial = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.4, 4), finialMat);
    finial.position.y = 6.15;
    finial.rotation.y = Math.PI / 4;
    landmarkGroup.add(finial);

    // 5. "VAYNAR MOR" Official Landmark Signboards on 4 Faces
    const signTex = this.createVaynarMorSignTexture();
    const signMat = new THREE.MeshLambertMaterial({ map: signTex });
    const signGeo = new THREE.PlaneGeometry(1.85, 1.85);

    // North face (facing incoming highway from North)
    const signN = new THREE.Mesh(signGeo, signMat);
    signN.position.set(0, 3.4, -1.02);
    signN.rotation.y = Math.PI;
    landmarkGroup.add(signN);

    // South face (facing incoming highway from Magura Town)
    const signS = new THREE.Mesh(signGeo, signMat);
    signS.position.set(0, 3.4, 1.02);
    landmarkGroup.add(signS);

    // West face (facing Jhenaidah Road)
    const signW = new THREE.Mesh(signGeo, signMat);
    signW.position.set(-1.02, 3.4, 0);
    signW.rotation.y = -Math.PI / 2;
    landmarkGroup.add(signW);

    // East face (facing Faridpur Road)
    const signE = new THREE.Mesh(signGeo, signMat);
    signE.position.set(1.02, 3.4, 0);
    signE.rotation.y = Math.PI / 2;
    landmarkGroup.add(signE);

    // Corner brass lamp posts on pedestal
    const lampMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfff4d0 });
    const lampOffsets = [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]];

    lampOffsets.forEach(([lx, lz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 6), lampMat);
      post.position.set(lx, 1.95, lz);
      landmarkGroup.add(post);

      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), glowMat);
      globe.position.set(lx, 2.7, lz);
      landmarkGroup.add(globe);
    });

    parent.add(landmarkGroup);

    // Collider for the central roundabout structure (leaves ring road open)
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 2.4, 0, z - 2.4),
      new THREE.Vector3(x + 2.4, 7.0, z + 2.4)
    ));
  },

  // Generates high-contrast canvas texture for VAYNAR MOR landmark
  createVaynarMorSignTexture: function() {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');

    // Deep Bangladeshi Emerald Navy Background
    ctx.fillStyle = '#062f21';
    ctx.fillRect(0, 0, 384, 384);

    // Golden double ornamental border
    ctx.strokeStyle = '#f5b700';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 368, 368);
    ctx.lineWidth = 3;
    ctx.strokeRect(18, 18, 348, 348);

    // Top Header Banner
    ctx.fillStyle = '#b31217';
    ctx.fillRect(24, 28, 336, 42);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('মাগুরা পৌরসভা • MAGURA', 192, 56);

    // Center Landmark Icon / Star
    ctx.fillStyle = '#f5b700';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('★ ❖ ★', 192, 108);

    // Main Bengali Landmark Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('ভায়না মোড়', 192, 168);

    // Gold Divider Bar
    ctx.fillStyle = '#f5b700';
    ctx.fillRect(40, 190, 304, 5);

    // English Landmark Title
    ctx.fillStyle = '#ffde59';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('VAYNAR MOR', 192, 238);

    // Subtitle / Highway Junction Info
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('N7 HIGHWAY JUNCTION', 192, 280);

    // Directions
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('ঢাকা ➔   ঝিনাইদহ ➔   ফরিদপুর ➔', 192, 330);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // =========================================================
  // 10. MAGURA POLICE LINES (মাগুরা পুলিশ লাইনস) COMPOUND
  // =========================================================
  createPoliceLines: function(parent) {
    const compGroup = new THREE.Group();
    compGroup.position.set(0, 0, 0);

    // Bounds of Police Lines Compound:
    // X from 22 to 53, Z from -9 to 24 (Width 31m, Depth 33m)
    // 4 Distinct Entry Points:
    // 1. West Main Gate at X = 22, Z = 8 (Connecting to Highway Access Road)
    // 2. South Gate at Z = 24, X = 36 (Connecting to Stadium Road)
    // 3. North Tactical Gate at Z = -9, X = 40 (Connecting to East Suburb Alley / College Road)
    // 4. East Flanking Sally Port at X = 53, Z = 14 (Tactical flanking route behind HQ)

    const roadTex = TextureFactory.createRoadTexture();
    const brickTex = TextureFactory.createBrickPavementTexture();
    brickTex.repeat.set(4, 2);
    const swTex = TextureFactory.createSidewalkTexture();
    const curbTex = TextureFactory.createCurbTexture();
    curbTex.repeat.set(10, 1);

    const roadMat = new THREE.MeshLambertMaterial({ map: roadTex });
    const brickMat = new THREE.MeshLambertMaterial({ map: brickTex });
    const swMat = new THREE.MeshLambertMaterial({ map: swTex });
    const curbMat = new THREE.MeshLambertMaterial({ map: curbTex });

    // ---------------------------------------------------------
    // 1. DEDICATED APPROACH ROADS & CONNECTORS
    // ---------------------------------------------------------

    // A. Main Access Road from Highway (X: 8 to 22 at Z = 8, Width 8.0m)
    const accessRoad = new THREE.Mesh(new THREE.PlaneGeometry(15, 8.0), roadMat);
    accessRoad.rotation.x = -Math.PI / 2;
    accessRoad.position.set(14.5, 0.022, 8);
    accessRoad.receiveShadow = true;
    parent.add(accessRoad);

    // North & South sidewalks along access road
    const swN = new THREE.Mesh(new THREE.BoxGeometry(14, 0.2, 1.8), swMat);
    swN.position.set(15, 0.1, 3.1);
    parent.add(swN);

    const swS = new THREE.Mesh(new THREE.BoxGeometry(14, 0.2, 1.8), swMat);
    swS.position.set(15, 0.1, 12.9);
    parent.add(swS);

    // Curbstones along access road
    const aCurbN = new THREE.Mesh(new THREE.BoxGeometry(14, 0.24, 0.25), curbMat);
    aCurbN.position.set(15, 0.12, 4.1);
    parent.add(aCurbN);

    const aCurbS = new THREE.Mesh(new THREE.BoxGeometry(14, 0.24, 0.25), curbMat);
    aCurbS.position.set(15, 0.12, 11.9);
    parent.add(aCurbS);

    // B. Southern Connector Road to Stadium Road (Z: 23.5 to 26.5 at X = 36, Width 8.0m)
    const southConnector = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 5.0), roadMat);
    southConnector.rotation.x = -Math.PI / 2;
    southConnector.position.set(36, 0.022, 25.5);
    parent.add(southConnector);

    // C. Northern Connector Road to East Suburb Alley (Z: -14 to -8.5 at X = 40, Width 6.0m)
    const northConnector = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 6.0), brickMat);
    northConnector.rotation.x = -Math.PI / 2;
    northConnector.position.set(40, 0.022, -11.5);
    parent.add(northConnector);

    // D. East Sally Port Paved Threshold (X: 52 to 55 at Z = 14, Width 4.5m)
    const eastConnector = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 4.5), brickMat);
    eastConnector.rotation.x = -Math.PI / 2;
    eastConnector.position.set(53.5, 0.022, 14);
    parent.add(eastConnector);

    // ---------------------------------------------------------
    // 2. COURTYARD, DRILL GROUND & VEHICLE PARKING
    // ---------------------------------------------------------

    // A. Drill Ground compacted soil & gravel
    const courtTex = TextureFactory.createCourtyardSoilTexture();
    courtTex.repeat.set(5, 5);
    const courtMat = new THREE.MeshLambertMaterial({ map: courtTex });
    const courtyard = new THREE.Mesh(new THREE.PlaneGeometry(31, 33), courtMat);
    courtyard.rotation.x = -Math.PI / 2;
    courtyard.position.set(37.5, 0.02, 7.5);
    courtyard.receiveShadow = true;
    parent.add(courtyard);

    // B. Vehicle Parking Pad (Asphalt pad with painted stall markings)
    const parkPad = new THREE.Mesh(new THREE.PlaneGeometry(13, 11), roadMat);
    parkPad.rotation.x = -Math.PI / 2;
    parkPad.position.set(31.5, 0.023, 16.5);
    parkPad.receiveShadow = true;
    parent.add(parkPad);

    // White parking stall demarcation lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pStall1 = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 5.5), lineMat);
    pStall1.rotation.x = -Math.PI / 2;
    pStall1.position.set(26.2, 0.025, 16.5);
    parent.add(pStall1);

    const pStall2 = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 5.5), lineMat);
    pStall2.rotation.x = -Math.PI / 2;
    pStall2.position.set(30.0, 0.025, 16.5);
    parent.add(pStall2);

    const pStall3 = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 5.5), lineMat);
    pStall3.rotation.x = -Math.PI / 2;
    pStall3.position.set(33.8, 0.025, 16.5);
    parent.add(pStall3);

    const pStall4 = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 5.5), lineMat);
    pStall4.rotation.x = -Math.PI / 2;
    pStall4.position.set(37.6, 0.025, 16.5);
    parent.add(pStall4);

    // C. Motor Transport (MT) Carport Shed
    this.createMotorTransportShed(parent, 25.5, 19.5);

    // ---------------------------------------------------------
    // 3. CONCRETE WALKWAYS CONNECTING BUILDINGS & ENTRANCES
    // ---------------------------------------------------------
    // Walkway height: 0.12m with neat curb finish (walkable without snagging)
    const walkMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createSidewalkTexture()
    });
    walkMat.map.repeat.set(2, 6);

    // Walkway 1: Main Gate (X = 22) to HQ Portico (X = 37) at Z = 8 (Length 15m, Width 2.4m)
    const wGateToHQ = new THREE.Mesh(new THREE.BoxGeometry(15, 0.12, 2.4), walkMat);
    wGateToHQ.position.set(29.5, 0.06, 8.0);
    wGateToHQ.receiveShadow = true;
    parent.add(wGateToHQ);

    // Walkway 2: North-South Central Spine (along X = 37 from Z = -2 to Z = 22, Length 24m, Width 2.2m)
    const wCentralSpine = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 24), walkMat);
    wCentralSpine.position.set(37.0, 0.06, 10.0);
    wCentralSpine.receiveShadow = true;
    parent.add(wCentralSpine);

    // Walkway 3: Northern Walkway connecting Barracks and Officers' Mess (Z = -1.5, X: 26 to 50, Width 2.0m)
    const wNorthPath = new THREE.Mesh(new THREE.BoxGeometry(24, 0.12, 2.0), walkMat);
    wNorthPath.position.set(38.0, 0.06, -1.5);
    wNorthPath.receiveShadow = true;
    parent.add(wNorthPath);

    // Walkway 4: South Gate approach walkway (connecting South Gate X = 36, Z = 24 into compound)
    const wSouthPath = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 6.0), walkMat);
    wSouthPath.position.set(36.0, 0.06, 21.0);
    wSouthPath.receiveShadow = true;
    parent.add(wSouthPath);

    // Walkway 5: Path leading to East Sally Port (Z = 14, X: 47 to 53, Width 2.0m)
    const wEastPath = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.12, 2.0), walkMat);
    wEastPath.position.set(50.0, 0.06, 14.0);
    wEastPath.receiveShadow = true;
    parent.add(wEastPath);

    // ---------------------------------------------------------
    // 4. PERIMETER SECURITY BOUNDARY WALL WITH 4 ENTRY POINTS
    // ---------------------------------------------------------
    // Bangladesh Police Wall Specification:
    // Plastered white masonry body with deep navy blue base and red coping
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xededed });
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x16447e }); // Police Navy Blue
    const capMat = new THREE.MeshLambertMaterial({ color: 0xb91c1c });  // Crimson Red coping

    const createWallSegment = (x, z, w, d) => {
      const segGroup = new THREE.Group();
      segGroup.position.set(x, 0, z);

      // Main wall body
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, 2.4, d), wallMat);
      body.position.y = 1.2;
      body.castShadow = true;
      body.receiveShadow = true;
      segGroup.add(body);

      // Navy base skirting
      const base = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.45, d + 0.04), baseMat);
      base.position.y = 0.225;
      segGroup.add(base);

      // Red coping along top
      const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.15, d + 0.08), capMat);
      cap.position.y = 2.45;
      segGroup.add(cap);

      parent.add(segGroup);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(x - w / 2 - 0.2, 0, z - d / 2 - 0.2),
        new THREE.Vector3(x + w / 2 + 0.2, 3.2, z + d / 2 + 0.2)
      ));
    };

    // Low Gatepost Helper (Decorative pillars flanking entry gaps)
    const createGatepost = (px, pz) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.6, 0.8), baseMat);
      post.position.set(px, 1.3, pz);
      post.castShadow = true;
      parent.add(post);

      const pCap = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.45, 4), capMat);
      pCap.position.set(px, 2.8, pz);
      pCap.rotation.y = Math.PI / 4;
      parent.add(pCap);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(px - 0.45, 0, pz - 0.45),
        new THREE.Vector3(px + 0.45, 3.0, pz + 0.45)
      ));
    };

    // A. WEST WALL (at X = 22, Z from -9 to 24, with 9m Main Entrance Gate at Z = 3.5 to 12.5)
    createWallSegment(22, -2.75, 0.4, 12.5); // North West wall (Z: -9 to 3.5)
    createWallSegment(22, 18.25, 0.4, 11.5); // South West wall (Z: 12.5 to 24)

    // B. SOUTH WALL (at Z = 24, X from 22 to 53, with 8m South Gate at X = 32 to 40)
    createWallSegment(27.0, 24, 10.0, 0.4); // West South wall (X: 22 to 32)
    createWallSegment(46.5, 24, 13.0, 0.4); // East South wall (X: 40 to 53)
    createGatepost(32.0, 24);
    createGatepost(40.0, 24);

    // C. NORTH WALL (at Z = -9, X from 22 to 53, with 6m North Tactical Gate at X = 37 to 43)
    createWallSegment(29.5, -9, 15.0, 0.4); // West North wall (X: 22 to 37)
    createWallSegment(48.0, -9, 10.0, 0.4); // East North wall (X: 43 to 53)
    createGatepost(37.0, -9);
    createGatepost(43.0, -9);

    // D. EAST WALL (at X = 53, Z from -9 to 24, with 5m East Flanking Sally Port at Z = 11.5 to 16.5)
    createWallSegment(53, 1.25, 0.4, 20.5);  // North East wall (Z: -9 to 11.5)
    createWallSegment(53, 20.25, 0.4, 7.5);  // South East wall (Z: 16.5 to 24)
    createGatepost(53, 11.5);
    createGatepost(53, 16.5);

    // ---------------------------------------------------------
    // 5. PROPER MAIN ENTRANCE GATE & SENTRY GUARD POST
    // ---------------------------------------------------------
    this.createPoliceLinesGate(parent, 22, 8);

    // ---------------------------------------------------------
    // 6. MAIN POLICE ADMINISTRATIVE HEADQUARTERS BUILDING
    // ---------------------------------------------------------
    // Sited at East end: X = 44, Z = 7.5 (Width 14m, Depth 9.5m, Height 7.6m, 2 stories)
    this.createPoliceHQBuilding(parent, 44, 7.5);

    // ---------------------------------------------------------
    // 7. 3 SMALLER BARRACK / OFFICE BUILDINGS
    // ---------------------------------------------------------

    // A. Police Barracks & Training Dormitory (Building 01)
    // Sited at North: X = 30.5, Z = -5.0 (Width 11m, Depth 6m, 2 stories with covered verandah)
    this.createPoliceBarracks(parent, 30.5, -5.0);

    // B. Officers' Mess & Investigation Bureau (DB Branch)
    // Sited at North-East: X = 47.5, Z = -5.0 (Width 9.5m, Depth 6m, 2 stories)
    this.createOfficersMessBuilding(parent, 47.5, -5.0);

    // C. Armory & Quarter Guard Secure Structure
    // Sited at South-East: X = 46.5, Z = 19.5 (Width 8.5m, Depth 6m, Height 4.2m)
    this.createPoliceArmory(parent, 46.5, 19.5);

    // ---------------------------------------------------------
    // 8. COURTYARD CEREMONIAL FLAGPOLE & MONUMENT
    // ---------------------------------------------------------
    this.createCourtyardFlagpole(parent, 32.5, 5.5);

    // ---------------------------------------------------------
    // 9. PARKED POLICE VEHICLES
    // ---------------------------------------------------------
    // Bangladesh Police Patrol Pickup (ডাবল কেবিন পিকআপ) in parking stall
    this.createPolicePickup(parent, 28.5, 0.02, 14.5, -Math.PI * 0.45);

    // Bangladesh Police Mobile Tactical Van / Jeep in parking stall
    this.createPoliceVan(parent, 34.0, 0.02, 16.5, Math.PI * 0.1);

    // Bangladesh Police Escort Motorcycle outside HQ entrance
    this.createMotorbike(parent, 38.0, 0.12, 4.5, Math.PI * 0.5);

    // ---------------------------------------------------------
    // 10. TACTICAL ENVIRONMENTAL COVER & AMMO CRATES
    // ---------------------------------------------------------
    // Guard Post Sandbag Emplacement (covering driveway entrance)
    this.createSandbagEmplacement(parent, 25.0, 4.5, 0);

    // Armory Quarter Guard Sandbag Emplacement
    this.createSandbagEmplacement(parent, 41.5, 17.5, Math.PI / 2);

    // Stacked Wooden Supply & Ammo Crates
    this.createSupplyCrates(parent, 27.5, -1.5);
    this.createSupplyCrates(parent, 42.0, -1.5);

    // Fire Station Rack (Red Sand & Water Buckets)
    this.createPoliceFireStationRack(parent, 40.5, 2.5);

    // ---------------------------------------------------------
    // 11. VEGETATION & LUSH SHADE TREES
    // ---------------------------------------------------------
    // Stately neem/banyan shade trees inside compound
    this.createShadeTree(parent, 24.5, -4.5);
    this.createShadeTree(parent, 51.0, 1.0);
    this.createShadeTree(parent, 51.0, 12.0);

    // Coconut palms along southern boundary
    this.createCoconutPalm(parent, 25.0, 22.5);
    this.createCoconutPalm(parent, 42.5, 22.5);

    // ---------------------------------------------------------
    // 12. UTILITY POLES & COMPOUND FLOODLIGHTING
    // ---------------------------------------------------------
    const floodlightMat = new THREE.MeshLambertMaterial({ color: 0x3d3d3d });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
    const wireMat = new THREE.LineBasicMaterial({ color: 0x111111 });

    const pPoles = [
      { x: 23.5, z: -7.5 },
      { x: 51.5, z: -7.5 },
      { x: 51.5, z: 22.5 },
      { x: 23.5, z: 22.5 }
    ];

    const poleGeo = new THREE.CylinderGeometry(0.14, 0.18, 8.0, 8);

    pPoles.forEach(fc => {
      const pole = new THREE.Mesh(poleGeo, floodlightMat);
      pole.position.set(fc.x, 4.0, fc.z);
      pole.castShadow = true;
      parent.add(pole);

      // Sodium floodlight head
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.35), floodlightMat);
      lamp.position.set(fc.x, 7.8, fc.z);
      lamp.lookAt(37.5, 0, 7.5);
      parent.add(lamp);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), bulbMat);
      bulb.position.set(fc.x, 7.75, fc.z);
      parent.add(bulb);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(fc.x - 0.35, 0, fc.z - 0.35),
        new THREE.Vector3(fc.x + 0.35, 8.5, fc.z + 0.35)
      ));
    });

    // Tangled compound power lines crossing between poles
    for (let i = 0; i < pPoles.length; i++) {
      const p1 = pPoles[i];
      const p2 = pPoles[(i + 1) % pPoles.length];
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(p1.x, 7.6, p1.z),
        new THREE.Vector3((p1.x + p2.x) / 2, 6.4, (p1.z + p2.z) / 2),
        new THREE.Vector3(p2.x, 7.6, p2.z)
      );
      const points = curve.getPoints(8);
      const wire = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), wireMat);
      parent.add(wire);
    }
  },

  // Covered Motor Transport (MT) Carport Shed for Police Vehicles
  createMotorTransportShed: function(parent, x, z) {
    const sGroup = new THREE.Group();
    sGroup.position.set(x, 0, z);

    const sWidth = 6.2;
    const sDepth = 5.0;
    const sHeight = 3.6;

    const steelMat = new THREE.MeshLambertMaterial({ color: 0x273746 });
    const tinMat = new THREE.MeshLambertMaterial({ map: TextureFactory.createTinRoofTexture() });

    // 4 Corner Steel Tubular Posts
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, sHeight, 6);
    for (let px of [-sWidth / 2 + 0.3, sWidth / 2 - 0.3]) {
      for (let pz of [-sDepth / 2 + 0.3, sDepth / 2 - 0.3]) {
        const post = new THREE.Mesh(postGeo, steelMat);
        post.position.set(px, sHeight / 2, pz);
        post.castShadow = true;
        sGroup.add(post);

        this.colliders.push(new THREE.Box3(
          new THREE.Vector3(x + px - 0.25, 0, z + pz - 0.25),
          new THREE.Vector3(x + px + 0.25, sHeight, z + pz + 0.25)
        ));
      }
    }

    // Overhead Steel Trusses
    const tBeam1 = new THREE.Mesh(new THREE.BoxGeometry(sWidth, 0.15, 0.15), steelMat);
    tBeam1.position.set(0, sHeight, -sDepth / 2 + 0.3);
    sGroup.add(tBeam1);

    const tBeam2 = new THREE.Mesh(new THREE.BoxGeometry(sWidth, 0.15, 0.15), steelMat);
    tBeam2.position.set(0, sHeight, sDepth / 2 - 0.3);
    sGroup.add(tBeam2);

    // Slanted Corrugated Tin Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(sWidth + 0.6, 0.06, sDepth + 0.6), tinMat);
    roof.position.set(0, sHeight + 0.2, 0);
    roof.rotation.z = -0.06;
    roof.castShadow = true;
    sGroup.add(roof);

    // Signboard: "POLICE MOTOR TRANSPORT"
    const signTex = this.createPoliceSignTexture('MT POOL & GARAGE', 'পুলিশ যানবাহন শাখা • POLICE MT');
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.6),
      new THREE.MeshLambertMaterial({ map: signTex })
    );
    sign.position.set(0, sHeight - 0.2, -sDepth / 2 + 0.2);
    sGroup.add(sign);

    parent.add(sGroup);
  },

  // Proper Main Police Lines Entrance Gate with Archway and Sentry Guard Post
  createPoliceLinesGate: function(parent, x, z) {
    const gateGroup = new THREE.Group();
    gateGroup.position.set(x, 0, z);

    const pillarMat = new THREE.MeshLambertMaterial({ color: 0x16447e }); // Navy
    const archMat = new THREE.MeshLambertMaterial({ color: 0xededed });   // White concrete
    const redMat = new THREE.MeshLambertMaterial({ color: 0xb91c1c });    // Red
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xf5b700 });

    const gateSpan = 8.5;

    // Gate Pillars on left and right (span 8.5m unobstructed opening)
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.6, 1.2), pillarMat);
    p1.position.set(0, 2.3, -gateSpan / 2);
    p1.castShadow = true;
    gateGroup.add(p1);

    const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.6, 1.2), pillarMat);
    p2.position.set(0, 2.3, gateSpan / 2);
    p2.castShadow = true;
    gateGroup.add(p2);

    // Pillar Caps with Golden Crest
    const capGeo = new THREE.BoxGeometry(1.4, 0.35, 1.4);
    const cap1 = new THREE.Mesh(capGeo, redMat); cap1.position.set(0, 4.75, -gateSpan / 2); gateGroup.add(cap1);
    const cap2 = new THREE.Mesh(capGeo, redMat); cap2.position.set(0, 4.75, gateSpan / 2); gateGroup.add(cap2);

    const crest1 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), goldMat);
    crest1.position.set(0, 5.15, -gateSpan / 2); gateGroup.add(crest1);
    const crest2 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), goldMat);
    crest2.position.set(0, 5.15, gateSpan / 2); gateGroup.add(crest2);

    // Overhead Arch Beam (Height 4.8m to 6.0m - player and vehicles move freely!)
    const archBeam = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, gateSpan + 1.2), archMat);
    archBeam.position.set(0, 5.3, 0);
    archBeam.castShadow = true;
    gateGroup.add(archBeam);

    // Arch Pediment Top Crest
    const pediment = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.45, 6.8), redMat);
    pediment.position.set(0, 6.1, 0);
    gateGroup.add(pediment);

    // Official Gate Signboard on Both Front and Back: "POLICE LINES"
    const gateSignTex = this.createPoliceSignTexture('MAGURA POLICE LINES', 'মাগুরা পুলিশ লাইনস • প্রধান ফটক');
    const gateSignMat = new THREE.MeshLambertMaterial({ map: gateSignTex });
    const signGeo = new THREE.PlaneGeometry(6.6, 1.05);

    // West face (facing highway road)
    const signW = new THREE.Mesh(signGeo, gateSignMat);
    signW.position.set(-0.48, 5.3, 0);
    signW.rotation.y = -Math.PI / 2;
    gateGroup.add(signW);

    // East face (facing compound interior)
    const signE = new THREE.Mesh(signGeo, gateSignMat);
    signE.position.set(0.48, 5.3, 0);
    signE.rotation.y = Math.PI / 2;
    gateGroup.add(signE);

    // ---------------------------------------------------------
    // Sentry Guard Post (Booth) placed beside South Pillar
    // ---------------------------------------------------------
    const sentryMat = new THREE.MeshLambertMaterial({ color: 0x16447e });
    const sentry = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.2, 2.4), sentryMat);
    sentry.position.set(2.0, 1.6, 5.8);
    sentry.castShadow = true;
    gateGroup.add(sentry);

    // White upper half trim
    const sTrim = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.9, 2.42), archMat);
    sTrim.position.set(2.0, 2.4, 5.8);
    gateGroup.add(sTrim);

    // Sentry Glass Surveillance Windows
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
    // Front window facing driveway
    const sWin1 = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), glassMat);
    sWin1.position.set(0.68, 1.8, 5.8);
    sWin1.rotation.y = -Math.PI / 2;
    gateGroup.add(sWin1);

    // Side window facing road
    const sWin2 = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), glassMat);
    sWin2.position.set(2.0, 1.8, 4.58);
    sWin2.rotation.y = Math.PI;
    gateGroup.add(sWin2);

    // Sentry Tin Overhang Roof
    const sRoof = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.12, 2.8),
      new THREE.MeshLambertMaterial({ map: TextureFactory.createTinRoofTexture() })
    );
    sRoof.position.set(2.0, 3.3, 5.8);
    gateGroup.add(sRoof);

    // Sentry Duty Desk & Small Radio
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.8, 1.2),
      new THREE.MeshLambertMaterial({ color: 0x5a4a3a })
    );
    desk.position.set(1.6, 0.4, 5.8);
    gateGroup.add(desk);

    // Red-and-White Sentry Boom Barrier Arm (Raised up at 65° angle so players and vehicles pass freely!)
    const barrierMat = new THREE.MeshLambertMaterial({ color: 0xb91c1c });
    const barrier = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.8, 0.12), barrierMat);
    barrier.position.set(0.8, 3.1, 4.2);
    barrier.rotation.x = -1.1; // raised upward
    gateGroup.add(barrier);

    // Yellow & Black striped safety bollards along roadside
    const bollardMat = new THREE.MeshLambertMaterial({ color: 0xf5b700 });
    for (let bz of [4.0, 4.8]) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.85, 8), bollardMat);
      b.position.set(0.8, 0.425, bz);
      gateGroup.add(b);
    }

    parent.add(gateGroup);

    // Colliders for gate pillars and sentry booth (passage between pillars is totally clear!)
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.8, 0, z - gateSpan / 2 - 0.7),
      new THREE.Vector3(x + 0.8, 5.5, z - gateSpan / 2 + 0.7)
    ));
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.8, 0, z + gateSpan / 2 - 0.7),
      new THREE.Vector3(x + 3.5, 5.5, z + gateSpan / 2 + 2.0)
    ));
  },

  // Main Police Headquarters Administrative Building
  createPoliceHQBuilding: function(parent, x, z) {
    const bGroup = new THREE.Group();
    bGroup.position.set(x, 0, z);

    const bWidth = 14;
    const bDepth = 9.5;
    const bHeight = 7.6;

    // Facade texture with neat rows of office windows
    const facadeTex = TextureFactory.createBuildingFacadeTexture('#f4f4f6', 4, 2);
    const wallMat = new THREE.MeshLambertMaterial({ map: facadeTex });

    const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(bWidth, bHeight, bDepth), wallMat);
    mainBlock.position.y = bHeight / 2;
    mainBlock.castShadow = true;
    mainBlock.receiveShadow = true;
    bGroup.add(mainBlock);

    // Navy Blue Base Skirting
    const navyMat = new THREE.MeshLambertMaterial({ color: 0x16447e });
    const baseSkirting = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.1, 0.6, bDepth + 0.1), navyMat);
    baseSkirting.position.y = 0.3;
    bGroup.add(baseSkirting);

    // Front Grand Entrance Portico (West facing toward courtyard, X - bWidth/2)
    // High clearance portico roof so players walk under it freely
    const porticoMat = new THREE.MeshLambertMaterial({ color: 0xededed });
    const porticoRoof = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.4, 5.6), porticoMat);
    porticoRoof.position.set(-bWidth / 2 - 1.75, 4.0, 0);
    porticoRoof.castShadow = true;
    bGroup.add(porticoRoof);

    // 4 square portico pillars with navy color
    const colGeo = new THREE.BoxGeometry(0.45, 4.0, 0.45);
    for (let cz of [-2.4, 2.4]) {
      const col = new THREE.Mesh(colGeo, navyMat);
      col.position.set(-bWidth / 2 - 3.2, 2.0, cz);
      col.castShadow = true;
      bGroup.add(col);
    }

    // Front Glass Double Entrance Door under portico
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x1f364d });
    const door = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.8), doorMat);
    door.position.set(-bWidth / 2 - 0.05, 1.4, 0);
    door.rotation.y = -Math.PI / 2;
    bGroup.add(door);

    // Official Building Sign above portico: "POLICE LINES HEADQUARTERS"
    const hqSignTex = this.createPoliceSignTexture('POLICE HEADQUARTERS', 'পুলিশ সুপার কার্যালয় • মাগুরা জেলা');
    const hqSign = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 0.95),
      new THREE.MeshLambertMaterial({ map: hqSignTex })
    );
    hqSign.position.set(-bWidth / 2 - 0.06, 4.8, 0);
    hqSign.rotation.y = -Math.PI / 2;
    bGroup.add(hqSign);

    // Rooftop Parapet
    const parapetMat = new THREE.MeshLambertMaterial({ color: 0x16447e });
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(bWidth, 0.7, bDepth), parapetMat);
    parapet.position.y = bHeight + 0.35;
    bGroup.add(parapet);

    // Rooftop Communication Mast & Bangladesh Flag
    const mastMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.0, 6), mastMat);
    flagPole.position.set(-bWidth / 4, bHeight + 2.5, 0);
    bGroup.add(flagPole);

    // Bangladesh Flag cloth
    const flagCanvas = document.createElement('canvas');
    flagCanvas.width = 128; flagCanvas.height = 80;
    const fCtx = flagCanvas.getContext('2d');
    fCtx.fillStyle = '#006a4e'; // Bottle green
    fCtx.fillRect(0, 0, 128, 80);
    fCtx.fillStyle = '#f42a41'; // Red circle
    fCtx.beginPath();
    fCtx.arc(55, 40, 26, 0, Math.PI * 2);
    fCtx.fill();
    const flagTex = new THREE.CanvasTexture(flagCanvas);

    const flagMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.0),
      new THREE.MeshLambertMaterial({ map: flagTex, side: THREE.DoubleSide })
    );
    flagMesh.position.set(-bWidth / 4 + 0.85, bHeight + 4.1, 0);
    bGroup.add(flagMesh);

    // Rooftop Satellite Dish
    const dishMat = new THREE.MeshLambertMaterial({ color: 0xdedede });
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8, 0, Math.PI), dishMat);
    dish.position.set(bWidth / 4, bHeight + 1.0, -bDepth / 4);
    dish.rotation.x = -Math.PI / 3;
    bGroup.add(dish);

    parent.add(bGroup);

    // Colliders for main building block and portico pillars
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - bWidth / 2 - 0.4, 0, z - bDepth / 2 - 0.4),
      new THREE.Vector3(x + bWidth / 2 + 0.4, bHeight + 2, z + bDepth / 2 + 0.4)
    ));
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - bWidth / 2 - 3.5, 0, z - 2.8),
      new THREE.Vector3(x - bWidth / 2 - 2.8, 4.5, z - 2.0)
    ));
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - bWidth / 2 - 3.5, 0, z + 2.0),
      new THREE.Vector3(x - bWidth / 2 - 2.8, 4.5, z + 2.8)
    ));
  },

  // Police Barracks & Training Dormitory (Building 01)
  createPoliceBarracks: function(parent, x, z) {
    const bGroup = new THREE.Group();
    bGroup.position.set(x, 0, z);

    const bWidth = 11;
    const bDepth = 6;
    const bHeight = 6.5;

    const facadeTex = TextureFactory.createBuildingFacadeTexture('#e3ded5', 3, 2);
    const wallMat = new THREE.MeshLambertMaterial({ map: facadeTex });

    const body = new THREE.Mesh(new THREE.BoxGeometry(bWidth, bHeight, bDepth), wallMat);
    body.position.y = bHeight / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    bGroup.add(body);

    // Covered Ground-Floor Verandah (South facing toward courtyard)
    const verandahMat = new THREE.MeshLambertMaterial({ color: 0x16447e });
    const colGeo = new THREE.BoxGeometry(0.3, 3.2, 0.3);
    for (let vx of [-4.5, 0, 4.5]) {
      const col = new THREE.Mesh(colGeo, verandahMat);
      col.position.set(vx, 1.6, bDepth / 2 + 1.0);
      col.castShadow = true;
      bGroup.add(col);
    }

    const vRoof = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.4, 0.2, 1.4), verandahMat);
    vRoof.position.set(0, 3.3, bDepth / 2 + 0.7);
    bGroup.add(vRoof);

    // Signboard: "POLICE BARRACKS"
    const signTex = this.createPoliceSignTexture('POLICE BARRACKS-01', 'ব্যারাক ও প্রশিক্ষণ ভবন-০১ • BARRACKS');
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(5.0, 0.75),
      new THREE.MeshLambertMaterial({ map: signTex })
    );
    sign.position.set(0, 3.8, bDepth / 2 + 0.05);
    bGroup.add(sign);

    // Corrugated Tin Roof over Barracks
    const tinMat = new THREE.MeshLambertMaterial({ map: TextureFactory.createTinRoofTexture() });
    const tinRoof = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.6, 0.35, bDepth + 1.0), tinMat);
    tinRoof.position.y = bHeight + 0.2;
    bGroup.add(tinRoof);

    parent.add(bGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - bWidth / 2 - 0.4, 0, z - bDepth / 2 - 0.4),
      new THREE.Vector3(x + bWidth / 2 + 0.4, bHeight + 1.5, z + bDepth / 2 + 1.3)
    ));
  },

  // Officers' Mess & Investigation Bureau (DB Branch) Building
  createOfficersMessBuilding: function(parent, x, z) {
    const bGroup = new THREE.Group();
    bGroup.position.set(x, 0, z);

    const bWidth = 9.5;
    const bDepth = 6.0;
    const bHeight = 6.5;

    const facadeTex = TextureFactory.createBuildingFacadeTexture('#d6dce2', 3, 2);
    const wallMat = new THREE.MeshLambertMaterial({ map: facadeTex });

    const body = new THREE.Mesh(new THREE.BoxGeometry(bWidth, bHeight, bDepth), wallMat);
    body.position.y = bHeight / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    bGroup.add(body);

    // Navy Blue Base Skirting
    const navyMat = new THREE.MeshLambertMaterial({ color: 0x16447e });
    const base = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.1, 0.5, bDepth + 0.1), navyMat);
    base.position.y = 0.25;
    bGroup.add(base);

    // Entrance Canopy over South-facing door
    const canopyMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.15, 1.4), canopyMat);
    canopy.position.set(0, 3.2, bDepth / 2 + 0.7);
    bGroup.add(canopy);

    // Signboard: "OFFICERS MESS & DB BRANCH"
    const signTex = this.createPoliceSignTexture('OFFICERS MESS & DB', 'অফিসার্স মেস ও ডিবি শাখা • INVESTIGATION');
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 0.75),
      new THREE.MeshLambertMaterial({ map: signTex })
    );
    sign.position.set(0, 3.7, bDepth / 2 + 0.05);
    bGroup.add(sign);

    // Flat roof with parapet
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.2, 0.5, bDepth + 0.2), navyMat);
    parapet.position.y = bHeight + 0.25;
    bGroup.add(parapet);

    parent.add(bGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - bWidth / 2 - 0.4, 0, z - bDepth / 2 - 0.4),
      new THREE.Vector3(x + bWidth / 2 + 0.4, bHeight + 1.5, z + bDepth / 2 + 0.9)
    ));
  },

  // Armory & Quarter Guard Secure Structure
  createPoliceArmory: function(parent, x, z) {
    const aGroup = new THREE.Group();
    aGroup.position.set(x, 0, z);

    const aWidth = 8.5;
    const aDepth = 6.0;
    const aHeight = 4.2;

    const wallMat = new THREE.MeshLambertMaterial({ color: 0x7c8ba1 }); // Fortified reinforced concrete
    const body = new THREE.Mesh(new THREE.BoxGeometry(aWidth, aHeight, aDepth), wallMat);
    body.position.y = aHeight / 2;
    body.castShadow = true;
    aGroup.add(body);

    // Steel reinforced double vault door (West facing)
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const door = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.6), doorMat);
    door.position.set(-aWidth / 2 - 0.02, 1.3, 0);
    door.rotation.y = -Math.PI / 2;
    aGroup.add(door);

    // Official Armory Sign
    const signTex = this.createPoliceSignTexture('ARMORY & STORES', 'অস্ত্রাগার ও মালখানা • POLICE ARMORY');
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.7),
      new THREE.MeshLambertMaterial({ map: signTex })
    );
    sign.position.set(-aWidth / 2 - 0.03, 3.2, 0);
    sign.rotation.y = -Math.PI / 2;
    aGroup.add(sign);

    // Rooftop Communications Mast
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.06, 3.8, 6),
      new THREE.MeshLambertMaterial({ color: 0xcccccc })
    );
    mast.position.set(0, aHeight + 1.9, 0);
    aGroup.add(mast);

    parent.add(aGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - aWidth / 2 - 0.4, 0, z - aDepth / 2 - 0.4),
      new THREE.Vector3(x + aWidth / 2 + 0.4, aHeight + 1, z + aDepth / 2 + 0.4)
    ));
  },

  // Ceremonial Flagpole in Courtyard Center
  createCourtyardFlagpole: function(parent, x, z) {
    const fpGroup = new THREE.Group();
    fpGroup.position.set(x, 0, z);

    // Stepped Circular Concrete Dais (3 tiers: Navy, White, Red)
    const d1 = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.4, 0.25, 12),
      new THREE.MeshLambertMaterial({ color: 0x16447e })
    );
    d1.position.y = 0.125;
    fpGroup.add(d1);

    const d2 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.7, 0.25, 12),
      new THREE.MeshLambertMaterial({ color: 0xded9cf })
    );
    d2.position.y = 0.375;
    fpGroup.add(d2);

    const d3 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.1, 0.2, 12),
      new THREE.MeshLambertMaterial({ color: 0xb91c1c })
    );
    d3.position.y = 0.6;
    fpGroup.add(d3);

    // Flagpole
    const poleMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 7.8, 8), poleMat);
    pole.position.y = 4.5;
    fpGroup.add(pole);

    // Gold Finial Ball
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xf5b700 });
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), goldMat);
    finial.position.y = 8.5;
    fpGroup.add(finial);

    // Bangladesh Police Flag (Navy blue field with police crest color)
    const pFlagCanvas = document.createElement('canvas');
    pFlagCanvas.width = 128; pFlagCanvas.height = 80;
    const pfCtx = pFlagCanvas.getContext('2d');
    pfCtx.fillStyle = '#0c2340'; // Police navy
    pfCtx.fillRect(0, 0, 128, 80);
    pfCtx.fillStyle = '#f5b700'; // Gold circle
    pfCtx.beginPath(); pfCtx.arc(64, 40, 22, 0, Math.PI * 2); pfCtx.fill();
    pfCtx.fillStyle = '#0c2340';
    pfCtx.beginPath(); pfCtx.arc(64, 40, 16, 0, Math.PI * 2); pfCtx.fill();
    const pFlagTex = new THREE.CanvasTexture(pFlagCanvas);

    const pFlag = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.0),
      new THREE.MeshLambertMaterial({ map: pFlagTex, side: THREE.DoubleSide })
    );
    pFlag.position.set(0.85, 7.6, 0);
    fpGroup.add(pFlag);

    parent.add(fpGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.4, 0, z - 1.4),
      new THREE.Vector3(x + 1.4, 8.5, z + 1.4)
    ));
  },

  // Fire Station Safety Rack (Red Sand & Water Buckets)
  createPoliceFireStationRack: function(parent, x, z) {
    const fGroup = new THREE.Group();
    fGroup.position.set(x, 0, z);

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x4a3b32 });
    const redMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });

    // Wooden A-frame Stand
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.1), woodMat);
    beam.position.set(0, 1.4, 0);
    fGroup.add(beam);

    for (let px of [-0.9, 0.9]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.1), woodMat);
      leg.position.set(px, 0.7, 0);
      fGroup.add(leg);
    }

    // 3 Hanging Red Buckets labeled "FIRE"
    for (let bx of [-0.6, 0, 0.6]) {
      const bucket = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 8), redMat);
      bucket.position.set(bx, 1.1, 0);
      bucket.rotation.x = Math.PI;
      fGroup.add(bucket);
    }

    parent.add(fGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.1, 0, z - 0.3),
      new THREE.Vector3(x + 1.1, 1.6, z + 0.3)
    ));
  },

  // Tactical Sandbag Emplacement (Provides hip/crouch height cover)
  createSandbagEmplacement: function(parent, x, z, rotY) {
    const sbGroup = new THREE.Group();
    sbGroup.position.set(x, 0, z);
    sbGroup.rotation.y = rotY || 0;

    const bagMat = new THREE.MeshLambertMaterial({ color: 0x8a785d }); // Tan canvas
    const bagGeo = new THREE.BoxGeometry(0.85, 0.28, 0.42);

    for (let row = 0; row < 3; row++) {
      const count = 4;
      const offset = (row % 2 === 0) ? 0 : 0.4;
      for (let i = -count / 2; i < count / 2; i++) {
        const bag = new THREE.Mesh(bagGeo, bagMat);
        bag.position.set(i * 0.9 + offset, row * 0.28 + 0.14, 0);
        bag.castShadow = true;
        sbGroup.add(bag);
      }
    }

    parent.add(sbGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 2.0, 0, z - 0.45),
      new THREE.Vector3(x + 2.0, 1.1, z + 0.45)
    ));
  },

  // Stacked Wooden Supply Crates
  createSupplyCrates: function(parent, x, z) {
    const crateMat = new THREE.MeshLambertMaterial({ color: 0x5c442c });
    const crateGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);

    const crateCoords = [
      [0, 0.45, 0],
      [1.0, 0.45, 0],
      [0.5, 1.35, 0],
      [0, 0.45, 1.0]
    ];

    crateCoords.forEach(([cx, cy, cz]) => {
      const c = new THREE.Mesh(crateGeo, crateMat);
      c.position.set(x + cx, cy, z + cz);
      c.castShadow = true;
      parent.add(c);
    });

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.5, 0, z - 0.5),
      new THREE.Vector3(x + 1.5, 1.9, z + 1.5)
    ));
  },

  // Generates canvas texture for Police signage
  createPoliceSignTexture: function(engText, bngText) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Deep Navy Blue Police Background
    ctx.fillStyle = '#0c2340';
    ctx.fillRect(0, 0, 512, 128);

    // Golden Yellow Border
    ctx.strokeStyle = '#f5b700';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    // Top Bengali Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(bngText, 256, 48);

    // Bottom Bold English Text
    ctx.fillStyle = '#ffde59';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(engText, 256, 96);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // Bangladesh Police Patrol Pickup (ডাবল কেবিন পিকআপ)
  createPolicePickup: function(parent, x, y, z, rotY) {
    const truck = new THREE.Group();
    truck.position.set(x, y, z);
    truck.rotation.y = rotY || 0;

    const truckLength = 5.2;
    const truckWidth = 2.0;

    const whiteMat = new THREE.MeshPhongMaterial({ color: 0xf4f4f6, shininess: 60 });
    const navyMat = new THREE.MeshPhongMaterial({ color: 0x16447e, shininess: 50 });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x1f364d, transparent: true, opacity: 0.8 });

    // Lower Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(truckWidth, 0.45, truckLength), navyMat);
    chassis.position.set(0, 0.5, 0);
    chassis.castShadow = true;
    truck.add(chassis);

    // Double Cabin (White)
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(truckWidth, 1.1, 2.6), whiteMat);
    cabin.position.set(0, 1.25, 0.3);
    cabin.castShadow = true;
    truck.add(cabin);

    // Navy Blue Side Stripes with "POLICE" lettering
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(truckWidth + 0.02, 0.35, 2.62), navyMat);
    stripe.position.set(0, 1.0, 0.3);
    truck.add(stripe);

    // Windshield
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(truckWidth * 0.85, 0.8), glassMat);
    windshield.position.set(0, 1.45, 1.62);
    windshield.rotation.x = -0.35;
    truck.add(windshield);

    // Rear Open Truck Bed
    const bedSides = new THREE.Mesh(new THREE.BoxGeometry(truckWidth, 0.65, 2.1), whiteMat);
    bedSides.position.set(0, 1.0, -1.5);
    truck.add(bedSides);

    // Steel Roll Bar over Bed
    const rollBarMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const rollBar = new THREE.Mesh(new THREE.BoxGeometry(truckWidth * 0.9, 1.0, 0.12), rollBarMat);
    rollBar.position.set(0, 1.7, -0.9);
    truck.add(rollBar);

    // Emergency Flashing Beacon Light Bar (Blue & Red) on Roof
    const lightBarBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.25), rollBarMat);
    lightBarBase.position.set(0, 1.84, 0.3);
    truck.add(lightBarBase);

    const blueDome = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.22), new THREE.MeshLambertMaterial({ color: 0x0066ff }));
    blueDome.position.set(-0.3, 1.95, 0.3);
    truck.add(blueDome);

    const redDome = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.22), new THREE.MeshLambertMaterial({ color: 0xff0000 }));
    redDome.position.set(0.3, 1.95, 0.3);
    truck.add(redDome);

    // Heavy Front Push Bar / Bull-bar
    const bullBar = new THREE.Mesh(new THREE.BoxGeometry(truckWidth * 0.85, 0.6, 0.2), rollBarMat);
    bullBar.position.set(0, 0.75, truckLength / 2 + 0.1);
    truck.add(bullBar);

    // Wheels
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x282828 });
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.24, 10);

    for (let xs of [-truckWidth / 2, truckWidth / 2]) {
      for (let zs of [1.4, -1.4]) {
        const w = new THREE.Mesh(wheelGeo, tireMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(xs, 0.38, zs);
        truck.add(w);
      }
    }

    parent.add(truck);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - truckWidth / 2 - 0.2, y, z - truckLength / 2 - 0.2),
      new THREE.Vector3(x + truckWidth / 2 + 0.2, y + 2.4, z + truckLength / 2 + 0.2)
    ));
  },

  // Bangladesh Police Tactical Mobile Van / Jeep
  createPoliceVan: function(parent, x, y, z, rotY) {
    const van = new THREE.Group();
    van.position.set(x, y, z);
    van.rotation.y = rotY || 0;

    const vanLength = 5.0;
    const vanWidth = 2.1;
    const vanHeight = 2.2;

    const navyMat = new THREE.MeshPhongMaterial({ color: 0x16447e, shininess: 50 });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x111e2e, transparent: true, opacity: 0.85 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(vanWidth, vanHeight, vanLength), navyMat);
    body.position.set(0, vanHeight / 2 + 0.4, 0);
    body.castShadow = true;
    van.add(body);

    // Front Windshield with protective mesh texture
    const fWin = new THREE.Mesh(new THREE.PlaneGeometry(vanWidth * 0.85, 0.9), glassMat);
    fWin.position.set(0, 1.8, vanLength / 2 + 0.02);
    fWin.rotation.x = -0.25;
    van.add(fWin);

    // Roof Police Siren Beacon Dome
    const siren = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.2, 0.25, 8),
      new THREE.MeshLambertMaterial({ color: 0x0055ff })
    );
    siren.position.set(0, vanHeight + 0.52, 0.6);
    van.add(siren);

    // Wheels
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x282828 });
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.26, 10);
    for (let xs of [-vanWidth / 2, vanWidth / 2]) {
      for (let zs of [1.4, -1.4]) {
        const w = new THREE.Mesh(wheelGeo, tireMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(xs, 0.42, zs);
        van.add(w);
      }
    }

    parent.add(van);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - vanWidth / 2 - 0.2, y, z - vanLength / 2 - 0.2),
      new THREE.Vector3(x + vanWidth / 2 + 0.2, y + 2.8, z + vanLength / 2 + 0.2)
    ));
  },

  // =========================================================
  // 11. TOWN EXPANSION (Connecting roads, roadside shops, houses & details)
  // =========================================================
  createTownExpansion: function(parent) {
    // 1. West Side Street Extension (Puran Bazar Goli at Z = -35)
    // Extending further west to X = -54
    const brickMat = new THREE.MeshLambertMaterial({ map: TextureFactory.createBrickPavementTexture() });
    brickMat.map.repeat.set(6, 2);

    const westExtRoad = new THREE.Mesh(new THREE.PlaneGeometry(22, 9), brickMat);
    westExtRoad.rotation.x = -Math.PI / 2;
    westExtRoad.position.set(-45, 0.02, -35);
    westExtRoad.receiveShadow = true;
    parent.add(westExtRoad);

    // Roadside Grocery Store along West Side Street
    this.createBangladeshiBuilding(parent, {
      x: -36, z: -46, w: 12, d: 11, floors: 2, color: '#c9bfa8',
      shopName: 'সততা মুদি ভাণ্ডার', shopSub: 'চাল, ডাল, তেল ও পাইকারী মাল', phone: '০১৭৩৩-৪৪৩৩২২', theme: 'green', shutterOpen: true
    });

    // Roadside Bicycle Repair Shop along West Side Street
    this.createBangladeshiBuilding(parent, {
      x: -36, z: -24, w: 12, d: 11, floors: 2, color: '#bcc3cb',
      shopName: 'আলমগীর সাইকেল গ্যারেজ', shopSub: 'সাইকেল ও ভ্যান মেকানিক্স', phone: '০১৮২০-৯৯৮৮১১', theme: 'blue', shutterOpen: true
    });

    // Traditional Bengali Tin-Shed Residential Houses in West Neighborhood
    this.createTinShedHouse(parent, -47, -24, 0, 'রফিক সাহেবের বাড়ি');
    this.createTinShedHouse(parent, -47, -46, Math.PI, 'আনোয়ার ভিলা');

    // 2. Roadside Tea Stall & Waiting Kiosk at transition zone (X = 13.5, Z = -6)
    this.createRoadsideTeaStall(parent, 13.5, -6);

    // 3. Directional Road Signposts
    this.createDirectionalSignpost(parent, 13.5, 3.0, 'মাগুরা পুলিশ লাইনস ➔ • POLICE LINES', '#0c2340');
    this.createDirectionalSignpost(parent, -8.6, -75, 'ভায়না মোড় ৫০০ মি ➔ • VAYNAR MOR', '#062f21');

    // 4. Lush Shade Trees & Coconut Palms along expansion routes
    const expTrees = [
      { x: -14, z: -102 },
      { x: 14, z: -102 },
      { x: -38, z: -102 },
      { x: 38, z: -102 },
      { x: 23, z: -12 },
      { x: 38, z: 27 },
      { x: -46, z: -35 }
    ];

    expTrees.forEach(t => {
      this.createShadeTree(parent, t.x, t.z);
    });

    const expPalms = [
      { x: -14, z: -88 },
      { x: 14, z: -88 },
      { x: -14, z: -116 },
      { x: 14, z: -116 },
      { x: 52, z: 2 },
      { x: 52, z: 12 },
      { x: 23, z: 18 }
    ];

    expPalms.forEach(p => {
      this.createCoconutPalm(parent, p.x, p.z);
    });
  },

  // Traditional Bengali Tin-Shed Residential House
  createTinShedHouse: function(parent, x, z, rotY, name) {
    const hGroup = new THREE.Group();
    hGroup.position.set(x, 0, z);
    hGroup.rotation.y = rotY || 0;

    const hWidth = 8.5;
    const hDepth = 7.0;
    const hHeight = 3.6;

    // Plastered Brick & Mud Wall
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xd6cebe });
    const body = new THREE.Mesh(new THREE.BoxGeometry(hWidth, hHeight, hDepth), wallMat);
    body.position.y = hHeight / 2;
    body.castShadow = true;
    hGroup.add(body);

    // Corrugated Tin Gable Roof
    const tinMat = new THREE.MeshLambertMaterial({ map: TextureFactory.createTinRoofTexture() });
    const roof1 = new THREE.Mesh(new THREE.BoxGeometry(hWidth + 0.8, 0.08, hDepth * 0.65), tinMat);
    roof1.position.set(0, hHeight + 0.9, -hDepth * 0.22);
    roof1.rotation.x = 0.35;
    roof1.castShadow = true;
    hGroup.add(roof1);

    const roof2 = new THREE.Mesh(new THREE.BoxGeometry(hWidth + 0.8, 0.08, hDepth * 0.65), tinMat);
    roof2.position.set(0, hHeight + 0.9, hDepth * 0.22);
    roof2.rotation.x = -0.35;
    roof2.castShadow = true;
    hGroup.add(roof2);

    // Front Wooden Verandah Porch
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.6, 6);
    for (let px of [-hWidth / 2 + 1, hWidth / 2 - 1]) {
      const p = new THREE.Mesh(postGeo, woodMat);
      p.position.set(px, 1.3, hDepth / 2 + 1.2);
      hGroup.add(p);
    }

    const vRoof = new THREE.Mesh(new THREE.BoxGeometry(hWidth, 0.06, 1.6), tinMat);
    vRoof.position.set(0, 2.6, hDepth / 2 + 0.8);
    vRoof.rotation.x = 0.2;
    hGroup.add(vRoof);

    // Wooden Door
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.2), woodMat);
    door.position.set(0, 1.1, hDepth / 2 + 0.02);
    hGroup.add(door);

    parent.add(hGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - hWidth / 2 - 0.4, 0, z - hDepth / 2 - 0.4),
      new THREE.Vector3(x + hWidth / 2 + 0.4, 5.2, z + hDepth / 2 + 1.4)
    ));
  },

  // Directional Signpost with Bengali and English text
  createDirectionalSignpost: function(parent, x, z, text, bgColor = '#0c2340') {
    const postMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 6), postMat);
    pole.position.set(x, 1.4, z);
    parent.add(pole);

    const canvas = document.createElement('canvas');
    canvas.width = 384; canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 384, 96);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 376, 88);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 192, 56);
    const signTex = new THREE.CanvasTexture(canvas);

    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.6, 0.08),
      new THREE.MeshLambertMaterial({ map: signTex })
    );
    signBoard.position.set(x, 2.4, z);
    parent.add(signBoard);
  },

  // Small Passenger Hauler / Tempo (লেগুনা)
  createPassengerTempo: function(parent, x, y, z, rotY) {
    const tempo = new THREE.Group();
    tempo.position.set(x, y, z);
    tempo.rotation.y = rotY || 0;

    const blueMat = new THREE.MeshPhongMaterial({ color: 0x0055a5, shininess: 40 });
    const yellowMat = new THREE.MeshLambertMaterial({ color: 0xf5b700 });
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });

    // Chassis & Cabin
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 3.8), blueMat);
    body.position.set(0, 0.75, 0);
    body.castShadow = true;
    tempo.add(body);

    // Yellow stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.14, 3.82), yellowMat);
    stripe.position.set(0, 0.85, 0);
    tempo.add(stripe);

    // Rear Passenger Hood
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 2.4), blackMat);
    hood.position.set(0, 1.6, -0.6);
    tempo.add(hood);

    // Wheels
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x282828 });
    const wGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.18, 8);
    for (let xs of [-0.75, 0.75]) {
      for (let zs of [1.1, -1.1]) {
        const w = new THREE.Mesh(wGeo, tireMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(xs, 0.3, zs);
        tempo.add(w);
      }
    }

    parent.add(tempo);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.9, y, z - 2.0),
      new THREE.Vector3(x + 0.9, y + 2.2, z + 2.0)
    ));
  },

  // Parked Motorbike
  createMotorbike: function(parent, x, y, z, rotY) {
    const bike = new THREE.Group();
    bike.position.set(x, y, z);
    bike.rotation.y = rotY || 0;

    const redMat = new THREE.MeshPhongMaterial({ color: 0xcc1111, shininess: 60 });
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

    // Fuel Tank & Seat
    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.6), redMat);
    tank.position.set(0, 0.85, 0.2);
    bike.add(tank);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.15, 0.6), metalMat);
    seat.position.set(0, 0.82, -0.35);
    bike.add(seat);

    // Handlebar
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.04), metalMat);
    handle.position.set(0, 1.05, 0.6);
    bike.add(handle);

    // Wheels
    const wGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 10);
    const fWheel = new THREE.Mesh(wGeo, tireMat);
    fWheel.rotation.z = Math.PI / 2;
    fWheel.position.set(0, 0.32, 0.8);
    bike.add(fWheel);

    const rWheel = new THREE.Mesh(wGeo, tireMat);
    rWheel.rotation.z = Math.PI / 2;
    rWheel.position.set(0, 0.32, -0.7);
    bike.add(rWheel);

    // Kickstand lean
    bike.rotation.z = 0.12;

    parent.add(bike);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.5, y, z - 1.0),
      new THREE.Vector3(x + 0.5, y + 1.2, z + 1.0)
    ));
  },

  // =========================================================
  // 12. EXPANDED ROAD NETWORK & URBAN SUBURBS
  // =========================================================
  createExpandedRoadNetworkAndSuburbs: function(parent) {
    const roadTex = TextureFactory.createRoadTexture();
    const brickTex = TextureFactory.createBrickPavementTexture();
    const sidewalkTex = TextureFactory.createSidewalkTexture();
    sidewalkTex.repeat.set(4, 1);
    const curbTex = TextureFactory.createCurbTexture();
    curbTex.repeat.set(15, 1);

    const roadMat = new THREE.MeshLambertMaterial({ map: roadTex });
    const brickMat = new THREE.MeshLambertMaterial({ map: brickTex });
    const swMat = new THREE.MeshLambertMaterial({ map: sidewalkTex });
    const curbMat = new THREE.MeshLambertMaterial({ map: curbTex });

    // ---------------------------------------------------------
    // A. WIDER MAIN ROAD CONNECTORS & APPROACH BOULEVARDS
    // ---------------------------------------------------------
    // 1. Widened Boulevard approach connecting Town Highway to Vaynar Mor (Z = -82 to Z = -94)
    // Widens road to 20m with asphalt shoulders
    const vApproachWest = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 12), roadMat);
    vApproachWest.rotation.x = -Math.PI / 2;
    vApproachWest.position.set(-9.25, 0.021, -88);
    parent.add(vApproachWest);

    const vApproachEast = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 12), roadMat);
    vApproachEast.rotation.x = -Math.PI / 2;
    vApproachEast.position.set(9.25, 0.021, -88);
    parent.add(vApproachEast);

    // 2. Widened Police Lines Entrance Avenue (Z = 8, X = 8 to 22)
    const polAveExtra = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.0), roadMat);
    polAveExtra.rotation.x = -Math.PI / 2;
    polAveExtra.position.set(15, 0.023, 13.5);
    parent.add(polAveExtra);

    // ---------------------------------------------------------
    // B. BRANCH SIDE ROADS & T-JUNCTIONS
    // ---------------------------------------------------------

    // 1. COLLEGE ROAD ("কলেজ রোড") — East Branch at Z = -48
    // Runs from Main Highway (X = 8) to East Suburb (X = 46), Width 8.5m
    const collegeRoad = new THREE.Mesh(new THREE.PlaneGeometry(38, 8.5), roadMat);
    collegeRoad.rotation.x = -Math.PI / 2;
    collegeRoad.position.set(27, 0.022, -48);
    collegeRoad.receiveShadow = true;
    parent.add(collegeRoad);

    // Sidewalks along College Road
    const cSwNorth = new THREE.Mesh(new THREE.BoxGeometry(38, 0.2, 1.8), swMat);
    cSwNorth.position.set(27, 0.1, -53.15);
    parent.add(cSwNorth);

    const cSwSouth = new THREE.Mesh(new THREE.BoxGeometry(38, 0.2, 1.8), swMat);
    cSwSouth.position.set(27, 0.1, -42.85);
    parent.add(cSwSouth);

    // Curbs along College Road
    const cCurbN = new THREE.Mesh(new THREE.BoxGeometry(38, 0.24, 0.25), curbMat);
    cCurbN.position.set(27, 0.12, -52.15);
    parent.add(cCurbN);

    const cCurbS = new THREE.Mesh(new THREE.BoxGeometry(38, 0.24, 0.25), curbMat);
    cCurbS.position.set(27, 0.12, -43.85);
    parent.add(cCurbS);

    // T-Junction 1 with Main Highway at (X = 8, Z = -48)
    this.createDirectionalSignpost(parent, 9.5, -44, 'কলেজ রোড ➔ • COLLEGE RD', '#004b93');

    // 2. NORTH RESIDENTIAL AVENUE ("উত্তর আবাসিক সড়ক") — Along X = 40
    // Runs North from College Road (Z = -48) to Vaynar Mor East Wing (Z = -94), Length 46m, Width 8.0m
    // Connects College Road directly to Vaynar Mor, forming an entire Eastern bypass!
    const northResAve = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 46), roadMat);
    northResAve.rotation.x = -Math.PI / 2;
    northResAve.position.set(40, 0.022, -71);
    northResAve.receiveShadow = true;
    parent.add(northResAve);

    // Sidewalk along East edge of North Residential Avenue
    const nSwEast = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 46), swMat);
    nSwEast.position.set(44.9, 0.1, -71);
    parent.add(nSwEast);

    const nCurbE = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 46), curbMat);
    nCurbE.position.set(43.9, 0.12, -71);
    parent.add(nCurbE);

    // 3. EAST SUBURBAN ALLEY ("পূর্ব আবাসিক গলি") — Along X = 40
    // Runs South from College Road (Z = -48) to Police Lines North edge (Z = -14), Length 34m, Width 7.5m
    const eastSubAlley = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 34), brickMat);
    eastSubAlley.rotation.x = -Math.PI / 2;
    eastSubAlley.position.set(40, 0.022, -31);
    eastSubAlley.receiveShadow = true;
    parent.add(eastSubAlley);

    // T-Junction 2 at (X = 40, Z = -48) connecting College Road, North Avenue, and South Alley
    this.createDirectionalSignpost(parent, 43.5, -50, 'ভায়না মোড় বাইপাস ➔ • VAYNAR MOR BYPASS', '#062f21');

    // 4. HOSPITAL ROAD ("হাসপাতাল সড়ক") — West Branch at Z = -68
    // Runs from Main Highway (X = -8) to West Suburb (X = -46), Width 8.5m
    const hospitalRoad = new THREE.Mesh(new THREE.PlaneGeometry(38, 8.5), roadMat);
    hospitalRoad.rotation.x = -Math.PI / 2;
    hospitalRoad.position.set(-27, 0.022, -68);
    hospitalRoad.receiveShadow = true;
    parent.add(hospitalRoad);

    // Sidewalks along Hospital Road
    const hSwNorth = new THREE.Mesh(new THREE.BoxGeometry(38, 0.2, 1.8), swMat);
    hSwNorth.position.set(-27, 0.1, -73.15);
    parent.add(hSwNorth);

    const hSwSouth = new THREE.Mesh(new THREE.BoxGeometry(38, 0.2, 1.8), swMat);
    hSwSouth.position.set(-27, 0.1, -62.85);
    parent.add(hSwSouth);

    // Curbs along Hospital Road
    const hCurbN = new THREE.Mesh(new THREE.BoxGeometry(38, 0.24, 0.25), curbMat);
    hCurbN.position.set(-27, 0.12, -72.15);
    parent.add(hCurbN);

    const hCurbS = new THREE.Mesh(new THREE.BoxGeometry(38, 0.24, 0.25), curbMat);
    hCurbS.position.set(-27, 0.12, -63.85);
    parent.add(hCurbS);

    // T-Junction 3 with Main Highway at (X = -8, Z = -68)
    this.createDirectionalSignpost(parent, -9.5, -64, 'হাসপাতাল সড়ক ➔ • HOSPITAL RD', '#b31217');

    // 5. WEST SUBURBAN BYPASS ("পশ্চিম বাইপাস লিংক") — Along X = -40
    // Runs from Puran Bazar Goli (Z = -35) North through Hospital Road (Z = -68) to Vaynar Mor West Wing (Z = -94)
    // Length 59m, Width 8.0m, forms a realistic 4-way intersection at (X = -40, Z = -68)!
    const westBypass = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 59), roadMat);
    westBypass.rotation.x = -Math.PI / 2;
    westBypass.position.set(-40, 0.022, -64.5);
    westBypass.receiveShadow = true;
    parent.add(westBypass);

    // Sidewalk along West edge of West Bypass
    const wSwWest = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 59), swMat);
    wSwWest.position.set(-44.9, 0.1, -64.5);
    parent.add(wSwWest);

    const wCurbW = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 59), curbMat);
    wCurbW.position.set(-43.9, 0.12, -64.5);
    parent.add(wCurbW);

    // 6. CANAL PROMENADE / RIVERSIDE PROMENADE ("ক্যানেল ভিউ সড়ক") — South at Z = 65
    // East Wing: X = 8 to 44 (Length 36m, Width 7.5m)
    const canalEastRoad = new THREE.Mesh(new THREE.PlaneGeometry(36, 7.5), roadMat);
    canalEastRoad.rotation.x = -Math.PI / 2;
    canalEastRoad.position.set(26, 0.022, 65);
    canalEastRoad.receiveShadow = true;
    parent.add(canalEastRoad);

    // West Wing: X = -8 to -44 (Length 36m, Width 7.5m)
    const canalWestRoad = new THREE.Mesh(new THREE.PlaneGeometry(36, 7.5), roadMat);
    canalWestRoad.rotation.x = -Math.PI / 2;
    canalWestRoad.position.set(-26, 0.022, 65);
    canalWestRoad.receiveShadow = true;
    parent.add(canalWestRoad);

    // Promenade concrete benches along Canal bank (Z = 69)
    const benchMat = new THREE.MeshLambertMaterial({ color: 0xded9cf });
    for (let bx of [16, 26, 36, -16, -26, -36]) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.7), benchMat);
      bench.position.set(bx, 0.25, 69);
      parent.add(bench);
      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(bx - 1.3, 0, 68.6),
        new THREE.Vector3(bx + 1.3, 1.0, 69.4)
      ));
    }

    // ---------------------------------------------------------
    // C. COMMERCIAL SHOPS ALONG THE NEW ROADS
    // ---------------------------------------------------------
    // 1. Book Depot & Stationery along College Road
    this.createBangladeshiBuilding(parent, {
      x: 27, z: -57, w: 12, d: 9, floors: 2, color: '#cad2c5',
      shopName: 'মাগুরা বুক ডিপো ও লাইব্রেরী', shopSub: 'স্কুল-কলেজের সকল বই ও স্টেশনারী', phone: '০১৭৫৫-৪৪৩৩২২', theme: 'blue', shutterOpen: true
    });

    // 2. Hair Salon & Barber along College Road
    this.createBangladeshiBuilding(parent, {
      x: 27, z: -39, w: 12, d: 9, floors: 2, color: '#e5dacf',
      shopName: 'জনতা সেলুন ও হেয়ার কাটিং', shopSub: 'আধুনিক হেয়ার ড্রেসার ও ফেসিয়াল', phone: '০১৮১৬-৭৭৮৮৯৯', theme: 'red', shutterOpen: true
    });

    // 3. Diagnostic Clinic along Hospital Road
    this.createBangladeshiBuilding(parent, {
      x: -27, z: -76, w: 12, d: 9, floors: 2, color: '#d8cfc4',
      shopName: 'মাগুরা ডায়াগনস্টিক ক্লিনিক', shopSub: 'ডিজিটাল এক্স-রে ও প্যাথলজি ল্যাব', phone: '০১৯১১-২২১১০০', theme: 'green', shutterOpen: true
    });

    // 4. Grocery & General Store along Hospital Road
    this.createBangladeshiBuilding(parent, {
      x: -27, z: -60, w: 12, d: 9, floors: 2, color: '#bcc3cb',
      shopName: 'মায়ের দোয়া জেনারেল স্টোর', shopSub: 'নিত্য প্রয়োজনীয় সকল মুদি সামগ্রী', phone: '০১৭২২-৩৩৪৪৫৫', theme: 'bkash', shutterOpen: true
    });

    // ---------------------------------------------------------
    // D. RESIDENTIAL BUILDINGS IN QUIETER SUBURBAN AREAS
    // ---------------------------------------------------------
    // 1. Shantiniketan Villa (North-East quiet suburb, X = 49, Z = -78)
    this.createResidentialBuilding(parent, {
      x: 49, z: -78, w: 10, d: 11, floors: 2, color: '#b9cfc7',
      name: 'শান্তিনিকেতন ভিলা'
    });

    // 2. Probhati Bhaban (North-East suburb, X = 49, Z = -62)
    this.createResidentialBuilding(parent, {
      x: 49, z: -62, w: 10, d: 11, floors: 2, color: '#e5dcce',
      name: 'প্রভাতী ভবন'
    });

    // 3. Sobuj Chhaya Villa (South-East quiet suburb, X = 49, Z = -28)
    this.createResidentialBuilding(parent, {
      x: 49, z: -28, w: 10, d: 11, floors: 2, color: '#d4cbbf',
      name: 'সবুজ ছায়া ভিলা'
    });

    // 4. Talukdar Villa (West suburb, X = -49, Z = -78)
    this.createResidentialBuilding(parent, {
      x: -49, z: -78, w: 10, d: 11, floors: 2, color: '#c5d1dc',
      name: 'তালুকদার ভিলা'
    });

    // ---------------------------------------------------------
    // E. OPEN COMBAT SPACES, TACTICAL COVER & WALLS
    // ---------------------------------------------------------
    // Low Brick Garden Walls (0.9m high - perfect crouch/chest cover)
    // Yard around Shantiniketan
    this.createLowGardenWall(parent, 49, -71, 10, 0.3);
    // Yard around Probhati
    this.createLowGardenWall(parent, 49, -55, 10, 0.3);
    // Yard around Talukdar Villa
    this.createLowGardenWall(parent, -49, -71, 10, 0.3);

    // Tactical Sandbag firing positions in open yards
    this.createSandbagEmplacement(parent, 35, -78, 0);
    this.createSandbagEmplacement(parent, -35, -78, 0);
    this.createSandbagEmplacement(parent, 35, -28, Math.PI / 2);

    // Stacked Wooden Supply Crates in corner lot
    this.createSupplyCrates(parent, 34, -44);
    this.createSupplyCrates(parent, -34, -64);

    // ---------------------------------------------------------
    // F. UTILITY POLES, STREETLIGHTS & STREET-SIDE DETAILS
    // ---------------------------------------------------------
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x8a8882 });
    const crossMat = new THREE.MeshLambertMaterial({ color: 0x3d3d3d });
    const cableMat = new THREE.LineBasicMaterial({ color: 0x111111 });

    const newPoles = [
      { x: 18, z: -48 },
      { x: 38, z: -48 },
      { x: 40, z: -70 },
      { x: 40, z: -90 },
      { x: 40, z: -28 },
      { x: -18, z: -68 },
      { x: -38, z: -68 },
      { x: -40, z: -50 },
      { x: -40, z: -88 },
      { x: 26, z: 65 },
      { x: -26, z: 65 }
    ];

    const poleGeo = new THREE.CylinderGeometry(0.18, 0.24, 9, 8);
    const crossGeo = new THREE.BoxGeometry(2.2, 0.12, 0.12);

    newPoles.forEach(p => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(p.x, 4.5, p.z);
      parent.add(pole);

      const cross = new THREE.Mesh(crossGeo, crossMat);
      cross.position.set(p.x, 8.2, p.z);
      parent.add(cross);

      // Streetlight on pole
      const lampArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.0), crossMat);
      lampArm.position.set(p.x, 8.4, p.z + 0.5);
      parent.add(lampArm);

      const lampHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.12, 0.4),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      lampHead.position.set(p.x, 8.35, p.z + 0.9);
      parent.add(lampHead);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(p.x - 0.4, 0, p.z - 0.4),
        new THREE.Vector3(p.x + 0.4, 9.0, p.z + 0.4)
      ));
    });

    // Tangled cables between adjacent road poles
    const cableRoutes = [
      [newPoles[0], newPoles[1]],
      [newPoles[1], newPoles[2]],
      [newPoles[2], newPoles[3]],
      [newPoles[1], newPoles[4]],
      [newPoles[5], newPoles[6]],
      [newPoles[6], newPoles[7]],
      [newPoles[6], newPoles[8]]
    ];

    cableRoutes.forEach(([p1, p2]) => {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(p1.x, 8.1, p1.z),
        new THREE.Vector3((p1.x + p2.x) / 2, 7.0, (p1.z + p2.z) / 2),
        new THREE.Vector3(p2.x, 8.1, p2.z)
      );
      const points = curve.getPoints(8);
      const cableLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), cableMat);
      parent.add(cableLine);
    });

    // Roadside Concrete Dustbins / Waste Receptacles
    const binMat = new THREE.MeshLambertMaterial({ color: 0x4a7c59 });
    const binGeo = new THREE.CylinderGeometry(0.4, 0.35, 1.0, 8);
    for (let bCoord of [{ x: 10, z: -46 }, { x: 38, z: -52 }, { x: -10, z: -66 }, { x: -38, z: -72 }]) {
      const bin = new THREE.Mesh(binGeo, binMat);
      bin.position.set(bCoord.x, 0.5, bCoord.z);
      parent.add(bin);
    }

    // ---------------------------------------------------------
    // G. PARKED VEHICLES & MOTORCYCLES
    // ---------------------------------------------------------
    // Parked Red Motorbike outside Salon on College Road
    this.createMotorbike(parent, 23.5, 0.1, -42.5, Math.PI * 0.4);

    // Parked Motorbike outside Shantiniketan in quiet suburb
    this.createMotorbike(parent, 43.5, 0.1, -74.0, -Math.PI * 0.2);

    // Parked Green CNG Auto-Rickshaw waiting at College Road T-Junction
    this.createCNGAutoRickshaw(parent, 14.5, 0.02, -45.5, Math.PI * 0.85);

    // Parked Delivery Microbus on Hospital Road
    this.createMicrobus(parent, -21.0, 0.02, -65.5, Math.PI);

    // Flatbed Rickshaw Cargo Van parked along Canal Promenade
    this.createRickshawVan(parent, 21.0, 0.02, 63.5, -Math.PI * 0.1);
  },

  // 2-Story Bangladeshi Suburban Residential Building with Balcony and Nameplate
  createResidentialBuilding: function(parent, data) {
    const bGroup = new THREE.Group();
    bGroup.position.set(data.x, 0, data.z);

    const totalHeight = data.floors * 3.5;
    const facadeTex = TextureFactory.createBuildingFacadeTexture(data.color, 3, data.floors);
    const wallMat = new THREE.MeshLambertMaterial({ map: facadeTex });

    // Main structural box
    const body = new THREE.Mesh(new THREE.BoxGeometry(data.w, totalHeight, data.d), wallMat);
    body.position.y = totalHeight / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    bGroup.add(body);

    // Front Balcony on Floor 2 (Facing west towards road)
    const balconyMat = new THREE.MeshLambertMaterial({ color: 0x8a8e94 });
    const bSlab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, data.d * 0.6), balconyMat);
    bSlab.position.set(-data.w / 2 - 0.6, 3.6, 0);
    bGroup.add(bSlab);

    const bRail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, data.d * 0.6), balconyMat);
    bRail.position.set(-data.w / 2 - 1.15, 4.15, 0);
    bGroup.add(bRail);

    // Roof Parapet
    const parapetMat = new THREE.MeshLambertMaterial({ color: 0x16447e });
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(data.w, 0.7, data.d), parapetMat);
    parapet.position.y = totalHeight + 0.35;
    bGroup.add(parapet);

    // Rooftop Water Tank (Blue)
    const tankMat = new THREE.MeshLambertMaterial({ color: 0x0047ab });
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.6, 8), tankMat);
    tank.position.set(2, totalHeight + 1.1, 2);
    bGroup.add(tank);

    // Residential House Nameplate over Entrance
    const npCanvas = document.createElement('canvas');
    npCanvas.width = 256; npCanvas.height = 64;
    const npCtx = npCanvas.getContext('2d');
    npCtx.fillStyle = '#0c2340';
    npCtx.fillRect(0, 0, 256, 64);
    npCtx.strokeStyle = '#f5b700';
    npCtx.lineWidth = 4;
    npCtx.strokeRect(4, 4, 248, 56);
    npCtx.fillStyle = '#ffffff';
    npCtx.font = 'bold 20px sans-serif';
    npCtx.textAlign = 'center';
    npCtx.fillText(data.name, 128, 38);
    const npTex = new THREE.CanvasTexture(npCanvas);

    const namePlate = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 0.65),
      new THREE.MeshLambertMaterial({ map: npTex })
    );
    namePlate.position.set(-data.w / 2 - 0.05, 2.8, 0);
    namePlate.rotation.y = -Math.PI / 2;
    bGroup.add(namePlate);

    // Ground Floor Entrance Door
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.4), woodMat);
    door.position.set(-data.w / 2 - 0.04, 1.2, 0);
    door.rotation.y = -Math.PI / 2;
    bGroup.add(door);

    parent.add(bGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(data.x - data.w / 2 - 0.4, 0, data.z - data.d / 2 - 0.4),
      new THREE.Vector3(data.x + data.w / 2 + 0.4, totalHeight + 2, data.z + data.d / 2 + 0.4)
    ));
  },

  // Low Brick Garden Wall (0.9m high - waist-height tactical cover)
  createLowGardenWall: function(parent, x, z, w, d) {
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xb85d38 }); // Terracotta brick
    const capMat = new THREE.MeshLambertMaterial({ color: 0xded9cf });  // Concrete cap

    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 0.85, d), wallMat);
    wall.position.set(x, 0.425, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    parent.add(wall);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.1, d + 0.1), capMat);
    cap.position.set(x, 0.9, z);
    parent.add(cap);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - w / 2 - 0.15, 0, z - d / 2 - 0.15),
      new THREE.Vector3(x + w / 2 + 0.15, 1.0, z + d / 2 + 0.15)
    ));
  },

  // =========================================================
  // 13. MAGURA BORO BAZAR COMMERCIAL DISTRICT (মাগুরা বড় বাজার ও বাণিজ্যিক কেন্দ্র)
  // =========================================================
  createMaguraBoroBazar: function(parent) {
    const roadTex = TextureFactory.createRoadTexture();
    const brickTex = TextureFactory.createBrickPavementTexture();
    brickTex.repeat.set(6, 2);
    const swTex = TextureFactory.createSidewalkTexture();
    swTex.repeat.set(2, 20);
    const curbTex = TextureFactory.createCurbTexture();
    curbTex.repeat.set(20, 1);

    const roadMat = new THREE.MeshLambertMaterial({ map: roadTex });
    const brickMat = new THREE.MeshLambertMaterial({ map: brickTex });
    const swMat = new THREE.MeshLambertMaterial({ map: swTex });
    const curbMat = new THREE.MeshLambertMaterial({ map: curbTex });

    // ---------------------------------------------------------
    // A. ROAD NETWORK & COMMERCIAL STREETS
    // ---------------------------------------------------------

    // 1. MAIN MARKET STREET ("বড় বাজার প্রধান সড়ক")
    // Runs North-South along X = -43 from Puran Bazar Goli (Z = -31) to Canal Promenade (Z = 65)
    // Total Length 96m, Width 8.5m
    const mainMktRoad = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 96), roadMat);
    mainMktRoad.rotation.x = -Math.PI / 2;
    mainMktRoad.position.set(-43, 0.022, 17);
    mainMktRoad.receiveShadow = true;
    parent.add(mainMktRoad);

    // Sidewalks along Main Market Street
    // West Sidewalk
    const mSwWest = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 96), swMat);
    mSwWest.position.set(-48.35, 0.1, 17);
    parent.add(mSwWest);

    const mCurbW = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 96), curbMat);
    mCurbW.position.set(-47.35, 0.12, 17);
    parent.add(mCurbW);

    // East Sidewalk
    const mSwEast = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 96), swMat);
    mSwEast.position.set(-37.65, 0.1, 17);
    parent.add(mSwEast);

    const mCurbE = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 96), curbMat);
    mCurbE.position.set(-38.65, 0.12, 17);
    parent.add(mCurbE);

    // 2. MARKET ENTRANCE GATEWAY AVENUE ("বড় বাজার প্রধান প্রবেশদ্বার সড়ক")
    // Runs East-West along Z = 18 from Main Highway (X = -8) to Market Street (X = -43)
    // Width 7.5m, Length 35m
    const gatewayAve = new THREE.Mesh(new THREE.PlaneGeometry(35, 7.5), brickMat);
    gatewayAve.rotation.x = -Math.PI / 2;
    gatewayAve.position.set(-25.5, 0.023, 18);
    gatewayAve.receiveShadow = true;
    parent.add(gatewayAve);

    // North & South curbs along Gateway Avenue
    const gCurbN = new THREE.Mesh(new THREE.BoxGeometry(35, 0.24, 0.25), curbMat);
    gCurbN.position.set(-25.5, 0.12, 21.85);
    parent.add(gCurbN);

    const gCurbS = new THREE.Mesh(new THREE.BoxGeometry(35, 0.24, 0.25), curbMat);
    gCurbS.position.set(-25.5, 0.12, 14.15);
    parent.add(gCurbS);

    // 3. SPICE & GRAIN CROSS ALLEY ("মসলা ও চাউল পট্টি গলি")
    // Runs East-West along Z = -2 from Highway gap (X = -11.5) across to West Backstreet (X = -60)
    // Width 6.0m, Length 48m
    const spiceAlley = new THREE.Mesh(new THREE.PlaneGeometry(48, 6.0), brickMat);
    spiceAlley.rotation.x = -Math.PI / 2;
    spiceAlley.position.set(-35.5, 0.022, -2);
    spiceAlley.receiveShadow = true;
    parent.add(spiceAlley);

    // 4. CLOTH & GARMENTS CROSS ALLEY ("বস্ত্র ও গার্মেন্টস লেন")
    // Runs East-West along Z = 38 from Highway gap (X = -11.5) across to West Backstreet (X = -60)
    // Width 6.0m, Length 48m
    const garmentAlley = new THREE.Mesh(new THREE.PlaneGeometry(48, 6.0), brickMat);
    garmentAlley.rotation.x = -Math.PI / 2;
    garmentAlley.position.set(-35.5, 0.022, 38);
    garmentAlley.receiveShadow = true;
    parent.add(garmentAlley);

    // 5. WEST OUTER CARGO & FLANKING BYPASS ("পশ্চিম মালামাল লোডিং বাইপাস")
    // Runs North-South along X = -60 from Z = -10 to Z = 50 (Length 60m, Width 6.5m)
    const westBackstreet = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 60), roadMat);
    westBackstreet.rotation.x = -Math.PI / 2;
    westBackstreet.position.set(-60, 0.022, 20);
    westBackstreet.receiveShadow = true;
    parent.add(westBackstreet);

    // ---------------------------------------------------------
    // B. GRAND MARKET ENTRANCE GATEWAY ARCHWAY
    // ---------------------------------------------------------
    this.createMarketGatewayArch(parent, -12.5, 18, 0);

    // Directional signpost at highway junction pointing into Market
    this.createDirectionalSignpost(parent, -9.5, 22.5, 'মাগুরা বড় বাজার ➔ • BORO BAZAR', '#b31217');

    // ---------------------------------------------------------
    // C. CENTRAL OPEN MARKET SQUARE ("কাঁচাবাজার ও খোলা চত্বর")
    // ---------------------------------------------------------
    this.createOpenMarketHaatSquare(parent, -43, 8);

    // ---------------------------------------------------------
    // D. 2-3 STORY COMMERCIAL BUILDINGS & AUTHENTIC SHOPS
    // ---------------------------------------------------------

    // --- WEST ROW SHOPS (Fronts facing EAST towards Market Street) ---

    // 1. Boishakhi Bostraloy (Large 3-story Clothing & Saree Emporium)
    this.createBangladeshiBuilding(parent, {
      x: -54, z: -18, w: 11, d: 14, floors: 3, color: '#d8cbbd', facing: 'east',
      shopName: 'বৈশাখী বস্ত্রালয় ও শাড়ি ঘর', shopSub: 'বেনারসি, জামদানি, সুতি ও লেডিস ফ্যাশন', phone: '০১৭৮৮-৯৯০০১১', theme: 'red', shutterOpen: true
    });

    // 2. M/S Bhai Bhai Store (2-story Wholesale Grocery & Grain Depot)
    this.createBangladeshiBuilding(parent, {
      x: -54, z: -3, w: 11, d: 12, floors: 2, color: '#bcc3cb', facing: 'east',
      shopName: 'মেসার্স ভাই ভাই স্টোর', shopSub: 'চাল, ডাল, চিনি, তেল ও মসলার পাইকারী আড়ৎ', phone: '০১৮৩৩-৪৪৩৩২২', theme: 'green', shutterOpen: true
    });

    // 3. Magura Kacchi House (3-story Traditional Restaurant)
    this.createBangladeshiBuilding(parent, {
      x: -54, z: 24, w: 11, d: 13, floors: 3, color: '#cbb6a3', facing: 'east',
      shopName: 'মাগুরা কাচ্চি ও ভূনা খিচুড়ি', shopSub: 'স্পেশাল খাসির কাচ্চি, বিরিয়ানি ও বোরহানি', phone: '০১৯১২-৫৫৬৬৭৭', theme: 'orange', shutterOpen: true
    });

    // 4. Jonoseba Pharmacy (2-story Pharmacy & Drug House)
    this.createBangladeshiBuilding(parent, {
      x: -54, z: 48, w: 11, d: 13, floors: 2, color: '#b8c4c2', facing: 'east',
      shopName: 'জনসেবা ফার্মেসী ও ড্রাগ হাউজ', shopSub: 'জীবন রক্ষাকারী ঔষধ ও সার্জিক্যাল সামগ্রী', phone: '০১৭২২-১১০০৯৯', theme: 'green', shutterOpen: true
    });

    // --- EAST ROW SHOPS (Fronts facing WEST towards Market Street) ---

    // 5. Mayer Doa Traders (2-story Edible Oils & Groceries Wholesale)
    this.createBangladeshiBuilding(parent, {
      x: -32, z: -18, w: 11, d: 14, floors: 2, color: '#c7bcb0', facing: 'west',
      shopName: 'মায়ের দোয়া ট্রেডার্স', shopSub: 'সরিষা, সয়াবিন ও সকল প্রকার নিত্যপণ্য', phone: '০১৬৭০-৮৮৯৯০০', theme: 'blue', shutterOpen: true
    });

    // 6. New Magura Electronics (3-story Electronics & Mobile Zone)
    this.createBangladeshiBuilding(parent, {
      x: -32, z: -3, w: 11, d: 12, floors: 3, color: '#d1c7b8', facing: 'west',
      shopName: 'নিউ মাগুরা ইলেকট্রনিক্স', shopSub: 'টিভি, ফ্রিজ, ফ্যান ও মোবাইল অ্যাক্সেসরিজ', phone: '০১৭৬৬-৩৩২২১১', theme: 'bkash', shutterOpen: true
    });

    // 7. Madhubon Sweets & Curd House (2-story Sweetmeat & Confectionery)
    this.createBangladeshiBuilding(parent, {
      x: -32, z: 28, w: 11, d: 13, floors: 2, color: '#e5dacf', facing: 'west',
      shopName: 'মধুবন সুইটস ও দই ঘর', shopSub: 'খাঁটি গাভীর দুধের মিষ্টি, রসমালাই ও বগুড়ার দই', phone: '০১৮১৫-৪৪৩৩২২', theme: 'red', shutterOpen: true
    });

    // 8. Magura Hardware & Paint Center (3-story Hardware & Tools)
    this.createBangladeshiBuilding(parent, {
      x: -32, z: 48, w: 11, d: 13, floors: 3, color: '#cfd2d6', facing: 'west',
      shopName: 'মাগুরা হার্ডওয়্যার ও পেইন্টস', shopSub: 'বার্জার পেইন্টস, পাইপ, ফিটিংস ও যন্ত্রপাতি', phone: '০১৯৯৯-২২৩৩৪৪', theme: 'blue', shutterOpen: true
    });

    // ---------------------------------------------------------
    // E. FOOD STALLS, SNACK KIOSKS & RESTAURANT DETAILS
    // ---------------------------------------------------------

    // 1. Haji Nanna Tea Stall & Snack Point near Haat entrance
    this.createRoadsideTeaStall(parent, -37.5, 12);

    // 2. Restaurant Outdoor Biryani Pots & Dining Setup outside Magura Kacchi House
    this.createRestaurantOutdoorSetup(parent, -47.5, 24);

    // 3. Fruit Vendor Stall ("সতেজ ফল বিতান") at West sidewalk
    this.createFruitVendorStall(parent, -47.8, 11);

    // 4. Paan / Betel Leaf & Cigarette Kiosk near Gateway
    this.createPaanKiosk(parent, -47.8, 19);

    // ---------------------------------------------------------
    // F. PARKED VEHICLES, MOTORCYCLES & BICYCLES
    // ---------------------------------------------------------

    // 1. Cargo Flatbed Rickshaw Van loaded with produce crates
    this.createRickshawVan(parent, -46.2, 0.02, 5.5, -Math.PI * 0.1);

    // 2. Green CNG Auto-Rickshaw waiting with roof rack at Market Street
    this.createCNGAutoRickshaw(parent, -39.8, 0.02, 32, Math.PI * 0.85);

    // 3. Delivery Cargo Microbus in West loading lane
    this.createMicrobus(parent, -60, 0.02, 18, 0);

    // 4. Parked Motorcycles
    this.createMotorbike(parent, -47.2, 0.02, -16, Math.PI * 0.4);
    this.createMotorbike(parent, -47.2, 0.02, 22, -Math.PI * 0.35);

    // 5. Classic Bangladeshi Roadster Bicycles leaned against walls
    this.createBicycle(parent, -37.2, 0.02, 14, Math.PI * 0.08);
    this.createBicycle(parent, -33.5, 0.02, -9.5, Math.PI / 2);
    this.createBicycle(parent, -47.8, 0.02, 28, -Math.PI / 2);

    // ---------------------------------------------------------
    // G. UTILITY POLES, OVERHEAD TANGLED WIRES & DETAILS
    // ---------------------------------------------------------
    const mPoles = [
      { x: -39.0, z: -20 },
      { x: -39.0, z: 0 },
      { x: -39.0, z: 20 },
      { x: -39.0, z: 42 },
      { x: -47.0, z: -8 },
      { x: -47.0, z: 32 }
    ];

    const poleMat = new THREE.MeshLambertMaterial({ color: 0x8a8882 });
    const crossMat = new THREE.MeshLambertMaterial({ color: 0x3d3d3d });
    const cableMat = new THREE.LineBasicMaterial({ color: 0x111111 });

    const poleGeo = new THREE.CylinderGeometry(0.18, 0.24, 9, 8);
    const crossGeo = new THREE.BoxGeometry(2.2, 0.12, 0.12);

    mPoles.forEach(p => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(p.x, 4.5, p.z);
      parent.add(pole);

      const cross = new THREE.Mesh(crossGeo, crossMat);
      cross.position.set(p.x, 8.2, p.z);
      parent.add(cross);

      // Street lamp fixture
      const lamp = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.12, 0.38),
        new THREE.MeshLambertMaterial({ color: 0xffffee })
      );
      lamp.position.set(p.x, 8.35, p.z + 0.6);
      parent.add(lamp);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(p.x - 0.4, 0, p.z - 0.4),
        new THREE.Vector3(p.x + 0.4, 9.0, p.z + 0.4)
      ));
    });

    // Tangled overhead wires crisscrossing the market
    const mCablePairs = [
      [mPoles[0], mPoles[1]],
      [mPoles[1], mPoles[2]],
      [mPoles[2], mPoles[3]],
      [mPoles[0], mPoles[4]],
      [mPoles[1], mPoles[4]],
      [mPoles[2], mPoles[5]],
      [mPoles[3], mPoles[5]]
    ];

    mCablePairs.forEach(([p1, p2]) => {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(p1.x, 8.1, p1.z),
        new THREE.Vector3((p1.x + p2.x) / 2, 6.8, (p1.z + p2.z) / 2),
        new THREE.Vector3(p2.x, 8.1, p2.z)
      );
      const points = curve.getPoints(8);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), cableMat);
      parent.add(line);
    });

    // Green concrete roadside dustbins
    const binMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
    const binGeo = new THREE.CylinderGeometry(0.38, 0.32, 1.0, 8);
    for (let bCoord of [{ x: -38.5, z: 16 }, { x: -47.5, z: 0 }, { x: -38.5, z: 36 }]) {
      const bin = new THREE.Mesh(binGeo, binMat);
      bin.position.set(bCoord.x, 0.5, bCoord.z);
      parent.add(bin);
    }
  },

  // Grand Market Entrance Gateway Arch ("মাগুরা বড় বাজার প্রবেশদ্বার")
  createMarketGatewayArch: function(parent, x, z, rotY) {
    const archGroup = new THREE.Group();
    archGroup.position.set(x, 0, z);
    archGroup.rotation.y = rotY || 0;

    const span = 8.5;
    const height = 5.6;

    const brickMat = new THREE.MeshLambertMaterial({ color: 0xa83232 }); // Deep red brick
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xf5b700 });
    const steelMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });

    // Left and Right Arch Pillars
    for (let px of [-span / 2, span / 2]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, height, 1.2), brickMat);
      pillar.position.set(px, height / 2, 0);
      pillar.castShadow = true;
      archGroup.add(pillar);

      // Golden pyramid cap
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.8, 4), goldMat);
      cap.position.set(px, height + 0.4, 0);
      cap.rotation.y = Math.PI / 4;
      archGroup.add(cap);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(x + px - 0.7, 0, z - 0.7),
        new THREE.Vector3(x + px + 0.7, height + 1, z + 0.7)
      ));
    }

    // Overhead Steel Truss Beam
    const truss = new THREE.Mesh(new THREE.BoxGeometry(span + 0.4, 0.6, 0.8), steelMat);
    truss.position.set(0, height - 0.3, 0);
    archGroup.add(truss);

    // Decorative Signboard Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Royal Blue Background with Golden Border
    ctx.fillStyle = '#0c2340';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#f5b700';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    // Top subtitle
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffde59';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('।। ঐতিহ্যবাহী মাগুরা সদর ।।', 256, 32);

    // Main Bengali text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px sans-serif';
    ctx.fillText('মাগুরা বড় বাজার ও বাণিজ্যিক কেন্দ্র', 256, 74);

    // English text
    ctx.fillStyle = '#00ffcc';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('MAGURA BORO BAZAR • ESTD. 1952', 256, 108);

    const signTex = new THREE.CanvasTexture(canvas);
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(span - 0.6, 1.4, 0.15),
      new THREE.MeshLambertMaterial({ map: signTex })
    );
    signBoard.position.set(0, height + 0.4, 0);
    archGroup.add(signBoard);

    parent.add(archGroup);
  },

  // Central Haat / Open Market Space with covered produce stalls
  createOpenMarketHaatSquare: function(parent, x, z) {
    const haatGroup = new THREE.Group();
    haatGroup.position.set(x, 0, z);

    // 1. Raised Brick/Stone Paved Apron (16m x 14m)
    const apronMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createBrickPavementTexture()
    });
    apronMat.map.repeat.set(4, 4);

    const apron = new THREE.Mesh(new THREE.BoxGeometry(16, 0.15, 14), apronMat);
    apron.position.set(0, 0.075, 0);
    apron.receiveShadow = true;
    haatGroup.add(apron);

    // 2. Open-Air Shed Stalls with Slanted Corrugated Tin Roofs
    const tinMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createTinRoofTexture()
    });
    const bambooMat = new THREE.MeshLambertMaterial({ color: 0xa88f5d });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x543d2b });
    const blueTarpMat = new THREE.MeshLambertMaterial({ color: 0x0055b3 });
    const orangeTarpMat = new THREE.MeshLambertMaterial({ color: 0xd95a00 });

    // Shed 1: North Produce Stall (Z = -3.5)
    // Shed 2: South Produce Stall (Z = 3.5)
    for (let sz of [-3.5, 3.5]) {
      const shedW = 12.0;
      const shedD = 4.2;

      // Bamboo/Timber support posts
      const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6);
      for (let px of [-shedW / 2 + 0.8, 0, shedW / 2 - 0.8]) {
        for (let pz of [-shedD / 2 + 0.4, shedD / 2 - 0.4]) {
          const post = new THREE.Mesh(postGeo, bambooMat);
          post.position.set(px, 1.6, sz + pz);
          haatGroup.add(post);
        }
      }

      // Slanted Tin Gable Roof
      const r1 = new THREE.Mesh(new THREE.BoxGeometry(shedW + 0.6, 0.06, shedD * 0.6), tinMat);
      r1.position.set(0, 3.2, sz - shedD * 0.2);
      r1.rotation.x = 0.22;
      r1.castShadow = true;
      haatGroup.add(r1);

      const r2 = new THREE.Mesh(new THREE.BoxGeometry(shedW + 0.6, 0.06, shedD * 0.6), tinMat);
      r2.position.set(0, 3.2, sz + shedD * 0.2);
      r2.rotation.x = -0.22;
      r2.castShadow = true;
      haatGroup.add(r2);

      // Hanging Tarpaulins on side
      const tarp = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, 1.4),
        sz < 0 ? blueTarpMat : orangeTarpMat
      );
      tarp.position.set(-shedW / 2 + 2.5, 2.3, sz + shedD / 2);
      tarp.rotation.x = -0.15;
      haatGroup.add(tarp);

      // Wooden display bench platform (চৌকি)
      const bench = new THREE.Mesh(new THREE.BoxGeometry(shedW - 2, 0.65, 1.8), woodMat);
      bench.position.set(0, 0.45, sz);
      bench.castShadow = true;
      haatGroup.add(bench);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(x - shedW / 2 + 0.5, 0, z + sz - 1.1),
        new THREE.Vector3(x + shedW / 2 - 0.5, 1.8, z + sz + 1.1)
      ));
    }

    // 3. Produce Crates, Vegetable Stacks & Sacks of Grain
    const tomatoMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f }); // Red tomatoes
    const cabbageMat = new THREE.MeshLambertMaterial({ color: 0x43a047 }); // Green cabbages
    const pumpkinMat = new THREE.MeshLambertMaterial({ color: 0xf57c00 }); // Orange pumpkins
    const sackMat = new THREE.MeshLambertMaterial({ color: 0xc4a482 }); // Jute burlap sack
    const crateMat = new THREE.MeshLambertMaterial({ color: 0x795548 });

    // Wooden Produce Crates
    const crateGeo = new THREE.BoxGeometry(0.9, 0.4, 0.6);
    const produceList = [
      { x: -3.5, z: -3.5, mat: tomatoMat },
      { x: -2.3, z: -3.5, mat: cabbageMat },
      { x: 0, z: -3.5, mat: pumpkinMat },
      { x: 2.3, z: -3.5, mat: tomatoMat },
      { x: -3.5, z: 3.5, mat: cabbageMat },
      { x: -1.2, z: 3.5, mat: tomatoMat },
      { x: 1.2, z: 3.5, mat: pumpkinMat },
      { x: 3.5, z: 3.5, mat: cabbageMat }
    ];

    produceList.forEach(p => {
      const cr = new THREE.Mesh(crateGeo, crateMat);
      cr.position.set(p.x, 0.85, p.z);
      haatGroup.add(cr);

      const goods = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.5), p.mat);
      goods.position.set(p.x, 1.1, p.z);
      haatGroup.add(goods);
    });

    // Stacked Jute Sacks of Rice / Potatoes
    const sackGeo = new THREE.BoxGeometry(0.85, 0.45, 0.6);
    const sackCoords = [
      { x: 4.8, z: -3.5, y: 0.35, rot: 0.1 },
      { x: 4.8, z: -2.7, y: 0.35, rot: -0.1 },
      { x: 4.8, z: -3.1, y: 0.75, rot: 0.05 },
      { x: -5.2, z: 3.5, y: 0.35, rot: -0.15 },
      { x: -5.2, z: 2.7, y: 0.35, rot: 0.2 },
      { x: -5.2, z: 3.1, y: 0.75, rot: 0 }
    ];

    sackCoords.forEach(s => {
      const sack = new THREE.Mesh(sackGeo, sackMat);
      sack.position.set(s.x, s.y, s.z);
      sack.rotation.y = s.rot;
      haatGroup.add(sack);
    });

    parent.add(haatGroup);
  },

  // Outdoor Biryani Cauldrons (ডেকচি) & Seating outside Restaurant
  createRestaurantOutdoorSetup: function(parent, x, z) {
    const rGroup = new THREE.Group();
    rGroup.position.set(x, 0, z);

    const brassMat = new THREE.MeshPhongMaterial({ color: 0xd4af37, shininess: 80 }); // Brass cauldron
    const redClothMat = new THREE.MeshLambertMaterial({ color: 0xb71c1c }); // Traditional red cloth
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });

    // Brick cooking stove counter
    const stove = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 1.2), new THREE.MeshLambertMaterial({ color: 0x5a5550 }));
    stove.position.set(0, 0.35, 0);
    rGroup.add(stove);

    // 2 Giant Biryani Dekchis wrapped in festive red cloth
    for (let dx of [-0.6, 0.6]) {
      // Lower pot
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.5, 12), brassMat);
      pot.position.set(dx, 0.85, 0);
      rGroup.add(pot);

      // Red cloth tied around lid
      const cloth = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.22, 12), redClothMat);
      cloth.position.set(dx, 1.05, 0);
      rGroup.add(cloth);

      // Lid knob
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), brassMat);
      knob.position.set(dx, 1.2, 0);
      rGroup.add(knob);
    }

    // Outdoor wooden bench & table for diners
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.75, 0.8), woodMat);
    table.position.set(0, 0.375, -2.2);
    rGroup.add(table);

    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.35), woodMat);
    bench.position.set(0, 0.225, -2.8);
    rGroup.add(bench);

    parent.add(rGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.4, 0, z - 3.2),
      new THREE.Vector3(x + 1.4, 1.5, z + 0.8)
    ));
  },

  // Fruit Vendor Stall with pyramid fruit displays
  createFruitVendorStall: function(parent, x, z) {
    const fGroup = new THREE.Group();
    fGroup.position.set(x, 0, z);

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x6d4c41 });
    const greenMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 }); // Bananas / Green coconuts
    const yellowMat = new THREE.MeshLambertMaterial({ color: 0xfbc02d }); // Pineapples / Mangoes
    const redMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });    // Apples

    // Slanted wooden fruit display cart
    const cart = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 1.2), woodMat);
    cart.position.set(0, 0.4, 0);
    fGroup.add(cart);

    // Fruit pyramids on top
    const yellowStack = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.45, 6), yellowMat);
    yellowStack.position.set(-0.5, 0.95, 0);
    fGroup.add(yellowStack);

    const redStack = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.45, 6), redMat);
    redStack.position.set(0, 0.95, 0);
    fGroup.add(redStack);

    const greenStack = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.45, 6), greenMat);
    greenStack.position.set(0.5, 0.95, 0);
    fGroup.add(greenStack);

    // Fabric sun canopy
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.04, 1.5),
      new THREE.MeshLambertMaterial({ color: 0x00897b })
    );
    canopy.position.set(0, 2.1, 0);
    canopy.rotation.x = 0.15;
    fGroup.add(canopy);

    parent.add(fGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.2, 0, z - 0.8),
      new THREE.Vector3(x + 1.2, 2.2, z + 0.8)
    ));
  },

  // Paan / Betel Leaf & Cigarette Kiosk
  createPaanKiosk: function(parent, x, z) {
    const pGroup = new THREE.Group();
    pGroup.position.set(x, 0, z);

    const kioskMat = new THREE.MeshLambertMaterial({ color: 0x1565c0 });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });

    const booth = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 1.2), kioskMat);
    booth.position.set(0, 1.1, 0);
    pGroup.add(booth);

    // Serving shelf
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.5), woodMat);
    shelf.position.set(0, 1.0, 0.6);
    pGroup.add(shelf);

    // Kiosk Nameplate: "মাগুরা পান কর্নার"
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f5b700'; ctx.fillRect(0, 0, 128, 32);
    ctx.fillStyle = '#0c2340'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('মাগুরা পান কর্নার', 64, 20);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.3),
      new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(canvas) })
    );
    sign.position.set(0, 1.9, 0.61);
    pGroup.add(sign);

    parent.add(pGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.8, 0, z - 0.7),
      new THREE.Vector3(x + 0.8, 2.3, z + 0.7)
    ));
  },

  // Classic Bangladeshi Roadster Bicycle (Phoenix / Atlas style)
  createBicycle: function(parent, x, y, z, rotY) {
    const bike = new THREE.Group();
    bike.position.set(x, y, z);
    bike.rotation.y = rotY || 0;

    const frameMat = new THREE.MeshLambertMaterial({ color: 0x1a472a }); // Classic Dark Green
    const chromeMat = new THREE.MeshPhongMaterial({ color: 0xcccccc, shininess: 80 });
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.04, 12);

    // Front Wheel
    const fWheel = new THREE.Mesh(wheelGeo, tireMat);
    fWheel.rotation.z = Math.PI / 2;
    fWheel.position.set(0, 0.36, 0.65);
    bike.add(fWheel);

    // Rear Wheel
    const rWheel = new THREE.Mesh(wheelGeo, tireMat);
    rWheel.rotation.z = Math.PI / 2;
    rWheel.position.set(0, 0.36, -0.65);
    bike.add(rWheel);

    // Steel Frame Tube (Crossbar & Down tube)
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 1.1), frameMat);
    topBar.position.set(0, 0.72, 0);
    bike.add(topBar);

    const seatTube = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.04), frameMat);
    seatTube.position.set(0, 0.5, -0.2);
    bike.add(seatTube);

    // Saddle (Black leather)
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.24), tireMat);
    saddle.position.set(0, 0.76, -0.2);
    bike.add(saddle);

    // Rear Carrier Rack (ক্যারিয়ার)
    const carrier = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.45), chromeMat);
    carrier.position.set(0, 0.68, -0.55);
    bike.add(carrier);

    // Chrome Handlebars
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 0.03), chromeMat);
    handle.position.set(0, 0.88, 0.55);
    bike.add(handle);

    // Lean against kickstand
    bike.rotation.z = 0.15;

    parent.add(bike);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.35, y, z - 0.75),
      new THREE.Vector3(x + 0.35, y + 1.0, z + 0.75)
    ));
  },

  // ---------------------------------------------------------------------------
  // 14. MAGURA TOWN SQUARE & PUBLIC OPEN GROUND (মাগুরা টাউন স্কয়ার ও উন্মুক্ত মাঠ)
  // ---------------------------------------------------------------------------
  createTownSquare: function(parent) {
    const roadTex = TextureFactory.createRoadTexture();
    const brickTex = TextureFactory.createBrickPavementTexture();
    brickTex.repeat.set(4, 2);
    const swTex = TextureFactory.createSidewalkTexture();
    swTex.repeat.set(2, 8);
    const curbTex = TextureFactory.createCurbTexture();
    curbTex.repeat.set(10, 1);

    const roadMat = new THREE.MeshLambertMaterial({ map: roadTex });
    const brickMat = new THREE.MeshLambertMaterial({ map: brickTex });
    const swMat = new THREE.MeshLambertMaterial({ map: swTex });
    const curbMat = new THREE.MeshLambertMaterial({ map: curbTex });

    // ---------------------------------------------------------
    // 1. CONNECTING ROADS (Integrated into Magura Road Network)
    // ---------------------------------------------------------

    // A. Stadium Road East Extension (Runs along Z = 25 from X = 58 to 84, Length 26m, Width 9.5m)
    const stExt = new THREE.Mesh(new THREE.PlaneGeometry(26, 9.5), brickMat);
    stExt.rotation.x = -Math.PI / 2;
    stExt.position.set(71, 0.022, 25);
    stExt.receiveShadow = true;
    parent.add(stExt);

    // North & South curbs along Stadium Road Extension
    const stCurbN = new THREE.Mesh(new THREE.BoxGeometry(26, 0.24, 0.25), curbMat);
    stCurbN.position.set(71, 0.12, 20.25);
    parent.add(stCurbN);

    const stCurbS = new THREE.Mesh(new THREE.BoxGeometry(26, 0.24, 0.25), curbMat);
    stCurbS.position.set(71, 0.12, 29.75);
    parent.add(stCurbS);

    // North sidewalk along Stadium Road Extension
    const stSwN = new THREE.Mesh(new THREE.BoxGeometry(26, 0.2, 1.8), swMat);
    stSwN.position.set(71, 0.1, 19.2);
    parent.add(stSwN);

    // B. Canal East Road Extension (Runs along Z = 65 from X = 44 to 70, Length 26m, Width 7.5m)
    const canalExt = new THREE.Mesh(new THREE.PlaneGeometry(26, 7.5), roadMat);
    canalExt.rotation.x = -Math.PI / 2;
    canalExt.position.set(57, 0.022, 65);
    canalExt.receiveShadow = true;
    parent.add(canalExt);

    // North & South curbs along Canal East Road Extension
    const cExtCurbN = new THREE.Mesh(new THREE.BoxGeometry(26, 0.24, 0.25), curbMat);
    cExtCurbN.position.set(57, 0.12, 61.25);
    parent.add(cExtCurbN);

    const cExtCurbS = new THREE.Mesh(new THREE.BoxGeometry(26, 0.24, 0.25), curbMat);
    cExtCurbS.position.set(57, 0.12, 68.75);
    parent.add(cExtCurbS);

    // C. Town Hall Avenue / West Flank Boulevard (Runs North-South along X = 44 from Z = 25 to 65, Length 40m, Width 8.0m)
    const townAve = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 40), roadMat);
    townAve.rotation.x = -Math.PI / 2;
    townAve.position.set(44, 0.022, 45);
    townAve.receiveShadow = true;
    parent.add(townAve);

    // Curbs along Town Hall Avenue
    const taCurbW = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 40), curbMat);
    taCurbW.position.set(39.9, 0.12, 45);
    parent.add(taCurbW);

    const taCurbE = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 40), curbMat);
    taCurbE.position.set(48.1, 0.12, 45);
    parent.add(taCurbE);

    // West Sidewalk along Town Hall Avenue
    const taSwW = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 40), swMat);
    taSwW.position.set(38.8, 0.1, 45);
    parent.add(taSwW);

    // D. East Flanking Suburb Alley (Runs North-South along X = 82 from Z = 25 to 65, Length 40m, Width 6.5m)
    const eastFlank = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 40), brickMat);
    eastFlank.rotation.x = -Math.PI / 2;
    eastFlank.position.set(82, 0.022, 45);
    eastFlank.receiveShadow = true;
    parent.add(eastFlank);

    // Curbs along East Flanking Alley
    const efCurbW = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 40), curbMat);
    efCurbW.position.set(78.65, 0.12, 45);
    parent.add(efCurbW);

    const efCurbE = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 40), curbMat);
    efCurbE.position.set(85.35, 0.12, 45);
    parent.add(efCurbE);

    // E. Police Lines East Sally Port Connector (Runs Z: 14 to 25 along X = 53.5, Length 11m, Width 5.0m)
    const sallyLink = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 11), brickMat);
    sallyLink.rotation.x = -Math.PI / 2;
    sallyLink.position.set(53.5, 0.022, 19.5);
    sallyLink.receiveShadow = true;
    parent.add(sallyLink);

    // ---------------------------------------------------------
    // 2. LARGE CENTRAL PUBLIC OPEN GROUND (টাউন স্কয়ার ও উন্মুক্ত মাঠ)
    // ---------------------------------------------------------
    // Dimensions: Width 26m (X: 50 to 76), Depth 22m (Z: 37 to 59), Center at X = 63, Z = 48
    const lawnMat = new THREE.MeshLambertMaterial({ color: 0x476a3b }); // Lush public park lawn
    const openGround = new THREE.Mesh(new THREE.PlaneGeometry(26, 22), lawnMat);
    openGround.rotation.x = -Math.PI / 2;
    openGround.position.set(63, 0.024, 48);
    openGround.receiveShadow = true;
    parent.add(openGround);

    // Central decorative paved flagstone cross-path through the open ground
    const pathMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createBrickPavementTexture()
    });
    pathMat.map.repeat.set(2, 6);

    // North-South central promenade path (Width 2.4m, Length 22m)
    const nsPath = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 22), pathMat);
    nsPath.rotation.x = -Math.PI / 2;
    nsPath.position.set(63, 0.026, 48);
    nsPath.receiveShadow = true;
    parent.add(nsPath);

    // East-West central bisecting path (Width 2.2m, Length 26m)
    const ewPath = new THREE.Mesh(new THREE.PlaneGeometry(26, 2.2), pathMat);
    ewPath.rotation.x = -Math.PI / 2;
    ewPath.position.set(63, 0.026, 48);
    ewPath.receiveShadow = true;
    parent.add(ewPath);

    // ---------------------------------------------------------
    // 3. PAVED WALKING PROMENADE ENCIRCLING THE SQUARE
    // ---------------------------------------------------------
    // Promenade width: 3.0m, slightly raised (Y = 0.08m) with granite curbing
    const pWalkMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createSidewalkTexture()
    });
    pWalkMat.map.repeat.set(2, 10);

    // North Promenade: X: 47 to 79 (Length 32m, Depth 3.0m, centered at Z = 35.5)
    const promN = new THREE.Mesh(new THREE.BoxGeometry(32, 0.12, 3.0), pWalkMat);
    promN.position.set(63, 0.06, 35.5);
    promN.receiveShadow = true;
    parent.add(promN);

    // South Promenade: X: 47 to 79 (Length 32m, Depth 3.0m, centered at Z = 60.5)
    const promS = new THREE.Mesh(new THREE.BoxGeometry(32, 0.12, 3.0), pWalkMat);
    promS.position.set(63, 0.06, 60.5);
    promS.receiveShadow = true;
    parent.add(promS);

    // West Promenade: Z: 37 to 59 (Width 3.0m, Length 22m, centered at X = 48.5)
    const promW = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.12, 22), pWalkMat);
    promW.position.set(48.5, 0.06, 48);
    promW.receiveShadow = true;
    parent.add(promW);

    // East Promenade: Z: 37 to 59 (Width 3.0m, Length 22m, centered at X = 77.5)
    const promE = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.12, 22), pWalkMat);
    promE.position.set(77.5, 0.06, 48);
    promE.receiveShadow = true;
    parent.add(promE);

    // Decorative inner curb bordering the green lawn
    const innerCurbMat = new THREE.MeshLambertMaterial({ color: 0x9e9e9e });
    const icN = new THREE.Mesh(new THREE.BoxGeometry(26, 0.16, 0.2), innerCurbMat); icN.position.set(63, 0.08, 37.1); parent.add(icN);
    const icS = new THREE.Mesh(new THREE.BoxGeometry(26, 0.16, 0.2), innerCurbMat); icS.position.set(63, 0.08, 58.9); parent.add(icS);
    const icW = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 22), innerCurbMat); icW.position.set(50.1, 0.08, 48); parent.add(icW);
    const icE = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 22), innerCurbMat); icE.position.set(75.9, 0.08, 48); parent.add(icE);

    // ---------------------------------------------------------
    // 4. SHAHEED MINAR & MUKTOMONCHO OPEN-AIR STAGE (শহীদ মিনার ও মুক্তমঞ্চ)
    // ---------------------------------------------------------
    // Serves as an iconic cultural landmark & elevated tactical combat position
    this.createMuktomonchoStage(parent, 63, 40.5);

    // ---------------------------------------------------------
    // 5. LANDSCAPED CORNER PLANTERS & NATURE PATCHES
    // ---------------------------------------------------------
    // 4 raised brick planter boxes (0.65m height - ideal waist-high crouch cover)
    this.createLandscapedPlanter(parent, 52.5, 39.5); // Northwest corner
    this.createLandscapedPlanter(parent, 73.5, 39.5); // Northeast corner
    this.createLandscapedPlanter(parent, 52.5, 56.5); // Southwest corner
    this.createLandscapedPlanter(parent, 73.5, 56.5); // Southeast corner

    // ---------------------------------------------------------
    // 6. STATELY SHADE TREES & PALMS
    // ---------------------------------------------------------
    // Large neem shade trees around outer promenade corners
    this.createShadeTree(parent, 48.0, 35.0);
    this.createShadeTree(parent, 78.0, 35.0);
    this.createShadeTree(parent, 48.0, 61.0);
    this.createShadeTree(parent, 78.0, 61.0);

    // Coconut palms along southern canal road verge
    this.createCoconutPalm(parent, 52.0, 67.5);
    this.createCoconutPalm(parent, 72.0, 67.5);

    // ---------------------------------------------------------
    // 7. PARK BENCHES
    // ---------------------------------------------------------
    // Benches placed along the perimeter walking promenade (waist-height cover)
    this.createTownSquareBench(parent, 57.0, 35.5, 0);           // North walkway facing South
    this.createTownSquareBench(parent, 69.0, 35.5, 0);           // North walkway facing South
    this.createTownSquareBench(parent, 57.0, 60.5, Math.PI);     // South walkway facing North
    this.createTownSquareBench(parent, 69.0, 60.5, Math.PI);     // South walkway facing North
    this.createTownSquareBench(parent, 48.5, 48.0, Math.PI / 2); // West walkway facing East
    this.createTownSquareBench(parent, 77.5, 48.0, -Math.PI / 2);// East walkway facing West

    // ---------------------------------------------------------
    // 8. DECORATIVE TOWN SQUARE STREET LAMPS
    // ---------------------------------------------------------
    // Dual-globe cast-iron luminaires along the promenade
    this.createTownSquareStreetLamp(parent, 58.0, 34.3);
    this.createTownSquareStreetLamp(parent, 68.0, 34.3);
    this.createTownSquareStreetLamp(parent, 58.0, 61.7);
    this.createTownSquareStreetLamp(parent, 68.0, 61.7);
    this.createTownSquareStreetLamp(parent, 47.3, 48.0);
    this.createTownSquareStreetLamp(parent, 78.7, 48.0);

    // ---------------------------------------------------------
    // 9. ROADSIDE TEA & SNACK STALL ("মামার চায়ের টং")
    // ---------------------------------------------------------
    // Located at Northwest entrance junction (X = 42.0, Z = 33.5)
    this.createTownSquareTeaStall(parent, 42.0, 33.5, 0);

    // ---------------------------------------------------------
    // 10. PARKED MOTORCYCLES & BICYCLES
    // ---------------------------------------------------------
    // Motorcycle 1: Commuter bike parked along curb near tea stall
    this.createMotorbike(parent, 45.0, 0.02, 29.5, Math.PI * 0.45);

    // Motorcycle 2: Commuter bike parked along East Flank alley near Town Hall
    this.createMotorbike(parent, 80.5, 0.02, 42.0, -Math.PI * 0.3);

    // Bicycle 1: Traditional roadster bicycle leaning against tea stall curb
    this.createBicycle(parent, 41.5, 0.02, 36.5, Math.PI * 0.8);

    // Bicycle 2: Roadster bicycle parked near southern promenade entrance
    this.createBicycle(parent, 65.0, 0.02, 63.5, -Math.PI * 0.1);

    // ---------------------------------------------------------
    // 11. SURROUNDING LOW-RISE TOWN BUILDINGS
    // ---------------------------------------------------------
    // A. Magura Town Community Hall & Library ("মাগুরা টাউন হল ও গণগ্রন্থাগার")
    // Sited on East side: X = 90, Z = 42 (Width 10m, Depth 16m, 2 floors)
    this.createTownHallBuilding(parent, 90, 42);

    // B. Magura Model Pharmacy & General Store ("মাগুরা মডেল ফার্মেসি")
    // Sited on North edge along Stadium Road: X = 62, Z = 15 (Width 11m, Depth 7m, 2 floors)
    this.createBangladeshiBuilding(parent, {
      x: 62, z: 15, w: 11, d: 7, floors: 2, color: '#e0dcd3',
      shopName: 'মাগুরা মডেল ফার্মেসি', shopSub: 'ঔষধ, সার্জিক্যাল ও শিশুখাদ্য', phone: '০২৪৭৭-৭৩২৩৪৫', theme: 'green', shutterOpen: true
    });

    // C. Bonoful Sweets & Confectionery ("বনফুল সুইটস অ্যান্ড ক্যাফে")
    // Sited on North-East edge along Stadium Road: X = 76, Z = 15 (Width 11m, Depth 7m, 2 floors)
    this.createBangladeshiBuilding(parent, {
      x: 76, z: 15, w: 11, d: 7, floors: 2, color: '#e8dec8',
      shopName: 'বনফুল সুইটস অ্যান্ড ক্যাফে', shopSub: 'ঘরোয়া মিষ্টি, দই, চা ও সমুচা', phone: '০১৭৫২-৯৯১১২২', theme: 'red', shutterOpen: true
    });

    // D. Magura Youth Sporting Club ("মাগুরা তরুণ ক্রীড়া সংসদ")
    // Sited on East edge along East Flank alley: X = 90, Z = 58 (Width 10m, Depth 10m, 1 floor)
    this.createBangladeshiBuilding(parent, {
      x: 90, z: 58, w: 10, d: 10, floors: 1, color: '#cbd5e1',
      shopName: 'মাগুরা স্পোর্টিং ক্লাব', shopSub: 'জেলা ক্রীড়া সংস্থা অধিভুক্ত', phone: '০১৭৮৮-৬৬৭৭৮৮', theme: 'blue', shutterOpen: false
    });

    // ---------------------------------------------------------
    // 12. TACTICAL COMBAT COVER ELEMENTS
    // ---------------------------------------------------------
    // A. Concrete Electrical Transformer Kiosk (Full-height cover)
    this.createTransformerKiosk(parent, 46.5, 42.0);

    // B. Stacked Wooden Municipal Supply Crates
    this.createSupplyCrates(parent, 40.5, 30.5);
    this.createSupplyCrates(parent, 80.5, 54.0);

    // C. Concrete Public Waste Bins
    this.createPublicWasteBin(parent, 49.5, 35.5);
    this.createPublicWasteBin(parent, 76.5, 60.5);

    // D. Low Brick Garden Boundary Wall in front of Town Hall (X = 84.5, Z = 37 to 47)
    this.createLowGardenWall(parent, 84.5, 37.5, 0.4, 6.0);
    this.createLowGardenWall(parent, 84.5, 46.5, 0.4, 6.0);

    // Directional signpost at Stadium Road pointing to Town Square
    this.createDirectionalSignpost(parent, 56.5, 29.5, 'মাগুরা টাউন স্কয়ার ➔ • TOWN SQUARE', '#1b4332');
  },

  // Shaheed Minar & Muktomoncho Open-Air Stage Platform (শহীদ মিনার ও মুক্তমঞ্চ)
  createMuktomonchoStage: function(parent, x, z) {
    const stageGroup = new THREE.Group();
    stageGroup.position.set(x, 0, z);

    const daisMat = new THREE.MeshLambertMaterial({ color: 0xeae6dc }); // Polished terrazzo/marble
    const brickMat = new THREE.MeshLambertMaterial({ color: 0xb85d38 }); // Terracotta brick
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });// Whitewashed monument pillars
    const redMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });   // Crimson red sun disc

    const sWidth = 8.5;
    const sDepth = 4.6;
    const sHeight = 0.45;

    // Main Stage Platform (Elevated dais)
    const dais = new THREE.Mesh(new THREE.BoxGeometry(sWidth, sHeight, sDepth), daisMat);
    dais.position.y = sHeight / 2;
    dais.receiveShadow = true;
    dais.castShadow = true;
    stageGroup.add(dais);

    // Front access steps (South facing toward open ground)
    const step = new THREE.Mesh(new THREE.BoxGeometry(sWidth * 0.8, sHeight / 2, 0.8), daisMat);
    step.position.set(0, sHeight / 4, sDepth / 2 + 0.4);
    step.receiveShadow = true;
    stageGroup.add(step);

    // Tactical Side Parapet Walls (Waist-height brick parapets for combat cover!)
    // West wing wall
    const wWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.85, sDepth - 0.4), brickMat);
    wWall.position.set(-sWidth / 2 + 0.175, sHeight + 0.425, -0.2);
    wWall.castShadow = true;
    stageGroup.add(wWall);

    // East wing wall
    const eWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.85, sDepth - 0.4), brickMat);
    eWall.position.set(sWidth / 2 - 0.175, sHeight + 0.425, -0.2);
    eWall.castShadow = true;
    stageGroup.add(eWall);

    // ---------------------------------------------------------
    // Iconic Shaheed Minar Architectural Centerpiece (Rear of stage)
    // ---------------------------------------------------------
    const monZ = -sDepth / 2 + 0.35;

    // Center tall vertical pillar (Angled forward slightly)
    const centerPillar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.2, 0.25), pillarMat);
    centerPillar.position.set(0, sHeight + 2.1, monZ);
    centerPillar.rotation.x = 0.08;
    centerPillar.castShadow = true;
    stageGroup.add(centerPillar);

    // Flanking left vertical pillar
    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.2, 0.22), pillarMat);
    leftPillar.position.set(-1.4, sHeight + 1.6, monZ);
    leftPillar.rotation.x = 0.08;
    leftPillar.castShadow = true;
    stageGroup.add(leftPillar);

    // Flanking right vertical pillar
    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.2, 0.22), pillarMat);
    rightPillar.position.set(1.4, sHeight + 1.6, monZ);
    rightPillar.rotation.x = 0.08;
    rightPillar.castShadow = true;
    stageGroup.add(rightPillar);

    // Radiant Red Solar Disc (Iconic symbol of the language martyrs)
    const sunDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 24), redMat);
    sunDisc.position.set(0, sHeight + 2.2, monZ - 0.15);
    sunDisc.rotation.x = Math.PI / 2;
    stageGroup.add(sunDisc);

    // Monument Plaque
    const plaqueMat = new THREE.MeshLambertMaterial({ color: 0x1a3b2b });
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 0.05), plaqueMat);
    plaque.position.set(0, sHeight + 0.2, monZ + 0.16);
    stageGroup.add(plaque);

    parent.add(stageGroup);

    // Colliders for stage dais and tactical side walls
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - sWidth / 2, 0, z - sDepth / 2),
      new THREE.Vector3(x + sWidth / 2, sHeight, z + sDepth / 2 + 0.8)
    ));
    // West parapet wall collider
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - sWidth / 2 - 0.2, 0, z - sDepth / 2),
      new THREE.Vector3(x - sWidth / 2 + 0.5, sHeight + 1.2, z + sDepth / 2)
    ));
    // East parapet wall collider
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x + sWidth / 2 - 0.5, 0, z - sDepth / 2),
      new THREE.Vector3(x + sWidth / 2 + 0.2, sHeight + 1.2, z + sDepth / 2)
    ));
    // Rear monument pillars collider
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 2.0, 0, z - sDepth / 2 - 0.3),
      new THREE.Vector3(x + 2.0, sHeight + 4.5, z - sDepth / 2 + 0.6)
    ));
  },

  // Landscaped Corner Planter Box (Waist-high crouch cover with flower clumps)
  createLandscapedPlanter: function(parent, x, z) {
    const pGroup = new THREE.Group();
    pGroup.position.set(x, 0, z);

    const pSize = 3.6;
    const pHeight = 0.65;
    const wallThick = 0.25;

    const brickMat = new THREE.MeshLambertMaterial({ color: 0xb85d38 });
    const soilMat = new THREE.MeshLambertMaterial({ color: 0x3d3228 });

    // 4 brick border walls
    const wN = new THREE.Mesh(new THREE.BoxGeometry(pSize, pHeight, wallThick), brickMat);
    wN.position.set(0, pHeight / 2, -pSize / 2 + wallThick / 2);
    pGroup.add(wN);

    const wS = new THREE.Mesh(new THREE.BoxGeometry(pSize, pHeight, wallThick), brickMat);
    wS.position.set(0, pHeight / 2, pSize / 2 - wallThick / 2);
    pGroup.add(wS);

    const wW = new THREE.Mesh(new THREE.BoxGeometry(wallThick, pHeight, pSize - wallThick * 2), brickMat);
    wW.position.set(-pSize / 2 + wallThick / 2, pHeight / 2, 0);
    pGroup.add(wW);

    const wE = new THREE.Mesh(new THREE.BoxGeometry(wallThick, pHeight, pSize - wallThick * 2), brickMat);
    wE.position.set(pSize / 2 - wallThick / 2, pHeight / 2, 0);
    pGroup.add(wE);

    // Soil bed inside planter
    const soil = new THREE.Mesh(new THREE.BoxGeometry(pSize - wallThick * 2, 0.1, pSize - wallThick * 2), soilMat);
    soil.position.set(0, pHeight - 0.1, 0);
    pGroup.add(soil);

    // Shrub / Flower Clumps inside planter
    const shrubMat = new THREE.MeshLambertMaterial({ color: 0x2e6b2c });
    const flowerMats = [
      new THREE.MeshLambertMaterial({ color: 0xd93829 }), // Red marigolds
      new THREE.MeshLambertMaterial({ color: 0xf5b700 }), // Yellow sunflowers
      new THREE.MeshLambertMaterial({ color: 0x8e24aa })  // Purple petunias
    ];

    const plantCoords = [
      { x: -0.7, z: -0.7, r: 0.35, m: flowerMats[0] },
      { x: 0.7, z: -0.7, r: 0.32, m: flowerMats[1] },
      { x: -0.7, z: 0.7, r: 0.34, m: flowerMats[2] },
      { x: 0.7, z: 0.7, r: 0.36, m: flowerMats[0] },
      { x: 0, z: 0, r: 0.45, m: shrubMat }
    ];

    plantCoords.forEach(pc => {
      const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(pc.r, 1), pc.m);
      bush.position.set(pc.x, pHeight + pc.r * 0.7, pc.z);
      bush.castShadow = true;
      pGroup.add(bush);
    });

    parent.add(pGroup);

    // Collider for entire planter box
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - pSize / 2, 0, z - pSize / 2),
      new THREE.Vector3(x + pSize / 2, pHeight + 0.6, z + pSize / 2)
    ));
  },

  // Park Bench (Cast-iron frame + teak wood slats, provides waist-height cover)
  createTownSquareBench: function(parent, x, z, rotY) {
    const benchGroup = new THREE.Group();
    benchGroup.position.set(x, 0.08, z);
    benchGroup.rotation.y = rotY || 0;

    const ironMat = new THREE.MeshLambertMaterial({ color: 0x212529 }); // Dark iron
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x8a5229 }); // Warm teak wood

    const bLength = 1.8;
    const bDepth = 0.55;
    const bHeight = 0.45;

    // Two cast-iron side support legs
    for (let lx of [-bLength / 2 + 0.15, bLength / 2 - 0.15]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, bHeight, bDepth), ironMat);
      leg.position.set(lx, bHeight / 2, 0);
      leg.castShadow = true;
      benchGroup.add(leg);

      // Backrest vertical support
      const backSupport = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.45, 0.05), ironMat);
      backSupport.position.set(lx, bHeight + 0.2, -bDepth / 2 + 0.05);
      benchGroup.add(backSupport);
    }

    // Teak wood seating slats (3 slats)
    for (let i = 0; i < 3; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(bLength, 0.04, 0.12), woodMat);
      slat.position.set(0, bHeight, -bDepth / 2 + 0.1 + i * 0.16);
      slat.castShadow = true;
      benchGroup.add(slat);
    }

    // Teak wood backrest slats (2 slats)
    for (let j = 0; j < 2; j++) {
      const bSlat = new THREE.Mesh(new THREE.BoxGeometry(bLength, 0.12, 0.04), woodMat);
      bSlat.position.set(0, bHeight + 0.18 + j * 0.16, -bDepth / 2 + 0.05);
      bSlat.castShadow = true;
      benchGroup.add(bSlat);
    }

    parent.add(benchGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.0, 0, z - 0.5),
      new THREE.Vector3(x + 1.0, 0.9, z + 0.5)
    ));
  },

  // Decorative Town Square Street Lamp (Dual-globe cast iron luminaire)
  createTownSquareStreetLamp: function(parent, x, z) {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(x, 0.08, z);

    const ironMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
    const globeMat = new THREE.MeshBasicMaterial({ color: 0xfffae6 }); // Warm luminaire glow

    const postHeight = 4.2;

    // Base pedestal
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.5, 8), ironMat);
    base.position.y = 0.25;
    lampGroup.add(base);

    // Main fluted vertical pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, postHeight, 8), ironMat);
    pole.position.y = postHeight / 2;
    pole.castShadow = true;
    lampGroup.add(pole);

    // Decorative top finial
    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 6), ironMat);
    finial.position.y = postHeight + 0.2;
    lampGroup.add(finial);

    // Curved dual horizontal swan-neck bracket arms
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.06), ironMat);
    arm.position.y = postHeight - 0.25;
    lampGroup.add(arm);

    // Two hanging spherical luminaire globes
    for (let gx of [-0.65, 0.65]) {
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.12, 8), ironMat);
      cap.position.set(gx, postHeight - 0.18, 0);
      lampGroup.add(cap);

      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), globeMat);
      globe.position.set(gx, postHeight - 0.36, 0);
      lampGroup.add(globe);
    }

    parent.add(lampGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.35, 0, z - 0.35),
      new THREE.Vector3(x + 0.35, postHeight + 0.5, z + 0.35)
    ));
  },

  // Roadside Tea & Snack Stall ("মামার চায়ের টং")
  createTownSquareTeaStall: function(parent, x, z, rotY) {
    const stall = new THREE.Group();
    stall.position.set(x, 0, z);
    stall.rotation.y = rotY || 0;

    const sW = 3.6;
    const sD = 2.6;
    const sH = 2.6;

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5a4231 }); // Weathered wood
    const tinMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createTinRoofTexture()
    });
    const benchWoodMat = new THREE.MeshLambertMaterial({ color: 0x7c5339 });

    // 4 Corner Timber Posts
    const postGeo = new THREE.CylinderGeometry(0.07, 0.07, sH, 6);
    for (let px of [-sW / 2 + 0.15, sW / 2 - 0.15]) {
      for (let pz of [-sD / 2 + 0.15, sD / 2 - 0.15]) {
        const post = new THREE.Mesh(postGeo, woodMat);
        post.position.set(px, sH / 2, pz);
        post.castShadow = true;
        stall.add(post);
      }
    }

    // Rear wall (wooden planking)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(sW, sH - 0.4, 0.08), woodMat);
    backWall.position.set(0, (sH - 0.4) / 2, -sD / 2 + 0.1);
    backWall.castShadow = true;
    stall.add(backWall);

    // Left side wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, sH - 0.4, sD), woodMat);
    leftWall.position.set(-sW / 2 + 0.1, (sH - 0.4) / 2, 0);
    leftWall.castShadow = true;
    stall.add(leftWall);

    // Front Wooden Service Counter (Waist-height, perfect cover!)
    const counterH = 0.85;
    const counter = new THREE.Mesh(new THREE.BoxGeometry(sW - 0.3, counterH, 0.6), woodMat);
    counter.position.set(0, counterH / 2, sD / 2 - 0.3);
    counter.castShadow = true;
    stall.add(counter);

    // Countertop plank
    const cTop = new THREE.Mesh(new THREE.BoxGeometry(sW, 0.06, 0.75), benchWoodMat);
    cTop.position.set(0, counterH, sD / 2 - 0.3);
    stall.add(cTop);

    // Slanted Corrugated Tin Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(sW + 0.6, 0.08, sD + 0.8), tinMat);
    roof.position.set(0, sH + 0.15, 0);
    roof.rotation.x = 0.12; // Slanted towards front
    roof.castShadow = true;
    stall.add(roof);

    // Tea Stall Kettle (Brass) on stove
    const brassMat = new THREE.MeshPhongMaterial({ color: 0xd4af37, shininess: 80 });
    const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.35, 8), brassMat);
    kettle.position.set(-0.7, counterH + 0.2, sD / 2 - 0.3);
    stall.add(kettle);

    // Glass Biscuit & Chanachur Jars on counter
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x88ccdd, transparent: true, opacity: 0.65 });
    for (let jx of [0.4, 0.85]) {
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.32, 8), glassMat);
      jar.position.set(jx, counterH + 0.18, sD / 2 - 0.3);
      stall.add(jar);
    }

    // Bunch of ripe yellow bananas hanging from roof truss
    const bananaMat = new THREE.MeshLambertMaterial({ color: 0xf5b700 });
    const bananas = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), bananaMat);
    bananas.position.set(-0.2, sH - 0.3, sD / 2 - 0.3);
    stall.add(bananas);

    // Patron wooden bench in front of the counter
    const patronBench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.42, 0.35), benchWoodMat);
    patronBench.position.set(0, 0.21, sD / 2 + 0.6);
    patronBench.castShadow = true;
    stall.add(patronBench);

    // Hand-painted Bengali Signboard above stall
    const signTex = TextureFactory.createBengaliSignTexture('মামার চায়ের টং', 'স্পেশাল দুধ চা, গরম সমুচা ও বিস্কুট', '০১৯১১-২২৩৩৪৪', 'red');
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 0.65),
      new THREE.MeshLambertMaterial({ map: signTex })
    );
    sign.position.set(0, sH - 0.1, sD / 2 + 0.05);
    stall.add(sign);

    parent.add(stall);

    // Colliders for stall and front patron bench
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - sW / 2, 0, z - sD / 2),
      new THREE.Vector3(x + sW / 2, sH + 0.5, z + sD / 2 + 0.1)
    ));
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.3, 0, z + sD / 2 + 0.4),
      new THREE.Vector3(x + 1.3, 0.5, z + sD / 2 + 0.8)
    ));
  },

  // Magura Town Community Hall & Library Building ("মাগুরা টাউন হল ও গণগ্রন্থাগার")
  createTownHallBuilding: function(parent, x, z) {
    const bGroup = new THREE.Group();
    bGroup.position.set(x, 0, z);

    const bWidth = 10;
    const bDepth = 16;
    const bHeight = 7.2;

    const facadeTex = TextureFactory.createBuildingFacadeTexture('#f5f5f7', 4, 2);
    const wallMat = new THREE.MeshLambertMaterial({ map: facadeTex });
    const navyMat = new THREE.MeshLambertMaterial({ color: 0x16447e });
    const greenMat = new THREE.MeshLambertMaterial({ color: 0x1b4332 });

    // Main building block
    const body = new THREE.Mesh(new THREE.BoxGeometry(bWidth, bHeight, bDepth), wallMat);
    body.position.y = bHeight / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    bGroup.add(body);

    // Deep Green Base Skirting
    const base = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.1, 0.6, bDepth + 0.1), greenMat);
    base.position.y = 0.3;
    bGroup.add(base);

    // West-facing Entrance Portico (Facing the town square)
    const porticoMat = new THREE.MeshLambertMaterial({ color: 0xededed });
    const porticoRoof = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.4, 5.0), porticoMat);
    porticoRoof.position.set(-bWidth / 2 - 1.5, 3.8, 0);
    porticoRoof.castShadow = true;
    bGroup.add(porticoRoof);

    // Two square portico entrance pillars
    const colGeo = new THREE.BoxGeometry(0.4, 3.8, 0.4);
    for (let cz of [-2.0, 2.0]) {
      const col = new THREE.Mesh(colGeo, navyMat);
      col.position.set(-bWidth / 2 - 2.8, 1.9, cz);
      col.castShadow = true;
      bGroup.add(col);
    }

    // Double glass entrance door under portico
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 2.6),
      new THREE.MeshLambertMaterial({ color: 0x1e293b })
    );
    door.position.set(-bWidth / 2 - 0.02, 1.3, 0);
    door.rotation.y = -Math.PI / 2;
    bGroup.add(door);

    // Town Hall Signboard above portico
    const signTex = this.createPoliceSignTexture('MAGURA TOWN HALL', 'মাগুরা টাউন হল ও গণগ্রন্থাগার • পৌরসভা');
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 0.9),
      new THREE.MeshLambertMaterial({ map: signTex })
    );
    sign.position.set(-bWidth / 2 - 0.06, 4.6, 0);
    sign.rotation.y = -Math.PI / 2;
    bGroup.add(sign);

    // Rooftop parapet & balustrade
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.2, 0.5, bDepth + 0.2), greenMat);
    parapet.position.y = bHeight + 0.25;
    bGroup.add(parapet);

    parent.add(bGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - bWidth / 2 - 0.4, 0, z - bDepth / 2 - 0.4),
      new THREE.Vector3(x + bWidth / 2 + 0.4, bHeight + 1.5, z + bDepth / 2 + 0.4)
    ));
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - bWidth / 2 - 3.0, 0, z - 2.4),
      new THREE.Vector3(x - bWidth / 2 - 2.5, 4.0, z + 2.4)
    ));
  },

  // Concrete Electrical Transformer Kiosk (Full-height combat cover)
  createTransformerKiosk: function(parent, x, z) {
    const kGroup = new THREE.Group();
    kGroup.position.set(x, 0, z);

    const concreteMat = new THREE.MeshLambertMaterial({ color: 0x78716c });
    const greenSteelMat = new THREE.MeshLambertMaterial({ color: 0x2d5a27 }); // Substation green
    const redMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });

    // Concrete Plinth Plaque
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 1.1), concreteMat);
    plinth.position.y = 0.175;
    kGroup.add(plinth);

    // Steel Transformer Cabinet
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.9), greenSteelMat);
    cabinet.position.y = 0.35 + 0.75;
    cabinet.castShadow = true;
    kGroup.add(cabinet);

    // Warning Signboard ("বিপদ • DANGER 11000 VOLTS")
    const dangerSign = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), redMat);
    dangerSign.position.set(0, 1.2, 0.46);
    kGroup.add(dangerSign);

    parent.add(kGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.75, 0, z - 0.6),
      new THREE.Vector3(x + 0.75, 1.9, z + 0.6)
    ));
  },

  // Cylindrical Concrete Public Waste Bin
  createPublicWasteBin: function(parent, x, z) {
    const binMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.85, 10), binMat);
    bin.position.set(x, 0.08 + 0.425, z);
    bin.castShadow = true;
    parent.add(bin);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.35, 0, z - 0.35),
      new THREE.Vector3(x + 0.35, 0.95, z + 0.35)
    ));
  },

  // ---------------------------------------------------------------------------
  // 15. NABAGANGA RIVERSIDE & BOAT GHAT TRANSPORT AREA (নবগঙ্গা রিভার ঘাট ও নৌ-পরিবহন)
  // ---------------------------------------------------------------------------
  createRiversideTransportArea: function(parent) {
    const roadTex = TextureFactory.createRoadTexture();
    const brickTex = TextureFactory.createBrickPavementTexture();
    brickTex.repeat.set(4, 2);
    const swTex = TextureFactory.createSidewalkTexture();
    swTex.repeat.set(2, 8);
    const curbTex = TextureFactory.createCurbTexture();
    curbTex.repeat.set(10, 1);
    const soilTex = TextureFactory.createCourtyardSoilTexture();
    soilTex.repeat.set(6, 2);

    const roadMat = new THREE.MeshLambertMaterial({ map: roadTex });
    const brickMat = new THREE.MeshLambertMaterial({ map: brickTex });
    const swMat = new THREE.MeshLambertMaterial({ map: swTex });
    const curbMat = new THREE.MeshLambertMaterial({ map: curbTex });
    const dirtMat = new THREE.MeshLambertMaterial({ map: soilTex, color: 0x5a4a3a });

    // ---------------------------------------------------------
    // 1. CONNECTED ROADS LEADING INTO MAGURA TOWN NETWORK
    // ---------------------------------------------------------

    // A. Canal West Road Extension (Runs along Z = 65 from X = -44 to -75, Length 31m, Width 7.5m)
    const canalWExt = new THREE.Mesh(new THREE.PlaneGeometry(31, 7.5), roadMat);
    canalWExt.rotation.x = -Math.PI / 2;
    canalWExt.position.set(-59.5, 0.022, 65);
    canalWExt.receiveShadow = true;
    parent.add(canalWExt);

    // North & South curbs along Canal West Road Extension
    const cwCurbN = new THREE.Mesh(new THREE.BoxGeometry(31, 0.24, 0.25), curbMat);
    cwCurbN.position.set(-59.5, 0.12, 61.25);
    parent.add(cwCurbN);

    const cwCurbS = new THREE.Mesh(new THREE.BoxGeometry(31, 0.24, 0.25), curbMat);
    cwCurbS.position.set(-59.5, 0.12, 68.75);
    parent.add(cwCurbS);

    // B. West Backstreet Connector (Links Boro Bazar West Bypass from Z = 50 down to Z = 65 along X = -60, Length 15m, Width 6.5m)
    const bstreetLink = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 15), brickMat);
    bstreetLink.rotation.x = -Math.PI / 2;
    bstreetLink.position.set(-60, 0.022, 57.5);
    bstreetLink.receiveShadow = true;
    parent.add(bstreetLink);

    // Curbs along West Backstreet Connector
    const blCurbW = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 15), curbMat);
    blCurbW.position.set(-63.35, 0.12, 57.5);
    parent.add(blCurbW);

    const blCurbE = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 15), curbMat);
    blCurbE.position.set(-56.65, 0.12, 57.5);
    parent.add(blCurbE);

    // ---------------------------------------------------------
    // 2. RIVERSIDE EMBANKMENT, PROMENADE & DIRT PATHS
    // ---------------------------------------------------------

    // A. Paved Embankment Promenade along river edge (From X = -18 to -75 along Z = 69.6, Length 57m, Width 2.6m)
    const embProm = new THREE.Mesh(new THREE.BoxGeometry(57, 0.12, 2.6), swMat);
    embProm.position.set(-46.5, 0.06, 69.6);
    embProm.receiveShadow = true;
    parent.add(embProm);

    // B. Riverside Lower Dirt Path (Runs directly along the water line from X = -18 to -75 at Z = 72.4, Length 57m, Width 2.2m)
    const dirtPath = new THREE.Mesh(new THREE.PlaneGeometry(57, 2.2), dirtMat);
    dirtPath.rotation.x = -Math.PI / 2;
    dirtPath.position.set(-46.5, -0.4, 72.4);
    dirtPath.receiveShadow = true;
    parent.add(dirtPath);

    // C. Low Concrete Embankment Parapet Wall (Waist-height 0.85m cover along river edge, with opening for the ghat)
    // East wall segment: from X = -18 to -37 (Length 19m, centered at X = -27.5, Z = 70.9)
    this.createEmbankmentWallSegment(parent, -27.5, 70.9, 19.0);

    // West wall segment: from X = -49 to -75 (Length 26m, centered at X = -62.0, Z = 70.9)
    this.createEmbankmentWallSegment(parent, -62.0, 70.9, 26.0);

    // ---------------------------------------------------------
    // 3. CONCRETE BOAT LANDING / GHAT (নৌকা ঘাট ও পাকা সিঁড়ি)
    // ---------------------------------------------------------
    // Positioned at X = -43, directly aligned with Boro Bazar Main Market Street!
    this.createRiversideGhat(parent, -43, 71.0);

    // ---------------------------------------------------------
    // 4. TRADITIONAL BANGLADESHI WOODEN BOATS (দেশী নৌকা ও ট্রলার)
    // ---------------------------------------------------------
    // Boat 1: Passenger boat with arched bamboo hood ('ছই') moored at the main ghat jetty
    this.createBangladeshiBoat(parent, -41.0, -1.55, 77.2, 0.12, true, 'সবুজ বাংলা');

    // Boat 2: Cargo dinghy carrying sacks and baskets moored east of the ghat
    this.createBangladeshiBoat(parent, -26.0, -1.55, 75.6, -0.06, false, 'সোনার তরী');

    // Boat 3: Passenger boat moored along the western bank
    this.createBangladeshiBoat(parent, -59.0, -1.55, 75.8, 0.18, true, 'মেঘনা এক্সপ্রেস');

    // ---------------------------------------------------------
    // 5. ROADSIDE TEA STALL ("ঘাট পাড়ের চায়ের দোকান")
    // ---------------------------------------------------------
    // Positioned at X = -34.0, Z = 60.5 facing south towards the river and boat landing
    this.createRiversideTeaStall(parent, -34.0, 60.5, 0);

    // ---------------------------------------------------------
    // 6. MOTORCYCLE & BICYCLE PARKING AREA
    // ---------------------------------------------------------
    // Paved parking bay along the north curb of Canal West Road (X: -47 to -54, Z = 61.0)
    const parkBay = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 2.8), brickMat);
    parkBay.rotation.x = -Math.PI / 2;
    parkBay.position.set(-50.5, 0.024, 61.2);
    parent.add(parkBay);

    // White parking divider lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let lx of [-53.0, -51.0, -49.0, -47.2]) {
      const pline = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 2.4), lineMat);
      pline.rotation.x = -Math.PI / 2;
      pline.position.set(lx, 0.026, 61.2);
      parent.add(pline);
    }

    // Two commuter motorbikes parked in the bay
    this.createMotorbike(parent, -52.0, 0.02, 61.2, Math.PI * 0.45);
    this.createMotorbike(parent, -48.5, 0.02, 61.2, Math.PI * 0.45);

    // Two bicycles: one in parking bay, one near tea stall
    this.createBicycle(parent, -50.2, 0.02, 61.2, Math.PI * 0.45);
    this.createBicycle(parent, -31.5, 0.02, 61.0, Math.PI * 0.85);

    // ---------------------------------------------------------
    // 7. RIVERSIDE TREES & BENCHES
    // ---------------------------------------------------------
    // Stately riverbank shade trees
    this.createShadeTree(parent, -27.0, 60.0);
    this.createShadeTree(parent, -72.0, 68.0);

    // Tall riverbank coconut palms along the embankment verge
    this.createCoconutPalm(parent, -19.0, 71.5);
    this.createCoconutPalm(parent, -56.0, 71.5);
    this.createCoconutPalm(parent, -68.0, 71.5);

    // Concrete and wood park benches overlooking the river
    this.createTownSquareBench(parent, -22.0, 69.5, Math.PI); // Facing river
    this.createTownSquareBench(parent, -52.0, 69.5, Math.PI); // Facing river
    this.createTownSquareBench(parent, -66.0, 69.5, Math.PI); // Facing river

    // ---------------------------------------------------------
    // 8. NEARBY SHOPS & LOW-RISE BUILDINGS (North of Canal West Road)
    // ---------------------------------------------------------

    // A. Nabaganga River Transport & Cargo Booking Office ("নবগঙ্গা নৌ-পরিবহন ও কার্গো অফিস")
    // Sited directly opposite the main ghat: X = -44, Z = 54.5 (Width 11m, Depth 8m, 2 floors)
    this.createBoatTransportOffice(parent, -44, 54.5);

    // B. Boat Hardware & Marine Workshop ("মাগুরা বোট হার্ডওয়্যার ও ডিজেল পার্টস")
    // Sited at X = -56, Z = 54.5 (Width 9m, Depth 8m, 1 floor)
    this.createBangladeshiBuilding(parent, {
      x: -56, z: 54.5, w: 9, d: 8, floors: 1, color: '#bcc3c9',
      shopName: 'মাগুরা বোট হার্ডওয়্যার', shopSub: 'ডিজেল ইঞ্জিন ও নৌকা সরঞ্জাম', phone: '০১৮১৯-৭৭৮৮৯৯', theme: 'blue', shutterOpen: true
    });

    // C. Riverside Fishery Depot & Cafe ("নদীমাতৃক মৎস্য ভাণ্ডার ও ভোজনালায়")
    // Sited at X = -68, Z = 54.5 (Width 10m, Depth 8m, 1.5 floors)
    this.createBangladeshiBuilding(parent, {
      x: -68, z: 54.5, w: 10, d: 8, floors: 2, color: '#ded7cb',
      shopName: 'নদীমাতৃক মৎস্য ভোজনালায়', shopSub: 'তাজা নদীর মাছ, ভাত ও নাস্তা', phone: '০১৭২২-৩৩৪৪৫৫', theme: 'green', shutterOpen: true
    });

    // ---------------------------------------------------------
    // 9. UTILITY POLES & OVERHEAD WIRES
    // ---------------------------------------------------------
    const poleCoords = [
      { x: -24.0, z: 61.5 },
      { x: -48.0, z: 61.5 },
      { x: -64.0, z: 61.5 }
    ];
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x6e7681 });
    const crossMat = new THREE.MeshLambertMaterial({ color: 0x3d444d });

    poleCoords.forEach(p => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8), poleMat);
      pole.position.set(p.x, 3.75, p.z);
      pole.castShadow = true;
      parent.add(pole);

      const cross = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.12), crossMat);
      cross.position.set(p.x, 7.2, p.z);
      parent.add(cross);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(p.x - 0.35, 0, p.z - 0.35),
        new THREE.Vector3(p.x + 0.35, 8.0, p.z + 0.35)
      ));
    });

    // ---------------------------------------------------------
    // 10. COMBAT COVER & ENVIRONMENTAL DETAILS
    // ---------------------------------------------------------
    // A. Stacked Cargo Crates & Jute Sack Pallet on the Ghat Landing Platform
    this.createSupplyCrates(parent, -46.5, 71.0);
    this.createSupplyCrates(parent, -63.0, 62.0);

    // B. Fuel Oil & Kerosene Drums Stack (Diesel storage for boats)
    this.createCargoDrumStack(parent, -38.5, 71.0);

    // Directional Signpost at Road Junction pointing to Ghat
    this.createDirectionalSignpost(parent, -41.0, 62.2, 'নবগঙ্গা রিভার ঘাট ➔ • RIVER GHAT', '#0d47a1');
  },

  // Concrete Ghat Embankment Parapet Wall (Waist-height 0.85m cover)
  createEmbankmentWallSegment: function(parent, x, z, length) {
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x7c7873 });
    const capMat = new THREE.MeshLambertMaterial({ color: 0x9c9690 });

    const wall = new THREE.Mesh(new THREE.BoxGeometry(length, 0.85, 0.35), wallMat);
    wall.position.set(x, 0.08 + 0.425, z);
    wall.castShadow = true;
    parent.add(wall);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(length + 0.1, 0.1, 0.45), capMat);
    cap.position.set(x, 0.08 + 0.9, z);
    parent.add(cap);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - length / 2, 0, z - 0.3),
      new THREE.Vector3(x + length / 2, 1.1, z + 0.3)
    ));
  },

  // Concrete Boat Landing / Ghat with Stepped Tiers & Mooring Bollards (পাকা ঘাট ও জেটি)
  createRiversideGhat: function(parent, x, z) {
    const ghatGroup = new THREE.Group();
    ghatGroup.position.set(x, 0, z);

    const concMat = new THREE.MeshLambertMaterial({ color: 0x82827e });
    const mossMat = new THREE.MeshLambertMaterial({ color: 0x5a6352 }); // Mossy lower steps
    const bollardMat = new THREE.MeshLambertMaterial({ color: 0x2b3e50 });

    // Main Upper Landing Platform (Plaza level: Width 12m, Depth 2.8m, Y = 0.08m)
    const upperPlat = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.25, 2.8), concMat);
    upperPlat.position.set(0, 0.08, 0);
    upperPlat.receiveShadow = true;
    ghatGroup.add(upperPlat);

    // 4 Stepped Tiers descending toward the water
    const steps = [
      { y: -0.22, d: 0.8, w: 11.2, z: 1.8, mat: concMat },
      { y: -0.52, d: 0.8, w: 10.6, z: 2.6, mat: concMat },
      { y: -0.82, d: 0.8, w: 10.0, z: 3.4, mat: mossMat },
      { y: -1.15, d: 1.4, w: 9.4, z: 4.5, mat: mossMat } // Lowest boat boarding jetty platform
    ];

    steps.forEach(s => {
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, 0.3, s.d), s.mat);
      stepMesh.position.set(0, s.y, s.z);
      stepMesh.receiveShadow = true;
      ghatGroup.add(stepMesh);
    });

    // 3 Concrete Mooring Bollards along the lowest jetty deck (for tying boat ropes)
    for (let bx of [-3.6, 0, 3.6]) {
      const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.65, 8), bollardMat);
      bollard.position.set(bx, -0.85, 4.8);
      bollard.castShadow = true;
      ghatGroup.add(bollard);

      // Mooring rope wrapped around bollard
      const ropeMat = new THREE.MeshLambertMaterial({ color: 0xbfa07a });
      const ropeRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 6, 12), ropeMat);
      ropeRing.rotation.x = Math.PI / 2;
      ropeRing.position.set(bx, -0.7, 4.8);
      ghatGroup.add(ropeRing);
    }

    // Side safety parapets on upper landing edges
    for (let side of [-1, 1]) {
      const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.85, 2.6), concMat);
      sideWall.position.set(side * 5.85, 0.5, 0);
      sideWall.castShadow = true;
      ghatGroup.add(sideWall);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(x + side * 5.85 - 0.25, 0, z - 1.4),
        new THREE.Vector3(x + side * 5.85 + 0.25, 1.2, z + 1.4)
      ));
    }

    parent.add(ghatGroup);

    // Colliders for upper platform & steps
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 6.0, -1.5, z - 1.4),
      new THREE.Vector3(x + 6.0, 0.3, z + 5.2)
    ));
  },

  // Traditional Bangladeshi Wooden Dinghy Boat (দেশী নৌকা / কোষা নৌকা)
  createBangladeshiBoat: function(parent, x, y, z, rotY, hasCanopy, boatName) {
    const boat = new THREE.Group();
    boat.position.set(x, y, z);
    boat.rotation.y = rotY || 0;

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x3d2817 }); // Dark seasoned sal/teak wood
    const plankMat = new THREE.MeshLambertMaterial({ color: 0x5c4028 });
    const bambooMat = new THREE.MeshLambertMaterial({ color: 0xc4a366 });// Bamboo canopy hood ('ছই')

    const bLength = 5.2;
    const bWidth = 1.6;
    const bHeight = 0.55;

    // Main flat bottom plank
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(bWidth, 0.12, bLength * 0.7), woodMat);
    bottom.position.y = 0.06;
    boat.add(bottom);

    // Port & Starboard hull planks (Angled slightly outwards)
    for (let side of [-1, 1]) {
      const gunwale = new THREE.Mesh(new THREE.BoxGeometry(0.1, bHeight, bLength * 0.7), plankMat);
      gunwale.position.set(side * (bWidth / 2 - 0.05), bHeight / 2, 0);
      gunwale.rotation.z = side * 0.15;
      gunwale.castShadow = true;
      boat.add(gunwale);
    }

    // Tapered Raised Bow (উঁচু গলুই - front of boat)
    const bow = new THREE.Mesh(new THREE.BoxGeometry(bWidth * 0.7, bHeight * 1.2, bLength * 0.2), woodMat);
    bow.position.set(0, bHeight * 0.65, bLength * 0.42);
    bow.rotation.x = -0.28;
    bow.castShadow = true;
    boat.add(bow);

    // Tapered Raised Stern (পেছনের গলুই - rear of boat)
    const stern = new THREE.Mesh(new THREE.BoxGeometry(bWidth * 0.7, bHeight * 1.1, bLength * 0.2), woodMat);
    stern.position.set(0, bHeight * 0.6, -bLength * 0.42);
    stern.rotation.x = 0.25;
    stern.castShadow = true;
    boat.add(stern);

    // Internal Wooden Cross-Beams / Ribs
    for (let rz of [-1.2, -0.4, 0.4, 1.2]) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(bWidth - 0.1, 0.08, 0.12), plankMat);
      rib.position.set(0, bHeight * 0.7, rz);
      boat.add(rib);
    }

    // Arched Bamboo/Straw Canopy Hood ('ছই') in center
    if (hasCanopy) {
      const hood = new THREE.Mesh(
        new THREE.CylinderGeometry(bWidth * 0.52, bWidth * 0.52, 1.8, 12, 1, false, 0, Math.PI),
        bambooMat
      );
      hood.rotation.z = Math.PI / 2;
      hood.rotation.y = Math.PI / 2;
      hood.position.set(0, bHeight + 0.35, 0);
      hood.castShadow = true;
      boat.add(hood);
    }

    // Wooden Steering Oar ('বৈঠা') resting at stern
    const oarPole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.4, 6), plankMat);
    oarPole.rotation.x = 0.55;
    oarPole.rotation.y = 0.25;
    oarPole.position.set(0.35, bHeight + 0.3, -bLength * 0.45);
    boat.add(oarPole);

    const oarBlade = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.65), plankMat);
    oarBlade.position.set(0.48, bHeight - 0.3, -bLength * 0.65);
    boat.add(oarBlade);

    // Boat Name plate on bow
    if (boatName) {
      const nameMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
      const nplate = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.15, 0.04), nameMat);
      nplate.position.set(0, bHeight + 0.2, bLength * 0.46);
      boat.add(nplate);
    }

    parent.add(boat);

    // Colliders for the boat so players can hop on and take cover
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - bWidth / 2 - 0.2, y, z - bLength / 2 - 0.2),
      new THREE.Vector3(x + bWidth / 2 + 0.2, y + bHeight + (hasCanopy ? 1.0 : 0.4), z + bLength / 2 + 0.2)
    ));
  },

  // Riverside Roadside Tea Stall ("ঘাট পাড়ের চায়ের দোকান")
  createRiversideTeaStall: function(parent, x, z, rotY) {
    const stall = new THREE.Group();
    stall.position.set(x, 0, z);
    stall.rotation.y = rotY || 0;

    const sW = 3.4;
    const sD = 2.4;
    const sH = 2.5;

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5a4231 });
    const tinMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createTinRoofTexture()
    });
    const benchWoodMat = new THREE.MeshLambertMaterial({ color: 0x7c5339 });

    // 4 Corner Timber Posts
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, sH, 6);
    for (let px of [-sW / 2 + 0.15, sW / 2 - 0.15]) {
      for (let pz of [-sD / 2 + 0.15, sD / 2 - 0.15]) {
        const post = new THREE.Mesh(postGeo, woodMat);
        post.position.set(px, sH / 2, pz);
        post.castShadow = true;
        stall.add(post);
      }
    }

    // Rear wall (weathered timber planks)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(sW, sH - 0.4, 0.08), woodMat);
    backWall.position.set(0, (sH - 0.4) / 2, -sD / 2 + 0.1);
    stall.add(backWall);

    // Service counter (Waist-height cover!)
    const counterH = 0.85;
    const counter = new THREE.Mesh(new THREE.BoxGeometry(sW - 0.3, counterH, 0.55), woodMat);
    counter.position.set(0, counterH / 2, sD / 2 - 0.3);
    counter.castShadow = true;
    stall.add(counter);

    const cTop = new THREE.Mesh(new THREE.BoxGeometry(sW, 0.06, 0.7), benchWoodMat);
    cTop.position.set(0, counterH, sD / 2 - 0.3);
    stall.add(cTop);

    // Slanted tin roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(sW + 0.6, 0.08, sD + 0.8), tinMat);
    roof.position.set(0, sH + 0.12, 0);
    roof.rotation.x = 0.14;
    roof.castShadow = true;
    stall.add(roof);

    // Brass Tea Kettle on stove
    const brassMat = new THREE.MeshPhongMaterial({ color: 0xd4af37, shininess: 80 });
    const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 0.32, 8), brassMat);
    kettle.position.set(-0.7, counterH + 0.18, sD / 2 - 0.3);
    stall.add(kettle);

    // Biscuit glass jars
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x88ccdd, transparent: true, opacity: 0.65 });
    for (let jx of [0.4, 0.8]) {
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.28, 8), glassMat);
      jar.position.set(jx, counterH + 0.16, sD / 2 - 0.3);
      stall.add(jar);
    }

    // Yellow bananas hanging from roof truss
    const bananas = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 6, 6),
      new THREE.MeshLambertMaterial({ color: 0xf5b700 })
    );
    bananas.position.set(-0.2, sH - 0.3, sD / 2 - 0.3);
    stall.add(bananas);

    // Front customer wooden bench
    const patronBench = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.42, 0.35), benchWoodMat);
    patronBench.position.set(0, 0.21, sD / 2 + 0.55);
    patronBench.castShadow = true;
    stall.add(patronBench);

    // Signboard
    const signTex = TextureFactory.createBengaliSignTexture('ঘাট পাড়ের চা স্টল', 'গরম দুধ চা, ডিম সমুচা ও পরোটা', '০১৭১৯-৮৮৭৭৬৬', 'red');
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 0.6),
      new THREE.MeshLambertMaterial({ map: signTex })
    );
    sign.position.set(0, sH - 0.1, sD / 2 + 0.05);
    stall.add(sign);

    parent.add(stall);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - sW / 2, 0, z - sD / 2),
      new THREE.Vector3(x + sW / 2, sH + 0.5, z + sD / 2 + 0.1)
    ));
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 1.2, 0, z + sD / 2 + 0.35),
      new THREE.Vector3(x + 1.2, 0.5, z + sD / 2 + 0.75)
    ));
  },

  // River Transport & Cargo Booking Office ("নবগঙ্গা নৌ-পরিবহন ও কার্গো বুকিং অফিস")
  createBoatTransportOffice: function(parent, x, z) {
    const bGroup = new THREE.Group();
    bGroup.position.set(x, 0, z);

    const bWidth = 11;
    const bDepth = 8;
    const bHeight = 6.8;

    const facadeTex = TextureFactory.createBuildingFacadeTexture('#e3e7eb', 3, 2);
    const wallMat = new THREE.MeshLambertMaterial({ map: facadeTex });
    const blueMat = new THREE.MeshLambertMaterial({ color: 0x0d47a1 });
    const tinMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createTinRoofTexture()
    });

    // Main building body
    const body = new THREE.Mesh(new THREE.BoxGeometry(bWidth, bHeight, bDepth), wallMat);
    body.position.y = bHeight / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    bGroup.add(body);

    // Deep blue skirting base
    const base = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.1, 0.5, bDepth + 0.1), blueMat);
    base.position.y = 0.25;
    bGroup.add(base);

    // Front Entrance Canopy & Ticket Counter Awning (Facing South toward river)
    const awning = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 1.8), tinMat);
    awning.position.set(0, 3.4, bDepth / 2 + 0.9);
    awning.rotation.x = 0.18;
    awning.castShadow = true;
    bGroup.add(awning);

    // Two support posts for awning
    const colGeo = new THREE.BoxGeometry(0.12, 3.2, 0.12);
    for (let cx of [-1.8, 1.8]) {
      const col = new THREE.Mesh(colGeo, blueMat);
      col.position.set(cx, 1.6, bDepth / 2 + 1.6);
      col.castShadow = true;
      bGroup.add(col);
    }

    // Glass entrance door and ticket window under awning
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 2.4),
      new THREE.MeshLambertMaterial({ color: 0x1e293b })
    );
    door.position.set(0, 1.2, bDepth / 2 + 0.02);
    bGroup.add(door);

    // Office Signboard above canopy
    const signTex = this.createPoliceSignTexture('RIVER CARGO BOOKING', 'নবগঙ্গা নৌ-পরিবহন ও কার্গো বুকিং অফিস');
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(5.4, 0.9),
      new THREE.MeshLambertMaterial({ map: signTex })
    );
    sign.position.set(0, 4.4, bDepth / 2 + 0.05);
    bGroup.add(sign);

    // Rooftop parapet
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.2, 0.45, bDepth + 0.2), blueMat);
    parapet.position.y = bHeight + 0.225;
    bGroup.add(parapet);

    parent.add(bGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - bWidth / 2 - 0.4, 0, z - bDepth / 2 - 0.4),
      new THREE.Vector3(x + bWidth / 2 + 0.4, bHeight + 1.0, z + bDepth / 2 + 0.4)
    ));
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 2.0, 0, z + bDepth / 2),
      new THREE.Vector3(x + 2.0, 3.4, z + bDepth / 2 + 1.8)
    ));
  },

  // Fuel Oil & Kerosene Drums Stack (Diesel fuel for motor boats)
  createCargoDrumStack: function(parent, x, z) {
    const drumGroup = new THREE.Group();
    drumGroup.position.set(x, 0, z);

    const blueDrumMat = new THREE.MeshLambertMaterial({ color: 0x1565c0 });
    const redDrumMat = new THREE.MeshLambertMaterial({ color: 0xc62828 });

    const drumGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.95, 10);

    const drumPos = [
      { x: -0.32, z: -0.3, mat: blueDrumMat },
      { x: 0.32, z: -0.3, mat: redDrumMat },
      { x: 0, z: 0.3, mat: blueDrumMat }
    ];

    drumPos.forEach(d => {
      const drum = new THREE.Mesh(drumGeo, d.mat);
      drum.position.set(d.x, 0.08 + 0.475, d.z);
      drum.castShadow = true;
      drumGroup.add(drum);
    });

    parent.add(drumGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - 0.75, 0, z - 0.75),
      new THREE.Vector3(x + 0.75, 1.1, z + 0.75)
    ));
  },

  // ---------------------------------------------------------------------------
  // 16. MAGURA SADAR HOSPITAL & EMERGENCY CLINIC (মাগুরা সদর হাসপাতাল ও ট্রমা সেন্টার)
  // ---------------------------------------------------------------------------
  createHospitalArea: function(parent) {
    const roadTex = TextureFactory.createRoadTexture();
    const brickTex = TextureFactory.createBrickPavementTexture();
    brickTex.repeat.set(4, 2);
    const swTex = TextureFactory.createSidewalkTexture();
    swTex.repeat.set(2, 8);
    const curbTex = TextureFactory.createCurbTexture();
    curbTex.repeat.set(10, 1);

    const roadMat = new THREE.MeshLambertMaterial({ map: roadTex });
    const brickMat = new THREE.MeshLambertMaterial({ map: brickTex });
    const swMat = new THREE.MeshLambertMaterial({ map: swTex });
    const curbMat = new THREE.MeshLambertMaterial({ map: curbTex });

    // ---------------------------------------------------------
    // 1. CONNECTED ROADS LEADING TO HOSPITAL
    // ---------------------------------------------------------

    // A. Hospital Road West Extension (Along Z = -68 from X = -46 to -88, Length 42m, Width 8.5m)
    const hospRoadExt = new THREE.Mesh(new THREE.PlaneGeometry(42, 8.5), roadMat);
    hospRoadExt.rotation.x = -Math.PI / 2;
    hospRoadExt.position.set(-67, 0.022, -68);
    hospRoadExt.receiveShadow = true;
    parent.add(hospRoadExt);

    // North & South curbs along Hospital Road Extension
    const hrCurbN = new THREE.Mesh(new THREE.BoxGeometry(42, 0.24, 0.25), curbMat);
    hrCurbN.position.set(-67, 0.12, -72.15);
    parent.add(hrCurbN);

    const hrCurbS = new THREE.Mesh(new THREE.BoxGeometry(42, 0.24, 0.25), curbMat);
    hrCurbS.position.set(-67, 0.12, -63.85);
    parent.add(hrCurbS);

    // North sidewalk along Hospital Road Extension
    const hrSwN = new THREE.Mesh(new THREE.BoxGeometry(42, 0.2, 1.8), swMat);
    hrSwN.position.set(-67, 0.1, -73.15);
    parent.add(hrSwN);

    // South sidewalk along Hospital Road Extension (leading to hospital main gate)
    const hrSwS = new THREE.Mesh(new THREE.BoxGeometry(42, 0.2, 1.8), swMat);
    hrSwS.position.set(-67, 0.1, -62.85);
    parent.add(hrSwS);

    // B. West Ambulance Service Lane (Along X = -87 from Z = -68 down to -36, Length 32m, Width 6.0m)
    const ambLane = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 32), roadMat);
    ambLane.rotation.x = -Math.PI / 2;
    ambLane.position.set(-87, 0.022, -52);
    ambLane.receiveShadow = true;
    parent.add(ambLane);

    // Curbs along West Ambulance Service Lane
    const alCurbW = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 32), curbMat);
    alCurbW.position.set(-89.9, 0.12, -52);
    parent.add(alCurbW);

    const alCurbE = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 32), curbMat);
    alCurbE.position.set(-84.1, 0.12, -52);
    parent.add(alCurbE);

    // ---------------------------------------------------------
    // 2. HOSPITAL COMPOUND GROUND & OPEN COURTYARD
    // ---------------------------------------------------------
    // Compound Dimensions: Width 32m (X: -86 to -54), Depth 28m (Z: -64 to -36)
    const compoundMat = new THREE.MeshLambertMaterial({ color: 0x94989e }); // Paved concrete compound base
    const compoundBase = new THREE.Mesh(new THREE.PlaneGeometry(32, 28), compoundMat);
    compoundBase.rotation.x = -Math.PI / 2;
    compoundBase.position.set(-70, 0.024, -50);
    compoundBase.receiveShadow = true;
    parent.add(compoundBase);

    // Ambulance Driveway Loop & Turnaround in Courtyard (Width 6.0m asphalt lane)
    const driveLoop = new THREE.Mesh(new THREE.PlaneGeometry(24, 12), roadMat);
    driveLoop.rotation.x = -Math.PI / 2;
    driveLoop.position.set(-70, 0.026, -56);
    driveLoop.receiveShadow = true;
    parent.add(driveLoop);

    // Landscaped Green Island in Center of Turnaround (Width 8.0m, Depth 4.0m)
    const greenIsland = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 4.0), new THREE.MeshLambertMaterial({ color: 0x3d6b38 }));
    greenIsland.rotation.x = -Math.PI / 2;
    greenIsland.position.set(-70, 0.028, -56);
    parent.add(greenIsland);

    // Curb around green island
    const giCurb = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.2, 4.2), curbMat);
    giCurb.position.set(-70, 0.1, -56);
    parent.add(giCurb);

    // Central decorative red cross emblem on green island
    const crossRed = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
    const crossBar1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.7), crossRed);
    crossBar1.position.set(-70, 0.12, -56);
    parent.add(crossBar1);
    const crossBar2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 2.4), crossRed);
    crossBar2.position.set(-70, 0.12, -56);
    parent.add(crossBar2);

    // ---------------------------------------------------------
    // 3. BOUNDARY WALL & ENTRANCE GATES
    // ---------------------------------------------------------
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xe0ded8 }); // Whitewashed brick boundary wall
    const wallCapMat = new THREE.MeshLambertMaterial({ color: 0x1b4332 });// Forest green coping
    const wallH = 1.4; // Waist-height (1.4m) tactical boundary wall

    // Helper for boundary wall segments
    const addWallSeg = (wx, wz, ww, wd) => {
      const seg = new THREE.Mesh(new THREE.BoxGeometry(ww, wallH, wd), wallMat);
      seg.position.set(wx, wallH / 2, wz);
      seg.castShadow = true;
      parent.add(seg);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(ww + 0.1, 0.12, wd + 0.1), wallCapMat);
      cap.position.set(wx, wallH + 0.06, wz);
      parent.add(cap);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(wx - ww / 2, 0, wz - wd / 2),
        new THREE.Vector3(wx + ww / 2, wallH + 0.5, wz + wd / 2)
      ));
    };

    // North Boundary Wall along Z = -64 (Total span X: -86 to -54, with Main Entrance Gate at X = -65)
    // North East section: from X = -54 to -61.5 (Length 7.5m)
    addWallSeg(-57.75, -64, 7.5, 0.35);
    // North West section: from X = -68.5 to -86 (Length 17.5m)
    addWallSeg(-77.25, -64, 17.5, 0.35);

    // South Boundary Wall along Z = -36 (Span X: -86 to -54, Length 32m)
    addWallSeg(-70.0, -36, 32.0, 0.35);

    // East Boundary Wall along X = -54 (Span Z: -64 to -36, Length 28m)
    addWallSeg(-54.0, -50.0, 0.35, 28.0);

    // West Boundary Wall along X = -86 (Span Z: -64 to -36, with Emergency Gate at Z = -53)
    // West North section: from Z = -64 to -56 (Length 8.0m)
    addWallSeg(-86.0, -60.0, 0.35, 8.0);
    // West South section: from Z = -50 to -36 (Length 14.0m)
    addWallSeg(-86.0, -43.0, 0.35, 14.0);

    // A. Main Hospital Entrance Gate Pillars & Steel Arch (at X = -65, Z = -64)
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0x1b4332 });
    const pGeo = new THREE.BoxGeometry(0.8, 3.2, 0.8);
    for (let gx of [-68.5, -61.5]) {
      const pillar = new THREE.Mesh(pGeo, pillarMat);
      pillar.position.set(gx, 1.6, -64);
      pillar.castShadow = true;
      parent.add(pillar);

      const pCap = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.25, 1.0), new THREE.MeshLambertMaterial({ color: 0xd32f2f }));
      pCap.position.set(gx, 3.3, -64);
      parent.add(pCap);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(gx - 0.5, 0, -64.5),
        new THREE.Vector3(gx + 0.5, 3.6, -63.5)
      ));
    }

    // Overhead Steel Gate Sign Arch: "মাগুরা সদর হাসপাতাল • HOSPITAL"
    const archMat = new THREE.MeshLambertMaterial({ color: 0x1b4332 });
    const archBar = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.5, 0.2), archMat);
    archBar.position.set(-65, 3.5, -64);
    parent.add(archBar);

    const gateSignTex = this.createPoliceSignTexture('HOSPITAL ENTRANCE', 'মাগুরা ২৫০ শয্যা বিশিষ্ট সদর হাসপাতাল');
    const gateSign = new THREE.Mesh(
      new THREE.PlaneGeometry(6.4, 0.8),
      new THREE.MeshLambertMaterial({ map: gateSignTex })
    );
    gateSign.position.set(-65, 4.0, -63.88);
    parent.add(gateSign);

    // B. Emergency Ambulance Entrance Gate Pillars (at X = -86, Z = -53)
    for (let gz of [-56.0, -50.0]) {
      const ePil = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.0, 0.7), pillarMat);
      ePil.position.set(-86, 1.5, gz);
      ePil.castShadow = true;
      parent.add(ePil);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(-86.4, 0, gz - 0.4),
        new THREE.Vector3(-85.6, 3.2, gz + 0.4)
      ));
    }

    // Emergency Gate Signboard
    const eSignTex = this.createPoliceSignTexture('EMERGENCY AMBULANCE ENTRY', 'জরুরি ও অ্যাম্বুলেন্স প্রবেশদ্বার');
    const eSign = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 0.75),
      new THREE.MeshLambertMaterial({ map: eSignTex })
    );
    eSign.position.set(-85.88, 3.2, -53);
    eSign.rotation.y = Math.PI / 2;
    parent.add(eSign);

    // ---------------------------------------------------------
    // 4. MAIN HOSPITAL BUILDING ("HOSPITAL")
    // ---------------------------------------------------------
    // Position: X = -64, Z = -45 (Facing North toward courtyard)
    // Dimensions: Width 14m, Depth 11m, Height 8.5m (2.5 floors)
    const hospFacadeTex = TextureFactory.createBuildingFacadeTexture('#f4f6f8', 4, 3);
    const hospMat = new THREE.MeshLambertMaterial({ map: hospFacadeTex });
    const medGreenMat = new THREE.MeshLambertMaterial({ color: 0x1b4332 });
    const medRedMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });

    const mainHosp = new THREE.Mesh(new THREE.BoxGeometry(14, 8.5, 11), hospMat);
    mainHosp.position.set(-64, 4.25, -45);
    mainHosp.castShadow = true;
    mainHosp.receiveShadow = true;
    parent.add(mainHosp);

    // Green Skirting Base
    const hospBase = new THREE.Mesh(new THREE.BoxGeometry(14.1, 0.6, 11.1), medGreenMat);
    hospBase.position.set(-64, 0.3, -45);
    parent.add(hospBase);

    // Covered Emergency Ambulance Bay / Portico (Projects North: Width 6.5m, Depth 4.0m, Height 3.8m)
    const porticoRoof = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.35, 4.0), new THREE.MeshLambertMaterial({ color: 0xededed }));
    porticoRoof.position.set(-64, 3.6, -52.5);
    porticoRoof.castShadow = true;
    parent.add(porticoRoof);

    // Two square portico entrance pillars
    for (let px of [-66.8, -61.2]) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.45, 3.6, 0.45), medGreenMat);
      col.position.set(px, 1.8, -54.2);
      col.castShadow = true;
      parent.add(col);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(px - 0.3, 0, -54.5),
        new THREE.Vector3(px + 0.3, 3.8, -53.9)
      ));
    }

    // Prominent Bold Entrance Sign: "HOSPITAL"
    const hospSignCanvas = document.createElement('canvas');
    hospSignCanvas.width = 512; hospSignCanvas.height = 128;
    const hsCtx = hospSignCanvas.getContext('2d');
    hsCtx.fillStyle = '#b71c1c'; // Medical Red
    hsCtx.fillRect(0, 0, 512, 128);
    hsCtx.strokeStyle = '#ffffff';
    hsCtx.lineWidth = 6;
    hsCtx.strokeRect(6, 6, 500, 116);

    // White bold text
    hsCtx.fillStyle = '#ffffff';
    hsCtx.font = 'bold 44px sans-serif';
    hsCtx.textAlign = 'center';
    hsCtx.fillText('+ HOSPITAL +', 256, 58);

    hsCtx.fillStyle = '#ffeb3b';
    hsCtx.font = 'bold 24px sans-serif';
    hsCtx.fillText('মাগুরা সদর হাসপাতাল ও ট্রমা সেন্টার', 256, 102);

    const hospSignTex = new THREE.CanvasTexture(hospSignCanvas);
    const hospSign = new THREE.Mesh(
      new THREE.PlaneGeometry(6.0, 1.3),
      new THREE.MeshLambertMaterial({ map: hospSignTex })
    );
    hospSign.position.set(-64, 4.5, -50.45);
    parent.add(hospSign);

    // Double glass automatic sliding doors under portico
    const hospDoor = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 2.6),
      new THREE.MeshLambertMaterial({ color: 0x1e293b })
    );
    hospDoor.position.set(-64, 1.3, -50.48);
    parent.add(hospDoor);

    // Rooftop red cross medical emblem and parapet
    const hospParapet = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.6, 11.2), medGreenMat);
    hospParapet.position.set(-64, 8.8, -45);
    parent.add(hospParapet);

    // Rooftop red cross emblem structure
    const rfCross1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 0.15), medRedMat);
    rfCross1.position.set(-64, 9.8, -50.4);
    parent.add(rfCross1);
    const rfCross2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.2, 0.15), medRedMat);
    rfCross2.position.set(-64, 9.8, -50.4);
    parent.add(rfCross2);

    // Main Hospital Colliders
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(-71.4, 0, -50.8),
      new THREE.Vector3(-56.6, 10.0, -39.2)
    ));

    // ---------------------------------------------------------
    // 5. CONNECTED LOW-RISE MEDICAL BUILDINGS
    // ---------------------------------------------------------

    // A. Emergency & Trauma Care Wing (Connected to West of Main Building)
    // Position: X = -76, Z = -45 (Width 9m, Depth 10m, Height 6.5m, 2 floors)
    const emWingMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createBuildingFacadeTexture('#e8ecef', 3, 2)
    });
    const emWing = new THREE.Mesh(new THREE.BoxGeometry(9, 6.5, 10), emWingMat);
    emWing.position.set(-76, 3.25, -45);
    emWing.castShadow = true;
    parent.add(emWing);

    const emBase = new THREE.Mesh(new THREE.BoxGeometry(9.1, 0.5, 10.1), medRedMat);
    emBase.position.set(-76, 0.25, -45);
    parent.add(emBase);

    // Emergency Wing Signboard
    const emSignTex = this.createPoliceSignTexture('EMERGENCY & TRAUMA WING', 'জরুরি ও ট্রমা কেয়ার বিভাগ');
    const emSign = new THREE.Mesh(
      new THREE.PlaneGeometry(5.0, 0.8),
      new THREE.MeshLambertMaterial({ map: emSignTex })
    );
    emSign.position.set(-76, 3.8, -49.95);
    parent.add(emSign);

    // Wheelchair Access Concrete Ramp in front of Emergency Wing (Height 0.5m, Length 4.0m)
    const rampMat = new THREE.MeshLambertMaterial({ color: 0x8a929a });
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 3.5), rampMat);
    ramp.position.set(-76, 0.2, -51.5);
    ramp.rotation.x = -0.08;
    ramp.receiveShadow = true;
    parent.add(ramp);

    // Ramp safety handrails (Waist-height cover!)
    const railMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
    for (let rx of [-77.2, -74.8]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 3.5), railMat);
      rail.position.set(rx, 0.7, -51.5);
      rail.castShadow = true;
      parent.add(rail);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(rx - 0.15, 0, -53.3),
        new THREE.Vector3(rx + 0.15, 1.2, -49.7)
      ));
    }

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(-80.8, 0, -50.3),
      new THREE.Vector3(-71.2, 7.5, -39.7)
    ));

    // B. Outdoor Patient (OPD) & Diagnostic Pathology Ward (Connected to East of Main Building)
    // Position: X = -54.5, Z = -45 (Width 6.5m, Depth 9m, Height 5.2m, 1.5 floors)
    const opdWingMat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createBuildingFacadeTexture('#e3e8e3', 2, 2)
    });
    const opdWing = new THREE.Mesh(new THREE.BoxGeometry(6.5, 5.2, 9), opdWingMat);
    opdWing.position.set(-54.5, 2.6, -45);
    opdWing.castShadow = true;
    parent.add(opdWing);

    // OPD Signboard
    const opdSignTex = TextureFactory.createBengaliSignTexture('বহির্বিভাগ ও প্যাথলজি', 'ডিজিটাল এক্স-রে, রক্ত পরীক্ষা ও ইসিজি', '২৪ ঘণ্টা খোলা', 'green');
    const opdSign = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 0.8),
      new THREE.MeshLambertMaterial({ map: opdSignTex })
    );
    opdSign.position.set(-54.5, 3.2, -49.45);
    parent.add(opdSign);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(-58.0, 0, -49.8),
      new THREE.Vector3(-51.0, 6.0, -40.2)
    ));

    // ---------------------------------------------------------
    // 6. AMBULANCE PARKING BAYS & 2 AMBULANCE VEHICLES
    // ---------------------------------------------------------
    // Parking Bay along West wall (X = -81, Z: -55 to -62)
    const pStallMat = new THREE.MeshLambertMaterial({ map: TextureFactory.createBrickPavementTexture() });
    const pBay = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 7.0), pStallMat);
    pBay.rotation.x = -Math.PI / 2;
    pBay.position.set(-81, 0.026, -58.5);
    parent.add(pBay);

    // White parking stall divider lines
    const pLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let pz of [-62.0, -58.5, -55.0]) {
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 0.12), pLineMat);
      pl.rotation.x = -Math.PI / 2;
      pl.position.set(-81, 0.028, pz);
      parent.add(pl);
    }

    // Ambulance 1: Parked in front of the Emergency Portico (Ready for triage!)
    this.createAmbulance(parent, -64.0, 0.02, -56.5, 0);

    // Ambulance 2: Parked in the designated Ambulance Bay
    this.createAmbulance(parent, -81.0, 0.02, -58.5, Math.PI / 2);

    // ---------------------------------------------------------
    // 7. TREES & HOSPITAL WAITING BENCHES
    // ---------------------------------------------------------
    // Neem shade trees inside the courtyard
    this.createShadeTree(parent, -57.5, -59.0);
    this.createShadeTree(parent, -73.0, -60.0);

    // 3 Outdoor Patient Waiting Benches
    this.createTownSquareBench(parent, -68.5, -51.5, Math.PI / 2); // Beside portico
    this.createTownSquareBench(parent, -59.5, -51.5, -Math.PI / 2);// Beside portico
    this.createTownSquareBench(parent, -57.0, -56.0, 0);            // In courtyard garden

    // ---------------------------------------------------------
    // 8. TACTICAL COMBAT COVER OBJECTS
    // ---------------------------------------------------------

    // A. Pressurized Medical Oxygen Gas Cylinder Rack (Heavy metal cage + 6 blue/green oxygen tanks)
    const oxGroup = new THREE.Group();
    oxGroup.position.set(-71.5, 0.02, -51.5);

    const cageMat = new THREE.MeshLambertMaterial({ color: 0x374151 });
    const oxTankMat = new THREE.MeshLambertMaterial({ color: 0x1e88e5 }); // Medical Blue
    const oxGreenMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });// Medical Green

    // Cage base & mesh frame
    const cBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.9), cageMat);
    cBase.position.y = 0.075;
    oxGroup.add(cBase);

    const cFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 0.9), cageMat);
    cFrame.position.y = 0.775;
    oxGroup.add(cFrame);

    // 6 Tall Oxygen Tanks inside cage
    const tankGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.3, 8);
    for (let tx of [-0.5, 0, 0.5]) {
      for (let tz of [-0.25, 0.25]) {
        const mat = (tx === 0) ? oxGreenMat : oxTankMat;
        const tank = new THREE.Mesh(tankGeo, mat);
        tank.position.set(tx, 0.75, tz);
        tank.castShadow = true;
        oxGroup.add(tank);
      }
    }
    parent.add(oxGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(-72.4, 0, -52.1),
      new THREE.Vector3(-70.6, 1.6, -50.9)
    ));

    // B. Stacked Medical Supply Crates near emergency bay
    this.createSupplyCrates(parent, -58.5, -53.5);

    // C. Hospital Biohazard & Waste Disposal Bins
    this.createPublicWasteBin(parent, -60.5, -53.5);
    this.createPublicWasteBin(parent, -78.5, -53.5);

    // Directional Signpost at Hospital Road
    this.createDirectionalSignpost(parent, -61.0, -62.5, 'জরুরি বিভাগ ➔ • EMERGENCY DEPT', '#b71c1c');
  },

  // Bangladeshi Government Emergency Ambulance Vehicle (মাগুরা সদর হাসপাতাল অ্যাম্বুলেন্স)
  createAmbulance: function(parent, x, y, z, rotY) {
    const amb = new THREE.Group();
    amb.position.set(x, y, z);
    amb.rotation.y = rotY || 0;

    const whiteMat = new THREE.MeshPhongMaterial({ color: 0xfafafa, shininess: 60 });
    const redMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
    const greenMat = new THREE.MeshLambertMaterial({ color: 0x1b4332 });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x1e293b, transparent: true, opacity: 0.85 });
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x282828 });
    const chromeMat = new THREE.MeshPhongMaterial({ color: 0xdcdcdc, shininess: 80 });

    const vWidth = 1.85;
    const vHeight = 1.5;
    const vLength = 4.8;

    // Main Ambulance Body Box
    const body = new THREE.Mesh(new THREE.BoxGeometry(vWidth, vHeight, vLength), whiteMat);
    body.position.set(0, 1.05, 0);
    body.castShadow = true;
    amb.add(body);

    // Emergency Side Stripe (Red & Green Bangladeshi medical emergency livery)
    const stripeR = new THREE.Mesh(new THREE.BoxGeometry(vWidth + 0.02, 0.14, vLength * 0.95), redMat);
    stripeR.position.set(0, 0.95, 0);
    amb.add(stripeR);

    const stripeG = new THREE.Mesh(new THREE.BoxGeometry(vWidth + 0.02, 0.08, vLength * 0.95), greenMat);
    stripeG.position.set(0, 0.82, 0);
    amb.add(stripeG);

    // Medical Red Cross Decals on both sides
    for (let side of [-1, 1]) {
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.18), redMat);
      c1.position.set(side * (vWidth / 2 + 0.02), 1.25, -0.6);
      amb.add(c1);

      const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.6), redMat);
      c2.position.set(side * (vWidth / 2 + 0.02), 1.25, -0.6);
      amb.add(c2);
    }

    // Front Windshield
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.85), glassMat);
    windshield.position.set(0, 1.38, vLength / 2 + 0.01);
    windshield.rotation.x = -0.28;
    amb.add(windshield);

    // Rear Double Patient Loading Windows
    for (let wx of [-0.45, 0.45]) {
      const rWin = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.6), glassMat);
      rWin.position.set(wx, 1.35, -vLength / 2 - 0.01);
      rWin.rotation.y = Math.PI;
      amb.add(rWin);
    }

    // Front Chrome Grille & Headlights
    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.08), chromeMat);
    grille.position.set(0, 0.6, vLength / 2 + 0.02);
    amb.add(grille);

    const headMat = new THREE.MeshBasicMaterial({ color: 0xfffae6 });
    for (let hx of [-0.65, 0.65]) {
      const light = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.06), headMat);
      light.position.set(hx, 0.65, vLength / 2 + 0.02);
      amb.add(light);
    }

    // Roof Emergency Red & Blue Light Bar (Siren)
    const sirenBar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.28), redMat);
    sirenBar.position.set(0, vHeight + 0.36, 0.8);
    amb.add(sirenBar);

    const sirenBlue = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.29), new THREE.MeshLambertMaterial({ color: 0x1e88e5 }));
    sirenBlue.position.set(-0.35, vHeight + 0.37, 0.8);
    amb.add(sirenBlue);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 10);
    for (let xs of [-vWidth / 2, vWidth / 2]) {
      for (let zs of [-1.4, 1.4]) {
        const wheel = new THREE.Mesh(wheelGeo, tireMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(xs, 0.34, zs);
        wheel.castShadow = true;
        amb.add(wheel);
      }
    }

    parent.add(amb);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - vWidth / 2 - 0.2, y, z - vLength / 2 - 0.2),
      new THREE.Vector3(x + vWidth / 2 + 0.2, y + 2.0, z + vLength / 2 + 0.2)
    ));
  },

  // ---------------------------------------------------------------------------
  // 17. MAGURA MODEL SCHOOL & COLLEGE CAMPUS (মাগুরা মডেল স্কুল ও কলেজ ক্যাম্পাস)
  // ---------------------------------------------------------------------------
  createSchoolCampusArea: function(parent) {
    const roadTex = TextureFactory.createRoadTexture();
    const brickTex = TextureFactory.createBrickPavementTexture();
    brickTex.repeat.set(4, 2);
    const swTex = TextureFactory.createSidewalkTexture();
    swTex.repeat.set(2, 8);
    const curbTex = TextureFactory.createCurbTexture();
    curbTex.repeat.set(10, 1);

    const roadMat = new THREE.MeshLambertMaterial({ map: roadTex });
    const brickMat = new THREE.MeshLambertMaterial({ map: brickTex });
    const swMat = new THREE.MeshLambertMaterial({ map: swTex });
    const curbMat = new THREE.MeshLambertMaterial({ map: curbTex });

    // ---------------------------------------------------------
    // 1. CONNECTED ROADS LEADING TO SCHOOL CAMPUS
    // ---------------------------------------------------------

    // A. College Road East Extension (Along Z = -48 from X = 46 to 88, Length 42m, Width 7.5m)
    const collegeRoadExt = new THREE.Mesh(new THREE.PlaneGeometry(42, 7.5), roadMat);
    collegeRoadExt.rotation.x = -Math.PI / 2;
    collegeRoadExt.position.set(67, 0.022, -48);
    collegeRoadExt.receiveShadow = true;
    parent.add(collegeRoadExt);

    // North & South curbs along College Road Extension
    const crCurbN = new THREE.Mesh(new THREE.BoxGeometry(42, 0.24, 0.25), curbMat);
    crCurbN.position.set(67, 0.12, -51.75);
    parent.add(crCurbN);

    const crCurbS = new THREE.Mesh(new THREE.BoxGeometry(42, 0.24, 0.25), curbMat);
    crCurbS.position.set(67, 0.12, -44.25);
    parent.add(crCurbS);

    // North sidewalk along College Road Extension
    const crSwN = new THREE.Mesh(new THREE.BoxGeometry(42, 0.2, 1.8), swMat);
    crSwN.position.set(67, 0.1, -52.75);
    parent.add(crSwN);

    // South sidewalk along College Road Extension (leading into School Main Gate)
    const crSwS = new THREE.Mesh(new THREE.BoxGeometry(42, 0.2, 1.8), swMat);
    crSwS.position.set(67, 0.1, -43.25);
    parent.add(crSwS);

    // B. East Campus Avenue (Along X = 89 from Z = -48 down to -14, Length 34m, Width 6.0m)
    const eastAve = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 34), roadMat);
    eastAve.rotation.x = -Math.PI / 2;
    eastAve.position.set(89, 0.022, -31);
    eastAve.receiveShadow = true;
    parent.add(eastAve);

    // Curbs along East Campus Avenue
    const eaCurbW = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 34), curbMat);
    eaCurbW.position.set(85.9, 0.12, -31);
    parent.add(eaCurbW);

    const eaCurbE = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 34), curbMat);
    eaCurbE.position.set(92.1, 0.12, -31);
    parent.add(eaCurbE);

    // ---------------------------------------------------------
    // 2. SCHOOL CAMPUS COMPOUND GROUND & OPEN PLAYGROUND
    // ---------------------------------------------------------
    // Campus Dimensions: Width 30m (X: 58 to 88), Depth 30m (Z: -44 to -14)
    const campusBaseMat = new THREE.MeshLambertMaterial({ color: 0x8f938a }); // Compacted campus soil & gravel
    const campusBase = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), campusBaseMat);
    campusBase.rotation.x = -Math.PI / 2;
    campusBase.position.set(73, 0.024, -29);
    campusBase.receiveShadow = true;
    parent.add(campusBase);

    // Open Grass Playground in Campus Center (Width 16m, Depth 12m)
    const grassPlaygroundMat = new THREE.MeshLambertMaterial({ color: 0x487034 }); // Vibrant school playing field
    const playground = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), grassPlaygroundMat);
    playground.rotation.x = -Math.PI / 2;
    playground.position.set(73, 0.026, -34);
    playground.receiveShadow = true;
    parent.add(playground);

    // Paved Brick Perimeter Walkways around Playground & connecting all wings
    const pWalkN = new THREE.Mesh(new THREE.PlaneGeometry(24, 2.4), brickMat);
    pWalkN.rotation.x = -Math.PI / 2;
    pWalkN.position.set(73, 0.027, -41.8);
    parent.add(pWalkN);

    const pWalkS = new THREE.Mesh(new THREE.PlaneGeometry(24, 2.4), brickMat);
    pWalkS.rotation.x = -Math.PI / 2;
    pWalkS.position.set(73, 0.027, -26.8);
    parent.add(pWalkS);

    // ---------------------------------------------------------
    // 3. BOUNDARY WALL & ENTRANCE GATES
    // ---------------------------------------------------------
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xba6848 });  // Academic terracotta brick wall
    const wallCapMat = new THREE.MeshLambertMaterial({ color: 0xededed });// Concrete coping
    const wallH = 1.4; // Waist-height (1.4m) tactical boundary wall

    const addWallSeg = (wx, wz, ww, wd) => {
      const seg = new THREE.Mesh(new THREE.BoxGeometry(ww, wallH, wd), wallMat);
      seg.position.set(wx, wallH / 2, wz);
      seg.castShadow = true;
      parent.add(seg);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(ww + 0.1, 0.12, wd + 0.1), wallCapMat);
      cap.position.set(wx, wallH + 0.06, wz);
      parent.add(cap);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(wx - ww / 2, 0, wz - wd / 2),
        new THREE.Vector3(wx + ww / 2, wallH + 0.5, wz + wd / 2)
      ));
    };

    // North Boundary Wall along Z = -44 (Span X: 58 to 88 with Main Gate at X = 73)
    // North West section: from X = 58 to 69.5 (Length 11.5m)
    addWallSeg(63.75, -44, 11.5, 0.35);
    // North East section: from X = 76.5 to 88 (Length 11.5m)
    addWallSeg(82.25, -44, 11.5, 0.35);

    // South Boundary Wall along Z = -14 (Span X: 58 to 88, Length 30m)
    addWallSeg(73.0, -14, 30.0, 0.35);

    // East Boundary Wall along X = 88 (Span Z: -44 to -14, Length 30m)
    addWallSeg(88.0, -29.0, 0.35, 30.0);

    // West Boundary Wall along X = 58 (Span Z: -44 to -14 with Secondary Gate at Z = -29)
    // West North section: from Z = -44 to -31 (Length 13.0m)
    addWallSeg(58.0, -37.5, 0.35, 13.0);
    // West South section: from Z = -27 to -14 (Length 13.0m)
    addWallSeg(58.0, -20.5, 0.35, 13.0);

    // A. Main Entrance Gate Pillars & Overhead Steel Arch (at X = 73, Z = -44)
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0x16447e }); // Navy academic pillar
    const pGeo = new THREE.BoxGeometry(0.8, 3.2, 0.8);
    for (let gx of [69.5, 76.5]) {
      const pillar = new THREE.Mesh(pGeo, pillarMat);
      pillar.position.set(gx, 1.6, -44);
      pillar.castShadow = true;
      parent.add(pillar);

      const pCap = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.25, 1.0), new THREE.MeshLambertMaterial({ color: 0xf5b700 }));
      pCap.position.set(gx, 3.3, -44);
      parent.add(pCap);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(gx - 0.5, 0, -44.5),
        new THREE.Vector3(gx + 0.5, 3.6, -43.5)
      ));
    }

    // Overhead Steel Gate Arch: "SCHOOL"
    const archMat = new THREE.MeshLambertMaterial({ color: 0x16447e });
    const archBar = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.5, 0.2), archMat);
    archBar.position.set(73, 3.5, -44);
    parent.add(archBar);

    // Bold Simple Sign: "SCHOOL"
    const schoolSignCanvas = document.createElement('canvas');
    schoolSignCanvas.width = 512; schoolSignCanvas.height = 128;
    const ssCtx = schoolSignCanvas.getContext('2d');
    ssCtx.fillStyle = '#0c2340'; // Deep academic navy
    ssCtx.fillRect(0, 0, 512, 128);
    ssCtx.strokeStyle = '#f5b700'; // Gold border
    ssCtx.lineWidth = 6;
    ssCtx.strokeRect(6, 6, 500, 116);

    ssCtx.fillStyle = '#ffffff';
    ssCtx.font = 'bold 50px sans-serif';
    ssCtx.textAlign = 'center';
    ssCtx.fillText('SCHOOL', 256, 58);

    ssCtx.fillStyle = '#f5b700';
    ssCtx.font = 'bold 24px sans-serif';
    ssCtx.fillText('মাগুরা মডেল স্কুল ও কলেজ', 256, 102);

    const schoolSignTex = new THREE.CanvasTexture(schoolSignCanvas);
    const gateSign = new THREE.Mesh(
      new THREE.PlaneGeometry(6.4, 0.9),
      new THREE.MeshLambertMaterial({ map: schoolSignTex })
    );
    gateSign.position.set(73, 4.0, -43.88);
    parent.add(gateSign);

    // B. West Pedestrian Gate Pillars (at X = 58, Z = -29)
    for (let gz of [-31.0, -27.0]) {
      const wPil = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.8, 0.7), pillarMat);
      wPil.position.set(58, 1.4, gz);
      wPil.castShadow = true;
      parent.add(wPil);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(57.6, 0, gz - 0.4),
        new THREE.Vector3(58.4, 3.0, gz + 0.4)
      ));
    }

    // ---------------------------------------------------------
    // 4. MAIN SCHOOL/COLLEGE BUILDING ("SCHOOL")
    // ---------------------------------------------------------
    // Position: X = 73, Z = -20 (Facing North toward playground)
    // Dimensions: Width 14m, Depth 9m, Height 8.5m (2.5 floors)
    const mainFacadeTex = TextureFactory.createBuildingFacadeTexture('#e3ded6', 4, 3);
    const mainMat = new THREE.MeshLambertMaterial({ map: mainFacadeTex });
    const navyMat = new THREE.MeshLambertMaterial({ color: 0x16447e });
    const brickRedMat = new THREE.MeshLambertMaterial({ color: 0xb85d38 });

    const mainSchool = new THREE.Mesh(new THREE.BoxGeometry(14, 8.5, 9), mainMat);
    mainSchool.position.set(73, 4.25, -20);
    mainSchool.castShadow = true;
    mainSchool.receiveShadow = true;
    parent.add(mainSchool);

    // Red Brick Skirting Base
    const schoolBase = new THREE.Mesh(new THREE.BoxGeometry(14.1, 0.6, 9.1), brickRedMat);
    schoolBase.position.set(73, 0.3, -20);
    parent.add(schoolBase);

    // Covered Ground-Floor Entrance Veranda / Portico (Projects North: Width 14m, Depth 2.4m, Height 3.4m)
    const verandaRoof = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.3, 2.4), new THREE.MeshLambertMaterial({ color: 0xededed }));
    verandaRoof.position.set(73, 3.4, -25.7);
    verandaRoof.castShadow = true;
    parent.add(verandaRoof);

    // Veranda Support Columns (Waist/chest tactical cover)
    for (let cx of [67, 70, 73, 76, 79]) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.4, 0.4), navyMat);
      col.position.set(cx, 1.7, -26.7);
      col.castShadow = true;
      parent.add(col);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(cx - 0.25, 0, -26.95),
        new THREE.Vector3(cx + 0.25, 3.6, -26.45)
      ));
    }

    // Main Entrance Doors under veranda
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x3d271d });
    const mainDoor = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.6), doorMat);
    mainDoor.position.set(73, 1.3, -24.52);
    parent.add(mainDoor);

    // Signboard over Veranda: "SCHOOL"
    const mSign = new THREE.Mesh(
      new THREE.PlaneGeometry(6.2, 1.0),
      new THREE.MeshLambertMaterial({ map: schoolSignTex })
    );
    mSign.position.set(73, 4.2, -24.48);
    parent.add(mSign);

    // Rooftop Academic Clock Tower / Cupola
    const towerMat = new THREE.MeshLambertMaterial({ color: 0xd9d3c7 });
    const tower = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.6, 2.8), towerMat);
    tower.position.set(73, 9.8, -20);
    tower.castShadow = true;
    parent.add(tower);

    // Tower Roof Pyramid
    const spireMat = new THREE.MeshLambertMaterial({ color: 0x16447e });
    const spire = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.6, 4), spireMat);
    spire.position.set(73, 11.9, -20);
    spire.rotation.y = Math.PI / 4;
    parent.add(spire);

    // Circular Clock Face
    const clockMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.65, 16), clockMat);
    clockFace.position.set(73, 9.8, -18.59);
    parent.add(clockFace);

    // Main Building Collider
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(65.6, 0, -24.8),
      new THREE.Vector3(80.4, 10.0, -15.2)
    ));

    // ---------------------------------------------------------
    // 5. CONNECTED CLASSROOM BUILDINGS
    // ---------------------------------------------------------

    // A. Classroom Wing 1 (Science & Computer Lab Wing - East side)
    // Position: X = 83, Z = -28 (Width 8m, Depth 10m, Height 6.2m, 2 floors)
    const cr1Mat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createBuildingFacadeTexture('#e8e4dc', 3, 2)
    });
    const crWing1 = new THREE.Mesh(new THREE.BoxGeometry(8, 6.2, 10), cr1Mat);
    crWing1.position.set(83, 3.1, -28);
    crWing1.castShadow = true;
    parent.add(crWing1);

    const cr1Base = new THREE.Mesh(new THREE.BoxGeometry(8.1, 0.5, 10.1), navyMat);
    cr1Base.position.set(83, 0.25, -28);
    parent.add(cr1Base);

    // Signboard for Science Wing
    const sciSignTex = this.createPoliceSignTexture('SCIENCE & LAB WING', 'বিজ্ঞান ও কম্পিউটার ল্যাব ভবন');
    const sciSign = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 0.8),
      new THREE.MeshLambertMaterial({ map: sciSignTex })
    );
    sciSign.position.set(83, 3.8, -33.05);
    parent.add(sciSign);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(78.8, 0, -33.2),
      new THREE.Vector3(87.2, 7.0, -22.8)
    ));

    // B. Classroom Wing 2 (Arts & Primary Classrooms - West side)
    // Position: X = 63, Z = -28 (Width 8m, Depth 9m, Height 6.2m, 2 floors)
    const cr2Mat = new THREE.MeshLambertMaterial({
      map: TextureFactory.createBuildingFacadeTexture('#ded8ce', 3, 2)
    });
    const crWing2 = new THREE.Mesh(new THREE.BoxGeometry(8, 6.2, 9), cr2Mat);
    crWing2.position.set(63, 3.1, -28);
    crWing2.castShadow = true;
    parent.add(crWing2);

    const cr2Base = new THREE.Mesh(new THREE.BoxGeometry(8.1, 0.5, 9.1), brickRedMat);
    cr2Base.position.set(63, 0.25, -28);
    parent.add(cr2Base);

    // Signboard for Classroom Wing 2
    const artsSignTex = this.createPoliceSignTexture('ARTS & CLASSROOMS', 'কলা ও প্রাথমিক শিক্ষা শাখা');
    const artsSign = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 0.8),
      new THREE.MeshLambertMaterial({ map: artsSignTex })
    );
    artsSign.position.set(63, 3.8, -32.55);
    parent.add(artsSign);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(58.8, 0, -32.7),
      new THREE.Vector3(67.2, 7.0, -23.3)
    ));

    // ---------------------------------------------------------
    // 6. COVERED VERANDAS & CONNECTING WALKWAYS
    // ---------------------------------------------------------
    // Covered Corridor connecting Main Building to East Science Wing
    const corrEMat = new THREE.MeshLambertMaterial({ color: 0xededed });
    const corrERoof = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.25, 2.4), corrEMat);
    corrERoof.position.set(80, 3.2, -23.5);
    corrERoof.castShadow = true;
    parent.add(corrERoof);

    const colE = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.2, 0.35), navyMat);
    colE.position.set(80, 1.6, -24.5);
    parent.add(colE);
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(79.7, 0, -24.8),
      new THREE.Vector3(80.3, 3.4, -24.2)
    ));

    // Covered Corridor connecting Main Building to West Classroom Wing
    const corrWRoof = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.25, 2.4), corrEMat);
    corrWRoof.position.set(66, 3.2, -23.5);
    corrWRoof.castShadow = true;
    parent.add(corrWRoof);

    const colW = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.2, 0.35), navyMat);
    colW.position.set(66, 1.6, -24.5);
    parent.add(colW);
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(65.7, 0, -24.8),
      new THREE.Vector3(66.3, 3.4, -24.2)
    ));

    // ---------------------------------------------------------
    // 7. PLAYGROUND OBJECTS & FURNITURE
    // ---------------------------------------------------------

    // A. School Flagpole (Central campus flagpole with stepped base)
    const fpGroup = new THREE.Group();
    fpGroup.position.set(73, 0.02, -34);

    const fpStep1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 2.4), new THREE.MeshLambertMaterial({ color: 0xededed }));
    fpStep1.position.y = 0.1;
    fpGroup.add(fpStep1);

    const fpStep2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 1.6), new THREE.MeshLambertMaterial({ color: 0x16447e }));
    fpStep2.position.y = 0.3;
    fpGroup.add(fpStep2);

    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 7.5, 8);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0xdcdcdc });
    const poleMesh = new THREE.Mesh(poleGeo, poleMat);
    poleMesh.position.y = 3.95;
    poleMesh.castShadow = true;
    fpGroup.add(poleMesh);

    // Bangladeshi Flag on Flagpole (Green field with red circle)
    const flagGeo = new THREE.PlaneGeometry(1.8, 1.1);
    const flagMat = new THREE.MeshLambertMaterial({ color: 0x006a4e, side: THREE.DoubleSide });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0.9, 7.0, 0);
    fpGroup.add(flag);

    const redDotGeo = new THREE.CircleGeometry(0.35, 16);
    const redDotMat = new THREE.MeshLambertMaterial({ color: 0xf42a41 });
    const redDot1 = new THREE.Mesh(redDotGeo, redDotMat);
    redDot1.position.set(0.8, 7.0, 0.01);
    fpGroup.add(redDot1);
    const redDot2 = new THREE.Mesh(redDotGeo, redDotMat);
    redDot2.position.set(0.8, 7.0, -0.01);
    redDot2.rotation.y = Math.PI;
    fpGroup.add(redDot2);

    parent.add(fpGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(71.8, 0, -35.2),
      new THREE.Vector3(74.2, 1.2, -32.8)
    ));

    // B. Soccer Goal Posts (2 Steel Goalposts on North and South ends of playground)
    const addGoalPost = (gx, gz, rotY) => {
      const gGroup = new THREE.Group();
      gGroup.position.set(gx, 0.02, gz);
      gGroup.rotation.y = rotY;

      const postMat = new THREE.MeshLambertMaterial({ color: 0xf0f0f0 });
      const postRadius = 0.06;

      // Crossbar (Width 3.6m, Height 2.0m)
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, 3.6, 8), postMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 2.0, 0);
      gGroup.add(bar);

      // Left & Right upright posts
      for (let px of [-1.8, 1.8]) {
        const up = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, 2.0, 8), postMat);
        up.position.set(px, 1.0, 0);
        gGroup.add(up);

        // Ground depth support bar
        const dBar = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, 1.0, 8), postMat);
        dBar.rotation.x = Math.PI / 2;
        dBar.position.set(px, 0.06, -0.5);
        gGroup.add(dBar);
      }

      parent.add(gGroup);

      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(gx - 2.0, 0, gz - 0.8),
        new THREE.Vector3(gx + 2.0, 2.2, gz + 0.8)
      ));
    };

    // North goalpost (Facing South)
    addGoalPost(73, -39.5, 0);
    // South goalpost (Facing North)
    addGoalPost(73, -28.5, Math.PI);

    // C. Campus Benches around playground
    this.createTownSquareBench(parent, 64.0, -34.0, Math.PI / 2); // West playground bench
    this.createTownSquareBench(parent, 82.0, -34.0, -Math.PI / 2);// East playground bench
    this.createTownSquareBench(parent, 78.5, -42.0, 0);             // North gate walkway bench

    // ---------------------------------------------------------
    // 8. BICYCLE & MOTORCYCLE PARKING SHED
    // ---------------------------------------------------------
    // Located near Main Gate at X = 63, Z = -41.5
    const parkGroup = new THREE.Group();
    parkGroup.position.set(63, 0.02, -41.5);

    // Concrete Parking Slab
    const parkSlab = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 2.6), brickMat);
    parkSlab.rotation.x = -Math.PI / 2;
    parkSlab.receiveShadow = true;
    parkGroup.add(parkSlab);

    // Corrugated Tin Roof
    const tinMat = new THREE.MeshLambertMaterial({ color: 0x8a9296 });
    const tinRoof = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.1, 2.8), tinMat);
    tinRoof.position.set(0, 2.4, 0);
    tinRoof.rotation.x = 0.06;
    tinRoof.castShadow = true;
    parkGroup.add(tinRoof);

    // 4 Corner Metal Posts
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x3d444d });
    for (let sx of [-2.6, 2.6]) {
      for (let sz of [-1.2, 1.2]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6), metalMat);
        post.position.set(sx, 1.2, sz);
        parkGroup.add(post);
      }
    }
    parent.add(parkGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(60.0, 0, -43.0),
      new THREE.Vector3(66.0, 2.5, -40.0)
    ));

    // Parked Bicycles in shed
    this.createBicycle(parent, 61.5, 0.02, -41.5, Math.PI / 2);
    this.createBicycle(parent, 62.8, 0.02, -41.5, Math.PI / 2);

    // Parked Commuter Motorbike in shed
    this.createMotorbike(parent, 64.5, 0.02, -41.5, Math.PI / 2);

    // ---------------------------------------------------------
    // 9. CAMPUS TREES & VEGETATION
    // ---------------------------------------------------------
    // Leafy shade trees in playground corners
    this.createShadeTree(parent, 60.5, -36.0);
    this.createShadeTree(parent, 85.5, -37.0);

    // Coconut / Betel nut palms along boundary walls
    this.createCoconutPalm(parent, 86.0, -18.0);
    this.createCoconutPalm(parent, 60.0, -18.0);

    // Campus waste disposal bins
    this.createPublicWasteBin(parent, 68.0, -42.5);
    this.createPublicWasteBin(parent, 77.0, -25.5);

    // Directional Signpost at College Road entrance
    this.createDirectionalSignpost(parent, 68.5, -45.5, 'মডেল স্কুল ও কলেজ ➔ • SCHOOL CAMPUS', '#0c2340');
  },

  // ---------------------------------------------------------------------------
  // 18. MAGURA TOWN COMPLETE INTERCONNECTIONS, FPS ROUTES & TACTICAL POLISH
  // (টাউন আন্তঃসংযোগ, ট্যাকটিক্যাল রুট, কাভার ও ওপেন স্পেস পলিশ)
  // ---------------------------------------------------------------------------
  createTownInterconnectionsAndPolish: function(parent) {
    const roadTex = TextureFactory.createRoadTexture();
    const brickTex = TextureFactory.createBrickPavementTexture();
    brickTex.repeat.set(3, 2);
    const swTex = TextureFactory.createSidewalkTexture();
    swTex.repeat.set(2, 6);
    const curbTex = TextureFactory.createCurbTexture();
    curbTex.repeat.set(8, 1);

    const roadMat = new THREE.MeshLambertMaterial({ map: roadTex });
    const brickMat = new THREE.MeshLambertMaterial({ map: brickTex });
    const swMat = new THREE.MeshLambertMaterial({ map: swTex });
    const curbMat = new THREE.MeshLambertMaterial({ map: curbTex });

    // =========================================================
    // CORRIDOR 1: WEST LINK — HOSPITAL TO BORO BAZAR & FREIGHT DEPOT
    // =========================================================
    // Primary Asphalt Connector Road (X = -86.5 from Z = -36 south to Z = -20, Length 16m, Width 6.5m)
    const hospBazarLink = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 16), roadMat);
    hospBazarLink.rotation.x = -Math.PI / 2;
    hospBazarLink.position.set(-86.5, 0.022, -28);
    hospBazarLink.receiveShadow = true;
    parent.add(hospBazarLink);

    // Curbs along West Road Link
    const hblCurbW = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 16), curbMat);
    hblCurbW.position.set(-89.9, 0.12, -28);
    parent.add(hblCurbW);

    // Secondary Paved Brick Depot Alley (Along X = -72 from Z = -36 to Z = -20, Length 16m, Width 5.5m)
    const depotAlley = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 16), brickMat);
    depotAlley.rotation.x = -Math.PI / 2;
    depotAlley.position.set(-72, 0.024, -28);
    depotAlley.receiveShadow = true;
    parent.add(depotAlley);

    // Wholesale Produce Freight Yard Base (X: -65 to -84, Z: -20 to -36, Size 19m x 16m)
    const yardBaseMat = new THREE.MeshLambertMaterial({ color: 0x7c7365 }); // Compacted dirt & gravel depot yard
    const yardBase = new THREE.Mesh(new THREE.PlaneGeometry(19, 16), yardBaseMat);
    yardBase.rotation.x = -Math.PI / 2;
    yardBase.position.set(-74.5, 0.021, -28);
    yardBase.receiveShadow = true;
    parent.add(yardBase);

    // Wholesale Produce Warehouse Building: "মেসার্স মাগুরা এগ্রো অ্যান্ড ফ্রুটস আড়ত"
    // Position: X = -74, Z = -33. Dimensions: Width 9m, Depth 7m, Height 5.0m
    const whFacadeTex = TextureFactory.createBuildingFacadeTexture('#e3ded3', 3, 2);
    const whMat = new THREE.MeshLambertMaterial({ map: whFacadeTex });
    const whBuilding = new THREE.Mesh(new THREE.BoxGeometry(9, 5.0, 7), whMat);
    whBuilding.position.set(-74, 2.5, -33);
    whBuilding.castShadow = true;
    whBuilding.receiveShadow = true;
    parent.add(whBuilding);

    // Concrete Freight Loading Dock Platform (Height 0.5m, Width 9m, Depth 2.5m)
    const dockMat = new THREE.MeshLambertMaterial({ color: 0x9fa4a6 });
    const loadingDock = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.5, 2.5), dockMat);
    loadingDock.position.set(-74, 0.25, -28.25);
    loadingDock.receiveShadow = true;
    parent.add(loadingDock);

    // Corrugated Tin Canopy over Loading Dock
    const whCanopy = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.1, 2.8), new THREE.MeshLambertMaterial({ color: 0x5a6369 }));
    whCanopy.position.set(-74, 3.4, -28.25);
    whCanopy.rotation.x = 0.08;
    whCanopy.castShadow = true;
    parent.add(whCanopy);

    // Warehouse Signboard
    const whSignTex = TextureFactory.createBengaliSignTexture(
      'মাগুরা এগ্রো ফ্রুটস আড়ত',
      'পাইকারি ফল, আলু ও কাঁচামাল কমিশন এজেন্ট',
      'আমদানি ও রপ্তানি',
      'green'
    );
    const whSign = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 0.8), new THREE.MeshLambertMaterial({ map: whSignTex }));
    whSign.position.set(-74, 3.8, -29.45);
    parent.add(whSign);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(-78.8, 0, -36.8),
      new THREE.Vector3(-69.2, 6.0, -27.0)
    ));

    // Tactical FPS Cover in Freight Yard: Stacked Produce Crates & Fruit Boxes
    this.createSupplyCrates(parent, -72.0, -25.5);
    this.createSupplyCrates(parent, -82.0, -24.0);

    // Parked Flatbed Cargo Rickshaw Van in Freight Yard
    this.createRickshawVan(parent, -79.0, 0.02, -28.0, 0.3);

    // Directional Signpost at Freight Yard Junction
    this.createDirectionalSignpost(parent, -85.0, -21.0, 'বড় বাজার ও আড়ত ➔ • BORO BAZAR', '#2e7d32');
    this.createDirectionalSignpost(parent, -85.0, -35.0, 'সদর হাসপাতাল ➔ • SADAR HOSPITAL', '#b71c1c');

    // =========================================================
    // CORRIDOR 2: EAST LINK — SCHOOL CAMPUS TO POLICE LINES & STADIUM ROAD
    // =========================================================
    // Paved Asphalt East Avenue (Along X = 89 from Z = -14 south to Z = 25, Length 39m, Width 6.5m)
    const campusPoliceEastAve = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 39), roadMat);
    campusPoliceEastAve.rotation.x = -Math.PI / 2;
    campusPoliceEastAve.position.set(89, 0.022, 5.5);
    campusPoliceEastAve.receiveShadow = true;
    parent.add(campusPoliceEastAve);

    // East curbs along Avenue
    const cpeaCurbE = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 39), curbMat);
    cpeaCurbE.position.set(92.4, 0.12, 5.5);
    parent.add(cpeaCurbE);

    // West curbs along Avenue
    const cpeaCurbW = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 39), curbMat);
    cpeaCurbW.position.set(85.6, 0.12, 5.5);
    parent.add(cpeaCurbW);

    // Paved Brick Link connecting East Ave to Police Lines Sally Port (Along Z = 6 from X = 89 to X = 40, Length 49m, Width 5.0m)
    const sallyPortEastConnector = new THREE.Mesh(new THREE.PlaneGeometry(49, 5.0), brickMat);
    sallyPortEastConnector.rotation.x = -Math.PI / 2;
    sallyPortEastConnector.position.set(64.5, 0.023, 6);
    sallyPortEastConnector.receiveShadow = true;
    parent.add(sallyPortEastConnector);

    // East Police Checkpoint & Vehicle Inspection Shed (X = 82, Z = 14)
    const cpGroup = new THREE.Group();
    cpGroup.position.set(82, 0.02, 14);

    const cpRoof = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.1, 4.5), new THREE.MeshLambertMaterial({ color: 0x3d444d }));
    cpRoof.position.y = 3.2;
    cpGroup.add(cpRoof);

    const cpPostMat = new THREE.MeshLambertMaterial({ color: 0x16447e });
    for (let cx of [-3.4, 3.4]) {
      for (let cz of [-2.0, 2.0]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 6), cpPostMat);
        post.position.set(cx, 1.6, cz);
        cpGroup.add(post);
      }
    }
    parent.add(cpGroup);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(78.0, 0, 11.5),
      new THREE.Vector3(86.0, 3.4, 16.5)
    ));

    // Police Sandbag Emplacement Barrier at East Checkpoint
    this.createSandbagEmplacement(parent, 89.0, 14.0, Math.PI / 2);

    // Parked Police Pickup under Inspection Shed
    this.createPolicePickup(parent, 82.0, 0.02, 14.0, 0);

    // Directional Signpost at East Police Junction
    this.createDirectionalSignpost(parent, 86.0, 24.0, 'পুলিশ লাইনস ও স্টেডিয়াম • POLICE LINES', '#0c2340');

    // =========================================================
    // CORRIDOR 3: NORTH LINK — VAYNAR MOR NORTH RING BYPASS
    // =========================================================
    // East-West Asphalt Bypass Road (Along Z = -94 from X = -40 to +40, Length 80m, Width 8.0m)
    const ringBypass = new THREE.Mesh(new THREE.PlaneGeometry(80, 8.0), roadMat);
    ringBypass.rotation.x = -Math.PI / 2;
    ringBypass.position.set(0, 0.022, -94);
    ringBypass.receiveShadow = true;
    parent.add(ringBypass);

    // North & South Curbs along Bypass
    const rbCurbN = new THREE.Mesh(new THREE.BoxGeometry(80, 0.24, 0.25), curbMat);
    rbCurbN.position.set(0, 0.12, -98.15);
    parent.add(rbCurbN);

    const rbCurbS = new THREE.Mesh(new THREE.BoxGeometry(80, 0.24, 0.25), curbMat);
    rbCurbS.position.set(0, 0.12, -89.85);
    parent.add(rbCurbS);

    // Pedestrian Sidewalks along Ring Bypass
    const rbSwN = new THREE.Mesh(new THREE.BoxGeometry(80, 0.2, 1.8), swMat);
    rbSwN.position.set(0, 0.1, -99.15);
    parent.add(rbSwN);

    const rbSwS = new THREE.Mesh(new THREE.BoxGeometry(80, 0.2, 1.8), swMat);
    rbSwS.position.set(0, 0.1, -88.85);
    parent.add(rbSwS);

    // Crosswalk Striping at Ring Bypass Intersections
    const cwTex = TextureFactory.createCrosswalkTexture();
    const cwMat = new THREE.MeshLambertMaterial({ map: cwTex, transparent: true });

    // West crosswalk (at X = -40)
    const cwW = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 8.0), cwMat);
    cwW.rotation.x = -Math.PI / 2;
    cwW.position.set(-36, 0.028, -94);
    parent.add(cwW);

    // East crosswalk (at X = +40)
    const cwE = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 8.0), cwMat);
    cwE.rotation.x = -Math.PI / 2;
    cwE.position.set(36, 0.028, -94);
    parent.add(cwE);

    // Directional Signposts at Ring Bypass
    this.createDirectionalSignpost(parent, -38.0, -92.0, 'ভায়নার মোড় ও ঢাকা হাইওয়ে ➔ • VAYNAR MOR', '#0c2340');
    this.createDirectionalSignpost(parent, 38.0, -92.0, 'মডেল স্কুল ও কলেজ রোড ➔ • COLLEGE RD', '#0c2340');

    // =========================================================
    // CORRIDOR 4: SOUTH LINK — NABAGANGA RIVERSIDE PROMENADE
    // =========================================================
    // Waterfront Promenade Roadway (Along Z = 105 from X = -45 to +45, Length 90m, Width 7.0m)
    const riverPromenade = new THREE.Mesh(new THREE.PlaneGeometry(90, 7.0), roadMat);
    riverPromenade.rotation.x = -Math.PI / 2;
    riverPromenade.position.set(0, 0.022, 105);
    riverPromenade.receiveShadow = true;
    parent.add(riverPromenade);

    // Concrete River Embankment Safety Wall overlooking Nabaganga River (Length 90m, Height 1.2m)
    this.createEmbankmentWallSegment(parent, 0, 108.6, 90.0);

    // 3 Riverside Benches along promenade for tactical cover
    this.createTownSquareBench(parent, -32.0, 107.2, Math.PI);
    this.createTownSquareBench(parent, 0.0, 107.2, Math.PI);
    this.createTownSquareBench(parent, 32.0, 107.2, Math.PI);

    // Riverside Cargo Drum Stacks for tactical cover
    this.createCargoDrumStack(parent, -26.0, 103.5);
    this.createCargoDrumStack(parent, 25.0, 103.5);

    // Riverside Tea Stall along promenade
    this.createRiversideTeaStall(parent, 14.0, 103.5, 0);

    // =========================================================
    // EXPANSION: MODEL TOWN RESIDENTIAL LANE & COMMUNITY CLINIC
    // =========================================================
    // Residential Brick Street (Along X = 58 from Z = -52 to -88, Length 36m, Width 6.5m)
    const modelTownLane = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 36), brickMat);
    modelTownLane.rotation.x = -Math.PI / 2;
    modelTownLane.position.set(58, 0.023, -70);
    modelTownLane.receiveShadow = true;
    parent.add(modelTownLane);

    // Curbs along Model Town Lane
    const mtlCurbE = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.24, 36), curbMat);
    mtlCurbE.position.set(61.4, 0.12, -70);
    parent.add(mtlCurbE);

    // Building 1: Magura Community Clinic & Pharmacy ("মাগুরা ডায়াবেটিক ও ডেন্টাল ক্লিনিক")
    // Position: X = 67, Z = -70. Dimensions: Width 11m, Depth 8m, Height 6.5m (2 floors)
    const clinicTex = TextureFactory.createBuildingFacadeTexture('#e3ece9', 3, 2);
    const clinicMat = new THREE.MeshLambertMaterial({ map: clinicTex });
    const clinicBuilding = new THREE.Mesh(new THREE.BoxGeometry(11, 6.5, 8), clinicMat);
    clinicBuilding.position.set(67, 3.25, -70);
    clinicBuilding.castShadow = true;
    clinicBuilding.receiveShadow = true;
    parent.add(clinicBuilding);

    // Green Skirting Base
    const clinicBase = new THREE.Mesh(new THREE.BoxGeometry(11.1, 0.5, 8.1), new THREE.MeshLambertMaterial({ color: 0x1b4332 }));
    clinicBase.position.set(67, 0.25, -70);
    parent.add(clinicBase);

    // Pharmacy Signboard
    const clinicSignTex = TextureFactory.createBengaliSignTexture(
      'মাগুরা ডায়াবেটিক ও ডেন্টাল ক্লিনিক',
      'অভিজ্ঞ ডাক্তার দ্বারা চিকিৎসা ও ডিজিটাল ল্যাব',
      'ঔষধের দোকান ২৪ ঘণ্টা খোলা',
      'green'
    );
    const clinicSign = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 0.85), new THREE.MeshLambertMaterial({ map: clinicSignTex }));
    clinicSign.position.set(61.45, 3.8, -70);
    clinicSign.rotation.y = -Math.PI / 2;
    parent.add(clinicSign);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(61.2, 0, -74.4),
      new THREE.Vector3(72.8, 7.5, -65.6)
    ));

    // Building 2: Rose Villa Residential House ("রোজ ভিলা")
    // Position: X = 67, Z = -84. Dimensions: Width 11m, Depth 9m, Height 6.5m (2 floors)
    const villaTex = TextureFactory.createBuildingFacadeTexture('#d6cdc0', 3, 2);
    const villaBuilding = new THREE.Mesh(new THREE.BoxGeometry(11, 6.5, 9), new THREE.MeshLambertMaterial({ map: villaTex }));
    villaBuilding.position.set(67, 3.25, -84);
    villaBuilding.castShadow = true;
    villaBuilding.receiveShadow = true;
    parent.add(villaBuilding);

    // Balcony on 2nd Floor
    const vBalc = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 5.0), new THREE.MeshLambertMaterial({ color: 0x8a8e94 }));
    vBalc.position.set(60.8, 3.6, -84);
    parent.add(vBalc);

    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(61.0, 0, -88.8),
      new THREE.Vector3(72.8, 7.5, -79.2)
    ));

    // Parked Passenger Tempo in Model Town Lane
    this.createPassengerTempo(parent, 55.5, 0.02, -76.0, Math.PI / 2);

    // Courtyard Trees & Bench in Model Town
    this.createShadeTree(parent, 54.0, -64.0);
    this.createTownSquareBench(parent, 55.0, -80.0, Math.PI / 2);

    // Directional Signpost at Model Town Entry
    this.createDirectionalSignpost(parent, 56.0, -51.0, 'মডেল টাউন ও ক্লিনিক লেন ➔ • MODEL TOWN', '#1b4332');

    // =========================================================
    // 19. FPS COMBAT FLOW & COVER POLISH ACROSS 8 COMBAT ZONES
    // =========================================================
    // Zone 1: Vaynar Mor (Roundabout & Crossroads)
    // Concrete jersey barriers for hip/crouch height street cover
    const barrierMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const jb1 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.9, 0.5), barrierMat);
    jb1.position.set(-5.0, 0.45, -88.0);
    parent.add(jb1);
    this.colliders.push(new THREE.Box3(new THREE.Vector3(-7.2, 0, -88.5), new THREE.Vector3(-2.8, 1.0, -87.5)));

    const jb2 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.9, 0.5), barrierMat);
    jb2.position.set(5.0, 0.45, -88.0);
    parent.add(jb2);
    this.colliders.push(new THREE.Box3(new THREE.Vector3(2.8, 0, -88.5), new THREE.Vector3(7.2, 1.0, -87.5)));

    // Parked Green CNG at Vaynar Mor North-West curb
    this.createCNGAutoRickshaw(parent, -12.0, 0.02, -92.0, -0.3);

    // Zone 2: Magura Sadar Hospital & Emergency Campus
    // Low hospital lawn brick wall (0.9m height) providing crouch fire positions
    const hospWallMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const hWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 12.0), hospWallMat);
    hWall.position.set(-56.0, 0.45, -54.0);
    parent.add(hWall);
    this.colliders.push(new THREE.Box3(new THREE.Vector3(-56.3, 0, -60.2), new THREE.Vector3(-55.7, 1.0, -47.8)));

    // Stacked medical supply crates near ambulance parking bay
    this.createSupplyCrates(parent, -61.0, -51.0);

    // Zone 3: Magura Model School & College Campus
    // Landscaped Planter Box cover flanking entrance gate
    this.createLandscapedPlanter(parent, 64.0, -46.0);
    // School courtyard bench for field cover
    this.createTownSquareBench(parent, 82.0, -28.0, 0);

    // Zone 4: Magura Boro Bazar Commercial Haat & Kacha Bazar
    // Haat Square produce vendor cart & vegetable crates
    this.createSupplyCrates(parent, -45.0, 5.0);
    this.createSupplyCrates(parent, -55.0, 15.0);
    // Spice Alley crate stack for tactical corner peeking
    this.createSupplyCrates(parent, -36.0, 0.0);

    // Zone 5: Police Lines Compound & Parade Ground
    // Defensive sandbag nest covering inner motor pool approach
    this.createSandbagEmplacement(parent, 38.0, 28.0, Math.PI / 2);

    // Zone 6: Town Square & Muktomoncho Grounds
    // Low stone planters along the western lawn walkway
    this.createLandscapedPlanter(parent, -16.0, 56.0);
    // Park bench near amphitheater
    this.createTownSquareBench(parent, -10.0, 74.0, Math.PI / 4);

    // Zone 7: Nabaganga Riverside Promenade & Boat Ghat
    // Riverside cargo drums and bench
    this.createCargoDrumStack(parent, 12.0, 103.5);
    this.createTownSquareBench(parent, -6.0, 101.5, 0);

    // Zone 8: Model Town Residential Streets
    // Low brick garden boundary wall (0.9m height) along Rose Villa
    const villaWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 8.0), hospWallMat);
    villaWall.position.set(61.2, 0.45, -84.0);
    parent.add(villaWall);
    this.colliders.push(new THREE.Box3(new THREE.Vector3(60.9, 0, -88.2), new THREE.Vector3(61.5, 1.0, -79.8)));
  }
};

