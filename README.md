# ajie-cli

欢迎使用阿杰的脚手架工具（`@djie/cli`）—— 个人 Node.js CLI 工具集：项目脚手架、图片转换、Git 操作、文件查找、ZIP 压缩、**局域网网页终端**等。

## 安装

```bash
# npm
npm i -g @djie/cli

# pnpm
pnpm i -g @djie/cli
```

### 平台与包管理器说明

「局域网网页终端」功能依赖原生模块 `node-pty`：

| 环境 | 说明 |
| --- | --- |
| **Windows / macOS** | 开箱即用。自带预编译二进制；即便 pnpm 忽略了构建脚本，终端仍可工作（Win10+ 使用系统内置 ConPTY）。 |
| **Linux** | 无预编译包，安装时会触发 `node-gyp` 编译，需先具备 `python` 与 `build-essential`（make / g++）。 |
| **pnpm 用户** | 安装时可能看到 `ERR_PNPM_IGNORED_BUILDS: node-pty`——这是 pnpm 对所有原生模块的默认安全策略，**并非错误**。Windows/macOS 下终端照常可用；如需消除提示，运行 `pnpm approve-builds` 并选择 `node-pty`。 |

## 局域网网页终端

在本机执行任意 `jie` 命令，即会在后台自动启动终端服务（监听 `0.0.0.0:32677`），首次启动会打印局域网访问地址：

```
⚠️  局域网网页终端已启动（未启用鉴权，同网任何人可执行命令）
   本机访问  : http://localhost:32677
   局域网访问: http://192.168.x.x:32677
```

同一局域网内的其他设备（手机 / 电脑）用浏览器打开「局域网访问」地址，即可获得一个本机 shell 终端（Windows 默认 Git Bash，支持彩色输出、Tab 补全、Ctrl+C、窗口自适应等）。每打开一个页面就是一个独立终端会话。

> ⚠️ **默认不启用鉴权**，同一网络下任何人都能在你电脑上执行命令。强烈建议运行 `jie passwd` 设置访问密码（见下节）。局域网其他设备首次访问若连不上，通常是 Windows 防火墙拦截——放行 Node.js 监听 32677 端口即可。

### 访问鉴权（推荐开启）

为避免「同网任何人都能在你电脑执行命令」，设置一个访问密码：

```bash
jie passwd            # 交互式设置密码（输入时遮蔽，需二次确认）
jie passwd --clear    # 清除密码，恢复无鉴权
```

密码存于 `~/.jie/config.json`。设置后：

- 浏览器访问 `http://<IP>:32677/` 会先看到**登录页**，输入密码才能进入终端
- 登录成功后获得 2 小时会话（HttpOnly cookie），期间刷新/重访免登
- 密码比对恒定时间（防时序攻击），登录失败限速（同 IP 60s 内 5 次后拒绝，防暴破）
- **局限**：仅内网 HTTP，密码明文传输；重启服务后所有会话失效需重新登录

也可用环境变量 `JIE_AUTH_TOKEN` 临时指定密码（优先级高于 config.json）。未设置密码时一切照旧（不鉴权）。

### 配置项（环境变量）

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `JIE_BRIDGE_PORT` | `32677` | 服务端口 |
| `JIE_BRIDGE_HOST` | `0.0.0.0` | 监听地址 |
| `JIE_AUTH_TOKEN` | 空 | 鉴权 token，空 = 不鉴权 |

## 其他命令

`jie info` · `jie create` · `jie push` · `jie img` · `jie ico` · `jie zip` · `jie seek` · `jie kill <port>` · `jie update` … 详见 `jie --help`。

## 开发

```bash
pnpm install
pnpm dev            # esno 直跑源码
pnpm bridge         # 直接跑 bridge 源码（调试网页终端）
pnpm build          # tsdown 打包到 dist/
pnpm lint
```
