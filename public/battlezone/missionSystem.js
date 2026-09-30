// BATTLEZONE MAGURA — TACTICAL MISSION SYSTEM
// Modular, Scalable Mission Architecture supporting sequential objectives,
// spatial trigger tracking, enemy elimination counters, objective compass markers,
// HUD tracker overlays, and localStorage progression.

(function() {
  'use strict';

  // 1. CENTRAL MISSION CONFIGURATIONS
  const MISSIONS = [
    {
      id: 'mission_1_factory_assault',
      number: 1,
      name: 'Factory Assault',
      nameBn: 'ফ্যাক্টরি অ্যাসল্ট',
      mapId: 'magura_river_port',
      mapName: 'Magura River Port',
      description: 'Infiltrate the river port industrial zone, secure the Agro-Industrial factory, clear warehouse hostiles, and reach extraction.',
      reward: 1000,
      rewardXp: 150,
      objectives: [
        {
          id: 'reach_factory',
          type: 'reach_area',
          title: 'Reach the Factory',
          titleBn: 'ফ্যাক্টরি এলাকায় প্রবেশ করুন',
          description: 'Navigate to the Agro-Industrial processing facility',
          target: 1,
          current: 0,
          completed: false,
          pos: { x: -50, z: -52 },
          radius: 22,
          markerLabel: 'FACTORY'
        },
        {
          id: 'secure_factory',
          type: 'eliminate_enemies',
          title: 'Secure the Factory',
          titleBn: 'ফ্যাক্টরি মুক্ত করুন (শত্রু নির্মূল)',
          description: 'Neutralize 2 active hostile combatants in the factory sector',
          target: 2,
          current: 0,
          completed: false,
          markerLabel: 'ELIMINATE HOSTILES'
        },
        {
          id: 'clear_warehouse',
          type: 'eliminate_enemies',
          title: 'Clear the Warehouse',
          titleBn: 'গোডাউন শত্রুমুক্ত করুন',
          description: 'Eliminate 2 hostile insurgents in the logistics warehouse zone',
          target: 2,
          current: 0,
          completed: false,
          markerLabel: 'ELIMINATE HOSTILES'
        },
        {
          id: 'reach_extraction',
          type: 'extract',
          title: 'Reach Extraction',
          titleBn: 'নিরাপদ প্রত্যাহার পয়েন্টে যান',
          description: 'Move to the Northern Highway checkpoint for tactical helicopter extraction',
          target: 1,
          current: 0,
          completed: false,
          pos: { x: 0, z: -70 },
          radius: 14,
          markerLabel: 'EXTRACTION'
        }
      ]
    },
    {
      id: 'mission_2_river_strike',
      number: 2,
      name: 'River Strike',
      nameBn: 'রিভার স্ট্রাইক',
      mapId: 'magura_river_port',
      mapName: 'Magura River Port',
      description: 'Assault the Nabaganga riverfront, secure the cargo ghat and boat piers, eliminate hostile forces, and hold the bridge checkpoint.',
      reward: 1500,
      rewardXp: 200,
      objectives: [
        {
          id: 'reach_ghat',
          type: 'reach_area',
          title: 'Reach the River Ghat',
          titleBn: 'রিভার ঘাটে পৌঁছান',
          description: 'Advance south toward the concrete river ghat and boat piers',
          target: 1,
          current: 0,
          completed: false,
          pos: { x: -13, z: 66 },
          radius: 20,
          markerLabel: 'RIVER GHAT'
        },
        {
          id: 'secure_riverside',
          type: 'eliminate_enemies',
          title: 'Secure the Riverside Area',
          titleBn: 'নদীতীর এলাকা সুরক্ষিত করুন',
          description: 'Neutralize 2 hostile bots patrolling along the waterfront',
          target: 2,
          current: 0,
          completed: false,
          markerLabel: 'RIVERSIDE HOSTILES'
        },
        {
          id: 'eliminate_hostiles',
          type: 'eliminate_enemies',
          title: 'Eliminate Required Hostiles',
          titleBn: 'অতিরিক্ত শত্রু নির্মূল করুন',
          description: 'Eliminate 2 additional hostile combatants in the container freight sector',
          target: 2,
          current: 0,
          completed: false,
          markerLabel: 'HOSTILES'
        },
        {
          id: 'secure_bridge',
          type: 'reach_area',
          title: 'Secure the Bridge Checkpoint',
          titleBn: 'কালভার্ট ব্রিজ চেকপয়েন্ট সুরক্ষিত করুন',
          description: 'Establish tactical control over the culvert bridge junction',
          target: 1,
          current: 0,
          completed: false,
          pos: { x: 12, z: 50 },
          radius: 16,
          markerLabel: 'BRIDGE'
        },
        {
          id: 'reach_extraction_dock',
          type: 'extract',
          title: 'Reach Extraction',
          titleBn: 'নিরাপদ প্রত্যাহার পয়েন্টে যান',
          description: 'Rendezvous at the central logistics terminal for extraction',
          target: 1,
          current: 0,
          completed: false,
          pos: { x: 25, z: -20 },
          radius: 14,
          markerLabel: 'EXTRACTION'
        }
      ]
    },
    {
      id: 'mission_3_abalpur_operation',
      number: 3,
      name: 'Abalpur Operation',
      nameBn: 'আবালপুর অপারেশন',
      mapId: 'abalpur_village',
      mapName: 'Abalpur Village',
      description: 'Deploy into rural Abalpur Village, neutralize insurgent militia across the village crossroad, and secure the medical clinic.',
      reward: 2000,
      rewardXp: 250,
      objectives: [
        {
          id: 'enter_village',
          type: 'reach_area',
          title: 'Enter Abalpur Village',
          titleBn: 'আবালপুর গ্রামে প্রবেশ করুন',
          description: 'Move into the central village square and market junction',
          target: 1,
          current: 0,
          completed: false,
          pos: { x: 8, z: -10 },
          radius: 22,
          markerLabel: 'VILLAGE CENTER'
        },
        {
          id: 'secure_village_area',
          type: 'eliminate_enemies',
          title: 'Secure the Village Area',
          titleBn: 'গ্রাম এলাকা শত্রু মুক্ত করুন',
          description: 'Neutralize 2 insurgent combatants around the village square',
          target: 2,
          current: 0,
          completed: false,
          markerLabel: 'VILLAGE HOSTILES'
        },
        {
          id: 'clear_hostile_positions',
          type: 'eliminate_enemies',
          title: 'Clear Hostile Positions',
          titleBn: 'অন্যান্য শত্রু অবস্থান নির্মূল করুন',
          description: 'Eliminate 2 additional hostile targets near the rural school',
          target: 2,
          current: 0,
          completed: false,
          markerLabel: 'HOSTILES'
        },
        {
          id: 'secure_clinic',
          type: 'reach_area',
          title: 'Secure the Main Target Area',
          titleBn: 'কমিউনিটি ক্লিনিক এলাকা সুরক্ষিত করুন',
          description: 'Infiltrate and establish tactical security at the Abalpur Health Clinic',
          target: 1,
          current: 0,
          completed: false,
          pos: { x: -26, z: 32 },
          radius: 18,
          markerLabel: 'CLINIC TARGET'
        },
        {
          id: 'village_extract',
          type: 'extract',
          title: 'Reach Extraction',
          titleBn: 'গ্রামের বহির্ভাগে একস্ট্রাকশন জোনে যান',
          description: 'Retreat to the northern paddy field access road for extraction',
          target: 1,
          current: 0,
          completed: false,
          pos: { x: 0, z: -35 },
          radius: 14,
          markerLabel: 'EXTRACTION'
        }
      ]
    },
    {
      id: 'mission_4_magura_town_operation',
      number: 4,
      name: 'Magura Town Operation',
      nameBn: 'মাগুরা টাউন অপারেশন',
      mapId: 'magura_town',
      mapName: 'Magura Town',
      description: 'Counter-terror operation in urban Magura Town. Secure the Vaynar Mor roundabout, advance to Police Lines, and eliminate commanders.',
      reward: 3000,
      rewardXp: 350,
      objectives: [
        {
          id: 'reach_vaynar_mor',
          type: 'reach_area',
          title: 'Reach Vaynar Mor',
          titleBn: 'ভায়নার মোড়ে পৌঁছান',
          description: 'Advance to the central Vaynar Mor roundabout junction',
          target: 1,
          current: 0,
          completed: false,
          pos: { x: 0, z: 0 },
          radius: 20,
          markerLabel: 'VAYNAR MOR'
        },
        {
          id: 'secure_town_center',
          type: 'eliminate_enemies',
          title: 'Secure the Area',
          titleBn: 'এলাকা সুরক্ষিত করুন (শত্রু নির্মূল)',
          description: 'Eliminate 2 hostile combatants in the municipal market sector',
          target: 2,
          current: 0,
          completed: false,
          markerLabel: 'TOWN HOSTILES'
        },
        {
          id: 'advance_police_lines',
          type: 'reach_area',
          title: 'Move toward Police Lines',
          titleBn: 'পুলিশ লাইন্সের দিকে অগ্রসর হন',
          description: 'Reach the perimeter checkpoint near Police Lines outpost',
          target: 1,
          current: 0,
          completed: false,
          pos: { x: 25, z: -25 },
          radius: 18,
          markerLabel: 'POLICE LINES'
        },
        {
          id: 'eliminate_town_hostiles',
          type: 'eliminate_enemies',
          title: 'Eliminate Required Hostiles',
          titleBn: 'বাকি শত্রু বাহিনী নির্মূল করুন',
          description: 'Neutralize 2 final hostile snipers entrenched in town',
          target: 2,
          current: 0,
          completed: false,
          markerLabel: 'FINAL HOSTILES'
        },
        {
          id: 'town_extract',
          type: 'extract',
          title: 'Reach Extraction',
          titleBn: 'টাউন সদর গেট একস্ট্রাকশনে যান',
          description: 'Secure extraction at the Magura District Sadar Gate',
          target: 1,
          current: 0,
          completed: false,
          pos: { x: 0, z: -40 },
          radius: 14,
          markerLabel: 'EXTRACTION'
        }
      ]
    }
  ];

  // 2. MISSION MANAGER CLASS
  class MissionManager {
    constructor() {
      this.missions = MISSIONS;
      this.activeMission = null;
      this.currentObjectiveIndex = 0;
      this.isMissionMode = false;
      this.completedMissions = new Set();
      this.lastObjectiveCheckTime = 0;
      this.cachedAudioCtx = null;

      this.loadProgress();
      this.injectStyles();
      this.createHUD();
    }

    loadProgress() {
      try {
        const saved = localStorage.getItem('battlezone_missions_progression_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            this.completedMissions = new Set(parsed);
          }
        }
      } catch (e) {
        console.warn('Could not load mission progress from localStorage', e);
      }
    }

    saveProgress() {
      try {
        const arr = Array.from(this.completedMissions);
        localStorage.setItem('battlezone_missions_progression_v1', JSON.stringify(arr));
      } catch (e) {
        console.warn('Could not save mission progress to localStorage', e);
      }
    }

    getMissionState(missionId) {
      if (this.completedMissions.has(missionId)) {
        return 'COMPLETED';
      }
      if (this.activeMission && this.activeMission.id === missionId) {
        return 'ACTIVE';
      }

      // Check unlock requirements (linear unlock sequence)
      const missionIdx = this.missions.findIndex(m => m.id === missionId);
      if (missionIdx === 0) {
        return 'AVAILABLE';
      }
      const prevMission = this.missions[missionIdx - 1];
      if (prevMission && this.completedMissions.has(prevMission.id)) {
        return 'AVAILABLE';
      }
      return 'LOCKED';
    }

    getMissionsList() {
      return this.missions.map(m => ({
        ...m,
        status: this.getMissionState(m.id)
      }));
    }

    startMission(missionId) {
      const template = this.missions.find(m => m.id === missionId);
      if (!template) {
        console.error('Mission not found:', missionId);
        return false;
      }

      // Clone mission template so each objective has fresh counters
      this.activeMission = JSON.parse(JSON.stringify(template));
      this.currentObjectiveIndex = 0;
      this.isMissionMode = true;

      // Close any previous end-game modals
      this.hideModal('mission-complete-modal');
      this.hideModal('mission-failed-modal');

      // Update HUD
      this.updateTrackerHUD();
      this.showTrackerHUD(true);

      // Show Mission Intro Banner
      this.showIntroBanner(this.activeMission);

      // Play audio chime
      this.playChime(440, 0.15);

      console.log(`[MissionManager] Started Mission ${this.activeMission.number}: ${this.activeMission.name} on ${this.activeMission.mapId}`);
      return true;
    }

    exitMissionMode() {
      this.isMissionMode = false;
      this.activeMission = null;
      this.showTrackerHUD(false);
      this.hideObjectiveMarker();
      this.hideModal('mission-complete-modal');
      this.hideModal('mission-failed-modal');
    }

    getCurrentObjective() {
      if (!this.activeMission || !this.activeMission.objectives) return null;
      if (this.currentObjectiveIndex >= this.activeMission.objectives.length) return null;
      return this.activeMission.objectives[this.currentObjectiveIndex];
    }

    // Called every game frame from main.js animate loop
    update(playerPos, camera, delta) {
      if (!this.isMissionMode || !this.activeMission) return;
      const obj = this.getCurrentObjective();
      if (!obj) return;

      const now = performance.now();
      // Spatial distance check throttled to 10Hz (every 100ms) for peak mobile performance
      if (now - this.lastObjectiveCheckTime >= 100) {
        this.lastObjectiveCheckTime = now;

        if (obj.type === 'reach_area' || obj.type === 'extract') {
          if (obj.pos && playerPos) {
            const dx = playerPos.x - obj.pos.x;
            const dz = playerPos.z - obj.pos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist <= obj.radius) {
              this.completeCurrentObjective();
              return;
            }
          }
        }
      }

      // Update 3D Directional Marker on HUD
      this.updateObjectiveMarker(playerPos, camera, obj);
    }

    // Called by enemyManager whenever an enemy dies
    onEnemyKilled(enemy) {
      if (!this.isMissionMode || !this.activeMission) return;
      const obj = this.getCurrentObjective();
      if (!obj || obj.type !== 'eliminate_enemies') return;

      obj.current++;
      this.updateTrackerHUD();

      if (obj.current >= obj.target) {
        this.completeCurrentObjective();
      }
    }

    // Called by controls.js when player dies
    onPlayerDeath() {
      if (!this.isMissionMode || !this.activeMission) return;
      this.showFailedModal();
    }

    completeCurrentObjective() {
      const obj = this.getCurrentObjective();
      if (!obj) return;

      obj.completed = true;
      obj.current = obj.target;

      this.playChime(660, 0.25);
      this.showToast(`✓ লক্ষ্য সম্পন্ন: ${obj.title}`);

      this.currentObjectiveIndex++;
      this.updateTrackerHUD();

      // Check if all objectives are completed
      if (this.currentObjectiveIndex >= this.activeMission.objectives.length) {
        this.completeMission();
      }
    }

    completeMission() {
      if (!this.activeMission) return;
      const missionId = this.activeMission.id;
      this.completedMissions.add(missionId);
      this.saveProgress();

      this.playVictoryFanfare();
      this.showCompleteModal();

      // Dispatch event for React Lobby if open
      window.dispatchEvent(new CustomEvent('BATTLEZONE_MISSION_COMPLETED', {
        detail: { missionId, reward: this.activeMission.reward, rewardXp: this.activeMission.rewardXp }
      }));
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'BATTLEZONE_MISSION_COMPLETED',
          missionId,
          reward: this.activeMission.reward,
          rewardXp: this.activeMission.rewardXp
        }, '*');
      }
    }

    // 3. UI RENDERING & IN-GAME HUD
    injectStyles() {
      if (document.getElementById('mission-system-styles')) return;
      const style = document.createElement('style');
      style.id = 'mission-system-styles';
      style.textContent = `
        /* Compact In-Game Mission Tracker */
        #mission-tracker-hud {
          position: fixed;
          top: 68px;
          left: 12px;
          z-index: 100;
          background: rgba(15, 23, 42, 0.88);
          border: 1px solid rgba(56, 189, 248, 0.35);
          border-left: 3px solid #38bdf8;
          border-radius: 8px;
          padding: 8px 12px;
          color: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
          pointer-events: none;
          max-width: 250px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        #mission-tracker-hud.hidden {
          opacity: 0;
          transform: translateX(-15px);
          pointer-events: none;
        }
        .m-hud-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 4px;
          margin-bottom: 6px;
        }
        .m-hud-num {
          font-size: 9px;
          font-weight: 800;
          color: #38bdf8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .m-hud-title {
          font-size: 11px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.5px;
        }
        .m-hud-obj-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .m-hud-obj-item {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 10px;
          line-height: 1.2;
        }
        .m-hud-obj-item.completed {
          color: #22c55e;
        }
        .m-hud-obj-item.active {
          color: #f59e0b;
          font-weight: 700;
        }
        .m-hud-obj-item.pending {
          color: #64748b;
        }
        .m-hud-obj-icon {
          font-weight: 900;
          font-size: 10px;
          width: 12px;
          text-align: center;
          shrink: 0;
        }

        /* 3D Objective Direction Marker Indicator */
        #mission-objective-marker {
          position: fixed;
          z-index: 101;
          pointer-events: none;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: opacity 0.15s ease;
        }
        #mission-objective-marker.hidden {
          display: none;
        }
        .m-marker-badge {
          background: rgba(14, 116, 144, 0.9);
          border: 1px solid #38bdf8;
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 9px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.8px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }
        .m-marker-dist {
          font-size: 8px;
          color: #fef08a;
          margin-top: 1px;
        }
        .m-marker-icon {
          font-size: 14px;
          color: #38bdf8;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));
          animation: mPulse 1.2s infinite alternate;
        }
        @keyframes mPulse {
          from { transform: scale(0.9); }
          to { transform: scale(1.15); }
        }

        /* Mission Intro Banner */
        #mission-intro-banner {
          position: fixed;
          top: 18%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.95);
          z-index: 110;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(8, 47, 73, 0.92));
          border: 1px solid #0284c7;
          border-radius: 12px;
          padding: 14px 28px;
          text-align: center;
          color: white;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        #mission-intro-banner.visible {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }

        /* Mission Complete & Failed Modals */
        .mission-end-modal {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .mission-end-modal.hidden {
          display: none;
        }
        .mission-card-modal {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 16px;
          width: 100%;
          max-width: 440px;
          padding: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);
          text-align: center;
          animation: mCardPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes mCardPop {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        .m-btn-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
        }
        .m-btn {
          flex: 1;
          padding: 10px 14px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.5px;
          cursor: pointer;
          border: none;
          transition: transform 0.1s, opacity 0.1s;
        }
        .m-btn:active {
          transform: scale(0.97);
        }
        .m-btn-primary {
          background: #0284c7;
          color: white;
        }
        .m-btn-primary:hover {
          background: #0369a1;
        }
        .m-btn-success {
          background: #16a34a;
          color: white;
        }
        .m-btn-success:hover {
          background: #15803d;
        }
        .m-btn-secondary {
          background: #334155;
          color: #e2e8f0;
        }
        .m-btn-secondary:hover {
          background: #475569;
        }
      `;
      document.head.appendChild(style);
    }

    createHUD() {
      // 1. Tracker HUD Container
      if (!document.getElementById('mission-tracker-hud')) {
        const hud = document.createElement('div');
        hud.id = 'mission-tracker-hud';
        hud.className = 'hidden';
        document.body.appendChild(hud);
      }

      // 2. Objective Marker on Screen
      if (!document.getElementById('mission-objective-marker')) {
        const marker = document.createElement('div');
        marker.id = 'mission-objective-marker';
        marker.className = 'hidden';
        marker.innerHTML = `
          <div class="m-marker-icon">▼</div>
          <div class="m-marker-badge">
            <span id="m-marker-text">OBJECTIVE</span>
            <div id="m-marker-dist" class="m-marker-dist">45m</div>
          </div>
        `;
        document.body.appendChild(marker);
      }

      // 3. Mission Intro Banner
      if (!document.getElementById('mission-intro-banner')) {
        const banner = document.createElement('div');
        banner.id = 'mission-intro-banner';
        document.body.appendChild(banner);
      }

      // 4. Mission Complete Modal
      if (!document.getElementById('mission-complete-modal')) {
        const modal = document.createElement('div');
        modal.id = 'mission-complete-modal';
        modal.className = 'mission-end-modal hidden';
        document.body.appendChild(modal);
      }

      // 5. Mission Failed Modal
      if (!document.getElementById('mission-failed-modal')) {
        const modal = document.createElement('div');
        modal.id = 'mission-failed-modal';
        modal.className = 'mission-end-modal hidden';
        document.body.appendChild(modal);
      }
    }

    updateTrackerHUD() {
      const hud = document.getElementById('mission-tracker-hud');
      if (!hud || !this.activeMission) return;

      const curObj = this.getCurrentObjective();
      if (curObj && window.battlezoneHUD) {
        const countText = curObj.type === 'eliminate_enemies' ? `${curObj.current}/${curObj.target}` : '';
        window.battlezoneHUD.setObjective(`OBJECTIVE: ${curObj.title.toUpperCase()}`, countText);
      }

      let html = `
        <div class="m-hud-header">
          <span class="m-hud-num">MISSION 0${this.activeMission.number}</span>
          <span class="m-hud-title">${this.activeMission.name}</span>
        </div>
        <div class="m-hud-obj-list">
      `;

      this.activeMission.objectives.forEach((obj, idx) => {
        let statusClass = 'pending';
        let icon = '○';

        if (obj.completed) {
          statusClass = 'completed';
          icon = '✓';
        } else if (idx === this.currentObjectiveIndex) {
          statusClass = 'active';
          icon = '▶';
        }

        const countText = obj.type === 'eliminate_enemies' ? ` (${obj.current}/${obj.target})` : '';
        html += `
          <div class="m-hud-obj-item ${statusClass}">
            <span class="m-hud-obj-icon">${icon}</span>
            <span>${obj.title}${countText}</span>
          </div>
        `;
      });

      html += `</div>`;
      hud.innerHTML = html;
    }

    showTrackerHUD(visible) {
      const hud = document.getElementById('mission-tracker-hud');
      if (hud) {
        if (visible) hud.classList.remove('hidden');
        else hud.classList.add('hidden');
      }
    }

    showIntroBanner(mission) {
      const banner = document.getElementById('mission-intro-banner');
      if (!banner) return;

      banner.innerHTML = `
        <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 2px;">
          MISSION 0${mission.number} • ${mission.mapName}
        </div>
        <div style="font-size: 20px; font-weight: 900; letter-spacing: 1px; color: #ffffff; margin-bottom: 6px;">
          ${mission.name}
        </div>
        <div style="font-size: 11px; color: #cbd5e1; max-width: 320px; line-height: 1.4;">
          ${mission.description}
        </div>
      `;

      banner.classList.add('visible');
      setTimeout(() => {
        banner.classList.remove('visible');
      }, 3500);
    }

    updateObjectiveMarker(playerPos, camera, obj) {
      const marker = document.getElementById('mission-objective-marker');
      if (!marker) return;

      // Only show spatial 3D marker for location/extraction objectives with a coordinate
      if (!obj || (obj.type !== 'reach_area' && obj.type !== 'extract') || !obj.pos || !camera || !playerPos) {
        marker.classList.add('hidden');
        return;
      }

      // Calculate 3D to 2D projection
      const targetV3 = new THREE.Vector3(obj.pos.x, 1.8, obj.pos.z);
      const dist = Math.round(playerPos.distanceTo ? playerPos.distanceTo(targetV3) : Math.sqrt(
        Math.pow(playerPos.x - obj.pos.x, 2) + Math.pow(playerPos.z - obj.pos.z, 2)
      ));

      targetV3.project(camera);

      // Check if target is in front of camera
      const isBehind = targetV3.z > 1.0;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      let screenX = (targetV3.x * 0.5 + 0.5) * screenW;
      let screenY = (-(targetV3.y * 0.5) + 0.5) * screenH;

      if (isBehind) {
        screenX = screenW - screenX;
        screenY = screenH - 60;
      }

      // Clamp to screen edges with padding
      const pad = 45;
      screenX = Math.max(pad, Math.min(screenW - pad, screenX));
      screenY = Math.max(pad + 40, Math.min(screenH - pad, screenY));

      marker.style.left = `${screenX}px`;
      marker.style.top = `${screenY}px`;

      const textElem = document.getElementById('m-marker-text');
      if (textElem) textElem.textContent = obj.markerLabel || 'OBJECTIVE';
      const distElem = document.getElementById('m-marker-dist');
      if (distElem) distElem.textContent = `${dist}m`;

      marker.classList.remove('hidden');
    }

    hideObjectiveMarker() {
      const marker = document.getElementById('mission-objective-marker');
      if (marker) marker.classList.add('hidden');
    }

    showCompleteModal() {
      const modal = document.getElementById('mission-complete-modal');
      if (!modal || !this.activeMission) return;

      this.hideObjectiveMarker();
      const m = this.activeMission;
      const nextIdx = m.number; // e.g. finished mission 1 (number 1), next is index 1 (number 2)
      const hasNext = nextIdx < this.missions.length;

      let objChecklist = '';
      m.objectives.forEach(obj => {
        objChecklist += `
          <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: #86efac; text-align: left; margin-bottom: 4px;">
            <span style="font-weight: bold; color: #22c55e;">✓</span>
            <span>${obj.title}</span>
          </div>
        `;
      });

      modal.innerHTML = `
        <div class="mission-card-modal" style="border-color: #22c55e;">
          <div style="display: inline-block; padding: 4px 10px; background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; border-radius: 20px; font-size: 10px; font-weight: 800; color: #4ade80; margin-bottom: 10px; letter-spacing: 1px;">
            ★ MISSION COMPLETED • মিশন সফল
          </div>
          <h2 style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; margin: 0 0 4px 0;">
            ${m.name}
          </h2>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 16px;">
            ${m.mapName} • SECTOR CLEARED
          </div>

          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid #1e293b; border-radius: 10px; padding: 12px; margin-bottom: 16px;">
            ${objChecklist}
          </div>

          <div style="display: flex; justify-content: space-around; background: rgba(8, 47, 73, 0.4); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 10px; margin-bottom: 18px;">
            <div>
              <div style="font-size: 9px; color: #94a3b8; font-weight: bold;">REWARD TAKA</div>
              <div style="font-size: 14px; font-weight: 900; color: #fbbf24;">+৳${m.reward}</div>
            </div>
            <div>
              <div style="font-size: 9px; color: #94a3b8; font-weight: bold;">COMBAT XP</div>
              <div style="font-size: 14px; font-weight: 900; color: #38bdf8;">+${m.rewardXp} XP</div>
            </div>
          </div>

          <div class="m-btn-row">
            ${hasNext ? `
              <button id="btn-m-continue" class="m-btn m-btn-success">
                NEXT MISSION (${nextIdx + 1}) →
              </button>
            ` : ''}
            <button id="btn-m-replay" class="m-btn m-btn-primary">
              REPLAY ↺
            </button>
            <button id="btn-m-lobby" class="m-btn m-btn-secondary">
              LOBBY
            </button>
          </div>
        </div>
      `;

      modal.classList.remove('hidden');

      const nextBtn = document.getElementById('btn-m-continue');
      if (nextBtn) {
        nextBtn.onclick = () => {
          const nextMission = this.missions[nextIdx];
          if (nextMission) {
            this.hideModal('mission-complete-modal');
            if (typeof window.startMatch === 'function') {
              window.startMatch(nextMission.mapId);
            }
            this.startMission(nextMission.id);
          }
        };
      }

      const replayBtn = document.getElementById('btn-m-replay');
      if (replayBtn) {
        replayBtn.onclick = () => {
          this.hideModal('mission-complete-modal');
          if (typeof window.startMatch === 'function') {
            window.startMatch(m.mapId);
          }
          this.startMission(m.id);
        };
      }

      const lobbyBtn = document.getElementById('btn-m-lobby');
      if (lobbyBtn) {
        lobbyBtn.onclick = () => {
          this.exitMissionMode();
          window.parent.postMessage({ type: 'BATTLEZONE_EXIT_TO_LOBBY' }, '*');
        };
      }
    }

    showFailedModal() {
      const modal = document.getElementById('mission-failed-modal');
      if (!modal || !this.activeMission) return;

      this.hideObjectiveMarker();
      const m = this.activeMission;

      modal.innerHTML = `
        <div class="mission-card-modal" style="border-color: #ef4444;">
          <div style="display: inline-block; padding: 4px 10px; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; border-radius: 20px; font-size: 10px; font-weight: 800; color: #f87171; margin-bottom: 10px; letter-spacing: 1px;">
            💀 MISSION FAILED • মিশন ব্যর্থ
          </div>
          <h2 style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; margin: 0 0 4px 0;">
            ${m.name}
          </h2>
          <div style="font-size: 11px; color: #fca5a5; margin-bottom: 16px;">
            KILLED IN ACTION (KIA) • শত্রু হামলায় নিহত হয়েছেন
          </div>

          <p style="font-size: 11px; color: #94a3b8; line-height: 1.4; margin-bottom: 20px;">
            অপারেশন সম্পন্ন করার পূর্বে সেনা নিহত হয়েছে। পুনরায় চেষ্টা করুন অথবা লবিতে ফিরে যান।
          </p>

          <div class="m-btn-row">
            <button id="btn-m-restart" class="m-btn m-btn-primary">
              RESTART MISSION ↺
            </button>
            <button id="btn-m-fail-lobby" class="m-btn m-btn-secondary">
              RETURN TO LOBBY
            </button>
          </div>
        </div>
      `;

      modal.classList.remove('hidden');

      const restartBtn = document.getElementById('btn-m-restart');
      if (restartBtn) {
        restartBtn.onclick = () => {
          this.hideModal('mission-failed-modal');
          if (typeof window.startMatch === 'function') {
            window.startMatch(m.mapId);
          }
          this.startMission(m.id);
        };
      }

      const lobbyBtn = document.getElementById('btn-m-fail-lobby');
      if (lobbyBtn) {
        lobbyBtn.onclick = () => {
          this.exitMissionMode();
          window.parent.postMessage({ type: 'BATTLEZONE_EXIT_TO_LOBBY' }, '*');
        };
      }
    }

    hideModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.add('hidden');
    }

    showToast(msg) {
      if (window.fpsController && typeof window.fpsController.showCombatToast === 'function') {
        window.fpsController.showCombatToast(msg);
      }
    }

    playChime(freq, duration = 0.2) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!this.cachedAudioCtx) this.cachedAudioCtx = new AudioCtx();
        if (this.cachedAudioCtx.state === 'suspended') this.cachedAudioCtx.resume();

        const ctx = this.cachedAudioCtx;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + duration);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {
        // audio fail silent
      }
    }

    playVictoryFanfare() {
      try {
        [440, 554, 659, 880].forEach((freq, idx) => {
          setTimeout(() => this.playChime(freq, 0.3), idx * 120);
        });
      } catch (e) {}
    }
  }

  // Create global instance
  const missionManager = new MissionManager();
  window.missionManager = missionManager;
})();
