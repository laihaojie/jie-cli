import { execSync } from 'node:child_process'
import { saveVersion } from './utils/store'

const latest_version = execSync('npm view @djie/cli version', { stdio: 'pipe' }).toString().trim()
saveVersion(latest_version)
