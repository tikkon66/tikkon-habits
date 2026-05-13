import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { useAppStore } from './stores/app'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Сначала инициализируем стор
const store = useAppStore()
store.initAuth() // Убедись, что в этом методе в сторе loading ставится в true, а потом в false

app.mount('#app')
