<script setup lang="ts">
import { useDialogPluginComponent, QDialog, QCard, QBtn, QBtnGroup, useQuasar } from 'quasar'
import SelectEventModalVue from './SelectEventModal.vue';
import SelectNoteModalVue from './SelectNoteModal.vue';
import {database} from '@/dbintegration'

const props = defineProps<{}>()
const emits = defineEmits([
    ...useDialogPluginComponent.emits
])

const $q = useQuasar()
const {dialogRef, onDialogCancel, onDialogHide, onDialogOK} = useDialogPluginComponent()

function note () {
    $q.dialog({
        component: SelectNoteModalVue
    })
    .onOk(onDialogOK)
    .onCancel(onDialogCancel)
}

function event () {
    $q.dialog({
        component: SelectEventModalVue
    })
    .onOk(onDialogOK)
    .onCancel(onDialogCancel)
}

</script>

<template>
    <QDialog ref="dialogRef">
        <QCard style="padding: 10px;">
            <h6>Link to what?</h6>
            <QBtnGroup>
                <QBtn color="primary" @click="note">Note</QBtn>
                <QBtn color="primary" @click="event">Event</QBtn>
            </QBtnGroup>
        </QCard>
    </QDialog>
</template>