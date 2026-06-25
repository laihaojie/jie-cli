// 局域网网页终端 HTML。bridge 直接 serve 该页面（GET /），
// 浏览器无需任何外部文件、无需外网（xterm 资源由 bridge 静态 serve）。
export function getTerminalHtml(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>jie 局域网终端</title>
  <link rel="stylesheet" href="/xterm.css">
  <style>
    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0; background: #1e1e2e; overflow: hidden; }
    body { display: flex; flex-direction: column; }
    #term-wrap { flex: 1 1 auto; min-height: 0; padding: 4px; }
    .xterm { height: 100%; }
    .xterm-viewport { overflow-y: auto !important; }
  </style>
</head>

<body>
  <div id="term-wrap"><div id="terminal"></div></div>
  <script src="/xterm.js"></script>
  <script src="/addon-fit.js"></script>
  <script>
    (function () {
      var term = new Terminal({
        cursorBlink: true,
        fontFamily: '"Cascadia Code", Consolas, "Courier New", monospace',
        fontSize: 14,
        theme: { background: "#1e1e2e", foreground: "#cdd6f4", cursor: "#f5e0dc" },
        allowProposedApi: true,
      });
      var fitAddon = new FitAddon.FitAddon();
      term.loadAddon(fitAddon);
      term.open(document.getElementById("terminal"));

      function fit() { try { fitAddon.fit(); } catch (e) {} }
      fit();

      var proto = location.protocol === "https:" ? "wss:" : "ws:";
      var ws = new WebSocket(proto + "//" + location.host + "/ws?cols=" + term.cols + "&rows=" + term.rows);

      term.onData(function (d) { if (ws.readyState === 1) ws.send(d); });
      term.onResize(function (sz) {
        if (ws.readyState === 1) ws.send(JSON.stringify({ type: "resize", cols: sz.cols, rows: sz.rows }));
      });

      ws.onopen = function () { term.focus(); };
      ws.onmessage = function (ev) { term.write(typeof ev.data === "string" ? ev.data : ""); };
      ws.onclose = function () {
        term.write("\\r\\n\\x1b[31m[连接已断开]\\x1b[0m\\r\\n");
      };
      ws.onerror = function () {};

      window.addEventListener("resize", fit);
      if (window.ResizeObserver) new ResizeObserver(fit).observe(document.getElementById("term-wrap"));
      window.addEventListener("beforeunload", function () { try { ws.close(); } catch (e) {} });
    })();
  </script>
</body>

</html>`
}
