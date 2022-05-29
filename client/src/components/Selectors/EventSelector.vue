<script setup lang="ts">
import { ref } from 'vue'
import { database, type ID, type ThingName } from '@/database';
import {QCard, QCardActions, QCardSection, QBtn} from 'quasar'
import { Calendar } from 'v-calendar'
import { dynamicQuery } from '@/dbintegration';
import { computed } from '@vue/reactivity';

const emit = defineEmits<{
    (e: 'selected', id: ID): void,
    (e: 'canceled'): void
}>()
const selected = ref(-1)
const selectedType = ref(null)

const oneshots = dynamicQuery(database.oneshot_events, [], (table) => table.toArray())
const repeating = dynamicQuery(database.repeating_events, [], (table) => table.toArray())

const COLOR_TABLE = [
  'gray',   'yellow',
  'green',  'purple',
  'red',    'pink',
  'orange', 'teal',
  'indigo', 'blue'
]
const attrs = computed(() => {
    let alt_color = 0

    const data = [
        {
            key: 'today',
            highlight: {
                color: 'blue',
                fillMode: 'outline'
            },
            dates: new Date(),
            order: -1
        },
        ... oneshots.value.map(ev => {
            return {
                key: `o${ev.id!}`,
                bar: COLOR_TABLE[(alt_color++) % COLOR_TABLE.length],
                dates: {
                    start: ev.start,
                    end: ev.end
                },
                customData: {
                    ...ev,
                    type: 'O'
                },
                popover: {
                    label: ev.name,
                    isInteractive: true
                },
            }
        }),
        ... repeating.value.map(ev => {
            return {
                key: `r${ev.id!}`,
                bar: COLOR_TABLE[(alt_color++) % COLOR_TABLE.length],
                dates:
                    ev.repeats_start === undefined
                    ? { weekdays: [ev.weekday+1] }
                    : { start: ev.repeats_start || null, end: ev.repeats_end || null, weekdays: [ev.weekday+1] },
                customData: {
                    ...ev,
                    type: 'R'
                },
                popover: {
                    label: ev.name,
                    isInteractive: true
                }
            }
        })
    ]

    console.dir(data)

    return data
})

function OnSelect () {
    if (selectedType.value !== undefined && selected.value !== -1) {
        const kind : ThingName = selectedType.value === 'R' ? 'ScheduleEvent' : 'OneshotEvent'
        emit('selected', {kind, id: selected.value})
    }
}

</script>

<template>
    <QCard>
        <QCardSection>
            <div class="text-h6">Select an Event</div>
            <Calendar :attributes="attrs">
                <template v-slot:day-popover="{ day, format, masks, attributes }">
                    <div>
                        {{ format(day.date, masks.dayPopover) }}
                    </div>
                    <div v-for="{key, customData} in attributes" :key="key" :class="{selected: selected === customData.id && selectedType === customData.type}" style="padding: 5px;">
                        <span @click.self="selectedType = customData.type; selected = customData.id">{{customData.name}}</span>
                    </div>
                </template>
            </Calendar>
        </QCardSection>
        <QCardActions>
            <QBtn flat color="primary" :disable="selected === -1" @click="OnSelect">Select</QBtn>
            <QBtn flat color="negative" @click="emit('canceled')">Cancel</QBtn>
        </QCardActions>
    </QCard>
</template>

<style scoped>
.selected {
    background-color: darkcyan;
    color: white !important;
    border-radius: 2px;
}
</style>