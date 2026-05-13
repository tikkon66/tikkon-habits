<template>
    <div class="loading-screen">
        <div class="logo-mark">⬡</div>
        <span>tikkon.habit</span>
    </div>
</template>

<script setup>

</script>

<style scoped>
.loading-screen {
    position: fixed;
    inset: 0;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    pointer-events: all;

}

.loading-screen .logo-mark {
    font-size: 3rem;
    animation: spin 2s linear infinite;
    transform-origin: center;
    display: inline-block;
    color: var(--gold);
}

.loading-screen span {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.2rem;
    color: var(--text2);
    letter-spacing: 0.05em;
}
</style>