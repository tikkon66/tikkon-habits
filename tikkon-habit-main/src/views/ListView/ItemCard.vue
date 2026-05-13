<template>
  <Confirm v-if="isConfirm" :message="'Удалить привычку?'" @doThis="emit('deleteHabit', habit.id)" @closeWindow="isConfirm = false"/>
    <div :key="habit.id" class="habit-card" :class="{ important: habit.important }">
        <div class="hc-top">
            <div class="hc-info">
                <div class="hc-dot" :class="habit.important ? 'dot-important' : 'dot-normal'"></div>
                <span class="hc-name">{{ habit.name }}</span>
            </div>
           
        </div>
        <div class="hc-meta">
            <div class="chip-row">
              <span v-for="d in allDays" :key="d.v" class="chip" :class="{ active: habit.days?.includes(d.v) }">
                {{ d.l }}
              </span>
            </div>
            <div class="hc-badges">
                <span v-if="habit.time" class="badge badge-blue">⏰ {{ habit.time }}</span>
                <span v-if="habit.important" class="badge badge-gold">★ Важное</span>
            </div>
        </div> 
        <div class="hc-actions">
                <button class="btn btn-icon btn-sm" @click="emit('openHabitModal', habit)" title="Редактировать">✎</button>
                <button class="btn btn-icon btn-sm btn-danger-icon" @click="isConfirm = true"
                    title="Удалить">✕</button>
            </div>
    </div>

</template>

<script setup>
import { computed, ref, } from 'vue';
import Confirm from '../../components/Confirm.vue';

const emit = defineEmits(['openHabitModal', 'deleteHabit'])

const props = defineProps({
    habit: Object,
    allDays: Array,
})
const habit = computed(() => props.habit || {days:"",})
const allDays = computed(() => props.allDays || []);

const isConfirm = ref(false);
</script>

<style scoped>
.habit-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  transition: all var(--transition);
}

.habit-card:hover {
  border-color: var(--border2);
}

.habit-carday.important {
  border-color: rgba(245, 200, 66, 0.2);
  background: rgba(245, 200, 66, 0.03);
}

.hc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.hc-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.hc-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.hc-name {
  width: 95%;
  overflow-wrap: break-word;
  white-space: normal;
  font-weight: 600;
  font-size: 0.95rem;
}

.hc-actions {
  justify-self: end;
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.btn-danger-icon {
  color: var(--red) !important;
}

.hc-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hc-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

</style>