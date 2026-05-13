<template>
  <Transition name="toast">
    <div v-if="visible" class="toast" :class="type">{{ message }}</div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref('success')
let timer = null

function show(msg, t = 'success', duration = 3000) {
  if (timer) clearTimeout(timer)
  message.value = msg; type.value = t; visible.value = true
  timer = setTimeout(() => { visible.value = false }, duration)
  console.log("wowowo")
}

defineExpose({ show });
</script>

<script>
let toastInstance = null
export function showToast(msg, type = 'success') {
  if (toastInstance) toastInstance.show(msg, type)
}
export function setToastInstance(inst) { toastInstance = inst }
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }
</style>
