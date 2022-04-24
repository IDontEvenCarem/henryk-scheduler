<script setup lang="ts">
import {ref, type Ref} from 'vue'
import { database, type Note } from '@/database';

const props = defineProps<{
    id: number,
    setTitle?: (title: string) => void
}>()

const loading = ref(true)
const errored = ref(false)
const note : Ref<Note | null> = ref(null)


if (props.setTitle) {
    props.setTitle("Note".padEnd(25, ' '))
}

database.notes.get(props.id).then(lnote => {
    if (lnote) {
        note.value = lnote
        if (props.setTitle) {
            props.setTitle(lnote.title.substring(0, 20) + (lnote.title.length > 20 ? "..." : ""))
        }
    } else {
        errored.value = true
    }
    console.log(lnote)
    loading.value = false

}).catch(err => {
    errored.value = true
})

</script>

<template>
    <div v-if="errored">
        <h1 color="red">An error has occured!</h1>
    </div>
    <div v-else-if="loading">
        <h1 style="text-align: center;">Loading...</h1>
    </div>
    <div v-else>
        <h3>{{note?.title || "No title"}}</h3>
        <div v-html="note?.content || 'No content'"></div>
    </div>
</template>