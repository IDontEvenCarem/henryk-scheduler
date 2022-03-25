<script lang="ts" setup>
import { ref } from 'vue'
import { dynamicQuery, database } from '@/dbintegration'
import type { RepeatingEvent } from '@/database'
import { AddRepeatingEvent, DeleteRepeatingEvent, DeleteAllRepeatingEvents } from '@/database'
import CalendarModal from './CalendarModal.vue'
import { EZModalYesNo } from '@/ezmodals'

const events = dynamicQuery(database.timetable_repeating, [], table => table.toCollection())
const modalOpen = ref(false)

function computeStyle(event: RepeatingEvent) {
	const beginOffsetTime = 8 * 60; // calendar starts at 8:00
	const relStart = Math.round((event.time_start - beginOffsetTime)/7.5) + 1
	const relEnd = Math.round((event.time_end - beginOffsetTime)/7.5) + 1

	const obj = {
		"--weekday": event.weekday,
		"--timestart": relStart,
		"--timeend": relEnd,
		"--color": event.color
	}

	return obj
}

function createRandomEvent() {
	const time_start = 8*60 + Math.floor(Math.random() * 60 * 3)
	const time_end = time_start + Math.floor(Math.random() * 6) * 15
	AddRepeatingEvent("losowy event", "blue", Math.floor(Math.random() * 7) + 1, time_start, time_end)
}

async function deleteCalendarEvent(event: RepeatingEvent) {
	if (event.id && await EZModalYesNo("Are you sure?", "Do you want to delete a calendar event?")) {
		DeleteRepeatingEvent(event.id)
	}
}

async function deleteAll() {
	if (await EZModalYesNo("Are you sure?", "Do you want to delete ALL calendar events?")) {
		DeleteAllRepeatingEvents()
	}
}

function addNewEvent(event: RepeatingEvent) {
	AddRepeatingEvent(event.name, event.color, event.weekday, event.time_start, event.time_end)
	modalOpen.value = false
}

</script>

<template>
	<CalendarModal :is-open="modalOpen" @modalClose="modalOpen=false" @modal-ok="addNewEvent"></CalendarModal>
	<button @click="modalOpen=true">Add New Event</button>
	<button @click="createRandomEvent">Dodaj w losowym czasie</button>
	<button @click="deleteAll">🗑️ Delete everything</button>
	<!-- <p v-for="event in events">{{JSON.stringify(event)}}</p> -->
	<div class="CalendarStructure">
		<div class="Header">
			<ul class="Weekdays">
				<li>Monday</li>
				<li>Tuesday</li>
				<li>Wednsday</li>
				<li>Thursday</li>
				<li>Friday</li>
				<li>Saturday</li>
				<li>Sunday</li>
			</ul>
			<ul class="DayNumbers">
				<li>21</li>
				<li>22</li>
				<li>23</li>
				<li>24</li>
				<li>25</li>
				<li>26</li>
				<li>27</li>
			</ul>
		</div>

		<div class="TimeSlotsStructure">
			<!-- <ul class="TimeSlots"> -->
			<span>8:00</span>
			<span>8:30</span>
			<span>9:00</span>
			<span>9:30</span>
			<span>10:00</span>
			<span>10:30</span>
			<span>11:00</span>
			<span>11:30</span>
			<span>12:00</span>
			<span>12:30</span>
			<span>13:00</span>
			<!-- </ul> -->
		</div>

		<div class="EventStructure">
			<div class="Lines">
				<div id="day-1"></div>
				<div id="day-2"></div>
				<div id="day-3"></div>
				<div id="day-4"></div>
				<div id="day-5"></div>
				<div id="day-7"></div>
				<div id="day-6"></div>
			</div>

			<div v-for="event in events" :style="(computeStyle(event) as any)" :key="event.id" class="EventSlot">
				<div class="EventStatus">
					<strong>{{ event.name }}</strong>
					<br>
					<button v-on:click="() => deleteCalendarEvent(event)">🗑️ Delete</button>
				</div>
			</div>
		</div>
	</div>
</template>


<style scoped>
li {
	list-style: none;
}

ul {
	margin: 0;
	padding: 0;
}

.CalendarStructure {
	display: grid;
	grid-template-columns: max-content auto;
	grid-template-rows: auto;
	gap: 1px, 1px;
	grid-template-areas:
		". CalendarHeader"
		"TimeSlotsStructure TimeSlotsMain";
	background-color: white;
}

.Weekdays,
.DayNumbers /* podzial dni na siatke */
 {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	min-height: 30px;
}
.Weekdays /* dni tygodnia (slowo) */
 {
	background: gray;
	color: black;
}
.Header /* dni tygodnia kalendarza (liczba) */
 {
	background: lightgray;
	grid-area: CalendarHeader;
}
.Header > ul > * {
	border-left: 2px solid black;
	text-align: center;
}
.TimeSlotsStructure /* kontener ze slotami godzin */
 {
	grid-area: TimeSlotsStructure;
	display: grid;
	grid-template-columns: 1fr;
	background: lightblue;
	justify-content: left;
	min-width: 80px;
}
.TimeSlotsStructure > span {
	text-align: center;
	color: black;
	min-height: 60px;
	border-top: 2px solid black;
}

.EventStructure /* umieszczenie eventow */
 {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	grid-template-rows: [top] repeat(44, 3vh) [bottom];
	grid-area: TimeSlotsMain;
	/* position: relative; */
}
.EventSlot /* wyglad eventu */
 {
	border-radius: 5px;
	color: black;
	border-color: black;
	outline: none;
	grid-column: var(--weekday) / span 1;
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
	grid-row: top/bottom;
}
.Lines > #day-1 {
	grid-column: 1/2;
}
.Lines > #day-2 {
	grid-column: 2/3;
}
.Lines > #day-3 {
	grid-column: 3/4;
}
.Lines > #day-4 {
	grid-column: 4/5;
}
.Lines > #day-5 {
	grid-column: 5/6;
}
.Lines > #day-6 {
	grid-column: 6/7;
}
.Lines > #day-7 {
	grid-column: 7/8;
}
</style>