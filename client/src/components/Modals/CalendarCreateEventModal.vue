<script setup lang="ts">
import type { OneshotEvent, AnyEvent, RepeatingEvent } from "@/database";
import {AlterOneshotEvent, AlterRepeatingEvent} from '@/database'
import { MakeCreated, type Change } from '@/common'
import { 
    QCard, QLayout, QHeader, QFooter, QToolbar, QToolbarTitle, QBtn, QSeparator, 
    QBtnGroup, QStepper, QStep, QPage, QPageContainer, QRadio, QForm, QOptionGroup,
    QInput, QDate, QDialog, QSelect, QIcon, QPopupProxy, QTime, date, QColor
} from "quasar";
import { ref, watch, watchEffect, type Ref } from "vue";

const props = defineProps<{
    event?: AnyEvent
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
    "Sunday",
]
const KINDS = [
    { value: "oneshot", label: "One time event" },
    { value: "repeating", label: "Repeating event" }
]

const step = ref(1)
const kind = ref("oneshot")
const ename = ref("")
const runsRange : Ref<{from: string, to: string} | undefined> = ref(undefined)
const weekday = ref('')
const starts = ref('')
const ends = ref('')
const teacher = ref('')
const room = ref('')
const color = ref('')
const runs = ref('')
const edate = ref('')

watch(runsRange, (v) => {
    if (!v) return;
    const {from, to} = v;
    runs.value = `${from} - ${to}`
})

async function done () {
    const startminutes = (() => {
        const [hours, minutes] = starts.value.split(':').map(v => parseInt(v))
        return minutes + hours * 60
    })()
    const endminutes = (() => {
        const [hours, minutes] = ends.value.split(':').map(v => parseInt(v))
        return minutes + hours * 60
    })()

    if (kind.value === 'oneshot') {
        await AlterOneshotEvent(MakeCreated<OneshotEvent>({
            name: ename.value,
            type: 'Event',
            room: room.value,
            date: new Date(edate.value),
            color: color.value,
            teacher: teacher.value,
            time_end: endminutes,
            time_start: startminutes
        }))
        emit('close')   
    } else if (kind.value === 'repeating') {
        await AlterRepeatingEvent(MakeCreated<RepeatingEvent>({
            name: ename.value,
            type: 'RepeatingEvent',
            color: color.value,
            room: room.value,
            teacher: teacher.value,
            weekday: WEEKDAYS.indexOf(weekday.value) + 1,
            time_end: endminutes,
            time_start: startminutes,
            repeats_end: runsRange.value && new Date(runsRange.value?.to),
            repeats_start: runsRange.value && new Date(runsRange.value?.from)
        }))
        emit('close')
    }
}

function validateRange(str: string) {
    return !str || /\d{4}\/\d{2}\/\d{2} - \d{4}\/\d{2}\/\d{2}/i.test(str)
}

</script>

<template>
    <div>
        <QCard>
            <QLayout container view="HHH lpr FFF" style="min-width: 80vw; min-height: 80vh;">
                <QHeader>
                    <QToolbar>
                        <QToolbarTitle>Create an event</QToolbarTitle>
                    </QToolbar>
                </QHeader>
                
                <QPageContainer>
                    <QPage>
                        <QStepper flat v-model="step" keep-alive style="height: 100%;" animated>
                            <QStep :name="1" title="Select kind of event" :done="step > 1">
                                <h5>What type of event do you want to add?</h5>
                                <QOptionGroup v-model="kind" :options="KINDS" color="primary"/>
                                <br>
                                <QBtn color="primary" @click="step += 1">Next</QBtn>
                            </QStep>
                            <QStep :name="2" title="Set the basics" :done="step > 2">
                                <QInput filled label="Name" v-model="ename"/>
                                <br>

                                <template v-if="kind == 'repeating'">
                                    <QSelect filled :options="WEEKDAYS" v-model="weekday" label="Weekday"/>
                                    <br>
                                    <QInput v-model="runs" filled placeholder="2022/04/17 - 2022/06/11" mask="####/##/## - ####/##/##" :rules="[validateRange]" label="When does it run (empty for always)">
                                        <template v-slot:append>
                                            <QIcon name="event">
                                                <QPopupProxy cover transition-show="scale" transtition-hide="scale">
                                                    <QDate range v-model="runsRange">
                                                        <div class="row items-center justify-end">
                                                            <q-btn v-close-popup label="Close" color="primary" flat />
                                                        </div>
                                                    </QDate>
                                                </QPopupProxy>
                                            </QIcon>
                                        </template>
                                    </QInput>
                                </template>
                                <template v-else>
                                    <QInput v-model="edate" filled placeholder="2022/04/17" mask="date" :rules="['date']" label="Date">
                                        <template v-slot:append>
                                            <QIcon name="event">
                                                <QPopupProxy cover transition-show="scale" transtition-hide="scale">
                                                    <QDate v-model="edate">
                                                        <div class="row items-center justify-end">
                                                            <q-btn v-close-popup label="Close" color="primary" flat />
                                                        </div>
                                                    </QDate>
                                                </QPopupProxy>
                                            </QIcon>
                                        </template>
                                    </QInput>
                                </template>
                                    
                                <QInput label="Starts at" placeholder="12:00" filled v-model="starts" mask="time" :rules="['time']">
                                    <template v-slot:append>
                                        <QIcon name="access_time" class="cursor-pointer">
                                            <QPopupProxy cover transition-show="scale" transition-hide="scale">
                                                <QTime v-model="starts">
                                                    <div class="row items-center justify-end">
                                                        <QBtn v-close-popup label="Close" color="primary" flat />
                                                    </div>
                                                </QTime>
                                            </QPopupProxy>
                                        </QIcon>
                                    </template>
                                </QInput>

                                <QInput label="Ends at" placeholder="13:00" filled v-model="ends" mask="time" :rules="['time']">
                                    <template v-slot:append>
                                        <QIcon name="access_time" class="cursor-pointer">
                                            <QPopupProxy cover transition-show="scale" transition-hide="scale">
                                                <QTime v-model="ends">
                                                    <div class="row items-center justify-end">
                                                        <QBtn v-close-popup label="Close" color="primary" flat />
                                                    </div>
                                                </QTime>
                                            </QPopupProxy>
                                        </QIcon>
                                    </template>
                                </QInput>
                            <br>
                            <QBtnGroup>
                                <QBtn color="primary" @click="step -= 1">Back</QBtn>
                                <QBtn color="primary" @click="step += 1">Next</QBtn>
                            </QBtnGroup>
                            </QStep>
                            <QStep :name="3" title="Add details" :done="step > 3">
                                <QInput filled label="Teacher" v-model="teacher"></QInput>
                                <br>
                                <QInput filled label="Room" v-model="room"></QInput>
                                <br>
                                <QInput
                                    filled
                                    v-model="color"
                                    label="Color"
                                    :rules="['anyColor']"
                                >
                                    <template v-slot:append>
                                        <QIcon name="colorize" class="cursor-pointer">
                                            <QPopupProxy cover transition-show="scale" transition-hide="scale">
                                                <QColor v-model="color" />
                                            </QPopupProxy>
                                        </QIcon>
                                    </template>
                                </QInput>
                                <br>
                                <QBtnGroup>
                                    <QBtn color="primary" @click="step -= 1">Back</QBtn>
                                    <QBtn color="positive" @click="done">Create</QBtn>
                                </QBtnGroup>
                            </QStep>
                        </QStepper>
                    </QPage>
                </QPageContainer>
            </QLayout>
        </QCard>
    </div>
</template>