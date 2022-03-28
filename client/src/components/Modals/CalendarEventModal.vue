<script setup lang="ts">
import type { AnyEvent, RepeatingEvent } from "@/database";
import Box from "../Box.vue";
import {type Deleted, type None, type Updated, type Change, MakeCreated, MakeDeleted, MakeUpdated} from '@/common'
import { reactive, ref } from "vue";
import { EZModalYesNo } from "@/ezmodals";

const props = defineProps<{
    event?: AnyEvent
}>()

const emit = defineEmits<{
    (e: 'close', update: Change<AnyEvent>): void
}>()

const isEditing = ref(false)
const creatingNew = props.event === undefined
const isRepeatingEvent = props.event && 'weekday' in props.event
const newEvent = reactive({
    name: "",
    weekday: "",
    start: "",
    end: "",
    color: "#0066ee"
})

function onSubmit () {
    if (isEditing) {
        emit('close', MakeUpdated({
            id: props.event?.id,
            name: newEvent.name,
            color: newEvent.color,
            weekday: parseInt(newEvent.weekday),
            time_end: newEvent.end.split(":").map((v, i, a) => parseInt(v) * Math.pow(60, a.length - i - 1)).reduce((a, b) => a+b, 0),
            time_start: newEvent.start.split(":").map((v, i, a) => parseInt(v) * Math.pow(60, a.length - i - 1)).reduce((a, b) => a+b, 0),
        }))
        onStopEditing()
    }
    else if (creatingNew) {
        let event : RepeatingEvent = {
            name: newEvent.name,
            color: newEvent.color,
            weekday: parseInt(newEvent.weekday),
            room: '',
            teacher: '',
            time_end: newEvent.end.split(":").map((v, i, a) => parseInt(v) * Math.pow(60, a.length - i - 1)).reduce((a, b) => a+b, 0),
            time_start: newEvent.start.split(":").map((v, i, a) => parseInt(v) * Math.pow(60, a.length - i - 1)).reduce((a, b) => a+b, 0),
        }
        emit("close", MakeCreated(event))
    }
}

async function onDelete() {
    if (props.event !== undefined && await EZModalYesNo("Are you sure?", "Do you want to delete this event?")) {
        emit('close', MakeDeleted({id: props.event.id}))
    }
}

async function onStartEdit () {
    if (props.event === undefined) return;
    if (!('weekday' in props.event)) {
        alert("Not yet implemented")
        return
    }
    isEditing.value = true

    newEvent.name = props.event.name
    newEvent.start = props.event.time_start.toString()
    newEvent.end = props.event.time_end.toString()
    newEvent.weekday = props.event.weekday.toString()
    newEvent.color = props.event.color
}

async function onStopEditing () {
    isEditing.value = false
}

</script>

<template>
    <Box>
        <template v-if="creatingNew || isEditing">
            <h3>Add a new event</h3>
            <form @submit.prevent="onSubmit" class="form">
                <label for="event-name">Name</label>
                <input id="event-name" type="text" v-model="newEvent.name">
                <label for="event-weekday">Weekday</label>
                <select v-model="newEvent.weekday">
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednsday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="7">Sunday</option>
                </select>
                <label for="event-start">Start time</label>
                <input id="event-start" type="time" v-model="newEvent.start">
                <label for="event-end">End time</label>
                <input id="event-end" type="time" v-model="newEvent.end">
                <label for="event-color">Color</label>
                <input id="event-color" type="color" v-model="newEvent.color">
                <input type="submit" :value="isEditing ? 'Save event' : 'Add event'">
            </form>
        </template>
        <div v-else-if="isRepeatingEvent" class="calendar-event-grid">
            <label>Name:</label>
            <p>{{(event as RepeatingEvent).name}}</p>
            <label>Weekday:</label>
            <p>{{(event as RepeatingEvent).weekday}}</p>
            <label>Starts At:</label>
            <p>
                {{
                    ((event as RepeatingEvent).time_start % 60).toString().padStart(2, '0')
                    + ':' + Math.floor((event as RepeatingEvent).time_start / 60).toString().padStart(2, '0')
                }}
            </p>
            <label>Ends At:</label>
            <p>
                {{
                    ((event as RepeatingEvent).time_end % 60).toString().padStart(2, '0')
                    + ':' + Math.floor((event as RepeatingEvent).time_end / 60).toString().padStart(2, '0')
                }}
            </p>

            <button @click="onStartEdit">Edit</button>
            <button @click="onDelete">Delete</button>
        </div>
        <template v-else>
            <p>Not yet implemented</p>
        </template>
    </Box>
</template>

<style scoped>
.calendar-event-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1ch;
}
.calendar-event-grid > button {
    grid-column: span 2;
}
</style>