import process from 'node:process'
import { runCmdSync } from './run'

export function openInBrowser(url) {
  const cmd = process.platform === 'win32' ? `start '${url}'` : `open '${url}'`
  runCmdSync(cmd)
}
