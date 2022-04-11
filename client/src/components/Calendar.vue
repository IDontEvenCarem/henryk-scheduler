<script lang="ts" setup>
import { computed, ref } from 'vue'
import { dynamicQuery, database, UpdateRepeatingEvent} from '@/dbintegration'
import type { RepeatingEvent, AnyEvent, OneshotEvent } from '@/database'
import { AddRepeatingEvent, DeleteRepeatingEvent, DeleteAllRepeatingEvents } from '@/database'
import { EZModalYesNo } from '@/ezmodals'
import _ from 'lodash'
import { useModalStack } from '@/stores/ModalStack'
import CalendarCreateModal from './Modals/CalendarCreateEventModal.vue'
import { QBtn, date, QBtnGroup } from 'quasar'
import CalendarViewEventModalVue from './Modals/CalendarViewEventModal.vue'

const modalStack = useModalStack()

const startOfWeek = date.startOfDate(date.subtractFromDate(new Date(), {day: date.getDayOfWeek(new Date())}), 'day')
const endOfWeek = date.addToDate(startOfWeek, {day: 7})

const repeatingEvents = dynamicQuery(database.repeating_events, [], table => 
	table
		.filter(e => (!e.repeats_start && !e.repeats_end) || date.isBetweenDates(startOfWeek, e.repeats_start as Date, e.repeats_end as Date))
)

const oneshotEvents = dynamicQuery(database.oneshot_events, [], table => 
	table
		.where('date')
		.between(startOfWeek, endOfWeek, true, true)
)

const modalOpen = ref(false)

const timeStart = computed(() => 
	Math.min(
		repeatingEvents.value.reduce((prev, curr) => Math.min(prev, curr.time_start), 8*60),
		oneshotEvents.value.reduce((prev, curr) => Math.min(prev, curr.time_start), 8*60)
	)
)
const timeEnd = computed(() => 
	Math.max(
		repeatingEvents.value.reduce((prev, curr) => Math.max(prev, curr.time_start), 16*60),
		oneshotEvents.value.reduce((prev, curr) => Math.max(prev, curr.time_start), 16*60),
	)
)
const halfHourIntervals = computed(() => 
	Math.ceil((timeEnd.value - timeStart.value) / 30)
)

const days = computed(() => Array(7).fill(0).map((v, i) => date.addToDate(startOfWeek, {day: i+1})).map(date => date.getDate()))

const times = computed(() => _.range(0, halfHourIntervals.value+1).map(i => timeStart.value + i * 30))

function computeStyle(event: RepeatingEvent | OneshotEvent) {
	const beginOffsetTime = timeStart.value; // calendar starts at 8:00
	const relStart = Math.ceil((event.time_start - beginOffsetTime)/10) + 3
	const relEnd = Math.ceil((event.time_end - beginOffsetTime)/10) + 3

	console.log(event)

	const obj = {
		"--weekday": event.type === "RepeatingEvent" ? event.weekday : event.date.getDay(), 
		"--timestart": relStart,
		"--timeend": relEnd,
		"--color": event.color || "#00eebb"
	}

	return obj
}

function createRandomEvent() {
	const time_start = 8*60 + Math.floor(Math.random() * 60 * 3)
	const time_end = time_start + Math.floor(Math.random() * 6) * 15
	AddRepeatingEvent("losowy event", "#00eebb", Math.floor(Math.random() * 7) + 1, time_start, time_end)
}

async function deleteCalendarEvent(id: number) {
	DeleteRepeatingEvent(id)
}

async function deleteAll() {
	if (await EZModalYesNo("Are you sure?", "Do you want to delete ALL calendar events?")) {
		DeleteAllRepeatingEvents()
		database.oneshot_events.clear();
	}
}

function addNewEvent(event: RepeatingEvent) {
	AddRepeatingEvent(event.name, event.color, event.weekday, event.time_start, event.time_end)
	modalOpen.value = false
}

function openCreateModal() {
	modalStack.push(CalendarCreateModal, {}, true, (canceled) => {})
}

function openEventViewModal (event: AnyEvent) {
	modalStack.push(CalendarViewEventModalVue as any, {event}, true, (c) => {})

	// modalStack.push(CalendarCreateModal, {event}, true, (canceled, [change]) => {
	// 	if (canceled) return;
	// 	if (change.kind === 'none') return;
	// 	else if (change.kind === 'deleted') {
	// 		if (change.value.id) {	
	// 			deleteCalendarEvent(change.value.id)
	// 		}
	// 	}
	// 	else if (change.kind === 'created') {
	// 		// should not happen
	// 		if ('weekday' in change.value) {
	// 			addNewEvent(change.value)
	// 		}
	// 	}
	// 	else if (change.kind === 'updated') {
	// 		if ('weekday' in change.value && change.value.id !== undefined) {
	// 			UpdateRepeatingEvent(change.value.id, change.value)
	// 		}
	// 	}
	// })
}

</script>

<template>
	<!-- <CalendarModal :is-open="modalOpen" @modalClose="modalOpen=false" @modal-ok="addNewEvent"></CalendarModal> -->
	<QBtnGroup>
		<QBtn color="primary" @click="openCreateModal">Add New Event</QBtn>
		<QBtn color="primary" @click="createRandomEvent">Dodaj w losowym czasie</QBtn>
		<QBtn color="primary" @click="deleteAll" label="🗑️ Delete everything"/>
	</QBtnGroup>
	<!-- <p v-for="event in events">{{JSON.stringify(event)}}</p> -->
	<div class="CalendarStructure" :style="`grid-template-rows: auto auto repeat(${halfHourIntervals*3+3}, minmax(16px, 1fr))`">
		<div class="corner"></div>
		<div class="Weekdays">
			<div style="grid-column: 2/3">Monday</div>
			<div style="grid-column: 3/4">Tuesday</div>
			<div style="grid-column: 4/5">Wednsday</div>
			<div style="grid-column: 5/6">Thursday</div>
			<div style="grid-column: 6/7">Friday</div>
			<div style="grid-column: 7/8">Saturday</div>
			<div style="grid-column: 8/9">Sunday</div>
		</div>
		
		<div class="DayNumbers">
			<div v-for="day, i in days" :style="{'grid-column': `${i+2}/${i+3}`}">
				{{day}}
			</div>
		</div>

		<div class="TimeSlotsStructure">
			<div v-for="time, i in times" :style="{'grid-row': `${3*i+3}/ span 3`}">
				{{Math.floor(time/60).toString().padStart(2, '0')}}:{{(time%60).toString().padStart(2, '0')}}
			</div>
		</div>

		<div class="HLines">
			<div class="HLine" v-for="time, i in times" :style="{'grid-area': `${3*i+3}/${1}/${3*(i+1)+2}/${9}`}"></div>
		</div>

		<div class="EventStructure">
			<div class="Lines">
				<div v-for="i in _.range(2, 9)" :style="{'grid-column': `${i}/${i+1}`, 'grid-row': `${1}/${halfHourIntervals*3 + 6}`}"></div>
			</div>

			<TransitionGroup name="scalebounce">
				<div v-for="event in repeatingEvents" :style="(computeStyle(event) as any)" :key="event.id" class="EventSlot" @click="openEventViewModal(event)">
					<div class="EventStatus">
						<strong>{{ event.name }}</strong>
					</div>
				</div>
				<div v-for="event in oneshotEvents" :style="(computeStyle(event) as any)" :key="event.id" class="EventSlot" @click="openEventViewModal(event)">
					<div class="EventStatus">
						<strong>{{ event.name }}</strong>
					</div>
				</div>
			</TransitionGroup>
		</div>
	</div>
</template>


<style scoped>
.CalendarStructure {
	display: grid;
	grid-template-columns: auto repeat(7, 1fr);
	/* gap: 1px; */
	background-color: white;
	color: black;
}

.corner {
	grid-area: 1/1/3/2;
}

.Weekdays {
	display: contents;
}
.Weekdays > * {
	grid-row: 1/2;
	background: gray;
}

.DayNumbers {
	display: contents;
}
.DayNumbers > * {
	grid-row: 2/3;
	text-align: center;
	background: lightgray;
}

.Weekdays /* dni tygodnia (slowo) */
 {
	color: black;
	text-align: center;
}
.Header > ul > * {
	border-left: 2px solid black;
	text-align: center;
}
.TimeSlotsStructure /* kontener ze slotami godzin */
 {
	display: contents;
	grid-template-columns: 1fr;
	background: lightblue;
	justify-content: left;
	min-width: 80px;
}
.TimeSlotsStructure > * {
	background: lightblue;
	grid-column: 1/2;
	grid-row: span 3;
}
.TimeSlotsStructure > span {
	text-align: center;
	color: black;
	min-height: 60px;
	border-top: 2px solid black;
}

.HLines {
	display: contents;
}
.HLines > * {
	border-top: 1px solid gray;
}

.EventStructure /* umieszczenie eventow */
 {
	display: contents;
	/* grid-template-columns: repeat(7, 1fr); */
	/* grid-template-rows: [top] repeat(44, 3vh) [bottom]; */
	/* grid-area: TimeSlotsMain; */
	/* position: relative; */
}
.EventSlot /* wyglad eventu */
 {
	border-radius: 5px;
	color: black;
	border-color: black;
	background-color: blue;
	outline: none;
	grid-column: calc(var(--weekday) + 1) / span 1;
	grid-row: var(--timestart) / var(--timeend);
	background-color: var(--color);
}
.EventStatus {
	padding: 5px;
}
.Lines {
	display: contents;
}
.Lines > * {
	border-left: 2px solid black;
	grid-row: topLines/bottomLines;
}

.scalebounce-enter-active,
.scalebounce-leave-active {
    transition: all 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform: scale(1);
}

.scalebounce-enter-from,
.scalebounce-leave-to {
    transform: scale(0);
}

.scalebounce-enter-to,
.scalebounce-leave-from {
    transform: scale(1);
}
</style>