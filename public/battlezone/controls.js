// First-Person Mobile FPS Controls for Battlezone Magura
// Pure First-Person view, independent Left Joystick Movement (Forward/Back/Strafe),
// independent Right-Side Free Camera Look (Horizontal 360 + Pitch), Sprint, Jump, Physics

class FPSController {
  constructor(camera, domElement, colliders = []) {
    this.camera = camera;
    this.domElement = domElement;
    this.colliders = colliders;

    // Camera Rotation (Euler: pitch X, yaw Y)
    this.pitch = 0;
    this.yaw = Math.PI; // Face down the main road initially
    this.targetPitch = 0;
    this.targetYaw = Math.PI;

    // Camera Rotation Sensitivity: Tuned for controlled, precise touch aiming
    // Small swipe = small rotation, long swipe = larger rotation
    this.lookSensitivity = 0.0022;

    // Movement Vectors & Speeds (Controlled, natural walking & tactical sprint)
    this.position = new THREE.Vector3(0, 0, -30); // Base ground position
    this.velocity = new THREE.Vector3();
    this.moveVector = new THREE.Vector2(0, 0); // (x: strafe, y: forward/back)

    this.walkSpeed = 3.2; // m/s (natural, controlled tactical walk)
    this.sprintSpeed = 5.6; // m/s (faster tactical sprint via Sprint button)
    this.isSprinting = false;

    // Movement States & Stamina System (Step 9)
    this.stamina = 100;
    this.maxStamina = 100;
    this.movementState = 'IDLE'; // IDLE | WALK | RUN | SPRINT

    // Aim / Scope (ADS) State
    this.isAiming = false;
    this.baseFov = 65;
    this.aimFov = 48;

    // Jump & Gravity Physics
    this.isGrounded = true;
    this.verticalVelocity = 0;
    this.gravity = 18.0;
    this.jumpForce = 6.0;
    this.playerHeight = 1.72; // Eye height in First-Person

    // Head Bobbing (Subtle, stable)
    this.bobTimer = 0;
    this.bobAmount = 0.026;
    this.stepped = false;

    // Touch Identifiers for Independent Dual-Zone Controls
    this.joystickTouchId = null;
    this.lookTouchId = null;
    this.lookLastX = 0;
    this.lookLastY = 0;

    // Pre-allocated Vector caches for Zero-GC in render loop
    this.vForward = new THREE.Vector3();
    this.vRight = new THREE.Vector3();
    this.vMoveDir = new THREE.Vector3();
    this.vDisplacement = new THREE.Vector3();
    this.vNextPos = new THREE.Vector3();
    this.playerBox = new THREE.Box3();
    this.playerRadius = 0.42;

    // Subtle Recoil Offset (Smoothly decays back to zero without altering player look)
    this.recoilPitch = 0;
    this.recoilYaw = 0;

    // Player Health & Combat State
    this.maxHp = 100;
    this.hp = 100;
    this.isDead = false;
    this.damageOverlay = document.getElementById('damage-overlay');
    this.healOverlay = document.getElementById('heal-overlay');
    this.healthDigits = document.getElementById('player-health-digits');
    this.healthFill = document.getElementById('player-health-fill');
    this.healthHud = document.getElementById('player-health-hud');
    this.toastContainer = document.getElementById('combat-toast-container');

    // Medkit Tactical Healing System (Start with 2, max 5)
    this.medkits = 2;
    this.maxMedkits = 5;
    this.medkitBadgeTop = document.getElementById('medkit-badge-top');
    this.medkitBadgeBottom = document.getElementById('medkit-badge-bottom');
    this.btnMedkitTop = document.getElementById('btn-medkit-top');
    this.btnMedkit = document.getElementById('btn-medkit');

    this.updateHealthHUD();
    this.updateMedkitHUD();

    // Audio Context for Footsteps, Damage & Healing
    this.initAudio();

    // Setup UI & Touch Event Listeners
    this.initTouchControls();
  }

  // Compatibility method if called by switchMap
  setScene(scene) {
    // Strictly First-Person: No player character mesh is added to the scene.
  }

  // Reset player state, health, posture, and outdoor spawn position for match start / restart
  reset(spawn) {
    this.hp = this.maxHp;
    this.isDead = false;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.velocity.set(0, 0, 0);
    this.moveVector.set(0, 0);
    this.isSprinting = false;
    this.isAiming = false;
    this.recoilPitch = 0;
    this.recoilYaw = 0;
    this.pitch = 0;
    this.targetPitch = 0;

    if (spawn) {
      this.position.set(spawn.x, spawn.y, spawn.z);
      this.yaw = spawn.yaw !== undefined ? spawn.yaw : Math.PI;
      this.targetYaw = this.yaw;
    } else {
      this.position.set(0, 0, -30);
      this.yaw = Math.PI;
      this.targetYaw = Math.PI;
    }

    this.updateHealthHUD();
    if (this.damageOverlay) {
      this.damageOverlay.classList.remove('flash');
    }
    const sprintBtn = document.getElementById('btn-sprint');
    if (sprintBtn) sprintBtn.classList.remove('active');
    const aimBtn = document.getElementById('btn-aim');
    if (aimBtn) aimBtn.classList.remove('active');
    const joystickThumb = document.getElementById('joystick-thumb');
    if (joystickThumb) joystickThumb.style.transform = 'translate(0px, 0px)';
  }

  // ---------------------------------------------------------------------------
  // HEALTH, MEDKIT & AUDIO FEEDBACK
  // ---------------------------------------------------------------------------
  takeDamage(amount) {
    if (this.isDead) return;

    this.hp = Math.max(0, this.hp - amount);
    this.updateHealthHUD();

    // Camera flinch / recoil kick from bullet impact
    this.targetPitch += (Math.random() - 0.48) * 0.035;
    this.targetYaw += (Math.random() - 0.5) * 0.035;

    // Screen Red Vignette Flash
    if (this.damageOverlay) {
      this.damageOverlay.classList.remove('flash');
      void this.damageOverlay.offsetWidth; // trigger reflow
      this.damageOverlay.classList.add('flash');
      setTimeout(() => {
        if (this.damageOverlay) this.damageOverlay.classList.remove('flash');
      }, 180);
    }

    this.playHurtSound();

    if (this.hp <= 0) {
      this.die();
    }
  }

  useMedkit() {
    if (this.isDead) return false;

    if (this.hp >= this.maxHp) {
      this.showCombatToast('স্বাস্থ্য পূর্ণ রয়েছে • HEALTH FULL (100/100)', true);
      return false;
    }

    if (this.medkits <= 0) {
      this.showCombatToast('মেডকিট নেই • NO MEDKITS (FIND ON MAP)', true);
      return false;
    }

    this.medkits--;
    const healedAmount = Math.min(50, this.maxHp - this.hp);
    this.hp = Math.min(this.maxHp, this.hp + 50);

    this.updateHealthHUD();
    this.updateMedkitHUD();
    this.playHealSound();
    this.triggerHealEffect(healedAmount);
    return true;
  }

  addMedkit(amount = 1) {
    this.medkits = Math.min(this.maxMedkits, this.medkits + amount);
    this.updateMedkitHUD();
    this.playPickupSound();
    this.showCombatToast(`+${amount} MEDKIT ACQUIRED (${this.medkits}/${this.maxMedkits})`);
  }

  updateMedkitHUD() {
    const text = `${this.medkits}`;
    if (this.medkitBadgeTop) {
      this.medkitBadgeTop.textContent = text;
      this.medkitBadgeTop.style.opacity = this.medkits === 0 ? '0.45' : '1';
    }
    if (this.medkitBadgeBottom) {
      this.medkitBadgeBottom.textContent = text;
      this.medkitBadgeBottom.style.opacity = this.medkits === 0 ? '0.45' : '1';
    }
  }

  triggerHealEffect(amount) {
    if (this.healOverlay) {
      this.healOverlay.classList.remove('flash');
      void this.healOverlay.offsetWidth;
      this.healOverlay.classList.add('flash');
      setTimeout(() => {
        if (this.healOverlay) this.healOverlay.classList.remove('flash');
      }, 350);
    }
    this.showCombatToast(`+${amount} HP HEALED (HP: ${this.hp}/${this.maxHp})`);
  }

  showCombatToast(msg, isWarning = false) {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `combat-toast ${isWarning ? 'warning' : ''}`;
    toast.textContent = msg;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 2100);
  }

  playHealSound() {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    const now = this.audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 soothing chord
    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.22, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.38);
    });
  }

  playPickupSound() {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.09);
    gain.gain.setValueAtTime(0.26, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  updateHealthHUD() {
    if (window.battlezoneHUD) {
      window.battlezoneHUD.updateHP(this.hp, this.maxHp);
    }
    if (this.healthDigits) {
      this.healthDigits.innerText = `${this.hp} / ${this.maxHp}`;
    }
    if (this.healthFill) {
      const pct = Math.max(0, (this.hp / this.maxHp) * 100);
      this.healthFill.style.width = `${pct}%`;
    }
    if (this.healthHud) {
      if (this.hp <= 25) {
        this.healthHud.classList.add('low-hp');
      } else {
        this.healthHud.classList.remove('low-hp');
      }
    }
  }

  playHurtSound() {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  die() {
    this.isDead = true;
    this.showCombatToast('💀 KILLED IN ACTION • নিহত হয়েছেন', true);
    if (this.damageOverlay) this.damageOverlay.classList.add('flash');

    if (window.missionManager && window.missionManager.isMissionMode) {
      window.missionManager.onPlayerDeath();
      return;
    }

    if (window.battlezoneHUD) {
      window.battlezoneHUD.showDefeat({
        kills: window.enemyManager ? window.enemyManager.kills : 0
      });
      return;
    }

    setTimeout(() => {
      this.hp = this.maxHp;
      this.isDead = false;
      this.position.set(0, 0, -30);
      this.velocity.set(0, 0, 0);
      this.updateHealthHUD();
      if (this.damageOverlay) this.damageOverlay.classList.remove('flash');
      this.showCombatToast('DEPLOYED BACK TO BATTLE • যুদ্ধক্ষেত্রে ফিরে এসেছেন');
    }, 2500);
  }

  initAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    } catch (e) {
      this.audioCtx = null;
    }
  }

  playFootstep() {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = this.isSprinting ? 280 : 200;

    osc.type = 'triangle';
    const now = this.audioCtx.currentTime;
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // ---------------------------------------------------------------------------
  // VIRTUAL JOYSTICK & TOUCH CONTROLS (INDEPENDENT DUAL-ZONE)
  // ---------------------------------------------------------------------------
  initTouchControls() {
    const joystickZone = document.getElementById('joystick-zone');
    const joystickThumb = document.getElementById('joystick-thumb');
    const lookZone = document.getElementById('look-zone');
    const jumpBtn = document.getElementById('btn-jump');
    const sprintBtn = document.getElementById('btn-sprint');
    const aimBtn = document.getElementById('btn-aim');
    const sensSlider = document.getElementById('sens-slider');

    if (sensSlider) {
      sensSlider.addEventListener('input', (e) => {
        this.lookSensitivity = parseFloat(e.target.value) || 0.0022;
      });
    }

    let joystickCenter = { x: 0, y: 0 };
    const maxRadius = 42; // max pixel displacement of thumbstick (comfortably within 130px base)

    // Helper to identify button/interactive elements to avoid accidental look activation
    const isButtonOrInteractive = (target) => {
      return target && target.closest && target.closest('button, .btn-tactical, #joystick-zone, #player-health-hud, #kills-hud, #ammo-hud, .minimap-wrapper, #btn-back-lobby, input');
    };

    // 1. LEFT JOYSTICK TOUCH EVENTS (MOVEMENT ONLY — NEVER ROTATES CAMERA)
    const onJoyStart = (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (this.joystickTouchId === null && t.clientX < window.innerWidth * 0.45) {
          this.joystickTouchId = t.identifier;
          const rect = joystickZone.getBoundingClientRect();
          joystickCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
          this.updateJoystick(t.clientX, t.clientY, joystickCenter, maxRadius, joystickThumb);
          break;
        }
      }
    };

    const onJoyMove = (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.joystickTouchId) {
          this.updateJoystick(t.clientX, t.clientY, joystickCenter, maxRadius, joystickThumb);
          break;
        }
      }
    };

    const onJoyEnd = (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.joystickTouchId) {
          this.joystickTouchId = null;
          this.moveVector.set(0, 0);
          if (joystickThumb) joystickThumb.style.transform = `translate(0px, 0px)`;
          break;
        }
      }
    };

    if (joystickZone) {
      joystickZone.addEventListener('touchstart', onJoyStart, { passive: false });
    }

    // 2. RIGHT SIDE LOOK TOUCH EVENTS (CAMERA LOOK ONLY — NEVER MOVES PLAYER)
    const onLookStart = (e) => {
      if (isButtonOrInteractive(e.target)) return;
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        // Right side of screen for look (starts at > 35% width, outside joystick)
        if (this.lookTouchId === null && t.identifier !== this.joystickTouchId && t.clientX >= window.innerWidth * 0.35) {
          this.lookTouchId = t.identifier;
          this.lookLastX = t.clientX;
          this.lookLastY = t.clientY;
          break;
        }
      }
    };

    const onLookMove = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.lookTouchId) {
          const dx = t.clientX - this.lookLastX;
          const dy = t.clientY - this.lookLastY;
          this.lookLastX = t.clientX;
          this.lookLastY = t.clientY;

          // Controlled sensitivity for smooth, precise aiming (reduced when aiming down sights)
          const sens = this.isAiming ? this.lookSensitivity * 0.6 : this.lookSensitivity;
          this.targetYaw -= dx * sens;
          this.targetPitch -= dy * sens;

          // Clamp vertical pitch (-74.5 deg down to +74.5 deg up, preventing camera flipping)
          const maxPitch = 1.30;
          this.targetPitch = Math.max(-maxPitch, Math.min(maxPitch, this.targetPitch));
          break;
        }
      }
    };

    const onLookEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.lookTouchId) {
          this.lookTouchId = null;
          break;
        }
      }
    };

    if (lookZone) {
      lookZone.addEventListener('touchstart', onLookStart, { passive: false });
    }
    window.addEventListener('touchstart', (e) => {
      if (!isButtonOrInteractive(e.target) && e.target !== joystickZone && !e.target.closest('#joystick-zone')) {
        onLookStart(e);
      }
    }, { passive: false });

    // Combined window touch event listeners for multi-touch (movement + look + fire)
    window.addEventListener('touchmove', (e) => {
      onJoyMove(e);
      onLookMove(e);
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      onJoyEnd(e);
      onLookEnd(e);
    }, { passive: false });

    window.addEventListener('touchcancel', (e) => {
      onJoyEnd(e);
      onLookEnd(e);
    }, { passive: false });

    // Mouse Drag Aim for Desktop / Laptop testing
    let isMouseDown = false;
    let mouseLastX = 0;
    let mouseLastY = 0;

    window.addEventListener('mousedown', (e) => {
      if (isButtonOrInteractive(e.target)) return;
      if (e.clientX >= window.innerWidth * 0.35) {
        isMouseDown = true;
        mouseLastX = e.clientX;
        mouseLastY = e.clientY;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      const dx = e.clientX - mouseLastX;
      const dy = e.clientY - mouseLastY;
      mouseLastX = e.clientX;
      mouseLastY = e.clientY;

      const sens = this.isAiming ? this.lookSensitivity * 0.6 : this.lookSensitivity;
      this.targetYaw -= dx * sens;
      this.targetPitch -= dy * sens;

      const maxPitch = 1.30;
      this.targetPitch = Math.max(-maxPitch, Math.min(maxPitch, this.targetPitch));
    });

    window.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    // 3. JUMP BUTTON
    if (jumpBtn) {
      const handleJump = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.isDead) return;
        this.jump();
        jumpBtn.classList.add('active');
        setTimeout(() => jumpBtn.classList.remove('active'), 160);
      };
      jumpBtn.addEventListener('touchstart', handleJump, { passive: false });
      jumpBtn.addEventListener('click', handleJump);
    }

    // 4. SPRINT BUTTON (Controls faster movement with stamina consumption)
    if (sprintBtn) {
      const handleSprint = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.isDead) return;
        if (window.weaponSystem && window.weaponSystem.isReloading) {
          this.showCombatToast('ক্যানট স্প্রিন্ট হোয়াইল রিলোডিং • CANNOT SPRINT WHILE RELOADING', true);
          return;
        }
        if (this.stamina <= 10 && !this.isSprinting) {
          this.showCombatToast('স্ট্যামিনা কম • LOW STAMINA', true);
          return;
        }
        this.isSprinting = !this.isSprinting;
        sprintBtn.classList.toggle('active', this.isSprinting);
      };
      sprintBtn.addEventListener('touchstart', handleSprint, { passive: false });
      sprintBtn.addEventListener('click', handleSprint);
    }

    // 5. AIM BUTTON (Toggle ADS)
    if (aimBtn) {
      const handleAim = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isAiming = !this.isAiming;
        aimBtn.classList.toggle('active', this.isAiming);
      };
      aimBtn.addEventListener('touchstart', handleAim, { passive: false });
      aimBtn.addEventListener('click', handleAim);
    }

    // 6. MEDKIT HEAL BUTTONS (Top HUD button and Right touch control button)
    const handleMedkitUse = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.useMedkit();
      if (this.btnMedkit) {
        this.btnMedkit.classList.add('active');
        setTimeout(() => this.btnMedkit && this.btnMedkit.classList.remove('active'), 180);
      }
      if (this.btnMedkitTop) {
        this.btnMedkitTop.style.transform = 'scale(0.9)';
        setTimeout(() => this.btnMedkitTop && (this.btnMedkitTop.style.transform = 'scale(1)'), 180);
      }
    };

    if (this.btnMedkit) {
      this.btnMedkit.addEventListener('touchstart', handleMedkitUse, { passive: false });
      this.btnMedkit.addEventListener('click', handleMedkitUse);
    }
    if (this.btnMedkitTop) {
      this.btnMedkitTop.addEventListener('touchstart', handleMedkitUse, { passive: false });
      this.btnMedkitTop.addEventListener('click', handleMedkitUse);
    }

    // Keyboard Fallback for testing / desktop emulation
    this.keys = {};
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') this.jump();
      if (e.code === 'ShiftLeft') this.isSprinting = true;
      if (e.code === 'KeyE') {
        this.isAiming = !this.isAiming;
        if (aimBtn) aimBtn.classList.toggle('active', this.isAiming);
      }
      if (e.code === 'KeyH' || e.code === 'KeyM') {
        this.useMedkit();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'ShiftLeft') this.isSprinting = false;
    });
  }

  updateJoystick(touchX, touchY, center, maxRadius, thumbElem) {
    const dx = touchX - center.x;
    const dy = touchY - center.y;
    const distSq = dx * dx + dy * dy;

    let clampedX = dx;
    let clampedY = dy;
    const dist = Math.sqrt(distSq);
    if (dist > maxRadius) {
      clampedX = (dx / dist) * maxRadius;
      clampedY = (dy / dist) * maxRadius;
    }

    if (thumbElem) {
      thumbElem.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
    }

    // Deadzone and gentle acceleration curve:
    // Small joystick movement produces small, controlled movement
    const rawLen = Math.min(1, dist / maxRadius);
    const deadzone = 0.08;

    if (rawLen <= deadzone) {
      this.moveVector.set(0, 0);
    } else {
      // Curved response: ensures player does not accelerate too quickly from small input
      const curvedLen = Math.pow((rawLen - deadzone) / (1 - deadzone), 1.25);
      const angle = Math.atan2(clampedY, clampedX);
      // Normalized move vector:
      // X = Strafe (-1 left, +1 right)
      // Y = Forward (-1 back, +1 forward)
      this.moveVector.x = Math.cos(angle) * curvedLen;
      this.moveVector.y = -Math.sin(angle) * curvedLen;
    }
  }

  jump() {
    if (this.isGrounded) {
      this.verticalVelocity = this.jumpForce;
      this.isGrounded = false;
      this.playFootstep();
    }
  }

  // ---------------------------------------------------------------------------
  // WEAPON RECOIL IMPULSE (Subtle camera kick & smooth spring-back)
  // ---------------------------------------------------------------------------
  applyRecoil(pitchKick = 0.009, yawKick = 0) {
    // Subtle upward recoil kick (approx 0.5 degrees)
    this.recoilPitch = Math.min(0.038, this.recoilPitch + pitchKick);
    if (yawKick) {
      this.recoilYaw += yawKick;
    }
  }

  // ---------------------------------------------------------------------------
  // MAIN UPDATE LOOP (FIRST-PERSON FPS CAMERA & MOVEMENT EXECUTION)
  // ---------------------------------------------------------------------------
  update(delta) {
    if (delta > 0.08) delta = 0.08;

    // 1. Movement Input combination
    let inputX = this.moveVector.x;
    let inputY = this.moveVector.y;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) inputY += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) inputY -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) inputX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) inputX += 1;

    const len = Math.hypot(inputX, inputY);
    if (len > 1) {
      inputX /= len;
      inputY /= len;
    }

    // Handle Dynamic Camera FOV (Smooth ADS Zoom & Sprint Stretch)
    if (this.camera) {
      const targetFov = this.isAiming
        ? this.aimFov
        : (this.isSprinting && len > 0.05 ? this.baseFov + 3.5 : this.baseFov);
      if (Math.abs(this.camera.fov - targetFov) > 0.1) {
        this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, delta * 12.0);
        this.camera.updateProjectionMatrix();
      }
    }

    // Movement States & Stamina Calculation (Step 9)
    if (this.isDead) {
      this.movementState = 'IDLE';
    } else if (len > 0.05) {
      if (this.isSprinting) {
        this.stamina = Math.max(0, this.stamina - delta * 18.0);
        this.movementState = 'SPRINT';
        if (this.stamina <= 0) {
          this.isSprinting = false;
          const sprintBtn = document.getElementById('btn-sprint');
          if (sprintBtn) sprintBtn.classList.remove('active');
          this.showCombatToast('স্ট্যামিনা শেষ • STAMINA DEPLETED', true);
        }
      } else if (len >= 0.60) {
        this.movementState = 'RUN';
        this.stamina = Math.min(this.maxStamina, this.stamina + delta * 18.0);
      } else {
        this.movementState = 'WALK';
        this.stamina = Math.min(this.maxStamina, this.stamina + delta * 22.0);
      }
    } else {
      this.movementState = 'IDLE';
      this.stamina = Math.min(this.maxStamina, this.stamina + delta * 25.0);
    }

    // Update HUD gauges
    if (window.battlezoneHUD) {
      window.battlezoneHUD.updateStamina(this.stamina, this.maxStamina);
      window.battlezoneHUD.updateMovementState(this.movementState);
    }

    // 2. Smooth Camera Rotation (Yaw & Pitch interpolation — controlled exclusively by Right-Side Swipe Look)
    // ZERO automatic rotation from the joystick!
    const rotLerp = Math.min(1, delta * 24.0);
    this.yaw += (this.targetYaw - this.yaw) * rotLerp;
    this.pitch += (this.targetPitch - this.pitch) * rotLerp;

    // Recoil recovery: smoothly spring back to player's intended look orientation
    this.recoilPitch = THREE.MathUtils.lerp(this.recoilPitch, 0, Math.min(1, delta * 16.0));
    this.recoilYaw = THREE.MathUtils.lerp(this.recoilYaw, 0, Math.min(1, delta * 16.0));

    // Apply rotation order YXZ to first-person camera with subtle recoil offset
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw + this.recoilYaw;
    this.camera.rotation.x = this.pitch + this.recoilPitch;

    // 3. Movement in World Coordinates based on Current Camera View Direction
    // - Forward (inputY > 0) moves along camera's current forward orientation
    // - Backward (inputY < 0) moves backward relative to camera's orientation
    // - Left (inputX < 0) strafes left relative to camera's orientation
    // - Right (inputX > 0) strafes right relative to camera's orientation
    const currentSpeed = this.isAiming
      ? this.walkSpeed * 0.72
      : (this.isSprinting ? this.sprintSpeed : this.walkSpeed);

    const sinYaw = Math.sin(this.yaw);
    const cosYaw = Math.cos(this.yaw);

    this.vForward.set(-sinYaw, 0, -cosYaw);
    this.vRight.set(cosYaw, 0, -sinYaw);

    this.vMoveDir.set(0, 0, 0);
    this.vMoveDir.addScaledVector(this.vForward, inputY);
    this.vMoveDir.addScaledVector(this.vRight, inputX);

    // Smooth Acceleration & Deceleration for responsive, natural velocity
    const targetVelX = this.vMoveDir.x * currentSpeed;
    const targetVelZ = this.vMoveDir.z * currentSpeed;
    const accelRate = len > 0.02 ? 12.0 : 16.0;
    this.velocity.x += (targetVelX - this.velocity.x) * Math.min(1, delta * accelRate);
    this.velocity.z += (targetVelZ - this.velocity.z) * Math.min(1, delta * accelRate);

    // 4. Collision Detection & Wall Sliding
    this.vDisplacement.set(this.velocity.x * delta, 0, this.velocity.z * delta);
    if (this.vDisplacement.lengthSq() > 0.000001) {
      // Test X movement
      this.vNextPos.set(this.position.x + this.vDisplacement.x, this.position.y, this.position.z);
      if (!this.checkCollision(this.vNextPos)) {
        this.position.x = this.vNextPos.x;
      }
      // Test Z movement
      this.vNextPos.set(this.position.x, this.position.y, this.position.z + this.vDisplacement.z);
      if (!this.checkCollision(this.vNextPos)) {
        this.position.z = this.vNextPos.z;
      }

      // Footstep timing & Head Bobbing
      if (this.isGrounded) {
        this.bobTimer += delta * (this.isSprinting ? 12.0 : 8.5);
        if (Math.sin(this.bobTimer) < -0.92 && !this.stepped) {
          this.playFootstep();
          this.stepped = true;
        } else if (Math.sin(this.bobTimer) > 0) {
          this.stepped = false;
        }
      }
    } else {
      this.bobTimer = 0;
    }

    // 5. Vertical Physics (Gravity & Ground check)
    this.verticalVelocity -= this.gravity * delta;
    this.position.y += this.verticalVelocity * delta;

    // Bridge / canal ground height adjustment for all maps
    let groundHeight = 0;
    if (typeof currentMap !== 'undefined' && currentMap === 'abalpur_village') {
      if (this.position.z >= 24 && this.position.z <= 32) {
        if (Math.abs(this.position.x) <= 3.8 || (this.position.x >= -30.5 && this.position.x <= -25.5)) {
          groundHeight = 0.1; // on bridge deck
        } else {
          groundHeight = -0.7; // in canal water bed
        }
      }
    } else if (typeof currentMap !== 'undefined' && (currentMap === 'magura_river_port' || currentMap === 'magura-river-port')) {
      // In river port, culvert bridge deck is at y = 0.22, general terrain is at y = 0
      if (this.position.x >= 5 && this.position.x <= 19 && this.position.z >= 44 && this.position.z <= 56) {
        groundHeight = 0.22; // on culvert bridge deck
      } else {
        groundHeight = 0;
      }
    } else {
      if (this.position.z >= 71 && this.position.z <= 99 && Math.abs(this.position.x) <= 8.5) {
        groundHeight = 0.05; // on bridge surface
      } else if (this.position.z >= 72 && this.position.z <= 98 && Math.abs(this.position.x) > 8.5) {
        groundHeight = -1.6; // canal trench
      }
    }

    if (this.position.y <= groundHeight) {
      this.position.y = groundHeight;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    }

    // World Boundary constraint
    this.position.x = Math.max(-95, Math.min(95, this.position.x));
    this.position.z = Math.max(-125, Math.min(125, this.position.z));

    // 6. Subtle Head Bobbing effect (strictly First-Person)
    let bobOffset = 0;
    if (this.isGrounded && len > 0.05 && !this.isAiming) {
      bobOffset = Math.sin(this.bobTimer) * this.bobAmount;
    }

    // Position Camera directly at player eye level (completely First-Person, no body model)
    this.camera.position.set(
      this.position.x,
      this.position.y + this.playerHeight + bobOffset,
      this.position.z
    );
  }

  checkCollision(targetPos) {
    const r = this.playerRadius;
    this.playerBox.min.set(targetPos.x - r, targetPos.y, targetPos.z - r);
    this.playerBox.max.set(targetPos.x + r, targetPos.y + 1.8, targetPos.z + r);

    for (let i = 0; i < this.colliders.length; i++) {
      if (this.colliders[i].intersectsBox(this.playerBox)) {
        return true;
      }
    }
    return false;
  }
}
