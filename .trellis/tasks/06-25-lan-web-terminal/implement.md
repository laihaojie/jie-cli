# Implement: 局域网网页终端远程命令执行

依据 `design.md` 的组件划分，按序执行。每个 `[ ]` 是一个验证门。

## 步骤

### S0 环境与依赖
- [ ] `pnpm add node-pty`（放 dependencies；验证 Windows 能装上 prebuilt）。失败则暂停上报。
- [ ] `pnpm add @xterm/xterm @xterm/addon-fit`（dependencies）。
- [ ] `tsdown.config.ts` 加 `external: ['node-pty']`。
- **验证**：`node -e "require('node-pty')"` 成功；`pnpm build` 不报 node-pty 打包错。
- **回滚点**：`git stash`。

### S1 bridge.ts 重写
- [ ] 新建 `src/terminalHtml.ts` 导出 HTML 模板字符串（xterm + ws 客户端 + 风险横幅）。
- [ ] 重写 `src/bridge.ts`：
  - http server 监听 `0.0.0.0:32677`
  - 路由：`GET /` → HTML；`GET /health` → `{ok:true}`；`GET /xterm.js|/xterm.css|/addon-fit.js` → 静态(`require.resolve`)
  - `WS /ws` → PTY 管理（spawn/onData/write/resize/close/kill），含 `authorize` 钩子（默认放行 + 风险日志）
  - shell 默认 Git Bash（复用 `getGitBashPath`），回退 powershell → cmd → sh
  - 复用 `src/utils/terminal.ts`（纯 JS，一起 bundle）
- **验证**：`pnpm bridge` 起服务；`curl http://localhost:32677/health` → `{ok:true}`；`curl /` → 含 xterm 的 HTML。

### S2 网页终端联调
- [ ] 浏览器开 `http://localhost:32677/` → 终端出现 bash 提示符。
- [ ] 输 `ls`、`git log --oneline --color` → 彩色流式输出。
- [ ] Ctrl+C 中断 `ping`/`ping -t`；Tab 补全；方向键历史。
- [ ] 缩放窗口 → 输出不错位。
- **验证**：上述全部通过。

### S3 自动拉起打印与配置
- [ ] `config/index.ts`：加 `bridgeHost=0.0.0.0`、`bridgePort=32677`、`authToken=''`。
- [ ] `server.ts`：`startServer` 活性检测改 `/health`；新增「本次新拉起时打印 `printServerInfo`」逻辑；导出 `printServerInfo`（`networkInterfaces` IPv4 + 风险提示 + 地址）；已运行不重复打印。
- [ ] `index.ts`：不改（`startServer` 已在 `main` 首行自动调用）。
- **验证**：`pnpm dev info` 首次拉起后打印局域网 IP + 地址 + 风险提示；再次执行不重复打印。

### S4 构建与全局场景
- [ ] `pnpm build`。
- [ ] `node dist/bridge.cjs` 独立运行；浏览器访问正常。
- [ ] 确认 `dist/bridge.cjs` 不内联 node-pty（external 生效），运行时从 node_modules 解析。
- **验证**：build 产物可独立运行终端。

### S5 质量门
- [ ] `pnpm lint`（修复新增文件 lint）。
- [ ] 手动回归：`jie kill 32677` 后服务停止、PTY 释放；重跑 `jie server` 恢复。
- [ ] 局域网真机验证（用户协助）：另一设备访问 `http://<本机IP>:32677` 跑通终端。

## 验证命令汇总
- 开发起服务：`pnpm bridge`
- 起 CLI（触发拉起）：`pnpm dev info`
- 构建：`pnpm build`；独立跑：`node dist/bridge.cjs`
- Lint：`pnpm lint`
- 关停：`pnpm dev kill 32677`

## 回滚点
- S0 失败 → 暂停，评估 child_process 降级方案。
- 任一步骤失败 → `git revert` 对应改动，回到上一稳定点。
