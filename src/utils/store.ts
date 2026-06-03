import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const rootDir = path.resolve(os.homedir(), './.jie')

if (!fs.existsSync(rootDir))
  fs.mkdirSync(rootDir)

const versionPath = path.resolve(rootDir, './version.json')
const oldVersionPath = path.resolve(rootDir, './version.txt')

export interface VersionCache {
  latestVersion: string
  lastSuccessAt: number
  lastAttemptAt: number
}

export function saveVersionCache(cache: VersionCache): void {
  fs.writeFileSync(versionPath, JSON.stringify(cache))
}

export function getVersionCache(): VersionCache | null {
  try {
    if (fs.existsSync(versionPath)) {
      const raw = fs.readFileSync(versionPath, 'utf-8').trim()
      const data = JSON.parse(raw)
      if (typeof data === 'string')
        return { latestVersion: data, lastSuccessAt: 0, lastAttemptAt: 0 }
      return data as VersionCache
    }

    // 从旧 version.txt 迁移
    if (fs.existsSync(oldVersionPath)) {
      const ver = fs.readFileSync(oldVersionPath, 'utf-8').trim()
      try {
        fs.unlinkSync(oldVersionPath)
      }
      catch {}
      if (ver) {
        const cache: VersionCache = { latestVersion: ver, lastSuccessAt: Date.now(), lastAttemptAt: Date.now() }
        saveVersionCache(cache)
        return cache
      }
    }

    return null
  }
  catch {
    return null
  }
}

export function clearVersion(): void {
  try {
    fs.unlinkSync(versionPath)
  }
  catch {}
  try {
    fs.unlinkSync(oldVersionPath)
  }
  catch {}
}
