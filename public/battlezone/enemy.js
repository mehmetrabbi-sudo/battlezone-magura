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

    // Kills Counter & Victory Tracking
    this.kills = 0;
    this.hasWon = false;
    this.victoryTimer = null;
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
    this._tempV3 = new THREE.Vector3();
    this._boxIntersectPt = new THREE.Vector3();
    this._raycastTargets = [];

    // Initialize the enemy bots (uses customConfigs if provided, else defaults to Magura Town)
    this.initEnemies(customEnemyConfigs);
  }

  getRemainingEnemiesCount() {
    let count = 0;
    for (let i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i].isAlive) {
        count++;
      }
    }
    return count;
  }

  onEnemyKilled(enemy) {
    this.kills++;
    const totalEnemies = this.enemies.length;
    const remaining = this.getRemainingEnemiesCount();

    if (window.battlezoneHUD) {
      window.battlezoneHUD.updateKills(this.kills);
      window.battlezoneHUD.updateEnemiesLeft(remaining);
    } else {
      if (this.killsDisplay) {
        this.killsDisplay.textContent = `KILLS: ${this.kills}`;
      }
    }

    // Hook into Mission System when active
    if (window.missionManager && window.missionManager.isMissionMode) {
      window.missionManager.onEnemyKilled(enemy);
      return;
    }

    // Victory condition check: verify every active enemy has been eliminated
    if (this.kills >= totalEnemies && remaining === 0 && totalEnemies > 0 && !this.hasWon) {
      this.triggerVictory();
    }
  }

  triggerVictory() {
    this.hasWon = true;

    if (window.battlezoneHUD) {
      window.battlezoneHUD.showVictory({
        kills: this.kills,
        totalEnemies: this.enemies.length,
        sector: (typeof currentMap !== 'undefined' && (currentMap === 'magura_river_port' || currentMap === 'magura-river-port')) ? 'RIVER PORT & INDUSTRIAL' : (typeof currentMap !== 'undefined' && currentMap === 'abalpur_village') ? 'ABALPUR VILLAGE' : 'MAGURA TOWN'
      });
      return;
    }

    this.playVictorySound();

    let overlay = document.getElementById('victory-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'victory-overlay';
      document.body.appendChild(overlay);
    }

    let countdown = 4;
    const totalEnemies = this.enemies.length;
    const renderCard = (secs) => {
      overlay.innerHTML = `
        <div style="
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.94));
          border: 2px solid #f59e0b;
          border-radius: 16px;
          padding: 24px 32px;
          text-align: center;
          color: #f8fafc;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.85), 0 0 32px rgba(245, 158, 11, 0.35);
          max-width: 92vw;
          width: 380px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          pointer-events: auto;
        ">
          <div style="font-size: 42px; margin-bottom: 6px; filter: drop-shadow(0 0 12px rgba(245, 158, 11, 0.6));">🏆</div>
          <div style="font-size: 30px; font-weight: 900; letter-spacing: 3px; color: #fbbf24; text-shadow: 0 0 16px rgba(251, 191, 36, 0.65); margin-bottom: 2px;">VICTORY</div>
          <div style="font-size: 13px; font-weight: 700; color: #e2e8f0; letter-spacing: 1.5px; margin-bottom: 16px;">বিজয় • ALL ENEMIES ELIMINATED</div>
          <div style="background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 10px 14px; margin-bottom: 18px; display: flex; justify-content: space-around; align-items: center;">
            <div>
              <div style="font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 1px;">TOTAL KILLS</div>
              <div style="font-size: 18px; font-weight: 800; color: #22c55e;">💀 ${this.kills} / ${totalEnemies}</div>
            </div>
            <div style="width: 1px; height: 28px; background: rgba(255, 255, 255, 0.15);"></div>
            <div>
              <div style="font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 1px;">SECTOR</div>
              <div style="font-size: 13px; font-weight: 800; color: #38bdf8;">${(typeof currentMap !== 'undefined' && (currentMap === 'magura_river_port' || currentMap === 'magura-river-port')) ? 'RIVER PORT' : (typeof currentMap !== 'undefined' && currentMap === 'abalpur_village') ? 'ABALPUR' : 'MAGURA TOWN'}</div>
            </div>
          </div>
          <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 16px; font-family: monospace;">Returning to Lobby in <span style="color: #f59e0b; font-weight: 800;">${secs}s</span>...</div>
          <button id="btn-victory-lobby" style="
            width: 100%;
            padding: 12px 18px;
            background: linear-gradient(135deg, #e11d48, #be123c);
            border: 1px solid #fda4af;
            border-radius: 10px;
            color: #ffffff;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 1px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4);
            touch-action: manipulation;
          ">
            <span>লবিতে ফিরুন (RETURN TO LOBBY)</span>
            <span>→</span>
          </button>
        </div>
      `;
      overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(3, 7, 18, 0.84);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 99999;
        pointer-events: auto;
      `;
      const btn = document.getElementById('btn-victory-lobby');
      if (btn) {
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.returnToLobby();
        };
      }
    };

    renderCard(countdown);

    if (this.victoryTimer) clearInterval(this.victoryTimer);
    this.victoryTimer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(this.victoryTimer);
        this.victoryTimer = null;
        this.returnToLobby();
      } else {
        renderCard(countdown);
      }
    }, 1000);
  }

  returnToLobby() {
    if (this.victoryTimer) {
      clearInterval(this.victoryTimer);
      this.victoryTimer = null;
    }
    const overlay = document.getElementById('victory-overlay');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    // Post message to parent container to exit to lobby
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'BATTLEZONE_EXIT_TO_LOBBY' }, '*');
    }
    if (typeof CustomEvent !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('battlezone:exit-lobby'));
    }
  }

  playVictorySound() {
    const ctx = this.audioCtx;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 triumphant chord
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);
      gain.gain.setValueAtTime(0.28, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.85);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.9);
    });
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
    if (this.enemies && this.enemies.length > 0) {
      this.enemies.forEach((e) => {
        if (e.group && e.group.parent) {
          e.group.parent.remove(e.group);
        }
      });
      this.enemies = [];
    }
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
      },
      {
        id: 8,
        name: "শত্রু ৮ (টাউন স্কয়ার মুক্তমঞ্চ চত্বর)",
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
        name: "শত্রু ৯ (নবগঙ্গা রিভার ঘাট ও ওয়াকওয়ে)",
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
        name: "শত্রু ১০ (মডেল টাউন ক্লিনিক স্কয়ার)",
        spawn: { x: 58, y: 0, z: -70 },
        waypoints: [
          { x: 58, z: -70 },
          { x: 58, z: -84 },
          { x: 40, z: -84 },
          { x: 58, z: -70 }
        ]
      }
    ];

    enemyConfigs.forEach((cfg) => {
      const enemy = new EnemyBot(cfg, this.scene, this);
      this.enemies.push(enemy);
    });

    if (window.battlezoneHUD) {
      window.battlezoneHUD.updateKills(this.kills);
      window.battlezoneHUD.updateEnemiesLeft(this.enemies.length);
      window.battlezoneHUD.setObjective('ELIMINATE ALL HOSTILES', `0/${this.enemies.length}`);
    }
  }

  resetEnemies(customConfigs, colliders) {
    if (this.enemies && this.enemies.length > 0) {
      this.enemies.forEach((e) => {
        if (e.dispose) {
          e.dispose();
        } else if (e.group && e.group.parent) {
          e.group.parent.remove(e.group);
        }
      });
    }
    this.enemies = [];
    if (colliders) this.colliders = colliders;
    this.kills = 0;
    this.hasWon = false;
    if (window.battlezoneHUD) {
      window.battlezoneHUD.updateKills(0);
    } else if (this.killsDisplay) {
      this.killsDisplay.textContent = 'KILLS: 0';
    }
    if (this.victoryTimer) {
      clearInterval(this.victoryTimer);
      this.victoryTimer = null;
    }
    const overlay = document.getElementById('victory-overlay');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    this.initEnemies(customConfigs);
  }

  handlePlayerShot(camera) {
    if (!camera) return null;
    camera.updateMatrixWorld(true);
    this.bulletRaycaster.setFromCamera({ x: 0, y: 0 }, camera);
    const ray = this.bulletRaycaster.ray;

    // 1. Raycast against World Building / Cover Colliders
    let closestWallDist = Infinity;
    let closestWallPoint = null;
    let closestWallNormal = null;

    if (this.colliders && this.colliders.length > 0) {
      for (let c = 0; c < this.colliders.length; c++) {
        const box = this.colliders[c];
        // Low ground slabs, curbs, bridge decks, and road colliders (height < 0.6m) do not block horizontal bullets
        if (box.max.y < 0.6) continue;

        const intersectPt = ray.intersectBox(box, this._boxIntersectPt);
        if (intersectPt) {
          const d = ray.origin.distanceTo(intersectPt);
          // Only solid vertical cover in front of player
          if (d > 0.25 && d < closestWallDist) {
            closestWallDist = d;
            closestWallPoint = intersectPt.clone();

            // Calculate face normal of the box for particle ricochet reflection
            const norm = new THREE.Vector3(0, 1, 0);
            const eps = 0.08;
            if (Math.abs(intersectPt.x - box.min.x) < eps) norm.set(-1, 0, 0);
            else if (Math.abs(intersectPt.x - box.max.x) < eps) norm.set(1, 0, 0);
            else if (Math.abs(intersectPt.y - box.min.y) < eps) norm.set(0, -1, 0);
            else if (Math.abs(intersectPt.y - box.max.y) < eps) norm.set(0, 1, 0);
            else if (Math.abs(intersectPt.z - box.min.z) < eps) norm.set(0, 0, -1);
            else if (Math.abs(intersectPt.z - box.max.z) < eps) norm.set(0, 0, 1);
            closestWallNormal = norm;
          }
        }
      }
    }

    // 2. Raycast against Ground Plane (y = 0 or custom terrain elevation)
    let groundDist = Infinity;
    let groundPoint = null;
    if (ray.direction.y < -0.001) {
      const t = (0 - ray.origin.y) / ray.direction.y;
      if (t > 0 && t < 120) {
        groundDist = t;
        groundPoint = new THREE.Vector3().copy(ray.origin).addScaledVector(ray.direction, t);
      }
    }

    // 3. Central Enemy Hit Resolution Pipeline:
    // Collect all living, damageable active enemies
    this._raycastTargets.length = 0;
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.isAlive && !e.isDying && e.hp > 0 && e.group) {
        e.group.updateMatrixWorld(true);
        this._raycastTargets.push(e.group);
      }
    }

    let enemyHit = null;
    if (this._raycastTargets.length > 0) {
      // Test recursive raycast through enemy group hierarchies
      const intersects = this.bulletRaycaster.intersectObjects(this._raycastTargets, true);
      for (let i = 0; i < intersects.length; i++) {
        const hit = intersects[i];
        if (hit.distance > closestWallDist + 0.1) {
          // Blocked by a solid wall strictly in front of this hit
          break;
        }

        // Walk up object hierarchy to resolve owning enemy entity
        let curr = hit.object;
        let foundEnemy = null;
        let isHead = false;

        while (curr) {
          if (curr.userData) {
            if (curr.userData.enemy) {
              foundEnemy = curr.userData.enemy;
            }
            if (curr.userData.isHead) {
              isHead = true;
            }
          }
          if (foundEnemy) break;
          curr = curr.parent;
        }

        // If not flagged via userData directly, check if curr belonged to an enemy instance
        if (!foundEnemy) {
          let testObj = hit.object;
          while (testObj) {
            for (let eIdx = 0; eIdx < this.enemies.length; eIdx++) {
              const eObj = this.enemies[eIdx];
              if (eObj && eObj.group === testObj) {
                foundEnemy = eObj;
                break;
              }
            }
            if (foundEnemy) break;
            testObj = testObj.parent;
          }
        }

        // Additional anatomical headshot check if hit point is at head level
        if (foundEnemy && !isHead && hit.point && foundEnemy.group) {
          const localY = hit.point.y - foundEnemy.group.position.y;
          if (localY >= 1.45) {
            isHead = true;
          }
        }

        if (foundEnemy && foundEnemy.isAlive && !foundEnemy.isDying && foundEnemy.hp > 0) {
          enemyHit = {
            enemy: foundEnemy,
            point: hit.point.clone(),
            isHead,
            distance: hit.distance
          };
          break; // Stop at first valid living enemy along ray
        }
      }
    }

    // 4. Resolve hit priority based on nearest distance along bullet trajectory
    if (enemyHit && enemyHit.distance < closestWallDist + 0.1 && (enemyHit.distance < groundDist + 0.8)) {
      // Authoritative damage path scaled by active weapon profile:
      let baseDamage = 28;
      if (window.weaponSystem && window.weaponSystem.weapons && window.weaponSystem.currentWeaponIndex !== undefined) {
        const curW = window.weaponSystem.weapons[window.weaponSystem.currentWeaponIndex];
        if (curW && curW.dmg) baseDamage = curW.dmg;
      }
      const damage = enemyHit.isHead ? Math.round(baseDamage * 2.0) : baseDamage;
      enemyHit.enemy.takeDamage(damage, enemyHit.point, enemyHit.isHead);
      this.showHitMarker(enemyHit.isHead);
      return {
        type: 'enemy',
        enemy: enemyHit.enemy,
        point: enemyHit.point,
        isHead: enemyHit.isHead,
        distance: enemyHit.distance
      };
    }

    if (closestWallDist < Infinity && closestWallDist <= groundDist && closestWallDist < 90) {
      return {
        type: 'wall',
        point: closestWallPoint,
        normal: closestWallNormal || new THREE.Vector3(0, 1, 0),
        distance: closestWallDist
      };
    }

    if (groundDist < Infinity && groundDist < 90) {
      return {
        type: 'ground',
        point: groundPoint,
        normal: new THREE.Vector3(0, 1, 0),
        distance: groundDist
      };
    }

    // Miss into open distance
    return {
      type: 'miss',
      point: new THREE.Vector3().copy(ray.origin).addScaledVector(ray.direction, 65),
      distance: 65
    };
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

    // Tactical Collision & Line-of-Sight navigation against buildings/houses
    this.botRadius = 0.52;
    this.botBox = new THREE.Box3();
    this.losRay = new THREE.Ray();
    this._tempV3 = new THREE.Vector3();
    this.stuckTimer = 0;

    this.initModel();
    this.initHealthBar();
    this.resolveObstacleOverlap();
  }

  initModel() {
    this.group = new THREE.Group();
    this.group.position.set(this.spawnPos.x, this.spawnPos.y, this.spawnPos.z);

    // 10 Distinct Tactical Enemy Operative Themes
    const THEMES = [
      { camoTorso: 0x222a24, camoPants: 0x1c211d, vest: 0x131714, helmet: 0x263028, accent: 0xd97706, goggle: 0x0f3b4c, skin: 0xa87d5b },
      { camoTorso: 0x2e3b26, camoPants: 0x252e1f, vest: 0x1b2416, helmet: 0x33422a, accent: 0x16a34a, goggle: 0x1a2e3b, skin: 0x9b7252 },
      { camoTorso: 0x181a1f, camoPants: 0x13151a, vest: 0x0d0f12, helmet: 0x1b1e24, accent: 0x38bdf8, goggle: 0x0369a1, skin: 0xb58b68 },
      { camoTorso: 0x5a4a35, camoPants: 0x473a29, vest: 0x382c1e, helmet: 0x615039, accent: 0xf59e0b, goggle: 0x0284c7, skin: 0x8a6344 },
      { camoTorso: 0x273629, camoPants: 0x1f2b20, vest: 0x162017, helmet: 0x2b3d2d, accent: 0xeab308, goggle: 0x0c4a6e, skin: 0xa87d5b },
      { camoTorso: 0x2c3328, camoPants: 0x232920, vest: 0x1a2118, helmet: 0x303b2c, accent: 0x10b981, goggle: 0x115e59, skin: 0x966d4f },
      { camoTorso: 0x21252d, camoPants: 0x1a1e25, vest: 0x14171d, helmet: 0x252b34, accent: 0x6366f1, goggle: 0x1e3a8a, skin: 0xb88d6a },
      { camoTorso: 0x34402a, camoPants: 0x283120, vest: 0x1e2718, helmet: 0x3d4b31, accent: 0x84cc16, goggle: 0x047857, skin: 0x8f6848 },
      { camoTorso: 0x293d38, camoPants: 0x1e2d29, vest: 0x14211e, helmet: 0x2e453f, accent: 0x14b8a6, goggle: 0x0891b2, skin: 0xa07555 },
      { camoTorso: 0x17191c, camoPants: 0x121416, vest: 0x0a0c0e, helmet: 0x6b1d1d, accent: 0xef4444, goggle: 0x7f1d1d, skin: 0xaa7e5c }
    ];
    const theme = THEMES[(Math.abs(this.id - 1)) % THEMES.length];

    // High-grade tactical materials
    const camoTorsoMat = new THREE.MeshLambertMaterial({ color: theme.camoTorso });
    const camoPantsMat = new THREE.MeshLambertMaterial({ color: theme.camoPants });
    const skinMat = new THREE.MeshLambertMaterial({ color: theme.skin });
    const vestMat = new THREE.MeshLambertMaterial({ color: theme.vest });
    const helmetMat = new THREE.MeshLambertMaterial({ color: theme.helmet });
    const accentMat = new THREE.MeshLambertMaterial({ color: theme.accent });
    const rifleMat = new THREE.MeshPhongMaterial({ color: 0x1b1e22, specular: 0x555555, shininess: 40 });
    const rifleSteelMat = new THREE.MeshPhongMaterial({ color: 0x2d333b, specular: 0x777777, shininess: 65 });
    const bootsMat = new THREE.MeshLambertMaterial({ color: 0x0c0e10 });
    const kneePadMat = new THREE.MeshLambertMaterial({ color: 0x181a1d });
    const gogglesMat = new THREE.MeshPhongMaterial({ color: theme.goggle, specular: 0x88ccff, shininess: 70 });

    this.flashingMeshes = [];

    const tagMesh = (mesh, isHead = false) => {
      mesh.userData = { enemy: this, isHead: isHead };
      if (mesh.isMesh && mesh.material) {
        const mat = mesh.material;
        const color = (mat.color && typeof mat.color.getHex === 'function') ? mat.color.getHex() : 0xffffff;
        this.flashingMeshes.push({ mesh, origColor: color });
      }
      return mesh;
    };

    this.group.userData = { enemy: this, isHead: false };

    // UPPER BODY ROOT (Spine & Chest)
    this.upperBodyGroup = new THREE.Group();
    this.upperBodyGroup.position.set(0, 0.90, 0);
    this.upperBodyGroup.userData = { enemy: this, isHead: false };
    this.group.add(this.upperBodyGroup);

    // 1. Tapered Humanoid Torso (Athletic V-taper)
    const torsoGeo = new THREE.CylinderGeometry(0.23, 0.17, 0.54, 8);
    this.torso = new THREE.Mesh(torsoGeo, camoTorsoMat);
    this.torso.position.y = 0.28;
    this.torso.scale.set(1.0, 1.0, 0.72); // Natural chest/back depth
    tagMesh(this.torso, false);
    this.upperBodyGroup.add(this.torso);

    // 2. Tactical Plate Carrier Vest (Layered Ballistic Armor)
    const vestFrontGeo = new THREE.BoxGeometry(0.38, 0.40, 0.14);
    const vestFront = new THREE.Mesh(vestFrontGeo, vestMat);
    vestFront.position.set(0, 0.02, 0.07);
    tagMesh(vestFront, false);
    this.torso.add(vestFront);

    const vestBackGeo = new THREE.BoxGeometry(0.36, 0.38, 0.12);
    const vestBack = new THREE.Mesh(vestBackGeo, vestMat);
    vestBack.position.set(0, 0.03, -0.07);
    tagMesh(vestBack, false);
    this.torso.add(vestBack);

    // Shoulder Harness Straps
    for (let sx of [-0.14, 0.14]) {
      const strapGeo = new THREE.BoxGeometry(0.065, 0.12, 0.22);
      const strap = new THREE.Mesh(strapGeo, vestMat);
      strap.position.set(sx, 0.20, 0);
      tagMesh(strap, false);
      this.torso.add(strap);
    }

    // 3x Front Magazine Pouches on Chest
    for (let i = 0; i < 3; i++) {
      const pouchGeo = new THREE.BoxGeometry(0.075, 0.13, 0.05);
      const pouch = new THREE.Mesh(pouchGeo, accentMat);
      pouch.position.set(-0.10 + i * 0.10, -0.07, 0.155);
      tagMesh(pouch, false);
      this.torso.add(pouch);
    }

    // Radio Comm Transmitter & Antenna on Left Shoulder
    const radioGeo = new THREE.BoxGeometry(0.06, 0.11, 0.05);
    const radio = new THREE.Mesh(radioGeo, bootsMat);
    radio.position.set(-0.16, 0.14, 0.10);
    tagMesh(radio, false);
    this.torso.add(radio);

    const antGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.24, 6);
    const ant = new THREE.Mesh(antGeo, bootsMat);
    ant.position.set(-0.16, 0.29, 0.10);
    tagMesh(ant, false);
    this.torso.add(ant);

    // Tactical Utility Belt & Pelvis
    const pelvisGeo = new THREE.CylinderGeometry(0.19, 0.17, 0.16, 8);
    const pelvis = new THREE.Mesh(pelvisGeo, camoPantsMat);
    pelvis.position.set(0, 0, 0);
    pelvis.scale.set(1.0, 1.0, 0.75);
    tagMesh(pelvis, false);
    this.upperBodyGroup.add(pelvis);

    const beltGeo = new THREE.CylinderGeometry(0.21, 0.20, 0.06, 8);
    const belt = new THREE.Mesh(beltGeo, vestMat);
    belt.position.set(0, 0.04, 0);
    belt.scale.set(1.0, 1.0, 0.78);
    tagMesh(belt, false);
    this.upperBodyGroup.add(belt);

    // Sidearm Holster with Pistol Handle on Right Hip
    const holsterGeo = new THREE.BoxGeometry(0.06, 0.14, 0.07);
    const holster = new THREE.Mesh(holsterGeo, bootsMat);
    holster.position.set(0.20, -0.04, 0);
    tagMesh(holster, false);
    this.upperBodyGroup.add(holster);

    // HEAD GROUP (Anatomical Neck, Skull, Balaclava, Helmet, Goggles)
    this.head = new THREE.Group();
    this.head.position.set(0, 0.58, 0);
    this.head.userData = { enemy: this, isHead: true };
    this.upperBodyGroup.add(this.head);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.075, 0.085, 0.12, 8);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 0.04, 0);
    tagMesh(neck, true);
    this.head.add(neck);

    // Humanoid Head / Skull
    const headGeo = new THREE.SphereGeometry(0.125, 10, 10);
    this.headMesh = new THREE.Mesh(headGeo, skinMat);
    this.headMesh.position.set(0, 0.16, 0.01);
    this.headMesh.scale.set(0.92, 1.08, 1.0);
    tagMesh(this.headMesh, true);
    this.head.add(this.headMesh);

    // Tactical Balaclava / Face Shroud
    const maskGeo = new THREE.CylinderGeometry(0.118, 0.112, 0.16, 10);
    this.maskMesh = new THREE.Mesh(maskGeo, vestMat);
    this.maskMesh.position.set(0, 0.13, 0.015);
    tagMesh(this.maskMesh, true);
    this.head.add(this.maskMesh);

    // Ballistic Combat FAST Helmet
    const helmetGeo = new THREE.SphereGeometry(0.142, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58);
    this.helmetMesh = new THREE.Mesh(helmetGeo, helmetMat);
    this.helmetMesh.position.set(0, 0.18, 0.005);
    tagMesh(this.helmetMesh, true);
    this.head.add(this.helmetMesh);

    // Helmet Front NVG Mount Shroud & Side Rails
    const nvgGeo = new THREE.BoxGeometry(0.05, 0.05, 0.025);
    const nvgMount = new THREE.Mesh(nvgGeo, bootsMat);
    nvgMount.position.set(0, 0.22, 0.142);
    tagMesh(nvgMount, true);
    this.head.add(nvgMount);

    for (let rx of [-0.14, 0.14]) {
      const railGeo = new THREE.BoxGeometry(0.015, 0.035, 0.10);
      const hRail = new THREE.Mesh(railGeo, bootsMat);
      hRail.position.set(rx, 0.19, 0.01);
      tagMesh(hRail, true);
      this.head.add(hRail);
    }

    // Tactical Ballistic Goggles with Tinted Specular Lens
    const goggleFrameGeo = new THREE.BoxGeometry(0.20, 0.055, 0.04);
    const goggleFrame = new THREE.Mesh(goggleFrameGeo, bootsMat);
    goggleFrame.position.set(0, 0.175, 0.132);
    tagMesh(goggleFrame, true);
    this.head.add(goggleFrame);

    const goggleLensGeo = new THREE.BoxGeometry(0.18, 0.042, 0.015);
    const goggleLens = new THREE.Mesh(goggleLensGeo, gogglesMat);
    goggleLens.position.set(0, 0.175, 0.150);
    tagMesh(goggleLens, true);
    this.head.add(goggleLens);

    // LEGS & TACTICAL COMBAT BOOTS
    // Left Leg Group
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.11, 0.90, 0);
    this.leftLegGroup.userData = { enemy: this, isHead: false };

    const thighGeo = new THREE.CylinderGeometry(0.095, 0.082, 0.36, 8);
    const leftThigh = new THREE.Mesh(thighGeo, camoPantsMat);
    leftThigh.position.y = -0.18;
    tagMesh(leftThigh, false);
    this.leftLegGroup.add(leftThigh);

    const kneePadGeo = new THREE.BoxGeometry(0.12, 0.11, 0.05);
    const leftKneePad = new THREE.Mesh(kneePadGeo, kneePadMat);
    leftKneePad.position.set(0, -0.37, 0.08);
    tagMesh(leftKneePad, false);
    this.leftLegGroup.add(leftKneePad);

    const shinGeo = new THREE.CylinderGeometry(0.080, 0.070, 0.32, 8);
    const leftShin = new THREE.Mesh(shinGeo, camoPantsMat);
    leftShin.position.y = -0.52;
    tagMesh(leftShin, false);
    this.leftLegGroup.add(leftShin);

    const bootGeo = new THREE.BoxGeometry(0.14, 0.18, 0.24);
    const leftBoot = new THREE.Mesh(bootGeo, bootsMat);
    leftBoot.position.set(0, -0.74, 0.03);
    tagMesh(leftBoot, false);
    this.leftLegGroup.add(leftBoot);
    this.group.add(this.leftLegGroup);

    // Right Leg Group
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.11, 0.90, 0);
    this.rightLegGroup.userData = { enemy: this, isHead: false };

    const rightThigh = new THREE.Mesh(thighGeo, camoPantsMat);
    rightThigh.position.y = -0.18;
    tagMesh(rightThigh, false);
    this.rightLegGroup.add(rightThigh);

    const rightKneePad = new THREE.Mesh(kneePadGeo, kneePadMat);
    rightKneePad.position.set(0, -0.37, 0.08);
    tagMesh(rightKneePad, false);
    this.rightLegGroup.add(rightKneePad);

    const rightShin = new THREE.Mesh(shinGeo, camoPantsMat);
    rightShin.position.y = -0.52;
    tagMesh(rightShin, false);
    this.rightLegGroup.add(rightShin);

    const rightBoot = new THREE.Mesh(bootGeo, bootsMat);
    rightBoot.position.set(0, -0.74, 0.03);
    tagMesh(rightBoot, false);
    this.rightLegGroup.add(rightBoot);
    this.group.add(this.rightLegGroup);

    // AIM PIVOT & TACTICAL ARMS WITH OPERATOR GLOVES
    this.aimPivot = new THREE.Group();
    this.aimPivot.position.set(0, 1.34, 0.04);
    this.aimPivot.userData = { enemy: this, isHead: false };
    this.group.add(this.aimPivot);

    // Left Arm Group (Gripping forward handguard)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.25, 0.04, 0);
    this.leftArmGroup.userData = { enemy: this, isHead: false };

    const bicepGeo = new THREE.CylinderGeometry(0.065, 0.058, 0.26, 8);
    const leftBicep = new THREE.Mesh(bicepGeo, camoTorsoMat);
    leftBicep.position.set(0.06, -0.12, 0.08);
    leftBicep.rotation.set(-0.65, 0.45, -0.2);
    tagMesh(leftBicep, false);
    this.leftArmGroup.add(leftBicep);

    const forearmGeo = new THREE.CylinderGeometry(0.055, 0.048, 0.24, 8);
    const leftForearm = new THREE.Mesh(forearmGeo, camoTorsoMat);
    leftForearm.position.set(0.14, -0.24, 0.20);
    leftForearm.rotation.set(-1.05, 0.70, -0.15);
    tagMesh(leftForearm, false);
    this.leftArmGroup.add(leftForearm);

    // Tactical Glove
    const gloveGeo = new THREE.BoxGeometry(0.06, 0.08, 0.065);
    const leftGlove = new THREE.Mesh(gloveGeo, bootsMat);
    leftGlove.position.set(0.20, -0.32, 0.32);
    tagMesh(leftGlove, false);
    this.leftArmGroup.add(leftGlove);
    this.aimPivot.add(this.leftArmGroup);

    // Right Arm Group (Trigger Hand)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.25, 0.04, 0);
    this.rightArmGroup.userData = { enemy: this, isHead: false };

    const rightBicep = new THREE.Mesh(bicepGeo, camoTorsoMat);
    rightBicep.position.set(-0.06, -0.12, 0.06);
    rightBicep.rotation.set(-0.75, -0.30, 0.15);
    tagMesh(rightBicep, false);
    this.rightArmGroup.add(rightBicep);

    const rightForearm = new THREE.Mesh(forearmGeo, camoTorsoMat);
    rightForearm.position.set(-0.10, -0.24, 0.18);
    rightForearm.rotation.set(-1.10, -0.35, 0.12);
    tagMesh(rightForearm, false);
    this.rightArmGroup.add(rightForearm);

    const rightGlove = new THREE.Mesh(gloveGeo, bootsMat);
    rightGlove.position.set(-0.12, -0.32, 0.30);
    tagMesh(rightGlove, false);
    this.rightArmGroup.add(rightGlove);
    this.aimPivot.add(this.rightArmGroup);

    // TACTICAL COMBAT ASSAULT RIFLE (High-Detail 3D Mesh)
    this.rifleGroup = new THREE.Group();
    this.rifleGroup.position.set(0.08, -0.06, 0.28);
    this.rifleGroup.userData = { enemy: this, isHead: false };
    this.aimPivot.add(this.rifleGroup);

    // Lower & Upper Receiver
    const rifleBodyGeo = new THREE.BoxGeometry(0.055, 0.09, 0.52);
    const rifleBody = new THREE.Mesh(rifleBodyGeo, rifleMat);
    tagMesh(rifleBody, false);
    this.rifleGroup.add(rifleBody);

    // Top Picatinny Rail
    const railGeo = new THREE.BoxGeometry(0.03, 0.016, 0.40);
    const pRail = new THREE.Mesh(railGeo, rifleSteelMat);
    pRail.position.set(0, 0.052, -0.02);
    tagMesh(pRail, false);
    this.rifleGroup.add(pRail);

    // Steel Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.38, 8);
    const barrel = new THREE.Mesh(barrelGeo, rifleSteelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, 0.44);
    tagMesh(barrel, false);
    this.rifleGroup.add(barrel);

    // Flash Suppressor / Muzzle Brake
    const muzzleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.07, 8);
    const muzzle = new THREE.Mesh(muzzleGeo, bootsMat);
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.set(0, 0.02, 0.64);
    tagMesh(muzzle, false);
    this.rifleGroup.add(muzzle);

    // Curved 30-Round Magazine
    const magGeo = new THREE.BoxGeometry(0.042, 0.17, 0.08);
    const mag = new THREE.Mesh(magGeo, vestMat);
    mag.position.set(0, -0.11, 0.08);
    mag.rotation.x = -0.22;
    tagMesh(mag, false);
    this.rifleGroup.add(mag);

    // Tactical Holographic Optic with Lens
    const opticBaseGeo = new THREE.BoxGeometry(0.038, 0.042, 0.08);
    const opticBase = new THREE.Mesh(opticBaseGeo, rifleMat);
    opticBase.position.set(0, 0.08, 0.12);
    tagMesh(opticBase, false);
    this.rifleGroup.add(opticBase);

    const opticLensGeo = new THREE.BoxGeometry(0.026, 0.028, 0.01);
    const opticLens = new THREE.Mesh(opticLensGeo, gogglesMat);
    opticLens.position.set(0, 0.08, 0.08);
    tagMesh(opticLens, false);
    this.rifleGroup.add(opticLens);

    // Tactical Telescopic Buttstock
    const stockGeo = new THREE.BoxGeometry(0.04, 0.10, 0.18);
    const stock = new THREE.Mesh(stockGeo, bootsMat);
    stock.position.set(0, 0.02, -0.28);
    tagMesh(stock, false);
    this.rifleGroup.add(stock);

    // Starburst Muzzle Flash
    const flashGeo = new THREE.PlaneGeometry(0.32, 0.32);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffbb33,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });
    this.enemyMuzzleFlash = new THREE.Mesh(flashGeo, flashMat);
    this.enemyMuzzleFlash.position.set(0, 0.02, 0.70);
    this.enemyMuzzleFlash.visible = false;
    this.rifleGroup.add(this.enemyMuzzleFlash);

    // HITBOXES (Exact Damage Boundaries)
    const headHitboxGeo = new THREE.SphereGeometry(0.24, 8, 8);
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
    if (!this.isAlive || this.isDying || this.hp <= 0) return;

    this.hp = Math.max(0, this.hp - amount);
    this.updateHealthBar();

    // Hit flinch reaction & flash all body parts red
    if (this.flashingMeshes && this.flashingMeshes.length > 0) {
      for (let i = 0; i < this.flashingMeshes.length; i++) {
        const item = this.flashingMeshes[i];
        if (item.mesh && item.mesh.material && item.mesh.material.color) {
          item.mesh.material.color.setHex(0xff3333);
        }
      }
      setTimeout(() => {
        if (this.flashingMeshes) {
          for (let i = 0; i < this.flashingMeshes.length; i++) {
            const item = this.flashingMeshes[i];
            if (item.mesh && item.mesh.material && item.mesh.material.color) {
              item.mesh.material.color.setHex(item.origColor);
            }
          }
        }
      }, 90);
    }

    // Upper body hit flinch reaction (recoil slightly backward, stagger)
    if (this.upperBodyGroup) {
      this.upperBodyGroup.position.z -= 0.06;
      this.upperBodyGroup.rotation.x -= 0.08;
      setTimeout(() => {
        if (this.upperBodyGroup && this.isAlive && !this.isDying) {
          this.upperBodyGroup.position.z = 0;
          this.upperBodyGroup.rotation.x = 0;
        }
      }, 110);
    }

    if (this.hp <= 0) {
      this.die();
    } else {
      this.state = 'aim_shoot';
    }
  }

  die() {
    if (!this.isAlive || this.isDying) return;

    this.isAlive = false;
    this.isDying = true;
    this.hp = 0;
    this.deathTimer = 0;
    this.state = 'dead';
    this.updateHealthBar();

    if (this.enemyMuzzleFlash) this.enemyMuzzleFlash.visible = false;
    this.muzzleFlashTimer = 0;

    // Immediately disable damage receivers so dead bot cannot be hit again
    if (this.headHitbox) this.headHitbox.userData = null;
    if (this.bodyHitbox) this.bodyHitbox.userData = null;
    if (this.hitbox) this.hitbox.userData = null;
    if (this.group) this.group.userData = null;
    if (this.upperBodyGroup) this.upperBodyGroup.userData = null;
    if (this.head) this.head.userData = null;
    if (this.aimPivot) this.aimPivot.userData = null;
    if (this.rifleGroup) this.rifleGroup.userData = null;
    if (this.leftLegGroup) this.leftLegGroup.userData = null;
    if (this.rightLegGroup) this.rightLegGroup.userData = null;
    if (this.leftArmGroup) this.leftArmGroup.userData = null;
    if (this.rightArmGroup) this.rightArmGroup.userData = null;

    if (this.hbSprite) this.hbSprite.visible = false;

    // Trigger kill counter once
    if (this.manager && typeof this.manager.onEnemyKilled === 'function') {
      this.manager.onEnemyKilled(this);
    }
  }

  checkCollision(x, y, z) {
    if (!this.manager || !this.manager.colliders || this.manager.colliders.length === 0) return false;
    const r = this.botRadius || 0.52;
    this.botBox.min.set(x - r, y + 0.1, z - r);
    this.botBox.max.set(x + r, y + 1.8, z + r);

    const colliders = this.manager.colliders;
    for (let i = 0; i < colliders.length; i++) {
      if (colliders[i].intersectsBox(this.botBox)) {
        return true;
      }
    }
    return false;
  }

  moveWithCollision(deltaX, deltaZ) {
    const curX = this.group.position.x;
    const curY = this.group.position.y;
    const curZ = this.group.position.z;

    let movedX = false;
    if (Math.abs(deltaX) > 0.0001) {
      const nextX = curX + deltaX;
      if (!this.checkCollision(nextX, curY, curZ)) {
        this.group.position.x = nextX;
        movedX = true;
      }
    }

    let movedZ = false;
    if (Math.abs(deltaZ) > 0.0001) {
      const nextZ = curZ + deltaZ;
      if (!this.checkCollision(this.group.position.x, curY, nextZ)) {
        this.group.position.z = nextZ;
        movedZ = true;
      }
    }

    // Tangential slide if directly blocked by obstacle along both axes
    if (!movedX && !movedZ && (deltaX !== 0 || deltaZ !== 0)) {
      const perpX1 = -deltaZ;
      const perpZ1 = deltaX;
      if (!this.checkCollision(curX + perpX1, curY, curZ + perpZ1)) {
        this.group.position.x += perpX1;
        this.group.position.z += perpZ1;
        movedX = true;
      } else {
        const perpX2 = deltaZ;
        const perpZ2 = -deltaX;
        if (!this.checkCollision(curX + perpX2, curY, curZ + perpZ2)) {
          this.group.position.x += perpX2;
          this.group.position.z += perpZ2;
          movedZ = true;
        }
      }
    }

    // Keep enemies inside playable village map
    this.group.position.x = Math.max(-95, Math.min(95, this.group.position.x));
    this.group.position.z = Math.max(-95, Math.min(95, this.group.position.z));

    return movedX || movedZ;
  }

  resolveObstacleOverlap() {
    if (!this.manager || !this.manager.colliders || this.manager.colliders.length === 0) return;
    const curX = this.group.position.x;
    const curY = this.group.position.y;
    const curZ = this.group.position.z;
    const r = this.botRadius || 0.52;

    this.botBox.min.set(curX - r, curY + 0.1, curZ - r);
    this.botBox.max.set(curX + r, curY + 1.8, curZ + r);

    const colliders = this.manager.colliders;
    for (let i = 0; i < colliders.length; i++) {
      const c = colliders[i];
      if (c.intersectsBox(this.botBox)) {
        const pushLeft = (curX + r) - c.min.x;
        const pushRight = c.max.x - (curX - r);
        const pushBack = (curZ + r) - c.min.z;
        const pushFront = c.max.z - (curZ - r);
        const minOverlap = Math.min(pushLeft, pushRight, pushBack, pushFront);
        if (minOverlap === pushLeft) this.group.position.x = c.min.x - r - 0.05;
        else if (minOverlap === pushRight) this.group.position.x = c.max.x + r + 0.05;
        else if (minOverlap === pushBack) this.group.position.z = c.min.z - r - 0.05;
        else if (minOverlap === pushFront) this.group.position.z = c.max.z + r + 0.05;
      }
    }
  }

  hasLineOfSight(playerPos) {
    if (!this.manager || !this.manager.colliders || this.manager.colliders.length === 0) return true;
    const startX = this.group.position.x;
    const startY = this.group.position.y + 1.4;
    const startZ = this.group.position.z;

    const endX = playerPos.x;
    const endY = (playerPos.y !== undefined ? playerPos.y : 1.7);
    const endZ = playerPos.z;

    const dx = endX - startX;
    const dy = endY - startY;
    const dz = endZ - startZ;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < 0.5) return true;

    this.losRay.origin.set(startX, startY, startZ);
    this.losRay.direction.set(dx / dist, dy / dist, dz / dist);

    const colliders = this.manager.colliders;
    for (let i = 0; i < colliders.length; i++) {
      const c = colliders[i];
      if (c.max.y > 1.2) {
        const hitPoint = this.losRay.intersectBox(c, this._tempV3);
        if (hitPoint) {
          const hitDist = this.losRay.origin.distanceTo(hitPoint);
          // Only obstruct if collision is clearly between bot and player (not inside bot's own footprint)
          if (hitDist > 1.2 && hitDist < dist - 0.8) {
            return false;
          }
        }
      }
    }
    return true;
  }

  update(delta, playerPos, playerController) {
    if (this.isDying) {
      this.deathTimer += delta;

      // Realistic Humanoid Combat Death Animation:
      // Phase 1 (0.0 to 0.35s): Bullet impact stagger & weapon drops down
      if (this.deathTimer < 0.35) {
        const p = this.deathTimer / 0.35;
        if (this.upperBodyGroup) {
          this.upperBodyGroup.rotation.x = -0.32 * p;
          this.upperBodyGroup.position.z = -0.10 * p;
        }
        if (this.aimPivot) {
          this.aimPivot.rotation.x = 0.55 * p;
        }
      }
      // Phase 2 (0.35 to 1.1s): Knees buckle & torso collapses back naturally
      else if (this.deathTimer < 1.1) {
        const p = (this.deathTimer - 0.35) / 0.75;
        if (this.upperBodyGroup) {
          this.upperBodyGroup.rotation.x = -0.32 - (0.95 * p);
          this.upperBodyGroup.position.y = 0.90 * (1 - p * 0.75);
        }
        if (this.leftLegGroup) {
          this.leftLegGroup.rotation.x = 0.75 * p;
        }
        if (this.rightLegGroup) {
          this.rightLegGroup.rotation.x = 0.55 * p;
        }
        this.group.position.y = Math.max(0.08, this.group.position.y - delta * 0.40);
      }
      // Phase 3 (1.1 to 3.0s): Body settles motionless on ground
      else {
        if (this.upperBodyGroup) {
          this.upperBodyGroup.rotation.x = -1.27;
          this.upperBodyGroup.position.y = 0.22;
        }
      }

      if (this.deathTimer >= 3.0) {
        this.dispose();
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

    // Optimized AI check: only perform ray-box line-of-sight checks when within shoot range
    if (distToPlayer <= this.shootRange) {
      if (this.hasLineOfSight(playerPos)) {
        this.state = 'aim_shoot';
      } else {
        this.state = 'chase';
      }
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

  dispose() {
    if (this.group) {
      if (this.group.parent) {
        this.group.parent.remove(this.group);
      }
      this.group.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m && m.dispose && m.dispose());
          } else if (child.material.dispose) {
            child.material.dispose();
          }
        }
      });
    }
    if (this.hbTexture) {
      this.hbTexture.dispose();
      this.hbTexture = null;
    }
    this.headHitbox = null;
    this.bodyHitbox = null;
    this.hitbox = null;
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

    if (dist < 1.4) {
      this.currentWpIndex = (this.currentWpIndex + 1) % this.waypoints.length;
      this.stuckTimer = 0;
    } else {
      const dirX = dx / dist;
      const dirZ = dz / dist;

      const deltaX = dirX * this.patrolSpeed * delta;
      const deltaZ = dirZ * this.patrolSpeed * delta;

      const moved = this.moveWithCollision(deltaX, deltaZ);
      if (!moved) {
        this.stuckTimer += delta;
        if (this.stuckTimer > 1.8) {
          this.currentWpIndex = (this.currentWpIndex + 1) % this.waypoints.length;
          this.stuckTimer = 0;
        }
      } else {
        this.stuckTimer = 0;
      }

      this.resolveObstacleOverlap();

      const targetAngle = Math.atan2(dirX, dirZ);
      this.smoothRotateY(targetAngle, delta, this.rotationSpeed);

      this.animateWalking(delta, 5.5);
    }
  }

  updateChase(delta, playerPos, distToPlayer) {
    const dx = playerPos.x - this.group.position.x;
    const dz = playerPos.z - this.group.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 2.2) {
      const dirX = dx / dist;
      const dirZ = dz / dist;

      const deltaX = dirX * this.chaseSpeed * delta;
      const deltaZ = dirZ * this.chaseSpeed * delta;

      this.moveWithCollision(deltaX, deltaZ);
      this.resolveObstacleOverlap();

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

      const deltaX = strafeX * (this.patrolSpeed * 0.75) * delta;
      const deltaZ = strafeZ * (this.patrolSpeed * 0.75) * delta;

      this.moveWithCollision(deltaX, deltaZ);
      this.resolveObstacleOverlap();

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
      this.smoothRotateY(targetAngle, delta, this.rotationSpeed * 2.2);
    }

    this.shootTimer += delta;
    if (this.shootTimer >= this.shootCooldown) {
      if (this.isAimedAtTarget) {
        this.shootTimer = 0;
        this.fireAtPlayer(distToPlayer, playerController);
      } else {
        this.shootTimer = this.shootCooldown * 0.82;
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
    this.isAimedAtTarget = (yawDiff < 0.52) && (pitchDiff < 0.45);
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

    // Check line of sight against house walls and obstacles
    const targetPos = (playerController && playerController.position) ? playerController.position : this.manager.camera.position;
    if (!this.hasLineOfSight(targetPos)) {
      return; // Obstructed by house wall or obstacle
    }

    if (this.enemyMuzzleFlash) {
      this.enemyMuzzleFlash.visible = true;
      this.enemyMuzzleFlash.rotation.z = Math.random() * Math.PI * 2;
      this.muzzleFlashTimer = 0.07;
    }

    this.manager.playEnemyGunshotSound(distToPlayer);

    // Dynamic yellow-orange bullet tracer beam flying from enemy rifle toward player
    if (this.scene) {
      const startPt = new THREE.Vector3();
      if (this.rifleGroup) {
        this.rifleGroup.getWorldPosition(startPt);
      } else {
        startPt.copy(this.group.position).add(new THREE.Vector3(0, 1.34, 0));
      }
      const endPt = new THREE.Vector3(
        targetPos.x + (Math.random() - 0.5) * 0.4,
        (targetPos.y !== undefined ? targetPos.y : 1.7) + (Math.random() - 0.5) * 0.3,
        targetPos.z + (Math.random() - 0.5) * 0.4
      );

      const tracerGeo = new THREE.BufferGeometry().setFromPoints([startPt, endPt]);
      const tracerMat = new THREE.LineBasicMaterial({
        color: 0xf59e0b,
        linewidth: 2,
        transparent: true,
        opacity: 0.88
      });
      const tracerLine = new THREE.Line(tracerGeo, tracerMat);
      this.scene.add(tracerLine);
      setTimeout(() => {
        if (tracerLine.parent) tracerLine.parent.remove(tracerLine);
        tracerGeo.dispose();
        tracerMat.dispose();
      }, 70);
    }

    let hitChance = 0.52;
    if (distToPlayer > 14) hitChance *= 0.78;
    if (playerController && playerController.isSprinting) hitChance *= 0.68;

    const isHit = Math.random() < hitChance;

    if (isHit && playerController && typeof playerController.takeDamage === 'function') {
      playerController.takeDamage(this.shotDamage || 14);
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
    const swing = Math.sin(this.walkAnimTimer) * 0.48;

    if (this.leftLegGroup) this.leftLegGroup.rotation.x = swing;
    if (this.rightLegGroup) this.rightLegGroup.rotation.x = -swing;

    if (this.upperBodyGroup) {
      this.upperBodyGroup.position.y = 0.90 + Math.abs(Math.sin(this.walkAnimTimer)) * 0.035;
      this.upperBodyGroup.rotation.z = Math.sin(this.walkAnimTimer) * 0.025;
    }
  }
}

if (typeof window !== 'undefined') {
  window.EnemyManager = EnemyManager;
  window.EnemyBot = EnemyBot;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EnemyManager, EnemyBot };
}

