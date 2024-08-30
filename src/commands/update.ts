import { execSync } from 'node:child_process'

export function update() {
  execSync('npm install -g @djie/cli@latest', { stdio: 'inherit' })
}
