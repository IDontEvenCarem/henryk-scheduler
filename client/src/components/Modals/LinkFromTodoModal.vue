<script setup lang="ts">
import { useDialogPluginComponent, QDialog, QCard, QBtn, QBtnGroup, useQuasar } from 'quasar'
import SelectEventModalVue from './SelectEventModal.vue';
import SelectNoteModalVue from './SelectNoteModal.vue';

import {database} from '@/dbintegration'
import { useModalStack } from '@/stores/ModalStack';
import { onMounted } from 'vue';

const modalStack = useModalStack()

const emit = defineEmits<{
    (e: 'closeModal', canceled_propagate: boolean, to?: 'note' | 'event', id?: number): void
}>();

const props = defineProps<{
    todo_id: number
}>()

function note () {
    modalStack.push(SelectNoteModalVue, {}, true, (canceled, [selectedId]) => {
        if (canceled) {
            emit('closeModal', true)
        } else {
            emit('closeModal', false, 'note', selectedId)
        }
    })
}

function event () {
}

onMounted(() => {})

</script>

<template>
    <QCard style="padding: 10px;">
        <h6>Link to what?</h6>
        <QBtnGroup>
            <QBtn color="primary" @click="note">Note</QBtn>
            <QBtn color="primary" @click="event">Event</QBtn>
        </QBtnGroup>
    </QCard>
</template>