<script setup lang="ts">
import type { ID } from '@/database';
import { EZModalDelete } from '@/ezmodals';
import {QBtn} from 'quasar'

const props = defineProps<{
    id: ID
}>()

function prompt() {
    EZModalDelete(props.id)
}

</script>

<template>
    <QBtn flat color="negative" @click="prompt">
        Delete
    </QBtn>
</template>