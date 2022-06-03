<script setup lang="ts">
import {ref} from 'vue'
import {useRoute, useRouter} from "vue-router";
import {AddNote} from '@/database'
import { QEditor, QBtn, QInput } from 'quasar';

const route = useRoute()
const router = useRouter()
const isEdit = route.name === 'noteEdit'

const title = ref("")
const contents = ref("Start typing here!")

function saveNote () {
    AddNote(title.value, contents.value).then(id => {
        alert("The note has been created!")

    })
}

</script>

<template>
    <div>
        <h4>Create a new note</h4><br>
        <QInput outlined v-model="title" label="Title"></QInput><br>
        <QEditor v-model="contents"></QEditor><br>
        <QBtn color="primary" @click="saveNote">
            Create
        </QBtn>
    </div>
</template>