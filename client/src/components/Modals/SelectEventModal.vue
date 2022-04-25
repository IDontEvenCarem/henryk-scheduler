<script setup lang="ts">
import { useDialogPluginComponent, QDialog, QCard, QBtn, QBtnGroup } from 'quasar'

const props = defineProps<{}>()
const emits = defineEmits([
    ...useDialogPluginComponent.emits
])


const {dialogRef, onDialogCancel, onDialogHide, onDialogOK} = useDialogPluginComponent()

</script>

<template>
    <QDialog ref="dialogRef">
        <QCard style="padding: 10px;">
            <h1>Select Event</h1>
        </QCard>
    </QDialog>
</template>