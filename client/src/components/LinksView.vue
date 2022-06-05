<script setup lang="ts">
import type { AnyThing, ReplacedID, Note, Todo, AnyEvent, ThingName, ID } from '@/database';
import { QBtn, QIcon, QList, QItem, QItemSection } from 'quasar'
import { computed, inject, ref } from 'vue';
import type { Ref } from 'vue'
import { AddComponentAfterFocusedKey } from '@/injections';
import EventViewWindowVue from './Windows/EventViewWindow.vue';
import NoteDisplayVue from './Windows/NoteDisplay.vue';
import TodoViewWindowVue from './Windows/TodoViewWindow.vue';

const props = defineProps<{
    links: ReplacedID<AnyThing>[]
}>()

const iat = inject(AddComponentAfterFocusedKey)

const selected_link_type: Ref<"Event" | "Todo" | "Note" | undefined> = ref(undefined)

const counters = computed(() =>
    props.links.reduce<Record<ThingName, number>>(
        (acc, thing) => (++acc[thing.id.kind] && acc) as Record<ThingName, number>,
        { 'Note': 0, 'Todo': 0, 'OneshotEvent': 0, 'ScheduleEvent': 0 }
    )
)

function open_event (id: ID) {
    iat!(EventViewWindowVue, {id})
}

function open_note (id: ID) {
    iat!(NoteDisplayVue, {id: id.id})
}

function open_todo (id: ID) {
    iat!(TodoViewWindowVue, {id: id.id})
}


</script>

<template>
    <div class="q-pa-md">
        <div class="row">
            <div class="col-md-1 col-12">
                <QList class="text-right text-primary kind-links" bordered separator>
                    <QItem clickable :class="{ active: selected_link_type === undefined }"
                        @click="selected_link_type = undefined">
                        <QItemSection>All: {{ Object.values(counters).reduce((a, b) => a + b) }}</QItemSection>
                    </QItem>
                    <QItem clickable :class="{ active: selected_link_type === 'Todo' }"
                        @click="selected_link_type = 'Todo'">
                        <QItemSection>Todos: {{ counters.Todo }}</QItemSection>
                    </QItem>
                    <QItem clickable :class="{ active: selected_link_type === 'Note' }"
                        @click="selected_link_type = 'Note'">
                        <QItemSection>Notes: {{ counters.Note }}</QItemSection>
                    </QItem>
                    <QItem clickable :class="{ active: selected_link_type === 'Event' }"
                        @click="selected_link_type = 'Event'">
                        <QItemSection>Events: {{ counters.OneshotEvent + counters.ScheduleEvent }}</QItemSection>
                    </QItem>
                </QList>
            </div>
            <div class="col-md-11 col-12">
                <div v-if="props.links.length === 0">
                    <strong>None right now</strong>
                </div>
                <QList class="link-list" v-else bordered dense separator>
                    <QItem>
                        <QItemSection>
                            <strong>Links:</strong>
                        </QItemSection>
                    </QItem>
                    <TransitionGroup :duration="300">
                        <template v-for="link in props.links" :key="link.id.kind + link.id.id">
                            <QItem clickable v-if="(selected_link_type === undefined || selected_link_type === 'Note') && link.id.kind === 'Note'" @click="open_note(link.id)">
                                <QItemSection avatar class="left-icons">
                                    <QIcon class="point" name="text_snippet" size="large"></QIcon>
                                    <QIcon class="point hide-untill-hovered" name="delete" color="negative"
                                        size="large"></QIcon>
                                </QItemSection>
                                <QItemSection class="do-underline">
                                    <div class="point">
                                        {{ (link as ReplacedID<Note>).title }}
                                    </div>
                                </QItemSection>
                            </QItem>
                            <QItem clickable v-else-if="(selected_link_type === undefined || selected_link_type === 'Todo') && link.id.kind === 'Todo'" @click="open_todo(link.id)">
                                <QItemSection avatar class="left-icons">
                                    <QIcon class="point" name="content_paste" size="large"></QIcon>
                                </QItemSection>
                                <QItemSection class="do-underline">
                                    <div class="point">
                                        {{ (link as ReplacedID<Todo>).text }}
                                    </div>
                                </QItemSection>
                            </QItem>
                            <QItem clickable v-else-if="(selected_link_type === undefined || selected_link_type === 'Event') && (link.id.kind === 'OneshotEvent' || link.id.kind === 'ScheduleEvent')" @click="open_event(link.id)">
                                <QItemSection avatar class="left-icons">
                                    <QIcon class="point" name="event" size="large"></QIcon>
                                </QItemSection>
                                <QItemSection class="do-underline">
                                    <div class="point">
                                        {{ (link as ReplacedID<AnyEvent>).name }}
                                    </div>
                                </QItemSection>
                            </QItem>
                        </template>
                    </TransitionGroup>
                </QList>
            </div>
        </div>
    </div>
</template>

<style scoped>
.kind-links {
    cursor: pointer;
}

.kind-links>.active {
    background-color: #b9d3ee;
}

.kind-links>.active:hover {
    background-color: #8ab8e7;
}

.kind-links>div:hover {
    text-decoration: underline;
    background-color: lightgray;
}

.point {
    cursor: pointer;
}

.link-list>div:hover {
    background-color: lightgray;
}

.link-list>div:hover .do-underline {
    text-decoration: underline;
}

.link-list>div .hide-untill-hovered {
    filter: opacity(0);
    transition: filter 300ms ease;
}

.link-list>div:hover .hide-untill-hovered {
    filter: opacity(1);
}

.left-icons {
    flex-direction: row;
    align-content: center;
    justify-content: start;
}

.v-move,
.v-enter-active,
.v-leave-active {
    transition: all 300ms ease;
    transform: scale(1);
    transform-origin: 50% 50%;
}

.v-enter-from,
.v-leave-to {
    transform: scale(0);
}

.v-enter-to,
.v-leave-from {
    transform: scale(1);
}

.v-leave-active {
    position: absolute;
}
</style>