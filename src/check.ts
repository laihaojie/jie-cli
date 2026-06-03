import https from 'node:https'
import { getVersionCache, saveVersionCache } from './utils/store'

const REGISTRY_URL = 'https://registry.npmjs.org/@djie%2Fcli/latest'
const TIMEOUT = 5000

function fetchLatestVersion(): Promise<string | null> {
  return new Promise((resolve) => {
    const req = https.get(REGISTRY_URL, { timeout: TIMEOUT }, (res) => {
      if (res.statusCode !== 200) {
        res.resume()
        resolve(null)
        return
      }
      let data = ''
      res.on('data', (chunk: string) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          const pkg = JSON.parse(data)
          resolve(pkg.version || null)
        }
        catch {
          resolve(null)
        }
      })
    })
    req.on('error', () => resolve(null))
    req.on('timeout', () => {
      req.destroy()
      resolve(null)
    })
  })
}

async function main() {
  const now = Date.now()
  const latest = await fetchLatestVersion()

  if (latest) {
    saveVersionCache({
      latestVersion: latest,
      lastSuccessAt: now,
      lastAttemptAt: now,
    })
  }
  else {
    // 失败时只更新 lastAttemptAt，不污染 latestVersion
    const cache = getVersionCache()
    saveVersionCache({
      latestVersion: cache?.latestVersion || '',
      lastSuccessAt: cache?.lastSuccessAt || 0,
      lastAttemptAt: now,
    })
  }
}

main()
