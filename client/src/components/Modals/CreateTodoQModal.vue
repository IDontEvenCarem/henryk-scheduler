<script setup lang="ts">
import { useDialogPluginComponent, QCard, QDialog, QBtn, QInput, QToolbar, QToolbarTitle, QBtnGroup} from 'quasar'
import { ref } from 'vue'

const props = defineProps<{
    parent_id?: number
}>()

const emit = defineEmits([
    ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const text = ref('')

function commit () {
    onDialogOK(text.value)
}

</script>

<template>
    <QDialog ref="dialogRef" @hide="onDialogHide">
        <QCard class="q-dialog-plugin">
            <div style="padding: 15px;">
                <QInput v-model="text" label="What to do"/>
                <br>
                <QBtnGroup>
                    <QBtn color="primary" @click="commit">Create</QBtn>
                    <QBtn color="negative" @click="onDialogCancel">Cancel</QBtn>
                </QBtnGroup>
            </div>
        </QCard>
    </QDialog>
</template>