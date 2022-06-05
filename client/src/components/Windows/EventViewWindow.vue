<script setup lang="ts">

import { DeleteRepeatingEvent, GetWithLinks } from '@/database';
import type { AnyEvent, AnyThing, ReplacedID, OneshotEvent, RepeatingEvent } from '@/database'
import type { ID } from '@/dbintegration';
import { onMounted, ref, type Ref } from 'vue';
import LinksView from '../LinksView.vue';
import { QBtnGroup, QBtn } from 'quasar'
import { EZModalLink, EZModalYesNo } from '@/ezmodals';
import DeleteButton from '../DeleteButton.vue'

const props = defineProps<{
    setTitle: (title: string) => void,
    id: ID
}>()

const event : Ref<AnyEvent | undefined> = ref(undefined)
const is_edit_mode = ref(false)
const linked : Ref<ReplacedID<AnyThing>[]> = ref([]) 

onMounted(() => {
    props.setTitle("Event")
    GetWithLinks(props.id).then(_event => {
        props.setTitle((_event.value as AnyEvent).name)
        event.value = _event.value as AnyEvent;
        linked.value = _event.linked
    })
})

function format_weekday(weekday: number) {
    return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][weekday]
}

function format_minutes(minutes: number) {
    const hours = Math.floor(minutes / 60)
    const sm_minutes = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${sm_minutes.toString().padStart(2, '0')}`
}

function link () {
    EZModalLink(props.id)
}


</script>

<template>
    <div v-if="event === undefined">
        <h5 style="text-align: center;">Loading...</h5>
    </div>
    <div v-else>
        <template v-if="!is_edit_mode">
            <div class="q-pa-md">
                <!-- <pre>{{JSON.stringify(event, undefined, 2)}}</pre> -->
                <h4 style="margin: 0;">{{event.name}}</h4>
                <div v-if="props.id.kind === 'OneshotEvent'">
                    <p>Starts {{(event as OneshotEvent).start}}</p>
                    <p>Ends {{(event as OneshotEvent).end}}</p>
                </div>
                <div v-else-if="props.id.kind === 'ScheduleEvent'">
                    <template v-if="(event as RepeatingEvent).repeats_start !== undefined && (event as RepeatingEvent).repeats_end !== undefined">
                        <p>Runs from {{(event as RepeatingEvent).repeats_start}} to {{(event as RepeatingEvent).repeats_end}}</p>
                    </template>
                    <p>
                        Starts every {{format_weekday((event as RepeatingEvent).weekday)}} 
                        at {{format_minutes((event as RepeatingEvent).time_start)}}, 
                        and ends at {{format_minutes((event as RepeatingEvent).time_end)}}</p>
                </div>
                <h6 style="margin: 0;">Description:</h6>
                <p v-html="event.description"></p>
                <QBtnGroup flat>
                    <!-- <QBtn flat color="primary">Edit</QBtn> -->
                    <QBtn flat color="primary" @click="link">Link</QBtn>
                    <DeleteButton :id="props.id"></DeleteButton>
                </QBtnGroup>
            </div>
            <LinksView :links="linked"></LinksView>
        </template>
        <template v-else>
            <div class="q-pa-md">
                <div v-if="props.id.kind === 'OneshotEvent'">

                </div>
                <div v-else-if="props.id.kind === 'ScheduleEvent'">
                
                </div>
                <QBtnGroup flat>
                    <QBtn flat color="primary">Save</QBtn>
                    <QBtn flat color="negative">Cancel</QBtn>
                </QBtnGroup>
            </div>
        </template>
    </div>
</template>