<template>
    <div class="modal-overlay" @click.self="emit('closeWindow')">
        <div class="modal">

            <div class="modal-form">
                <b>{{ message }}</b>
                <div class="modal-actions">
                    <button type="submit" class="btn btn-primary" :disabled="saving" @click="doThis">Подвердить</button>
                    <button type="button" class="btn btn-ghost" @click="emit('closeWindow')">Отменить</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const { message } = defineProps({
    message: String
});

const emit = defineEmits(['doThis', 'closeWindow']);

async function doThis() {
    emit('doThis');
    emit('closeWindow')
}

</script>

<style scoped>
.modal-form {
    display: flex;
    flex-direction: column;
    gap: 18px;

    text-align: center;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.modal-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 8px;
    gap: 18px;
}
</style>