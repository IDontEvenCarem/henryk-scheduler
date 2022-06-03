<script setup lang="ts">
import { useDialogPluginComponent, QDialog, QCard, QBtn, QBtnGroup, useQuasar } from 'quasar'
import SelectEventModalVue from './SelectEventModal.vue';
import SelectNoteModalVue from './SelectNoteModal.vue';

import {database} from '@/dbintegration'
import { useModalStack } from '@/stores/ModalStack';
import { onMounted } from 'vue';
import { Link } from '@/database';

const modalStack = useModalStack()

const emit = defineEmits<{
    (e: 'closeModal', canceled_propagate: boolean): void
}>();

const props = defineProps<{
    todo_id: number
}>()

function note () {
    modalStack.push(SelectNoteModalVue, {}, true, (canceled, [selectedId]) => {
        if (canceled || selectedId === undefined) {
            return emit('closeModal', true)
        } 

        Link({kind: 'Todo', id: props.todo_id}, {kind: 'Note', id: selectedId})
        return emit('closeModal', true)
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