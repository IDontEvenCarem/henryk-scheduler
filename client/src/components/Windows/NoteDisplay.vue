<script setup lang="ts">
import {ref, watchEffect, type Ref} from 'vue'
import { database, GetWithLinks, ToggleTodo, type Note, type OneshotEvent, type RepeatingEvent, type ThingName } from '@/database';
import type { ReplacedID } from '@/database'
import type { Todo } from '@/dbintegration';
import { QIcon, QCheckbox, QBtn, QBtnGroup, QScrollArea} from 'quasar'
import { EZModalLink } from '@/ezmodals'

const props = defineProps<{
    id: number,
    setTitle?: (title: string) => void
}>()

const state = ref<'loading' | 'error' | 'ok'>('loading')

const note : Ref<Note | null> = ref(null)
const links : Ref<ReplacedID<Note | Todo | OneshotEvent | RepeatingEvent>[]> = ref([])

// const links_todos = dynamicQuery(database.link_todo_notes, [], table => table.where('note_id').equals(props.id))
// const todos = dynamicQuery(database.todos, [links_todos], table => table.where('id').anyOf(links_todos.value.map(l => l.todo_id)))
// // const links_calendar = dynamicQuery(database.link_notes_calendar, [], table => table.where('note_id').equals(props.id))
// const todo_completions = computed(() => {
//     return todos.value.filter(t => t.done).map(t => t.id!)
// })

// watchEffect(() => {
//     todo_completions.value = todos.value.filter(t => t.done).map(t => t.id!)
// })

if (props.setTitle) {
    props.setTitle("Note".padEnd(25, ' '))
}

const sortorder : Record<ThingName, number> = {Todo: 0, Note: 1, OneshotEvent: 2, ScheduleEvent: 3}

GetWithLinks({kind: 'Note', id: props.id}).then(value => {
    console.log("== NoteDisplay.vue ==")
    console.log(value.linked)
    note.value = value.value as Note
    links.value = value.linked
    links.value.sort((l, r) => (sortorder[l.id.kind] < sortorder[r.id.kind]) as unknown as number - 0.5)
    state.value = 'ok'
    if (props.setTitle) {
        props.setTitle((value.value as Note).title)
    }
}).catch(err => {
    state.value = 'error'
})

// database.notes.get(props.id).then(lnote => {
//     if (lnote) {
//         state.value = 'ok'
//         note.value = lnote
//         if (props.setTitle) {
//             props.setTitle(lnote.title.substring(0, 20) + (lnote.title.length > 20 ? "..." : ""))
//         }
//     } else {
//         state.value = 'error'
//     }
// }).catch(err => {
//     state.value = 'error'
// })

function update(id: number) {
    ToggleTodo(id)
}

function AddLink() {
    EZModalLink({kind: 'Note', id: props.id})
}

</script>

<template>
    <div v-if="state == 'error'">
        <h1 color="red">An error has occured!</h1>
    </div>
    <div v-else-if="state == 'loading'">
        <h1 style="text-align: center;">Loading...</h1>
    </div>
    <QScrollArea v-else style="width: var(--gl-width); height: var(--gl-height);">
        <div class="note-view">
            <h4>{{note?.title || "No title"}} </h4>
            <div v-html="note?.content || 'No content'"></div>
            <hr>
            <div>
                <p><strong>Links:</strong> <strong v-if="links.length === 0">None yet</strong></p>
                <div v-for="link in links" :key="link.id.toString()">
                    <div v-if="link.id.kind === 'Todo'">
                        {{(link as ReplacedID<Todo>).done}}
                    </div>
                    <div v-else-if="link.id.kind === 'Note'">
                        NOTE
                    </div>
                    <div v-else-if="link.id.kind === 'OneshotEvent'">
                        ONESHOTEVENT
                    </div>
                    <div v-else-if="link.id.kind === 'ScheduleEvent'">
                        ScheduleEvent
                    </div>
                </div>
                <QBtnGroup flat>
                    <QBtn flat color="primary" @click="AddLink">Add Link</QBtn>
                    <QBtn flat color="primary">Edit</QBtn>
                    <QBtn flat color="negative">Delete</QBtn>
                </QBtnGroup>
            </div>
        </div>
    </QScrollArea>
</template>

<style scoped>
.note-view {
    padding: 0 5ch;
}
.link {
    padding: 0 2ch;
}
</style>