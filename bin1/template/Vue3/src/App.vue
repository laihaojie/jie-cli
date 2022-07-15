<script setup lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import { localGet } from './utils'

const num = ref(0)
const b = ref(0)
const box = ref(null)
const add = () => {
  num.value++
}

onMounted(() => {
  console.log(box.value)
})

const a = computed(() => {
  return num.value + 100
})

watch(() => { return [num.value, b.value] }, (value) => {
  console.log(value)
})
</script>

<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <!-- <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" /> -->
  <div>{{ a }}</div>
  <div ref="box" class="box" />

  <button @click="add">按钮</button>
  <router-view />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
