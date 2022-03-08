<script setup lang="ts">
import {ref} from 'vue'
import {useTodoStore} from '@/stores/Todos'
const todoStore = useTodoStore();

const text = ref('')

async function onAddTodo() {
    await todoStore.add_todo(text.value)
    text.value = ''
}

</script>

<template>
    <h2>Todos:</h2>
    <div>
        <input type="text" v-model="text">
        <button @click="onAddTodo">Add todo:</button>
        <div>
            <div v-for="todo in todoStore.todos" :key="todo.id">{{todo.text}}</div>
        </div>
    </div>
</template>
