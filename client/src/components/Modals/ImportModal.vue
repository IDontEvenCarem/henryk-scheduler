<script setup lang="ts">
import { GetExportData, ImportData, PurgeDatabase } from '@/database';
import { EZModalYesNo } from '@/ezmodals';
import {QCard, QBtn, QCardSection, QCardActions, QIcon, QTooltip, QCheckbox} from 'quasar'
import { ref } from 'vue';

const deleteCurrent = ref(false)

const emits = defineEmits<{
    (e: 'closeModal', canceled: boolean): void
}>()

async function file () {
    if (deleteCurrent.value) {
        if (!await EZModalYesNo("Are you sure?", "Do you want to delete everything stored in the browser's database?")) {
            return
        }
        await PurgeDatabase()
    }
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.hensh'
    input.click()
    input.addEventListener('change', async function A (ev) {
        input.removeEventListener('change', A)
        for(const file of input.files as unknown as File[]) {
            await ImportData(JSON.parse(await file.text()))
        }
    })
}

</script>

<template>
    <QCard style="transition: width 800ms, height 800ms;">
        <QCardSection>
            <div class="text-h6">Import from where?</div>
        </QCardSection>
        <QCardActions vertical>
            <QCheckbox v-model="deleteCurrent" label="Delete current data?"></QCheckbox>
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