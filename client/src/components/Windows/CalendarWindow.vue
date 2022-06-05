<script lang="ts" setup>
import { inject, ref } from 'vue'
import { database, type ID } from '@/database';
import { dynamicQuery } from '@/dbintegration';
import { computed } from '@vue/reactivity';
import { date, QBtn } from 'quasar';
// @ts-expect-error
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import { useModalStack } from '@/stores/ModalStack';
import CalendarCreateEventModalVue from '../Modals/CalendarCreateEventModal.vue';
import { AddComponentAfterFocusedKey } from '@/injections';
import EventViewWindowVue from './EventViewWindow.vue';

const props = defineProps<{
    setTitle: (title: string) => void
}>()

props.setTitle("Calendar")
const iat = inject(AddComponentAfterFocusedKey)


const oneshot_events = dynamicQuery(database.oneshot_events, [], (table) => table.toArray())
const repeating_events = dynamicQuery(database.repeating_events, [], (table) => table.toArray())
const modalStack = useModalStack()

const start = ref(date.subtractFromDate(date.startOfDate(Date.now(), "day"), {days: date.getDayOfWeek(date.startOfDate(Date.now(), "day"))-1}))
const end = ref(date.endOfDate(date.addToDate(date.startOfDate(Date.now(), "day"), {days: 7-date.getDayOfWeek(date.startOfDate(Date.now(), "day"))}), 'day'))

const events = computed(() => {
    (window as any)['dummy_global_variable'] = oneshot_events.value.length + repeating_events.value.length
    return [
        ...oneshot_events.value.filter(ev => date.isBetweenDates(ev.start, start.value, end.value)).map(ev => {
            const id : ID = {kind: 'OneshotEvent', id: ev.id!}
            return {
                start: ev.start,
                end: ev.end,
                title: ev.name,
                dbid: id,
                color: ev.color
            }
        }),
        ...repeating_events.value.flatMap(r => {
            const id : ID = {kind: 'ScheduleEvent', id: r.id!}

            // cut out parts that would not be rendered anyway
            let window_start = r.repeats_start ? date.getMaxDate(r.repeats_start, start.value) : start.value
            let window_end = r.repeats_end ? date.getMinDate(r.repeats_end, end.value) : end.value
            
            // short circuit on viewing years
            let window_span = window_end.valueOf() - window_start.valueOf()
            if (window_span > 364*24*60*60*1000) {
                return []
            }

            let start_of_week = date.subtractFromDate(window_start, {days: date.getDayOfWeek(window_start)-1})

            let first_event_start = date.addToDate(start_of_week, {days: r.weekday, minutes: r.time_start})
            let first_event_end = date.addToDate(first_event_start, {minutes: r.time_end - r.time_start})

            let res = []
            for(
                let event_start = first_event_start, event_end = first_event_end; 
                event_start < window_end; 
                (event_start = date.addToDate(event_start, {day: 7})), (event_end = date.addToDate(event_end, {day: 7}))
            ) {
                if (window_start <= event_start && event_end <= window_end) {
                    res.push({
                        start: event_start,
                        end: event_end,
                        title: r.name,
                        eid: r.id!,
                        dbid: id,
                        color: r.color
                    })
                }
            }
            return res
        })
    ]
})

function on_event_click(ev: any) {
    console.log("EVENT CLICKED")
    console.log(ev)
    iat!(EventViewWindowVue, {id: ev.dbid})
}

function add_event () {
    modalStack.push(CalendarCreateEventModalVue as any, {}, true, (canceled, result) => {

    })     
}

function view_change(event: {startDate: Date, endDate: Date, firstCellDate: Date, lastCellDate: Date}) {
    start.value = event.startDate
    end.value = event.endDate
}

</script>

<template>
    <div class="calendar-wrapper">
        <VueCal @view-change="view_change" :events="events" :on-event-click="on_event_click"></VueCal>
        <QBtn color="primary" id="add-event-button" @click="add_event">Add Event</QBtn>
    </div>
</template>

<style scoped>
.calendar-wrapper {
    /* width: var(--gl-width); */
    height: var(--gl-height);
}

#add-event-button {
    position: absolute;
    z-index: 2;
    top: 1px;
    left: 1px;
}

</style>
<style>
.vuecal__event {
    cursor: pointer;
}
</style>