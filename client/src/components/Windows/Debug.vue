<script setup lang="ts">
import { ref } from 'vue'
import { database } from '@/dbintegration'

const obj = ref({})
const input = ref("")

</script>

<template>
    <div>
        <div>
            <input type="text" v-model="input"><br>
            <button @click="database.notes.toArray().then(v => obj = v)">GetAll Notes</button>
            <button @click="database.todos.toArray().then(v => obj = v)">GetAll Todos</button>
            <button @click="database.oneshot_events.toArray().then(v => obj = v)">GetAll OneshotEvents</button>
            <button @click="database.repeating_events.toArray().then(v => obj = v)">GetAll RepeatingEvents</button>
            <button @click="database.link.toArray().then(v => obj = v)">GetAll Links</button><br>
            <button>GetWithLinks Notes</button>
            <button>GetWithLinks Todos</button>
            <button>GetWithLinks OneshotEvents</button>
            <button>GetWithLinks RepeatingEvents</button>
        </div>
        <div>
            <pre>{{JSON.stringify(obj, undefined, 4)}}</pre>
        </div>
    </div>
</template>