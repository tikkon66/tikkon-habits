<template>
  <div class="page lists-page">
    <div class="lists-header">
      <div>
        <h1>Центр <span>управления</span></h1>
        <p>Настрой привычки и задачи</p>
      </div>
    </div>

    <div class="tab-switcher">
      <button class="tab-pill" :class="{ active: tab === 'habits' }" @click="tab = 'habits'">
        🔁 Привычки <span class="tab-count">{{ store.habits.length }}</span>
      </button>
      <button class="tab-pill" :class="{ active: tab === 'tasks' }" @click="tab = 'tasks'">
        ✓ Задачи <span class="tab-count">{{ activeTasks.length }}</span>
      </button>
    </div>

    <div v-if="tab === 'habits'" class="tab-content fade-in">
      <div class="section-toolbar">
        <h3>Мои привычки</h3>
        <button class="btn btn-primary btn-sm" @click="openHabitModal()">+ Добавить</button>
      </div>

      <div v-if="store.habits.length === 0" class="empty-state">
        <div class="es-icon">🔁</div>
        <h3>Нет привычек</h3>
        <p>Создай первую привычку — система будет напоминать тебе о ней каждый день</p>
        <button class="btn btn-primary" @click="openHabitModal()">+ Первая привычка</button>
      </div>

      <ItemFilter v-if="store.habits.length" :storeHabits="store.habits" :allDays="allDays" @openHabitModal="openHabitModal" @deleteHabit="val =>  deleteHabit(val)"/>

    </div>

    <div v-if="tab === 'tasks'" class="tab-content fade-in">
      <div class="section-toolbar">
        <h3>Активные задачи</h3>
        <button class="btn btn-primary btn-sm" @click="openTaskModal()">+ Добавить</button>
      </div>

      <div v-if="activeTasks.length === 0" class="empty-state">
        <div class="es-icon">✓</div>
        <h3>Нет активных задач</h3>
        <p>Добавь разовые задачи с дедлайном — они автоматически попадут в очередь дня</p>
        <button class="btn btn-primary" @click="openTaskModal()">+ Первая задача</button>
      </div>

      <div class="tasks-list">
        <div v-for="t in activeTasks" :key="t.id" class="task-row"
          :class="{ important: t.important, overdue: isOverdue(t) }">
          <div class="tr-left">
            <div class="tr-dot" :class="t.important ? 'dot-important' : 'dot-normal'"></div>
            <div class="tr-info">
              <span class="tr-name">{{ t.name }}</span>
              <span class="tr-deadline" :class="{ 'overdue-text': isOverdue(t) }">
                {{ isOverdue(t) ? '🔴 Просрочено: ' : '⏰ ' }}{{ formatDeadline(t.deadline) }}
              </span>
            </div>
          </div>
          <div class="tr-right">
            <span v-if="t.important" class="badge badge-gold">★</span>
            <button class="btn btn-ghost btn-sm" @click="openTaskModal(t)">✎</button>
            <button class="btn btn-danger btn-sm" @click="markDone(t.id)">✓ Готово</button>
            <button class="btn btn-icon btn-sm" @click="deleteTask(t.id)" style="color:var(--red)">✕</button>
          </div>
        </div>
      </div>

      <div v-if="doneTasks.length > 0" class="done-section">
        <button class="done-toggle" @click="showDone = !showDone">
          Выполненные задачи ({{ doneTasks.length }}) {{ showDone ? '▲' : '▼' }}
        </button>
        <div v-if="showDone" class="tasks-list fade-in">
          <div v-for="t in doneTasks" :key="t.id" class="task-row done">
            <div class="tr-left">
              <div class="tr-dot dot-normal" style="background: var(--text3)"></div>
              <span class="tr-name line-through">{{ t.name }}</span>
            </div>
            <button class="btn btn-icon btn-sm" @click="deleteTask(t.id)" style="color:var(--text3)">✕</button>
          </div>
        </div>
      </div>
    </div>

    <ItemForm :habitModal="habitModal" :editHabit="editHabit" @saveHabit="saveHabit" :hForm="hForm" :allDays="allDays"
      :saving="saving" @toggleDay="toggleDay" @closeModal="habitModal=false"/>

    <div v-if="taskModal" class="modal-overlay" @click.self="taskModal = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">{{ editTask?.id ? 'Редактировать задачу' : 'Новая задача' }}</span>
          <button class="modal-close" @click="taskModal = false">✕</button>
        </div>
        <form @submit.prevent="saveTask" class="modal-form">
          <div class="form-group">
            <label class="form-label">Название задачи</label>
            <input v-model="tForm.name" type="text" class="input" placeholder="Например: Сдать отчёт" required />
          </div>
          <div class="form-group">
            <label class="form-label">Дедлайн</label>
            <input v-model="tForm.deadline" type="datetime-local" class="input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Важная задача</label>
            <div class="toggle-wrap" @click="tForm.important = !tForm.important">
              <div class="toggle" :class="{ on: tForm.important }"></div>
              <span style="font-size:0.9rem; color:var(--text2)">
                {{ tForm.important ? 'Да, приоритет 1' : 'Нет, приоритет 4' }}</span>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="taskModal = false">Отмена</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Сохраняем...' : editTask?.id ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import ItemFilter from './ListView/ItemFilter.vue'
import ItemForm from './ListView/ItemForm.vue'
import { ref, computed, reactive } from 'vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const tab = ref('habits')
const showDone = ref(false)
const saving = ref(false)
const habitModal = ref(false)
const taskModal = ref(false)
const editHabit = ref(null)
const editTask = ref(null)

const allDays = [
  { v: 'mon', l: 'Пн' }, { v: 'tue', l: 'Вт' }, { v: 'wed', l: 'Ср' },
  { v: 'thu', l: 'Чт' }, { v: 'fri', l: 'Пт' }, { v: 'sat', l: 'Сб' }, { v: 'sun', l: 'Вс' }
]

const hForm = reactive({ name: '', time: '', important: false, days: ['mon', 'tue', 'wed', 'thu', 'fri'] })
const tForm = reactive({ name: '', deadline: '', important: false })

const activeTasks = computed(() => store.tasks.filter(t => !t.done))
const doneTasks = computed(() => store.tasks.filter(t => t.done))

function isOverdue(t) {
  return t.deadline && t.deadline < new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().slice(0, 5)
}

function formatDeadline(dl) {
  if (!dl) return ''
  return new Date(dl).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function openHabitModal(h = null) {
  editHabit.value = h
  if (h) {
    Object.assign(hForm, { name: h.name, time: h.time || '', important: h.important || false, days: [...(h.days || [])] })
  } else {
    Object.assign(hForm, { name: '', time: '', important: false, days: ['mon', 'tue', 'wed', 'thu', 'fri'] })
  }
  habitModal.value = true
}

function openTaskModal(t = null) {
  editTask.value = t
  if (t) {
    Object.assign(tForm, { name: t.name, deadline: t.deadline || '', important: t.important || false })
  } else {
    Object.assign(tForm, { name: '', deadline: '', important: false })
  }
  taskModal.value = true
}

function toggleDay(v) {
  const i = hForm.days.indexOf(v)
  if (i >= 0) hForm.days.splice(i, 1)
  else hForm.days.push(v)
}

async function saveHabit() {
  saving.value = true
  try {
    const data = { name: hForm.name, time: hForm.time, important: hForm.important, days: hForm.days }
    if (editHabit.value?.id) await store.updateHabit(editHabit.value.id, data)
    else await store.addHabit(data)
    habitModal.value = false
  } finally { saving.value = false }
}

async function saveTask() {
  saving.value = true
  try {
    const data = { name: tForm.name, deadline: tForm.deadline, important: tForm.important }
    if (editTask.value?.id) await store.updateTask(editTask.value.id, data)
    else await store.addTask(data)
    taskModal.value = false
  } finally { saving.value = false }
}

async function deleteHabit(id) {
  await store.deleteHabit(id)
}

async function deleteTask(id) {
  if (confirm('Удалить задачу?')) await store.deleteTask(id)
}

async function markDone(id) {
  await store.updateTask(id, { done: true })
};
</script>

<style scoped>
.lists-header {
  margin-bottom: 28px;
}

.lists-header h1 {
  font-size: 2rem;
}

.lists-header h1 span {
  color: var(--gold);
}

.lists-header p {
  color: var(--text3);
  margin-top: 4px;
  font-size: 0.9rem;
}

.tab-switcher {
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.tab-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 99px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text2);
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
}

.tab-pill:hover {
  color: var(--text);
  background: var(--surface);
}

.tab-pill.active {
  background: var(--gold);
  color: #0a0a0f;
  border-color: var(--gold);
  font-weight: 700;
}

.tab-count {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 99px;
  padding: 1px 7px;
  font-size: 0.78rem;
  font-weight: 800;
}

.tab-pill.active .tab-count {
  background: rgba(0, 0, 0, 0.2);
}

.section-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-toolbar h3 {
  font-size: 1rem;
  font-weight: 700;
}

.empty-state {
  text-align: center;
  padding: 64px 32px;
  border: 2px dashed var(--border2);
  border-radius: var(--radius-lg);
}

.es-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 1.2rem;
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text2);
  max-width: 360px;
  margin: 0 auto 24px;
  font-size: 0.9rem;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  gap: 12px;
  transition: all var(--transition);
}

.task-row:hover {
  border-color: var(--border2);
}

.task-row.important {
  border-color: rgba(245, 200, 66, 0.2);
}

.task-row.overdue {
  border-color: rgba(232, 64, 64, 0.2);
  background: rgba(232, 64, 64, 0.03);
}

.task-row.done {
  opacity: 0.5;
}

.tr-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.tr-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tr-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.tr-name {
  font-weight: 500;
  font-size: 0.92rem;
}

.tr-deadline {
  font-size: 0.78rem;
  color: var(--text3);
  margin-top: 2px;
}

.overdue-text {
  color: var(--red) !important;
}

.tr-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.done-section {
  margin-top: 28px;
}

.done-toggle {
  background: none;
  border: none;
  color: var(--text3);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 14px;
  font-family: var(--font-body);
}

.done-toggle:hover {
  color: var(--text2);
}

.line-through {
  text-decoration: line-through;
  color: var(--text3);
}

@media (max-width: 640px) {
  .task-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .tr-right {
    width: 100%;
    justify-content: flex-end;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .habits-grid {
    grid-template-columns: 1fr;
  }
}
</style>
