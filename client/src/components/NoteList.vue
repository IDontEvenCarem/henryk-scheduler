<script setup lang="ts">
import {dynamicQuery} from '@/dbintegration'
import {database} from '@/database'
import { QItem, QList, QItemSection, QItemLabel, QScrollArea, QBtn} from 'quasar';
import { inject } from 'vue';
import { AddComponentAfterFocusedKey } from '@/injections';
import NoteCreate from '@/components/NoteCreate.vue'
import NoteDisplayVue from './Windows/NoteDisplay.vue';

const props = defineProps<{
    setTitle?: (title: string) => void
}>()

const notes = dynamicQuery(database.notes, [], table => table.toCollection())

const iat = inject(AddComponentAfterFocusedKey)

function newcreate() {
    if (iat !== undefined) {
        iat(NoteCreate, {})
    }
}

function openNote(idx: number) {
    if (iat !== undefined) {
        iat(NoteDisplayVue, {id: idx})
    }
}

if (props.setTitle) {
    props.setTitle("Notes")
}

</script>

<template>
    <QScrollArea style="height: 100%;" visible>
        <QBtn color="primary" @click="newcreate()">
            Create New
        </QBtn>
        <QList separator>
            <QItem v-for="note in notes" clickable @click="openNote(note.id!)">
                <QItemSection>
                    <QItemLabel>
                        {{note.title}}
                    </QItemLabel>
                    <QItemLabel caption>
                        {{ note.content.replace(/\<\/?[^\>]+\>/g, ' ').substring(0, 64) + (note.content.length > 64 ? "..." : "")}}
                    </QItemLabel>
                </QItemSection>
            </QItem>
        </QList>
    </QScrollArea>
</template>

<style scoped>
a {
    text-decoration: none;
    color: inherit;
}
</style>