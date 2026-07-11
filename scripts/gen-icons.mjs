// Gera os ícones PNG do PWA sem dependências externas.
// Desenha o motivo "crosshair biotech" em ciano sobre fundo escuro.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '..', 'public')
mkdirSync(publicDir, { recursive: true })

const BG = [5, 8, 15]
const CYAN = [34, 211, 238]

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

function encodePNG(size, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0 // filter none
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ])
}

function blend(dst, i, color, alpha) {
  dst[i] = Math.round(dst[i] * (1 - alpha) + color[0] * alpha)
  dst[i + 1] = Math.round(dst[i + 1] * (1 - alpha) + color[1] * alpha)
  dst[i + 2] = Math.round(dst[i + 2] * (1 - alpha) + color[2] * alpha)
  dst[i + 3] = 255
}

// Cobertura anti-aliased de um anel (ring) por supersampling leve.
function ringCoverage(px, py, cx, cy, rOuter, rInner) {
  let hits = 0
  const S = 3
  for (let sx = 0; sx < S; sx++) {
    for (let sy = 0; sy < S; sy++) {
      const dx = px + (sx + 0.5) / S - cx
      const dy = py + (sy + 0.5) / S - cy
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d <= rOuter && d >= rInner) hits++
    }
  }
  return hits / (S * S)
}

function discCoverage(px, py, cx, cy, r) {
  let hits = 0
  const S = 3
  for (let sx = 0; sx < S; sx++) {
    for (let sy = 0; sy < S; sy++) {
      const dx = px + (sx + 0.5) / S - cx
      const dy = py + (sy + 0.5) / S - cy
      if (Math.sqrt(dx * dx + dy * dy) <= r) hits++
    }
  }
  return hits / (S * S)
}

function makeIcon(size) {
  const px = Buffer.alloc(size * size * 4)
  // fundo
  for (let i = 0; i < size * size; i++) {
    px[i * 4] = BG[0]
    px[i * 4 + 1] = BG[1]
    px[i * 4 + 2] = BG[2]
    px[i * 4 + 3] = 255
  }
  const c = size / 2
  const outerR = size * 0.37
  const ringW = size * 0.055
  const midR = size * 0.22
  const midW = size * 0.03
  const dotR = size * 0.085
  const tickLen = size * 0.09
  const tickW = size * 0.045

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      // anel externo
      let a = ringCoverage(x, y, c, c, outerR, outerR - ringW)
      if (a > 0) blend(px, i, CYAN, a * 0.9)
      // anel médio
      a = ringCoverage(x, y, c, c, midR, midR - midW)
      if (a > 0) blend(px, i, CYAN, a * 0.5)
      // ponto central
      a = discCoverage(x, y, c, c, dotR)
      if (a > 0) blend(px, i, CYAN, a)
      // ticks (crosshair) nas 4 direções
      const nearV = Math.abs(x - c) <= tickW / 2
      const nearH = Math.abs(y - c) <= tickW / 2
      if (nearV) {
        if (y >= c - outerR - tickLen && y <= c - outerR) blend(px, i, CYAN, 0.9)
        if (y >= c + outerR && y <= c + outerR + tickLen) blend(px, i, CYAN, 0.9)
      }
      if (nearH) {
        if (x >= c - outerR - tickLen && x <= c - outerR) blend(px, i, CYAN, 0.9)
        if (x >= c + outerR && x <= c + outerR + tickLen) blend(px, i, CYAN, 0.9)
      }
    }
  }
  return encodePNG(size, px)
}

const targets = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180]
]

for (const [name, size] of targets) {
  const png = makeIcon(size)
  writeFileSync(resolve(publicDir, name), png)
  console.log('wrote', name, size)
}
