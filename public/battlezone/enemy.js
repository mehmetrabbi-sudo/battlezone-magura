// Enemy AI Bot System for Battlezone Magura
// 7 Patrol Bots in Magura Town, Dark Tactical Uniforms with Rifles
// Patrol, Detection, Navigation, Aiming & Shooting with Accuracy Variation, Health Bars & Death

class EnemyManager {
  constructor(scene, camera, colliders, getAudioCtx, customEnemyConfigs) {
    this.scene = scene;
    this.camera = camera;
    this.colliders = colliders || [];
    this.getAudioCtx = getAudioCtx;

    // 7 Enemy Bots
    this.enemies = [];

    // Kills Counter
    this.kills = 0;
    this.killsDisplay = document.getElementById('kills-display');
    this.hitmarkerElem = document.getElementById('hitmarker');
    this.hitmarkerTimer = null;

    // Raycaster for player bullet hit detection against enemies
    this.bulletRaycaster = new THREE.Raycaster();

    // Damage screen vignette overlay element
    this.damageOverlay = document.getElementById('damage-overlay');

    // Reusable temp vectors for zero-allocation performance on Android
    this._vPlayerPos = new THREE.Vector3();
    this._vEnemyToPlayer = new THREE.Vector3();
    this._vRayDir = new THREE.Vector3();
    this._raycastTargets = [];

    // Initialize the enemy bots (uses customConfigs if provided, else defaults to Magura Town)
    this.initEnemies(customEnemyConfigs);
  }

  onEnemyKilled(enemy) {
    this.kills++;
    if (this.killsDisplay) {
      this.killsDisplay.textContent = `KILLS: ${this.kills}`;
    }
  }

  showHitMarker(isHeadshot) {
    if (!this.hitmarkerElem) return;

    if (this.hitmarkerTimer) {
      clearTimeout(this.hitmarkerTimer);
    }

    if (isHeadshot) {
      this.hitmarkerElem.classList.add('headshot');
    } else {
      this.hitmarkerElem.classList.remove('headshot');
    }

    this.hitmarkerElem.classList.add('active');

    // Play subtle tactical hit audio feedback
    this.playHitmarkerSound(isHeadshot);

    this.hitmarkerTimer = setTimeout(() => {
      if (this.hitmarkerElem) {
        this.hitmarkerElem.classList.remove('active', 'headshot');
      }
      this.hitmarkerTimer = null;
    }, 110);
  }

  playHitmarkerSound(isHeadshot) {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = isHeadshot ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isHeadshot ? 1400 : 920, now);
    osc.frequency.exponentialRampToValueAtTime(isHeadshot ? 1800 : 700, now + 0.05);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  get audioCtx() {
    return this.getAudioCtx ? this.getAudioCtx() : null;
  }

  initEnemies(customConfigs) {
    const enemyConfigs = (customConfigs && customConfigs.length > 0) ? customConfigs : [
      {
        id: 1,
        name: "শত্রু ১ (উত্তর মোড়)",
        spawn: { x: 3.5, y: 0, z: -60 },
        waypoints: [
          { x: 3.5, z: -60 },
          { x: 3.5, z: -80 },
          { x: -3.5, z: -80 },
          { x: -3.5, z: -60 }
        ]
      },
      {
        id: 2,
        name: "শত্রু ২ (স্টেডিয়াম রোড)",
        spawn: { x: 22, y: 0, z: 25 },
        waypoints: [
          { x: 22, z: 25 },
          { x: 36, z: 25 },
          { x: 22, z: 25 },
          { x: 10, z: 25 }
        ]
      },
      {
        id: 3,
        name: "শত্রু ৩ (বাজার গলি)",
        spawn: { x: -22, y: 0, z: -35 },
        waypoints: [
          { x: -22, z: -35 },
          { x: -36, z: -35 },
          { x: -22, z: -35 },
          { x: -10, z: -35 }
        ]
      },
      {
        id: 4,
        name: "শত্রু ৪ (কালভার্ট ব্রিজ)",
        spawn: { x: -3.0, y: 0, z: 62 },
        waypoints: [
          { x: -3.0, z: 62 },
          { x: 3.0, z: 68 },
          { x: -3.0, z: 75 },
          { x: 0, z: 60 }
        ]
      },
      {
        id: 5,
        name: "শত্রু ৫ (মিষ্টির দোকান গলি)",
        spawn: { x: 12, y: 0, z: -10 },
        waypoints: [
          { x: 12, z: -10 },
          { x: 12, z: 12 },
          { x: 4.5, z: 12 },
          { x: 4.5, z: -10 }
        ]
      },
      {
        id: 6,
        name: "শত্রু ৬ (সিএনজি স্ট্যান্ড)",
        spawn: { x: -12, y: 0, z: 8 },
        waypoints: [
          { x: -12, z: 8 },
          { x: -12, z: -18 },
          { x: -4.5, z: -18 },
          { x: -4.5, z: 8 }
        ]
      },
      {
        id: 7,
        name: "শত্রু ৭ (টাউন সেন্টার ক্রসিং)",
        spawn: { x: 0, y: 0, z: 15 },
        waypoints: [
          { x: 0, z: 15 },
          { x: 6, z: 28 },
          { x: -6, z: 28 },
          { x: 0, z: 0 }
        ]
      }
    ];

    enemyConfigs.forEach((cfg) => {
      const enemy = new EnemyBot(cfg, this.scene, this);
      this.enemies.push(enemy);
    });
  }

  resetEnemies(customConfigs, colliders) {
    if (this.enemies) {
      this.enemies.forEach((e) => {
        if (e.group && e.group.parent) {
          e.group.parent.remove(e.group);
        }
      });
    }
    this.enemies = [];
    if (colliders) this.colliders = colliders;
    this.initEnemies(customConfigs);
  }

  handlePlayerShot(camera) {
    this.bulletRaycaster.setFromCamera({ x: 0, y: 0 }, camera);

    this._raycastTargets.length = 0;
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.isAlive) {
        if (e.headHitbox) this._raycastTargets.push(e.headHitbox);
        if (e.bodyHitbox) this._raycastTargets.push(e.bodyHitbox);
        else if (e.hitbox) this._raycastTargets.push(e.hitbox);
      }
    }

    if (this._raycastTargets.length === 0) return null;

    const intersects = this.bulletRaycaster.intersectObjects(this._raycastTargets, false);
    if (intersects.length > 0) {
      const hit = intersects[0];
      const enemy = hit.object.userData.enemy;
      const isHead = hit.object.userData.isHead || false;

      if (enemy && enemy.isAlive) {
        const damage = isHead ? 50 : 25;
        enemy.takeDamage(damage, hit.point, isHead);
        this.showHitMarker(isHead);
        return enemy;
      }
    }
    return null;
  }

  update(delta, playerPos, playerController) {
    this._vPlayerPos.copy(playerPos);

    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.isAlive || e.isDying) {
        e.update(delta, this._vPlayerPos, playerController);
      }
    }
  }

  playEnemyGunshotSound(distance) {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    const now = this.audioCtx.currentTime;
    const distFactor = Math.max(0.1, 1 - distance / 45);
    const vol = 0.45 * distFactor;

    const bufferSize = Math.floor(this.audioCtx.sampleRate * 0.035);
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1300;

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);
    noise.start(now);

    const osc = this.audioCtx.createOscillator();
    const oscGain = this.audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.09);

    oscGain.gain.setValueAtTime(vol * 0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(oscGain);
    oscGain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }
}

class EnemyBot {
  constructor(config, scene, manager) {
    this.id = config.id;
    this.name = config.name;
    this.scene = scene;
    this.manager = manager;

    this.spawnPos = config.spawn;
    this.waypoints = config.waypoints;
    this.currentWpIndex = 0;

    this.maxHp = 100;
    this.hp = 100;
    this.isAlive = true;
    this.isDying = false;
    this.deathTimer = 0;

    this.state = 'patrol';
    this.detectionRange = 24.0;
    this.shootRange = 18.0;
    this.patrolSpeed = 1.8;
    this.chaseSpeed = 3.2;
    this.rotationSpeed = 3.5;
    this.aimRotationSpeed = 6.0;

    this.targetAimYaw = 0;
    this.targetAimPitch = 0;
    this.currentAimYaw = 0;
    this.currentAimPitch = 0;
    this.isAimedAtTarget = false;
    this.aimThreshold = 0.28;

    this.combatStanceTimer = 0;
    this.combatStrafeDir = 0;

    this.shootCooldown = 1.25;
    this.shootTimer = Math.random() * 0.8;
    this.accuracy = 0.40;
    this.shotDamage = 12;

    this.muzzleFlashTimer = 0;
    this.walkAnimTimer = Math.random() * 10;

    this.initModel();
    this.initHealthBar();
  }

  initModel() {
    this.group = new THREE.Group();
    this.group.position.set(this.spawnPos.x, this.spawnPos.y, this.spawnPos.z);

    const camoTorsoMat = new THREE.MeshLambertMaterial({ color: 0x1f2421 });
    const camoPantsMat = new THREE.MeshLambertMaterial({ color: 0x181c19 });
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xa87d5b });
    const vestMat = new THREE.MeshLambertMaterial({ color: 0x111412 });
    const helmetMat = new THREE.MeshLambertMaterial({ color: 0x242b26 });
    const rifleMat = new THREE.MeshPhongMaterial({ color: 0x1a1d20, specular: 0x444444, shininess: 25 });
    const bootsMat = new THREE.MeshLambertMaterial({ color: 0x0a0c0a });

    this.upperBodyGroup = new THREE.Group();
    this.upperBodyGroup.position.set(0, 0.90, 0);
    this.group.add(this.upperBodyGroup);

    const torsoGeo = new THREE.BoxGeometry(0.44, 0.58, 0.26);
    this.torso = new THREE.Mesh(torsoGeo, camoTorsoMat);
    this.torso.position.y = 0.29;
    this.upperBodyGroup.add(this.torso);

    const vestGeo = new THREE.BoxGeometry(0.46, 0.48, 0.28);
    const vest = new THREE.Mesh(vestGeo, vestMat);
    vest.position.set(0, 0.02, 0);
    this.torso.add(vest);

    this.head = new THREE.Group();
    this.head.position.set(0, 0.72, 0);
    this.upperBodyGroup.add(this.head);

    const headGeo = new THREE.BoxGeometry(0.24, 0.26, 0.24);
    this.headMesh = new THREE.Mesh(headGeo, skinMat);
    this.head.add(this.headMesh);

    const maskGeo = new THREE.BoxGeometry(0.245, 0.15, 0.245);
    this.maskMesh = new THREE.Mesh(maskGeo, vestMat);
    this.maskMesh.position.set(0, -0.05, 0.01);
    this.head.add(this.maskMesh);

    const helmetGeo = new THREE.BoxGeometry(0.27, 0.14, 0.28);
    this.helmetMesh = new THREE.Mesh(helmetGeo, helmetMat);
    this.helmetMesh.position.set(0, 0.11, 0);
    this.head.add(this.helmetMesh);

    const gogglesGeo = new THREE.BoxGeometry(0.22, 0.06, 0.06);
    const gogglesMat = new THREE.MeshLambertMaterial({ color: 0x0f3b4c });
    const goggles = new THREE.Mesh(gogglesGeo, gogglesMat);
    goggles.position.set(0, 0.09, 0.13);
    this.head.add(goggles);

    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.13, 0.90, 0);
    const legGeo = new THREE.BoxGeometry(0.18, 0.68, 0.20);
    const leftLeg = new THREE.Mesh(legGeo, camoPantsMat);
    leftLeg.position.y = -0.34;
    this.leftLegGroup.add(leftLeg);

    const bootGeo = new THREE.BoxGeometry(0.19, 0.18, 0.26);
    const leftBoot = new THREE.Mesh(bootGeo, bootsMat);
    leftBoot.position.set(0, -0.61, 0.03);
    this.leftLegGroup.add(leftBoot);
    this.group.add(this.leftLegGroup);

    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.13, 0.90, 0);
    const rightLeg = new THREE.Mesh(legGeo, camoPantsMat);
    rightLeg.position.y = -0.34;
    this.rightLegGroup.add(rightLeg);

    const rightBoot = new THREE.Mesh(bootGeo, bootsMat);
    rightBoot.position.set(0, -0.61, 0.03);
    this.rightLegGroup.add(rightBoot);
    this.group.add(this.rightLegGroup);

    this.aimPivot = new THREE.Group();
    this.aimPivot.position.set(0, 1.34, 0.04);
    this.group.add(this.aimPivot);

    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.24, 0.04, 0);
    const armGeo = new THREE.BoxGeometry(0.13, 0.48, 0.15);
    const leftArm = new THREE.Mesh(armGeo, camoTorsoMat);
    leftArm.position.set(0.08, -0.16, 0.16);
    leftArm.rotation.set(-0.75, 0.55, -0.2);
    this.leftArmGroup.add(leftArm);
    this.aimPivot.add(this.leftArmGroup);

    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.24, 0.04, 0);
    const rightArm = new THREE.Mesh(armGeo, camoTorsoMat);
    rightArm.position.set(-0.06, -0.16, 0.14);
    rightArm.rotation.set(-0.85, -0.32, 0.15);
    this.rightArmGroup.add(rightArm);
    this.aimPivot.add(this.rightArmGroup);

    this.rifleGroup = new THREE.Group();
    this.rifleGroup.position.set(0.10, -0.06, 0.28);
    this.aimPivot.add(this.rifleGroup);

    const rifleBodyGeo = new THREE.BoxGeometry(0.065, 0.11, 0.55);
    const rifleBody = new THREE.Mesh(rifleBodyGeo, rifleMat);
    rifleBody.position.set(0, 0, 0);
    this.rifleGroup.add(rifleBody);

    const barrelGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.36, 8);
    const barrel = new THREE.Mesh(barrelGeo, rifleMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, 0.44);
    this.rifleGroup.add(barrel);

    const magGeo = new THREE.BoxGeometry(0.048, 0.17, 0.08);
    const mag = new THREE.Mesh(magGeo, vestMat);
    mag.position.set(0, -0.11, 0.07);
    mag.rotation.x = -0.20;
    this.rifleGroup.add(mag);

    const sightGeo = new THREE.BoxGeometry(0.015, 0.035, 0.03);
    const sight = new THREE.Mesh(sightGeo, rifleMat);
    sight.position.set(0, 0.075, 0.22);
    this.rifleGroup.add(sight);

    const flashGeo = new THREE.PlaneGeometry(0.30, 0.30);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffaa33,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });
    this.enemyMuzzleFlash = new THREE.Mesh(flashGeo, flashMat);
    this.enemyMuzzleFlash.position.set(0, 0.02, 0.65);
    this.enemyMuzzleFlash.visible = false;
    this.rifleGroup.add(this.enemyMuzzleFlash);

    const headHitboxGeo = new THREE.SphereGeometry(0.22, 8, 8);
    const headHitboxMat = new THREE.MeshBasicMaterial({ visible: false, wireframe: true });
    this.headHitbox = new THREE.Mesh(headHitboxGeo, headHitboxMat);
    this.headHitbox.position.set(0, 1.62, 0);
    this.headHitbox.userData = { enemy: this, isHead: true };
    this.group.add(this.headHitbox);

    const bodyHitboxGeo = new THREE.CylinderGeometry(0.38, 0.38, 1.44, 8);
    const bodyHitboxMat = new THREE.MeshBasicMaterial({ visible: false, wireframe: true });
    this.bodyHitbox = new THREE.Mesh(bodyHitboxGeo, bodyHitboxMat);
    this.bodyHitbox.position.set(0, 0.72, 0);
    this.bodyHitbox.userData = { enemy: this, isHead: false };
    this.group.add(this.bodyHitbox);

    this.hitbox = this.bodyHitbox;

    this.scene.add(this.group);
  }

  initHealthBar() {
    this.hbCanvas = document.createElement('canvas');
    this.hbCanvas.width = 128;
    this.hbCanvas.height = 32;
    this.hbCtx = this.hbCanvas.getContext('2d');

    this.hbTexture = new THREE.CanvasTexture(this.hbCanvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: this.hbTexture,
      transparent: true,
      depthTest: false
    });

    this.hbSprite = new THREE.Sprite(spriteMat);
    this.hbSprite.position.set(0, 2.05, 0);
    this.hbSprite.scale.set(1.0, 0.25, 1.0);
    this.group.add(this.hbSprite);

    this.updateHealthBar();
  }

  updateHealthBar() {
    if (!this.hbCtx) return;
    const w = this.hbCanvas.width;
    const h = this.hbCanvas.height;

    this.hbCtx.clearRect(0, 0, w, h);

    if (this.hp <= 0) return;

    this.hbCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.hbCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.hbCtx.lineWidth = 2;
    this.hbCtx.beginPath();
    this.hbCtx.roundRect(8, 6, w - 16, h - 12, 6);
    this.hbCtx.fill();
    this.hbCtx.stroke();

    const pct = Math.max(0, this.hp / this.maxHp);
    const barW = (w - 22) * pct;

    let color = '#22c55e';
    if (pct < 0.35) {
      color = '#ef4444';
    } else if (pct < 0.65) {
      color = '#f59e0b';
    }

    this.hbCtx.fillStyle = color;
    this.hbCtx.beginPath();
    this.hbCtx.roundRect(11, 9, barW, h - 18, 4);
    this.hbCtx.fill();

    this.hbTexture.needsUpdate = true;
  }

  takeDamage(amount, hitPoint, isHead) {
    if (!this.isAlive) return;

    this.hp = Math.max(0, this.hp - amount);
    this.updateHealthBar();

    const originalTorsoColor = 0x1f2421;
    const originalHeadColor = 0xa87d5b;

    if (this.torso && this.torso.material) {
      this.torso.material.color.setHex(0xff2222);
    }
    if (this.headMesh && this.headMesh.material) {
      this.headMesh.material.color.setHex(0xff4444);
    }

    setTimeout(() => {
      if (this.torso && this.torso.material) {
        this.torso.material.color.setHex(originalTorsoColor);
      }
      if (this.headMesh && this.headMesh.material) {
        this.headMesh.material.color.setHex(originalHeadColor);
      }
    }, 90);

    if (this.hp > 0) {
      this.state = 'aim_shoot';
    } else {
      this.die();
    }
  }

  die() {
    if (!this.isAlive) return;

    this.isAlive = false;
    this.isDying = true;
    this.hp = 0;
    this.deathTimer = 0;
    this.state = 'dead';
    this.updateHealthBar();

    if (this.enemyMuzzleFlash) this.enemyMuzzleFlash.visible = false;
    this.muzzleFlashTimer = 0;

    if (this.headHitbox) this.headHitbox.userData = null;
    if (this.bodyHitbox) this.bodyHitbox.userData = null;
    if (this.hitbox) this.hitbox.userData = null;

    if (this.hbSprite) this.hbSprite.visible = false;

    if (this.manager && typeof this.manager.onEnemyKilled === 'function') {
      this.manager.onEnemyKilled(this);
    }
  }

  update(delta, playerPos, playerController) {
    if (this.isDying) {
      this.deathTimer += delta;

      if (this.group.rotation.x > -Math.PI / 2) {
        this.group.rotation.x -= delta * 3.2;
        this.group.position.y = Math.max(0.12, this.group.position.y - delta * 0.95);
      }

      if (this.deathTimer >= 2.0) {
        this.scene.remove(this.group);
        this.isDying = false;
      }
      return;
    }

    if (!this.isAlive) return;

    if (this.muzzleFlashTimer > 0) {
      this.muzzleFlashTimer -= delta;
      if (this.muzzleFlashTimer <= 0 && this.enemyMuzzleFlash) {
        this.enemyMuzzleFlash.visible = false;
      }
    }

    let targetGroundY = 0;
    if (this.group.position.z >= 72 && this.group.position.z <= 98 && Math.abs(this.group.position.x) <= 8.5) {
      targetGroundY = 0.45;
    } else if (Math.abs(this.group.position.x) >= 8.0 && Math.abs(this.group.position.x) <= 11.5) {
      targetGroundY = 0.22;
    }
    this.group.position.y = targetGroundY;

    const dx = playerPos.x - this.group.position.x;
    const dz = playerPos.z - this.group.position.z;
    const distToPlayer = Math.sqrt(dx * dx + dz * dz);

    if (distToPlayer <= this.shootRange) {
      this.state = 'aim_shoot';
    } else if (distToPlayer <= this.detectionRange) {
      this.state = 'chase';
    } else {
      this.state = 'patrol';
    }

    if (this.state === 'patrol') {
      this.updatePatrol(delta);
    } else if (this.state === 'chase') {
      this.updateChase(delta, playerPos, distToPlayer);
    } else if (this.state === 'aim_shoot') {
      this.updateAimShoot(delta, playerPos, distToPlayer, playerController);
    }
  }

  updatePatrol(delta) {
    this.targetAimYaw = 0;
    this.targetAimPitch = 0.05;
    this.updateAimAndUpperBody(delta);
    this.isAimedAtTarget = false;

    const targetWp = this.waypoints[this.currentWpIndex];
    const dx = targetWp.x - this.group.position.x;
    const dz = targetWp.z - this.group.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 1.2) {
      this.currentWpIndex = (this.currentWpIndex + 1) % this.waypoints.length;
    } else {
      const dirX = dx / dist;
      const dirZ = dz / dist;

      this.group.position.x += dirX * this.patrolSpeed * delta;
      this.group.position.z += dirZ * this.patrolSpeed * delta;

      const targetAngle = Math.atan2(dirX, dirZ);
      this.smoothRotateY(targetAngle, delta, this.rotationSpeed);

      this.animateWalking(delta, 5.5);
    }
  }

  updateChase(delta, playerPos, distToPlayer) {
    const dx = playerPos.x - this.group.position.x;
    const dz = playerPos.z - this.group.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.1) {
      const dirX = dx / dist;
      const dirZ = dz / dist;

      this.group.position.x += dirX * this.chaseSpeed * delta;
      this.group.position.z += dirZ * this.chaseSpeed * delta;

      const navAngle = Math.atan2(dirX, dirZ);
      this.smoothRotateY(navAngle, delta, this.rotationSpeed * 0.85);

      this.animateWalking(delta, 8.5);
    }

    this.computeAimTowardTarget(playerPos, distToPlayer, delta);
  }

  updateAimShoot(delta, playerPos, distToPlayer, playerController) {
    this.computeAimTowardTarget(playerPos, distToPlayer, delta);

    this.combatStanceTimer += delta;
    if (this.combatStanceTimer > 2.2) {
      this.combatStanceTimer = 0;
      const r = Math.random();
      this.combatStrafeDir = r < 0.3 ? -1 : (r < 0.6 ? 1 : 0);
    }

    if (this.combatStrafeDir !== 0 && distToPlayer > 5.0) {
      const dx = playerPos.x - this.group.position.x;
      const dz = playerPos.z - this.group.position.z;
      const dist = Math.max(0.1, Math.sqrt(dx * dx + dz * dz));
      const strafeX = (-dz / dist) * this.combatStrafeDir;
      const strafeZ = (dx / dist) * this.combatStrafeDir;

      this.group.position.x += strafeX * (this.patrolSpeed * 0.75) * delta;
      this.group.position.z += strafeZ * (this.patrolSpeed * 0.75) * delta;

      this.animateWalking(delta, 5.0);

      const targetAngle = Math.atan2(dx, dz);
      let bodyAngleDiff = targetAngle - this.group.rotation.y;
      while (bodyAngleDiff < -Math.PI) bodyAngleDiff += Math.PI * 2;
      while (bodyAngleDiff > Math.PI) bodyAngleDiff -= Math.PI * 2;
      if (Math.abs(bodyAngleDiff) > 1.2) {
        this.smoothRotateY(targetAngle, delta, this.rotationSpeed * 0.5);
      }
    } else {
      if (this.leftLegGroup && this.rightLegGroup) {
        this.leftLegGroup.rotation.x = THREE.MathUtils.lerp(this.leftLegGroup.rotation.x, 0.08, delta * 6.0);
        this.rightLegGroup.rotation.x = THREE.MathUtils.lerp(this.rightLegGroup.rotation.x, -0.08, delta * 6.0);
      }

      const dx = playerPos.x - this.group.position.x;
      const dz = playerPos.z - this.group.position.z;
      const targetAngle = Math.atan2(dx, dz);
      let bodyAngleDiff = targetAngle - this.group.rotation.y;
      while (bodyAngleDiff < -Math.PI) bodyAngleDiff += Math.PI * 2;
      while (bodyAngleDiff > Math.PI) bodyAngleDiff -= Math.PI * 2;
      if (Math.abs(bodyAngleDiff) > 1.15) {
        this.smoothRotateY(targetAngle, delta, this.rotationSpeed * 0.6);
      }
    }

    this.shootTimer += delta;
    if (this.shootTimer >= this.shootCooldown) {
      if (this.isAimedAtTarget) {
        this.shootTimer = 0;
        this.fireAtPlayer(distToPlayer, playerController);
      } else {
        this.shootTimer = this.shootCooldown * 0.88;
      }
    }
  }

  computeAimTowardTarget(playerPos, distToPlayer, delta) {
    const aimPivotWorldY = this.group.position.y + 1.34;
    const toPlayerX = playerPos.x - this.group.position.x;
    const toPlayerY = (playerPos.y + 0.1) - aimPivotWorldY;
    const toPlayerZ = playerPos.z - this.group.position.z;
    const horizDist = Math.max(0.1, Math.sqrt(toPlayerX * toPlayerX + toPlayerZ * toPlayerZ));

    const worldAimAngle = Math.atan2(toPlayerX, toPlayerZ);

    let localYaw = worldAimAngle - this.group.rotation.y;
    while (localYaw < -Math.PI) localYaw += Math.PI * 2;
    while (localYaw > Math.PI) localYaw -= Math.PI * 2;

    this.targetAimYaw = Math.max(-1.85, Math.min(1.85, localYaw));
    this.targetAimPitch = -Math.atan2(toPlayerY, horizDist);

    this.updateAimAndUpperBody(delta);

    const yawDiff = Math.abs(this.currentAimYaw - localYaw);
    const pitchDiff = Math.abs(this.currentAimPitch - this.targetAimPitch);
    this.isAimedAtTarget = (yawDiff < this.aimThreshold) && (pitchDiff < 0.35);
  }

  updateAimAndUpperBody(delta) {
    this.currentAimYaw = THREE.MathUtils.lerp(this.currentAimYaw, this.targetAimYaw, delta * this.aimRotationSpeed);
    this.currentAimPitch = THREE.MathUtils.lerp(this.currentAimPitch, this.targetAimPitch, delta * this.aimRotationSpeed);

    if (this.aimPivot) {
      this.aimPivot.rotation.x = this.currentAimPitch;
      this.aimPivot.rotation.y = this.currentAimYaw;
    }

    if (this.upperBodyGroup) {
      this.upperBodyGroup.rotation.y = this.currentAimYaw * 0.28;
      this.upperBodyGroup.rotation.x = this.currentAimPitch * 0.15;
    }
  }

  fireAtPlayer(distToPlayer, playerController) {
    if (!this.isAlive) return;

    if (this.enemyMuzzleFlash) {
      this.enemyMuzzleFlash.visible = true;
      this.enemyMuzzleFlash.rotation.z = Math.random() * Math.PI * 2;
      this.muzzleFlashTimer = 0.06;
    }

    this.manager.playEnemyGunshotSound(distToPlayer);

    let hitChance = this.accuracy;
    if (distToPlayer > 12) hitChance *= 0.75;
    if (playerController && playerController.isSprinting) hitChance *= 0.65;

    const isHit = Math.random() < hitChance;

    if (isHit && playerController && typeof playerController.takeDamage === 'function') {
      playerController.takeDamage(this.shotDamage);
    }
  }

  smoothRotateY(targetAngle, delta, speed) {
    const rotSpeed = speed || this.rotationSpeed;
    let diff = targetAngle - this.group.rotation.y;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.group.rotation.y += diff * Math.min(1.0, delta * rotSpeed);
  }

  animateWalking(delta, freq) {
    this.walkAnimTimer += delta * freq;
    const swing = Math.sin(this.walkAnimTimer) * 0.45;

    if (this.leftLegGroup) this.leftLegGroup.rotation.x = swing;
    if (this.rightLegGroup) this.rightLegGroup.rotation.x = -swing;
  }
}
