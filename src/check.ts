import { runCmdGetRes } from './utils/run'
import { saveVersion } from './utils/store'

const latest_version = runCmdGetRes('npm view @djie/cli version')
saveVersion(latest_version)
