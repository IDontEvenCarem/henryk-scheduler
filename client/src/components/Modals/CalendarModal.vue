<script setup lang="ts">
import type { RepeatingEvent } from '@/database';
import {ref} from 'vue'

const eName = ref("")
const eWeekday = ref("")
const eStart = ref("")
const eEnd = ref("")
const eColor = ref("#0066ee")

const props = defineProps<{isOpen?: boolean}>()
const emit = defineEmits<{
    (e: 'modalClose'): void,
    (e: 'modalOk', event: RepeatingEvent): void
}>()

function convTime(time: string) {
    const [hours, minutes] = time.split(':').map(v => parseInt(v))
    return hours*60 + minutes
}

function onSubmit () {
    emit("modalOk", {
        color: eColor.value,
        name: eName.value,
        time_start: convTime(eStart.value),
        time_end: convTime(eEnd.value),
        weekday: parseInt(eWeekday.value),
        room: '',
        teacher: '',
    })
    eName.value = ""
    eWeekday.value = ""
    eStart.value = ""
    eEnd.value = ""
    eColor.value = "#0066ee"
}

</script>

<template>
    <Teleport to="#app">
        <Transition>
            <div v-if="isOpen" class="modal-wrapper">
                <div class="background" @click.target="$emit('modalClose')"></div>
                <div class="modal-window">
                    <h3>Add a new event</h3>
                    <form @submit.prevent="onSubmit" class="form">
                        <label for="event-name">Name</label>
                        <input id="event-name" type="text" v-model="eName">
                        <label for="event-weekday">Weekday</label>
                        <select v-model="eWeekday">
                            <option value="1">Monday</option>
                            <option value="2">Tuesday</option>
                            <option value="3">Wednsday</option>
                            <option value="4">Thursday</option>
                            <option value="5">Friday</option>
                            <option value="6">Saturday</option>
                            <option value="7">Sunday</option>
                        </select>
                        <label for="event-start">Start time</label>
                        <input id="event-start" type="time" v-model="eStart">
                        <label for="event-end">End time</label>
                        <input id="event-end" type="time" v-model="eEnd">
                        <label for="event-color">Color</label>
                        <input id="event-color" type="color" v-model="eColor">
                        <input type="submit" value="Add event">
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style>
.v-enter-active, .v-leave-active {
    transition: opacity 300ms ease-in-out;
}
.v-enter-from, .v-leave-to {
    opacity: 0;
}

.background {
    background-color: black;
    filter: opacity(0.5);
    grid-area: 1/1/4/4;
}

.form {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1ch;
}

.modal-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 99;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: 1fr auto 1fr;
    grid-template-areas: ". . ." ". content ." ". . .";
}

.modal-window {
    background-color: white;
    color: black;
    padding: 10px;
    border-radius: 5px;
    grid-area: content;
}
</style>