<template>
  <div id="tikkon">
    <AppLoader v-if="store.loading"/>
    <template v-else>
      <div class="app-wrapper">
        <HeaderNav v-if="store.user" />
        <router-view />
        <Toast />
        <AppFooter  v-if="store.user" />
      </div>
    </template>
  </div>
</template>

<script setup>
import HeaderNav from './components/HeaderNav.vue'
import Toast from './components/Toast.vue'
import AppFooter from './components/AppFooter.vue'
import AppLoader from './components/AppLoader.vue'
import { useAppStore } from './stores/app'
import { onMounted } from 'vue'

const store = useAppStore()
onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'light') {
    document.documentElement.classList.add('light')
  }
});
</script>

<style>
.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

</style>
