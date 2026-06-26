<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Monitor, Operation, Setting, Tools } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const logo = computed(() => (auth.hostSuffix ? `${auth.hostSuffix} · DECK` : 'DECK'))

const menus = [
  { index: '/', label: '首页', icon: Tools },
  { index: '/terminal', label: '终端', icon: Operation },
  { index: '/files', label: '文件', icon: null, disabled: true },
  { index: '/monitor', label: '监控', icon: Monitor, disabled: true },
  { index: '/config', label: '配置', icon: Setting, disabled: true },
]
</script>

<template>
  <el-container style="height: 100vh">
    <el-aside width="200px" style="background: #1f2329; color: #e5eaf3">
      <div style="padding: 18px 20px; font-size: 20px; font-weight: 700; letter-spacing: 2px; color: #409eff">
        {{ logo }}
      </div>
      <el-menu
        :default-active="route.path"
        background-color="#1f2329"
        text-color="#cfd3dc"
        active-text-color="#409eff"
        @select="(i: string) => router.push(i)"
      >
        <el-menu-item v-for="m in menus" :key="m.index" :index="m.index" :disabled="m.disabled">
          <el-icon v-if="m.icon"><component :is="m.icon" /></el-icon>
          <span>{{ m.label }}</span>
          <el-tag v-if="m.disabled" size="small" type="info" effect="plain" style="margin-left: auto">
            待开发
          </el-tag>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main style="padding: 0; background: #f5f7fa">
      <router-view />
    </el-main>
  </el-container>
</template>
