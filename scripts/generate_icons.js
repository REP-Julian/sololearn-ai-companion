/**
 * Minimalist PNG Generator for Extension Icons (16x16, 48x48, 128x128)
 * Creates sleek gradient-styled icons without external dependencies.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(size, r1 = 14, g1 = 165, b1 = 233, r2 = 168, g2 = 85, b2 = 247) {
  // Width, Height, 8-bit RGBA
  const width = size;
  const height = size;
  const buffer = Buffer.alloc(height * (1 + width * 4));

  let offset = 0;
  for (let y = 0; y < height; y++) {
    buffer[offset++] = 0; // Filter byte (0 = None)
    for (let x = 0; x < width; x++) {
      // Rounded corner distance
      const cx = width / 2;
      const cy = height / 2;
      const radius = size * 0.45;
      const cornerRadius = size * 0.2;

      // Simple box with rounded corners
      const dx = Math.max(0, Math.abs(x - cx) - (cx - cornerRadius));
      const dy = Math.max(0, Math.abs(y - cy) - (cy - cornerRadius));
      const isInside = (dx * dx + dy * dy) <= (cornerRadius * cornerRadius);

      if (isInside) {
        // Gradient from top-left to bottom-right
        const factor = (x + y) / (width + height);
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);

        // Center lightning bolt or glowing shape
        const normX = x / width;
        const normY = y / height;
        const isLightning = (
          (normX > 0.45 && normX < 0.65 && normY > 0.2 && normY < 0.5 && normX + normY > 0.7) ||
          (normX > 0.35 && normX < 0.55 && normY >= 0.5 && normY < 0.8 && normX + normY < 1.3)
        );

        if (isLightning) {
          buffer[offset++] = 255;
          buffer[offset++] = 255;
          buffer[offset++] = 255;
          buffer[offset++] = 255;
        } else {
          buffer[offset++] = r;
          buffer[offset++] = g;
          buffer[offset++] = b;
          buffer[offset++] = 255;
        }
      } else {
        buffer[offset++] = 0;
        buffer[offset++] = 0;
        buffer[offset++] = 0;
        buffer[offset++] = 0;
      }
    }
  }

  const idatData = zlib.deflateSync(buffer);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    const crc = crc32(combined);
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = chunk('IHDR', ihdr);
  const idatChunk = chunk('IDAT', idatData);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Minimal CRC32
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc = crc ^ byte;
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon16.png'), createPng(16));
fs.writeFileSync(path.join(iconsDir, 'icon48.png'), createPng(48));
fs.writeFileSync(path.join(iconsDir, 'icon128.png'), createPng(128));

console.log('Icons generated successfully in ./icons/');
