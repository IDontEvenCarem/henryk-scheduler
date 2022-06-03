<script setup lang="ts">
import {inject, ref, watchEffect, getCurrentInstance, onMounted, onScopeDispose } from 'vue'
import type { Ref } from 'vue'
import { database, GetWithLinks, ToggleTodo } from '@/database';
import type { ReplacedID, Note, OneshotEvent, RepeatingEvent, ThingName, ID } from '@/database'
import type { Todo } from '@/dbintegration';
import { QIcon, QCheckbox, QBtn, QBtnGroup, QScrollArea} from 'quasar'
import { EZModalLink } from '@/ezmodals'
import { AddComponentAfterFocusedKey } from '@/injections'
import LinksView from '@/components/LinksView.vue'

const props = defineProps<{
    id: number,
    setTitle?: (title: string) => void
}>()

const state = ref<'loading' | 'error' | 'ok'>('loading')

const note : Ref<Note | null> = ref(null)
const links : Ref<ReplacedID<Note | Todo | OneshotEvent | RepeatingEvent>[]> = ref([])

const iat = inject(AddComponentAfterFocusedKey)

if (props.setTitle) {
    props.setTitle("Note".padEnd(25, ' '))
}

const sortorder : Record<ThingName, number> = {Todo: 0, Note: 1, OneshotEvent: 2, ScheduleEvent: 3}

function Refresh() {
    requestAnimationFrame(() => {
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
    })
}


onMounted(() => {
    Refresh()
    database.link.hook.creating.subscribe(Refresh)
    database.link.hook.deleting.subscribe(Refresh)
})

onScopeDispose(() => {
    database.link.hook.creating.unsubscribe(Refresh);
    database.link.hook.deleting.unsubscribe(Refresh);
})

function update(id: number) {
    ToggleTodo(id)
}

function AddLink() {
    EZModalLink({kind: 'Note', id: props.id})
}

function OpenNote (id: ID) {
    if (iat !== undefined) {
        // iat(getCurrentInstance()?.type!, {id: id.id, setTitle: props.setTitle})
    }
}

function OpenOneshotEvent(id: ID) {

}

function OpenScheduledEvent(id: ID) {

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
                <QBtnGroup flat>
                    <QBtn flat color="primary" @click="AddLink">Add Link</QBtn>
                    <QBtn flat color="primary">Edit</QBtn>
                    <QBtn flat color="negative">Delete</QBtn>
                </QBtnGroup>
            </div>
        </div>
        <LinksView :links="links"></LinksView>
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