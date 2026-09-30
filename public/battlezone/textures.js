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
  }
};
