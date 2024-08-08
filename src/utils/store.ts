import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const rootDir = path.resolve(os.homedir(), './.jie')

if (!fs.existsSync(rootDir))
  fs.mkdirSync(rootDir)

const versionPath = path.resolve(os.homedir(), './.jie/version.txt')

export function saveVersion(token: string): string {
  fs.writeFileSync(versionPath, token)
  return token
}

export function getVersion(): string {
  if (!fs.existsSync(versionPath))
    return ''

  return fs.readFileSync(versionPath, 'utf-8')
}

export function clearVersion(): void {
  fs.unlinkSync(versionPath)
}
