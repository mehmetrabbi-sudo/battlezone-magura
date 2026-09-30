// First-Person Mobile FPS Controls for Battlezone Magura
// Smooth touch look, left virtual joystick, sprint, jump, physics & zero-allocation audio loops

class FPSController {
  constructor(camera, domElement, colliders = []) {
    this.camera = camera;
    this.domElement = domElement;
    this.colliders = colliders;

    // Camera Rotation (Euler: pitch X, yaw Y)
    this.pitch = 0;
    this.yaw = Math.PI; // Face down the main road towards town center initially
    this.targetPitch = 0;
    this.targetYaw = Math.PI;
    this.lookSensitivity = 0.0035;

    // Movement Vectors & Speeds
    this.position = new THREE.Vector3(0, 1.72, -30); // Start on main road
    this.velocity = new THREE.Vector3();
    this.moveVector = new THREE.Vector2(0, 0); // (x: strafe, y: forward/back)

    this.walkSpeed = 4.2; // m/s
    this.sprintSpeed = 7.8; // m/s
    this.isSprinting = false;

    // Jump & Gravity Physics
    this.isGrounded = true;
    this.verticalVelocity = 0;
    this.gravity = 18.0;
    this.jumpForce = 6.2;
    this.playerHeight = 1.72;

    // Head Bobbing
    this.bobTimer = 0;
    this.bobAmount = 0.04;
    this.stepped = false;

    // Touch Identifiers
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

    // Player Health & Combat State
    this.maxHp = 100;
    this.hp = 100;
    this.isDead = false;
    this.damageOverlay = document.getElementById('damage-overlay');
    this.healthDigits = document.getElementById('player-health-digits');
    this.healthFill = document.getElementById('player-health-fill');
    this.healthHud = document.getElementById('player-health-hud');
    this.updateHealthHUD();

    // Audio Context for Footsteps
    this.initAudio();

    // Setup UI & Touch Event Listeners
    this.initTouchControls();
  }

  takeDamage(amount) {
    if (this.isDead) return;

    this.hp = Math.max(0, this.hp - amount);
    this.updateHealthHUD();

    // Screen Red Flash
    if (this.damageOverlay) {
      this.damageOverlay.classList.add('flash');
      setTimeout(() => {
        if (this.damageOverlay) this.damageOverlay.classList.remove('flash');
      }, 160);
    }

    // Play Hurt Audio
    this.playHurtSound();

    if (this.hp <= 0) {
      this.die();
    }
  }

  updateHealthHUD() {
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
    // Respawn after 2.5 seconds with full HP at town start
    setTimeout(() => {
      this.hp = this.maxHp;
      this.isDead = false;
      this.position.set(0, 1.72, -30);
      this.updateHealthHUD();
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

  initTouchControls() {
    const joystickZone = document.getElementById('joystick-zone');
    const joystickThumb = document.getElementById('joystick-thumb');
    const lookZone = document.getElementById('look-zone');
    const jumpBtn = document.getElementById('btn-jump');
    const sprintBtn = document.getElementById('btn-sprint');
    const sensSlider = document.getElementById('sens-slider');

    if (sensSlider) {
      sensSlider.addEventListener('input', (e) => {
        this.lookSensitivity = parseFloat(e.target.value) || 0.0035;
      });
    }

    let joystickCenter = { x: 0, y: 0 };
    const maxRadius = 45; // max pixel displacement of thumbstick

    // 1. LEFT JOYSTICK TOUCH EVENTS
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
          joystickThumb.style.transform = `translate(0px, 0px)`;
          break;
        }
      }
    };

    if (joystickZone) {
      joystickZone.addEventListener('touchstart', onJoyStart, { passive: false });
    }
    window.addEventListener('touchmove', onJoyMove, { passive: false });
    window.addEventListener('touchend', onJoyEnd, { passive: false });
    window.addEventListener('touchcancel', onJoyEnd, { passive: false });

    // 2. RIGHT SIDE LOOK TOUCH EVENTS
    const onLookStart = (e) => {
      if (e.target && e.target.closest && e.target.closest('button, .action-buttons, .ammo-hud, #settings-modal, .quick-options')) {
        return;
      }
      e.preventDefault();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (this.lookTouchId === null && t.clientX >= window.innerWidth * 0.38) {
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

          this.targetYaw -= dx * this.lookSensitivity;
          this.targetPitch -= dy * this.lookSensitivity;

          // Clamp vertical pitch (-80 deg to +80 deg)
          const maxPitch = 1.4;
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

    // 3. JUMP BUTTON
    if (jumpBtn) {
      jumpBtn.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        this.jump();
      }, { passive: false });
      jumpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.jump();
      });
    }

    // 4. SPRINT BUTTON (Toggle)
    if (sprintBtn) {
      sprintBtn.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        this.isSprinting = !this.isSprinting;
        sprintBtn.classList.toggle('active', this.isSprinting);
      }, { passive: false });
      sprintBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isSprinting = !this.isSprinting;
        sprintBtn.classList.toggle('active', this.isSprinting);
      });
    }

    // Keyboard Fallback for testing / desktop emulation
    this.keys = {};
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') this.jump();
      if (e.code === 'ShiftLeft') this.isSprinting = true;
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
    if (distSq > maxRadius * maxRadius) {
      const dist = Math.sqrt(distSq);
      clampedX = (dx / dist) * maxRadius;
      clampedY = (dy / dist) * maxRadius;
    }

    thumbElem.style.transform = `translate(${clampedX}px, ${clampedY}px)`;

    // Normalized move vector: X = Strafe (-1 left, +1 right), Y = Forward (-1 back, +1 forward)
    this.moveVector.x = clampedX / maxRadius;
    this.moveVector.y = -(clampedY / maxRadius);
  }

  jump() {
    if (this.isGrounded) {
      this.verticalVelocity = this.jumpForce;
      this.isGrounded = false;
      this.playFootstep();
    }
  }

  update(delta) {
    if (delta > 0.08) delta = 0.08; // clamp delta during frame spikes

    // 1. Smooth Camera Rotation (Yaw & Pitch interpolation)
    this.yaw += (this.targetYaw - this.yaw) * 0.5;
    this.pitch += (this.targetPitch - this.pitch) * 0.5;

    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // 2. Movement direction in world coordinates
    let inputX = this.moveVector.x;
    let inputY = this.moveVector.y;

    // Combine with keyboard
    if (this.keys['KeyW'] || this.keys['ArrowUp']) inputY += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) inputY -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) inputX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) inputX += 1;

    const len = Math.hypot(inputX, inputY);
    if (len > 1) {
      inputX /= len;
      inputY /= len;
    }

    const currentSpeed = this.isSprinting ? this.sprintSpeed : this.walkSpeed;

    // Compute Forward and Right vectors from Camera Yaw without new allocations
    const sinYaw = Math.sin(this.yaw);
    const cosYaw = Math.cos(this.yaw);

    this.vForward.set(-sinYaw, 0, -cosYaw);
    this.vRight.set(cosYaw, 0, -sinYaw);

    this.vMoveDir.set(0, 0, 0);
    this.vMoveDir.addScaledVector(this.vForward, inputY);
    this.vMoveDir.addScaledVector(this.vRight, inputX);

    // 3. Collision Detection & Wall Sliding
    this.vDisplacement.copy(this.vMoveDir).multiplyScalar(currentSpeed * delta);
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

      // Footstep timing
      if (this.isGrounded) {
        this.bobTimer += delta * (this.isSprinting ? 15 : 10);
        if (Math.sin(this.bobTimer) < -0.95 && !this.stepped) {
          this.playFootstep();
          this.stepped = true;
        } else if (Math.sin(this.bobTimer) > 0) {
          this.stepped = false;
        }
      }
    } else {
      this.bobTimer = 0;
    }

    // 4. Vertical Physics (Gravity & Ground check)
    this.verticalVelocity -= this.gravity * delta;
    this.position.y += this.verticalVelocity * delta;

    // Bridge height adjustment (over culvert at Z = 85)
    let groundHeight = 0;
    if (this.position.z >= 71 && this.position.z <= 99 && Math.abs(this.position.x) <= 8.5) {
      groundHeight = 0.05; // on bridge surface
    } else if (this.position.z >= 72 && this.position.z <= 98 && Math.abs(this.position.x) > 8.5) {
      groundHeight = -1.6; // canal trench
    }

    const minEyeY = groundHeight + this.playerHeight;
    if (this.position.y <= minEyeY) {
      this.position.y = minEyeY;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    }

    // 5. Head Bobbing effect
    let bobOffset = 0;
    if (this.isGrounded && len > 0.05) {
      bobOffset = Math.sin(this.bobTimer) * this.bobAmount;
    }

    this.camera.position.set(
      this.position.x,
      this.position.y + bobOffset,
      this.position.z
    );

    // World Boundary constraint
    this.position.x = Math.max(-55, Math.min(55, this.position.x));
    this.position.z = Math.max(-125, Math.min(125, this.position.z));
  }

  checkCollision(targetPos) {
    const r = this.playerRadius;
    this.playerBox.min.set(targetPos.x - r, targetPos.y - 1.5, targetPos.z - r);
    this.playerBox.max.set(targetPos.x + r, targetPos.y + 0.3, targetPos.z + r);

    for (let i = 0; i < this.colliders.length; i++) {
      if (this.colliders[i].intersectsBox(this.playerBox)) {
        return true;
      }
    }
    return false;
  }
}
