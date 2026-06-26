import { execSync } from 'node:child_process'
import { statfsSync } from 'node:fs'
import { get } from 'node:https'
import { arch, cpus, freemem, hostname, networkInterfaces, release, totalmem, type, uptime, userInfo } from 'node:os'
import process from 'node:process'
import chalk from 'chalk'
import Table from 'cli-table3'
import { author, homepage, name, version } from '../../package.json'
import { localServer } from '../config'
import { getLanIpv4Addresses } from '../utils/network'
import { isAuthEnabled } from './server'

function formatBytes(bytes: number) {
  const gb = bytes / 1024 / 1024 / 1024
  return `${gb.toFixed(2)} GB`
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const parts: string[] = []
  if (days > 0) parts.push(`${days}天`)
  if (hours > 0) parts.push(`${hours}小时`)
  if (mins > 0) parts.push(`${mins}分钟`)
  return parts.join(' ') || '刚刚启动'
}

function getOSName() {
  switch (process.platform) {
    case 'win32':
      return `Windows ${release()}`
    case 'darwin':
      return `macOS ${release()}`
    case 'linux':
      return `Linux ${release()}`
    default:
      return `${type()} ${release()}`
  }
}

function getNetworkInfo() {
  const interfaces = networkInterfaces()
  const ips = getLanIpv4Addresses()
  let mac = ''
  for (const iface of Object.values(interfaces)) {
    if (!iface) continue
    for (const info of iface) {
      if (!info.internal && info.family === 'IPv4' && !mac && info.mac !== '00:00:00:00:00:00')
        mac = info.mac
    }
  }
  return { ips, mac: mac || '未知' }
}

function getDiskInfo(): string {
  try {
    const stats = statfsSync(process.cwd())
    const total = stats.blocks * stats.bsize
    const available = stats.bavail * stats.bsize
    const used = total - available
    const drive = process.platform === 'win32' ? process.cwd().substring(0, 2) : ''
    return `${drive} 已用 ${formatBytes(used)} / 共 ${formatBytes(total)}`
  }
  catch {
    return '未知'
  }
}

function safeExec(cmd: string): string {
  try {
    return execSync(cmd, { windowsHide: true, stdio: 'pipe', timeout: 5000 }).toString().trim()
  }
  catch {
    return ''
  }
}

function getGPU(): string {
  if (process.platform === 'win32') {
    const raw = safeExec('wmic path win32_VideoController get Name')
    const lines = raw.split('\n').map(l => l.trim()).filter(l => l && l !== 'Name')
    return lines.join(', ') || '未知'
  }
  if (process.platform === 'darwin') {
    const raw = safeExec('system_profiler SPDisplaysDataType')
    const match = raw.match(/Chipset Model:\s*(.+)/)
    return match?.[1]?.trim() || '未知'
  }
  return '未知'
}

function getSystemModel(): string {
  if (process.platform === 'win32') {
    const manufacturer = safeExec('wmic csproduct get Vendor')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && l !== 'Vendor')[0] || ''
    const model = safeExec('wmic csproduct get Name')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && l !== 'Name')[0] || ''
    return `${manufacturer} ${model}`.trim() || '未知'
  }
  if (process.platform === 'darwin') {
    const raw = safeExec('system_profiler SPHardwareDataType')
    const match = raw.match(/Model Name:\s*(.+)/)
    return match?.[1]?.trim() || '未知'
  }
  return '未知'
}

function getBootTime(): string {
  const bootMs = Date.now() - uptime() * 1000
  const d = new Date(bootMs)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function getGitVersion(): string {
  const raw = safeExec('git --version')
  return raw.replace('git version ', '') || '未安装'
}

function getPackageManager(): string {
  const managers = ['pnpm', 'yarn', 'npm']
  const found: string[] = []
  for (const m of managers) {
    const v = safeExec(`${m} --version`)
    if (v)
      found.push(`${m}@${v}`)
  }
  return found.length > 0 ? found.join('  ') : '未安装'
}

function getPublicIP(): Promise<string> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve('获取超时')
    }, 3000)
    get('https://ip.sb/ip', (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        clearTimeout(timer)
        resolve(data.trim() || '获取失败')
      })
    }).on('error', () => {
      clearTimeout(timer)
      resolve('获取失败')
    })
  })
}

function printTable(title: string, rows: [string, string][]) {
  console.log('')
  console.log(chalk.cyan.bold(`  ${title}`))
  const table = new Table({
    style: { 'padding-left': 1, 'padding-right': 1 },
  })
  for (let i = 0; i < rows.length; i += 2) {
    const left = rows[i]
    const right = rows[i + 1]
    if (right)
      table.push([chalk.gray(left[0]), left[1], chalk.gray(right[0]), right[1]])
    else
      table.push([chalk.gray(left[0]), left[1], '', ''])
  }
  console.log(table.toString())
}

export async function info(options: { cli?: boolean, all?: boolean }) {
  const urlObj = new URL(localServer)
  const showAll = options.all
  const showCli = options.cli || showAll

  if (!showCli) {
    const cpuInfo = cpus()
    const cpuModel = cpuInfo[0]?.model || '未知'
    const cpuCores = cpuInfo.length
    const totalMem = totalmem()
    const usedMem = totalMem - freemem()
    const network = getNetworkInfo()
    const user = userInfo()
    const shell = user.shell || process.env.SHELL || process.env.ComSpec || '未知'
    const locale = new Intl.DateTimeFormat().resolvedOptions().locale
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const publicIP = await getPublicIP()

    printTable('本机信息', [
      ['操作系统', chalk.green(getOSName())],
      ['系统型号', chalk.green(getSystemModel())],
      ['主机名', chalk.green(hostname())],
      ['用户名', chalk.green(user.username)],
      ['主目录', chalk.green(user.homedir)],
      ['CPU', chalk.green(`${cpuModel} (${cpuCores}核)`)],
      ['GPU', chalk.green(getGPU())],
      ['CPU架构', chalk.green(arch())],
      ['内存', chalk.green(`已用 ${formatBytes(usedMem)} / 共 ${formatBytes(totalMem)}`)],
      ['磁盘', chalk.green(getDiskInfo())],
      ['运行时间', chalk.green(formatUptime(uptime()))],
      ['开机时间', chalk.green(getBootTime())],
      ['Node.js', chalk.green(process.version)],
      ['Git', chalk.green(getGitVersion())],
      ['包管理器', chalk.green(getPackageManager())],
      ['Shell', chalk.green(shell)],
      ['本机IP', chalk.green(network.ips.length > 0 ? network.ips.join(', ') : '未连接')],
      ['公网IP', chalk.green(publicIP)],
      ['MAC地址', chalk.green(network.mac)],
      ['系统语言', chalk.green(locale)],
      ['时区', chalk.green(timezone)],
      ['当前路径', chalk.green(process.cwd())],
    ])
  }

  if (showCli) {
    const port = urlObj.port
    const ips = getLanIpv4Addresses()
    printTable('CLI 信息', [
      ['包名称', chalk.green(name)],
      ['版本', chalk.green(version)],
      ['npm地址', chalk.green(`https://www.npmjs.com/package/${name}`)],
      ['仓库地址', chalk.green(homepage)],
      ['GitHub', chalk.green(`https://github.com/${author}`)],
      ['服务端口', chalk.green(port)],
      ['服务地址', chalk.green(`http://localhost:${port}`)],
      ['本地 IPv4', chalk.green(ips.length > 0 ? ips.map(ip => `http://${ip}:${port}`).join('\n') : '未连接')],
      ['鉴权', isAuthEnabled() ? chalk.green('已启用（密码）') : chalk.yellow('未启用')],
    ])
  }

  console.log('')
}
