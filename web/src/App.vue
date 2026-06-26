<script setup lang="ts">
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

// 标签页标题随本机 IPv4 末段变化：134 · DECK · 控制台
watch(
  () => auth.hostSuffix,
  (suffix) => {
    document.title = suffix ? `${suffix} · DECK · 控制台` : 'DECK · 控制台'
  },
  { immediate: true },
)
</script>

<template>
  <router-view />
</template>
