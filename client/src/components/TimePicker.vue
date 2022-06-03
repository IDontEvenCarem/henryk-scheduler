<script setup lang="ts">
import {QInput, QIcon, QPopupProxy, QTime, QBtn} from 'quasar'

const props = defineProps<{
    modelValue: string,
    label: string
}>()

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void
}>()

</script>


<template>
  <div class="q-pa-md">
    <QInput style="padding-bottom: 0;" :label="props.label" placeholder="12:00" filled :modelValue="props.modelValue" @update:modelValue="v => emit('update:modelValue', v as string)" mask="time"
        :rules="['time']">
        <template v-slot:append>
            <QIcon name="access_time" class="cursor-pointer">
                <QPopupProxy cover transition-show="scale" transition-hide="scale">
                    <QTime :modelValue="props.modelValue" @update:modelValue="v => emit('update:modelValue', v as string)">
                        <div class="row items-center justify-end">
                            <QBtn v-close-popup label="Close" color="primary" flat />
                        </div>
                    </QTime>
                </QPopupProxy>
            </QIcon>
        </template>
    </QInput>
  </div>
</template>