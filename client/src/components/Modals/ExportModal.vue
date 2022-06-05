<script setup lang="ts">
import { GetExportData } from '@/database';
import {QCard, QBtn, QCardSection, QCardActions, QIcon, QTooltip} from 'quasar'

const emits = defineEmits<{
    (e: 'closeModal', canceled: boolean): void
}>()

function file () {
    GetExportData().then(data => {
        const blob = new Blob([JSON.stringify(data)])
        const blobUrl = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = blobUrl
        link.download = "export.hensh"

        document.body.appendChild(link)
        link.dispatchEvent(new MouseEvent('click', {bubbles: false, cancelable: true, view: window}))
        document.body.removeChild(link)

        emits('closeModal', false)
    })
}


</script>

<template>
    <QCard style="transition: width 800ms, height 800ms;">
        <QCardSection>
            <div class="text-h6">Export to where?</div>
        </QCardSection>
        <QCardActions vertical>
            <QBtn class="text-left" flat color="primary" @click="file"><QIcon name="description"></QIcon>&nbsp; File</QBtn>
            <QBtn disable class="text-left" flat color="primary">
                <QIcon name="cloud"></QIcon>&nbsp; Server
                <QTooltip>
                    Currently unavailable
                </QTooltip>
            </QBtn>
            <QBtn flat color="negative" @click="emits('closeModal', true)">Cancel</QBtn>
        </QCardActions>
    </QCard>
</template>

<style>
.q-tooltip {
    z-index: 9999999;
}
</style>