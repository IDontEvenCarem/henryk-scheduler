<script setup lang="ts">
import type { OneshotEvent, AnyEvent, RepeatingEvent, Weekday } from "@/database";
import { AlterOneshotEvent, AlterRepeatingEvent, AddRepeatingEvent, AddOneshotEvent } from '@/database'
import { MakeCreated, type Change } from '@/common'
import {
    QCard, QLayout, QHeader, QFooter, QToolbar, QToolbarTitle, QBtn, QSeparator,
    QBtnGroup, QStepper, QStep, QPage, QPageContainer, QRadio, QForm, QOptionGroup,
    QInput, QDate, QDialog, QSelect, QIcon, QPopupProxy, QTime, date, QColor,
    QCheckbox, QEditor
} from "quasar";
import { ref, watch, watchEffect, type Ref } from "vue";
import _ from "lodash";
import DateAndTimeSelector from "../DateAndTimeSelector.vue";
import TimePicker from "../TimePicker.vue";

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
const repeats_forever = ref(false)
const ename = ref("")
const runsRange: Ref<{ from: string, to: string } | undefined> = ref(undefined)
const weekday = ref('')
const starts = ref('')
const ends = ref('')
const color = ref('')
const runs = ref('')
const edate = ref('')

const edesc = ref('')
const estart = ref('')
const eend = ref('')

watch(runsRange, (v) => {
    if (!v) return;
    const { from, to } = v;
    runs.value = `${from} - ${to}`
})


function timestring_to_minutes (timestring: string): number {
    const [hours, minutes] = timestring.split(':').map(v => parseInt(v))
    return minutes + hours * 60
}

async function done() {
    if (kind.value === 'oneshot') {
        await AddOneshotEvent({
            name: ename.value,
            color: color.value,
            start: new Date(estart.value),
            end: new Date(eend.value),
            description: edesc.value
        })
        emit('close')
    } else if (kind.value === 'repeating') {
        await AddRepeatingEvent({
            name: ename.value,
            color: color.value,
            description: edesc.value,
            time_start: timestring_to_minutes(starts.value),
            time_end: timestring_to_minutes(ends.value),
            weekday: _.findIndex(WEEKDAYS, v => v === weekday.value) as Weekday,
            repeats_start: runsRange.value && new Date(runsRange.value.from),
            repeats_end: runsRange.value && new Date(runsRange.value.to),
        });
        emit('close')
    }
}

function validateRange(str: string) {
    return /\d{4}\/\d{2}\/\d{2} - \d{4}\/\d{2}\/\d{2}/i.test(str)
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
                                <QOptionGroup v-model="kind" :options="KINDS" color="primary" />
                                <br>
                                <QBtn color="primary" @click="step += 1">Next</QBtn>
                            </QStep>
                            <QStep :name="2" title="Set the basics" :done="step > 2">
                                <div class="q-pa-md">
                                    <QInput filled label="Name" v-model="ename" />
                                </div>

                                <template v-if="kind == 'repeating'">
                                    <div class="q-pa-md">
                                        <QSelect filled :options="WEEKDAYS" v-model="weekday" label="Weekday" />
                                    </div>
                                    <div class="q-pa-md">
                                        <QCheckbox v-model="repeats_forever" label="Repeats forever?"></QCheckbox>
                                    </div>
                                    <Transition>
                                        <div v-if="!repeats_forever" class="q-pa-md">
                                            <QInput v-model="runs" filled
                                                placeholder="2022/04/17 - 2022/06/11" mask="####/##/## - ####/##/##"
                                                :rules="[validateRange]" label="When does it run"
                                                style="padding-bottom: 0;">
                                                <template v-slot:append>
                                                    <QIcon name="event">
                                                        <QPopupProxy cover transition-show="scale" transtition-hide="scale">
                                                            <QDate range v-model="runsRange">
                                                                <div class="row items-center justify-end">
                                                                    <q-btn v-close-popup label="Close" color="primary"
                                                                        flat />
                                                                </div>
                                                            </QDate>
                                                        </QPopupProxy>
                                                    </QIcon>
                                                </template>
                                            </QInput>
                                        </div>
                                    </Transition>
                                    <TimePicker label="Starts at" v-model="starts"></TimePicker>
                                    <TimePicker label="Ends at" v-model="ends"></TimePicker>
                                </template>
                                <template v-else>
                                    <DateAndTimeSelector :label="'Starts'" v-model="estart"></DateAndTimeSelector>
                                    <DateAndTimeSelector :label="'Ends'" v-model="eend"></DateAndTimeSelector>
                                </template>

                                
                                <br>
                                <QBtnGroup>
                                    <QBtn color="primary" @click="step -= 1">Back</QBtn>
                                    <QBtn color="primary" @click="step += 1">Next</QBtn>
                                </QBtnGroup>
                            </QStep>
                            <QStep :name="3" title="Add details" :done="step > 3">
                                <QInput filled v-model="color" label="Color" :rules="['anyColor']">
                                    <template v-slot:append>
                                        <QIcon name="colorize" class="cursor-pointer">
                                            <QPopupProxy cover transition-show="scale" transition-hide="scale">
                                                <QColor v-model="color" />
                                            </QPopupProxy>
                                        </QIcon>
                                    </template>
                                </QInput>
                                <span>Description:</span>
                                <QEditor v-model="edesc"></QEditor>
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

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 250ms ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

</style>