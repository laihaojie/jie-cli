import chalk from 'chalk'
import { author, homepage, name, version } from '../../package.json'
import { localServer } from '../config'

export function info() {
  const urlObj = new URL(localServer)

  const infoStr = `
包名称：${chalk.green(name)}
npm地址：${chalk.green(`https://www.npmjs.com/package/${name}`)}
仓库地址：${chalk.green(homepage)}
版本：${chalk.green(version)}
服务端口：${chalk.green(urlObj.port)}
GitHub：${chalk.green(`https://github.com/${author}`)}
  `.trim()
  console.log(`${infoStr}\n`)
}
