<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const password = ref('')
const loading = ref(false)
const error = ref('')

const title = computed(() => (auth.hostSuffix ? `${auth.hostSuffix} · DECK` : 'DECK'))

async function submit() {
  if (!password.value)
    return
  loading.value = true
  error.value = ''
  const ok = await auth.login(password.value)
  loading.value = false
  if (ok)
    router.push('/')
  else
    error.value = '密码错误'
}
</script>

<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <h2 style="margin: 0 0 8px; letter-spacing: 2px">{{ title }}</h2>
      <p style="margin: 0 0 20px; color: #909399; font-size: 13px">控制台 · 请输入访问密码</p>
      <el-input
        v-model="password"
        type="password"
        placeholder="密码"
        show-password
        autofocus
        @keyup.enter="submit"
      />
      <el-button type="primary" style="width: 100%; margin-top: 16px" :loading="loading" @click="submit">
        进入
      </el-button>
      <div v-if="error" style="margin-top: 12px; color: #f56c6c; font-size: 13px">{{ error }}</div>
    </el-card>
  </div>
</template>

<style scoped>
.login-wrap {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e1e2e;
}
.login-card {
  width: 340px;
  padding: 16px 8px;
}
</style>
