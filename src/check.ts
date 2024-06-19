import { saveVersion } from './utils/store'
import { runCmdGetRes } from './utils/run'

const latest_version = runCmdGetRes('npm view @djie/cli version')
saveVersion(latest_version)
