// Procedural Texture Generator for Battlezone Magura
// High-detail, optimized mobile textures generated via HTML5 Canvas with caching

const TextureFactory = {
  cache: {},

  // Road Asphalt Texture with lane markings
  createRoadTexture: function() {
    const cacheKey = 'road_asphalt';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base dark asphalt
    ctx.fillStyle = '#26292d';
    ctx.fillRect(0, 0, 512, 512);

    // Aggregate pebble noise
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const shade = Math.floor(25 + Math.random() * 30);
      ctx.fillStyle = `rgba(${shade}, ${shade + 2}, ${shade + 4}, 0.65)`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Road surface wear & tar cracks
    ctx.strokeStyle = 'rgba(20, 20, 22, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      let cx = Math.random() * 512;
      let cy = Math.random() * 512;
      ctx.moveTo(cx, cy);
      for (let j = 0; j < 4; j++) {
        cx += (Math.random() - 0.5) * 40;
        cy += (Math.random() - 0.5) * 40;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    // White broken center line
    ctx.fillStyle = 'rgba(235, 238, 240, 0.9)';
    const dashLength = 80;
    const gap = 50;
    for (let y = 15; y < 512; y += dashLength + gap) {
      ctx.fillRect(252, y, 8, dashLength);
    }

    // Outer solid yellow safety lines on edges
    ctx.fillStyle = 'rgba(230, 185, 30, 0.85)';
    ctx.fillRect(35, 0, 7, 512);
    ctx.fillRect(470, 0, 7, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Crosswalk / Zebra Crossing Texture
  createCrosswalkTexture: function() {
    const cacheKey = 'crosswalk';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Asphalt
    ctx.fillStyle = '#222528';
    ctx.fillRect(0, 0, 256, 256);

    // Weathered white zebra stripes
    ctx.fillStyle = 'rgba(240, 240, 242, 0.9)';
    const stripeWidth = 28;
    const gap = 24;
    for (let x = 16; x < 240; x += stripeWidth + gap) {
      ctx.fillRect(x, 20, stripeWidth, 216);
    }

    // Dirt and wear overlay
    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = 'rgba(20, 20, 20, 0.15)';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Side Alley / Brick Paved Street Texture
  createBrickPavementTexture: function() {
    const cacheKey = 'brick_pavement';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#6b4c3e'; // Clay mortar
    ctx.fillRect(0, 0, 256, 256);

    const brickH = 20;
    const brickW = 44;
    const mortar = 3;

    for (let y = 0; y < 256; y += brickH + mortar) {
      const rowOffset = (Math.floor(y / (brickH + mortar)) % 2) * (brickW / 2);
      for (let x = -brickW; x < 256 + brickW; x += brickW + mortar) {
        const toneVar = Math.floor(Math.random() * 30);
        ctx.fillStyle = `rgb(${155 - toneVar}, ${70 - toneVar / 2}, ${52 - toneVar / 2})`;
        ctx.fillRect(x + rowOffset, y, brickW, brickH);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Sidewalk concrete tiles with yellow-black curb
  createSidewalkTexture: function() {
    const cacheKey = 'sidewalk';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Concrete base
    ctx.fillStyle = '#8f9296';
    ctx.fillRect(0, 0, 256, 256);

    // Grid lines for concrete tiles (4x4 tiles)
    ctx.strokeStyle = '#616468';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 256; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i, 256);
      ctx.moveTo(0, i); ctx.lineTo(256, i);
      ctx.stroke();
    }

    // Concrete flecks & weather stains
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(50,50,50,0.12)' : 'rgba(255,255,255,0.08)';
      ctx.fillRect(x, y, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Curbstone with alternating yellow and black warning stripes
  createCurbTexture: function() {
    const cacheKey = 'curb';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Stripes
    const stripeW = 16;
    for (let i = 0; i < 128; i += stripeW) {
      ctx.fillStyle = (Math.floor(i / stripeW) % 2 === 0) ? '#e6b800' : '#1f2326';
      ctx.fillRect(i, 0, stripeW, 32);
    }

    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, 24, 128, 8);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Building Facade with Plaster, Weather Stains & Exposed Brick Sections
  createBuildingFacadeTexture: function(colorHex, windowCols = 4, windowRows = 4) {
    const cacheKey = `facade_${colorHex}_${windowCols}_${windowRows}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Wall base
    ctx.fillStyle = colorHex || '#c8beaf';
    ctx.fillRect(0, 0, 256, 256);

    // Weathering/water streak stains running down from roof
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, 'rgba(60, 50, 40, 0.3)');
    grad.addColorStop(0.25, 'rgba(80, 70, 60, 0.1)');
    grad.addColorStop(0.8, 'rgba(40, 40, 40, 0.05)');
    grad.addColorStop(1, 'rgba(30, 30, 30, 0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Exposed brick patch on lower side
    const patchX = 15, patchY = 190, patchW = 45, patchH = 40;
    ctx.fillStyle = '#944838';
    ctx.fillRect(patchX, patchY, patchW, patchH);
    ctx.strokeStyle = '#5a2d24';
    ctx.lineWidth = 1;
    for (let py = patchY; py < patchY + patchH; py += 8) {
      ctx.beginPath();
      ctx.moveTo(patchX, py);
      ctx.lineTo(patchX + patchW, py);
      ctx.stroke();
    }

    // Windows with glass and metal security grills
    const cellW = 256 / windowCols;
    const cellH = 256 / windowRows;

    for (let r = 0; r < windowRows; r++) {
      for (let c = 0; c < windowCols; c++) {
        const wx = c * cellW + cellW * 0.2;
        const wy = r * cellH + cellH * 0.22;
        const ww = cellW * 0.6;
        const wh = cellH * 0.56;

        // Window frame
        ctx.fillStyle = '#2d3339';
        ctx.fillRect(wx - 2, wy - 2, ww + 4, wh + 4);

        // Window glass (tinted with sky reflection)
        const winGrad = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
        winGrad.addColorStop(0, '#3a506b');
        winGrad.addColorStop(1, '#1b263b');
        ctx.fillStyle = winGrad;
        ctx.fillRect(wx, wy, ww, wh);

        // Metal window grill (security bars)
        ctx.strokeStyle = '#7c858d';
        ctx.lineWidth = 1;
        for (let bx = wx + ww * 0.25; bx < wx + ww; bx += ww * 0.25) {
          ctx.beginPath();
          ctx.moveTo(bx, wy);
          ctx.lineTo(bx, wy + wh);
          ctx.stroke();
        }

        // Concrete sunshade (Chajja)
        ctx.fillStyle = '#a69f94';
        ctx.fillRect(wx - 4, wy - 5, ww + 8, 4);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Shopfront Roll-up Corrugated Shutter Texture (দোকানের শাটার)
  createShutterTexture: function(colorHex = '#3c6e71', isOpen = false) {
    const cacheKey = `shutter_${colorHex}_${isOpen}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (isOpen) {
      // Half-open shutter showing interior shop racks
      ctx.fillStyle = '#1c1b18';
      ctx.fillRect(0, 0, 256, 128);

      // Shelves with products inside
      for (let y = 50; y < 120; y += 22) {
        ctx.fillStyle = '#5c4033';
        ctx.fillRect(6, y, 244, 4);
        for (let x = 12; x < 240; x += 14) {
          ctx.fillStyle = `hsl(${(x * 17) % 360}, 60%, 50%)`;
          ctx.fillRect(x, y - 14, 10, 14);
        }
      }

      // Rolled up shutter at top
      ctx.fillStyle = colorHex;
      ctx.fillRect(0, 0, 256, 45);
      for (let y = 0; y < 45; y += 6) {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(0, y, 256, 2);
      }
    } else {
      // Closed ribbed metal shutter
      ctx.fillStyle = colorHex;
      ctx.fillRect(0, 0, 256, 128);

      for (let y = 0; y < 128; y += 8) {
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(0, y, 256, 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, y + 4, 256, 3);
      }

      // Bottom lock plate & padlock
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 118, 256, 10);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(123, 114, 10, 12);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Bengali Shop Signboards with authentic typography
  createBengaliSignTexture: function(mainText, subText, phoneText, bgTheme = 'blue') {
    const cacheKey = `sign_${mainText}_${bgTheme}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');

    // Background color scheme
    let bgColor = '#004b93';
    let borderColor = '#ffcc00';
    let titleColor = '#ffffff';

    if (bgTheme === 'red') {
      bgColor = '#b31217';
      borderColor = '#ffde59';
    } else if (bgTheme === 'green') {
      bgColor = '#086e38';
      borderColor = '#fdf001';
    } else if (bgTheme === 'orange') {
      bgColor = '#d35400';
      borderColor = '#ffffff';
    } else if (bgTheme === 'bkash') {
      bgColor = '#e2136e';
      borderColor = '#ffffff';
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 384, 120);

    // Decorative border frame
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 376, 112);

    // Top text
    ctx.textAlign = 'center';
    ctx.fillStyle = borderColor;
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('।। বিসমিল্লাহির রাহমানির রাহিম ।।', 192, 18);

    // Main Bengali Shop Name
    ctx.fillStyle = titleColor;
    ctx.font = '900 24px sans-serif';
    ctx.fillText(mainText, 192, 54);

    // Subtitle / Specialty
    ctx.fillStyle = '#fffae6';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(subText, 192, 82);

    // Contact bar at bottom
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(6, 94, 372, 20);
    ctx.fillStyle = borderColor;
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(`মোবাইল: ${phoneText} | মাগুরা সদর`, 192, 108);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Wall Poster & Political/Festival Banner Texture (দেয়াল পোস্টার)
  createWallPosterTexture: function() {
    const cacheKey = 'wall_poster';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Concrete background
    ctx.fillStyle = '#7a7a72';
    ctx.fillRect(0, 0, 256, 128);

    const posters = [
      { x: 15, y: 15, w: 65, h: 95, bg: '#ffffff', text: 'ভোট দিন', sub: 'মাগুরা', col: '#1e3a8a' },
      { x: 92, y: 20, w: 72, h: 90, bg: '#fffbe6', text: 'কনসার্ট', sub: 'স্টেডিয়াম', col: '#b91c1c' },
      { x: 175, y: 12, w: 68, h: 98, bg: '#e0f2fe', text: 'ভর্তি চলছে', sub: 'কম্পিউটার', col: '#047857' }
    ];

    posters.forEach(p => {
      ctx.fillStyle = p.bg;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = p.col;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x + p.w / 2, p.y + 35);
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(p.sub, p.x + p.w / 2, p.y + 60);
    });

    const texture = new THREE.CanvasTexture(canvas);
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Corrugated Tin Sheet Texture (টিনের চাল)
  createTinRoofTexture: function() {
    const cacheKey = 'tin_roof';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#838b94';
    ctx.fillRect(0, 0, 128, 128);

    const waveH = 12;
    for (let y = 0; y < 128; y += waveH) {
      const g = ctx.createLinearGradient(0, y, 0, y + waveH);
      g.addColorStop(0, '#596068');
      g.addColorStop(0.3, '#bcc5ce');
      g.addColorStop(0.7, '#eff3f6');
      g.addColorStop(1, '#596068');
      ctx.fillStyle = g;
      ctx.fillRect(0, y, 128, waveH);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Canal Water Surface Texture
  createWaterTexture: function() {
    const cacheKey = 'canal_water';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Murky tropical river/canal water color
    ctx.fillStyle = '#224842';
    ctx.fillRect(0, 0, 256, 256);

    // Wave ripples
    for (let i = 0; i < 35; i++) {
      ctx.strokeStyle = 'rgba(100, 180, 160, 0.2)';
      ctx.lineWidth = Math.random() * 3 + 1.5;
      ctx.beginPath();
      const y = Math.random() * 256;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(85, y + (Math.random() - 0.5) * 30, 170, y + (Math.random() - 0.5) * 30, 256, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Realistic Rural Mud Plaster Wall with Straw Fibers & Clay Cracks (লেপা মাটির দেয়াল)
  createMudWallTexture: function() {
    const cacheKey = 'mud_wall';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base warm clay earth tone
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#75583b');
    grad.addColorStop(0.7, '#6b4f35');
    grad.addColorStop(1, '#543b25');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Fine organic soil flecks and pebble grains
    for (let i = 0; i < 3500; i++) {
      const px = Math.random() * 256;
      const py = Math.random() * 256;
      const tone = Math.random();
      ctx.fillStyle = tone > 0.6 ? 'rgba(150, 115, 80, 0.25)' : (tone > 0.3 ? 'rgba(50, 32, 18, 0.35)' : 'rgba(180, 150, 110, 0.2)');
      ctx.fillRect(px, py, Math.random() * 2.5 + 1, Math.random() * 2.5 + 1);
    }

    // Dried straw fibers mixed into mud (traditional Bangladeshi mud building)
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 140; i++) {
      const sx = Math.random() * 256;
      const sy = Math.random() * 256;
      const len = Math.random() * 14 + 6;
      const ang = Math.random() * Math.PI;
      ctx.strokeStyle = Math.random() > 0.4 ? 'rgba(215, 185, 115, 0.65)' : 'rgba(130, 95, 45, 0.5)';
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + Math.cos(ang) * (len * 0.5) + (Math.random() - 0.5) * 4, sy + Math.sin(ang) * (len * 0.5), sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
      ctx.stroke();
    }

    // Hand-smoothed plaster strokes
    for (let i = 0; i < 16; i++) {
      const y = Math.random() * 256;
      ctx.fillStyle = 'rgba(110, 85, 55, 0.15)';
      ctx.fillRect(0, y, 256, Math.random() * 16 + 8);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Weathered Plaster Wall with Patches of Damp Moss & Exposed Terracotta Brick
  createWeatheredPlasterTexture: function(baseColor = '#d9d2c5') {
    const cacheKey = `weathered_plaster_${baseColor}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 256, 256);

    // Weather stains from rainwater runoff
    const rainGrad = ctx.createLinearGradient(0, 0, 0, 256);
    rainGrad.addColorStop(0, 'rgba(60, 55, 45, 0.35)');
    rainGrad.addColorStop(0.3, 'rgba(80, 75, 60, 0.15)');
    rainGrad.addColorStop(0.85, 'rgba(45, 55, 40, 0.1)');
    rainGrad.addColorStop(1, 'rgba(40, 50, 35, 0.45)');
    ctx.fillStyle = rainGrad;
    ctx.fillRect(0, 0, 256, 256);

    // Exposed terracotta brick patch at lower edge
    const bx = 16, by = 175, bw = 65, bh = 55;
    ctx.fillStyle = '#8f3e2e';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#522016';
    ctx.lineWidth = 1.5;
    for (let y = by; y <= by + bh; y += 12) {
      ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + bw, y); ctx.stroke();
      const off = ((y - by) / 12) % 2 === 0 ? 0 : 12;
      for (let x = bx + off; x <= bx + bw; x += 24) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, Math.min(y + 12, by + bh)); ctx.stroke();
      }
    }
    // Peeling plaster border around brick patch
    ctx.strokeStyle = '#f0ebe1';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(bx - 1, by - 1, bw + 2, bh + 2);

    // Micro speckle dirt
    for (let i = 0; i < 2200; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(40, 40, 40, 0.12)' : 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Realistic Corrugated Galvanized Tin with Weathered Patina & Rust Streaks (মরিচা ও টিনের খাঁজ)
  createRusticTinRoofTexture: function() {
    const cacheKey = 'rustic_tin_roof';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base zinc galvanized grey
    ctx.fillStyle = '#7a8289';
    ctx.fillRect(0, 0, 256, 256);

    // Vertical corrugation waves
    const waveW = 16;
    for (let x = 0; x < 256; x += waveW) {
      const g = ctx.createLinearGradient(x, 0, x + waveW, 0);
      g.addColorStop(0, '#43494e');   // deep trough shadow
      g.addColorStop(0.2, '#6d747b');
      g.addColorStop(0.5, '#c5ced6'); // sharp crest metallic highlight
      g.addColorStop(0.8, '#828991');
      g.addColorStop(1, '#43494e');   // trough shadow
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, waveW, 256);
    }

    // Galvanized zinc crystal spangles (দস্তার ফুল)
    for (let i = 0; i < 1200; i++) {
      const px = Math.random() * 256;
      const py = Math.random() * 256;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(235, 242, 248, 0.35)' : 'rgba(50, 60, 68, 0.25)';
      ctx.fillRect(px, py, Math.random() * 4 + 1, Math.random() * 4 + 1);
    }

    // Vertical rust water streaks (মরিচার দাগ running down slopes)
    for (let i = 0; i < 18; i++) {
      const rx = Math.random() * 256;
      const rw = Math.random() * 10 + 4;
      const rLen = Math.random() * 180 + 70;
      const rustGrad = ctx.createLinearGradient(rx, 0, rx, rLen);
      rustGrad.addColorStop(0, 'rgba(148, 62, 28, 0.85)');
      rustGrad.addColorStop(0.4, 'rgba(180, 85, 35, 0.6)');
      rustGrad.addColorStop(1, 'rgba(120, 50, 20, 0.05)');
      ctx.fillStyle = rustGrad;
      ctx.fillRect(rx, Math.random() * 40, rw, rLen);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Ringed Palm Trunk Bark Texture (নারিকেল ও সুপারি গাছের বাকল)
  createPalmTrunkTexture: function(isCoconut = true) {
    const cacheKey = `palm_trunk_${isCoconut}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = isCoconut ? '#524334' : '#635848';
    ctx.fillRect(0, 0, 128, 256);

    // Annular ring marks (গাছের রিং বা খাঁজ)
    const ringGap = isCoconut ? 18 : 12;
    for (let y = 0; y < 256; y += ringGap) {
      ctx.fillStyle = 'rgba(25, 18, 12, 0.65)';
      ctx.fillRect(0, y, 128, 3);
      ctx.fillStyle = 'rgba(150, 130, 105, 0.4)';
      ctx.fillRect(0, y + 3, 128, 2);
    }

    // Vertical bark grooves
    for (let i = 0; i < 700; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(30, 20, 15, 0.35)' : 'rgba(140, 120, 95, 0.2)';
      ctx.fillRect(Math.random() * 128, Math.random() * 256, 1.5, Math.random() * 10 + 4);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Banana Plant Large Paddle Leaf Texture with Central Midrib (কলার পাতা)
  createBananaLeafTexture: function() {
    const cacheKey = 'banana_leaf';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Lush tropical green leaf base
    const grad = ctx.createLinearGradient(0, 0, 128, 0);
    grad.addColorStop(0, '#2e6b18');
    grad.addColorStop(0.48, '#418a22');
    grad.addColorStop(0.5, '#76b830');
    grad.addColorStop(0.52, '#418a22');
    grad.addColorStop(1, '#2e6b18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 256);

    // Lateral parallel veins radiating outward
    ctx.strokeStyle = 'rgba(20, 55, 10, 0.35)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 256; y += 6) {
      ctx.beginPath();
      ctx.moveTo(64, y);
      ctx.lineTo(0, y - 8);
      ctx.moveTo(64, y);
      ctx.lineTo(128, y - 8);
      ctx.stroke();
    }

    // Prominent yellow-green midrib line down center
    ctx.strokeStyle = '#93cf3c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(64, 0);
    ctx.lineTo(64, 256);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Compacted Earthen Courtyard Texture (লেপা মাটির উঠান)
  createCourtyardSoilTexture: function() {
    const cacheKey = 'courtyard_soil';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Smooth warm clay ochre base
    ctx.fillStyle = '#7a5a3a';
    ctx.fillRect(0, 0, 256, 256);

    // Broom swept pattern (ঝাড়ুর দাগ)
    for (let y = 0; y < 256; y += 6) {
      ctx.strokeStyle = 'rgba(85, 60, 36, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(80, y + 3, 170, y - 3, 256, y);
      ctx.stroke();
    }

    // Dry clay speckles
    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(165, 130, 90, 0.25)' : 'rgba(60, 42, 24, 0.35)';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Weathered Timber / Bamboo Node Texture
  createWeatheredWoodTexture: function() {
    const cacheKey = 'weathered_wood';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#4a3828';
    ctx.fillRect(0, 0, 128, 256);

    // Wood grain lines
    for (let x = 0; x < 128; x += 4) {
      ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(25, 18, 12, 0.5)' : 'rgba(110, 85, 60, 0.35)';
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (Math.random() - 0.5) * 6, 256);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Murky Rural Bengal Pond Water Texture (গাঢ় সবুজ-বাদামি পুকুরের জল)
  createRuralWaterTexture: function() {
    const cacheKey = 'rural_water';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Deep rich greenish-brown murky pond water
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#1c3d2e');
    grad.addColorStop(0.5, '#244534');
    grad.addColorStop(1, '#1b3826');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Algae patches and silt swirls
    for (let i = 0; i < 40; i++) {
      const ax = Math.random() * 256;
      const ay = Math.random() * 256;
      const ar = Math.random() * 28 + 10;
      const aGrad = ctx.createRadialGradient(ax, ay, 2, ax, ay, ar);
      aGrad.addColorStop(0, 'rgba(45, 85, 40, 0.4)');
      aGrad.addColorStop(1, 'rgba(25, 55, 35, 0)');
      ctx.fillStyle = aGrad;
      ctx.beginPath();
      ctx.arc(ax, ay, ar, 0, Math.PI * 2);
      ctx.fill();
    }

    // Soft water caustic ripples
    ctx.lineWidth = 1.8;
    for (let y = 8; y < 256; y += 14) {
      ctx.strokeStyle = 'rgba(125, 205, 160, 0.22)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        64, y + (Math.sin(y * 0.1) * 8),
        192, y - (Math.sin(y * 0.1) * 8),
        256, y
      );
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Weathered RHD/LGED Culvert Concrete Texture with Dirt Streaks & Algae (কালভার্ট ব্রিজের পুরনো কংক্রিট)
  createWeatheredConcreteTexture: function() {
    const cacheKey = 'weathered_concrete';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base concrete grey with warmth
    ctx.fillStyle = '#827f77';
    ctx.fillRect(0, 0, 256, 256);

    // Aggregate pebble noise
    for (let i = 0; i < 4500; i++) {
      const px = Math.random() * 256;
      const py = Math.random() * 256;
      const shade = Math.floor(100 + Math.random() * 50);
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(${shade}, ${shade}, ${shade}, 0.35)` : 'rgba(60, 55, 50, 0.4)';
      ctx.fillRect(px, py, 2, 2);
    }

    // Vertical rainwater runoff stains (বৃষ্টির পানির দাগ)
    for (let x = 10; x < 256; x += 18) {
      if (Math.random() > 0.4) {
        const strGrad = ctx.createLinearGradient(x, 0, x, 256);
        strGrad.addColorStop(0, 'rgba(50, 45, 38, 0.5)');
        strGrad.addColorStop(0.7, 'rgba(65, 60, 52, 0.3)');
        strGrad.addColorStop(1, 'rgba(40, 60, 35, 0.6)'); // greenish algae near waterline
        ctx.fillStyle = strGrad;
        ctx.fillRect(x - 2, 0, Math.random() * 6 + 3, 256);
      }
    }

    // Subtle surface hairline cracks
    ctx.strokeStyle = 'rgba(40, 35, 30, 0.55)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      let cx = Math.random() * 256;
      let cy = Math.random() * 256;
      ctx.moveTo(cx, cy);
      for (let s = 0; s < 3; s++) {
        cx += (Math.random() - 0.5) * 30;
        cy += Math.random() * 25 + 5;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Natural Bamboo Culm / Slats Texture (বাঁশের কাঠি ও সাঁকোর চ্যাটাই)
  createBambooMatTexture: function() {
    const cacheKey = 'bamboo_mat';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Natural golden bamboo tones
    ctx.fillStyle = '#b89f62';
    ctx.fillRect(0, 0, 128, 256);

    // Longitudinal bamboo strips
    const stripW = 16;
    for (let x = 0; x < 128; x += stripW) {
      const colVar = Math.floor((Math.random() - 0.5) * 25);
      ctx.fillStyle = `rgb(${185 + colVar}, ${160 + colVar}, ${98 + Math.floor(colVar * 0.7)})`;
      ctx.fillRect(x, 0, stripW - 2, 256);

      // Bamboo culm striations
      for (let s = 1; s < stripW - 2; s += 3) {
        ctx.fillStyle = 'rgba(90, 70, 30, 0.15)';
        ctx.fillRect(x + s, 0, 1, 256);
      }

      // Bamboo nodes/joints (বাঁশের গিট)
      for (let y = (x % 3) * 20 + 35; y < 256; y += 75) {
        ctx.fillStyle = 'rgba(75, 52, 22, 0.75)';
        ctx.fillRect(x, y - 2, stripW - 2, 4);
        ctx.fillStyle = 'rgba(235, 215, 160, 0.6)';
        ctx.fillRect(x, y + 2, stripW - 2, 2);
      }

      // Slit gap between slats
      ctx.fillStyle = 'rgba(40, 28, 14, 0.85)';
      ctx.fillRect(x + stripW - 2, 0, 2, 256);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  },

  // Alluvial River Silt & Dark Muddy Bank Texture (পুকুর ও খালের কাদামাটি)
  createMudBankTexture: function() {
    const cacheKey = 'mud_bank';
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Wet dark fertile clay base
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#423223');
    grad.addColorStop(0.5, '#352518');
    grad.addColorStop(1, '#23180f'); // wet alluvial mud at waterline
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Mud crackles and silt patterns
    for (let i = 0; i < 2800; i++) {
      const mx = Math.random() * 256;
      const my = Math.random() * 256;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(85, 65, 45, 0.35)' : 'rgba(20, 14, 8, 0.45)';
      ctx.fillRect(mx, my, 2, 2);
    }

    // Patches of fine green moss/slime near moisture
    for (let i = 0; i < 25; i++) {
      const rx = Math.random() * 256;
      const ry = Math.random() * 128 + 128;
      const rg = ctx.createRadialGradient(rx, ry, 2, rx, ry, 18);
      rg.addColorStop(0, 'rgba(55, 80, 28, 0.45)');
      rg.addColorStop(1, 'rgba(55, 80, 28, 0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(rx, ry, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache[cacheKey] = texture;
    return texture;
  }
};

