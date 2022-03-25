<script setup lang="ts">
import {ref, type Ref} from 'vue'
import {database, dynamicQuery, MarkTodoDone, MarkTodoUndone, DeleteTodo} from '@/dbintegration'
import type { Todo } from '@/database';

const from = ref(0)
const to = ref(100)
const done : Ref<"yes"|"no"|"null"> = ref("null")

const todos = dynamicQuery(
    database.todos,
    [from, to, done],
    (table, from, to, done) => table
        .where('id')
        .between(from, to)
        .filter(todo => done == 'null' || (todo.done && done == 'yes') || (!todo.done && done == 'no'))
)

const text = ref("")

async function onAddTodo() {
    await database.todos.add({ done: false, text: text.value });
    text.value = ""
}

function onToggleTodo (todo: Todo) {
    if (todo.id === undefined) return;
    if (todo.done) {
        MarkTodoUndone(todo.id)
    } else {
        MarkTodoDone(todo.id)
    }
}

function onDeleteTodo (todo: Todo) {
    if (todo.id === undefined) return;
    DeleteTodo(todo.id);
}

</script>

<template>
    <div class="todo-app-element-wrapper">
        <h2>Todos:</h2>
        <div class="settings">
            <label>Od:</label>
            <input type="number" v-model="from" />
            <label>Do:</label>
            <input type="number" v-model="to" />
            <label>Zrobione:</label>
            <select v-model="done">
                <option value="yes">Tak</option>
                <option value="no">Nie</option>
                <option value="null">Oba</option>
            </select>
        </div>
        <input type="text" v-model="text" />
        <button @click="onAddTodo">Add todo:</button>
        <div class="todo-wrapper">
            <div class="todo-element" :class="{'todo-done' : todo.done}" v-for="todo in todos" :key="todo.id">
                <input type="checkbox" :checked="todo.done" @change="onToggleTodo(todo)">
                {{ todo.text }}
                <p @click="onDeleteTodo(todo)" class="thrashcan">🗑️</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.todo-app-element-wrapper {
    margin: 1ch;
}

.settings {
    display: grid;
    grid-template-columns: auto auto;
}

.todo-element {
    margin: 5px;
    padding: 5px;
    background-color: lightcoral;
    color: black;
    border-radius: 5px;
    font-size: 1.1rem;
    transition: background-color 100ms ease;
    display: grid;
    grid-template-columns: min-content auto min-content;
}

.todo-done {
    background-color: lightgreen;
}

.thrashcan {
    cursor: pointer;
}
</style>
