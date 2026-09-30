// World Builder for Battlezone Magura
// Builds high-detail, optimized 3D Bangladeshi town environment for mobile FPS

const WorldBuilder = {
  colliders: [],
  interactiveObjects: [],
  waterMesh: null,

  buildWorld: function(scene) {
    this.colliders = [];
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

    return {
      colliders: this.colliders,
      waterMesh: this.waterMesh
    };
  },

  // 1. Base Ground
  createGround: function(parent) {
    const groundGeo = new THREE.PlaneGeometry(300, 300, 4, 4);
    const groundMat = new THREE.MeshLambertMaterial({
      color: 0x4a4f3b
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
    const isWest = data.x < 0;
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
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x151515 });
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
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x181818 });
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
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x181818 });
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
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
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
      color: 0x2e6f40,
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
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x2b5329 });
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
  }
};
