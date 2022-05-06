<script setup lang="ts">
const emit = defineEmits<{
    (e: 'closeModal'): void
}>();

const props = defineProps<{
    title?: string,
    contents?: string
}>()
</script>

<template>
    <div class="modal-card">
        <h2 v-if="props.title">{{props.title}}</h2>
        <p v-if="props.contents">{{props.contents}}</p>
        <br>
        <button @click="() => emit('closeModal')">Ok</button>
    </div>
</template>

<style scoped>
.modal-card {
    min-width: 100px;
    background-color: white;
    color: black;
    border-radius: 5px;
    padding: 1ch;
    box-shadow: 0px 0px 10px black;
}
</style>