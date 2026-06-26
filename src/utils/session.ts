import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'

// 会话 token：base64url(payload).base64url(hmac)
// secret 进程级随机，重启后所有会话失效（需重新登录）

export const SESSION_COOKIE = 'jie_session'
export const SESSION_MAX_AGE = 2 * 60 * 60 // 秒（2 小时）

let sessionSecret: Buffer

export function initSessionSecret(): void {
  sessionSecret = crypto.randomBytes(32)
}

function b64url(buf: Buffer): string {
  return buf.toString('base64url')
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length)
    return false
  return crypto.timingSafeEqual(ab, bb)
}

// 签发会话 token（有效期 SESSION_MAX_AGE 秒）
export function createSessionToken(): string {
  if (!sessionSecret)
    initSessionSecret()
  const exp = Date.now() + SESSION_MAX_AGE * 1000
  const payload = b64url(Buffer.from(JSON.stringify({ exp })))
  const sig = b64url(crypto.createHmac('sha256', sessionSecret).update(payload).digest())
  return `${payload}.${sig}`
}

// 校验会话 token（HMAC 正确 + 未过期）
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || !sessionSecret)
    return false
  const dot = token.lastIndexOf('.')
  if (dot <= 0)
    return false
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = b64url(crypto.createHmac('sha256', sessionSecret).update(payload).digest())
  if (!timingSafeEqualStr(sig, expected))
    return false
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'))
    return typeof exp === 'number' && exp > Date.now()
  }
  catch {
    return false
  }
}
