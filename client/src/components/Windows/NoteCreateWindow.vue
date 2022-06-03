<script setup lang="ts">
import { QList, QScrollArea, QBtn, QInput, QEditor } from 'quasar'
import { AddComponentAfterFocusedKey } from '@/injections'
import { inject, ref } from 'vue'
import { dynamicQuery, AddNote } from '@/dbintegration'
import { database } from '@/database';
import { CloseFocusedWindowKey } from '@/injections'

const props = defineProps<{
    setTitle: (title: string) => void,
}>()
const title = ref("")
const content = ref("")
const closethis = inject(CloseFocusedWindowKey)

function create () {
    if (title.value.length === 0) {
        return   
    }
    AddNote(title.value, content.value)
    if (closethis) {
        closethis()
    }
}

</script>

<template>
    <div class="wrapper">
        <QInput v-model="title" label="Title"></QInput>
        <QEditor v-model="content"></QEditor>
        <QBtn :disable="title.length===0" color="primary" @click="create">Create</QBtn>
    </div>
</template>

<style scoped>
.wrapper {
    padding: 20px;
    height: 100%;
}

</style>