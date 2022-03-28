import Dexie from 'dexie'
import type {Table} from 'dexie'

export interface Todo {
    id?: number,
    text: string,
    done: boolean
}

export interface Event {
    id?: number,
    name: string,
    time_start: Date,
    time_end: Date,
    room: string,
    teacher: string,
    color: string
}

export interface RepeatingEvent {
    id?: number,
    name: string,
    room: string,
    teacher: string,
    color: string,
    weekday: number,
    time_start: number,
    time_end: number
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
    timetable!: Table<Event>;
    timetable_repeating!: Table<RepeatingEvent>;
    notes!: Table<Note>;

    constructor() {
        super('testdexie')
        this.version(5).stores({
            todos: '++id',
            timetable: '++id, time_start, time_end',
            timetable_repeating: '++id, weekday',
            notes: '++id, title'
        })
    }
}


export type AnyEvent = Event | RepeatingEvent

export const database = new TypedDexie()

export async function Insert<T>(table: Table<T>, value: T) {
    return table.add(value)
}

export async function AddTodo (text: string) {
    return await database.todos.add({text, done: false})
}

export async function AddRepeatingEvent (name: string, color: string, weekday: number, time_start: number, time_end: number) {
    return database.timetable_repeating.add({name, color, weekday, time_end, time_start, room: "", teacher: ""})
}

export async function UpdateRepeatingEvent(id: number, update: Partial<RepeatingEvent>) {
    return database.timetable_repeating.update(id, update)
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
    return database.timetable_repeating.delete(id)
}

export async function DeleteAllRepeatingEvents () {
    return database.timetable_repeating.clear()
}

export async function AddNote (title: string, content: string) {
    const now = (new Date()).toUTCString()
    return database.notes.add({title, content, createdAt: now, editedAt: now})
}