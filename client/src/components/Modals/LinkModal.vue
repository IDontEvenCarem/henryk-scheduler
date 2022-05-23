<script setup lang="ts">
import {ref} from 'vue'
import {QCard, QBtn, QCardSection, QCardActions} from 'quasar'
import {database, Link, type ID, type ReplacedID} from '@/database'
import { computed } from '@vue/reactivity';
import { dynamicQuery } from '@/dbintegration';
import NoteSelector from '../Selectors/NoteSelector.vue';
import TodoSelector from '../Selectors/TodoSelector.vue';
import EventSelector from '../Selectors/EventSelector.vue';

const props = defineProps<{
    from: ID
}>()
const emits = defineEmits<{
    (e: 'closeModal', canceled: boolean): void
}>()

const mode = ref("select")

const dummy = computed(() => mode.value.length)
const maybeTodos = computed(() => mode.value === 'todo' && dynamicQuery(database.todos, [], table => table.toCollection()) )
const maybeNotes = computed(() => mode.value === 'note' && dynamicQuery(database.notes, [], table => table.toCollection()) )
const maybeOneshotEvents = computed(() => mode.value === 'event' && dynamicQuery(database.oneshot_events, [], table => table.toCollection()) )
const maybeScheduleEvents = computed(() => mode.value === 'event' && dynamicQuery(database.repeating_events, [], table => table.toCollection()) )

function doLink (other: ID) {
    Link(props.from, other)
    emits('closeModal', false)
}

</script>

<template>
    <QCard v-if="mode === 'select'" style="transition: width 800ms, height 800ms;">
        <template v-if="mode === 'select'">
            <QCardSection>
                <div class="text-h6">Link to what?</div>
            </QCardSection>
            <QCardActions vertical>
                <QBtn flat color="primary" @click="mode = 'todo'">Todo</QBtn>
                <QBtn flat color="primary" @click="mode = 'note'">Note</QBtn>
                <QBtn flat color="primary" @click="mode = 'event'">Event</QBtn>
                <QBtn flat color="negative" @click="emits('closeModal', true)">Cancel</QBtn>
            </QCardActions>
        </template>
        <template v-else-if="mode === 'todo'">
            <QCardSection>
                <div class="text-h6">Select a Todo</div>
            </QCardSection>
            <QCardActions>
                <QBtn flat color="primary">Select</QBtn>
                <QBtn flat color="negative" @click="mode = 'select'">Cancel</QBtn>
            </QCardActions>
        </template>
        <template v-else-if="mode === 'note'">
            <QCardSection>
                <div class="text-h6">Select a Note</div>
            </QCardSection>
            <QCardActions>
                <QBtn flat color="primary">Select</QBtn>
                <QBtn flat color="negative" @click="mode = 'select'">Cancel</QBtn>
            </QCardActions>
        </template>
        <template v-else-if="mode === 'event'">
            <QCardSection>
                <div class="text-h6">Select an Event</div>
            </QCardSection>
            <QCardActions>
                <QBtn flat color="primary">Select</QBtn>
                <QBtn flat color="negative" @click="mode = 'select'">Cancel</QBtn>
            </QCardActions>
        </template>
        <template v-else>
            <QCardSection>
                <p>This should not be visible</p>
            </QCardSection>
            <QCardActions>
                <QBtn flat color="negative" @click="mode = 'select'">Go back</QBtn>
            </QCardActions>
        </template>
    </QCard>
    <NoteSelector v-else-if="mode === 'note'" @canceled="mode = 'select'" @selected="doLink"></NoteSelector>
    <TodoSelector v-else-if="mode === 'todo'" @canceled="mode = 'select'" @selected="doLink"></TodoSelector>
    <EventSelector v-else-if="mode === 'event'" @canceled="mode = 'select'" @selected="doLink"></EventSelector>
</template>