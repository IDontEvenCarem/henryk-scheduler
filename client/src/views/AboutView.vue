<script lang="ts" setup>
import SimpleTodoWidgetGoal from "../components/SimpleTodoWidgetGoal.vue";
import SimpleTodoWidgetPinia from "../components/SimpleTodoWidgetPinia.vue";
</script>

<template>
  <div class="wrapper">
    <div>
      <h1>Dexie: </h1>
      <SimpleTodoWidgetGoal></SimpleTodoWidgetGoal>
    </div>
    <div>
      <h1>Another Dexie: </h1>
      <SimpleTodoWidgetGoal></SimpleTodoWidgetGoal>
    </div>
    <div>
      <h1>Pinia: </h1>
      <SimpleTodoWidgetPinia></SimpleTodoWidgetPinia>
    </div>
    <div>
      <h1>Another Pinia: </h1>
      <SimpleTodoWidgetPinia></SimpleTodoWidgetPinia>
    </div>
  </div>
</template>

<style>
.wrapper {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
</style>
