<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="bg-orb orb1"></div>
      <div class="bg-orb orb2"></div>
      <div class="bg-grid"></div>
    </div>

    <div class="login-card fade-up">
      <div class="login-logo">
        <span class="logo-hex">⬡</span>
        <h1>tikkon<span>.habit</span></h1>
        <p>Приложение для управление привычками и задачами.</p>
      </div>

      <div class="tab-row">
        <button class="tab-btn" :class="{ active: mode === 'login' }" @click="mode = 'login'">Войти</button>
        <button class="tab-btn" :class="{ active: mode === 'register' }" @click="mode = 'register'">Создать
          аккаунт</button>
      </div>

      <form @submit.prevent="submit" class="login-form">
        <div v-if="mode === 'register'" class="form-group">
          <label class="form-label">Имя</label>
          <input v-model="form.name" type="text" class="input" placeholder="Как тебя зовут?" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="form.email" type="email" class="input" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Пароль</label>
          <input v-model="form.password" type="password" class="input" placeholder="••••••••" required minlength="6" />
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ mode === 'login' ? 'Войти' : 'Создать аккаунт' }}
        </button>
      </form>

      <div class="login-footer">
        <p>Управляй привычками и задачами в одном месте</p>
        <div class="features">
          <span>◉ Умный фокус</span>
          <span>◫ Годовой трекер</span>
          <span>★ Система оценок</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const router = useRouter()
const mode = ref('login')
const loading = ref(false)
const error = ref('')

const form = reactive({ name: '', email: '', password: '' })

async function submit() {
  error.value = ''
  loading.value = true
  try {
    if (mode.value === 'login') {
      await store.login(form.email, form.password)
    } else {
      await store.register(form.email, form.password, form.name)
    }
    router.push('/focus')
  } catch (e) {
    error.value = e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password'
      ? 'Неверный email или пароль'
      : e.code === 'auth/email-already-in-use'
        ? 'Этот email уже используется'
        : 'Что-то пошло не так. Попробуй ещё раз.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.25;
}

.orb1 {
  width: 500px;
  height: 500px;
  background: var(--gold);
  top: -200px;
  right: -100px;
}

.orb2 {
  width: 400px;
  height: 400px;
  background: var(--purple);
  bottom: -150px;
  left: -100px;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}

.login-card {
  position: relative;
  z-index: 1;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  padding: 34px 30px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.5);
}

.login-logo {
  text-align: center;
  margin-bottom: 32px;
}

.logo-hex {
  font-size: 2.5rem;
  color: var(--gold);
  filter: drop-shadow(0 0 10px rgba(245, 200, 66, 0.6));
}

.login-logo h1 {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  margin-top: 8px;
  color: var(--text);
}

.login-logo h1 span {
  color: var(--gold);
}

.login-logo p {
  color: var(--text3);
  font-size: 0.9rem;
  margin-top: 4px;
}

.tab-row {
  display: flex;
  background: var(--bg3);
  border-radius: var(--radius-sm);
  padding: 4px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  padding: 9px;
  border: none;
  background: transparent;
  color: var(--text3);
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all var(--transition);
}

.tab-btn.active {
  background: var(--surface2);
  color: var(--text);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-msg {
  background: rgba(232, 64, 64, 0.1);
  border: 1px solid rgba(232, 64, 64, 0.3);
  color: var(--red);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 0.875rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-top-color: #0a0a0f;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
  border-top: 1px solid var(--border);
  padding-top: 24px;
}

.login-footer p {
  font-size: 0.85rem;
  color: var(--text3);
  margin-bottom: 12px;
}

.features {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.features span {
  font-size: 0.78rem;
  color: var(--text2);
  background: var(--surface);
  padding: 4px 10px;
  border-radius: 99px;
  border: 1px solid var(--border);
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
  }
}
</style>
