<script setup lang="ts">
import { database, type ID, type Note } from '@/database';
import { dynamicQuery } from '@/dbintegration';
import {QCardActions, QCardSection, QBtn, QList, QCard, QItem, QItemSection, QItemLabel, QScrollArea, QInput} from 'quasar'
import { ref } from 'vue';

const emit = defineEmits<{
    (e: 'selected', id: ID): void,
    (e: 'canceled'): void
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

const searchtext = ref("")
const notes = dynamicQuery(database.notes, [searchtext], 
    (table, search) => table.orderBy('id').reverse().filter(note => SearchInNote(search, note))
)

const selected = ref(-1)

</script>

<template>
    <QCard>
        <QCardSection>
            <div class="text-h6">Select a Note</div>
            <QInput v-model="searchtext" label="Search"></QInput>
            <QScrollArea style="height: 50vh; min-width: 50vw;">
                <QList>
                    <TransitionGroup>
                        <QItem :active="selected === note.id!" clickable @click="selected = note.id!" v-for="note in notes" :key="note.id">
                            <QItemSection>
                                <QItemLabel>
                                    <strong>{{note.title || "<No title>"}}</strong>
                                </QItemLabel>
                                <QItemLabel caption>
                                    <p>{{ShortenText(256, RemoveTags(note.content))}}</p>
                                </QItemLabel>
                            </QItemSection>
                        </QItem>
                    </TransitionGroup>
                </QList>
            </QScrollArea>
        </QCardSection>
        <QCardActions>
            <QBtn flat color="primary" :disable="selected === -1" @click="emit('selected', {kind: 'Note', id: selected})">Select</QBtn>
            <QBtn flat color="negative" @click="emit('canceled')">Cancel</QBtn>
        </QCardActions>
    </QCard>
</template>

<style scoped>
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
