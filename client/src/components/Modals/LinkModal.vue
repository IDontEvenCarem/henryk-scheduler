<script setup lang="ts">
import {ref} from 'vue'
import {QCard, QBtn, QCardSection, QCardActions} from 'quasar'
import {database, Link, type ID, type ReplacedID} from '@/database'
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

function doLink (other: ID) {
    Link(props.from, other)
    emits('closeModal', false)
}

</script>

<template>
    <QCard v-if="mode === 'select'" style="transition: width 800ms, height 800ms;">
        <QCardSection>
            <div class="text-h6">Link to what?</div>
        </QCardSection>
        <QCardActions vertical>
            <QBtn flat color="primary" @click="mode = 'todo'">Todo</QBtn>
            <QBtn flat color="primary" @click="mode = 'note'">Note</QBtn>
            <QBtn flat color="primary" @click="mode = 'event'">Event</QBtn>
            <QBtn flat color="negative" @click="emits('closeModal', true)">Cancel</QBtn>
        </QCardActions>
    </QCard>
    <NoteSelector v-else-if="mode === 'note'" @canceled="mode = 'select'" @selected="doLink"></NoteSelector>
    <TodoSelector v-else-if="mode === 'todo'" @canceled="mode = 'select'" @selected="doLink"></TodoSelector>
    <EventSelector v-else-if="mode === 'event'" @canceled="mode = 'select'" @selected="doLink"></EventSelector>
</template>