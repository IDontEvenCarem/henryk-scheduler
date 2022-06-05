<script setup lang="ts">
import {inject, ref, watchEffect, getCurrentInstance, onMounted, onScopeDispose, watch } from 'vue'
import type { Ref } from 'vue'
import { database, GetWithLinks, MarkTodoDone, MarkTodoUndone, ToggleTodo } from '@/database';
import type { ReplacedID, Note, OneshotEvent, RepeatingEvent, ThingName, ID } from '@/database'
import type { Todo } from '@/dbintegration';
import { QIcon, QCheckbox, QBtn, QBtnGroup, QScrollArea, QTree } from 'quasar'
import { EZModalLink } from '@/ezmodals'
import { AddComponentAfterFocusedKey, RecOpenQueueKey } from '@/injections'
import LinksView from '@/components/LinksView.vue'
import DeleteButton from '../DeleteButton.vue'
import _ from 'lodash'
import { RemIatTodoViewWindow } from '@/deferedOpen';

const props = defineProps<{
    id: number,
    setTitle?: (title: string) => void
}>()

const state = ref<'loading' | 'error' | 'ok'>('loading')

const recQueue = inject(RecOpenQueueKey)

const nodes : Ref<any[]> = ref([])
const track = ref(false)
const dones : Ref<number[]> = ref([])

const todo : Ref<Todo | null> = ref(null)
const links : Ref<ReplacedID<Note | Todo | OneshotEvent | RepeatingEvent>[]> = ref([])

const iat = inject(AddComponentAfterFocusedKey)

if (props.setTitle) {
    props.setTitle("Todo".padEnd(25, ' '))
}

const sortorder : Record<ThingName, number> = {Todo: 0, Note: 1, OneshotEvent: 2, ScheduleEvent: 3}

function Refresh() {
    requestAnimationFrame(() => {
        GetWithLinks({kind: 'Todo', id: props.id}).then(value => {
            todo.value = value.value as Todo
            if (todo.value.done) {
                dones.value = [...dones.value, todo.value.id!]
            }
            nodes.value = [{
                label: (value.value as Todo).text,
                id: (value.value as Todo).id!,
                lazy: true
            }]
            links.value = value.linked
            links.value.sort((l, r) => (sortorder[l.id.kind] < sortorder[r.id.kind]) as unknown as number - 0.5)
            state.value = 'ok'
            if (props.setTitle) {
                props.setTitle((value.value as Todo).text)
            }
        }).catch(err => {
            state.value = 'error'
        })
    })
}

watch(dones, (newv, oldv) => {
    if (!track) { return; }

    const removed = _.difference(oldv, newv)
    const added = _.difference(newv, oldv)

    removed.forEach(r => {
        MarkTodoUndone(r)
    })
    added.forEach(r => {
        MarkTodoDone(r)
    })
})

onMounted(() => {
    Refresh()
    track.value = true
    database.link.hook.creating.subscribe(Refresh)
    database.link.hook.deleting.subscribe(Refresh)
})

onScopeDispose(() => {
    database.link.hook.creating.unsubscribe(Refresh);
    database.link.hook.deleting.unsubscribe(Refresh);
})

function update(val: boolean) {
    if (val) {
        MarkTodoDone(props.id).then(Refresh)
    } else {
        MarkTodoUndone(props.id).then(Refresh)
    }
}

function loadLaziliy({done, fail, key, node}: any) {
    database.todos.where('parent_id').equals(key).toArray().then(res => {
        const done_ids = res.filter(todo => todo.done).map(todo => todo.id!)
        const prepped = res.map(todo => {
            return {
                label: todo.text,
                id: todo.id!,
                lazy: true
            }
        })
        dones.value = [...dones.value, ...done_ids]
        done(prepped)
    })
}

function AddLink() {
    EZModalLink({kind: 'Todo', id: props.id})
}

function view (id: number) {
    recQueue!.value = [...recQueue!.value, ['TodoViewWindow', {id}]]
}

</script>

<template>
    <div v-if="state == 'error'">
        <h1 color="red">An error has occured!</h1>
    </div>
    <div v-else-if="state == 'loading'">
        <h1 style="text-align: center;">Loading...</h1>
    </div>
    <QScrollArea v-else style="width: var(--gl-width); height: var(--gl-height);">
        <div class="q-pa-md">
            <QTree :nodes="nodes" node-key="id" label-key="label" @lazy-load="loadLaziliy">
                <template v-slot:default-header="prop">
                    <QCheckbox v-model="dones" :val="prop.node.id"></QCheckbox>
                    <span>{{prop.node.label}}</span>
                    &nbsp;&nbsp;
                    <QIcon class="toggle-on-hover" name="visibility" @click.stop="ev => view(prop.node.id)"></QIcon>
                </template>
            </QTree>
            <div>
                <QBtnGroup flat>
                    <QBtn flat color="primary" @click="AddLink">Link</QBtn>
                    <DeleteButton :id="{kind: 'Todo', id: props.id}"></DeleteButton>
                </QBtnGroup>
            </div>
        </div>
        <LinksView :links="links"></LinksView>
    </QScrollArea>
</template>

<style scoped>
.note-view {
    padding: 0 5ch;
}
.link {
    padding: 0 2ch;
}
.toggle-on-hover {
    transition: opacity 300ms ease;
    opacity: 0;
}

.q-tree__node-header:hover .toggle-on-hover {
    opacity: 0.35;
}

.toggle-on-hover:hover {
    opacity: 1 !important; 
}
</style>