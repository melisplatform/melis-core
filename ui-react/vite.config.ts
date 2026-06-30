import { defineConfig } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Backend Melis (Laminas) à proxifier. Par défaut le vhost local dev.local.
// Surchargeable via MELIS_TARGET (ex: MELIS_TARGET=http://localhost npm run dev).
const MELIS_TARGET = process.env.MELIS_TARGET ?? 'http://dev.local'

// Optional: override the outgoing Host header sent to the backend. Needed when proxying to a
// Melis instance served on a NON-standard port (e.g. a parallel stack on :8081): Melis' domain
// routing infinite-redirects when the Host carries a port, so we present a port-less host
// (e.g. MELIS_PROXY_HOST=localhost). Unset → default behaviour (changeOrigin sets Host = target).
const MELIS_PROXY_HOST = process.env.MELIS_PROXY_HOST

// Root of the Melis project. ui-react now lives at
// vendor/melisplatform/melis-core/ui-react/, so the skeleton root is 4 levels up
// (ui-react → melis-core → melisplatform → vendor → root).
const MELIS_ROOT = path.resolve(import.meta.dirname, '..', '..', '..', '..')

const MIME: Record<string, string> = {
  css: 'text/css; charset=utf-8',
  js:  'application/javascript; charset=utf-8',
  gif: 'image/gif', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  svg: 'image/svg+xml', ico: 'image/x-icon', webp: 'image/webp',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf',
  eot: 'application/vnd.ms-fontobject',
  map: 'application/json',
}

/**
 * Parse config/melis.modules.path.php (simple PHP array on the host filesystem)
 * to build a ModuleName → absolute-vendor-path map.
 * Falls back to empty map if the file doesn't exist yet.
 */
function loadModulePaths(): Record<string, string> {
  const file = path.join(MELIS_ROOT, 'config', 'melis.modules.path.php')
  try {
    const src = fs.readFileSync(file, 'utf-8')
    const map: Record<string, string> = {}
    for (const [, name, rel] of src.matchAll(/'([A-Za-z0-9]+)'\s*=>\s*'([^']+)'/g)) {
      // rel is like '/vendor/melisplatform/melis-core' or '/module/MelisReactApi'
      map[name] = path.join(MELIS_ROOT, rel)
    }
    return map
  } catch {
    return {}
  }
}

/**
 * Vite dev plugin: serves Melis module static assets directly from vendor/
 * instead of proxying through Docker → Apache → PHP.
 *
 * /ModuleName/path/file.ext → {moduleDir}/public/path/file.ext
 *
 * Cuts bundle.js load time from minutes (via PHP) to <1 s (direct disk read).
 * Falls through to the proxy for any path not found on disk.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function melisModuleAssetsPlugin(): any {
  let modulePaths: Record<string, string> = {}

  return {
    name: 'melis-module-assets',
    apply: 'serve',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configureServer(server: any) {
      modulePaths = loadModulePaths()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      server.middlewares.use((req: any, res: any, next: () => void) => {
        const url = (req.url ?? '').split('?')[0]

        // Match /ModuleName/rest  (e.g. /MelisCore/build/js/bundle.js)
        const m = url.match(/^\/([A-Z][A-Za-z0-9]+)(\/[^\s?].*)$/)
        if (!m) return next()

        const [, moduleName, relFile] = m
        const moduleDir = modulePaths[moduleName]
        if (!moduleDir) return next()

        const fullPath = path.join(moduleDir, 'public', relFile)

        // Security: reject path traversal
        const vendorRoot = path.join(MELIS_ROOT, 'vendor', 'melisplatform')
        const moduleRoot = path.join(MELIS_ROOT, 'module')
        if (!fullPath.startsWith(vendorRoot) && !fullPath.startsWith(moduleRoot)) return next()

        let stat: fs.Stats
        try { stat = fs.statSync(fullPath) } catch { return next() }
        if (!stat.isFile()) return next()

        const ext = path.extname(fullPath).slice(1).toLowerCase()
        res.writeHead(200, {
          'Content-Type': MIME[ext] ?? 'application/octet-stream',
          'Content-Length': stat.size,
          'Cache-Control': 'public, max-age=86400',
        })
        const stream = fs.createReadStream(fullPath)
        stream.on('error', () => { res.statusCode = 500; res.end() })
        stream.pipe(res)
      })
    },
  }
}

// When MELIS_PROXY_HOST is set, force the outgoing Host header on every proxy rule (overrides
// changeOrigin, which would otherwise set Host to target host:port). No-op when unset.
const hostOverride = MELIS_PROXY_HOST
  ? {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      configure: (proxy: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        proxy.on('proxyReq', (proxyReq: any) => proxyReq.setHeader('host', MELIS_PROXY_HOST))
      },
    }
  : {}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Dev server runs at localhost root (base '/'). The production build is served
  // by MelisAssetManager at /MelisCore/ui-react/, so the asset base must match.
  base: command === 'build' ? (process.env.VITE_BASE_URL ?? '/MelisCore/ui-react/') : '/',
  plugins: [react(), tailwindcss(), melisModuleAssetsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    // Emit straight into MelisCore's public/ so MelisAssetManager serves the SPA
    // at /MelisCore/ui-react/. Replaces the old dist/ → public/ui-react rsync step.
    outDir: path.resolve(import.meta.dirname, '..', 'public', 'ui-react'),
    emptyOutDir: true,
  },
  define: {
    // Accessible dans le code frontend comme __MELIS_ORIGIN__ (voir src/env.d.ts).
    __MELIS_ORIGIN__: JSON.stringify(MELIS_TARGET),
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: ['dev.local'],
    // Proxy → backend Laminas.
    // - /melis          : routes back-office, auth, react-api
    // - /assets         : public assets servis par le backend (css/schemes.css, images…)
    // - ^/Melis[A-Z]    : assets des modules — fallback si non trouvé dans vendor/ (plugin ci-dessus)
    // - ^/melis-        : assets des packages lowercase
    proxy: {
      // Must come before the generic /melis rule — Vite matches in order.
      // The browser's <iframe src> does not send X-Requested-With, but Melis
      // requires it to bypass the CMS page interceptor and reach the back-office
      // controller. We inject it here at the proxy layer.
      '/melis/react-tool-page': {
        target: MELIS_TARGET,
        changeOrigin: true,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        ...hostOverride,
      },
      '/melis': { target: MELIS_TARGET, changeOrigin: true, ...hostOverride },
      '/assets': { target: MELIS_TARGET, changeOrigin: true, ...hostOverride },
      '^/Melis[A-Z]': { target: MELIS_TARGET, changeOrigin: true, ...hostOverride },
      '^/melis-': { target: MELIS_TARGET, changeOrigin: true, ...hostOverride },
    },
  },
}))
