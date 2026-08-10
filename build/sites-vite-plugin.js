import { access, cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

const staticWorker = `const worker = {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request)
    if (response.status !== 404 || request.method !== 'GET') return response
    const accept = request.headers.get('accept') || ''
    if (!accept.includes('text/html')) return response
    const indexUrl = new URL(request.url)
    indexUrl.pathname = '/index.html'
    return env.ASSETS.fetch(new Request(indexUrl, request))
  },
}

export default worker
`

export function sites() {
  let root = process.cwd()

  return {
    name: 'sites',
    apply: 'build',
    configResolved(config) {
      root = config.root
    },
    async closeBundle() {
      const hostingConfig = resolve(root, '.openai', 'hosting.json')
      const metadataDirectory = resolve(root, 'dist', '.openai')
      const serverDirectory = resolve(root, 'dist', 'server')

      await rm(metadataDirectory, { recursive: true, force: true })
      await mkdir(metadataDirectory, { recursive: true })
      await mkdir(serverDirectory, { recursive: true })
      await writeFile(resolve(serverDirectory, 'index.js'), staticWorker)

      if (await exists(hostingConfig)) {
        await cp(hostingConfig, resolve(metadataDirectory, 'hosting.json'))
      }
    },
  }
}
