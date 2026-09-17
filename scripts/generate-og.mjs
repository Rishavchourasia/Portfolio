/**
 * Regenerates public/og.jpg — the 1200x630 card shown when the site is shared.
 *
 * Canvas text needs a real browser to rasterise, so this opens a local page
 * that draws the card and POSTs it back here. Content comes from
 * src/content/profile.json, so the card stays in step with the site.
 *
 *   npm run og
 */
import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const OUT = resolve(root, 'public/og.jpg')
const PORT = 5199
const TIMEOUT_MS = 60_000

const profile = JSON.parse(await readFile(resolve(root, 'src/content/profile.json'), 'utf8'))

const params = new URLSearchParams({
  name: profile.name,
  role: profile.role,
  line2: 'crafting interfaces',
  skills: 'React  ·  TypeScript  ·  Accessibility  ·  Performance',
  port: String(PORT),
})

const server = createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'access-control-allow-origin': '*' }).end()
    return
  }
  if (req.method !== 'POST') {
    res.writeHead(405).end()
    return
  }

  const chunks = []
  req.on('data', (chunk) => chunks.push(chunk))
  req.on('end', async () => {
    const image = Buffer.concat(chunks)
    await writeFile(OUT, image)
    res.writeHead(204, { 'access-control-allow-origin': '*' }).end()
    console.log(`✓ wrote public/og.jpg (${Math.round(image.length / 1024)} KB)`)
    server.close()
    process.exit(0)
  })
})

server.listen(PORT, () => {
  const url = `file://${resolve(here, 'og.html')}#${params}`
  console.log('Waiting for the browser to render the card…')

  const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
  spawn(opener, [url], { stdio: 'ignore', detached: true, shell: process.platform === 'win32' }).unref()
})

setTimeout(() => {
  console.error('Timed out waiting for the browser. Open scripts/og.html manually.')
  server.close()
  process.exit(1)
}, TIMEOUT_MS)
