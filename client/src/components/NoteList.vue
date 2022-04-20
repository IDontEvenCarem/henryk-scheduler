<script setup lang="ts">
import {dynamicQuery} from '@/dbintegration'
import {database} from '@/database'
import { QItem, QList, QItemSection, QItemLabel, QScrollArea, QBtn} from 'quasar';

const notes = dynamicQuery(database.notes, [], table => table.toCollection())
</script>


<template>
    <QScrollArea style="height: 100%;" visible>
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
    </QScrollArea>
</template>

<style scoped>
a {
    text-decoration: none;
    color: inherit;
}
</style>