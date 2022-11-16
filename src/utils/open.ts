import { runCmd } from './run'

export function openInBrowser(url) {
  const cmd = process.platform === 'win32' ? `start '${url}'` : `open '${url}'`
  runCmd(cmd)
}
