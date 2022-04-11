<script setup lang="ts">
import {dynamicQuery} from '@/dbintegration'
import {database} from '@/database'
import StandardPageWrapper from '../../components/StandardPageWrapper.vue'
import { QItem, QList, QItemSection, QItemLabel, QScrollArea, QBtn} from 'quasar';

const notes = dynamicQuery(database.notes, [], table => table.toCollection())

</script>

<template>
    <StandardPageWrapper>
        <RouterLink to="/notes/create">
            <QBtn color="primary">
                Create New
            </QBtn>
        </RouterLink>
        <!-- <QScrollArea> -->
            <QList separator>
                <RouterLink v-for="note in notes" :to="`/notes/view/${note.id}`">
                    <QItem clickable>
                        <QItemSection>
                            <QItemLabel>
                                {{note.title}}
                            </QItemLabel>
                            <QItemLabel caption>
                                {{ note.content.replace(/\<\/?[^\>]+\>/g, ' ').substring(0, 64) + (note.content.length > 64 ? "..." : "")}}
                            </QItemLabel>
                        </QItemSection>
                    </QItem>
                </RouterLink>
            </QList>
        <!-- </QScrollArea> -->
    </StandardPageWrapper>
</template>

<style scoped>
a {
    text-decoration: none;
    color: inherit;
}
</style>