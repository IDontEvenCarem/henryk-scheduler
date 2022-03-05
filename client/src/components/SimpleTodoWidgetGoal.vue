<script setup lang="ts">
import {ref, onUnmounted, onMounted, reactive, computed, onScopeDispose, watchEffect} from 'vue'
// --- all that bellow can be a library
import type {Ref} from 'vue'
import type {Todo} from '@/database'
import {database} from '@/database'
import { liveQuery } from 'dexie';
import type {Table} from 'dexie'

function somehowUseTodos(query = (table: Table) => table.toArray()) {
    const tdr : Ref<Todo[]> = ref([])
    const lq = liveQuery(() => query(database.todos))
    
    const subscription = lq.subscribe(next => {
        tdr.value = next
    })

    // which is better?
    // onUnmounted(() => { subscription.unsubscribe() })
    onScopeDispose(() => { subscription.unsubscribe() })

    return {
        todos: tdr,
        async add_todo(text: string) {
            database.todos.add({done: false, text})
        }
    }
}
// ---
// some thoughts to be written here
//   reactive arguments to queries?
//   how would we make a smarter selector for that?
//   db interface = db + getters + mutators
//   there are going to be multiple of those
//   pinia for global storage of those?
//   

const dummy = ref(0)
const from = ref(0)
const to = ref(100)

const todos : Ref<Todo[]> = ref([])
database.todos.hook("creating", () => {
    console.log(
        "Hook kreacji"
    )
    dummy.value = dummy.value + 1
})
watchEffect(() => {
    const _ = dummy.value;
    console.log("recomputing")
    database.todos.where('id').between(from.value, to.value).toArray().then(value => {
        todos.value = value
    }).catch(reson => console.error(reson))
})

// const todos_db = somehowUseTodos();
const text = ref("")

async function onAddTodo () {
    // await todos_db.add_todo(text.value);
    await database.todos.add({done: false, text: text.value});
    text.value = ""
}

</script>

<template>
    <h2>Todos:</h2>
    <div>
        <input type="number" v-model="from">
        <input type="number" v-model="to">
        <input type="text" v-model="text">
        <button @click="onAddTodo">Add todo:</button>
        <div>
            <div v-for="todo in todos" :key="todo.id">{{todo.id}} : {{todo.text}}</div>
        </div>
    </div>
</template>
