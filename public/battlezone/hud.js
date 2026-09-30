// BATTLEZONE MAGURA — MOBILE HUD & TACTICAL UI CONTROLLER (STEP 9 UPGRADE)
// Manages HUD State Machine (Lobby, Plane, Free Fall, Parachute, Ground Combat, Pause, Victory, Defeat),
// Responsive Touch Anchors, Health & Stamina Gauges, Kills & Enemies Left Counters,
// Mission Objectives, Dynamic Minimap & Compass, Squad Teammate Slots, and Damage Feedback.

class BattlezoneHUD {
  constructor() {
    this.currentState = 'GROUND_COMBAT'; // Default gameplay state

    // Cached DOM Elements
    this.uiOverlay = document.getElementById('ui-overlay');
    this.bottomBar = document.querySelector('.bottom-bar');
    this.topBar = document.querySelector('.top-bar');
    this.crosshairWrapper = document.querySelector('.crosshair-wrapper');

    // Health, Stamina & Posture
    this.hpDigits = document.getElementById('player-health-digits');
    this.hpFill = document.getElementById('player-health-fill');
    this.hpHud = document.getElementById('player-health-hud');
    this.staminaFill = document.getElementById('player-stamina-fill');
    this.movementStateBadge = document.getElementById('movement-state-badge');
    this.lowHpVignette = document.getElementById('low-hp-vignette');

    // Ammo & Weapon
    this.ammoMag = document.getElementById('ammo-mag');
    this.ammoReserve = document.getElementById('ammo-reserve');
    this.weaponName = document.querySelector('.weapon-name');
    this.weaponCal = document.querySelector('.weapon-cal');
    this.reloadBtn = document.getElementById('btn-reload');

    // Kills & Enemies
    this.killsDisplay = document.getElementById('kills-display');
    this.enemiesDisplay = document.getElementById('enemies-display');

    // Objective Banner
    this.objectiveTitle = document.getElementById('hud-objective-title');
    this.objectiveCounter = document.getElementById('hud-objective-counter');
    this.objectiveBanner = document.getElementById('hud-objective-banner');

    // Overlays & Modals
    this.victoryModal = document.getElementById('victory-modal');
    this.defeatModal = document.getElementById('defeat-modal');
    this.pauseModal = document.getElementById('pause-modal');
    this.statePlaneControls = document.getElementById('state-plane-controls');
    this.stateParachuteControls = document.getElementById('state-parachute-controls');
    this.damageOverlay = document.getElementById('damage-overlay');

    // Audio & Timers
    this.matchStartTime = Date.now();
    this.audioCtx = null;

    this.initEventListeners();
    this.setHUDState('GROUND_COMBAT');
  }

  getAudioContext() {
    if (!this.audioCtx) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();
      } catch (e) {}
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // ---------------------------------------------------------------------------
  // 1. HUD STATE MACHINE
  // ---------------------------------------------------------------------------
  setHUDState(state) {
    this.currentState = state;
    document.body.setAttribute('data-hud-state', state);

    // Hide all state-specific overlay modals by default
    if (this.victoryModal) this.victoryModal.style.display = 'none';
    if (this.defeatModal) this.defeatModal.style.display = 'none';
    if (this.pauseModal) this.pauseModal.style.display = 'none';
    if (this.statePlaneControls) this.statePlaneControls.style.display = 'none';
    if (this.stateParachuteControls) this.stateParachuteControls.style.display = 'none';

    // Show/hide ground combat action buttons
    const isGroundCombat = (state === 'GROUND_COMBAT');
    if (this.bottomBar) {
      this.bottomBar.style.display = isGroundCombat ? 'flex' : 'none';
    }
    if (this.crosshairWrapper) {
      this.crosshairWrapper.style.display = isGroundCombat ? 'block' : 'none';
    }

    switch (state) {
      case 'PLANE':
        if (this.statePlaneControls) this.statePlaneControls.style.display = 'flex';
        break;

      case 'FREE_FALL':
      case 'PARACHUTE':
        if (this.stateParachuteControls) this.stateParachuteControls.style.display = 'flex';
        break;

      case 'VICTORY':
        if (this.victoryModal) this.victoryModal.style.display = 'flex';
        break;

      case 'DEFEAT':
        if (this.defeatModal) this.defeatModal.style.display = 'flex';
        break;

      case 'PAUSE':
        if (this.pauseModal) this.pauseModal.style.display = 'flex';
        break;

      case 'GROUND_COMBAT':
      default:
        // Full combat controls active
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // 2. HP & STAMINA UPDATES
  // ---------------------------------------------------------------------------
  updateHP(current, max = 100) {
    const curClamped = Math.max(0, Math.min(max, Math.round(current)));
    if (this.hpDigits) {
      this.hpDigits.textContent = `${curClamped} / ${max}`;
    }
    if (this.hpFill) {
      const pct = (curClamped / max) * 100;
      this.hpFill.style.width = `${pct}%`;
      // Dynamic color transitions
      if (pct > 55) {
        this.hpFill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
      } else if (pct > 25) {
        this.hpFill.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
      } else {
        this.hpFill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
      }
    }

    // Low HP Warning pulse
    const isLow = curClamped <= 25 && curClamped > 0;
    if (this.hpHud) {
      this.hpHud.classList.toggle('low-hp', isLow);
    }
    if (this.lowHpVignette) {
      this.lowHpVignette.classList.toggle('active', isLow);
    }
  }

  updateStamina(current, max = 100) {
    const curClamped = Math.max(0, Math.min(max, current));
    if (this.staminaFill) {
      const pct = (curClamped / max) * 100;
      this.staminaFill.style.width = `${pct}%`;
      this.staminaFill.style.opacity = pct < 20 ? '0.5' : '1';
    }
  }

  updateMovementState(stateStr) {
    if (this.movementStateBadge && this.movementStateBadge.textContent !== stateStr) {
      this.movementStateBadge.textContent = stateStr;
      this.movementStateBadge.className = `movement-state-badge state-${stateStr.toLowerCase()}`;
    }
  }

  // ---------------------------------------------------------------------------
  // 3. AMMO & WEAPON UPDATES
  // ---------------------------------------------------------------------------
  updateAmmo(mag, reserve, isMelee = false) {
    if (isMelee) {
      if (this.ammoMag) this.ammoMag.textContent = '∞';
      if (this.ammoReserve) this.ammoReserve.textContent = 'MELEE';
      if (this.ammoMag) this.ammoMag.classList.remove('empty');
      return;
    }

    if (this.ammoMag) {
      this.ammoMag.textContent = `${mag}`;
      if (mag === 0) {
        this.ammoMag.classList.add('empty');
        if (this.reloadBtn) this.reloadBtn.classList.add('pulse');
      } else {
        this.ammoMag.classList.remove('empty');
        if (this.reloadBtn) this.reloadBtn.classList.remove('pulse');
      }
    }
    if (this.ammoReserve) {
      this.ammoReserve.textContent = `${reserve}`;
    }
  }

  updateWeapon(name, cal) {
    if (this.weaponName) this.weaponName.textContent = name;
    if (this.weaponCal) this.weaponCal.textContent = cal;
  }

  // ---------------------------------------------------------------------------
  // 4. KILLS & ENEMIES LEFT COUNTERS
  // ---------------------------------------------------------------------------
  updateKills(kills) {
    if (this.killsDisplay) {
      this.killsDisplay.textContent = `KILLS: ${kills}`;
    }
  }

  updateEnemiesLeft(count) {
    if (this.enemiesDisplay) {
      this.enemiesDisplay.textContent = `ENEMIES LEFT: ${count}`;
    }
  }

  // ---------------------------------------------------------------------------
  // 5. MISSION OBJECTIVE BANNER
  // ---------------------------------------------------------------------------
  setObjective(title, counterStr = '') {
    if (this.objectiveTitle) {
      this.objectiveTitle.textContent = title;
    }
    if (this.objectiveCounter) {
      this.objectiveCounter.textContent = counterStr;
      this.objectiveCounter.style.display = counterStr ? 'inline-block' : 'none';
    }
  }

  // ---------------------------------------------------------------------------
  // 6. VICTORY & DEFEAT SCREENS
  // ---------------------------------------------------------------------------
  showVictory(stats = {}) {
    this.setHUDState('VICTORY');
    this.playVictorySound();

    const kills = stats.kills !== undefined ? stats.kills : (window.enemyManager ? window.enemyManager.kills : 0);
    const totalEnemies = stats.totalEnemies || (window.enemyManager ? window.enemyManager.enemies.length : 10);
    const sector = stats.sector || this.getCurrentSectorName();
    const elapsedSecs = Math.round((Date.now() - this.matchStartTime) / 1000);
    const mins = Math.floor(elapsedSecs / 60);
    const secs = elapsedSecs % 60;
    const timeFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    const scoreElem = document.getElementById('victory-stat-kills');
    const timeElem = document.getElementById('victory-stat-time');
    const sectorElem = document.getElementById('victory-stat-sector');

    if (scoreElem) scoreElem.textContent = `${kills} / ${totalEnemies}`;
    if (timeElem) timeElem.textContent = timeFormatted;
    if (sectorElem) sectorElem.textContent = sector;
  }

  showDefeat(stats = {}) {
    this.setHUDState('DEFEAT');
    this.playDefeatSound();

    const kills = stats.kills !== undefined ? stats.kills : (window.enemyManager ? window.enemyManager.kills : 0);
    const sector = stats.sector || this.getCurrentSectorName();

    const killsElem = document.getElementById('defeat-stat-kills');
    const sectorElem = document.getElementById('defeat-stat-sector');

    if (killsElem) killsElem.textContent = `${kills}`;
    if (sectorElem) sectorElem.textContent = sector;
  }

  getCurrentSectorName() {
    if (typeof currentMap !== 'undefined') {
      if (currentMap === 'magura_river_port' || currentMap === 'magura-river-port') {
        return 'RIVER PORT & INDUSTRIAL';
      }
      if (currentMap === 'abalpur_village') {
        return 'ABALPUR VILLAGE';
      }
    }
    return 'MAGURA TOWN';
  }

  // ---------------------------------------------------------------------------
  // 7. EVENT LISTENERS FOR MODALS & BUTTONS
  // ---------------------------------------------------------------------------
  initEventListeners() {
    // Top lobby button
    const backLobby = document.getElementById('btn-back-lobby');
    if (backLobby) {
      backLobby.addEventListener('click', () => this.exitToLobby());
    }

    // Top Pause button
    const btnPause = document.getElementById('btn-pause-menu');
    if (btnPause) {
      btnPause.addEventListener('click', () => {
        if (this.currentState === 'PAUSE') {
          this.setHUDState('GROUND_COMBAT');
        } else {
          this.setHUDState('PAUSE');
        }
      });
    }

    // Pause Resume button
    const btnResume = document.getElementById('btn-pause-resume');
    if (btnResume) {
      btnResume.addEventListener('click', () => {
        this.setHUDState('GROUND_COMBAT');
      });
    }

    // Pause Exit to Lobby
    const btnPauseLobby = document.getElementById('btn-pause-lobby');
    if (btnPauseLobby) {
      btnPauseLobby.addEventListener('click', () => this.exitToLobby());
    }

    // Victory Continue / Play Again
    const btnVicContinue = document.getElementById('btn-victory-continue');
    if (btnVicContinue) {
      btnVicContinue.addEventListener('click', () => {
        this.restartMatch();
      });
    }

    // Victory Return to Lobby
    const btnVicLobby = document.getElementById('btn-victory-lobby');
    if (btnVicLobby) {
      btnVicLobby.addEventListener('click', () => this.exitToLobby());
    }

    // Defeat Retry
    const btnDefeatRetry = document.getElementById('btn-defeat-retry');
    if (btnDefeatRetry) {
      btnDefeatRetry.addEventListener('click', () => {
        this.retryMatch();
      });
    }

    // Defeat Return to Lobby
    const btnDefeatLobby = document.getElementById('btn-defeat-lobby');
    if (btnDefeatLobby) {
      btnDefeatLobby.addEventListener('click', () => this.exitToLobby());
    }

    // Plane Drop Button
    const btnPlaneDrop = document.getElementById('btn-plane-drop');
    if (btnPlaneDrop) {
      btnPlaneDrop.addEventListener('click', () => {
        this.setHUDState('PARACHUTE');
        if (window.fpsController) {
          window.fpsController.showCombatToast('🪂 PARACHUTE DEPLOYED • STEER TO TARGET LZ');
        }
      });
    }

    // Parachute Land / Ground Deploy
    const btnParachuteLand = document.getElementById('btn-parachute-land');
    if (btnParachuteLand) {
      btnParachuteLand.addEventListener('click', () => {
        this.setHUDState('GROUND_COMBAT');
        if (window.fpsController) {
          window.fpsController.showCombatToast('TACTICAL DEPLOYMENT COMPLETE • WEAPONS READY');
        }
      });
    }
  }

  restartMatch() {
    this.matchStartTime = Date.now();
    this.setHUDState('GROUND_COMBAT');
    if (typeof window.startMatch === 'function' && typeof currentMap !== 'undefined') {
      window.startMatch(currentMap);
    }
  }

  retryMatch() {
    this.setHUDState('GROUND_COMBAT');
    if (window.fpsController) {
      window.fpsController.hp = window.fpsController.maxHp;
      window.fpsController.isDead = false;
      window.fpsController.stamina = window.fpsController.maxStamina;
      window.fpsController.reset();
      this.updateHP(window.fpsController.hp, window.fpsController.maxHp);
      this.updateStamina(window.fpsController.stamina, window.fpsController.maxStamina);
    }
    if (window.weaponSystem) {
      window.weaponSystem.reset();
    }
    if (window.enemyManager) {
      // Re-init enemies for retry
      window.enemyManager.kills = 0;
      window.enemyManager.hasWon = false;
      this.updateKills(0);
      this.updateEnemiesLeft(window.enemyManager.enemies.length);
      window.enemyManager.enemies.forEach(e => {
        if (e.respawn) e.respawn();
      });
    }
  }

  exitToLobby() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'BATTLEZONE_EXIT_TO_LOBBY' }, '*');
    }
    window.dispatchEvent(new CustomEvent('battlezone:exit-lobby'));
  }

  // ---------------------------------------------------------------------------
  // 8. AUDIO EFFECTS
  // ---------------------------------------------------------------------------
  playVictorySound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 triumphant fanfare
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.24, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.48);
    });
  }

  playDefeatSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [293.66, 261.63, 220.00, 174.61]; // D4, C4, A3, F3 solemn descending chord
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.16);
      gain.gain.setValueAtTime(0.22, now + idx * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.16);
      osc.stop(now + idx * 0.16 + 0.58);
    });
  }
}

// Global HUD Instance
window.battlezoneHUD = null;
window.addEventListener('DOMContentLoaded', () => {
  window.battlezoneHUD = new BattlezoneHUD();
});
