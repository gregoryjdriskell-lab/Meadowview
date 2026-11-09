#!/usr/bin/env node
/**
 * Sprite tooling.
 *   node scripts/sprites.mjs list    -> every sprite id the game uses (+ which are overridden)
 *   node scripts/sprites.mjs check   -> validate public/assets/sprites/sprites.config.json
 *
 * The check verifies ids, file paths, sheet references, frame ranges, and that each
 * sheet's PNG/JPEG dimensions divide evenly into its grid.
 */
import { readFileSync, existsSync, openSync, readSync, closeSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { allSpriteKeys, spriteBox } from '../src/assets/spriteKeys.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const spriteDir = join(root, 'public/assets/sprites')
const configPath = join(spriteDir, 'sprites.config.json')

function readConfig() {
  try {
    return JSON.parse(readFileSync(configPath, 'utf8'))
  } catch (err) {
    console.error(`✖ Could not read ${configPath}: ${err.message}`)
    process.exit(1)
  }
}

/** Width/height from a PNG or JPEG header, or null. */
function imageSize(file) {
  const fd = openSync(file, 'r')
  const buf = Buffer.alloc(64 * 1024)
  const n = readSync(fd, buf, 0, buf.length, 0)
  closeSync(fd)
  if (buf.readUInt32BE(0) === 0x89504e47) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2
    while (i < n) {
      const marker = buf[i + 1]
      const len = buf.readUInt16BE(i + 2)
      if (marker >= 0xc0 && marker <= 0xc3) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
      i += 2 + len
    }
  }
  return null
}

const isRemote = (src) => /^(https?:|data:)/.test(src)
const localPath = (src) => (src.startsWith('/') ? join(root, 'public', src) : join(spriteDir, src))

function list() {
  const { sprites = {} } = readConfig()
  for (const id of allSpriteKeys()) {
    const { width, height } = spriteBox(id)
    const mark = sprites[id] ? '● custom' : '○ vector'
    console.log(`${mark}  ${id.padEnd(24)} aspect ${width}:${height}`)
  }
}

function check() {
  const { sheets = {}, sprites = {} } = readConfig()
  const known = new Set(allSpriteKeys())
  const errors = []
  const warnings = []

  for (const [name, sheet] of Object.entries(sheets)) {
    if (!sheet.src) { errors.push(`sheet "${name}": missing "src"`); continue }
    if (!Number.isInteger(sheet.columns ?? 1) || !Number.isInteger(sheet.rows ?? 1)) errors.push(`sheet "${name}": columns/rows must be integers`)
    if (isRemote(sheet.src)) continue
    const file = localPath(sheet.src)
    if (!existsSync(file)) { errors.push(`sheet "${name}": file not found: ${sheet.src}`); continue }
    const size = imageSize(file)
    if (size) {
      const cols = sheet.columns ?? 1
      const rows = sheet.rows ?? 1
      if (size.width % cols || size.height % rows) {
        warnings.push(`sheet "${name}": ${size.width}x${size.height} does not divide evenly into ${cols}x${rows} frames`)
      }
    }
  }

  for (const [id, entry] of Object.entries(sprites)) {
    if (!known.has(id)) errors.push(`"${id}": unknown sprite id (run \`npm run sprites:list\`)`)
    if (entry.sheet) {
      const sheet = sheets[entry.sheet]
      if (!sheet) { errors.push(`"${id}": unknown sheet "${entry.sheet}"`); continue }
      const cols = sheet.columns ?? 1
      const rows = sheet.rows ?? 1
      const [c, r] = Array.isArray(entry.frame) ? entry.frame : [(entry.frame ?? 0) % cols, Math.floor((entry.frame ?? 0) / cols)]
      if (c >= cols || r >= rows || c < 0 || r < 0) errors.push(`"${id}": frame ${JSON.stringify(entry.frame)} is outside ${cols}x${rows} grid`)
    } else if (entry.src) {
      if (!isRemote(entry.src) && !existsSync(localPath(entry.src))) errors.push(`"${id}": file not found: ${entry.src}`)
    } else {
      errors.push(`"${id}": needs either "src" or "sheet"`)
    }
  }

  warnings.forEach((w) => console.warn(`⚠ ${w}`))
  errors.forEach((e) => console.error(`✖ ${e}`))
  const count = Object.keys(sprites).length
  if (errors.length) process.exit(1)
  console.log(`✔ sprites.config.json OK: ${count} custom sprite(s), ${known.size - count} using vector art`)
}

const cmd = process.argv[2]
if (cmd === 'list') list()
else if (cmd === 'check') check()
else {
  console.log('Usage: node scripts/sprites.mjs <list|check>')
  process.exit(1)
}
