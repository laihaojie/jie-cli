import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import chalk from 'chalk'
import inquirer from 'inquirer'

export async function frp() {
  // 开启内网穿透
  const { port } = await inquirer.prompt([
    {
      type: 'input',
      message: '请输入本地端口号:',
      name: 'port',
    },
  ])
  const frpc_ini_template = `
[common]
server_addr = 47.101.45.132
server_port = 7000

[web]
type = http
local_port = $port
custom_domains = frp.laihaojie.com
`.trim()
  const frpc_ini_path = path.join(__dirname, '../../../frp_packages/frpc.ini')

  fs.writeFileSync(frpc_ini_path, frpc_ini_template.replace(/\$port/, port))
  const osValue = process.platform

  console.log(chalk.blue('打开 http://frp.laihaojie.com  预览'))

  if (osValue === 'darwin') {
    console.log('Mac OS')
  }
  else if (osValue === 'win32') {
    const frpc_win_path = path.join(__dirname, '../../../frp_packages/win/frpc.exe')

    execSync(`${frpc_win_path} -c ${frpc_ini_path}`, { stdio: 'inherit' })
  }
  else if (osValue === 'android') {
    console.log('Android OS')
  }
  else if (osValue === 'linux') {
    console.log('Linux OS')
  }
  else {
    console.log('Other os')
  }
}
