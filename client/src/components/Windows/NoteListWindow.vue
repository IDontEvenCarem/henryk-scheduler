<script setup lang="ts">
import { QList, QScrollArea, QBtn, QInput } from 'quasar'
import { AddComponentAfterFocusedKey } from '@/injections'
import { inject, ref } from 'vue'
import { dynamicQuery } from '@/dbintegration'
import { database } from '@/database';
import NoteCreateWindowVue from './NoteCreateWindow.vue';

const props = defineProps<{
    setTitle: (title: string) => void,
}>()

const iat = inject(AddComponentAfterFocusedKey)
const searchtext = ref("")
const query = dynamicQuery(database.notes, [searchtext], 
    (table, search) => table.filter(
        note => 
            note.title.search(new RegExp(search, "igm")) !== -1
            || note.content.search(new RegExp(search, "igm")) !== -1
    )
)

props.setTitle("Notes")

function CreateNote () {
    if (iat !== undefined) {
        iat(NoteCreateWindowVue)
    }
}

function RemoveTags (text: string) {
    return text
}

</script>

<template>
    <div class="wrapper">
        <QInput v-model="searchtext" label="Search"></QInput>
        <QScrollArea>
            <TransitionGroup>
                <div v-for="note in query" :key="note.id">
                    <strong>{{note.title}}</strong>
                    <p>{{RemoveTags(note.content)}}</p>
                </div>
            </TransitionGroup>
        </QScrollArea>
        <QBtn color="primary" @click="CreateNote">Create Note</QBtn>
    </div>
</template>

<style scoped>
.wrapper {
    padding: 20px;
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 100%;
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