const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'binary');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function makePng(width, height, getPixel) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth 8
  ihdrData[9] = 6;  // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = chunk('IHDR', ihdrData);

  const scanlines = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const offset = 1 + x * 4;
      row[offset] = r;
      row[offset + 1] = g;
      row[offset + 2] = b;
      row[offset + 3] = a;
    }
    scanlines.push(row);
  }

  const rawData = Buffer.concat(scanlines);
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

// Distance to line segment
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// Pixel shader for the icon
function renderIconPixel(x, y, w, h, isMaskable = false) {
  // Normalize coords to [-1, 1]
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;
  const r = Math.hypot(nx, ny);

  // Background dark radial gradient
  let bgR = 24, bgG = 32, bgB = 27;
  const radFactor = Math.min(1, Math.hypot(nx, ny - 0.2));
  bgR = Math.round(27 * (1 - radFactor * 0.45));
  bgG = Math.round(36 * (1 - radFactor * 0.45));
  bgB = Math.round(30 * (1 - radFactor * 0.45));

  // If not maskable, round corner squircle
  if (!isMaskable) {
    const p = 4.2;
    const squircle = Math.pow(Math.abs(nx), p) + Math.pow(Math.abs(ny), p);
    if (squircle > 1.0) {
      return [0, 0, 0, 0]; // Transparent outside squircle
    }
  }

  // Draw Shield outline in safe zone (scale down if maskable to fit within central 80%)
  const scale = isMaskable ? 0.72 : 0.85;
  const sx = nx / scale;
  const sy = ny / scale;

  // Key drawing in center
  // Blue key ring center: (-0.3, 0)
  const ringDist = Math.abs(Math.hypot(sx - (-0.28), sy) - 0.22);
  const ringWidth = 0.07;
  if (ringDist < ringWidth) {
    // Blue ring #4285F4
    return [66, 133, 244, 255];
  }

  // Yellow stem: from -0.1 to 0.42 at sy = 0
  const stemDist = distToSegment(sx, sy, -0.12, 0, 0.42, 0);
  if (stemDist < 0.055) {
    // Yellow stem #FBBC05
    return [251, 188, 5, 255];
  }

  // Green tooth: at sx = 0.22, sy from 0 to 0.22
  const greenToothDist = distToSegment(sx, sy, 0.22, 0, 0.22, 0.22);
  if (greenToothDist < 0.055) {
    // Green tooth #34A853
    return [52, 168, 83, 255];
  }

  // Red tooth: at sx = 0.38, sy from 0 to 0.16
  const redToothDist = distToSegment(sx, sy, 0.38, 0, 0.38, 0.16);
  if (redToothDist < 0.055) {
    // Red tooth #EA4335
    return [234, 67, 53, 255];
  }

  // Subtle shield border around the key
  const shieldDist = Math.abs(Math.hypot(sx, sy) - 0.75);
  if (shieldDist < 0.02) {
    return [0, 214, 104, 180];
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve(__dirname, '../public');

console.log('Generating PWA icons in', publicDir);

const sizes = [
  { name: 'pwa-192x192.png', width: 192, height: 192, maskable: false },
  { name: 'pwa-512x512.png', width: 512, height: 512, maskable: false },
  { name: 'pwa-maskable-512x512.png', width: 512, height: 512, maskable: true },
  { name: 'apple-touch-icon.png', width: 180, height: 180, maskable: false },
];

for (const s of sizes) {
  const buf = makePng(s.width, s.height, (x, y, w, h) => renderIconPixel(x, y, w, h, s.maskable));
  fs.writeFileSync(path.join(publicDir, s.name), buf);
  console.log(`Generated ${s.name} (${buf.length} bytes)`);
}

console.log('Done generating icons!');
