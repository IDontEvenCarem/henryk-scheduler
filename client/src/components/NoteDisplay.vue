<script setup lang="ts">
import {ref, watchEffect, type Ref} from 'vue'
import { database, ToggleTodo, type Note } from '@/database';
import { dynamicQuery, type Todo } from '@/dbintegration';
import { computed } from '@vue/reactivity';
import { QIcon, QCheckbox } from 'quasar'

const props = defineProps<{
    id: number,
    setTitle?: (title: string) => void
}>()

const state = ref<'loading' | 'error' | 'ok'>('loading')

const links_todos = dynamicQuery(database.link_todo_notes, [], table => table.where('note_id').equals(props.id))
const todos = dynamicQuery(database.todos, [links_todos], table => table.where('id').anyOf(links_todos.value.map(l => l.todo_id)))
// const links_calendar = dynamicQuery(database.link_notes_calendar, [], table => table.where('note_id').equals(props.id))
const note : Ref<Note | null> = ref(null)
const todo_completions = computed(() => {
    return todos.value.filter(t => t.done).map(t => t.id!)
})

// watchEffect(() => {
//     todo_completions.value = todos.value.filter(t => t.done).map(t => t.id!)
// })

if (props.setTitle) {
    props.setTitle("Note".padEnd(25, ' '))
}

database.notes.get(props.id).then(lnote => {
    if (lnote) {
        state.value = 'ok'
        note.value = lnote
        if (props.setTitle) {
            props.setTitle(lnote.title.substring(0, 20) + (lnote.title.length > 20 ? "..." : ""))
        }
    } else {
        state.value = 'error'
    }
}).catch(err => {
    state.value = 'error'
})

function update(id: number) {
    ToggleTodo(id)
}

</script>

<template>
    <div v-if="state == 'error'">
        <h1 color="red">An error has occured!</h1>
    </div>
    <div v-else-if="state == 'loading'">
        <h1 style="text-align: center;">Loading...</h1>
    </div>
    <div v-else class="note-view">
        <h4>{{note?.title || "No title"}}</h4>
        <div v-html="note?.content || 'No content'"></div>
        <hr>
        <strong>Links:</strong>
        <div v-for="t in todos" class="link">
            <QIcon name="link"></QIcon>
            <QCheckbox @update:model-value="update(t.id!)" :model-value="todo_completions" :val="t.id" color="positive"></QCheckbox>
            <span>{{t.text}}</span>
        </div>
    </div>
</template>

<style scoped>
.note-view {
    padding: 0 5ch;
}
.link {
    padding: 0 2ch;
}
</style>