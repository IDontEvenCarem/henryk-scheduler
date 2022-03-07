<script setup lang="ts">
import { ref, onUnmounted, onMounted, reactive, computed, onScopeDispose, watchEffect, customRef, type CustomRefFactory, type DeepReadonly, readonly, shallowReadonly, watch } from 'vue'
// --- all that bellow can be a library
import type { Ref, UnwrapRef } from 'vue'
import type { Todo } from '@/database'
import { database } from '@/database'
import { liveQuery, type PromiseExtended } from 'dexie';
import type { Table, Dexie, Subscription, Collection } from 'dexie'

type UnwrapedRefList<T> = { [P in keyof T]: UnwrapRef<T[P]> }

function dynamicQuery<T, P extends readonly Ref[]>(
    table: Table<T>, 
    params: P, 
    query: (table: Table<T>, ...params: Readonly<UnwrapedRefList<P>>) => Collection<T>)
    : Ref<T[]> 
{
    let value: Ref<T[]> = ref([])
    let sub: Subscription | null = null

    function regen_sub () {
        if (sub !== null) {
            sub.unsubscribe();
        }
        // escape hatching bellow seems to be needed
        const parameter_values = params.map(ref => ref.value) as any 
        sub = liveQuery<T[]>(() => query(table, ...parameter_values).toArray()).subscribe(newvalue => {
            value.value = newvalue
        })
    }

    watch(params, (new_values, old_values) => {
        regen_sub();
    })

    regen_sub()

    return value;
}

// ---
// some thoughts to be written here
//   reactive arguments to queries?
//   how would we make a smarter selector for that?
//   db interface = db + getters + mutators
//   there are going to be multiple of those
//   pinia for global storage of those?
//   

const from = ref(0)
const to = ref(100)
const field = ref('id')

const todos = dynamicQuery(
    database.todos, 
    [field, from, to] as const, 
    (table, field, from, to) => table
        .where(field)
        .between(from, to, true, true)
)

const text = ref("")

async function onAddTodo() {
    await database.todos.add({ done: false, text: text.value });
    text.value = ""
}

</script>

<template>
    <h2>Todos:</h2>
    <div>
        <input type="number" v-model="from" />
        <input type="number" v-model="to" />
        <input type="text" v-model="text" />
        <button @click="onAddTodo">Add todo:</button>
        <div>
            <div v-for="todo in todos" :key="todo.id">{{ todo.id }} : {{ todo.text }}</div>
        </div>
    </div>
</template>
