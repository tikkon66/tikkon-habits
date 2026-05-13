<template>
    <div v-if="habitModal" class="modal-overlay" @click.self="emit('closeModal')">
        <div class="modal">
            <div class="modal-header">
                <span class="modal-title">{{ editHabit?.id ? 'Редактировать привычку' : 'Новая привычка' }}</span>
                <button class="modal-close" @click="emit('closeModal')">✕</button>
            </div>
            <form @submit.prevent="emit('saveHabit')" class="modal-form">
                <div class="form-group">
                    <label class="form-label">Название</label>
                    <input v-model="hForm.name" type="text" class="input" placeholder="Например: Медитация 15 мин"
                        required />
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Время (необязательно)</label>
                        <input v-model="hForm.time" type="time" class="input" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Важная привычка</label>
                        <div class="toggle-wrap" @click="hForm.important = !hForm.important">
                            <div class="toggle" :class="{ on: hForm.important }"></div>
                            <span style="font-size:0.9rem; color:var(--text2)">{{ hForm.important ? 'Да' : 'Нет'
                            }}</span>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Дни недели</label>
                    <div class="chip-row">
                        <span v-for="d in allDays" :key="d.v" class="chip" :class="{ active: hForm.days.includes(d.v) }"
                            @click="emit('toggleDay', d.v)">{{ d.l }}</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-ghost" @click="emit('closeModal')">Отмена</button>
                    <button type="submit" class="btn btn-primary" :disabled="saving">
                        {{ saving ? 'Сохраняем...' : editHabit?.id ? 'Сохранить' : 'Создать' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    habitModal: Boolean,
    editHabit: Object,
    hForm: Object,
    allDays: Array,
    saving: Boolean
});

const habitModal = computed(() => props.habitModal);
const editHabit = computed(() => props.editHabit) || {};
const hForm = computed(() => props.hForm);
const allDays = computed(() => props.allDays);
const saving = computed(() => props.saving);

const emit = defineEmits(['saveHabit', 'toggleDay', 'closeModal']);

</script>

<style scoped>
.modal-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 8px;
}
</style>