<script setup lang="ts">
import {dynamicQuery} from '@/dbintegration'
import {database} from '@/database'
import StandardPageWrapper from '../../components/StandardPageWrapper.vue'

const notes = dynamicQuery(database.notes, [], table => table.toCollection())

</script>

<template>
    <StandardPageWrapper>
        <RouterLink to="/notes/create">Create New</RouterLink>
        <main>
            <div v-for="note in notes" class="note">
                <RouterLink :to="`/notes/view/${note.id}`"><h2>{{note.title}}</h2></RouterLink>
            </div>
        </main>
    </StandardPageWrapper>
</template>

<style scoped>
.note {
    color: white;
}
.note a {
    color: white;
    text-decoration: none;
}
.note a:hover {
    color: gray;    
}
</style>