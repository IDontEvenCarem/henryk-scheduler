<script setup lang="ts">
import { ref, watchEffect, type Ref } from 'vue'
import { database, type ID, type Todo } from '@/database';
import { QCard, QCardActions, QCardSection, QBtn, QTree, QCheckbox, QScrollArea, QInput } from 'quasar'
import { dynamicQuery } from '@/dbintegration';

const emit = defineEmits<{
    (e: 'selected', id: ID): void,
    (e: 'canceled'): void
}>()

const searchtext = ref('')
const selected : Ref<null|number> = ref(null)

const todos = dynamicQuery(database.todos, [], table => table.toCollection())
const tree : Ref<any[]> = ref([])
const ticked : Ref<number[]> = ref([])

watchEffect(() => {
    // in this function put anything that you wanna do for each todo in the tree, because the code bellow is messy
    function modifyTodo (t: Todo) {
        return {...t, tickable: false}
    }

    // step one - prepare a mapping between parent id and children ids
    const idmap = new Map<number, number[]>()
    function insert_ids(own: number, parent: number | undefined = undefined) {
        if (parent !== undefined) {
            if (idmap.has(parent)) {
                idmap.get(parent)?.push(own)
            } else {
                idmap.set(parent, [own])
            }
        } else {
            idmap.set(own, []);
        }
    }

    todos.value.forEach(todo => {
        insert_ids(todo.id!, todo.parent_id)
        if (todo.done) {
            ticked.value.push(todo.id!)
        }
    })
    
    // step two - build a tree based on that mapping
    function get_child_array (parent: number) : any {
        return idmap.get(parent)?.map(chid => todos.value.find(todo => todo.id === chid)).map(todo => ({...modifyTodo(todo!), children: get_child_array(todo!.id!)}))
    }

    const roots = todos.value.filter(todo => todo.parent_id === undefined).map(todo => ({...todo, children: get_child_array(todo.id!)}))

    tree.value = roots
})

function alerting () {
    alert(selected.value)
}

</script>

<template>
    <QCard>
        <QCardSection>
            <div class="text-h6">Select a Todo</div>
            <QInput v-model="searchtext" label="Search"></QInput>
            <QScrollArea style="height: 50vh; min-width: 50vw;">
                <QTree 
                    :filter="searchtext" 
                    :nodes="tree" 
                    node-key="id" 
                    label-key="text"
                    :ticked="ticked"
                    v-model:selected="selected"
                    selected-color="primary"
                    tick-strategy="strict"
                    default-expand-all
                ></QTree>
            </QScrollArea>
        </QCardSection>
        <QCardActions>
            <QBtn flat color="primary" :disable="selected === undefined" @click="emit('selected', {kind: 'Todo', id: selected as number})">Select</QBtn>
            <QBtn flat color="negative" @click="emit('canceled')">Cancel</QBtn>
        </QCardActions>
    </QCard>
</template>

<style scoped>
.selected {
    background-color: darkcyan;
    color: white;
}
</style>