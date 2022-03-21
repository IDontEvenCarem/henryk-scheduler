<script setup lang="ts">
import {ref} from 'vue'
import {useRoute, useRouter} from "vue-router";
import StandardPageWrapper from "../../components/StandardPageWrapper.vue";
import {AddNote} from '@/database'

const route = useRoute()
const router = useRouter()
const isEdit = route.name === 'noteEdit'

const title = ref("New note")
const contents = ref("Start typing here!")

function saveNote () {
    AddNote(title.value, contents.value).then(id => {
        alert("The note has been created!")
        router.replace(`/notes/view/${id}`)
    })
}

</script>

<template>
    <StandardPageWrapper>
        <h2>Create a new note</h2>
        <label for="note-title">Title</label><br>
        <input type="text" id="note-title" v-model="title">

        <br>
        <label for="note-contents">Contents</label><br>
        <textarea id="note-contents" v-model="contents"></textarea><br>
        <button @click="saveNote">
            Create
        </button>
    </StandardPageWrapper>
</template>