<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Monitor, Operation, Setting } from '@element-plus/icons-vue'

const router = useRouter()

const cards = [
  { label: 'Web 终端', desc: '浏览器里的真实 shell', icon: Operation, path: '/terminal', enabled: true },
  { label: '文件管理', desc: '浏览/上传/下载文件', icon: null, path: '/files', enabled: false },
  { label: '资源监控', desc: 'CPU / 内存 / 磁盘', icon: Monitor, path: '/monitor', enabled: false },
  { label: '可视化配置', desc: '端口 / 鉴权 / shell', icon: Setting, path: '/config', enabled: false },
]
</script>

<template>
  <div style="padding: 24px">
    <h2 style="margin-top: 0; letter-spacing: 1px">控制台 · 工具合集</h2>
    <el-row :gutter="16">
      <el-col v-for="c in cards" :key="c.path" :span="6">
        <el-card
          shadow="hover"
          :class="{ card: true, disabled: !c.enabled }"
          @click="c.enabled && router.push(c.path)"
        >
          <el-icon v-if="c.icon" :size="28"><component :is="c.icon" /></el-icon>
          <div style="font-size: 16px; font-weight: 600; margin-top: 8px">{{ c.label }}</div>
          <div style="color: #909399; font-size: 13px; margin-top: 4px">{{ c.desc }}</div>
          <el-tag v-if="!c.enabled" size="small" type="info" style="margin-top: 8px">待开发</el-tag>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.card {
  cursor: pointer;
  transition: transform 0.15s;
}
.card:hover {
  transform: translateY(-2px);
}
.card.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
