<script setup lang="ts">
import {ref} from 'vue'
import {QCard, QBtn, QCardSection, QCardActions} from 'quasar'
import {Delete, type ID} from '@/database'

const props = defineProps<{
    deleting: ID
}>()
const emits = defineEmits<{
    (e: 'closeModal', canceled: boolean): void
}>()

function doDelete () {
    Delete(props.deleting).then(v => {
        emits('closeModal', true)
    })
}

</script>

<template>
    <QCard>
        <QCardSection>
            <div class="text-h6">Are you sure you want to delete this?</div>
        </QCardSection>
        <QCardActions vertical>
            <QBtn flat color="primary" @click="doDelete">Delete</QBtn>
            <QBtn flat color="negative" @click="emits('closeModal', true)">Cancel</QBtn>
        </QCardActions>
    </QCard>
</template>