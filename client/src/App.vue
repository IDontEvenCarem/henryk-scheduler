<script setup lang="ts">
import { RouterView } from 'vue-router'
import ModalStackDisplay from './components/ModalStackDisplay.vue'
</script>

<template>
  <ModalStackDisplay>
  </ModalStackDisplay>
  <RouterView>
  </RouterView>
</template>

<style>
@import '@/assets/base.css';
</style>
