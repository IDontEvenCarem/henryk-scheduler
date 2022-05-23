<script setup lang="ts">
import { QList, QItem, QItemSection, QItemLabel, QScrollArea, QBtn, QInput } from 'quasar'
import { AddComponentAfterFocusedKey } from '@/injections'
import { inject, ref } from 'vue'
import { dynamicQuery } from '@/dbintegration'
import { database, type Note } from '@/database';
import NoteCreateWindowVue from './NoteCreateWindow.vue';
import NoteDisplayVue from './NoteDisplay.vue';

const props = defineProps<{
    setTitle: (title: string) => void,
}>()

function SearchInNote (needle: string, note: Note) {
    const regex = new RegExp(needle, 'igm')
    return (note.title.search(regex) !== -1) || (note.content.search(regex) !== -1)
}

function RemoveTags (text: string) {
    return text.replace(/\<\/?\w+( [^\>]+)?\>/igm, '')
}

function ShortenText (max_len: number, text: string) {
    if (text.length < max_len) {
        return text
    } else {
        return text.substring(0, max_len) + '...'
    }
}

const iat = inject(AddComponentAfterFocusedKey)
const searchtext = ref("")
const query = dynamicQuery(database.notes, [searchtext], 
    (table, search) => table.orderBy('id').reverse().filter(note => SearchInNote(search, note))
)

props.setTitle("Notes")

function CreateNote () {
    if (iat !== undefined) {
        iat(NoteCreateWindowVue)
    }
}

function ViewNote (note: Note) {
    if (iat !== undefined) {
        iat(NoteDisplayVue, {id: note.id})
    }
}

const shouldShortenText = true

</script>

<template> 
    <div class="wrapper">
        <QInput v-model="searchtext" label="Search"></QInput>
        <QScrollArea>
            <QList>
                <TransitionGroup>
                    <QItem clickable @click="ViewNote(note)" v-for="note in query" :key="note.id">
                        <QItemSection>
                            <QItemLabel>
                                <strong>{{note.title || "<No title>"}}</strong>
                            </QItemLabel>
                            <QItemLabel caption>
                                <p v-if="shouldShortenText">{{ShortenText(256, RemoveTags(note.content))}}</p>
                                <p v-else>{{RemoveTags(note.content)}}</p>
                            </QItemLabel>
                        </QItemSection>
                    </QItem>
                </TransitionGroup>
            </QList>
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