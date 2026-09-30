// First-Person Weapon & Shooting System for Battlezone Magura
// Modern Tactical Assault Rifle (First-Person View)
// Features: 3D Procedural Rifle, Muzzle Flash, Recoil Physics,
// Natural Camera Tracking & Weapon Sway, ADS Aiming, Procedural Gunshot Audio, Ammo & Reload

class WeaponSystem {
  constructor(camera, scene, audioCtxGetter, fpsControllerGetter, collidersGetter) {
    this.camera = camera;
    this.scene = scene;
    this.getAudioCtx = audioCtxGetter;
    this.getFpsController = fpsControllerGetter;
    this.getColliders = collidersGetter;

    // Ammo State
    this.magCapacity = 30;
    this.magAmmo = 30;
    this.reserveAmmo = 120;
    this.isReloading = false;
    this.reloadDuration = 1.4; // seconds
    this.reloadTimer = 0;

    // Shooting Timing & Recoil
    this.fireCooldown = 0.12; // semi-auto fire limit (seconds)
    this.lastFireTime = 0;
    this.flashDuration = 0.055; // muzzle flash visible duration
    this.flashTimer = 0;

    // Recoil Vectors
    this.recoilPos = new THREE.Vector3();
    this.recoilRot = new THREE.Vector3();

    // Preallocated vectors for Zero-GC in render/shooting loops
    this._vZero = new THREE.Vector3(0, 0, 0);
    this._vMuzzleWorld = new THREE.Vector3();
    this._vCamDir = new THREE.Vector3();
    this._vTargetPoint = new THREE.Vector3();

    // Natural Movement & Sway Parameters (Hipfire vs ADS)
    this.hipPos = new THREE.Vector3(0.24, -0.21, -0.44);
    this.hipRot = new THREE.Euler(0.015, -0.04, 0.015);
    this.adsPos = new THREE.Vector3(0.0, -0.155, -0.38);
    this.adsRot = new THREE.Euler(0.0, 0.0, 0.0);

    this.currentBasePos = new THREE.Vector3().copy(this.hipPos);
    this.currentBaseRot = new THREE.Euler().copy(this.hipRot);

    this.idleTimer = 0;
    this.swayTimer = 0;

    // Current Weapon Index & Profiles (Step 9: Expandable Slots including Primary, Secondary, Sidearm & Melee)
    this.currentWeaponIndex = 0;
    this.weapons = [
      { name: 'BD-08 RIFLE', cal: 'AUTO', cap: 30, cd: 0.10, mag: 30, res: 120, dmg: 34 },
      { name: 'BD-08 TACTICAL', cal: 'SEMI', cap: 20, cd: 0.20, mag: 20, res: 80, dmg: 52 },
      { name: 'SIDEARM 9MM', cal: 'BURST', cap: 15, cd: 0.14, mag: 15, res: 60, dmg: 28 },
      { name: 'COMBAT KNIFE', cal: 'SLASH', cap: Infinity, cd: 0.35, mag: Infinity, res: Infinity, dmg: 85 }
    ];

    // Build the 3D Weapon Model
    this.initWeaponModel();

    // Attach to First-Person Camera
    this.scene.add(this.camera);
    this.camera.add(this.weaponContainer);

    // Setup DOM Elements & Listeners
    this.initHUD();
    this.initControls();

    // Lightweight Bullet Tracer & Impact Effects Pools
    this.initTracers();
    this.initImpactPool();
  }

  // Reset weapon system ammo, weapon selection, and projectile/impact pools on match start / restart
  reset() {
    this.currentWeaponIndex = 0;
    this.weapons = [
      { name: 'BD-08 RIFLE', cal: 'AUTO', cap: 30, cd: 0.10, mag: 30, res: 120, dmg: 34 },
      { name: 'BD-08 TACTICAL', cal: 'SEMI', cap: 20, cd: 0.20, mag: 20, res: 80, dmg: 52 },
      { name: 'SIDEARM 9MM', cal: 'BURST', cap: 15, cd: 0.14, mag: 15, res: 60, dmg: 28 },
      { name: 'COMBAT KNIFE', cal: 'SLASH', cap: Infinity, cd: 0.35, mag: Infinity, res: Infinity, dmg: 85 }
    ];
    const w = this.weapons[0];
    this.magCapacity = w.cap;
    this.magAmmo = w.mag;
    this.reserveAmmo = w.res;
    this.fireCooldown = w.cd;
    this.isReloading = false;
    this.isFireButtonPressed = false;
    this.fireTouchId = null;
    this.reloadTimer = 0;
    this.flashTimer = 0;
    this.recoilPos.set(0, 0, 0);
    this.recoilRot.set(0, 0, 0);

    if (this.muzzleFlash) this.muzzleFlash.visible = false;
    if (this.muzzleLight) this.muzzleLight.intensity = 0;

    // Reset all tracers
    if (this.tracers) {
      for (let i = 0; i < this.tracers.length; i++) {
        this.tracers[i].active = false;
        this.tracers[i].line.visible = false;
      }
    }

    // Reset impact pool particles
    if (this.sparkPool) {
      for (let i = 0; i < this.sparkPool.length; i++) {
        this.sparkPool[i].active = false;
        this.sparkPool[i].mesh.visible = false;
      }
    }
    if (this.dustPool) {
      for (let i = 0; i < this.dustPool.length; i++) {
        this.dustPool[i].active = false;
        this.dustPool[i].mesh.visible = false;
      }
    }
    if (this.flashPool) {
      for (let i = 0; i < this.flashPool.length; i++) {
        this.flashPool[i].active = false;
        this.flashPool[i].mesh.visible = false;
      }
    }

    this.updateHUD();

    const reloadBtn = document.getElementById('btn-reload');
    if (reloadBtn) reloadBtn.classList.remove('is-reloading', 'pulse');
    const fireBtn = document.getElementById('btn-fire');
    if (fireBtn) fireBtn.classList.remove('active');
  }

  get audioCtx() {
    return this.getAudioCtx ? this.getAudioCtx() : null;
  }

  get fpsController() {
    return this.getFpsController ? this.getFpsController() : null;
  }

  initWeaponModel() {
    // Top-level container for camera attachment
    this.weaponContainer = new THREE.Group();
    this.weaponContainer.position.copy(this.hipPos);
    this.weaponContainer.rotation.copy(this.hipRot);

    // Rifle group that undergoes local sway, bob, and recoil
    this.rifleGroup = new THREE.Group();
    this.weaponContainer.add(this.rifleGroup);

    // Optimized High-Performance Materials
    const receiverMat = new THREE.MeshPhongMaterial({
      color: 0x1a1d21,
      specular: 0x4a525d,
      shininess: 40
    });
    const darkPolymerMat = new THREE.MeshLambertMaterial({
      color: 0x121417
    });
    const barrelMetalMat = new THREE.MeshPhongMaterial({
      color: 0x22262c,
      specular: 0x5a636f,
      shininess: 55
    });
    const metalAccentMat = new THREE.MeshLambertMaterial({
      color: 0x2c3138
    });
    const brassMat = new THREE.MeshLambertMaterial({
      color: 0x8a7246
    });

    // 1. Lower Receiver (Chassis)
    const lowerGeo = new THREE.BoxGeometry(0.042, 0.076, 0.22);
    const lowerReceiver = new THREE.Mesh(lowerGeo, receiverMat);
    lowerReceiver.position.set(0, 0, 0);
    this.rifleGroup.add(lowerReceiver);

    // 2. Upper Receiver & Top Rail Mount
    const upperGeo = new THREE.BoxGeometry(0.038, 0.045, 0.25);
    const upperReceiver = new THREE.Mesh(upperGeo, receiverMat);
    upperReceiver.position.set(0, 0.046, -0.015);
    this.rifleGroup.add(upperReceiver);

    // Continuous Top Picatinny Rail
    const railGeo = new THREE.BoxGeometry(0.024, 0.012, 0.44);
    const picatinnyRail = new THREE.Mesh(railGeo, metalAccentMat);
    picatinnyRail.position.set(0, 0.072, -0.1);
    this.rifleGroup.add(picatinnyRail);

    // Ejection Port & Brass Chamber Detail (Right side)
    const portGeo = new THREE.BoxGeometry(0.008, 0.024, 0.055);
    const ejectionPort = new THREE.Mesh(portGeo, darkPolymerMat);
    ejectionPort.position.set(0.021, 0.045, -0.01);
    this.rifleGroup.add(ejectionPort);

    const brassGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.032, 6);
    const brassRound = new THREE.Mesh(brassGeo, brassMat);
    brassRound.rotation.x = Math.PI / 2;
    brassRound.position.set(0.018, 0.045, -0.01);
    this.rifleGroup.add(brassRound);

    // 3. Ergonomic Pistol Grip
    const gripGeo = new THREE.BoxGeometry(0.034, 0.115, 0.048);
    const grip = new THREE.Mesh(gripGeo, darkPolymerMat);
    grip.position.set(0, -0.078, 0.08);
    grip.rotation.x = 0.38; // angled rearward
    this.rifleGroup.add(grip);

    // Trigger Guard & Trigger
    const guardGeo = new THREE.BoxGeometry(0.012, 0.026, 0.055);
    const guard = new THREE.Mesh(guardGeo, metalAccentMat);
    guard.position.set(0, -0.042, 0.04);
    this.rifleGroup.add(guard);

    const triggerGeo = new THREE.BoxGeometry(0.006, 0.018, 0.01);
    const trigger = new THREE.Mesh(triggerGeo, brassMat);
    trigger.position.set(0, -0.038, 0.042);
    trigger.rotation.x = -0.25;
    this.rifleGroup.add(trigger);

    // 4. Curved 30-Round STANAG Magazine
    this.magazineGroup = new THREE.Group();
    const magGeo = new THREE.BoxGeometry(0.032, 0.175, 0.072);
    const magMesh = new THREE.Mesh(magGeo, darkPolymerMat);
    magMesh.position.set(0, 0, 0);
    this.magazineGroup.add(magMesh);

    const baseplateGeo = new THREE.BoxGeometry(0.036, 0.014, 0.078);
    const baseplate = new THREE.Mesh(baseplateGeo, metalAccentMat);
    baseplate.position.set(0, -0.088, 0);
    this.magazineGroup.add(baseplate);

    this.magazineGroup.position.set(0, -0.095, -0.06);
    this.magazineGroup.rotation.x = -0.16; // curved forward
    this.rifleGroup.add(this.magazineGroup);

    // 5. Modular Free-Float Handguard
    const handguardGeo = new THREE.BoxGeometry(0.046, 0.052, 0.24);
    const handguard = new THREE.Mesh(handguardGeo, darkPolymerMat);
    handguard.position.set(0, 0.036, -0.24);
    this.rifleGroup.add(handguard);

    // M-LOK side vent strips
    for (let side of [-0.024, 0.024]) {
      const ventGeo = new THREE.BoxGeometry(0.002, 0.014, 0.18);
      const vent = new THREE.Mesh(ventGeo, metalAccentMat);
      vent.position.set(side, 0.036, -0.24);
      this.rifleGroup.add(vent);
    }

    // 6. Steel Gun Barrel & Gas Block
    const barrelGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.28, 8);
    const barrel = new THREE.Mesh(barrelGeo, barrelMetalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.036, -0.38);
    this.rifleGroup.add(barrel);

    // Birdcage Flash Hider / Muzzle Compensator
    const compensatorGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.055, 8);
    const compensator = new THREE.Mesh(compensatorGeo, receiverMat);
    compensator.rotation.x = Math.PI / 2;
    compensator.position.set(0, 0.036, -0.52);
    this.rifleGroup.add(compensator);

    // 7. Tactical Telescopic Stock (Buffer tube + Buttstock)
    const bufferGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.16, 8);
    const bufferTube = new THREE.Mesh(bufferGeo, metalAccentMat);
    bufferTube.rotation.x = Math.PI / 2;
    bufferTube.position.set(0, 0.038, 0.17);
    this.rifleGroup.add(bufferTube);

    const stockGeo = new THREE.BoxGeometry(0.04, 0.095, 0.14);
    const stock = new THREE.Mesh(stockGeo, darkPolymerMat);
    stock.position.set(0, 0.02, 0.22);
    this.rifleGroup.add(stock);

    const buttpadGeo = new THREE.BoxGeometry(0.042, 0.11, 0.02);
    const buttpad = new THREE.Mesh(buttpadGeo, receiverMat);
    buttpad.position.set(0, 0.018, 0.29);
    this.rifleGroup.add(buttpad);

    // 8. Modern Tactical Red-Dot Sight / Optic
    const sightBaseGeo = new THREE.BoxGeometry(0.03, 0.022, 0.065);
    const sightBase = new THREE.Mesh(sightBaseGeo, receiverMat);
    sightBase.position.set(0, 0.086, -0.04);
    this.rifleGroup.add(sightBase);

    const opticHoodGeo = new THREE.BoxGeometry(0.038, 0.04, 0.075);
    const opticHood = new THREE.Mesh(opticHoodGeo, receiverMat);
    opticHood.position.set(0, 0.116, -0.04);
    this.rifleGroup.add(opticHood);

    // Anti-reflective Glass Lens
    const lensGeo = new THREE.PlaneGeometry(0.026, 0.028);
    const lensMat = new THREE.MeshLambertMaterial({
      color: 0x1e3a5f,
      transparent: true,
      opacity: 0.65
    });
    const frontLens = new THREE.Mesh(lensGeo, lensMat);
    frontLens.position.set(0, 0.116, -0.078);
    this.rifleGroup.add(frontLens);

    // Glowing Red Reticle Dot
    const reticleGeo = new THREE.PlaneGeometry(0.005, 0.005);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0xff1122
    });
    const reticleDot = new THREE.Mesh(reticleGeo, reticleMat);
    reticleDot.position.set(0, 0.116, -0.076);
    this.rifleGroup.add(reticleDot);

    // Front sight post
    const frontSightGeo = new THREE.BoxGeometry(0.01, 0.035, 0.016);
    const frontSight = new THREE.Mesh(frontSightGeo, metalAccentMat);
    frontSight.position.set(0, 0.074, -0.34);
    this.rifleGroup.add(frontSight);

    // Tactical AN/PEQ-15 Laser/Illuminator Module on Left/Top Rail
    const peqGeo = new THREE.BoxGeometry(0.030, 0.022, 0.085);
    const peqMat = new THREE.MeshLambertMaterial({ color: 0x222622 });
    const peqModule = new THREE.Mesh(peqGeo, peqMat);
    peqModule.position.set(-0.032, 0.048, -0.22);
    this.rifleGroup.add(peqModule);

    const peqLensGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.01, 8);
    const peqLensMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const peqLens = new THREE.Mesh(peqLensGeo, peqLensMat);
    peqLens.rotation.x = Math.PI / 2;
    peqLens.position.set(-0.032, 0.048, -0.265);
    this.rifleGroup.add(peqLens);

    // 10. Tactical First-Person Operator Arms & Combat Gloves
    const sleeveMat = new THREE.MeshLambertMaterial({ color: 0x252e22 }); // Bangladesh Army woodland camo
    const gloveMat = new THREE.MeshLambertMaterial({ color: 0x14171a });  // Dark tactical assault glove
    const glovePlateMat = new THREE.MeshPhongMaterial({ color: 0x282c32, specular: 0x666666, shininess: 40 }); // Knuckle armor

    // Right Arm (Pistol Grip & Trigger Hand)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.12, -0.26, 0.28);
    this.rightArmGroup.rotation.set(-0.35, -0.22, 0.28);

    const rSleeveGeo = new THREE.CylinderGeometry(0.048, 0.042, 0.32, 8);
    const rSleeve = new THREE.Mesh(rSleeveGeo, sleeveMat);
    rSleeve.position.set(0, -0.12, 0);
    this.rightArmGroup.add(rSleeve);

    const rGloveGeo = new THREE.BoxGeometry(0.048, 0.065, 0.065);
    const rGlove = new THREE.Mesh(rGloveGeo, gloveMat);
    rGlove.position.set(-0.05, 0.06, -0.12);
    rGlove.rotation.set(0.35, 0.1, -0.2);
    this.rightArmGroup.add(rGlove);

    const rKnucklesGeo = new THREE.BoxGeometry(0.044, 0.024, 0.022);
    const rKnuckles = new THREE.Mesh(rKnucklesGeo, glovePlateMat);
    rKnuckles.position.set(-0.05, 0.075, -0.10);
    rKnuckles.rotation.set(0.35, 0.1, -0.2);
    this.rightArmGroup.add(rKnuckles);
    this.rifleGroup.add(this.rightArmGroup);

    // Left Arm (Cupping and Supporting Forward Handguard)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.16, -0.28, 0.06);
    this.leftArmGroup.rotation.set(-0.55, 0.42, -0.32);

    const lSleeveGeo = new THREE.CylinderGeometry(0.046, 0.040, 0.38, 8);
    const lSleeve = new THREE.Mesh(lSleeveGeo, sleeveMat);
    lSleeve.position.set(0, -0.12, -0.06);
    this.leftArmGroup.add(lSleeve);

    const lGloveGeo = new THREE.BoxGeometry(0.052, 0.062, 0.075);
    const lGlove = new THREE.Mesh(lGloveGeo, gloveMat);
    lGlove.position.set(0.12, 0.14, -0.24);
    lGlove.rotation.set(0.65, -0.3, 0.4);
    this.leftArmGroup.add(lGlove);

    const lKnucklesGeo = new THREE.BoxGeometry(0.046, 0.022, 0.024);
    const lKnuckles = new THREE.Mesh(lKnucklesGeo, glovePlateMat);
    lKnuckles.position.set(0.12, 0.16, -0.22);
    lKnuckles.rotation.set(0.65, -0.3, 0.4);
    this.leftArmGroup.add(lKnuckles);
    this.rifleGroup.add(this.leftArmGroup);

    // 9. Procedural Muzzle Flash & Subtle Dynamic Glow
    this.muzzleFlashGroup = new THREE.Group();
    this.muzzleFlashGroup.position.set(0, 0.036, -0.52);

    const flashTex = this.createMuzzleFlashTexture();
    const flashMat = new THREE.MeshBasicMaterial({
      map: flashTex,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const flashPlaneGeo = new THREE.PlaneGeometry(0.18, 0.18);
    for (let r = 0; r < 3; r++) {
      const plane = new THREE.Mesh(flashPlaneGeo, flashMat);
      plane.rotation.z = (r * Math.PI) / 3;
      this.muzzleFlashGroup.add(plane);
    }

    this.flashLight = new THREE.PointLight(0xffaa33, 1.2, 4.0);
    this.flashLight.position.set(0, 0, 0);
    this.flashLight.castShadow = false;
    this.muzzleFlashGroup.add(this.flashLight);

    this.muzzleFlashGroup.visible = false;
    this.rifleGroup.add(this.muzzleFlashGroup);
  }

  createMuzzleFlashTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, '#ffe066');
    grad.addColorStop(0.55, '#ff6600');
    grad.addColorStop(1, 'rgba(255, 60, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 230, 180, 0.85)';
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.save();
      ctx.translate(64, 64);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(0, 62);
      ctx.lineTo(6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    return new THREE.CanvasTexture(canvas);
  }

  initHUD() {
    this.ammoMagElem = document.getElementById('ammo-mag');
    this.ammoReserveElem = document.getElementById('ammo-reserve');
    this.crosshairElem = document.querySelector('.crosshair');
    this.updateHUD();
  }

  updateHUD() {
    const w = this.weapons[this.currentWeaponIndex];
    const isMelee = (w && w.cal === 'SLASH');
    if (window.battlezoneHUD) {
      window.battlezoneHUD.updateAmmo(this.magAmmo, this.reserveAmmo, isMelee);
      if (w) window.battlezoneHUD.updateWeapon(w.name, w.cal);
    } else {
      if (this.ammoMagElem) {
        this.ammoMagElem.innerText = isMelee ? '∞' : this.magAmmo;
        if (this.magAmmo === 0 && !isMelee) {
          this.ammoMagElem.classList.add('empty');
        } else {
          this.ammoMagElem.classList.remove('empty');
        }
      }
      if (this.ammoReserveElem) {
        this.ammoReserveElem.innerText = isMelee ? 'MELEE' : this.reserveAmmo;
      }
      const nameElem = document.querySelector('.weapon-name');
      if (nameElem && w) nameElem.innerText = w.name;
      const calElem = document.querySelector('.weapon-cal');
      if (calElem && w) calElem.innerText = w.cal;
    }
  }

  initControls() {
    const fireBtn = document.getElementById('btn-fire');
    const reloadBtn = document.getElementById('btn-reload');
    const switchBtn = document.getElementById('btn-switch-gun');

    this.isFireButtonPressed = false;
    this.fireTouchId = null;

    if (fireBtn) {
      const handleFireStart = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
          if (e.changedTouches && e.changedTouches.length > 0) {
            this.fireTouchId = e.changedTouches[0].identifier;
          }
        }
        this.isFireButtonPressed = true;
        fireBtn.classList.add('active');
        this.shoot();
      };

      const handleFireEnd = (e) => {
        if (e && e.changedTouches) {
          for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.fireTouchId) {
              this.fireTouchId = null;
              this.isFireButtonPressed = false;
              fireBtn.classList.remove('active');
              break;
            }
          }
        } else {
          this.fireTouchId = null;
          this.isFireButtonPressed = false;
          fireBtn.classList.remove('active');
        }
      };

      fireBtn.addEventListener('touchstart', handleFireStart, { passive: false });
      fireBtn.addEventListener('touchend', handleFireEnd, { passive: false });
      fireBtn.addEventListener('touchcancel', handleFireEnd, { passive: false });

      // Window level touch release safety for multi-touch aim + fire
      window.addEventListener('touchend', (e) => {
        if (this.fireTouchId !== null && e.changedTouches) {
          for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.fireTouchId) {
              this.fireTouchId = null;
              this.isFireButtonPressed = false;
              fireBtn.classList.remove('active');
              break;
            }
          }
        }
      }, { passive: true });

      window.addEventListener('touchcancel', (e) => {
        if (this.fireTouchId !== null && e.changedTouches) {
          for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.fireTouchId) {
              this.fireTouchId = null;
              this.isFireButtonPressed = false;
              fireBtn.classList.remove('active');
              break;
            }
          }
        }
      }, { passive: true });

      fireBtn.addEventListener('mousedown', handleFireStart);
      window.addEventListener('mouseup', () => {
        this.isFireButtonPressed = false;
        fireBtn.classList.remove('active');
      });
    }

    if (reloadBtn) {
      const handleReload = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.reload();
      };
      reloadBtn.addEventListener('touchstart', handleReload, { passive: false });
      reloadBtn.addEventListener('click', handleReload);
    }

    if (switchBtn) {
      const handleSwitch = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.switchWeapon();
      };
      switchBtn.addEventListener('touchstart', handleSwitch, { passive: false });
      switchBtn.addEventListener('click', handleSwitch);
    }

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyF') {
        this.isFireButtonPressed = true;
        this.shoot();
      } else if (e.code === 'KeyR') {
        this.reload();
      } else if (e.code === 'KeyQ') {
        this.switchWeapon();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyF') {
        this.isFireButtonPressed = false;
      }
    });
  }

  switchWeapon() {
    if (this.isReloading) return;

    // Save active weapon magazine and reserve state before switching
    if (this.weapons[this.currentWeaponIndex]) {
      this.weapons[this.currentWeaponIndex].mag = this.magAmmo;
      this.weapons[this.currentWeaponIndex].res = this.reserveAmmo;
    }

    this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.weapons.length;
    const w = this.weapons[this.currentWeaponIndex];
    this.fireCooldown = w.cd;
    this.magCapacity = w.cap;
    this.magAmmo = w.mag;
    this.reserveAmmo = w.res;

    this.recoilRot.x -= 0.055;
    this.recoilPos.y -= 0.025;
    this.playDryClickSound();

    this.updateHUD();

    const switchBtn = document.getElementById('btn-switch-gun');
    if (switchBtn) {
      switchBtn.classList.add('active');
      setTimeout(() => switchBtn.classList.remove('active'), 180);
    }

    if (this.fpsController) {
      this.fpsController.showCombatToast(`EQUIPPED: ${w.name} [${w.cal}]`);
    }
  }

  initTracers() {
    // High-performance pre-allocated bullet tracer pool (6 lines)
    this.tracers = [];
    const tracerMat = new THREE.LineBasicMaterial({
      color: 0xffe888,
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });

    for (let i = 0; i < 6; i++) {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 1)
      ]);
      const line = new THREE.Line(geo, tracerMat);
      line.visible = false;
      this.scene.add(line);
      this.tracers.push({
        line,
        active: false,
        startPos: new THREE.Vector3(),
        targetPos: new THREE.Vector3(),
        currentDist: 0,
        totalDist: 1,
        speed: 340,
        length: 2.5
      });
    }
  }

  initImpactPool() {
    // 1. Sparks Pool for Enemy Hits & Metal Ricochets (16 particles)
    this.sparkPool = [];
    const sparkGeo = new THREE.BoxGeometry(0.024, 0.024, 0.024);
    for (let i = 0; i < 16; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xff3322,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(sparkGeo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.sparkPool.push({
        mesh,
        active: false,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0.16
      });
    }

    // 2. Dust/Debris Pool for Wall & Ground Impacts (16 particles)
    this.dustPool = [];
    const dustGeo = new THREE.BoxGeometry(0.035, 0.035, 0.035);
    for (let i = 0; i < 16; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xb5a793,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(dustGeo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.dustPool.push({
        mesh,
        active: false,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0.22
      });
    }

    // 3. Impact Flash Quads (4 meshes)
    this.flashPool = [];
    const flashGeo = new THREE.PlaneGeometry(0.12, 0.12);
    for (let i = 0; i < 4; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffeedd,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(flashGeo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.flashPool.push({
        mesh,
        active: false,
        life: 0
      });
    }

    // 4. Subtle Bullet Decals for Wall & Ground Marks (8 meshes)
    this.decalPool = [];
    const decalGeo = new THREE.PlaneGeometry(0.075, 0.075);
    for (let i = 0; i < 8; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x141414,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(decalGeo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.decalPool.push({
        mesh,
        active: false,
        life: 0,
        maxLife: 2.5
      });
    }
  }

  spawnBulletTracer(startPos, targetPos) {
    if (!this.tracers || this.tracers.length === 0) return;
    const tracer = this.tracers.find(t => !t.active) || this.tracers[0];
    if (tracer) {
      tracer.startPos.copy(startPos);
      tracer.targetPos.copy(targetPos);
      tracer.totalDist = Math.max(0.1, startPos.distanceTo(targetPos));
      tracer.currentDist = 0;
      tracer.speed = 340;
      tracer.length = 2.4;
      tracer.active = true;

      // Position initial segment at startPos
      const positions = tracer.line.geometry.attributes.position.array;
      positions[0] = startPos.x;
      positions[1] = startPos.y;
      positions[2] = startPos.z;
      positions[3] = startPos.x;
      positions[4] = startPos.y;
      positions[5] = startPos.z;
      tracer.line.geometry.attributes.position.needsUpdate = true;
      tracer.line.visible = true;
    }
  }

  spawnEnemyHitEffect(pos, isHead = false) {
    if (!this.sparkPool) return;
    let spawned = 0;
    const count = isHead ? 6 : 4;
    for (let i = 0; i < this.sparkPool.length && spawned < count; i++) {
      const s = this.sparkPool[i];
      if (!s.active) {
        s.mesh.position.copy(pos);
        s.mesh.scale.set(1, 1, 1);
        s.mesh.material.color.setHex(isHead ? 0xffcc22 : 0xef4444);
        s.vel.set(
          (Math.random() - 0.5) * 4.5,
          Math.random() * 3.5 + 1.0,
          (Math.random() - 0.5) * 4.5
        );
        s.life = isHead ? 0.20 : 0.16;
        s.maxLife = s.life;
        s.active = true;
        s.mesh.visible = true;
        spawned++;
      }
    }
  }

  spawnWallImpactEffect(pos, normal) {
    if (!this.dustPool) return;

    // 1. Dust puff particles
    let spawned = 0;
    for (let i = 0; i < this.dustPool.length && spawned < 4; i++) {
      const d = this.dustPool[i];
      if (!d.active) {
        d.mesh.position.copy(pos).addScaledVector(normal, 0.02);
        d.mesh.scale.set(1, 1, 1);
        d.mesh.material.opacity = 0.85;
        d.vel.copy(normal).multiplyScalar(2.2 + Math.random() * 1.8);
        d.vel.x += (Math.random() - 0.5) * 1.8;
        d.vel.y += (Math.random() - 0.5) * 1.8;
        d.vel.z += (Math.random() - 0.5) * 1.8;
        d.life = 0.20;
        d.maxLife = 0.20;
        d.active = true;
        d.mesh.visible = true;
        spawned++;
      }
    }

    // 2. Impact flash quad
    if (this.flashPool) {
      const fl = this.flashPool.find(f => !f.active) || this.flashPool[0];
      if (fl) {
        fl.mesh.position.copy(pos).addScaledVector(normal, 0.02);
        fl.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        fl.mesh.visible = true;
        fl.life = 0.045;
        fl.active = true;
      }
    }

    // 3. Temporary bullet mark decal
    if (this.decalPool) {
      const dec = this.decalPool.find(d => !d.active) || this.decalPool[0];
      if (dec) {
        dec.mesh.position.copy(pos).addScaledVector(normal, 0.008);
        dec.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        dec.mesh.material.opacity = 0.75;
        dec.mesh.visible = true;
        dec.life = 2.5;
        dec.maxLife = 2.5;
        dec.active = true;
      }
    }
  }

  spawnGroundImpactEffect(pos) {
    const groundNormal = new THREE.Vector3(0, 1, 0);
    this.spawnWallImpactEffect(pos, groundNormal);
  }

  shoot() {
    if (this.isReloading) return;

    const nowTime = performance.now() / 1000;
    if (nowTime - this.lastFireTime < this.fireCooldown) return;
    this.lastFireTime = nowTime;

    const curW = this.weapons[this.currentWeaponIndex];
    const isMelee = (curW && curW.cal === 'SLASH');

    if (!isMelee) {
      if (this.magAmmo <= 0) {
        this.playDryClickSound();
        const reloadBtn = document.getElementById('btn-reload');
        if (reloadBtn) {
          reloadBtn.classList.add('pulse');
          setTimeout(() => reloadBtn.classList.remove('pulse'), 400);
        }
        return;
      }
      this.magAmmo--;
      this.updateHUD();

      // 1. Snappy Procedural Muzzle Flash
      this.muzzleFlashGroup.visible = true;
      this.muzzleFlashGroup.rotation.z = Math.random() * Math.PI * 2;
      const flashScale = 0.85 + Math.random() * 0.3;
      this.muzzleFlashGroup.scale.set(flashScale, flashScale, flashScale);
      this.flashTimer = this.flashDuration;

      // 2. Immediate Gunshot Sound
      this.playGunshotSound();
    } else {
      this.updateHUD();
      // Melee knife slash audio
      this.playDryClickSound();
    }

    // 3. Viewmodel Recoil Kick
    const isAiming = this.fpsController ? this.fpsController.isAiming : false;
    const recoilScale = isAiming ? 0.55 : 1.0;
    if (!isMelee) {
      this.recoilPos.z += 0.038 * recoilScale;
      this.recoilPos.y += 0.005 * recoilScale;
      this.recoilRot.x += 0.058 * recoilScale;
      this.recoilRot.y += (Math.random() - 0.5) * 0.012 * recoilScale;
      this.recoilRot.z += (Math.random() - 0.5) * 0.008 * recoilScale;
    } else {
      this.recoilPos.z -= 0.05;
      this.recoilRot.z -= 0.16;
      this.recoilRot.x += 0.09;
    }

    // 4. Subtle Camera Recoil Kick (controllable, natural mobile FPS impulse)
    if (this.fpsController && typeof this.fpsController.applyRecoil === 'function') {
      const camKick = isAiming ? 0.005 : 0.009;
      const camYaw = (Math.random() - 0.5) * 0.003;
      this.fpsController.applyRecoil(camKick, camYaw);
    }

    // 5. Crosshair Recoil Expansion Effect
    if (this.crosshairElem) {
      this.crosshairElem.classList.add('crosshair-recoil');
      setTimeout(() => {
        if (this.crosshairElem) this.crosshairElem.classList.remove('crosshair-recoil');
      }, 75);
    }

    // 6. Bullet Raycast for enemy hit and world obstacle detection
    let hitResult = null;
    if (typeof this.onShoot === 'function') {
      hitResult = this.onShoot();
    }

    if (this.muzzleFlashGroup) {
      this.muzzleFlashGroup.getWorldPosition(this._vMuzzleWorld);
    } else {
      this._vMuzzleWorld.copy(this.camera.position);
    }

    let targetPoint = null;
    if (hitResult && hitResult.point) {
      targetPoint = hitResult.point;
    } else {
      this.camera.getWorldDirection(this._vCamDir);
      this._vTargetPoint.copy(this.camera.position).addScaledVector(this._vCamDir, 60);
      targetPoint = this._vTargetPoint;
    }

    // 7. Visible Bullet Tracer toward exact hit / aim point
    this.spawnBulletTracer(this._vMuzzleWorld, targetPoint);

    // 8. Immediate Impact Effects & Audio Feedback
    if (hitResult) {
      if (hitResult.type === 'enemy') {
        this.spawnEnemyHitEffect(hitResult.point, hitResult.isHead);
        this.playHitSound(hitResult.isHead);
      } else if (hitResult.type === 'wall') {
        this.spawnWallImpactEffect(hitResult.point, hitResult.normal);
        this.playImpactSound('wall');
      } else if (hitResult.type === 'ground') {
        this.spawnGroundImpactEffect(hitResult.point);
        this.playImpactSound('ground');
      }
    }
  }

  reload() {
    if (this.isReloading) return;
    const currentWeapon = this.weapons[this.currentWeaponIndex];
    if (currentWeapon && currentWeapon.cal === 'SLASH') return; // Melee does not reload

    if (this.magAmmo >= this.magCapacity) {
      if (this.fpsController) this.fpsController.showCombatToast('ম্যাগাজিন পূর্ণ রয়েছে • MAGAZINE FULL', false);
      return;
    }
    if (this.reserveAmmo <= 0) {
      if (this.fpsController) this.fpsController.showCombatToast('অতিরিক্ত গুলি নেই • NO RESERVE AMMO', true);
      const reloadBtn = document.getElementById('btn-reload');
      if (reloadBtn) {
        reloadBtn.classList.add('pulse');
        setTimeout(() => reloadBtn.classList.remove('pulse'), 400);
      }
      return;
    }

    this.isReloading = true;
    this.reloadTimer = 0;

    const reloadBtn = document.getElementById('btn-reload');
    if (reloadBtn) reloadBtn.classList.add('is-reloading');

    this.playReloadSound();
  }

  finishReload() {
    const needed = this.magCapacity - this.magAmmo;
    const toLoad = Math.min(needed, this.reserveAmmo);
    this.magAmmo += toLoad;
    this.reserveAmmo -= toLoad;

    this.isReloading = false;
    this.reloadTimer = 0;

    const reloadBtn = document.getElementById('btn-reload');
    if (reloadBtn) reloadBtn.classList.remove('is-reloading');

    this.updateHUD();
  }

  playGunshotSound() {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    const now = this.audioCtx.currentTime;

    // Subtle natural audio variation per shot (+-4% pitch/timbre) to avoid machine-gun ear fatigue
    const pitchMod = 0.96 + Math.random() * 0.08;
    const crackVol = 0.82 + Math.random() * 0.06;

    // 1. Supersonic Noise Transient (Bandpass Crack)
    const bufferSize = Math.floor(this.audioCtx.sampleRate * 0.038);
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1800 * pitchMod;
    noiseFilter.Q.value = 1.25;

    const noiseGain = this.audioCtx.createGain();
    noiseGain.gain.setValueAtTime(crackVol, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.038);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.audioCtx.destination);
    noise.start(now);

    // 2. Punchy Mid-range Body (Sawtooth Snap)
    const osc1 = this.audioCtx.createOscillator();
    const osc1Gain = this.audioCtx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(260 * pitchMod, now);
    osc1.frequency.exponentialRampToValueAtTime(45 * pitchMod, now + 0.12);

    const osc1Filter = this.audioCtx.createBiquadFilter();
    osc1Filter.type = 'lowpass';
    osc1Filter.frequency.setValueAtTime(420 * pitchMod, now);
    osc1Filter.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    const osc1GainValue = 0.74 + Math.random() * 0.05;
    osc1Gain.gain.setValueAtTime(osc1GainValue, now);
    osc1Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);

    osc1.connect(osc1Filter);
    osc1Filter.connect(osc1Gain);
    osc1Gain.connect(this.audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.14);

    // 3. Deep Sub-bass Thud (Muzzle Blast)
    const osc2 = this.audioCtx.createOscillator();
    const osc2Gain = this.audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(132 * pitchMod, now);
    osc2.frequency.exponentialRampToValueAtTime(30, now + 0.16);

    osc2Gain.gain.setValueAtTime(0.66, now);
    osc2Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc2.connect(osc2Gain);
    osc2Gain.connect(this.audioCtx.destination);
    osc2.start(now);
    osc2.stop(now + 0.19);
  }

  playImpactSound(type = 'wall') {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    const now = this.audioCtx.currentTime;

    if (type === 'wall') {
      // Subtle concrete ricochet chirp / crack
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(550, now + 0.045);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else {
      // Subtle ground dirt thud
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.055);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  }

  playHitSound(isHead = false) {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    if (isHead) {
      // Crisp metallic headshot ping
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1950, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.08);

      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    } else {
      // Flesh bullet impact thud
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    }

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playDryClickSound() {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.035);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.035);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playReloadSound() {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    const now = this.audioCtx.currentTime;

    // 1. Magazine release latch click
    this.scheduleClick(now + 0.02, 680, 0.035, 0.28);
    // 2. Mag slide out friction
    this.scheduleClick(now + 0.16, 220, 0.04, 0.16);
    // 3. New magazine insert slide
    this.scheduleClick(now + 0.72, 310, 0.04, 0.22);
    // 4. Firm magazine latch seat
    this.scheduleClick(now + 0.78, 480, 0.06, 0.42);
    // 5. Bolt carrier release forward slap
    this.scheduleClick(now + 1.15, 620, 0.04, 0.38);
    this.scheduleClick(now + 1.18, 240, 0.05, 0.35);
  }

  scheduleClick(time, freq, duration, volume) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, time + duration);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(time);
    osc.stop(time + duration + 0.01);
  }

  update(delta, moveLen = 0, isSprinting = false) {
    if (delta > 0.08) delta = 0.08;

    // 1. Muzzle Flash Timer
    if (this.flashTimer > 0) {
      this.flashTimer -= delta;
      if (this.flashTimer <= 0) {
        this.muzzleFlashGroup.visible = false;
      }
    }

    // 2. Tactical Reload Animation Progress (With physical STANAG magazine drop and insert)
    let reloadOffsetY = 0;
    let reloadRotZ = 0;
    let reloadRotX = 0;

    if (this.isReloading) {
      this.reloadTimer += delta;
      const t = this.reloadTimer / this.reloadDuration;

      // Stage 1 (0.0 to 0.25): Tilt rifle down-left, drop magazine
      if (t < 0.25) {
        const p = t / 0.25;
        reloadOffsetY = -0.08 * Math.sin(p * Math.PI * 0.5);
        reloadRotZ = 0.28 * Math.sin(p * Math.PI * 0.5);
        reloadRotX = -0.14 * Math.sin(p * Math.PI * 0.5);
        if (this.magazineGroup) {
          this.magazineGroup.position.y = -0.095 - (p * 0.16);
        }
      }
      // Stage 2 (0.25 to 0.65): Mag out of frame, grabbing fresh magazine
      else if (t < 0.65) {
        reloadOffsetY = -0.08;
        reloadRotZ = 0.28;
        reloadRotX = -0.14;
        if (this.magazineGroup) {
          this.magazineGroup.position.y = -0.255;
        }
      }
      // Stage 3 (0.65 to 0.85): Slide fresh magazine into magwell with firm click
      else if (t < 0.85) {
        const p = (t - 0.65) / 0.20;
        reloadOffsetY = -0.08 + (0.012 * Math.sin(p * Math.PI));
        reloadRotZ = 0.28;
        reloadRotX = -0.14;
        if (this.magazineGroup) {
          this.magazineGroup.position.y = -0.255 + (p * 0.16);
        }
      }
      // Stage 4 (0.85 to 1.0): Bolt rack forward & return to ready stance
      else if (t < 1.0) {
        const p = (t - 0.85) / 0.15;
        reloadOffsetY = -0.08 * (1 - p);
        reloadRotZ = 0.28 * (1 - p);
        reloadRotX = -0.14 * (1 - p);
        if (this.magazineGroup) {
          this.magazineGroup.position.y = -0.095;
        }
      } else {
        if (this.magazineGroup) {
          this.magazineGroup.position.y = -0.095;
        }
        this.finishReload();
      }
    }

    // 3. Smooth ADS Target Transition
    const isAiming = this.fpsController ? this.fpsController.isAiming : false;
    const targetPos = isAiming ? this.adsPos : this.hipPos;
    const targetRot = isAiming ? this.adsRot : this.hipRot;

    this.currentBasePos.lerp(targetPos, Math.min(1, delta * 12.0));
    this.currentBaseRot.x += (targetRot.x - this.currentBaseRot.x) * Math.min(1, delta * 12.0);
    this.currentBaseRot.y += (targetRot.y - this.currentBaseRot.y) * Math.min(1, delta * 12.0);
    this.currentBaseRot.z += (targetRot.z - this.currentBaseRot.z) * Math.min(1, delta * 12.0);

    // 4. Natural Idle Breathing
    this.idleTimer += delta;
    const breathScale = isAiming ? 0.3 : 1.0;
    const breathY = Math.sin(this.idleTimer * 1.7) * 0.0022 * breathScale;
    const breathX = Math.cos(this.idleTimer * 0.85) * 0.0012 * breathScale;

    // 5. Weapon Sway While Moving
    let swayX = 0;
    let swayY = 0;
    let swayRotZ = 0;

    if (moveLen > 0.05 && !isAiming) {
      this.swayTimer += delta * (isSprinting ? 11.5 : 8.0);
      const swayScale = isSprinting ? 0.012 : 0.006;

      swayX = Math.sin(this.swayTimer) * swayScale;
      swayY = Math.abs(Math.cos(this.swayTimer)) * (swayScale * 0.8);
      swayRotZ = -Math.sin(this.swayTimer) * (isSprinting ? 0.03 : 0.016);
    } else {
      this.swayTimer = 0;
    }

    // 6. Spring Recoil Recovery
    this.recoilPos.lerp(this._vZero, delta * 16.0);
    this.recoilRot.lerp(this._vZero, delta * 16.0);

    // 7. Continuous Automatic Firing while FIRE Button is held
    if (this.isFireButtonPressed && !this.isReloading) {
      const currentWeapon = this.weapons[this.currentWeaponIndex];
      if (currentWeapon && currentWeapon.cal !== 'SEMI') {
        const nowTime = performance.now() / 1000;
        if (nowTime - this.lastFireTime >= this.fireCooldown) {
          this.shoot();
        }
      }
    }

    // 8. Update Active Bullet Tracers (high-speed traveling streak)
    if (this.tracers && this.tracers.length > 0) {
      for (let i = 0; i < this.tracers.length; i++) {
        const tr = this.tracers[i];
        if (tr.active) {
          tr.currentDist += tr.speed * delta;
          const headFrac = Math.min(1.0, tr.currentDist / tr.totalDist);
          const tailFrac = Math.max(0.0, (tr.currentDist - tr.length) / tr.totalDist);

          const positions = tr.line.geometry.attributes.position.array;
          // Tail
          positions[0] = tr.startPos.x + (tr.targetPos.x - tr.startPos.x) * tailFrac;
          positions[1] = tr.startPos.y + (tr.targetPos.y - tr.startPos.y) * tailFrac;
          positions[2] = tr.startPos.z + (tr.targetPos.z - tr.startPos.z) * tailFrac;
          // Head
          positions[3] = tr.startPos.x + (tr.targetPos.x - tr.startPos.x) * headFrac;
          positions[4] = tr.startPos.y + (tr.targetPos.y - tr.startPos.y) * headFrac;
          positions[5] = tr.startPos.z + (tr.targetPos.z - tr.startPos.z) * headFrac;
          tr.line.geometry.attributes.position.needsUpdate = true;

          if (tailFrac >= 1.0) {
            tr.active = false;
            tr.line.visible = false;
          }
        }
      }
    }

    // 9. Update Active Spark Particles
    if (this.sparkPool) {
      for (let i = 0; i < this.sparkPool.length; i++) {
        const s = this.sparkPool[i];
        if (s.active) {
          s.vel.y -= 9.8 * delta;
          s.mesh.position.addScaledVector(s.vel, delta);
          s.life -= delta;
          const scale = Math.max(0.01, s.life / s.maxLife);
          s.mesh.scale.set(scale, scale, scale);
          if (s.life <= 0) {
            s.active = false;
            s.mesh.visible = false;
          }
        }
      }
    }

    // 10. Update Active Dust Particles
    if (this.dustPool) {
      for (let i = 0; i < this.dustPool.length; i++) {
        const d = this.dustPool[i];
        if (d.active) {
          d.vel.y -= 4.2 * delta;
          d.mesh.position.addScaledVector(d.vel, delta);
          d.life -= delta;
          const alpha = Math.max(0, d.life / d.maxLife);
          d.mesh.material.opacity = alpha * 0.85;
          if (d.life <= 0) {
            d.active = false;
            d.mesh.visible = false;
          }
        }
      }
    }

    // 11. Update Active Flash Quads
    if (this.flashPool) {
      for (let i = 0; i < this.flashPool.length; i++) {
        const f = this.flashPool[i];
        if (f.active) {
          f.life -= delta;
          if (f.life <= 0) {
            f.active = false;
            f.mesh.visible = false;
          }
        }
      }
    }

    // 12. Update Active Decals
    if (this.decalPool) {
      for (let i = 0; i < this.decalPool.length; i++) {
        const dec = this.decalPool[i];
        if (dec.active) {
          dec.life -= delta;
          const alpha = Math.max(0, dec.life / dec.maxLife);
          dec.mesh.material.opacity = alpha * 0.75;
          if (dec.life <= 0) {
            dec.active = false;
            dec.mesh.visible = false;
          }
        }
      }
    }

    // 13. Apply Transforms
    this.weaponContainer.position.set(
      this.currentBasePos.x + breathX + swayX,
      this.currentBasePos.y + breathY + swayY + reloadOffsetY,
      this.currentBasePos.z
    );

    this.rifleGroup.position.copy(this.recoilPos);

    this.rifleGroup.rotation.set(
      this.currentBaseRot.x + this.recoilRot.x + reloadRotX,
      this.currentBaseRot.y + this.recoilRot.y,
      this.currentBaseRot.z + this.recoilRot.z + swayRotZ + reloadRotZ
    );
  }
}
