<script setup lang="ts">

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
    <q-input :label="props.label" filled :modelValue="props.modelValue" @update:modelValue="v => emit('update:modelValue', v as string)">
      <template v-slot:prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date :modelValue="props.modelValue" @update:modelValue="v => emit('update:modelValue', v as string)" mask="YYYY-MM-DD HH:mm">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>

      <template v-slot:append>
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-time :modelValue="props.modelValue" @update:modelValue="v => emit('update:modelValue', v as string)" mask="YYYY-MM-DD HH:mm" format24h>
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-time>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>