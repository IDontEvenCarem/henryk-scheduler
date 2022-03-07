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
    weekday: string,
    time_start: string,
    time_end: string
}

export interface Note {
    id?: number,
    title: string,
    content: string
}

export class TypedDexie extends Dexie {
    todos!: Table<Todo>;
    timetable!: Table<Event>;
    timetable_repeating!: Table<RepeatingEvent>;
    notes!: Table<Note>;

    constructor() {
        super('testdexie')
        this.version(2).stores({
            todos: '++id',
            timetable: '++id, time_start, time_end',
            timetable_repeating: '++id, weekday',
            notes: '++id, title'
        })
    }
}


export const database = new TypedDexie()