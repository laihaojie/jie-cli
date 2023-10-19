import { execSync } from 'node:child_process'

export function update() {
  execSync('jie -v', { stdio: 'inherit' })
  execSync('pnpm install -g @djie/cli', { stdio: 'inherit' })
  execSync('jie -v', { stdio: 'inherit' })
}
