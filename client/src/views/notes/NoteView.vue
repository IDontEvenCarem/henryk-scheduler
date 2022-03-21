<script setup lang="ts">
import {ref, type Ref} from 'vue'
import {useRoute} from 'vue-router'
import { database, type Note } from '@/database';
import StandardPageWrapper from '../../components/StandardPageWrapper.vue';

const loading = ref(true)
const errored = ref(false)
const note : Ref<Note | null> = ref(null)
const route = useRoute()
const id = route.params['id']

database.notes.get(parseInt(id as string)).then(lnote => {
    if (lnote) {
        note.value = lnote
    } else {
        errored.value = true
    }
    console.log(lnote)
    loading.value = false
}).catch(err => {
    errored.value = true
})

</script>

<template>
    <StandardPageWrapper>
        <div v-if="errored">
            <h1 color="red">An error has occured!</h1>
        </div>
        <div v-else-if="loading">
            <h1 style="text-align: center;">Loading...</h1>
        </div>
        <div v-else>
            <h1>{{note?.title}}</h1>
            <div>{{note?.content}}</div>
        </div>
    </StandardPageWrapper>
</template>