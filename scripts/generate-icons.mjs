/**
 * Generates the PNG icons used by the web app manifest and by iOS
 * ("apple-touch-icon"). The drawing mirrors the inline SVG favicon so the
 * browser tab, the home-screen icon and the splash screen all match.
 *
 * The script is dependency-free: shapes are rasterised by hand and the PNG
 * container is written with `node:zlib`.
 *
 * Usage: npm run icons
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const OUTPUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../public/icons");

/** Design space: the 64×64 viewBox of the SVG favicon. */
const DESIGN_SIZE = 64;

const BACKGROUND = [0x05, 0x06, 0x0a];
const WHITE = [0xff, 0xff, 0xff];
const RED = [0xff, 0x1f, 0x2d];
const BLUE = [0x1f, 0x6b, 0xff];

const ICONS = [
  { file: "icon-192.png", size: 192, contentScale: 0.88, rounded: true },
  { file: "icon-512.png", size: 512, contentScale: 0.88, rounded: true },
  // Maskable icons are cropped to a circle on Android, so the artwork has to
  // stay inside the inner 80% and the background has to bleed to the edges.
  { file: "icon-maskable-512.png", size: 512, contentScale: 0.72, rounded: false },
  // iOS applies its own rounded mask to the touch icon.
  { file: "apple-touch-icon.png", size: 180, contentScale: 0.86, rounded: false },
];

/** Returns true when (x, y) is inside a rect with rounded corners. */
function roundedRect(x, y, width, height, radius) {
  return (px, py) => {
    if (px < x || py < y || px > x + width || py > y + height) return false;
    const cx = Math.min(Math.max(px, x + radius), x + width - radius);
    const cy = Math.min(Math.max(py, y + radius), y + height - radius);
    const dx = px - cx;
    const dy = py - cy;
    return dx * dx + dy * dy <= radius * radius;
  };
}

/** Returns true when (x, y) is inside a thick line with round caps. */
function capsule(x1, y1, x2, y2, width) {
  const radius = width / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;

  return (px, py) => {
    const t = Math.min(1, Math.max(0, ((px - x1) * dx + (py - y1) * dy) / lengthSquared));
    const qx = px - (x1 + t * dx);
    const qy = py - (y1 + t * dy);
    return qx * qx + qy * qy <= radius * radius;
  };
}

/**
 * Layers of the icon, in painting order. Coordinates are taken from the
 * favicon SVG: a white hanger, a red and a blue lamp, and a white base bar.
 */
const SHAPES = [
  { color: WHITE, contains: capsule(32, 10, 32, 20.5, 4) },
  { color: RED, contains: roundedRect(9, 22, 21, 28, 5) },
  { color: BLUE, contains: roundedRect(34, 22, 21, 28, 5) },
  { color: WHITE, contains: roundedRect(21, 52.5, 22, 4, 2) },
];

/**
 * Maps a point in the icon's 64-unit design space to an RGBA colour, or to
 * `null` for transparent pixels (only the rounded "any" icons have corners).
 */
function createSampler({ contentScale, rounded }) {
  const half = DESIGN_SIZE / 2;
  const corner = rounded ? roundedRect(0, 0, DESIGN_SIZE, DESIGN_SIZE, 14) : null;

  return (x, y) => {
    // Shrink the artwork around the centre so maskable icons survive cropping.
    const dx = half + (x - half) / contentScale;
    const dy = half + (y - half) / contentScale;

    if (corner && !corner(dx, dy)) return null;

    let color = BACKGROUND;
    for (const shape of SHAPES) {
      if (shape.contains(dx, dy)) color = shape.color;
    }
    return color;
  };
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const name = Buffer.from(type, "ascii");
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

function encodePng(size, rgba) {
  const stride = 1 + size * 4;
  const raw = Buffer.alloc(size * stride);
  for (let y = 0; y < size; y += 1) {
    // Filter type 0 (none) for every scanline.
    rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // colour type: RGBA
  header[10] = 0; // deflate
  header[11] = 0; // adaptive filtering
  header[12] = 0; // no interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Rasterises one icon with box-filtered supersampling. */
function renderIcon(size, options) {
  const samplesPerAxis = size <= 256 ? 4 : 3;
  const scale = size * samplesPerAxis;
  const sampler = createSampler(options);
  const rgba = Buffer.alloc(size * size * 4);
  const sampleCount = samplesPerAxis * samplesPerAxis;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let red = 0;
      let green = 0;
      let blue = 0;
      let coverage = 0;

      for (let sy = 0; sy < samplesPerAxis; sy += 1) {
        for (let sx = 0; sx < samplesPerAxis; sx += 1) {
          const u = ((x * samplesPerAxis + sx + 0.5) / scale) * DESIGN_SIZE;
          const v = ((y * samplesPerAxis + sy + 0.5) / scale) * DESIGN_SIZE;
          const color = sampler(u, v);
          if (!color) continue;
          red += color[0];
          green += color[1];
          blue += color[2];
          coverage += 1;
        }
      }

      if (coverage === 0) continue;

      const offset = (y * size + x) * 4;
      rgba[offset] = Math.round(red / coverage);
      rgba[offset + 1] = Math.round(green / coverage);
      rgba[offset + 2] = Math.round(blue / coverage);
      rgba[offset + 3] = Math.round((coverage / sampleCount) * 255);
    }
  }

  return encodePng(size, rgba);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const icon of ICONS) {
  const png = renderIcon(icon.size, icon);
  writeFileSync(resolve(OUTPUT_DIR, icon.file), png);
  console.log(`${icon.file.padEnd(24)} ${icon.size}×${icon.size}  ${png.length} B`);
}
