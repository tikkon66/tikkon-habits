<template>
    <div class="habits-grid">
        <div v-for="h in storeHabits">
            <ItemCard :habit="h" :allDays="allDays" @openHabitModal="emit('openHabitModal', h)" @deleteHabit="val =>  emit('deleteHabit', val)" />
        </div>
    </div>
</template>

<script setup>
import ItemCard from './ItemCard.vue'
import { computed } from 'vue';

const props = defineProps({
    storeHabits: Object,
    allDays: Array 
});

const storeHabits = computed(() => props.storeHabits || {})
const allDays = computed(() => props.allDays || {})

const emit = defineEmits(['openHabitModal', 'deleteHabit']);

</script>

<style scoped>
.habits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
}
</style>