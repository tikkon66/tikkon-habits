<template>
  <div class="page profile-page">
    <div class="profile-header">
      <h1>Личный <span>кабинет</span></h1>
      <p>Управляй своим профилем и аккаунтом</p>
    </div>

    <div class="profile-layout">
      <div class="profile-left">
        <div class="profile-avatar-card card">
          <div class="avatar-wrap">
            <div class="avatar-circle" :style="avatarBg">
              <img v-if="avatarPreview" :src="avatarPreview" class="avatar-img" />
              <span v-else class="avatar-letter">{{ avatarLetter }}</span>
            </div>
            <label class="avatar-upload-btn" title="Изменить аватар">
              📷
              <input type="file" accept="image/*" @change="handleAvatarUpload" style="display:none" />
            </label>
          </div>
          <div class="avatar-info">
            <h3>{{ profileForm.name || 'Пользователь' }}</h3>
            <p>{{ store.user?.email }}</p>
            <span class="badge badge-gold" style="margin-top:8px">
              ⬡ tikkon.habit
            </span>
          </div>
        </div>

        <div class="mini-stats card" style="margin-top:16px">
          <div class="ms-row">
            <span class="ms-label">Привычек</span>
            <span class="ms-val">{{ store.habits.length }}</span>
          </div>
          <div class="ms-row">
            <span class="ms-label">Активных задач</span>
            <span class="ms-val">{{ activeTasks }}</span>
          </div>
          <div class="ms-row">
            <span class="ms-label">Звёздных дней</span>
            <span class="ms-val">{{ starDays }}</span>
          </div>
          <div class="ms-row">
            <span class="ms-label">Серия дней</span>
            <span class="ms-val">{{ streak }} 🔥</span>
          </div>
        </div>

        <Confirm v-if="isConfirm" :message="'Выйти из аккаунта?'" @doThis="confirmLogout"
          @closeWindow="isConfirm = false" />

        <div class="danger-zone card" style="margin-top:16px">
          <h4 class="danger-title">Зона опасности</h4>
          <button class="btn btn-danger w-full" @click="isConfirm = true">Выйти из аккаунта</button>
        </div>
      </div>

      <div class="profile-right">
        <div class="card">
          <h3 class="section-title">Основная информация</h3>
          <form @submit.prevent="saveProfile" class="edit-form">
            <div class="form-group">
              <label class="form-label">Имя</label>
              <input v-model="profileForm.name" type="text" class="input" placeholder="Твоё имя" required />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input v-model="profileForm.email" type="email" class="input" placeholder="email@example.com" required />
              <span class="form-hint">Изменение email потребует повторного входа</span>
            </div>
            <div class="form-group">
              <label class="form-label">О себе</label>
              <textarea v-model="profileForm.bio" class="textarea" placeholder="Расскажи о своих целях..."></textarea>
            </div>
            <div v-if="profileMsg" class="form-message" :class="profileMsgType">{{ profileMsg }}</div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="profileSaving">
                {{ profileSaving ? 'Сохраняем...' : 'Сохранить изменения' }}
              </button>
            </div>
          </form>
        </div>

        <div class="card" style="margin-top:20px">
          <h3 class="section-title">Изменить пароль</h3>
          <form @submit.prevent="savePassword" class="edit-form">
            <div class="form-group">
              <label class="form-label">Новый пароль</label>
              <input v-model="pwdForm.password" type="password" class="input" placeholder="Минимум 6 символов"
                minlength="6" required />
            </div>
            <div class="form-group">
              <label class="form-label">Подтверди пароль</label>
              <input v-model="pwdForm.confirm" type="password" class="input" placeholder="Повтори пароль" required />
            </div>
            <div v-if="pwdMsg" class="form-message" :class="pwdMsgType">{{ pwdMsg }}</div>
            <div class="form-actions">
              <button type="submit" class="btn btn-ghost" :disabled="pwdSaving">
                {{ pwdSaving ? 'Обновляем...' : 'Обновить пароль' }}
              </button>
            </div>
          </form>
        </div>

        <div class="card" style="margin-top:20px">
          <h3 class="section-title">Предпочтения</h3>
          <div class="prefs-list">
            <div class="pref-row">
              <div>
                <div class="pref-title">Уведомления о привычках</div>
                <div class="pref-desc">Напоминать о задачах в назначенное время</div>
              </div>
              <div class="toggle-wrap" @click="prefs.notifications = !prefs.notifications">
                <div class="toggle" :class="{ on: prefs.notifications }"></div>
              </div>
            </div>
            <div class="divider"></div>
            <div class="pref-row">
              <div>
                <div class="pref-title">Автоматическая оценка дня</div>
                <div class="pref-desc">Рассчитывать оценку в конце дня автоматически</div>
              </div>
              <div class="toggle-wrap" @click="prefs.autoScore = !prefs.autoScore">
                <div class="toggle" :class="{ on: prefs.autoScore }"></div>
              </div>
            </div>
            <div class="divider"></div>
            <div class="pref-row">
              <div>
                <div class="pref-title">Светлая тема</div>
              </div>
              <div class="toggle-wrap" @click="toggleTheme()">
                <div class="toggle" :class="{ on: isLight }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card account-info" style="margin-top:20px">
          <h3 class="section-title">Информация об аккаунте</h3>
          <div class="ai-row">
            <span class="ai-label">ID пользователя</span>
            <code class="ai-val">{{ store.user?.uid }}</code>
          </div>
          <div class="ai-row">
            <span class="ai-label">Дата регистрации</span>
            <span class="ai-val">{{ registerDate }}</span>
          </div>
          <div class="ai-row">
            <span class="ai-label">Провайдер</span>
            <span class="ai-val">Email / Password</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import Confirm from '../components/Confirm.vue'

const store = useAppStore()
const router = useRouter()

const profileSaving = ref(false)
const pwdSaving = ref(false)
const profileMsg = ref('')
const profileMsgType = ref('success')
const pwdMsg = ref('')
const pwdMsgType = ref('success')
const avatarPreview = ref('')

const profileForm = reactive({
  name: '',
  email: '',
  bio: '',
})
const pwdForm = reactive({ password: '', confirm: '' })
const prefs = reactive({ notifications: true, autoScore: true })

const isLight = ref(false)
function toggleTheme() {
  isLight.value = !isLight.value

  localStorage.setItem('theme', isLight.value ? 'light' : 'dark')
  document.documentElement.classList.toggle('light', isLight.value)
}

onMounted(() => {
  if (store.userProfile) {
    profileForm.name = store.userProfile.name || store.user?.displayName || ''
    profileForm.email = store.userProfile.email || store.user?.email || ''
    profileForm.bio = store.userProfile.bio || ''
    avatarPreview.value = store.userProfile.avatar || ''
  }

  const saved = localStorage.getItem('theme')
  if (saved === 'light') {
    isLight.value = true
    document.documentElement.classList.add('light')
  }
})

const avatarLetter = computed(() => (profileForm.name || store.user?.email || '?')[0].toUpperCase())
const avatarBg = computed(() => avatarPreview.value ? {} : { background: 'linear-gradient(135deg, var(--gold2), var(--gold))' })

const activeTasks = computed(() => store.tasks.filter(t => !t.done).length)
const starDays = computed(() => Object.values(store.dayLogs).filter(l => l.score === 'star').length)
const streak = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  let s = 0
  const d = new Date()
  while (true) {
    const ds = d.toISOString().split('T')[0]
    const log = store.dayLogs[ds]
    if (log && log.score !== 'none') { s++; d.setDate(d.getDate() - 1) }
    else break
  }
  return s
})

const registerDate = computed(() => {
  if (!store.user?.metadata?.creationTime) return '—'
  return new Date(store.user.metadata.creationTime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
})

function handleAvatarUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { avatarPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

async function saveProfile() {
  profileSaving.value = true
  profileMsg.value = ''
  try {
    await store.updateUserProfile({
      name: profileForm.name,
      email: profileForm.email,
      bio: profileForm.bio,
      avatar: avatarPreview.value,
    })
    profileMsg.value = '✓ Профиль успешно обновлён'
    profileMsgType.value = 'success'
  } catch (e) {
    profileMsg.value = 'Ошибка: ' + (e.message || 'Что-то пошло не так')
    profileMsgType.value = 'error'
  } finally {
    profileSaving.value = false
    setTimeout(() => { profileMsg.value = '' }, 4000)
  }
}

async function savePassword() {
  if (pwdForm.password !== pwdForm.confirm) {
    pwdMsg.value = 'Пароли не совпадают'
    pwdMsgType.value = 'error'
    return
  }
  pwdSaving.value = true
  pwdMsg.value = ''
  try {
    await store.changePassword(pwdForm.password)
    pwdMsg.value = '✓ Пароль успешно обновлён'
    pwdMsgType.value = 'success'
    pwdForm.password = ''
    pwdForm.confirm = ''
  } catch (e) {
    pwdMsg.value = e.code === 'auth/requires-recent-login'
      ? 'Для смены пароля выйди и войди снова'
      : 'Ошибка: ' + e.message
    pwdMsgType.value = 'error'
  } finally {
    pwdSaving.value = false
    setTimeout(() => { pwdMsg.value = '' }, 5000)
  }
}

const isConfirm = ref(false);
async function confirmLogout() {
  await store.logout()
  router.push('/focus')

}


</script>

<style scoped>
.profile-header {
  margin-bottom: 32px;
}

.profile-header h1 {
  font-size: 2rem;
}

.profile-header h1 span {
  color: var(--gold);
}

.profile-header p {
  color: var(--text3);
  font-size: 0.9rem;
  margin-top: 4px;
}

.profile-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  align-items: start;
}

.profile-avatar-card {
  text-align: center;
}

.avatar-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.avatar-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid rgba(245, 200, 66, 0.3);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-letter {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 800;
  color: #0a0a0f;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--surface2);
  border: 1px solid var(--border2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all var(--transition);
}

.avatar-upload-btn:hover {
  background: var(--gold);
}

.avatar-info h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.avatar-info p {
  font-size: 0.82rem;
  color: var(--text3);
}

.mini-stats {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  overflow: hidden;
}

.ms-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
}

.ms-row:last-child {
  border-bottom: none;
}

.ms-label {
  font-size: 0.85rem;
  color: var(--text2);
}

.ms-val {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  color: var(--text);
}

.danger-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--red);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text3);
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.form-message {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.form-message.success {
  background: rgba(61, 220, 132, 0.1);
  border: 1px solid rgba(61, 220, 132, 0.3);
  color: var(--green);
}

.form-message.error {
  background: rgba(232, 64, 64, 0.1);
  border: 1px solid rgba(232, 64, 64, 0.3);
  color: var(--red);
}

.prefs-list {
  display: flex;
  flex-direction: column;
}

.pref-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 0;
}

.pref-title {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 2px;
}

.pref-desc {
  font-size: 0.78rem;
  color: var(--text3);
}

.ai-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}

.ai-row:last-child {
  border-bottom: none;
}

.ai-label {
  font-size: 0.82rem;
  color: var(--text3);
}

.ai-val {
  font-size: 0.82rem;
  color: var(--text2);
}

code.ai-val {
  background: var(--bg3);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
}

@media (max-width: 900px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
}
</style>
