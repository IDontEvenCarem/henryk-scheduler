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
        .reverse()
        .sortBy('id')
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
        <div class="TodoStructure">
            <div class="Header">
                <h2>Your todo list:</h2>
            </div>
            <strong>Display range:</strong>
            <div class="settings">
                <label>From:</label>
                <input type="number" v-model="from" />
                <label>To:</label>
                <input type="number" v-model="to" />
                <label>Things done:</label>
                <select v-model="done">
                    <option value="yes">Tak</option>
                    <option value="no">Nie</option>
                    <option value="null">Oba</option>
                </select>
            </div>
            <input type="text" v-model="text" />
            <button @click="onAddTodo">Add todo:</button>
            <TransitionGroup tag="div" class="todo-wrapper">
                <div class="todo-element" :class="{'todo-done' : todo.done}" v-for="todo in todos" :key="todo.id" @click="onToggleTodo(todo)">
                    <span>{{ todo.text }}</span>
                    <p @click="onDeleteTodo(todo)" class="thrashcan">🗑️</p>
                </div>
            </TransitionGroup>
        </div>
    </div>
</template>

<style scoped>
.TodoStructure
{
    display: grid;
	grid-template-columns: auto;
	grid-template-rows: auto;
	background-color: white;
    color: black;
}
.Header
{
    text-align: center;
}
.todo-app-element-wrapper {
    margin: 1ch;
}

.settings {
    margin: 5px;
    display: grid;
    font-size: 17px;
    grid-template-columns: auto auto;
}

.todo-element {
    margin: 5px;
    padding: 5px;
    background-color: rgba(255, 255, 255, 0.3);
    color: black;
    border-radius: 5px;
    font-size: 1.1rem;
    transition: background-color 100ms ease;
    display: grid;
    grid-template-columns: auto min-content;
}

.todo-done {
    background-color: rgb(144, 238, 144);
    background-color: rgba(0, 255, 42, 0.5);
}

.thrashcan {
    cursor: pointer;
}

.todo-wrapper
{
    display: grid;
	grid-template-columns: auto;
	grid-template-rows: auto;
	background-color: gray;
}
input[type=text]
{
    margin: 5px;
    padding: 5px;
}


.v-move,
.v-enter-active,
.v-leave-active {
    transition: all 300ms ease;
    transform: scale(1);
}

.v-enter-from,
.v-leave-to {
    transform: scale(0);
}

.v-enter-to,
.v-leave-from {
    transform: scale(1);
}

.v-leave-active {
    position: absolute;
}

</style>