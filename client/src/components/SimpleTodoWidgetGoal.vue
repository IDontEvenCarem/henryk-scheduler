<script setup lang="ts">
import { onScopeDispose, onUnmounted, ref, watch } from 'vue'
import type { Ref, UnwrapRef } from 'vue'
import { database } from '@/database'
import { liveQuery } from 'dexie';
import type { Table, Subscription, Collection } from 'dexie'

type UnwrapedRefList<T> = { [P in keyof T]: UnwrapRef<T[P]> }

function dynamicQuery<T, P extends readonly Ref[]>(
    table: Table<T>,
    params: [...P],
    query: (table: Table<T>, ...params: Readonly<UnwrapedRefList<P>>) => Collection<T>
): Ref<T[]> {
    // escape hatching is needed, as there is no way to encode the change of types
    // caused by map'ing over a tuple into the type system
    let value: Ref<T[]> = ref([])
    let sub: Subscription | undefined = undefined
    function regen_sub(newvalues: Readonly<UnwrapedRefList<P>>) {
        sub?.unsubscribe();
        sub = liveQuery<T[]>(() => query(table, ...newvalues).toArray()).subscribe(newvalue => {
            value.value = newvalue
        })
    }
    onUnmounted(() => {
        sub?.unsubscribe();
    })
    watch(params, (new_values, _) => {
        regen_sub(new_values as any);
    })
    regen_sub(params.map(ref => ref.value) as any)
    return value;
}

const from = ref(0)
const to = ref(100)
const field = ref('id')

const todos = dynamicQuery(
    database.todos,
    [field, from, to],
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
