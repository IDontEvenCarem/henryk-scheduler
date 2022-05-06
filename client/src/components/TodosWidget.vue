<script setup lang="ts">
import {useQuasar ,QTree, QBtn, QCheckbox, QIcon, QCard, QScrollArea} from 'quasar'
import {dynamicQuery, database} from '@/dbintegration'
import { computed } from '@vue/reactivity';
import { type Todo, AddTodo, ToggleTodo, DeleteTodo} from '@/database';
import {ref, watchEffect} from 'vue'
import type {Ref} from 'vue'
import CreateTodoQModalVue from './Modals/CreateTodoQModal.vue';
import { EZModalYesNo } from '@/ezmodals';
import LinkFromTodoModalVue from './Modals/LinkFromTodoModal.vue';
import { useModalStack } from '@/stores/ModalStack';

const modalStack = useModalStack()
const $q = useQuasar()
const todos = dynamicQuery(database.todos, [], table => table.toCollection())

const props = defineProps<{
    setTitle?: (title: string) => void
}>()

const tree : Ref<any[]> = ref([])

watchEffect(() => {
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
    })
    
    // step two - build a tree based on that mapping
    function get_child_array (parent: number) : any {
        return idmap.get(parent)?.map(chid => todos.value.find(todo => todo.id === chid)).map(todo => ({...todo, children: get_child_array(todo!.id!)}))
    }
    const roots = todos.value.filter(todo => todo.parent_id === undefined).map(todo => ({...todo, children: get_child_array(todo.id!)}))

    // step three - add linked entities
    async function insert_links (treeEntry : Todo & {children: any[]}) {
        const linked_notes = await database.link_todo_notes.where('todo_id').equals(treeEntry.id!).toArray()
        const local = Promise.all(linked_notes.map(link => database.notes.where('id').equals(link.note_id).toArray()))
        const child = Promise.all((treeEntry.children||[]).map(insert_links))
        if (treeEntry.children) treeEntry.children.unshift(...(await local).map(v =>
            ({...v[0], id: 'n' + v[0].id, body: 'note', header: 'note'})))
        await child
    }

    Promise.all(roots.map(root => insert_links(root))).then(_ => {
        tree.value = roots
        console.dir(roots)
    })
})

const checked = computed(() => {
    return todos.value.filter(todo => todo.done).map(todo => todo.id)
})

function change_done (id: number, value: any) {
    ToggleTodo(id)
}

function add() {
    $q.dialog({
        component: CreateTodoQModalVue,
        componentProps: {}
    }).onOk(payload => {
        AddTodo(payload)
    })
}

function add_under(id: number) {
    $q.dialog({
        component: CreateTodoQModalVue,
        componentProps: {}
    }).onOk(payload => {
        AddTodo(payload, id)
    })
}

function link(id: number) {
    modalStack.push(LinkFromTodoModalVue, {todo_id: id}, true, (canceled, result) => {
        if (!canceled) {
            return
            database.link_todo_notes.add({note_id: payload, todo_id: id})
        }
    })
}

async function remove(id: number) {
    if (await EZModalYesNo("Are you sure?", "Do you want to delete this todo?")) {
        DeleteTodo(id)
    }
}

if (props.setTitle) {
    props.setTitle("Todos")
}

</script>

<template>
    <div class="todos-wrap-card">
        <div class="whole-wrapper">
            <QScrollArea style="height: 100%;">
                <QTree v-if="tree.length > 0" :nodes="tree" node-key="id" label-key="text" default-expand-all>
                    <template v-slot:default-header="prop">
                        <div class="todo-wrapper">
                            <QCheckbox color="positive" :name="prop.node.id.toString()" :val="prop.node.id" :model-value="checked" @update:model-value="v => change_done(prop.node.id, v)"></QCheckbox>
                            <div>{{prop.node.text}}</div>
                            <QIcon style="cursor: pointer;" name="add" @click.stop="e => add_under(prop.node.id)"/>
                            <QIcon style="cursor: pointer;" name="add_link" @click.stop="e => link(prop.node.id)"/>
                            <QIcon style="cursor: pointer;" name="delete" @click.stop="e => remove(prop.node.id)"/>
                        </div>
                    </template>
                    <template v-slot:body-note="note">
                        <span>{{note.node.content}}</span>
                    </template>
                    <template v-slot:header-note="note">
                        <QIcon name="link"></QIcon>
                        <span>{{note.node.title}}</span>
                    </template>
                </QTree>
                <div v-else class="alternate-content">
                    <div>
                        <h5 style="text-align: center;">No todos yet</h5>
                    </div>
                </div>
            </QScrollArea>
        </div>
        <QBtn color="primary" @click="add" style="margin: 10px;">Create todo</QBtn>
    </div>
</template>

<style scoped>

.todo-wrapper {
    display: grid;
    grid-template-columns: auto 1fr max-content max-content max-content max-content 25px;
    align-items: center;
    width: 100%;
}
.todo-wrapper > .q-icon {
    transition: opacity 200ms ease;
    opacity: 0;
}
.todo-wrapper:hover > .q-icon {
    opacity: 1;
}
.todos-wrap-card {
    height: 100%; 
    display: grid;
    grid-template-rows: 1fr max-content;
}
</style>