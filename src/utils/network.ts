import { networkInterfaces } from 'node:os'

// 获取本机局域网 IPv4 地址列表（排除回环地址）
export function getLanIpv4Addresses(): string[] {
  const ifaces = networkInterfaces()
  const result: string[] = []
  for (const name in ifaces) {
    for (const iface of ifaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal)
        result.push(iface.address)
    }
  }
  return result
}
