// Battlezone Magura — Authoritative Multiplayer Network & Remote Player Synchronization (Steps 4 - 8)
// Handles WebSocket connection, room messaging, player transform broadcast, authoritative combat & remote rendering

class RemotePlayer {
  constructor(id, displayName, scene, initialPos = { x: 0, y: 0, z: 0 }, initialYaw = 0) {
    this.id = id;
    this.displayName = displayName || id;
    this.scene = scene;
    this.hp = 100;
    this.maxHp = 100;
    this.isAlive = true;
    this.isProtected = false;

    // Current interpolated transforms
    this.position = new THREE.Vector3(initialPos.x, initialPos.y, initialPos.z);
    this.yaw = initialYaw;
    this.pitch = 0;

    // Target network transforms from server
    this.targetPos = new THREE.Vector3(initialPos.x, initialPos.y, initialPos.z);
    this.targetYaw = initialYaw;
    this.targetPitch = 0;
    this.movementState = 'IDLE';

    // Animation timers
    this.animTimer = 0;
    this.flashTimer = 0;
    this.muzzleTimer = 0;

    // Raycast hit target meshes
    this.hitMeshes = [];

    // Build 3D operator character model
    this.group = new THREE.Group();
    this.group.name = `RemotePlayer_${id}`;
    this.group.position.copy(this.position);
    this.group.rotation.y = this.yaw;

    this.initModel();
    this.initNameAndHealthTag();
    this.initSpawnProtectionShield();

    this.scene.add(this.group);
  }

  initModel() {
    // Tactical uniform materials for allies: Olive Drab / Slate Gray / Matte Dark
    this.jacketMat = new THREE.MeshLambertMaterial({ color: 0x2e4a38 });
    this.vestMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
    this.helmetMat = new THREE.MeshLambertMaterial({ color: 0x3f5242 });
    this.skinMat = new THREE.MeshLambertMaterial({ color: 0xc68642 });
    this.visorMat = new THREE.MeshPhongMaterial({ color: 0x38bdf8, specular: 0xffffff, shininess: 80 });
    this.bootsMat = new THREE.MeshLambertMaterial({ color: 0x111827 });
    this.rifleMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });

    // Upper body group
    this.upperBody = new THREE.Group();
    this.upperBody.position.y = 0.90;
    this.group.add(this.upperBody);

    // Torso (athletic V-taper)
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.54, 8);
    this.torso = new THREE.Mesh(torsoGeo, this.jacketMat);
    this.torso.position.y = 0.27;
    this.torso.scale.set(1.0, 1.0, 0.75);
    this.torso.userData = { remotePlayer: this, playerId: this.id, isHead: false };
    this.hitMeshes.push(this.torso);
    this.upperBody.add(this.torso);

    // Tactical Vest Armor
    const vestGeo = new THREE.BoxGeometry(0.38, 0.42, 0.22);
    this.vest = new THREE.Mesh(vestGeo, this.vestMat);
    this.vest.position.set(0, 0.27, 0);
    this.vest.userData = { remotePlayer: this, playerId: this.id, isHead: false };
    this.hitMeshes.push(this.vest);
    this.upperBody.add(this.vest);

    // Head Group
    this.head = new THREE.Group();
    this.head.position.set(0, 0.60, 0);
    this.upperBody.add(this.head);

    const neckGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.12, 8);
    const neck = new THREE.Mesh(neckGeo, this.skinMat);
    neck.position.y = 0.04;
    neck.userData = { remotePlayer: this, playerId: this.id, isHead: true };
    this.hitMeshes.push(neck);
    this.head.add(neck);

    const skullGeo = new THREE.SphereGeometry(0.13, 8, 8);
    const skull = new THREE.Mesh(skullGeo, this.skinMat);
    skull.position.set(0, 0.16, 0.01);
    skull.userData = { remotePlayer: this, playerId: this.id, isHead: true };
    this.hitMeshes.push(skull);
    this.head.add(skull);

    // FAST Ballistic Helmet
    const helmetGeo = new THREE.SphereGeometry(0.145, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const helmet = new THREE.Mesh(helmetGeo, this.helmetMat);
    helmet.position.set(0, 0.18, 0.005);
    helmet.userData = { remotePlayer: this, playerId: this.id, isHead: true };
    this.hitMeshes.push(helmet);
    this.head.add(helmet);

    // Tactical Visor / Goggles
    const visorGeo = new THREE.BoxGeometry(0.20, 0.05, 0.04);
    const visor = new THREE.Mesh(visorGeo, this.visorMat);
    visor.position.set(0, 0.17, 0.14);
    this.head.add(visor);

    // Weapon Group (Rifle held in ready position)
    this.weaponGroup = new THREE.Group();
    this.weaponGroup.position.set(0.18, 0.22, 0.25);

    const rifleBody = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.10, 0.58), this.rifleMat);
    this.weaponGroup.add(rifleBody);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6), this.rifleMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, 0.42);
    this.weaponGroup.add(barrel);

    // Remote Muzzle Flash Mesh
    const flashGeo = new THREE.OctahedronGeometry(0.10, 0);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffea75, wireframe: true, transparent: true, opacity: 0.9 });
    this.remoteMuzzleFlash = new THREE.Mesh(flashGeo, flashMat);
    this.remoteMuzzleFlash.position.set(0, 0.02, 0.62);
    this.remoteMuzzleFlash.visible = false;
    this.weaponGroup.add(this.remoteMuzzleFlash);

    this.upperBody.add(this.weaponGroup);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.42, 6);
    for (let sx of [-0.24, 0.24]) {
      const arm = new THREE.Mesh(armGeo, this.jacketMat);
      arm.position.set(sx, 0.25, 0.06);
      arm.rotation.x = 0.45;
      arm.userData = { remotePlayer: this, playerId: this.id, isHead: false };
      this.hitMeshes.push(arm);
      this.upperBody.add(arm);
    }

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.72, 6);
    this.leftLeg = new THREE.Mesh(legGeo, this.vestMat);
    this.leftLeg.position.set(-0.12, 0.45, 0);
    this.leftLeg.userData = { remotePlayer: this, playerId: this.id, isHead: false };
    this.hitMeshes.push(this.leftLeg);
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, this.vestMat);
    this.rightLeg.position.set(0.12, 0.45, 0);
    this.rightLeg.userData = { remotePlayer: this, playerId: this.id, isHead: false };
    this.hitMeshes.push(this.rightLeg);
    this.group.add(this.rightLeg);

    // Boots
    const bootGeo = new THREE.BoxGeometry(0.12, 0.14, 0.22);
    const leftBoot = new THREE.Mesh(bootGeo, this.bootsMat);
    leftBoot.position.set(-0.12, 0.07, 0.03);
    this.group.add(leftBoot);

    const rightBoot = new THREE.Mesh(bootGeo, this.bootsMat);
    rightBoot.position.set(0.12, 0.07, 0.03);
    this.group.add(rightBoot);
  }

  initNameAndHealthTag() {
    this.tagCanvas = document.createElement('canvas');
    this.tagCanvas.width = 256;
    this.tagCanvas.height = 72;
    this.tagCtx = this.tagCanvas.getContext('2d');

    this.redrawTag();

    this.tagTexture = new THREE.CanvasTexture(this.tagCanvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: this.tagTexture,
      transparent: true,
      depthTest: false
    });

    this.nameSprite = new THREE.Sprite(spriteMat);
    this.nameSprite.position.set(0, 2.15, 0);
    this.nameSprite.scale.set(1.4, 0.39, 1.0);
    this.group.add(this.nameSprite);
  }

  redrawTag() {
    if (!this.tagCtx) return;
    const ctx = this.tagCtx;
    ctx.clearRect(0, 0, 256, 72);

    // Background plate
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = this.isAlive ? '#38bdf8' : '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(8, 6, 240, 60, 10);
    ctx.fill();
    ctx.stroke();

    // Player Name
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const label = this.isAlive ? this.displayName.toUpperCase() : `☠ ${this.displayName.toUpperCase()} (DEAD)`;
    ctx.fillText(label, 128, 12);

    // Health Bar (Step 4 & 5)
    if (this.isAlive) {
      const barX = 24;
      const barY = 42;
      const barW = 208;
      const barH = 14;

      // Dark background bar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(barX, barY, barW, barH);

      // HP fill color (green -> amber -> red)
      const ratio = Math.max(0, Math.min(1, this.hp / this.maxHp));
      let fillCol = '#22c55e';
      if (ratio < 0.3) fillCol = '#ef4444';
      else if (ratio < 0.6) fillCol = '#f59e0b';

      ctx.fillStyle = fillCol;
      ctx.fillRect(barX, barY, barW * ratio, barH);

      // Inner border
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);
    }

    if (this.tagTexture) {
      this.tagTexture.needsUpdate = true;
    }
  }

  initSpawnProtectionShield() {
    const shieldGeo = new THREE.SphereGeometry(0.85, 12, 10);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      wireframe: true
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.set(0, 0.95, 0);
    this.shieldMesh.visible = false;
    this.group.add(this.shieldMesh);
  }

  setTransform(pos, rot, movementState) {
    if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y) && Number.isFinite(pos.z)) {
      this.targetPos.set(pos.x, pos.y, pos.z);
    }
    if (rot && Number.isFinite(rot.yaw)) {
      this.targetYaw = rot.yaw;
      if (Number.isFinite(rot.pitch)) {
        this.targetPitch = rot.pitch;
      }
    }
    if (movementState) {
      this.movementState = movementState;
    }
  }

  // Remote Shooting Animation (Step 4.5)
  triggerFire() {
    if (!this.isAlive) return;
    this.muzzleTimer = 0.08;
    if (this.remoteMuzzleFlash) {
      this.remoteMuzzleFlash.visible = true;
    }
    // Weapon kick
    if (this.weaponGroup) {
      this.weaponGroup.position.z = 0.20;
    }
  }

  // Remote Hit Reaction (Step 4.3 & 4.4)
  takeHit(damage, isHead, newHp) {
    this.hp = newHp;
    this.flashTimer = 0.12;

    // Flash white/red
    if (this.torso && this.torso.material) {
      this.torso.material.color.setHex(0xef4444);
    }
    if (this.vest && this.vest.material) {
      this.vest.material.color.setHex(0xffffff);
    }

    this.redrawTag();
  }

  // Authoritative Death (Step 5.1 & 5.3)
  die() {
    this.isAlive = false;
    this.hp = 0;
    this.movementState = 'IDLE';

    // Fall backward animation
    this.group.rotation.x = -Math.PI / 2;
    this.group.position.y = 0.2;

    if (this.weaponGroup) this.weaponGroup.visible = false;
    if (this.shieldMesh) this.shieldMesh.visible = false;

    this.redrawTag();
  }

  // Authoritative Respawn (Step 5.4 & 5.5)
  respawn(spawnPos, spawnYaw, health = 100, protectionDuration = 2.5) {
    this.isAlive = true;
    this.hp = health;
    this.group.rotation.x = 0;
    this.group.position.set(spawnPos.x, spawnPos.y, spawnPos.z);
    this.targetPos.set(spawnPos.x, spawnPos.y, spawnPos.z);
    this.yaw = spawnYaw || 0;
    this.targetYaw = spawnYaw || 0;
    this.group.rotation.y = this.yaw;

    if (this.weaponGroup) this.weaponGroup.visible = true;

    // Spawn protection shield visual
    if (this.shieldMesh) {
      this.shieldMesh.visible = true;
      setTimeout(() => {
        if (this.shieldMesh) this.shieldMesh.visible = false;
      }, protectionDuration * 1000);
    }

    this.redrawTag();
  }

  update(delta) {
    // 1. Interpolation (Smooth position & yaw tracking without jitter)
    this.position.lerp(this.targetPos, Math.min(1.0, delta * 14.0));
    this.group.position.copy(this.position);

    let diff = this.targetYaw - this.yaw;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.yaw += diff * Math.min(1.0, delta * 14.0);
    this.group.rotation.y = this.yaw;

    // 2. Head Pitch Look Angle
    if (this.head && this.isAlive) {
      this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, this.targetPitch * 0.7, delta * 12.0);
    }

    // 3. Muzzle flash timer
    if (this.muzzleTimer > 0) {
      this.muzzleTimer -= delta;
      if (this.muzzleTimer <= 0) {
        if (this.remoteMuzzleFlash) this.remoteMuzzleFlash.visible = false;
        if (this.weaponGroup) this.weaponGroup.position.z = 0.25;
      }
    }

    // 4. Hit flash reset
    if (this.flashTimer > 0) {
      this.flashTimer -= delta;
      if (this.flashTimer <= 0) {
        if (this.torso && this.torso.material) this.torso.material.color.setHex(0x2e4a38);
        if (this.vest && this.vest.material) this.vest.material.color.setHex(0x1f2937);
      }
    }

    // 5. Movement Leg Swing Animation
    if (this.isAlive) {
      const isMoving = this.movementState === 'WALKING' || this.movementState === 'RUNNING';
      const animSpeed = this.movementState === 'RUNNING' ? 12.0 : 7.0;

      if (isMoving) {
        this.animTimer += delta * animSpeed;
        const legSwing = Math.sin(this.animTimer) * 0.45;
        if (this.leftLeg) this.leftLeg.rotation.x = legSwing;
        if (this.rightLeg) this.rightLeg.rotation.x = -legSwing;
        if (this.upperBody) this.upperBody.position.y = 0.90 + Math.abs(Math.sin(this.animTimer * 2)) * 0.03;
      } else {
        if (this.leftLeg) this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, delta * 8.0);
        if (this.rightLeg) this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, delta * 8.0);
        if (this.upperBody) this.upperBody.position.y = 0.90;
      }
    }
  }

  dispose() {
    if (this.group && this.group.parent) {
      this.group.parent.remove(this.group);
    }
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m && m.dispose && m.dispose());
        } else if (child.material.dispose) {
          child.material.dispose();
        }
      }
    });
  }
}

class RemotePlayerManager {
  constructor(scene) {
    this.scene = scene;
    this.players = new Map(); // playerId -> RemotePlayer
  }

  addOrUpdatePlayer(playerId, displayName, pos, yaw) {
    let p = this.players.get(playerId);
    if (!p) {
      p = new RemotePlayer(playerId, displayName, this.scene, pos, yaw);
      this.players.set(playerId, p);
      console.log(`[RemotePlayer] Spawned ally ${displayName} (${playerId})`);
    } else {
      p.setTransform(pos, { yaw, pitch: 0 });
    }
    return p;
  }

  handleTransform(playerId, displayName, pos, rot, movementState) {
    let p = this.players.get(playerId);
    if (!p) {
      p = new RemotePlayer(playerId, displayName, this.scene, pos, rot ? rot.yaw : 0);
      this.players.set(playerId, p);
    }
    p.setTransform(pos, rot, movementState);
  }

  handleRemoteShoot(shooterId) {
    const p = this.players.get(shooterId);
    if (p) {
      p.triggerFire();
    }
  }

  handlePlayerHit(targetId, damage, isHead, targetHealth) {
    const p = this.players.get(targetId);
    if (p) {
      p.takeHit(damage, isHead, targetHealth);
    }
  }

  handlePlayerDied(playerId) {
    const p = this.players.get(playerId);
    if (p) {
      p.die();
    }
  }

  handlePlayerRespawned(playerId, spawnPos, spawnYaw, health, protectionDuration) {
    const p = this.players.get(playerId);
    if (p) {
      p.respawn(spawnPos, spawnYaw, health, protectionDuration);
    }
  }

  // Collect all valid alive remote player meshes for weapon raycasting
  getRaycastMeshes() {
    const meshes = [];
    for (const p of this.players.values()) {
      if (p.isAlive && p.hitMeshes) {
        meshes.push(...p.hitMeshes);
      }
    }
    return meshes;
  }

  removePlayer(playerId) {
    const p = this.players.get(playerId);
    if (p) {
      p.dispose();
      this.players.delete(playerId);
      console.log(`[RemotePlayer] Removed ally ${playerId}`);
    }
  }

  clear() {
    for (const p of this.players.values()) {
      p.dispose();
    }
    this.players.clear();
  }

  update(delta) {
    for (const p of this.players.values()) {
      p.update(delta);
    }
  }
}

class BattlezoneNetworkManager {
  constructor() {
    this.ws = null;
    this.playerId = null;
    this.displayName = 'COMMANDO';
    this.roomId = null;
    this.isHost = false;
    this.isReady = false;
    this.roomState = null;
    this.inMatch = false;

    // Send throttling: ~15 Hz (every ~66ms)
    this.lastTransformSend = 0;
    this.sendInterval = 66;

    // Active remote player manager
    this.remoteManager = null;

    // Event callbacks
    this.listeners = {
      roomState: [],
      matchStart: [],
      error: [],
      status: [],
      playerHit: [],
      playerDied: [],
      playerRespawned: [],
      roomInvite: [],
      matchFound: [],
      friendsList: []
    };

    // Auto-connect on start
    this.connect();
  }

  getServerUrl() {
    if (this.customServerUrl) {
      return this.customServerUrl;
    }
    // Dynamic production/development server endpoint resolution
    try {
      let rawUrl = null;
      if (typeof window !== 'undefined') {
        if (window.__VITE_SERVER_URL__) {
          rawUrl = window.__VITE_SERVER_URL__;
        } else if (window.parent && window.parent !== window && window.parent.__VITE_SERVER_URL__) {
          rawUrl = window.parent.__VITE_SERVER_URL__;
        }
      }

      if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim().length > 0) {
        const clean = rawUrl.trim().replace(/\/+$/, '');
        if (clean.startsWith('http://')) return clean.replace(/^http:\/\//, 'ws://');
        if (clean.startsWith('https://')) return clean.replace(/^https:\/\//, 'wss://');
        if (clean.startsWith('ws://') || clean.startsWith('wss://')) return clean;
        const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${proto}//${clean}`;
      }
    } catch (e) {}

    if (typeof window !== 'undefined' && window.location) {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocal) {
        return 'wss://battlezone-magura.onrender.com';
      }
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}`;
    }
    return 'ws://localhost:3000';
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const url = this.getServerUrl();
      console.log(`[Network] Connecting to ${url}...`);
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[Network] WebSocket open');
        if (this.displayName) {
          this.send({ type: 'SET_DISPLAY_NAME', displayName: this.displayName });
        }
        if (this.roomId && this.playerId) {
          this.send({ type: 'CLAIM_SESSION', roomId: this.roomId, playerId: this.playerId });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (e) {
          console.error('[Network] Parse error', e);
        }
      };

      this.ws.onclose = () => {
        this.emitStatus('DISCONNECTED');
        this.ws = null;
      };

      this.ws.onerror = (err) => {
        console.warn('[Network] WebSocket error', err);
        this.emitStatus('DISCONNECTED');
      };
    } catch (e) {
      console.warn('[Network] Connection failed', e);
      this.emitStatus('DISCONNECTED');
    }
  }

  send(msg) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  handleMessage(msg) {
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'SERVER_HELLO':
      case 'CONNECTED':
        this.playerId = msg.playerId;
        this.emitStatus('CONNECTED');
        console.log(`[Network] Handshake verified with playerId=${this.playerId}`);
        break;

      case 'CREATE_ROOM_SUCCESS':
      case 'ROOM_CREATED':
      case 'JOIN_SUCCESS':
      case 'ROOM_JOINED':
        this.roomId = msg.roomId;
        this.playerId = msg.playerId;
        this.isHost = Boolean(msg.host || (msg.roomState && msg.roomState.hostPlayerId === this.playerId));
        this.roomState = msg.roomState;
        this.emitRoomState(this.roomState);
        break;

      case 'ROOM_STATE':
        this.roomState = msg.roomState;
        if (this.roomState && this.playerId) {
          this.isHost = (this.roomState.hostPlayerId === this.playerId);
        }
        this.emitRoomState(this.roomState);
        break;

      case 'HOST_CHANGED':
        if (msg.newHostPlayerId === this.playerId) {
          this.isHost = true;
        }
        break;

      case 'MATCH_STARTING':
        this.inMatch = true;
        this.emitMatchStart(msg);
        break;

      case 'PLAYER_TRANSFORM':
        if (this.remoteManager && msg.playerId !== this.playerId) {
          this.remoteManager.handleTransform(
            msg.playerId,
            msg.displayName,
            msg.position,
            msg.rotation,
            msg.movementState
          );
        }
        break;

      // STEP 4: Combat Shooting & Hits
      case 'REMOTE_SHOOT':
        if (this.remoteManager && msg.shooterId !== this.playerId) {
          this.remoteManager.handleRemoteShoot(msg.shooterId);
        }
        break;

      case 'PLAYER_HIT':
        if (this.remoteManager) {
          this.remoteManager.handlePlayerHit(msg.targetId, msg.damage, msg.isHead, msg.targetHealth);
        }
        this.emit('playerHit', msg);
        break;

      // STEP 5: Death & Respawn
      case 'PLAYER_DIED':
        if (this.remoteManager) {
          this.remoteManager.handlePlayerDied(msg.playerId);
        }
        this.emit('playerDied', msg);
        break;

      case 'PLAYER_RESPAWNED':
        if (this.remoteManager) {
          this.remoteManager.handlePlayerRespawned(
            msg.playerId,
            msg.spawnPosition,
            msg.spawnRotation ? msg.spawnRotation.yaw : 0,
            msg.health,
            msg.invulnerableDuration
          );
        }
        this.emit('playerRespawned', msg);
        break;

      case 'ROOM_INVITE':
        this.emit('roomInvite', msg);
        break;

      case 'MATCH_FOUND':
        this.roomId = msg.roomId;
        this.isHost = msg.isHost;
        this.roomState = msg.roomState;
        this.emit('matchFound', msg);
        break;

      case 'FRIENDS_LIST':
        this.emit('friendsList', msg);
        break;

      case 'PLAYER_LEFT':
        if (this.remoteManager) {
          this.remoteManager.removePlayer(msg.playerId);
        }
        break;

      case 'ROOM_NOT_FOUND':
      case 'ROOM_ERROR':
        this.emitError(msg.code || 'ROOM_NOT_FOUND', msg.message);
        break;

      case 'ROOM_LEFT':
        this.roomId = null;
        this.isHost = false;
        this.isReady = false;
        this.roomState = null;
        this.inMatch = false;
        if (this.remoteManager) {
          this.remoteManager.clear();
        }
        break;
    }
  }

  // --- API Methods for UI & Game ---
  setDisplayName(name) {
    this.displayName = name;
    this.send({ type: 'SET_DISPLAY_NAME', displayName: name });
  }

  claimSession(roomId, playerId) {
    this.roomId = roomId;
    this.playerId = playerId;
    this.connect();
    this.send({ type: 'CLAIM_SESSION', roomId, playerId, displayName: this.displayName });
  }

  createRoom(mapId = 'magura_town') {
    this.connect();
    this.send({ type: 'CREATE_ROOM', displayName: this.displayName, mapId });
  }

  joinRoom(roomId) {
    const canonicalId = (roomId || '').trim().toUpperCase();
    this.connect();
    this.send({ type: 'JOIN_ROOM', roomId: canonicalId, displayName: this.displayName });
  }

  setReady(ready) {
    this.isReady = ready;
    this.send({ type: 'SET_READY', ready });
  }

  selectMap(mapId) {
    this.send({ type: 'SELECT_MAP', mapId });
  }

  startMatch() {
    this.send({ type: 'START_MATCH' });
  }

  leaveRoom() {
    this.send({ type: 'LEAVE_ROOM' });
  }

  // STEP 4: Local Player Authoritative Shoot Request
  shoot(targetPlayerId, isHead, origin, direction, hitPoint) {
    if (!this.inMatch || !this.roomId) return;

    this.send({
      type: 'PLAYER_SHOOT',
      targetPlayerId: targetPlayerId || null,
      isHead: Boolean(isHead),
      origin: origin ? { x: origin.x, y: origin.y, z: origin.z } : null,
      direction: direction ? { x: direction.x, y: direction.y, z: direction.z } : null,
      hitPoint: hitPoint ? { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z } : null,
      weaponId: 'BD-08'
    });
  }

  // STEP 6: Friends & Social
  sendFriendRequest(target) {
    this.send({ type: 'SEND_FRIEND_REQUEST', target });
  }

  acceptFriendRequest(fromPlayerId) {
    this.send({ type: 'ACCEPT_FRIEND_REQUEST', fromPlayerId });
  }

  declineFriendRequest(fromPlayerId) {
    this.send({ type: 'DECLINE_FRIEND_REQUEST', fromPlayerId });
  }

  getFriends() {
    this.send({ type: 'GET_FRIENDS' });
  }

  inviteFriend(targetPlayerId) {
    this.send({ type: 'ROOM_INVITE', targetPlayerId });
  }

  // STEP 7: Quick Matchmaking
  quickMatch(preferredMap = 'magura_town') {
    this.connect();
    this.send({ type: 'QUICK_MATCH', displayName: this.displayName, preferredMap });
  }

  cancelMatchmaking() {
    this.send({ type: 'CANCEL_MATCHMAKING' });
  }

  // Movement & Transform Sync (~15 Hz)
  sendLocalTransform(pos, yaw, pitch, isMoving, isSprinting) {
    if (!this.inMatch || !this.roomId || !pos) return;

    const now = performance.now();
    if (now - this.lastTransformSend < this.sendInterval) return;
    this.lastTransformSend = now;

    const movementState = isSprinting ? 'RUNNING' : (isMoving ? 'WALKING' : 'IDLE');

    this.send({
      type: 'PLAYER_TRANSFORM',
      playerId: this.playerId,
      position: { x: pos.x, y: pos.y, z: pos.z },
      rotation: { yaw, pitch },
      movementState
    });
  }

  attachRemoteManager(remoteManager) {
    this.remoteManager = remoteManager;
  }

  // Event Subscription
  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(fn => fn(data));
    }
  }

  onRoomState(fn) { this.on('roomState', fn); }
  onMatchStart(fn) { this.on('matchStart', fn); }
  onError(fn) { this.on('error', fn); }
  onStatusChange(fn) { this.on('status', fn); }

  emitRoomState(state) { this.emit('roomState', state); }
  emitMatchStart(data) { this.emit('matchStart', data); }
  emitError(code, message) {
    if (this.listeners.error) {
      this.listeners.error.forEach(fn => fn(code, message));
    }
  }
  emitStatus(status) { this.emit('status', status); }
}

// Global Singleton Instance
window.battlezoneNetwork = new BattlezoneNetworkManager();
window.RemotePlayerManager = RemotePlayerManager;
