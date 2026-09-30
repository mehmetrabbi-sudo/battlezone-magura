// Weapon & Shooting System for Battlezone Magura
// Modern Tactical Assault Rifle (First-Person View)
// Features: 3D Procedural Rifle, Muzzle Flash, Recoil Physics,
// Natural Camera Tracking & Weapon Sway, Procedural Gunshot Audio, Ammo & Reload

class WeaponSystem {
  constructor(camera, scene, audioCtxGetter) {
    this.camera = camera;
    this.scene = scene;
    this.getAudioCtx = audioCtxGetter;

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

    // Natural Movement & Sway Parameters
    this.basePos = new THREE.Vector3(0.24, -0.21, -0.44);
    this.baseRot = new THREE.Euler(0.015, -0.04, 0.015);
    this.idleTimer = 0;
    this.swayTimer = 0;
    this.swayAmount = 0.008;

    // Smoothing targets for look lag sway
    this.lookSwayX = 0;
    this.lookSwayY = 0;
    this.targetLookSwayX = 0;
    this.targetLookSwayY = 0;

    // Build the 3D Weapon Model
    this.initWeaponModel();

    // Attach to camera
    this.scene.add(this.camera);
    this.camera.add(this.weaponContainer);

    // Setup DOM Elements & Listeners
    this.initHUD();
    this.initControls();
  }

  get audioCtx() {
    return this.getAudioCtx ? this.getAudioCtx() : null;
  }

  initWeaponModel() {
    // Top-level container for camera attachment
    this.weaponContainer = new THREE.Group();
    this.weaponContainer.position.copy(this.basePos);
    this.weaponContainer.rotation.copy(this.baseRot);

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

    // Mag baseplate
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

    // Flip-up front sight post near muzzle
    const frontSightGeo = new THREE.BoxGeometry(0.01, 0.035, 0.016);
    const frontSight = new THREE.Mesh(frontSightGeo, metalAccentMat);
    frontSight.position.set(0, 0.074, -0.34);
    this.rifleGroup.add(frontSight);

    // 9. Procedural Muzzle Flash & Dynamic Light
    this.muzzleFlashGroup = new THREE.Group();
    this.muzzleFlashGroup.position.set(0, 0.036, -0.56);

    const flashTex = this.createMuzzleFlashTexture();
    const flashMat = new THREE.MeshBasicMaterial({
      map: flashTex,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const flashPlaneGeo = new THREE.PlaneGeometry(0.24, 0.24);
    for (let r = 0; r < 3; r++) {
      const plane = new THREE.Mesh(flashPlaneGeo, flashMat);
      plane.rotation.z = (r * Math.PI) / 3;
      this.muzzleFlashGroup.add(plane);
    }

    // Dynamic Flash Light (illuminates scene briefly during shot)
    this.flashLight = new THREE.PointLight(0xff9922, 2.8, 8);
    this.flashLight.position.set(0, 0, 0);
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

    // Spikes / Starburst
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
    if (this.ammoMagElem) {
      this.ammoMagElem.innerText = this.magAmmo;
      if (this.magAmmo === 0) {
        this.ammoMagElem.classList.add('empty');
      } else {
        this.ammoMagElem.classList.remove('empty');
      }
    }
    if (this.ammoReserveElem) {
      this.ammoReserveElem.innerText = this.reserveAmmo;
    }
  }

  initControls() {
    const fireBtn = document.getElementById('btn-fire');
    const reloadBtn = document.getElementById('btn-reload');

    // 1. Mobile FIRE Button
    if (fireBtn) {
      const handleFire = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.shoot();
      };
      fireBtn.addEventListener('touchstart', handleFire, { passive: false });
      fireBtn.addEventListener('click', handleFire);
    }

    // 2. Mobile RELOAD Button
    if (reloadBtn) {
      const handleReload = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.reload();
      };
      reloadBtn.addEventListener('touchstart', handleReload, { passive: false });
      reloadBtn.addEventListener('click', handleReload);
    }

    // Keyboard controls for desktop / emulator
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyF') {
        this.shoot();
      } else if (e.code === 'KeyR') {
        this.reload();
      }
    });
  }

  shoot() {
    if (this.isReloading) return;

    const nowTime = performance.now() / 1000;
    if (nowTime - this.lastFireTime < this.fireCooldown) return;
    this.lastFireTime = nowTime;

    // Check Ammo
    if (this.magAmmo <= 0) {
      this.playDryClickSound();
      const reloadBtn = document.getElementById('btn-reload');
      if (reloadBtn) {
        reloadBtn.classList.add('pulse');
        setTimeout(() => reloadBtn.classList.remove('pulse'), 400);
      }
      return;
    }

    // Decrement Ammo
    this.magAmmo--;
    this.updateHUD();

    // Muzzle Flash
    this.muzzleFlashGroup.visible = true;
    this.muzzleFlashGroup.rotation.z = Math.random() * Math.PI * 2;
    this.flashTimer = this.flashDuration;

    // Audio
    this.playGunshotSound();

    // Recoil Kick
    this.recoilPos.z += 0.048; // backward push
    this.recoilPos.y += 0.007; // slight rise
    this.recoilRot.x += 0.092; // muzzle climb
    this.recoilRot.y += (Math.random() - 0.5) * 0.022; // slight randomized lateral jitter
    this.recoilRot.z += (Math.random() - 0.5) * 0.015;

    // Crosshair Recoil Expansion Effect
    if (this.crosshairElem) {
      this.crosshairElem.classList.add('crosshair-recoil');
      setTimeout(() => {
        if (this.crosshairElem) this.crosshairElem.classList.remove('crosshair-recoil');
      }, 75);
    }

    // Notify bullet firing for combat hit detection
    if (typeof this.onShoot === 'function') {
      this.onShoot();
    }
  }

  reload() {
    if (this.isReloading) return;
    if (this.magAmmo >= this.magCapacity) return;
    if (this.reserveAmmo <= 0) return;

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

    // 1. Initial High-Frequency Noise Transient (Bullet Crack & Powder Blast)
    const bufferSize = Math.floor(this.audioCtx.sampleRate * 0.045);
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
    }
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1600;
    noiseFilter.Q.value = 1.1;

    const noiseGain = this.audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.9, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.045);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.audioCtx.destination);
    noise.start(now);

    // 2. Punchy Mid-Bass Body (Sawtooth sweep)
    const osc1 = this.audioCtx.createOscillator();
    const osc1Gain = this.audioCtx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(240, now);
    osc1.frequency.exponentialRampToValueAtTime(42, now + 0.14);

    const osc1Filter = this.audioCtx.createBiquadFilter();
    osc1Filter.type = 'lowpass';
    osc1Filter.frequency.setValueAtTime(360, now);
    osc1Filter.frequency.exponentialRampToValueAtTime(70, now + 0.14);

    osc1Gain.gain.setValueAtTime(0.8, now);
    osc1Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc1.connect(osc1Filter);
    osc1Filter.connect(osc1Gain);
    osc1Gain.connect(this.audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.16);

    // 3. Deep Sub-Bass Thump (Sine sweep)
    const osc2 = this.audioCtx.createOscillator();
    const osc2Gain = this.audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(120, now);
    osc2.frequency.exponentialRampToValueAtTime(32, now + 0.18);

    osc2Gain.gain.setValueAtTime(0.7, now);
    osc2Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc2.connect(osc2Gain);
    osc2Gain.connect(this.audioCtx.destination);
    osc2.start(now);
    osc2.stop(now + 0.21);
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

    // Mag Out Clack (t = 0.0s)
    this.scheduleClick(now, 320, 0.04, 0.25);
    this.scheduleClick(now + 0.03, 180, 0.03, 0.18);

    // Mag Insert Snap (t = 0.65s)
    this.scheduleClick(now + 0.62, 280, 0.04, 0.3);
    this.scheduleClick(now + 0.66, 450, 0.05, 0.4);

    // Bolt Release Slide & Snap (t = 1.1s)
    this.scheduleClick(now + 1.1, 550, 0.03, 0.35);
    this.scheduleClick(now + 1.14, 220, 0.05, 0.45);
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

    // 1. Muzzle Flash timer
    if (this.flashTimer > 0) {
      this.flashTimer -= delta;
      if (this.flashTimer <= 0) {
        this.muzzleFlashGroup.visible = false;
      }
    }

    // 2. Reload Animation Progress
    let reloadOffsetY = 0;
    let reloadRotZ = 0;
    let reloadRotX = 0;

    if (this.isReloading) {
      this.reloadTimer += delta;
      const t = this.reloadTimer / this.reloadDuration;

      if (t < 0.25) {
        // Drop & tilt
        const p = t / 0.25;
        reloadOffsetY = -0.09 * Math.sin(p * Math.PI * 0.5);
        reloadRotZ = 0.32 * Math.sin(p * Math.PI * 0.5);
        reloadRotX = -0.15 * Math.sin(p * Math.PI * 0.5);
      } else if (t < 0.75) {
        // Holding mag insertion
        reloadOffsetY = -0.09;
        reloadRotZ = 0.32;
        reloadRotX = -0.15;
      } else if (t < 1.0) {
        // Recovering up to ready stance
        const p = (t - 0.75) / 0.25;
        reloadOffsetY = -0.09 * (1 - p);
        reloadRotZ = 0.32 * (1 - p);
        reloadRotX = -0.15 * (1 - p);
      } else {
        this.finishReload();
      }
    }

    // 3. Natural Idle Breathing
    this.idleTimer += delta;
    const breathY = Math.sin(this.idleTimer * 1.7) * 0.0022;
    const breathX = Math.cos(this.idleTimer * 0.85) * 0.0012;

    // 4. Subtle Weapon Sway While Moving
    let swayX = 0;
    let swayY = 0;
    let swayRotZ = 0;

    if (moveLen > 0.05) {
      const speedMult = isSprinting ? 1.55 : 1.0;
      this.swayTimer += delta * (isSprinting ? 15 : 10);
      const swayScale = isSprinting ? 0.015 : 0.008;

      swayX = Math.sin(this.swayTimer) * swayScale;
      swayY = Math.abs(Math.cos(this.swayTimer)) * (swayScale * 0.8);
      swayRotZ = -Math.sin(this.swayTimer) * (isSprinting ? 0.04 : 0.022);
    } else {
      this.swayTimer = 0;
    }

    // 5. Spring Recoil Recovery
    this.recoilPos.lerp(new THREE.Vector3(0, 0, 0), delta * 16.0);
    this.recoilRot.lerp(new THREE.Vector3(0, 0, 0), delta * 16.0);

    // 6. Apply Combined Transforms to Weapon Container & Rifle Group
    this.weaponContainer.position.set(
      this.basePos.x + breathX + swayX,
      this.basePos.y + breathY + swayY + reloadOffsetY,
      this.basePos.z
    );

    this.rifleGroup.position.copy(this.recoilPos);

    this.rifleGroup.rotation.set(
      this.baseRot.x + this.recoilRot.x + reloadRotX,
      this.baseRot.y + this.recoilRot.y,
      this.baseRot.z + this.recoilRot.z + swayRotZ + reloadRotZ
    );
  }
}
