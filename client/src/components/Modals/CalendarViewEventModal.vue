<script setup lang="ts">
import { MakeDeleted } from '@/common';
import { AlterOneshotEvent, AlterRepeatingEvent, type AnyEvent, type ID, type OneshotEvent, type RepeatingEvent } from '@/database';
import { EZModalYesNo } from '@/ezmodals';
import {QCard, QLayout, QHeader, QToolbar, QToolbarTitle, QPageContainer, QPage, QBtn, date} from 'quasar'

const props = defineProps<{
    event_id: ID
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const WEEKDAYS = [
    "Monday",
    "Tuesday",
    "Wednsday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
]

async function tryDelete () {
    if(await EZModalYesNo("Are you sure?", `Do you want to delete this event?`)) {
        if (props.event.type === 'Event') {
            AlterOneshotEvent(MakeDeleted({id: props.event.id}))
        } else if (props.event.type === 'RepeatingEvent') {
            AlterRepeatingEvent(MakeDeleted({id: props.event.id}))
        }
        emit('close')
    }
}


</script>

<template>
    <QCard>
        <QLayout container view="HHH lpr FFF" style="min-width: 50vw; min-height: 50vh;">
            <QHeader>
                <QToolbar>
                    <QToolbarTitle>Viewing event</QToolbarTitle>
                </QToolbar>
            </QHeader>
            <QPageContainer>
                <QPage padding>
                    <h6>Name:</h6>
                    <p>{{props.event.name}}</p>

                    <template v-if="props.event.type === 'Event'">    
                        <h6>Date:</h6>
                        <p>{{date.formatDate(props.event.date, 'YYYY/MM/DD')}}</p>
                    </template>
                    <template v-else-if="props.event.type === 'RepeatingEvent'">
                        <h6>Weekday:</h6>
                        <p>{{WEEKDAYS[props.event.weekday - 1]}}</p>
                    </template>

                    <h6>Starts at:</h6>
                    <p>{{Math.floor(props.event.time_start / 60).toString().padStart(2, '0') + ":" + (props.event.time_start % 60).toString().padStart(2, '0')}}</p>
                    
                    <h6>Ends at:</h6>
                    <p>{{Math.floor(props.event.time_end / 60).toString().padStart(2, '0') + ":" + (props.event.time_end % 60).toString().padStart(2, '0')}}</p>
                    
                    <template v-if="props.event.type === 'RepeatingEvent' && props.event.repeats_start">
                        <h6>Runs from:</h6>
                        <p>{{date.formatDate(props.event.repeats_start, 'YYYY/MM/DD')}}</p>
                        <h6>Runs to:</h6>
                        <p>{{date.formatDate(props.event.repeats_end, 'YYYY/MM/DD')}}</p>
                    </template>

                    <QBtn color="negative" push @click="tryDelete">Delete</QBtn>
                </QPage>
            </QPageContainer>
        </QLayout>
    </QCard>
</template>