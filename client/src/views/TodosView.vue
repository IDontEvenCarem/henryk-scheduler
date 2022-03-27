<script lang="ts" setup>
import SimpleTodoWidgetGoal from "../components/SimpleTodoWidgetGoal.vue";
import StandardPageWrapper from "../components/StandardPageWrapper.vue";
</script>

<template>
<StandardPageWrapper>
    <div class="todos-wrapper">
        <div>
            <h1>Actual List: </h1>
            <SimpleTodoWidgetGoal></SimpleTodoWidgetGoal>
        </div>
    </div>
</StandardPageWrapper>
</template>

<style scoped>
.todos-wrapper {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: 1fr 1fr 1fr;
}
</style>
