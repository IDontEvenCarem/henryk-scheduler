<script lang="ts" setup>
import StandardPageWrapper from "../components/StandardPageWrapper.vue";
import TodosWidget from "../components/TodosWidget.vue";
import { QCard, QScrollArea} from 'quasar'
</script>

<template>
<StandardPageWrapper>
    <div class="todos-wrapper">
        <TodosWidget></TodosWidget>
        
    </div>
</StandardPageWrapper>
</template>

<style scoped>
.todos-wrapper {
    display: grid;
    grid-template-columns: 1fr 40vw 1fr;
    grid-template-rows: 1fr 80vh 1fr;
    height: 100%;
    background: url("@/assets/comos.jpg");
}
.todos-wrapper > * {
    grid-column: 2/3;
    grid-row: 2/3;
}
</style>
