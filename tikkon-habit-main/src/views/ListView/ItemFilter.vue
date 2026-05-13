<template>
    <div class="filter-wrapper">
        <select v-model="filterMean">
            <option value="all">Все</option>
            <option value="important">Важные</option>
            <option value="nonImportant">Неважные</option>
        </select>
        <ItemList :storeHabits="fixHabits" :allDays="allDays" @openHabitModal="val => emit('openHabitModal', val)"  @deleteHabit="val =>  emit('deleteHabit', val)"/>

    </div>

</template>

<script setup>
import ItemList from './ItemList.vue';
import { computed, ref } from 'vue';

const props = defineProps({
    storeHabits: Array,
    allDays: Array
});

const storeHabits = computed(() => props.storeHabits || [])
console.log(storeHabits.value)
const filterMean = ref('all')
const fixHabits = computed(() => {
    switch(filterMean.value) {
        case 'all':
            return storeHabits.value
        case 'important':
            return storeHabits.value.filter(e => e.important)
        case 'nonImportant':
            return storeHabits.value.filter(e => !e.important)
    }
    })

const allDays = computed(() => props.allDays || {})

const emit = defineEmits(['openHabitModal', 'deleteHabit']);


</script>
<style scoped>
.filter-wrapper{
    display: flex;
    flex-direction: column;
    gap: 10px;
}
select {
    padding: 10px;
}
</style>