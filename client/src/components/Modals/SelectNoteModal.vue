<script setup lang="ts">
import { useDialogPluginComponent, QDialog, QCard, QBtn, QBtnGroup, QScrollArea, QToolbar, QToolbarTitle, QList, QItem, QItemSection, QItemLabel } from 'quasar'
import { dynamicQuery, database } from '@/dbintegration'
import { ref, watchEffect } from 'vue'

const emit = defineEmits<{
    (e: 'closeModal', selected?: number): void
}>();

const props = defineProps<{
    title?: string,
    contents?: string
}>()

const notes = dynamicQuery(database.notes, [], table => table.toCollection())
const selected = ref(-1)

</script>

<template>
    <QCard>
        <QToolbar style="background: var(--q-primary);">
            <QToolbarTitle>Select a note</QToolbarTitle>
        </QToolbar>
        <QScrollArea style="min-height: 40vh; min-width: 30vw;">
            <QList separator v-if="notes.length > 0">
                <QItem v-for="note in notes" :key="note.id!" :active="note.id === selected" @click="selected = note.id!" clickable active-class="bg-cyan-2">
                    <QItemSection>
                        <QItemLabel>
                            {{ note.title }}
                        </QItemLabel>
                        <QItemLabel caption>
                            {{
                                note.content.replace(/\<\?[^\>]+\>/g, ' ').substring(0, 64) + (note.content.length
                                    > 64 ? "..." : "")
                            }}
                        </QItemLabel>
                    </QItemSection>
                </QItem>
            </QList>
        </QScrollArea>
        <QBtnGroup spread>
            <QBtn color="primary" :disabled="selected === -1" @click="_ => emit('closeModal',selected)">Link</QBtn>
            <QBtn color="negative" @click="emit('closeModal')">Cancel</QBtn>
        </QBtnGroup>
    </QCard>
</template>