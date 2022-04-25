<script setup lang="ts">
import {} from 'vue'

const emit = defineEmits<{
    (e: 'closeModal', result: boolean): void
}>();

const props = defineProps<{
    title?: string,
    contents?: string
}>()
</script>

<template>
    <div class="modal-card">
        <h6 v-if="props.title">{{props.title}}</h6>
        <p v-if="props.contents">{{props.contents}}</p>
        <br>
        <button @click="() => emit('closeModal', true)">Yes</button>
        <button @click="() => emit('closeModal', false)">No</button>
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