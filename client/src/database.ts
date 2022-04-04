import Dexie from 'dexie'
import type {Table} from 'dexie'
import type { Change } from './common'
import _ from 'lodash'

export interface Todo {
    id?: number,
    text: string,
    done: boolean
}

export interface OneshotEvent {
    id?: number,
    type: "Event",
    name: string,
    date: Date,
    time_start: number,
    time_end: number,
    room: string,
    teacher: string,
    color: string
}

export interface RepeatingEvent {
    id?: number,
    type: "RepeatingEvent",
    name: string,
    room: string,
    teacher: string,
    color: string,
    weekday: number,
    time_start: number,
    time_end: number,
    repeats_start?: Date,
    repeats_end?: Date
}
export interface Note {
    id?: number,
    title: string,
    content: string,
    createdAt: string,
    editedAt: string
}

export class TypedDexie extends Dexie {
    todos!: Table<Todo>;
    oneshot_events!: Table<OneshotEvent>;
    repeating_events!: Table<RepeatingEvent>;
    notes!: Table<Note>;

    constructor() {
        super('testdexie')
        this.version(10).stores({
            todos: '++id',
            oneshot_events: '++id, date',
            repeating_events: '++id, weekday, repeats_start, repeats_end',
            notes: '++id, title'
        })
    }
}


export type AnyEvent = OneshotEvent | RepeatingEvent

export const database = new TypedDexie()

export async function Insert<T>(table: Table<T>, value: T) {
    return table.add(value)
}

export async function AlterRepeatingEvent (change: Change<RepeatingEvent>) {
    if (change.kind == "none") return;
    if (change.kind == "created") {
        return database.repeating_events.add(change.value)
    }
    if (change.kind == "deleted") {
        if(change.value.id){
            return database.repeating_events.delete(change.value.id);
        }
        return Promise.resolve();    
    }
    if (change.kind == "updated") {
        if (change.value.id !== undefined) {
            return database.repeating_events.update(change.value.id, _.omit(change.value, 'id'))
        } 
        return Promise.resolve()
    }
}

export async function AlterOneshotEvent (change: Change<OneshotEvent>) {
    if (change.kind == "none") return;
    if (change.kind == "created") {
        return database.oneshot_events.add(change.value)
    }
    if (change.kind == "deleted") {
        if(change.value.id){
            return database.oneshot_events.delete(change.value.id);
        }
        return Promise.resolve();    
    }
    if (change.kind == "updated") {
        if (change.value.id !== undefined) {
            return database.oneshot_events.update(change.value.id, _.omit(change.value, 'id'))
        } 
        return Promise.resolve()
    }
}

export async function AddTodo (text: string) {
    return await database.todos.add({text, done: false})
}

export async function AddRepeatingEvent (name: string, color: string, weekday: number, time_start: number, time_end: number) {
    return database.repeating_events.add({name, color, weekday, time_end, time_start, room: "", teacher: "", type: 'RepeatingEvent'})
}

export async function UpdateRepeatingEvent(id: number, update: Partial<RepeatingEvent>) {
    return database.repeating_events.update(id, update)
}

export async function MarkTodoDone (id: number) {
    return await database.todos.update(id, {done: true})
}

export async function MarkTodoUndone (id: number) {
    return await database.todos.update(id, {done: false})
}

export async function DeleteTodo (id: number) {
    await database.todos.delete(id);
}

export async function DeleteRepeatingEvent (id: number) {
    return database.repeating_events.delete(id)
}

export async function DeleteAllRepeatingEvents () {
    return database.repeating_events.clear()
}

export async function AddNote (title: string, content: string) {
    const now = (new Date()).toUTCString()
    return database.notes.add({title, content, createdAt: now, editedAt: now})
}