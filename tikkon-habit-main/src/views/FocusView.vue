<template>
  <div class="page focus-page">
    <div class="focus-bg">
      <div class="bg-orb-focus"></div>
    </div>

    <div class="focus-layout">
      <div class="focus-main">
        <div class="focus-header">
          <div>
            <p class="focus-date">{{ todayFormatted }}</p>
            <h1 class="focus-title">Твой <span>момент</span></h1>
          </div>
          <div class="focus-stats">
            <div class="stat-pill">
              <span class="stat-num">{{ doneCount }}</span>
              <span class="stat-label">выполнено</span>
            </div>
            <div class="stat-pill">
              <span class="stat-num">{{ totalCount }}</span>
              <span class="stat-label">всего</span>
            </div>
          </div>
        </div>

        <div class="progress-bar-wrap">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
          </div>
          <span class="progress-label">{{ progressPct }}%</span>
        </div>

        <div v-if="currentItem" class="current-card fade-up" :class="['priority-' + currentItem._priority]">
          <div class="current-card-top">
            <div class="current-badge">
              <span v-if="currentItem._type === 'habit'">🔁 Привычка</span>
              <span v-else>✓ Задача</span>
              <span class="priority-tag" :class="'p' + currentItem._priority">
                {{ priorityLabel(currentItem._priority) }}
              </span>
            </div>
            <div class="current-dot" :class="'dot-p' + currentItem._priority"></div>
          </div>

          <h2 class="current-name">{{ currentItem.name }}</h2>

          <div v-if="currentItem._type === 'task' && currentItem.deadline" class="current-deadline">
            <span>⏰</span> До {{ formatDeadline(currentItem.deadline) }}
          </div>
          <div v-if="currentItem._type === 'habit' && currentItem.time" class="current-deadline">
            <span>⏱</span> {{ currentItem.time }}
          </div>

          <div class="current-actions">
            <button class="btn-complete" @click="complete" :disabled="completing">
              <span v-if="completing" class="spinner-white"></span>
              <span v-else>✓</span>
              Выполнено!
            </button>
            <button class="btn-skip" @click="skip">
              ↷ Отложить
            </button>
          </div>
        </div>

        <div v-else-if="totalCount > 0" class="all-done-card fade-up">
          <div class="done-emoji">🌟</div>
          <h2>Всё выполнено!</h2>
          <p>Отличный день. Ты справился со всеми задачами.</p>
          <div class="done-score" :class="dayScore">
            {{ dayScoreLabel }}
          </div>
        </div>

        <div v-else class="empty-card fade-up">
          <div class="empty-icon">◎</div>
          <h2>Нет задач на сегодня</h2>
          <p>Добавь привычки или задачи, чтобы начать отслеживать прогресс</p>
          <router-link to="/lists" class="btn btn-primary">Перейти в Списки →</router-link>
        </div>
      </div>

      <div class="queue-sidebar">
        <div class="queue-header">
          <h3>Очередь дня</h3>
          <span class="badge badge-gold">{{ remainingCount }}</span>
        </div>

        <div v-if="store.priorityQueue.length === 0" class="queue-empty">
          <p>Очередь пуста</p>
        </div>

        <div class="queue-list">
          <div v-for="(item, i) in store.priorityQueue" :key="item.id" class="queue-item" :class="{
            'done': item._done,
            'current': !item._done && isCurrentItem(item),
            'p1': item._priority === 1,
            'p2': item._priority === 2,
          }" @click="!item._done && setManualCurrent(i)">
            <div class="qi-left">
              <div class="qi-dot" :class="'dot-p' + item._priority"></div>
              <div class="qi-info">
                <span class="qi-name" :class="{ 'line-through': item._done }">{{ item.name }}</span>
                <span class="qi-meta">
                  {{ item._type === 'habit' ? '🔁' : '✓' }}
                  {{ item._type === 'habit' ? 'Привычка' : 'Задача' }}
                  <span v-if="item._priority <= 2" class="qi-imp">· Важное</span>
                </span>
              </div>
            </div>
            <div v-if="item._done" class="qi-check">✓</div>
          </div>
        </div>

        <div v-if="store.dayLogs[store.todayStr]" class="queue-log">
          <div class="divider"></div>
          <p class="queue-log-label">Статус дня</p>
          <div class="day-score-badge" :class="dayScore">{{ dayScoreLabel }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const completing = ref(false)
const manualIndex = ref(null)

const todayFormatted = computed(() => {
  return new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
})

const currentItem = computed(() => {
  const q = store.priorityQueue.filter(i => !i._done)

  if (!q.length) return null

  if (manualIndex.value) {
    return q.find(i => i.id === manualIndex.value) || q[0]
  }

  return q[0]
})

function isCurrentItem(item) {
  return currentItem.value && currentItem.value.id === item.id
}

function setManualCurrent(i) {
  manualIndex.value = i
}

const totalCount = computed(() => store.priorityQueue.length)
const doneCount = computed(() => store.priorityQueue.filter(i => i._done).length)
const remainingCount = computed(() => store.priorityQueue.filter(i => !i._done).length)
const progressPct = computed(() => totalCount.value ? Math.round(doneCount.value / totalCount.value * 100) : 0)

const dayScore = computed(() => store.dayLogs[store.todayStr]?.score || 'none')
const dayScoreLabel = computed(() => ({
  star: '🌟 Звёздный день',
  mid: '🟡 Хороший день',
  fail: '🔴 Слабый день',
  none: '⬜ День идёт'
})[dayScore.value] || '⬜ День идёт')


async function complete() {
  const item = currentItem.value
  if (!item || completing.value) return

  completing.value = true
  manualIndex.value = null

  try {
    await store.completeItem(item)
  } finally {
    completing.value = false
  }
}


function skip() {
  const item = currentItem.value
  if (!item) return

  const q = store.priorityQueue.filter(i => !i._done)
  const idx = q.findIndex(i => i.id === item.id)
  if (idx === -1) return

  const next = q[idx + 1] || q[0]
  manualIndex.value = next.id
}

function priorityLabel(p) {
  return ['', 'Приоритет 1', 'Приоритет 2', 'Обычное', 'Неважное'][p] || ''
}

function formatDeadline(dl) {
  if (!dl) return ''
  const d = new Date(dl)
  return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.focus-page {
  position: relative;
  overflow: hidden;
}

.focus-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-orb-focus {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245, 200, 66, 0.08) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.focus-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 32px;
  align-items: start;
}

.focus-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.focus-date {
  font-size: 0.85rem;
  color: var(--text3);
  text-transform: capitalize;
  margin-bottom: 4px;
}

.focus-title {
  font-size: 2.2rem;
  font-weight: 800;
}

.focus-title span {
  color: var(--gold);
}

.focus-stats {
  display: flex;
  gap: 12px;
}

.stat-pill {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 16px;
  text-align: center;
}

.stat-num {
  display: block;
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text);
}

.stat-label {
  font-size: 0.72rem;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.progress-bar-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--surface2);
  border-radius: 99px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold2), var(--gold));
  border-radius: 99px;
  transition: width 0.6s cubic-bezier(.4, 0, .2, 1);
  box-shadow: 0 0 10px rgba(245, 200, 66, 0.4);
}

.progress-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--gold);
  min-width: 36px;
  text-align: right;
}

.current-card {
  height: auto;
  border-radius: var(--radius-lg);
  padding: 36px 32px;
  border: 1px solid var(--border2);
  background: var(--surface);
  position: relative;
  overflow: hidden;
  transition: all var(--transition);
}

.current-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}

.current-card.priority-1::before {
  background: linear-gradient(90deg, transparent, var(--red), transparent);
}

.current-card.priority-2::before {
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}

.current-card.priority-3::before {
  background: linear-gradient(90deg, transparent, var(--blue), transparent);
}

.current-card.priority-4::before {
  background: linear-gradient(90deg, transparent, var(--text3), transparent);
}

.current-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.current-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-badge>span:first-child {
  font-size: 0.85rem;
  color: var(--text2);
}

.priority-tag {
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--font-display);
}

.priority-tag.p1 {
  background: rgba(232, 64, 64, 0.15);
  color: var(--red);
}

.priority-tag.p2 {
  background: rgba(245, 200, 66, 0.15);
  color: var(--gold);
}

.priority-tag.p3 {
  background: rgba(91, 141, 245, 0.15);
  color: var(--blue);
}

.priority-tag.p4 {
  background: var(--surface2);
  color: var(--text3);
}

.current-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.current-name {
  width: 100%;
  height: auto;
  white-space: normal;
  overflow-wrap: break-word;
  word-break: break-word;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 800;
  line-height: 1.15;
  color: var(--text);
  margin-bottom: 24px;
}

.current-deadline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  color: var(--text2);
  margin-bottom: 28px;
}

.current-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-complete {
  flex: 1;
  min-width: 160px;
  padding: 16px 24px;
  background: var(--gold);
  color: #0a0a0f;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all var(--transition);
}

.btn-complete:hover {
  background: #ffe060;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(245, 200, 66, 0.3);
}

.btn-complete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-skip {
  padding: 16px 24px;
  background: var(--surface2);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  color: var(--text2);
  cursor: pointer;
  font-size: 0.95rem;
  transition: all var(--transition);
}

.btn-skip:hover {
  color: var(--text);
  background: var(--bg3);
}

.spinner-white {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: #0a0a0f;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.all-done-card,
.empty-card {
  border-radius: var(--radius-lg);
  padding: 48px 32px;
  border: 1px solid var(--border);
  background: var(--surface);
  text-align: center;
}

.done-emoji,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  display: block;
  animation: bounceIn 0.5s ease;
}

.empty-icon {
  color: var(--text3);
}

.all-done-card h2,
.empty-card h2 {
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.all-done-card p,
.empty-card p {
  color: var(--text2);
  margin-bottom: 24px;
}

.done-score {
  display: inline-block;
  padding: 8px 20px;
  border-radius: 99px;
  font-weight: 700;
  font-size: 1rem;
  background: rgba(245, 200, 66, 0.15);
  color: var(--gold);
}

.done-score.fail {
  background: rgba(232, 64, 64, 0.15);
  color: var(--red);
}

.done-score.mid {
  background: rgba(240, 168, 48, 0.15);
  color: var(--yellow);
}

.queue-sidebar {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  position: sticky;
  top: calc(var(--nav-h) + 24px);
  max-height: calc(100vh - var(--nav-h) - 48px);
  overflow-y: auto;
}

.queue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.queue-header h3 {
  font-size: 1rem;
  font-weight: 700;
}

.queue-empty {
  text-align: center;
  padding: 32px 0;
  color: var(--text3);
  font-size: 0.875rem;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.queue-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition);
  border: 1px solid transparent;
}

.queue-item:hover:not(.done) {
  background: var(--surface2);
}

.queue-item.current {
  background: rgba(245, 200, 66, 0.06);
  border-color: rgba(245, 200, 66, 0.2);
}

.queue-item.done {
  opacity: 0.4;
  cursor: default;
}

.queue-item.p1 {
  border-left: 2px solid var(--red);
}

.queue-item.p2 {
  border-left: 2px solid var(--gold);
}

.qi-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.qi-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.qi-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.qi-name {
  font-size: 0.88rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.line-through {
  text-decoration: line-through;
}

.qi-meta {
  font-size: 0.72rem;
  color: var(--text3);
  margin-top: 2px;
}

.qi-imp {
  color: var(--gold);
}

.qi-check {
  color: var(--green);
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
}

.queue-log {
  margin-top: 16px;
}

.queue-log-label {
  font-size: 0.75rem;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.day-score-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 0.82rem;
  font-weight: 700;
  background: rgba(245, 200, 66, 0.1);
  color: var(--gold);
}

.day-score-badge.fail {
  background: rgba(232, 64, 64, 0.1);
  color: var(--red);
}

.day-score-badge.mid {
  background: rgba(240, 168, 48, 0.1);
  color: var(--yellow);
}

.day-score-badge.none {
  background: var(--surface2);
  color: var(--text3);
}

@media (max-width: 900px) {
  .focus-layout {
    grid-template-columns: 1fr;
  }

  .queue-sidebar {
    position: static;
    max-height: none;
  }
}

@media (max-width: 640px) {
  .current-card {
    padding: 24px 20px;
  }


  .focus-header {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
