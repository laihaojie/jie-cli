# Design: 局域网网页终端远程命令执行

## 架构概览

保留三层入口结构，核心改动集中在 **bridge 后台进程**与 **server 命令**。

```
浏览器(局域网设备)
   │  HTTP GET /            → 终端网页 HTML
   │  HTTP GET /xterm*      → xterm 静态资源(离线)
   │  HTTP GET /health      → 健康检查
   │  WS   /ws              → 终端会话(双向)
   ▼
bridge 后台进程 (dist/bridge.cjs)   监听 0.0.0.0:32677
   │  node-pty spawn 默认 Git Bash
   ▲
   │  detached spawn + 活性检测(/health)
jie 主进程 (startServer 首次拉起时打印访问信息)
```

## 组件设计

### 1. bridge.ts 重写（`src/bridge.ts` → `dist/bridge.cjs`）

单个 `http.createServer`，再用 `ws.WebSocketServer` 共享它（`{ server }`），监听 `0.0.0.0:32677`。

路由：
- `GET /` → 终端 HTML（`Content-Type: text/html`），引用相对路径 `/xterm.js` `/xterm.css` `/addon-fit.js`。
- `GET /health` → `{ ok: true }`，供 `startServer` 活性检测（替换原 `GET /` 的 'jie bridge'）。
- `GET /xterm.js` | `/xterm.css` | `/addon-fit.js` → 读取 `node_modules` 内 xterm 包对应 dist 文件返回（离线），用 `require.resolve('@xterm/xterm/...')` 定位。
- `WS /ws?cols=&rows=&shell=&token=` → 终端会话。

鉴权钩子（默认放行）：WS connection 时读 `query.token`，与 `authToken` 比对；MVP `authToken=''` 即放行，并打印风险日志。预留 `authorize(req): boolean`。

PTY 管理（每条 WS 连接）：
- spawn：`pty.spawn(shell, [], { cols, rows, cwd: homedir, env: process.env, useConpty: true /* win */ })`
- shell 解析优先级：`query.shell` → 配置默认（Git Bash via `getGitBashPath`）→ PowerShell → cmd → `/bin/sh`
- `term.onData(d => ws.send(d))`；`ws.on('message', m => term.write(m))`
- 约定控制消息为 JSON `{type:'resize',cols,rows}`，普通消息按字符串直接 write
- `ws.on('close'|'error')` → `term.kill()`；`term.onExit` → `ws.close()`

移除：原 `handlePost`/`handleGet` 单命令执行、`sanitizeCmd`、`__jie__` cwd 解析 hack（被 WebSocket PTY 取代）。

### 2. 网页终端 HTML（`src/terminalHtml.ts` 导出模板字符串）

- xterm 容器 + 引用 `/xterm.js` `/xterm.css` `/addon-fit.js`
- JS：`new Terminal()`、FitAddon；建立 `ws://${location.host}/ws?cols&rows`；`term.onData → ws.send`；`ws.onmessage → term.write`；window resize → `fit()` + 发 resize 消息
- 首屏顶部风险横幅：「⚠️ 局域网无鉴权，同网任何人可执行命令」
- 多终端：MVP 单页单终端，多会话靠多浏览器标签/窗口（天然支持，因每连接独立 PTY）

### 3. shell 默认值与探测（复用）

bridge 内复用 `getGitBashPath()`（`src/utils/terminal.ts`，纯 JS，可一起 bundle 进 bridge.cjs）。

### 4. server.ts（自动拉起 + 首次打印访问信息）

- **不新增独立命令**：保持 `startServer()` 在 `main()` 首行自动调用（执行任意 jie 命令即拉起）。
- `startServer()`：活性检测改为 `http://127.0.0.1:32677/health`；detached spawn 机制不变。
- **首次拉起打印**：当检测到先前未运行、spawn 后 `/health` 可达（本次为新拉起）时，在主进程调用 `printServerInfo()` 打印访问信息；服务已运行则静默不重复打印。
- 导出 `printServerInfo()`：`os.networkInterfaces()` 取 IPv4（排除回环、尽量过滤虚拟网卡），打印：
  ```
  ⚠️  局域网网页终端已启动（无鉴权，同网任何人可执行命令）
  本机访问:   http://localhost:32677
  局域网访问: http://192.168.x.x:32677
  ```

### 5. 配置（`src/config/index.ts`）

- 保留 `localServer = 'http://127.0.0.1:32677'`（活性检测用 127）
- 新增 `bridgeHost = '0.0.0.0'`、`bridgePort = 32677`、`authToken = ''`（空=关闭）

## 依赖变更

| 包 | 位置 | 说明 |
|---|---|---|
| `node-pty` | **dependencies** | 原生模块，必须 external；全局安装需其 postinstall 编译。对标 `sharp` |
| `@xterm/xterm` | **dependencies** | 浏览器终端核心，bridge 静态 serve 其 dist 文件 |
| `@xterm/addon-fit` | **dependencies** | 终端尺寸自适应 |
| `ws` | 已有(dev) | 纯 JS，可 bundle；如 bundle 报可选原生依赖错则改 external+dependencies |

## 打包（`tsdown.config.ts`）

```ts
export default defineConfig({
  entry: { jie, bridge, check },
  external: ['node-pty'],   // 原生模块不可 bundle
})
```

`bridge.cjs` 运行时 `require('node-pty')` 从 `node_modules` 解析（全局安装时位于全局 `node_modules`，因属 dependencies）。xterm 资源运行时 `require.resolve` 定位并 serve（不打包进 cjs）。

## 兼容 / 迁移

- 原 `POST /` 单命令 API 移除（被 WS PTY 取代）；本项目无外部 web UI 依赖该接口。
- `GET /` 返回 HTML（原返回 'jie bridge' 字符串）；活性检测改用 `/health`。
- `startServer` 行为不变（仍每次 CLI 调用拉起），仅监听 `0.0.0.0` + 健康路径调整。

## 风险与对策

- **node-pty Windows 编译失败**：用 prebuilt（N-API）；若 `pnpm add` 失败 → 暂停上报，评估 child_process 降级方案。→ implement S0 先验证。
- **node-pty 全局安装解析失败**：确保 dependencies + external；发布前 `npm i -g` 验证。
- **局域网无鉴权 RCE**：MVP 接受（用户选择），强提示 + 预留 token 钩子。
- **xterm 资源离线体积**：静态 serve 而非内联，体积可控。

## 回滚

改动集中在 `bridge.ts` / `server.ts` / `config/index.ts` / `index.ts` / `tsdown.config.ts` / `package.json`。回滚 = `git revert`，无数据迁移。
