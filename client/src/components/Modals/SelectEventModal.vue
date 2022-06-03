<script setup lang="ts">
import { useDialogPluginComponent, QDialog, QCard, QBtn, QBtnGroup, QDate } from 'quasar'
import { ref } from 'vue'

const props = defineProps<{}>()
const emits = defineEmits([
    ...useDialogPluginComponent.emits
])

const {dialogRef, onDialogCancel, onDialogHide, onDialogOK} = useDialogPluginComponent()

const date = ref(undefined)

</script>

<template>
    <QDialog ref="dialogRef">
        <QCard style="padding: 10px;">
            <h5>Select an Event</h5>
            <QDate v-model="date"></QDate>
        </QCard>
    </QDialog>
</template>