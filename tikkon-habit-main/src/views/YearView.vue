<template>
  <div class="page year-page">
    <div class="year-header">
      <div>
        <h1>Годовой <span>трекер</span></h1>
        <p>Карта твоего прогресса за {{ currentYear }}</p>
      </div>
      <div class="year-nav">
        <button class="btn btn-icon" @click="prevYear">←</button>
        <span class="year-label">{{ currentYear }}</span>
        <button class="btn btn-icon" @click="nextYear" :disabled="currentYear >= new Date().getFullYear()">→</button>
      </div>
    </div>

    <div class="legend">
      <div class="legend-item">
        <div class="legend-dot star"></div>
        <span>Звёздный день — всё выполнено</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot mid"></div>
        <span>Хороший день — важное выполнено</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot none"></div>
        <span>Нет данных</span>
      </div>
    </div>

    <div class="summary-row">
      <div class="summary-card">
        <span class="sum-icon">🌟</span>
        <div>
          <div class="sum-num">{{ stats.starDays }}</div>
          <div class="sum-label">Звёздных дней</div>
        </div>
      </div>
      <div class="summary-card">
        <span class="sum-icon">🏆</span>
        <div>
          <div class="sum-num">{{ stats.starWeeks }}</div>
          <div class="sum-label">Звёздных недель</div>
        </div>
      </div>
      <div class="summary-card">
        <span class="sum-icon">🔥</span>
        <div>
          <div class="sum-num">{{ stats.currentStreak }}</div>
          <div class="sum-label">Текущая серия дней</div>
        </div>
      </div>
      <div class="summary-card">
        <span class="sum-icon">📈</span>
        <div>
          <div class="sum-num">{{ stats.successRate }}%</div>
          <div class="sum-label">Процент успеха</div>
        </div>
      </div>
    </div>

    <div class="calendar-wrap">
      <div class="month-labels">
        <div v-for="(m, i) in monthOffsets" :key="i" class="month-label" :style="{ gridColumnStart: m.col }">{{ m.name
          }}</div>
      </div>

      <div class="day-labels">
        <div class="day-label">Вс</div>
        <div class="day-label">Пн</div>
        <div class="day-label">Вт</div>
        <div class="day-label">Ср</div>
        <div class="day-label">Чт</div>
        <div class="day-label">Пт</div>
        <div class="day-label">Сб</div>
      </div>

      <div class="cal-grid">
        <div v-for="p in paddingDays" :key="'pad-' + p" class="cal-cell empty"></div>

        <div v-for="day in yearDays" :key="day.dateStr" class="cal-cell"
          :class="[day.score, { today: day.isToday, future: day.isFuture, 'week-star': day.weekStar }]"
          :title="tooltip(day)" @click="!day.isFuture && selectDay(day)">
          <div v-if="day.isToday" class="today-dot"></div>
        </div>
      </div>
    </div>

    <div class="week-stats-section">
      <h3>Статистика по неделям</h3>
      <div class="week-stats-grid">
        <div v-for="(week, i) in weekStats" :key="i" class="week-stat" :class="weekClass(week)">
          <span class="ws-num">{{ i + 1 }}</span>
          <span class="ws-icon">{{ weekIcon(week) }}</span>
          <span class="ws-label">{{ week.starDays }}/7</span>
        </div>
      </div>
    </div>


    <div class="month-breakdown">
      <h3>По месяцам</h3>
      <div class="months-grid">
        <div v-for="(m, i) in monthStats" :key="i" class="month-card">
          <div class="mc-name">{{ m.name }}</div>
          <div class="mc-bar-wrap">
            <div class="mc-bar" :style="{ width: m.pct + '%' }" :class="m.class"></div>
          </div>
          <div class="mc-num">{{ m.starDays }} / {{ m.total }}</div>
        </div>
      </div>
    </div>

    <div v-if="selectedDay" class="modal-overlay" @click.self="selectedDay = null">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">{{ formatDayFull(selectedDay.dateStr) }}</span>
          <button class="modal-close" @click="selectedDay = null">✕</button>
        </div>
        <div class="day-detail">
          <div class="day-score-big" :class="selectedDay.score">
            {{ dayScoreLabel(selectedDay.score) }}
          </div>
          <div v-if="selectedDayLog?.completed?.length" class="completed-list">
            <p class="cl-label">Выполнено:</p>
            <div v-for="id in selectedDayLog.completed" :key="id" class="cl-item">
              <span class="cl-check">✓</span>
              {{ getItemName(id) }}
            </div>
          </div>
          <p v-else style="color:var(--text3); font-size:0.9rem">Нет данных за этот день</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const currentYear = ref(new Date().getFullYear())
const selectedDay = ref(null)

function prevYear() { currentYear.value-- }
function nextYear() { if (currentYear.value < new Date().getFullYear()) currentYear.value++ }

const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
const monthNamesFull = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

const yearDays = computed(() => {
  const days = []
  const today = new Date().toISOString().split('T')[0]
  const year = currentYear.value
  const d = new Date(year, 0, 1)
  while (d.getFullYear() === year) {
    const dateStr = d.toISOString().split('T')[0]
    const log = store.dayLogs[dateStr]
    days.push({
      dateStr,
      score: log?.score || 'none',
      isToday: dateStr === today,
      isFuture: dateStr > today,
      month: d.getMonth(),
      dow: d.getDay(),
    })
    d.setDate(d.getDate() + 1)
  }
  return days
})

function mondayDow(jsDay) { return jsDay === 0 ? 7 : jsDay }

const paddingDays = computed(() => {
  const firstDay = new Date(currentYear.value, 0, 1)
  return mondayDow(firstDay.getDay()) - 1
})

const monthOffsets = computed(() => {
  const offsets = []
  let col = paddingDays.value + 1
  let prevMonth = -1
  yearDays.value.forEach((d, i) => {
    if (d.month !== prevMonth) {
      offsets.push({ name: monthNames[d.month], col: Math.ceil((col + i) / 7) + 1 })
      prevMonth = d.month
    }
  })
  return offsets
})

const weekStats = computed(() => {
  const allDays = [...Array(paddingDays.value).fill(null), ...yearDays.value]
  const weeks = []
  for (let i = 0; i < allDays.length; i += 7) {
    const chunk = allDays.slice(i, i + 7).filter(d => d && !d.isFuture)
    if (chunk.length === 0) continue
    const starDays = chunk.filter(d => d.score === 'star').length
    const hasDone = chunk.some(d => d.score !== 'none')
    weeks.push({ starDays, total: chunk.length, hasDone })
  }
  return weeks
})

const stats = computed(() => {
  const days = yearDays.value.filter(d => !d.isFuture && d.score !== 'none')
  const starDays = days.filter(d => d.score === 'star').length
  const starWeeks = weekStats.value.filter(w => w.starDays >= 5).length

  const today = new Date().toISOString().split('T')[0]
  let streak = 0
  const sorted = [...yearDays.value].reverse()
  for (const d of sorted) {
    if (d.isFuture) continue
    if (d.score !== 'none') streak++
    else break
  }

  const successRate = days.length > 0 ? Math.round(starDays / days.length * 100) : 0
  return { starDays, starWeeks, currentStreak: streak, successRate }
})

const monthStats = computed(() => {
  return monthNamesFull.map((name, mi) => {
    const days = yearDays.value.filter(d => d.month === mi && !d.isFuture)
    const star = days.filter(d => d.score === 'star').length
    const pct = days.length > 0 ? Math.round(star / days.length * 100) : 0
    let cls = 'bar-none'
    if (pct >= 70) cls = 'bar-star'
    else if (pct >= 40) cls = 'bar-mid'
    else if (pct > 0) cls = 'bar-fail'
    return { name, starDays: star, total: days.length, pct, class: cls }
  })
})

const selectedDayLog = computed(() => selectedDay.value ? store.dayLogs[selectedDay.value.dateStr] : null)

function weekClass(w) {
  if (w.starDays >= 5) return 'ws-star'
  if (w.starDays >= 3) return 'ws-mid'
  if (!w.hasDone) return 'ws-fail'
  return 'ws-normal'
}
function weekIcon(w) {
  if (w.starDays >= 5) return '🏆'
  if (w.starDays >= 3) return '⭐'
  if (!w.hasDone) return '○'
  return '·'
}

function selectDay(day) { selectedDay.value = day }
function tooltip(day) {
  if (day.isFuture) return ''
  const labels = { star: '🌟 Звёздный день', mid: '🟡 Хороший день', fail: '🔴 Слабый день', none: '⬜ Нет данных' }
  return `${formatDayFull(day.dateStr)}\n${labels[day.score] || ''}`
}
function formatDayFull(ds) {
  return new Date(ds + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}
function dayScoreLabel(s) {
  return { star: '🌟 Звёздный день', mid: '🟡 Хороший день', fail: '🔴 Слабый день', none: '⬜ Нет данных' }[s] || ''
}
function getItemName(id) {
  const h = store.habits.find(h => h.id === id)
  if (h) return h.name
  const t = store.tasks.find(t => t.id === id)
  return t?.name || id
}
</script>

<style scoped>
.year-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.year-header h1 {
  font-size: 2rem;
}

.year-header h1 span {
  color: var(--gold);
}

.year-header p {
  color: var(--text3);
  font-size: 0.9rem;
  margin-top: 4px;
}

.year-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.year-label {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  min-width: 60px;
  text-align: center;
}

.legend {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  color: var(--text2);
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-dot.star {
  background: var(--gold);
  box-shadow: 0 0 6px rgba(245, 200, 66, 0.5);
}

.legend-dot.mid {
  background: var(--yellow);
}

.legend-dot.fail {
  background: var(--red);
}

.legend-dot.none {
  background: var(--surface2);
  border: 1px solid var(--border);
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.summary-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.sum-icon {
  font-size: 1.8rem;
}

.sum-num {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text);
  line-height: 1;
}

.sum-label {
  font-size: 0.75rem;
  color: var(--text3);
  margin-top: 3px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.calendar-wrap {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  overflow-x: auto;
  margin-bottom: 32px;
}

.month-labels {
  display: grid;
  grid-template-columns: 28px repeat(53, 14px);
  gap: 2px;
  margin-bottom: 4px;
  min-width: max-content;
}

.month-label {
  font-size: 0.72rem;
  color: var(--text3);
  font-family: var(--font-display);
  font-weight: 600;
}

.day-labels {
  display: grid;
  grid-template-rows: repeat(7, 14px);
  gap: 2px;
  float: left;
  margin-right: 4px;
  padding-top: 2px;
}

.day-label {
  font-size: 0.65rem;
  color: var(--text3);
  line-height: 14px;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(53, 14px);
  grid-template-rows: repeat(7, 14px);
  grid-auto-flow: column;
  gap: 2px;
  min-width: max-content;
  overflow: hidden;
}

.cal-cell {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: var(--surface2);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}

.cal-cell:hover:not(.future):not(.empty) {
  transform: scale(1.3);
  z-index: 2;
}

.cal-cell.empty {
  background: transparent;
  border-color: transparent;
  cursor: default;
}

.cal-cell.future {
  opacity: 0.2;
  cursor: default;
}

.cal-cell.none {
  background: var(--surface2);
}

.cal-cell.star {
  background: var(--gold);
  border-color: var(--gold2);
  box-shadow: 0 0 4px rgba(245, 200, 66, 0.4);
}

.cal-cell.mid {
  background: var(--yellow);
  border-color: #c07800;
}

.cal-cell.fail {
  background: var(--red);
  border-color: var(--red2);
}

.cal-cell.today {
  outline: 2px solid var(--text);
  outline-offset: 1px;
}

.today-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--text);
}

.week-stats-section {
  margin-bottom: 32px;
}

.week-stats-section h3 {
  margin-bottom: 16px;
}

.week-stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.week-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 48px;
  padding: 8px 4px;
  border-radius: var(--radius-sm);
  background: var(--surface);
  border: 1px solid var(--border);
  cursor: default;
  transition: all var(--transition);
}

.ws-num {
  font-size: 0.65rem;
  color: var(--text3);
  font-weight: 700;
}

.ws-icon {
  font-size: 0.85rem;
}

.ws-label {
  font-size: 0.6rem;
  color: var(--text3);
}

.ws-star {
  background: rgba(245, 200, 66, 0.1);
  border-color: rgba(245, 200, 66, 0.3);
}

.ws-mid {
  background: rgba(240, 168, 48, 0.08);
  border-color: rgba(240, 168, 48, 0.2);
}

.ws-fail {
  opacity: 0.5;
}

.month-breakdown h3 {
  margin-bottom: 16px;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.month-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.mc-name {
  font-size: 0.82rem;
  font-weight: 700;
  min-width: 40px;
  color: var(--text2);
}

.mc-bar-wrap {
  flex: 1;
  height: 6px;
  background: var(--surface2);
  border-radius: 99px;
  overflow: hidden;
}

.mc-bar {
  height: 100%;
  border-radius: 99px;
  transition: width 0.8s ease;
}

.bar-star {
  background: var(--gold);
}

.bar-mid {
  background: var(--yellow);
}

.bar-fail {
  background: var(--red);
}

.bar-none {
  background: var(--surface2);
}

.mc-num {
  font-size: 0.75rem;
  color: var(--text3);
  min-width: 36px;
  text-align: right;
}

.day-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.day-score-big {
  padding: 12px 20px;
  border-radius: var(--radius-sm);
  text-align: center;
  font-weight: 700;
  font-size: 1.1rem;
  background: rgba(245, 200, 66, 0.1);
  color: var(--gold);
}

.day-score-big.fail {
  background: rgba(232, 64, 64, 0.1);
  color: var(--red);
}

.day-score-big.mid {
  background: rgba(240, 168, 48, 0.1);
  color: var(--yellow);
}

.day-score-big.none {
  background: var(--surface2);
  color: var(--text3);
}

.cl-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text3);
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.completed-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cl-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  padding: 8px 12px;
  background: var(--bg3);
  border-radius: var(--radius-sm);
}

.cl-check {
  width: 95%;
  overflow-wrap: break-word;
  white-space: normal;
  color: var(--green);
  font-weight: 700;
}

@media (max-width: 900px) {
  .summary-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .summary-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .year-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .cal-cell {
    width: 11px;
    height: 11px;
  }

  .cal-grid {
    grid-template-columns: repeat(53, 11px);
    grid-template-rows: repeat(7, 11px);
  }

  .month-labels {
    grid-template-columns: 28px repeat(53, 11px);
  }
}
</style>
