<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { FitAddon } from '@xterm/addon-fit'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'

const el = ref<HTMLDivElement>()
let term: Terminal | null = null
let ws: WebSocket | null = null
let fitAddon: FitAddon | null = null

function connect() {
  if (!term)
    return
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
  ws = new WebSocket(`${proto}//${location.host}/ws?cols=${term.cols}&rows=${term.rows}`)

  term.onData((d) => {
    if (ws?.readyState === 1)
      ws.send(d)
  })
  term.onResize((sz) => {
    if (ws?.readyState === 1)
      ws.send(JSON.stringify({ type: 'resize', cols: sz.cols, rows: sz.rows }))
  })

  ws.onopen = () => term?.focus()
  ws.onmessage = (ev) => {
    if (typeof ev.data === 'string')
      term?.write(ev.data)
  }
  ws.onclose = () => term?.write('\r\n\x1b[31m[连接已断开]\x1b[0m\r\n')
}

onMounted(() => {
  if (!el.value)
    return
  term = new Terminal({
    cursorBlink: true,
    fontFamily: '"Cascadia Code", Consolas, "Courier New", monospace',
    fontSize: 14,
    theme: { background: '#1e1e2e', foreground: '#cdd6f4', cursor: '#f5e0dc' },
    allowProposedApi: true,
  })
  fitAddon = new FitAddon()
  term.loadAddon(fitAddon)
  term.open(el.value)
  fitAddon.fit()
  connect()

  const onResize = () => {
    try {
      fitAddon?.fit()
    }
    catch {}
  }
  window.addEventListener('resize', onResize)
  if (window.ResizeObserver && el.value)
    new ResizeObserver(onResize).observe(el.value)
})

onBeforeUnmount(() => {
  try {
    ws?.close()
  }
  catch {}
  term?.dispose()
  term = null
  ws = null
})
</script>

<template>
  <div ref="el" class="term-host" />
</template>

<style scoped>
.term-host {
  height: 100%;
  padding: 6px;
  background: #1e1e2e;
}
.term-host :deep(.xterm) {
  height: 100%;
}
.term-host :deep(.xterm-viewport) {
  overflow-y: auto !important;
}
</style>
