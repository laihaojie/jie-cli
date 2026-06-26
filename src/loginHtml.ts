// 登录页 HTML（已配置鉴权密码时，GET / 无有效会话返回此页）
export function getLoginHtml(errorMessage?: string): string {
  const errorBlock = errorMessage
    ? `<div class="error">${escapeHtml(errorMessage)}</div>`
    : ''
  return `<!DOCTYPE html>
<html lang="zh-CN">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>jie 终端 · 登录</title>
  <style>
    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0; background: #1e1e2e; }
    body { display: flex; align-items: center; justify-content: center; font: 14px/1.5 -apple-system, "Segoe UI", Roboto, sans-serif; }
    .card {
      width: 320px; padding: 28px 24px; border-radius: 10px;
      background: #181825; color: #cdd6f4;
      box-shadow: 0 8px 32px rgba(0,0,0,.4);
    }
    h1 { margin: 0 0 6px; font-size: 18px; color: #f5e0dc; }
    p.sub { margin: 0 0 20px; color: #7f849c; font-size: 12px; }
    label { display: block; margin-bottom: 6px; color: #a6adc8; font-size: 13px; }
    input[type=password] {
      width: 100%; padding: 10px 12px; border-radius: 6px;
      border: 1px solid #313244; background: #11111b; color: #cdd6f4;
      font-size: 14px; outline: none;
    }
    input[type=password]:focus { border-color: #89b4fa; }
    button {
      width: 100%; margin-top: 16px; padding: 10px; border: 0; border-radius: 6px;
      background: #89b4fa; color: #11111b; font-size: 14px; font-weight: 600; cursor: pointer;
    }
    button:hover { background: #b4befe; }
    .error { margin-top: 14px; padding: 8px 10px; border-radius: 6px; background: #3b1d1d; color: #ffb4a8; font-size: 13px; }
  </style>
</head>

<body>
  <form class="card" method="POST" action="/login">
    <h1>jie 局域网终端</h1>
    <p class="sub">请输入访问密码</p>
    <label for="password">密码</label>
    <input id="password" name="password" type="password" autofocus autocomplete="current-password">
    <button type="submit">进入终端</button>
    ${errorBlock}
  </form>
</body>

</html>`
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
  })[c] ?? c)
}
