import Dexie from 'dexie'
import type {Table} from 'dexie'
import type { Change } from './common'
import _ from 'lodash'

export type ThingName = "ScheduleEvent" | "OneshotEvent" | "Todo" | "Note";

export interface ID {
    kind: ThingName,
    id: number
}

export interface Todo {
    id?: number,
    text: string,
    done: boolean,
    parent_id?: number
}

export interface OneshotEvent {
    id?: number,
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

type AnyThing = Note | RepeatingEvent | OneshotEvent | Todo
export type ReplacedID<T> = Omit<T, 'id'> & {id: ID}

export interface Link {
    from: "ScheduleEvent" | "OneshotEvent" | "Todo" | "Note",
    from_id: number,
    to: "ScheduleEvent" | "OneshotEvent" | "Todo" | "Note",
    to_id: number
}

export class TypedDexie extends Dexie {
    todos!: Table<Todo>;
    oneshot_events!: Table<OneshotEvent>;
    repeating_events!: Table<RepeatingEvent>;
    notes!: Table<Note>;
    link!: Table<Link>

    constructor() {
        super('testdexie')
        this.version(18).stores({
            todos: '++id',
            oneshot_events: '++id, date',
            repeating_events: '++id, weekday, repeats_start, repeats_end',
            notes: '++id, title',
            link: '++, [from+from_id], [to+to_id], from_id, to_id'
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

export async function AddTodo (text: string, parent_id: number | undefined = undefined) : Promise<ID> {
    const resp = await database.todos.add({text, done: false, parent_id})
    return {kind: 'Todo', id: parseInt(resp.toString())}
}

export async function AddRepeatingEvent (name: string, color: string, weekday: number, time_start: number, time_end: number) {
    return database.repeating_events.add({name, color, weekday, time_end, time_start, room: "", teacher: ""})
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

export async function ToggleTodo(id: number) {
    const todo = await database.todos.get(id)
    if (todo?.done) {
        MarkTodoUndone(id)
    } else {
        MarkTodoDone(id)
    }
}

/** @deprecated */
export async function DeleteTodo (id: number) {
    await database.todos.delete(id);
}

/** @deprecated */
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

export async function Delete (id: ID) {
    if (id.kind === 'Todo') {
        return database.todos.delete(id.id)
    }
    else if (id.kind === 'Note') {
        return database.notes.delete(id.id)
    }
    else if (id.kind === 'OneshotEvent') {
        return database.oneshot_events.delete(id.id)
    }
    else if (id.kind === 'ScheduleEvent') {
        return database.repeating_events.delete(id.id)
    }
    else {
        throw new Error("Invalid deletion case - impoper kind in id")
    }
}

export async function Get (id: ID) {
    if (id.kind === 'Todo') {
        return database.todos.get(id.id)
    }
    else if (id.kind === 'Note') {
        return database.notes.get(id.id)
    }
    else if (id.kind === 'OneshotEvent') {
        return database.oneshot_events.get(id.id)
    }
    else if (id.kind === 'ScheduleEvent') {
        return database.repeating_events.get(id.id)
    }
    else {
        throw new Error("Invalid get case - impoper kind in id")
    }
}

export async function Link (from: ID, to: ID) {
    return database.link.add({from: from.kind, from_id: from.id, to: to.kind, to_id: to.id})
}

export async function GetWithLinks (id: ID, exclusions: ID[] = []) {
    const direct = await Get(id)
    // links where this is the 'to' side
    const links_incomming = await database.link
        .where('[to+to_id]').equals([id.kind, id.id])
        .filter(link => !exclusions.some(excluded => excluded.kind === link.to && excluded.id === link.to_id))
        .toArray()
    // links where this is the 'from' side
    const links_outgoing = await database.link
        .where('[from+from_id]').equals([id.kind, id.id])
        .filter(link => !exclusions.some(excluded => excluded.kind === link.from && excluded.id === link.from_id))
        .toArray()

        // making this perform bulk ops would probably be better, but harder. maybe have a GetMany function?
    const entities_outgoing : ReplacedID<Todo | RepeatingEvent | Note | OneshotEvent>[] = await Promise.all(
        links_outgoing.map(link => 
            Get({id: link.to_id, kind: link.to})
                .then(value => ({...value, id: {id: link.to_id, kind: link.to}})))
    )
    const entities_incomming : ReplacedID<Todo | RepeatingEvent | Note | OneshotEvent>[] = await Promise.all(
        links_incomming.map(link => 
            Get({id: link.from_id, kind: link.from})
                .then((value) => ({...value, id: {id: link.from_id, kind: link.from}})))
    )

    return {
        value: direct,
        linked: [...entities_incomming, ...entities_outgoing]
    }
}