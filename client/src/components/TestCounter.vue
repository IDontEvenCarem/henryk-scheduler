<script setup lang="ts">
import {ref} from 'vue'

const x = ref(0)
</script>

<template>
    <span>Counter is {{x}}</span>
    <button @click="x++">+</button>
    <button @click="x--">-</button>
</template>